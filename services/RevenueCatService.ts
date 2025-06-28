import { Platform } from 'react-native';

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
  originalPurchaseDate?: string;
  latestExpirationDate?: string;
}

export interface Offering {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasePackage[];
}

export interface Offerings {
  current?: Offering;
  all: { [key: string]: Offering };
}

class RevenueCatService {
  private isConfigured = false;
  private mockSubscriptionActive = false;

  async configure(apiKey: string): Promise<void> {
    // Mock configuration for web/demo
    this.isConfigured = true;
    console.log('RevenueCat configured (mock) with API key:', apiKey);
    return;
  }

  async getOfferings(): Promise<Offerings> {
    // Mock offerings for demo
    return {
      current: {
        identifier: 'default',
        serverDescription: 'Default offering',
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
        ]
      },
      all: {}
    };
  }

  async purchasePackage(packageToPurchase: PurchasePackage): Promise<{ customerInfo: CustomerInfo }> {
    // Mock purchase for demo
    this.mockSubscriptionActive = true;
    return {
      customerInfo: {
        activeSubscriptions: [packageToPurchase.identifier],
        allPurchasedProductIdentifiers: [packageToPurchase.identifier],
        entitlements: {
          active: { premium: { isActive: true } },
          all: { premium: { isActive: true } }
        },
        originalPurchaseDate: new Date().toISOString(),
        latestExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    // Mock customer info for demo
    return {
      activeSubscriptions: this.mockSubscriptionActive ? ['premium'] : [],
      allPurchasedProductIdentifiers: this.mockSubscriptionActive ? ['premium'] : [],
      entitlements: {
        active: this.mockSubscriptionActive ? { premium: { isActive: true } } : {},
        all: this.mockSubscriptionActive ? { premium: { isActive: true } } : {}
      },
      originalPurchaseDate: this.mockSubscriptionActive ? new Date().toISOString() : undefined,
      latestExpirationDate: this.mockSubscriptionActive ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };
  }

  async restorePurchases(): Promise<{ customerInfo: CustomerInfo }> {
    const customerInfo = await this.getCustomerInfo();
    return { customerInfo };
  }

  isSubscriptionActive(customerInfo: CustomerInfo): boolean {
    return Object.keys(customerInfo.entitlements.active).length > 0;
  }

  async setMockSubscription(active: boolean): Promise<void> {
    this.mockSubscriptionActive = active;
  }
}

export const revenueCatService = new RevenueCatService();