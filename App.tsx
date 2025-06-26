import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Location from 'expo-location';
import Purchases from 'react-native-purchases';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CookScreen from './src/screens/CookScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import FoodDetailScreen from './src/screens/FoodDetailScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';

// Components
import LoadingScreen from './src/components/LoadingScreen';
import TabBarIcon from './src/components/TabBarIcon';

// Theme
import { theme } from './src/theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Configure RevenueCat
const configureRevenueCat = async () => {
  try {
    await Purchases.configure({
      apiKey: 'sk_nIolQZWYIazYElnPjPaepSUdFfgej', // Replace with your actual API key
    });
  } catch (error) {
    console.error('Error configuring RevenueCat:', error);
  }
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon name={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cook" component={CookScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    configureRevenueCat();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <LocationProvider>
          <SubscriptionProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </SubscriptionProvider>
        </LocationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}