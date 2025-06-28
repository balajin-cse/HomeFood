import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

// Mock RevenueCat types for web compatibility
interface PurchasePackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    price: number;
    priceString: string;
    currencyCode: string;
    title: string;
    description: string;
  };
}

interface CustomerInfo {
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  entitlements: {
    active: { [key: string]: any };
    all: { [key: string]: any };
  };
  originalPurchaseDate?: string;
  latestExpirationDate?: string;
}

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
      // Mock packages for demo
      const mockPackages: PurchasePackage[] = [
        {
          identifier: 'daily_plan',
          packageType: 'CUSTOM',
          product: {
            identifier: 'daily_plan',
            price: 4.99,
            priceString: '$4.99',
            currencyCode: 'USD',
            title: 'Daily Explorer',
            description: 'Perfect for trying new dishes daily'
          }
        },
        {
          identifier: 'weekly_plan',
          packageType: 'WEEKLY',
          product: {
            identifier: 'weekly_plan',
            price: 24.99,
            priceString: '$24.99',
            currencyCode: 'USD',
            title: 'Weekly Foodie',
            description: 'Most popular! Weekly access with benefits'
          }
        },
        {
          identifier: 'monthly_plan',
          packageType: 'MONTHLY',
          product: {
            identifier: 'monthly_plan',
            price: 79.99,
            priceString: '$79.99',
            currencyCode: 'USD',
            title: 'Monthly Gourmet',
            description: 'Best value! Monthly access with premium features'
          }
        }
      ];
      
      setPackages(mockPackages);
      
      // Mock customer info (not subscribed initially)
      const mockCustomerInfo: CustomerInfo = {
        activeSubscriptions: [],
        allPurchasedProductIdentifiers: [],
        entitlements: { active: {}, all: {} }
      };
      
      setCustomerInfo(mockCustomerInfo);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchasePackage = async (pkg: PurchasePackage): Promise<boolean> => {
    try {
      // Mock successful purchase
      const newCustomerInfo: CustomerInfo = {
        activeSubscriptions: [pkg.identifier],
        allPurchasedProductIdentifiers: [pkg.identifier],
        entitlements: {
          active: { premium: { isActive: true } },
          all: { premium: { isActive: true } }
        },
        originalPurchaseDate: new Date().toISOString(),
        latestExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setCustomerInfo(newCustomerInfo);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      return isSubscribed;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  };

  const refreshCustomerInfo = async () => {
    try {
      // Mock refresh - keep current state
      return;
    } catch (error) {
      console.error('Failed to refresh customer info:', error);
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