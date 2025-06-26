import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { revenueCatService, CustomerInfo, PurchasePackage } from '@/services/RevenueCatService';
import { Platform } from 'react-native';

interface SubscriptionContextType {
  isSubscribed: boolean;
  customerInfo: CustomerInfo | null;
  packages: PurchasePackage[];
  loading: boolean;
  purchasePackage: (pkg: PurchasePackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
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
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      // Configure RevenueCat with your API key
      // For production, replace with your actual RevenueCat API key
      const apiKey = Platform.select({
        ios: 'appl_your_ios_api_key_here',
       android: 'goog_IJZwrnhYgSIUIMKPMzcIlTHllPH',
        amazon: 'amzn_FHldnKMIGsdYYNIuWtPUmJyFBbv',
        default: 'web_mock_key'
      });
      
      await revenueCatService.configure(apiKey);
      
      // Load offerings and customer info
      await Promise.all([
        loadOfferings(),
        refreshCustomerInfo()
      ]);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await revenueCatService.getOfferings();
      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  };

  const refreshCustomerInfo = async () => {
    try {
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      setIsSubscribed(revenueCatService.isSubscriptionActive(info));
    } catch (error) {
      console.error('Failed to get customer info:', error);
    }
  };

  const purchasePackage = async (pkg: PurchasePackage): Promise<boolean> => {
    try {
      const { customerInfo: newCustomerInfo } = await revenueCatService.purchasePackage(pkg);
      setCustomerInfo(newCustomerInfo);
      setIsSubscribed(revenueCatService.isSubscriptionActive(newCustomerInfo));
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const { customerInfo: newCustomerInfo } = await revenueCatService.restorePurchases();
      setCustomerInfo(newCustomerInfo);
      setIsSubscribed(revenueCatService.isSubscriptionActive(newCustomerInfo));
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      customerInfo,
      packages,
      loading,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};