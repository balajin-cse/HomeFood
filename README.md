# HomeFood - RevenueCat Subscription App

A React Native mobile application for ordering homemade food from local home cooks, built with Expo and featuring subscription-based access through RevenueCat.

## 🚀 Features

### For Food Lovers
- **Location-Based Discovery**: Find home cooks within 5-10km radius
- **Meal Categories**: Browse breakfast, lunch, and dinner options
- **Real-Time Search**: Search by dish name, cook name, or cuisine type
- **Subscription Plans**: Daily, weekly, and monthly subscription options via RevenueCat
- **Order Tracking**: Track your orders from preparation to delivery
- **Reviews & Ratings**: Rate cooks and read reviews from other customers

### For Home Cooks
- **Menu Management**: Add, edit, and manage your food offerings
- **Availability Control**: Set quantities and meal times
- **Order Management**: Accept/decline orders and communicate with customers
- **Earnings Tracking**: Monitor your sales and earnings

### RevenueCat Integration
- **Cross-Platform Subscriptions**: iOS App Store, Google Play, Amazon Appstore
- **Multiple Plans**: Daily ($4.99), Weekly ($24.99), Monthly ($79.99)
- **Premium Access**: Only subscribers can place orders
- **Auto-Renewal**: Seamless subscription management
- **Restore Purchases**: Cross-device subscription restoration
- **Real-time Entitlements**: Instant subscription status updates

## 🛠 Technology Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router 4
- **Subscriptions**: RevenueCat SDK
- **UI Components**: Custom components with React Native Paper
- **State Management**: React Context API
- **Location Services**: Expo Location
- **Maps**: React Native Maps with OpenStreetMap
- **Storage**: AsyncStorage
- **Fonts**: Inter via @expo-google-fonts

## 📱 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator
- RevenueCat account

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd homefood-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure RevenueCat:**

   a. Create a RevenueCat account at https://www.revenuecat.com/
   
   b. Create a new app in the RevenueCat dashboard
   
   c. Get your API keys for each platform:
   - iOS: `appl_xxxxxxxxxxxxxxxx`
   - Android: `goog_xxxxxxxxxxxxxxxx`
   - Amazon: `amzn_xxxxxxxxxxxxxxxx`
   
   d. Update the API keys in `contexts/SubscriptionContext.tsx`:
   ```typescript
   const REVENUECAT_API_KEY = Platform.select({
     ios: 'appl_your_ios_api_key_here',
     android: 'goog_your_android_api_key_here',
     web: 'web_your_web_api_key_here', // For testing only
   });
   ```

4. **Set up subscription products in RevenueCat:**
   - Create products with identifiers:
     - `daily_plan` - Daily Explorer ($4.99/day)
     - `weekly_plan` - Weekly Foodie ($24.99/week)
     - `monthly_plan` - Monthly Gourmet ($79.99/month)
   - Create an offering called "default" with these packages

5. **Configure app stores:**
   - **iOS**: Set up products in App Store Connect
   - **Android**: Set up products in Google Play Console
   - **Amazon**: Set up products in Amazon Appstore (if supporting Amazon)

6. **Update app.json with your RevenueCat project ID:**
```json
{
  "plugins": [
    [
      "react-native-purchases",
      {
        "revenuecat_project_id": "your_revenuecat_project_id"
      }
    ]
  ]
}
```

### Development

1. **Start the development server:**
```bash
npm start
```

