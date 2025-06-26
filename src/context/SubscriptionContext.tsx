import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Purchases, { PurchasesOffering, CustomerInfo } from 'react-native-purchases';

interface SubscriptionContextType {
  isSubscribed: boolean;
  offerings: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  loading: boolean;
  purchasePackage: (packageToPurchase: any) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSubscriptions();
  }, []);

  const initializeSubscriptions = async () => {
    try {
      setLoading(true);
      await checkSubscriptionStatus();
      await loadOfferings();
    } catch (error) {
      console.error('Error initializing subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      
      // Check if user has active subscription
      const hasActiveSubscription = Object.keys(info.entitlements.active).length > 0;
      setIsSubscribed(hasActiveSubscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setCustomerInfo(customerInfo);
      
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      setIsSubscribed(hasActiveSubscription);
      
      return hasActiveSubscription;
    } catch (error) {
      console.error('Error purchasing package:', error);
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      
      const hasActiveSubscription = Object.keys(info.entitlements.active).length > 0;
      setIsSubscribed(hasActiveSubscription);
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      offerings,
      customerInfo,
      loading,
      purchasePackage,
      restorePurchases,
      checkSubscriptionStatus,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};