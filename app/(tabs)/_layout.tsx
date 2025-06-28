import { Tabs } from 'expo-router';
import { Chrome as Home, ChefHat, ShoppingBag, User, ShoppingCart, Package, Truck } from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

// Safe function to check if Supabase channels need cleanup
const safeCleanupChannels = () => {
  try {
    // This prevents the "removeAllChannels is not a function" error
    if (typeof window !== 'undefined' && window.frameElement) {
      // Running in iframe, don't cleanup to avoid errors
      return;
    }
  } catch (e) {
    console.log('Safe cleanup check error:', e);
  }
};

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const { cartCount } = useCart();
  
  return (
    <View style={styles.cartIconContainer}>
      <ShoppingCart color={color} size={size} />
      {cartCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>
            {cartCount > 99 ? '99+' : cartCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  
  // Call safe cleanup function on mount
  useEffect(() => {
    safeCleanupChannels();
  }, []);

  if (user?.isCook) {
    // Cook interface
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
            shadowColor: theme.colors.shadow.medium,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-Medium',
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Kitchen',
            tabBarIcon: ({ color, size }) => (
              <ChefHat color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => (
              <Package color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="delivery"
          options={{
            title: 'Delivery',
            tabBarIcon: ({ color, size }) => (
              <Truck color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        />
        {/* Hide customer-only tabs for cooks */}
        <Tabs.Screen
          name="cook"
          options={{
            href: null, // Hide this tab
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            href: null, // Hide this tab
          }}
        />
      </Tabs>
    );
  }

  // Customer interface (existing)
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: theme.colors.shadow.medium,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cook"
        options={{
          title: 'Cook',
          tabBarIcon: ({ color, size }) => (
            <ChefHat color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <CartTabIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
      {/* Hide cook-only tabs for customers */}
      <Tabs.Screen
        name="delivery"
        options={{
          href: null, // Hide this tab
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
});