import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

// RevenueCat types
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

interface Offering {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasePackage[];
}

interface SubscriptionContextType {
  isSubscribed: boolean;
  customerInfo: CustomerInfo | null;
  packages: PurchasePackage[];
  currentOffering: Offering | null;
  loading: boolean;
  purchasePackage: (pkg: PurchasePackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
  showPaywall: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// RevenueCat configuration
const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_your_ios_api_key_here',
  android: 'amzn_FHldnKMIGsdYYNIuWtPUmJyFBbv',
  //amazon: 'amzn_FHldnKMIGsdYYNIuWtPUmJyFBbv',
  web: 'rcb_jbHMuJSFiSaqYFfyMAujNWLlorhd', // For testing only
});

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [currentOffering, setCurrentOffering] = useState<Offering | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      if (Platform.OS === 'web') {
        // Mock implementation for web development
        await initializeMockRevenueCat();
      } else {
        // Real RevenueCat implementation for native platforms
        await initializeNativeRevenueCat();
      }
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMockRevenueCat = async () => {
    // Mock packages for web development
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
          description: 'Perfect for trying new dishes daily with same-day delivery and customer support'
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
          description: 'Most popular! Weekly access with priority ordering, meal planning, and free delivery'
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
          description: 'Best value! Monthly access with exclusive chef access, custom requests, and VIP events'
        }
      }
    ];
    
    const mockOffering: Offering = {
      identifier: 'default',
      serverDescription: 'Default offering for HomeFood subscriptions',
      availablePackages: mockPackages
    };
    
    setPackages(mockPackages);
    setCurrentOffering(mockOffering);
    
    // Mock customer info (not subscribed initially)
    const mockCustomerInfo: CustomerInfo = {
      activeSubscriptions: [],
      allPurchasedProductIdentifiers: [],
      entitlements: { active: {}, all: {} }
    };
    
    setCustomerInfo(mockCustomerInfo);
    setIsSubscribed(false);
  };

  const initializeNativeRevenueCat = async () => {
    try {
      // Import RevenueCat only for native platforms
      const Purchases = require('react-native-purchases').default;
      
      // Configure RevenueCat
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY!,
        appUserID: null, // Let RevenueCat generate anonymous user ID
        observerMode: false,
        userDefaultsSuiteName: null,
        useAmazon: Platform.OS === 'android', // Enable Amazon support for Android
      });

      // Set up debug logging (remove in production)
      if (__DEV__) {
        await Purchases.setLogLevel('DEBUG');
      }

      // Get current customer info
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      setIsSubscribed(checkSubscriptionStatus(info));

      // Get available offerings
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
        setPackages(offerings.current.availablePackages);
      }

      // Set up listener for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        setCustomerInfo(info);
        setIsSubscribed(checkSubscriptionStatus(info));
      });

    } catch (error) {
      console.error('Native RevenueCat initialization failed:', error);
      // Fallback to mock for development
      await initializeMockRevenueCat();
    }
  };

  const checkSubscriptionStatus = (info: CustomerInfo): boolean => {
    return Object.keys(info.entitlements.active).length > 0;
  };

  const purchasePackage = async (pkg: PurchasePackage): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Mock successful purchase for web
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
      } else {
        // Real RevenueCat purchase for native platforms
        const Purchases = require('react-native-purchases').default;
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        setCustomerInfo(customerInfo);
        setIsSubscribed(checkSubscriptionStatus(customerInfo));
        return true;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Mock restore for web
        return isSubscribed;
      } else {
        const Purchases = require('react-native-purchases').default;
        const { customerInfo } = await Purchases.restorePurchases();
        setCustomerInfo(customerInfo);
        setIsSubscribed(checkSubscriptionStatus(customerInfo));
        return true;
      }
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  };

  const refreshCustomerInfo = async () => {
    try {
      if (Platform.OS === 'web') {
        // Mock refresh for web
        return;
      } else {
        const Purchases = require('react-native-purchases').default;
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        setIsSubscribed(checkSubscriptionStatus(info));
      }
    } catch (error) {
      console.error('Failed to refresh customer info:', error);
    }
  };

  const showPaywall = () => {
    // This would typically show a paywall modal
    // For now, we'll just navigate to the subscription screen
    console.log('Show paywall - navigate to subscription screen');
  };

  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      customerInfo,
      packages,
      currentOffering,
      loading,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,
      showPaywall,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};