2. **Run on specific platforms:**
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser (mock RevenueCat)
```

## 🔧 RevenueCat Setup Guide

### 1. Create RevenueCat Account
- Sign up at https://www.revenuecat.com/
- Create a new project
- Note your project ID and API keys

### 2. Configure Products
Create the following products in RevenueCat:

| Product ID | Type | Price | Description |
|------------|------|-------|-------------|
| `daily_plan` | Custom | $4.99 | Daily Explorer Plan |
| `weekly_plan` | Weekly | $24.99 | Weekly Foodie Plan |
| `monthly_plan` | Monthly | $79.99 | Monthly Gourmet Plan |

### 3. Set Up Entitlements
- Create an entitlement called "premium"
- Attach all subscription products to this entitlement
- This controls access to premium features

### 4. Configure Offerings
- Create an offering called "default"
- Add all three subscription packages
- Set the weekly plan as the default/featured option

### 5. Platform-Specific Setup

#### iOS (App Store Connect)
1. Create subscription products with the same IDs
2. Set up subscription groups
3. Configure pricing and availability
4. Submit for review

#### Android (Google Play Console)
1. Create subscription products with the same IDs
2. Set up base plans and offers
3. Configure pricing and availability
4. Publish to production

#### Amazon Appstore (Optional)
1. Create in-app products
2. Configure pricing
3. Submit for approval

## 🏗 Project Structure

```
app/
├── (tabs)/                 # Tab navigation screens
│   ├── index.tsx          # Home/Discovery screen
│   ├── cook.tsx           # Cook management screen
│   ├── orders.tsx         # Order tracking screen
│   └── profile.tsx        # User profile screen
├── auth.tsx               # Authentication screen
├── subscription.tsx       # Subscription/paywall screen
├── food-detail.tsx        # Food item details
├── checkout.tsx           # Order checkout
└── _layout.tsx            # Root layout

components/
├── ui/                    # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── FoodCard.tsx           # Food item card component
├── MapSelector.tsx        # Location selection component
└── PaywallModal.tsx       # Subscription paywall modal

contexts/
├── AuthContext.tsx        # Authentication state
├── LocationContext.tsx    # Location services
└── SubscriptionContext.tsx # RevenueCat integration

constants/
└── theme.ts               # App theme configuration
```

## 💳 Subscription Plans

### Daily Explorer - $4.99/day
- Order from local home cooks
- Fresh homemade meals
- Same-day delivery
- Customer support

### Weekly Foodie - $24.99/week (Most Popular)
- All Daily Explorer features
- Priority ordering
- Meal planning assistance
- 20% discount on bulk orders
- Free delivery
- Exclusive recipes

### Monthly Gourmet - $79.99/month
- All Weekly Foodie features
- Exclusive chef access
- Custom meal requests
- Nutrition consultation
- Premium customer support
- 30% discount on all orders
- VIP events access

## 🔒 Security & Privacy

- **Payment Security**: All payments processed through platform stores (Apple, Google, Amazon)
- **Data Encryption**: User data encrypted in transit and at rest
- **Privacy Compliance**: GDPR and CCPA compliant
- **Secure Authentication**: JWT-based authentication with refresh tokens

## 🚀 Deployment

### Development Build (Expo Dev Client)
```bash
# Install Expo Dev Client
npx expo install expo-dev-client

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
# Build for production
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 📊 Analytics & Monitoring

RevenueCat provides built-in analytics for:
- Subscription conversions
- Churn analysis
- Revenue tracking
- Customer lifetime value
- Trial conversion rates

Access these insights in your RevenueCat dashboard.

## 🐛 Troubleshooting

### Common Issues

1. **RevenueCat not working on web**
   - RevenueCat requires native code and won't work in browser
   - Use Expo Dev Client for testing subscriptions
   - Web version uses mock implementation for development

2. **Subscription not activating**
   - Check API keys are correct
   - Verify product IDs match between app and stores
   - Ensure entitlements are properly configured

3. **Build errors with RevenueCat**
   - Make sure you're using Expo Dev Client (not Expo Go)
   - RevenueCat requires custom native code

### Getting Help

- **RevenueCat Docs**: https://docs.revenuecat.com/
- **Expo Docs**: https://docs.expo.dev/
- **Support**: Create an issue in this repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@homefood.app
- RevenueCat Support: https://support.revenuecat.com/
- Expo Support: https://expo.dev/support