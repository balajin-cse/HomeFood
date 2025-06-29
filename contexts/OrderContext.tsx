import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  cookId: string;
  cookName: string;
  specialInstructions?: string;
  image?: string;
}

interface Order {
  orderId: string;
  trackingNumber: string;
  cookId: string;
  customerId: string;
  items: OrderItem[];
  cookName: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  quantity: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  deliveryInstructions?: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshing: boolean;
  realTimeEnabled: boolean;
  createOrder: (orderData: Omit<Order, 'orderId' | 'trackingNumber' | 'orderDate' | 'customerId'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByCook: (cookId: string) => Order[];
  getOrdersByCustomer: (customerId: string) => Order[];
  refreshOrders: () => Promise<void>;
  getCookActiveOrders: (cookId: string) => Order[];
  getCustomerActiveOrders: (customerId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('👤 User logged in, initializing orders for:', user.email, 'isCook:', user.isCook);
      loadOrders();
      setupRealTimeSubscription();
    } else {
      console.log('👤 No user, clearing orders');
      setOrders([]);
      setLoading(false);
    }

    return () => {
      // Cleanup subscriptions when component unmounts
      try {
        if (typeof supabase.removeAllChannels === 'function') {
          supabase.removeAllChannels();
        }
      } catch (error) {
        console.error('Error cleaning up Supabase channels:', error);
      }
    };
  }, [user]);

  const setupRealTimeSubscription = () => {
    if (!user) return;

    try {
      console.log('🔄 Setting up real-time subscription for user:', user.email);
      
      // Subscribe to all order changes for this user (either as customer or cook)
      const channel = supabase
        .channel('orders_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            console.log('📡 Real-time order update received:', payload.eventType, payload.new || payload.old);
            handleRealTimeUpdate(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealTimeEnabled(true);
            console.log('✅ Real-time orders subscription active');
          } else {
            console.log('❌ Real-time subscription status:', status);
          }
        });
    } catch (error) {
      console.error('❌ Error setting up real-time subscription:', error);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    if (!user) return;

    const orderData = payload.new || payload.old;
    
    // Check if this order is relevant to the current user
    const isRelevant = orderData.customer_id === user.id || orderData.cook_id === user.id;
    
    if (!isRelevant) {
      console.log('⚠️ Order update not relevant for current user, ignoring');
      return;
    }

    console.log('🔄 Processing relevant order update:', payload.eventType, orderData.id);

    if (payload.eventType === 'INSERT') {
      console.log('➕ New order received, refreshing orders');
      loadOrders(); // Reload all orders for new orders to get complete data
    } else if (payload.eventType === 'UPDATE') {
      console.log('📝 Order status updated:', orderData.status);
      // Update specific order status immediately for better UX
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderData.id
            ? { ...order, status: orderData.status }
            : order
        )
      );
    } else if (payload.eventType === 'DELETE') {
      console.log('🗑️ Order deleted');
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.orderId !== orderData.id)
      );
    }
  };

  const loadOrders = async () => {
    try {
      if (!user) {
        console.log('❌ No user available for loading orders');
        return;
      }

      console.log('📡 Loading orders for user:', user.email, 'isCook:', user.isCook);
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          customer:profiles!orders_customer_id_fkey(name, phone),
          cook:profiles!orders_cook_id_fkey(name, phone)
        `);

      // Load orders based on user role
      if (user.isCook) {
        console.log('👨‍🍳 Loading orders for cook:', user.id);
        query = query.eq('cook_id', user.id);
      } else {
        console.log('🛒 Loading orders for customer:', user.id);
        query = query.eq('customer_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading orders from Supabase:', error);
        // Fall back to AsyncStorage if Supabase fails
        await loadOrdersFromStorage();
        return;
      }

      if (data) {
        console.log(`✅ Loaded ${data.length} orders from Supabase`);
        const formattedOrders: Order[] = data.map((orderData: any) => ({
          orderId: orderData.id,
          trackingNumber: orderData.tracking_number,
          cookId: orderData.cook_id,
          customerId: orderData.customer_id,
          items: orderData.order_items.map((item: any) => ({
            id: item.id,
            title: item.food_title,
            price: parseFloat(item.price),
            quantity: item.quantity,
            cookId: orderData.cook_id,
            cookName: orderData.cook?.name || 'Unknown Cook',
            specialInstructions: item.special_instructions,
            image: item.food_image,
          })),
          cookName: orderData.cook?.name || 'Unknown Cook',
          customerName: orderData.customer?.name || 'Unknown Customer',
          customerPhone: orderData.customer?.phone || '+1234567890',
          totalPrice: parseFloat(orderData.total_amount),
          quantity: orderData.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          status: orderData.status,
          orderDate: orderData.created_at,
          deliveryTime: orderData.estimated_delivery_time || 'ASAP',
          deliveryAddress: orderData.delivery_address,
          paymentMethod: 'Card', // You might want to add this to orders table
          deliveryInstructions: orderData.delivery_instructions,
        }));

        setOrders(formattedOrders);
        // Also save to AsyncStorage as backup
        await AsyncStorage.setItem('orderHistory', JSON.stringify(formattedOrders));
        
        // Log order statistics
        if (user.isCook) {
          const activeOrders = formattedOrders.filter(order => 
            ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
          );
          console.log(`📊 Cook has ${activeOrders.length} active orders out of ${formattedOrders.length} total`);
        } else {
          console.log(`📊 Customer has ${formattedOrders.length} orders`);
        }
      }
    } catch (error) {
      console.error('❌ Exception loading orders:', error);
      // Fall back to AsyncStorage
      await loadOrdersFromStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersFromStorage = async () => {
    try {
      console.log('💾 Loading orders from AsyncStorage as fallback');
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        // Filter orders based on user type
        let filteredOrders = allOrders;
        if (user?.isCook) {
          filteredOrders = allOrders.filter((order: Order) => 
            order.cookId === user.id
          );
        } else if (user) {
          filteredOrders = allOrders.filter((order: Order) => 
            order.customerId === user.id
          );
        }
        console.log(`📊 Loaded ${filteredOrders.length} orders from storage`);
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('❌ Error loading orders from storage:', error);
    }
  };

  const refreshOrders = async () => {
    try {
      console.log('🔄 Manually refreshing orders');
      setRefreshing(true);
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'orderId' | 'trackingNumber' | 'orderDate' | 'customerId'>): Promise<string> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🛒 Creating new order for customer:', user.name, 'to cook:', orderData.cookName);

      // Generate tracking number
      const trackingNumber = `HF${Date.now().toString().slice(-8)}`;

      // First, try to create in Supabase
      try {
        console.log('📡 Creating order in Supabase');
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            tracking_number: trackingNumber,
            customer_id: user.id,
            cook_id: orderData.cookId,
            total_amount: orderData.totalPrice,
            delivery_address: orderData.deliveryAddress,
            delivery_instructions: orderData.deliveryInstructions,
            estimated_delivery_time: orderData.deliveryTime,
            status: 'confirmed',
          })
          .select()
          .single();

        if (orderError) {
          console.error('❌ Supabase order creation error:', orderError);
          throw orderError;
        }

        if (!newOrder) {
          throw new Error('No order returned from Supabase');
        }

        console.log('✅ Order created in Supabase with ID:', newOrder.id);

        // Create order items in Supabase
        const orderItems = orderData.items.map(item => ({
          order_id: newOrder.id,
          food_id: item.id,
          food_title: item.title,
          food_description: '', // Add if available
          food_image: item.image || null,
          price: item.price,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        }));

        console.log(`📝 Creating ${orderItems.length} order items`);
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('❌ Supabase order items creation error:', itemsError);
          // Try to delete the order if items failed
          await supabase.from('orders').delete().eq('id', newOrder.id);
          throw itemsError;
        }

        console.log('✅ Order items created successfully');
        console.log('🔔 Order should now appear in cook\'s delivery page via real-time subscription');
        
        // Refresh orders to get the complete order data
        await loadOrders();
        
        return newOrder.id;

      } catch (supabaseError) {
        console.error('❌ Supabase order creation failed, falling back to AsyncStorage:', supabaseError);
        
        // Fallback to AsyncStorage
        const orderId = `local-${Date.now()}`;
        const newOrder: Order = {
          ...orderData,
          orderId,
          trackingNumber,
          customerId: user.id,
          orderDate: new Date().toISOString(),
        };

        console.log('💾 Saving order to AsyncStorage');
        // Save to AsyncStorage
        const storedOrders = await AsyncStorage.getItem('orderHistory');
        const allOrders = storedOrders ? JSON.parse(storedOrders) : [];
        allOrders.push(newOrder);
        await AsyncStorage.setItem('orderHistory', JSON.stringify(allOrders));
        
        // Update local state
        setOrders(prev => [newOrder, ...prev]);
        
        console.log('✅ Order saved to AsyncStorage with ID:', orderId);
        return orderId;
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      console.log('📝 Updating order status:', orderId, 'to', status);
      
      // First try Supabase
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          actual_delivery_time: status === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Supabase status update error:', error);
        // Fall back to AsyncStorage
        const storedOrders = await AsyncStorage.getItem('orderHistory');
        if (storedOrders) {
          const allOrders = JSON.parse(storedOrders);
          const updatedOrders = allOrders.map((order: Order) =>
            order.orderId === orderId ? { ...order, status } : order
          );
          await AsyncStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
          console.log('💾 Order status updated in AsyncStorage');
        }
      } else {
        console.log('✅ Order status updated in Supabase');
      }

      // Update local state immediately for better UX
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status } : order
        )
      );

      console.log('🔔 Status update should propagate via real-time subscription');
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  };

  const getOrdersByStatus = (status: Order['status']): Order[] => {
    return orders.filter(order => order.status === status);
  };

  const getOrdersByCook = (cookId: string): Order[] => {
    return orders.filter(order => order.cookId === cookId);
  };

  const getOrdersByCustomer = (customerId: string): Order[] => {
    return orders.filter(order => order.customerId === customerId);
  };

  const getCookActiveOrders = (cookId: string): Order[] => {
    return orders.filter(order => 
      order.cookId === cookId && 
      ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
    );
  };

  const getCustomerActiveOrders = (customerId: string): Order[] => {
    return orders.filter(order => 
      order.customerId === customerId && 
      ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
    );
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      refreshing,
      realTimeEnabled,
      createOrder,
      updateOrderStatus,
      getOrdersByStatus,
      getOrdersByCook,
      getOrdersByCustomer,
      refreshOrders,
      getCookActiveOrders,
      getCustomerActiveOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );
};