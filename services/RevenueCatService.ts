import { Platform } from 'react-native';

// Import RevenueCat for native platforms
let Purchases: any = null;
if (Platform.OS !== 'web') {
  try {
    Purchases = require('react-native-purchases').default;
  } catch (error) {
    console.warn('RevenueCat not available:', error);
  }
}

export interface PurchasePackage {
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

export interface CustomerInfo {
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  entitlements: {
    active: { [key: string]: any };
    all: { [key: string]: any };
  };
}

class RevenueCatService {
  private isConfigured = false;
  private mockSubscriptionActive = false;

  async configure(apiKey: string): Promise<void> {
    if (Platform.OS === 'web' || !Purchases) {
      // Mock configuration for web or when RevenueCat is not available
      this.isConfigured = true;
      console.log('RevenueCat configured (mock) with API key:', apiKey);
      return;
    }

    try {
      // Configure RevenueCat for native platforms
      await Purchases.configure({ apiKey });
      this.isConfigured = true;
      console.log('RevenueCat configured successfully');
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      this.isConfigured = false;
    }
  }

  async getOfferings(): Promise<{ current?: { availablePackages: PurchasePackage[] } }> {
    if (Platform.OS === 'web' || !Purchases || !this.isConfigured) {
      // Mock offerings for web or when RevenueCat is not available
      return {
        current: {
          availablePackages: [
            {
              identifier: 'daily_plan',
              packageType: 'CUSTOM',
              product: {
                identifier: 'daily_plan',
                price: 4.99,
                priceString: '$4.99',
                currencyCode: 'USD',
                title: 'Daily Explorer',
                description: 'Daily access to homemade meals with same-day delivery and customer support'
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
                description: 'Weekly access with priority ordering, meal planning, and free delivery'
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
                description: 'Monthly access with exclusive chef access, custom requests, and VIP events'
              }
            }
          ]
        }
      };
    }

    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return { current: { availablePackages: [] } };
    }
  }

  async purchasePackage(packageToPurchase: PurchasePackage): Promise<{ customerInfo: CustomerInfo }> {
    if (Platform.OS === 'web' || !Purchases || !this.isConfigured) {
      // Mock purchase for web
      this.mockSubscriptionActive = true;
      return {
        customerInfo: {
          activeSubscriptions: [packageToPurchase.identifier],
          allPurchasedProductIdentifiers: [packageToPurchase.identifier],
          entitlements: {
            active: { premium: { isActive: true } },
            all: { premium: { isActive: true } }
          }
        }
      };
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { customerInfo };
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (Platform.OS === 'web' || !Purchases || !this.isConfigured) {
      // Mock customer info for web
      return {
        activeSubscriptions: this.mockSubscriptionActive ? ['premium'] : [],
        allPurchasedProductIdentifiers: this.mockSubscriptionActive ? ['premium'] : [],
        entitlements: {
          active: this.mockSubscriptionActive ? { premium: { isActive: true } } : {},
          all: this.mockSubscriptionActive ? { premium: { isActive: true } } : {}
        }
      };
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return {
        activeSubscriptions: [],
        allPurchasedProductIdentifiers: [],
        entitlements: { active: {}, all: {} }
      };
    }
  }

  async restorePurchases(): Promise<{ customerInfo: CustomerInfo }> {
    if (Platform.OS === 'web' || !Purchases || !this.isConfigured) {
      const customerInfo = await this.getCustomerInfo();
      return { customerInfo };
    }

    try {
      const { customerInfo } = await Purchases.restorePurchases();
      return { customerInfo };
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  isSubscriptionActive(customerInfo: CustomerInfo): boolean {
    return Object.keys(customerInfo.entitlements.active).length > 0;
  }
}

export const revenueCatService = new RevenueCatService();