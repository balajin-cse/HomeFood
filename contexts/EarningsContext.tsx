import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CookEarnings {
  cookId: string;
  cookName: string;
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  lastUpdated: string;
  earningsHistory: EarningsRecord[];
}

interface EarningsRecord {
  date: string;
  amount: number;
  orderId: string;
  orderTotal: number;
  platformFee: number;
}

interface EarningsContextType {
  earnings: CookEarnings | null;
  loading: boolean;
  updateEarnings: (orderId: string, orderTotal: number) => Promise<void>;
  getEarningsForPeriod: (period: 'today' | 'week' | 'month') => number;
  getEarningsHistory: () => EarningsRecord[];
  refreshEarnings: () => Promise<void>;
}

const EarningsContext = createContext<EarningsContextType | undefined>(undefined);

export const useEarnings = () => {
  const context = useContext(EarningsContext);
  if (!context) {
    throw new Error('useEarnings must be used within an EarningsProvider');
  }
  return context;
};

export const EarningsProvider: React.FC<{ children: ReactNode; cookId?: string; cookName?: string }> = ({ 
  children, 
  cookId, 
  cookName 
}) => {
  const [earnings, setEarnings] = useState<CookEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cookId && cookName) {
      loadEarnings();
    }
  }, [cookId, cookName]);

  const loadEarnings = async () => {
    if (!cookId || !cookName) return;
    
    try {
      setLoading(true);
      const storedEarnings = await AsyncStorage.getItem('cookEarnings');
      const allEarnings = storedEarnings ? JSON.parse(storedEarnings) : {};
      
      const cookEarnings = allEarnings[cookId] || {
        cookId,
        cookName,
        totalEarnings: 0,
        todayEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        totalOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        lastUpdated: new Date().toDateString(),
        earningsHistory: [],
      };

      // Calculate period earnings
      const today = new Date();
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      cookEarnings.todayEarnings = cookEarnings.earningsHistory
        .filter((record: EarningsRecord) => new Date(record.date).toDateString() === today.toDateString())
        .reduce((sum: number, record: EarningsRecord) => sum + record.amount, 0);

      cookEarnings.weeklyEarnings = cookEarnings.earningsHistory
        .filter((record: EarningsRecord) => new Date(record.date) >= weekStart)
        .reduce((sum: number, record: EarningsRecord) => sum + record.amount, 0);

      cookEarnings.monthlyEarnings = cookEarnings.earningsHistory
        .filter((record: EarningsRecord) => new Date(record.date) >= monthStart)
        .reduce((sum: number, record: EarningsRecord) => sum + record.amount, 0);

      setEarnings(cookEarnings);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEarnings = async (orderId: string, orderTotal: number) => {
    if (!cookId || !cookName) return;

    try {
      const storedEarnings = await AsyncStorage.getItem('cookEarnings');
      const allEarnings = storedEarnings ? JSON.parse(storedEarnings) : {};
      
      const cookEarnings = allEarnings[cookId] || {
        cookId,
        cookName,
        totalEarnings: 0,
        todayEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        totalOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        lastUpdated: new Date().toDateString(),
        earningsHistory: [],
      };

      // Calculate cook's share (85% of order total, platform takes 15%)
      const platformFeeRate = 0.15;
      const cookShare = orderTotal * (1 - platformFeeRate);
      const platformFee = orderTotal * platformFeeRate;

      // Create earnings record
      const earningsRecord: EarningsRecord = {
        date: new Date().toISOString(),
        amount: cookShare,
        orderId,
        orderTotal,
        platformFee,
      };

      // Update earnings
      cookEarnings.totalEarnings += cookShare;
      cookEarnings.totalOrders += 1;
      cookEarnings.earningsHistory.push(earningsRecord);
      cookEarnings.averageOrderValue = cookEarnings.totalEarnings / cookEarnings.totalOrders;
      cookEarnings.lastUpdated = new Date().toDateString();

      // Save updated earnings
      allEarnings[cookId] = cookEarnings;
      await AsyncStorage.setItem('cookEarnings', JSON.stringify(allEarnings));

      // Update local state
      setEarnings(cookEarnings);
    } catch (error) {
      console.error('Error updating earnings:', error);
    }
  };

  const getEarningsForPeriod = (period: 'today' | 'week' | 'month'): number => {
    if (!earnings) return 0;
    
    switch (period) {
      case 'today':
        return earnings.todayEarnings;
      case 'week':
        return earnings.weeklyEarnings;
      case 'month':
        return earnings.monthlyEarnings;
      default:
        return 0;
    }
  };

  const getEarningsHistory = (): EarningsRecord[] => {
    return earnings?.earningsHistory || [];
  };

  const refreshEarnings = async () => {
    await loadEarnings();
  };

  return (
    <EarningsContext.Provider value={{
      earnings,
      loading,
      updateEarnings,
      getEarningsForPeriod,
      getEarningsHistory,
      refreshEarnings,
    }}>
      {children}
    </EarningsContext.Provider>
  );
};