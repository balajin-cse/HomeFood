import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  cookId: string;
  cookName: string;
  specialInstructions?: string;
}

interface Order {
  orderId: string;
  trackingNumber: string;
  cookId: string;
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
  createOrder: (orderData: Omit<Order, 'orderId' | 'trackingNumber' | 'orderDate'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByCook: (cookId: string) => Order[];
  getOrdersByCustomer: (customerName: string) => Order[];
  refreshOrders: () => Promise<void>;
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
      loadOrders();
      setupRealTimeSubscription();
    }

    return () => {
      // Cleanup subscriptions when component unmounts
      supabase.removeAllChannels();
    };
  }, [user]);

  const setupRealTimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: user.isCook ? `cook_id=eq.${user.id}` : `customer_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time order update:', payload);
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealTimeEnabled(true);
          console.log('Real-time orders subscription active');
        }
      });
  };

  const handleRealTimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      loadOrders(); // Reload all orders for new orders
    } else if (payload.eventType === 'UPDATE') {
      // Update specific order
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === payload.new.id
            ? { ...order, status: payload.new.status }
            : order
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.orderId !== payload.old.id)
      );
    }
  };

  const loadOrders = async () => {
    try {
      if (!user) return;

      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          customer:profiles!orders_customer_id_fkey(name),
          cook:profiles!orders_cook_id_fkey(name)
        `);

      // Filter based on user type
      if (user.isCook) {
        query = query.eq('cook_id', user.id);
      } else {
        query = query.eq('customer_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        return;
      }

      if (data) {
        const formattedOrders: Order[] = data.map((orderData: any) => ({
          orderId: orderData.id,
          trackingNumber: orderData.tracking_number,
          cookId: orderData.cook_id,
          items: orderData.order_items.map((item: any) => ({
            id: item.id,
            title: item.food_title,
            price: parseFloat(item.price),
            quantity: item.quantity,
            cookId: orderData.cook_id,
            cookName: orderData.cook?.name || 'Unknown Cook',
            specialInstructions: item.special_instructions,
          })),
          cookName: orderData.cook?.name || 'Unknown Cook',
          customerName: orderData.customer?.name || 'Unknown Customer',
          customerPhone: '+1234567890', // You might want to add this to profiles
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
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    try {
      setRefreshing(true);
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'orderId' | 'trackingNumber' | 'orderDate'>): Promise<string> => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Generate tracking number
      const trackingNumber = `HF${Date.now().toString().slice(-8)}`;

      // Create order in database
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

      if (orderError || !newOrder) {
        throw new Error('Failed to create order');
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: newOrder.id,
        food_id: item.id,
        food_title: item.title,
        price: item.price,
        quantity: item.quantity,
        special_instructions: item.specialInstructions,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error('Failed to create order items');
      }

      await loadOrders(); // Refresh orders
      return newOrder.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          actual_delivery_time: status === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', orderId);

      if (error) {
        throw new Error('Failed to update order status');
      }

      // Update local state immediately for better UX
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const getOrdersByStatus = (status: Order['status']): Order[] => {
    return orders.filter(order => order.status === status);
  };

  const getOrdersByCook = (cookId: string): Order[] => {
    return orders.filter(order => order.cookId === cookId);
  };

  const getOrdersByCustomer = (customerName: string): Order[] => {
    return orders.filter(order => order.customerName === customerName);
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
    }}>
      {children}
    </OrderContext.Provider>
  );
};