# HomeFood Mobile App

A React Native mobile application for ordering homemade food from local home cooks, built with Expo and featuring subscription-based access through RevenueCat.

## Features

### For Food Lovers
- **Location-Based Discovery**: Find home cooks within 5-10km radius
- **Meal Categories**: Browse breakfast, lunch, and dinner options
- **Real-Time Search**: Search by dish name, cook name, or cuisine type
- **Subscription Plans**: Daily, weekly, and monthly subscription options
- **Order Tracking**: Track your orders from preparation to delivery
- **Reviews & Ratings**: Rate cooks and read reviews from other customers

### For Home Cooks
- **Menu Management**: Add, edit, and manage your food offerings
- **Availability Control**: Set quantities and meal times
- **Order Management**: Accept/decline orders and communicate with customers
- **Earnings Tracking**: Monitor your sales and earnings

### Subscription Features (RevenueCat Integration)
- **Multiple Plans**: Daily ($4.99), Weekly ($24.99), Monthly ($79.99)
- **Premium Access**: Only subscribers can place orders
- **Auto-Renewal**: Seamless subscription management
- **Restore Purchases**: Cross-device subscription restoration

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **UI Components**: React Native Paper
- **State Management**: React Context API
- **Subscriptions**: RevenueCat SDK
- **Location Services**: Expo Location
- **Notifications**: Expo Notifications
- **Maps**: React Native Maps
- **Storage**: AsyncStorage

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator
- RevenueCat account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd homefood-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure RevenueCat:
   - Create a RevenueCat account at https://www.revenuecat.com/
   - Create a new app in the RevenueCat dashboard
   - Copy your API key and replace `your_revenuecat_api_key_here` in:
     - `App.tsx` (configureRevenueCat function)
     - `app.json` (plugins section)

4. Set up subscription products:
   - In RevenueCat dashboard, create products for:
     - Daily Plan: `daily_plan`
     - Weekly Plan: `weekly_plan`
     - Monthly Plan: `monthly_plan`
   - Configure these in your App Store Connect/Google Play Console

5. Start the development server:
```bash
npm start
```

## App Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── screens/            # App screens/pages
├── theme/              # Theme configuration
└── types/              # TypeScript type definitions
```

## Key Components

### Authentication System
- Email/password authentication
- User registration with cook/customer roles
- Profile management

### Location Services
- Automatic location detection
- Address geocoding
- Distance calculation for nearby cooks

### Subscription Management
- RevenueCat integration
- Multiple subscription tiers
- Paywall implementation
- Purchase restoration

### Order Management
- Real-time order tracking
- Cook-customer communication
- Order history and receipts

## Subscription Plans

### Daily Plan - $4.99/day
- Order from local home cooks
- Fresh homemade meals
- Same-day delivery
- Customer support

### Weekly Plan - $24.99/week (Most Popular)
- All Daily Plan features
- Priority ordering
- Meal planning assistance
- 20% discount on bulk orders
- Free delivery

### Monthly Plan - $79.99/month
- All Weekly Plan features
- Exclusive chef access
- Custom meal requests
- Nutrition consultation
- Premium customer support
- 30% discount on all orders

## Development Guidelines

### Adding New Features
1. Create feature branch from main
2. Implement feature with proper TypeScript types
3. Add error handling and loading states
4. Test on both iOS and Android
5. Update documentation

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Implement proper error boundaries
- Use React Native Paper components for consistency

## Deployment

### iOS Deployment
1. Configure app signing in Xcode
2. Update bundle identifier in app.json
3. Build and submit to App Store Connect
4. Configure RevenueCat iOS products

### Android Deployment
1. Generate signed APK/AAB
2. Update package name in app.json
3. Upload to Google Play Console
4. Configure RevenueCat Android products

## Environment Variables

Create a `.env` file with:
```
REVENUECAT_API_KEY=your_api_key_here
GOOGLE_MAPS_API_KEY=your_maps_key_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@homefood.app
- Documentation: https://docs.homefood.app
- RevenueCat Docs: https://docs.revenuecat.com/