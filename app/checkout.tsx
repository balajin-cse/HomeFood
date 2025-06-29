import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Clock, Check, CreditCard as Edit3, CircleCheck as CheckCircle, Package, Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/contexts/CartContext';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { theme } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CartData {
  items: any[];
  deliveryInstructions: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Success Animation Component
function OrderSuccessAnimation({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);
  const checkAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Start animations sequence
      Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Scale in circle
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Show checkmark
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Complete after 2 seconds
        setTimeout(onComplete, 2000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.successOverlay, { opacity: fadeAnim }]}>
      <View style={styles.successContainer}>
        <Animated.View 
          style={[
            styles.successCircle,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Animated.View style={{ opacity: checkAnim }}>
            <CheckCircle size={64} color="white" />
          </Animated.View>
        </Animated.View>
        
        <Animated.View style={{ opacity: checkAnim }}>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>Your delicious meal is being prepared</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export default function CheckoutScreen() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { address } = useLocation();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const params = useLocalSearchParams();
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [selectedPayment, setSelectedPayment] = useState('card1');
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState('asap');
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'card1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 'card2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ]);

  useEffect(() => {
    // Load cart data from params if available, otherwise use current cart
    if (params.cartData) {
      try {
        const data = JSON.parse(params.cartData as string);
        setCartData(data);
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    } else if (cartItems.length > 0) {
      // Use current cart items
      const deliveryFee = 3.99;
      const serviceFee = 2.50;
      const total = cartTotal + deliveryFee + serviceFee;
      
      setCartData({
        items: cartItems,
        deliveryInstructions: '',
        subtotal: cartTotal,
        deliveryFee,
        serviceFee,
        total,
      });
    }
  }, [params.cartData, cartItems, cartTotal]);

  const addresses = [
    { id: 'home', label: 'Home', address: address || '123 Main Street, San Francisco, CA 94102' },
    { id: 'work', label: 'Work', address: '456 Market Street, San Francisco, CA 94105' },
  ];

  const deliveryTimes = [
    { id: 'asap', label: 'ASAP', time: '30-45 min' },
    { id: 'lunch', label: 'Lunch Time', time: '12:00 PM - 1:00 PM' },
    { id: 'dinner', label: 'Dinner Time', time: '6:00 PM - 7:00 PM' },
  ];

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    if (!cartData || cartData.items.length === 0) {
      Alert.alert('Empty Cart', 'No items in cart to place order.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Get selected address and payment method
      const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
      const selectedPaymentData = paymentMethods.find(payment => payment.id === selectedPayment);
      const selectedTimeData = deliveryTimes.find(time => time.id === selectedDeliveryTime);

      // Group items by cook to create separate orders for each cook
      const ordersByCook = cartData.items.reduce((acc, item) => {
        if (!acc[item.cookId]) {
          acc[item.cookId] = {
            cookId: item.cookId,
            cookName: item.cookName,
            items: [],
            total: 0,
          };
        }
        acc[item.cookId].items.push(item);
        acc[item.cookId].total += item.price * item.quantity;
        return acc;
      }, {} as any);

      // Create orders for each cook using Supabase
      console.log('🛒 Creating orders for', Object.keys(ordersByCook).length, 'cooks');
      const orderPromises = Object.values(ordersByCook).map(async (cookOrder: any) => {
        const orderData = {
          cookId: cookOrder.cookId,
          items: cookOrder.items.map((item: any) => ({
            id: item.id || item.foodId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            cookId: item.cookId,
            cookName: item.cookName,
            specialInstructions: item.specialInstructions,
            image: item.image,
          })),
          cookName: cookOrder.cookName,
          customerName: user.name,
          customerPhone: user.phone || '+1234567890',
          totalPrice: cookOrder.total + (cartData.deliveryFee / Object.keys(ordersByCook).length) + (cartData.serviceFee / Object.keys(ordersByCook).length),
          quantity: cookOrder.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          deliveryAddress: selectedAddressData?.address || 'Unknown Address',
          paymentMethod: selectedPaymentData?.brand ? `${selectedPaymentData.brand} ending in ${selectedPaymentData.last4}` : 'Unknown Payment',
          deliveryTime: selectedTimeData?.time || 'ASAP',
          deliveryInstructions: cartData.deliveryInstructions,
          status: 'confirmed' as const,
        };

        console.log('📦 Creating order for cook:', cookOrder.cookName, 'with', cookOrder.items.length, 'items');
        // Create the order using OrderContext
        return await createOrder(orderData);
      });

      // Wait for all orders to be created
      const createdOrderIds = await Promise.all(orderPromises);
      console.log('✅ Successfully created', createdOrderIds.length, 'orders');

      // Clear cart and show success animation
      clearCart();
      setShowSuccessAnimation(true);

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Order Failed',
        'There was an error placing your order. Please try again.',
        [{ text: 'OK' }]
      );
      setIsPlacingOrder(false);
    }
  };

  const handleSuccessAnimationComplete = () => {
    setShowSuccessAnimation(false);
    setIsPlacingOrder(false);
    
    // Navigate to orders page
    router.replace('/(tabs)/orders');
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatCardNumber = (last4: string) => {
    return `•••• •••• •••• ${last4}`;
  };

  if (!cartData || cartData.items.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Checkout</Text>
          </View>
        </LinearGradient>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No items to checkout</Text>
          <Text style={styles.emptyText}>Add items to your cart first</Text>
          <Button
            title="Go Shopping"
            onPress={() => router.push('/(tabs)')}
            style={styles.goShoppingButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>Review your order details</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Items */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartData.items.map((item) => (
            <View key={item.id || item.foodId} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemCook}>by {item.cookName}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                {item.specialInstructions && (
                  <Text style={styles.itemInstructions}>Note: {item.specialInstructions}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </Card>

        {/* Delivery Address */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push('/delivery-address')}>
              <Edit3 size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {addresses.map((addressOption) => (
            <TouchableOpacity
              key={addressOption.id}
              style={[
                styles.optionItem,
                selectedAddress === addressOption.id && styles.optionItemSelected
              ]}
              onPress={() => setSelectedAddress(addressOption.id)}
            >
              <MapPin size={20} color={theme.colors.primary} />
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{addressOption.label}</Text>
                <Text style={styles.optionDescription}>{addressOption.address}</Text>
              </View>
              {selectedAddress === addressOption.id && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Payment Method */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity onPress={() => router.push('/payment-methods')}>
              <Edit3 size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {paymentMethods.map((payment) => (
            <TouchableOpacity
              key={payment.id}
              style={[
                styles.optionItem,
                selectedPayment === payment.id && styles.optionItemSelected
              ]}
              onPress={() => setSelectedPayment(payment.id)}
            >
              <Text style={styles.cardIcon}>{getCardIcon(payment.brand || '')}</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{payment.brand}</Text>
                <Text style={styles.optionDescription}>
                  {formatCardNumber(payment.last4 || '')}
                </Text>
                {payment.expiryMonth && payment.expiryYear && (
                  <Text style={styles.cardExpiry}>
                    Expires {payment.expiryMonth.toString().padStart(2, '0')}/{payment.expiryYear}
                  </Text>
                )}
              </View>
              {selectedPayment === payment.id && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.addPaymentButton}
            onPress={() => router.push('/payment-methods')}
          >
            <Plus size={20} color={theme.colors.primary} />
            <Text style={styles.addPaymentText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </Card>

        {/* Delivery Time */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          {deliveryTimes.map((time) => (
            <TouchableOpacity
              key={time.id}
              style={[
                styles.optionItem,
                selectedDeliveryTime === time.id && styles.optionItemSelected
              ]}
              onPress={() => setSelectedDeliveryTime(time.id)}
            >
              <Clock size={20} color={theme.colors.primary} />
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{time.label}</Text>
                <Text style={styles.optionDescription}>{time.time}</Text>
              </View>
              {selectedDeliveryTime === time.id && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Delivery Instructions */}
        {cartData.deliveryInstructions && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Instructions</Text>
            <Text style={styles.instructionsText}>{cartData.deliveryInstructions}</Text>
          </Card>
        )}

        {/* Order Total */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${cartData.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>${cartData.deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service Fee</Text>
            <Text style={styles.totalValue}>${cartData.serviceFee.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>${cartData.total.toFixed(2)}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          title={isPlacingOrder ? 'Placing Order...' : `Place Order • $${cartData.total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          size="large"
          style={styles.placeOrderButton}
        />
      </View>

      {/* Success Animation Overlay */}
      <OrderSuccessAnimation 
        visible={showSuccessAnimation} 
        onComplete={handleSuccessAnimationComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xl,
  },
  goShoppingButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    gap: theme.spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  itemCook: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  itemInstructions: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  optionItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceVariant,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardExpiry: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.xs,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  addPaymentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  totalRowFinal: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    marginTop: theme.spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  totalValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  totalValueFinal: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  bottomAction: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  placeOrderButton: {
    marginBottom: 0,
  },
  // Success Animation Styles
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
});