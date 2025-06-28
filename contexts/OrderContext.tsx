import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  items: OrderItem[];
  cookId: string;
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

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrders = async (updatedOrders: Order[]) => {
    try {
      await AsyncStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'orderId' | 'trackingNumber' | 'orderDate'>): Promise<string> => {
    const orderId = `ORD${Date.now()}`;
    const trackingNumber = `HF${Date.now().toString().slice(-8)}`;
    
    const newOrder: Order = {
      ...orderData,
      orderId,
      trackingNumber,
      orderDate: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    await saveOrders(updatedOrders);

    // Update cook earnings
    await updateCookEarnings(orderData.cookId, orderData.cookName, orderData.totalPrice);

    // Send notification to cook
    await sendCookNotification(newOrder);

    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.orderId === orderId ? { ...order, status } : order
    );
    await saveOrders(updatedOrders);
  };

  const updateCookEarnings = async (cookId: string, cookName: string, orderTotal: number) => {
    try {
      const existingEarnings = await AsyncStorage.getItem('cookEarnings');
      const earnings = existingEarnings ? JSON.parse(existingEarnings) : {};
      
      const today = new Date().toDateString();
      const cookEarnings = earnings[cookId] || {
        cookId,
        cookName,
        totalEarnings: 0,
        todayEarnings: 0,
        totalOrders: 0,
        completedOrders: 0,
        lastUpdated: today,
      };

      // Reset today's earnings if it's a new day
      if (cookEarnings.lastUpdated !== today) {
        cookEarnings.todayEarnings = 0;
        cookEarnings.lastUpdated = today;
      }

      // Update earnings (cook gets 85% of order total, platform takes 15%)
      const cookShare = orderTotal * 0.85;
      cookEarnings.totalEarnings += cookShare;
      cookEarnings.todayEarnings += cookShare;
      cookEarnings.totalOrders += 1;

      earnings[cookId] = cookEarnings;
      await AsyncStorage.setItem('cookEarnings', JSON.stringify(earnings));
    } catch (error) {
      console.error('Error updating cook earnings:', error);
    }
  };

  const sendCookNotification = async (order: Order) => {
    try {
      const existingNotifications = await AsyncStorage.getItem('cookNotifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        cookId: order.cookId,
        cookName: order.cookName,
        type: 'new_order',
        orderId: order.orderId,
        customerName: order.customerName,
        message: `New order received from ${order.customerName}! Order #${order.trackingNumber} for $${order.totalPrice.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      
      notifications.unshift(notification);
      await AsyncStorage.setItem('cookNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error sending cook notification:', error);
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

  const refreshOrders = async () => {
    await loadOrders();
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
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