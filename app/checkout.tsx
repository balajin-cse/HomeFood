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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Clock, Check, CreditCard as Edit3 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/contexts/CartContext';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';

interface CartData {
  items: any[];
  deliveryInstructions: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

export default function CheckoutScreen() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { address } = useLocation();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [selectedPayment, setSelectedPayment] = useState('card1');
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState('asap');
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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

  const paymentMethods = [
    { id: 'card1', type: 'Visa', last4: '4242', label: 'Visa ending in 4242' },
    { id: 'card2', type: 'Mastercard', last4: '5555', label: 'Mastercard ending in 5555' },
  ];

  const deliveryTimes = [
    { id: 'asap', label: 'ASAP', time: '30-45 min' },
    { id: 'lunch', label: 'Lunch Time', time: '12:00 PM - 1:00 PM' },
    { id: 'dinner', label: 'Dinner Time', time: '6:00 PM - 7:00 PM' },
  ];

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to place an order.');
      router.push('/auth');
      return;
    }

    if (!cartData || cartData.items.length === 0) {
      Alert.alert('Empty Cart', 'No items in cart to place order.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Simulate order processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate order details
      const orderId = `ORD${Date.now()}`;
      const trackingNumber = `HF${Date.now().toString().slice(-8)}`;
      
      // Get selected address and payment method
      const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
      const selectedPaymentData = paymentMethods.find(payment => payment.id === selectedPayment);
      const selectedTimeData = deliveryTimes.find(time => time.id === selectedDeliveryTime);

      // Create order object for tracking
      const orderData = {
        orderId,
        trackingNumber,
        items: cartData.items,
        cookName: cartData.items[0]?.cookName || 'Unknown Cook',
        totalPrice: cartData.total,
        quantity: cartData.items.reduce((sum, item) => sum + item.quantity, 0),
        deliveryAddress: selectedAddressData?.address || 'Unknown Address',
        paymentMethod: selectedPaymentData?.label || 'Unknown Payment',
        deliveryTime: selectedTimeData?.time || 'ASAP',
        deliveryInstructions: cartData.deliveryInstructions,
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      };

      // Store order in local storage for order history
      try {
        const existingOrders = await import('@react-native-async-storage/async-storage').then(
          module => module.default.getItem('orderHistory')
        );
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.unshift(orderData); // Add to beginning of array
        
        await import('@react-native-async-storage/async-storage').then(
          module => module.default.setItem('orderHistory', JSON.stringify(orders))
        );
      } catch (storageError) {
        console.error('Error saving order to history:', storageError);
      }

      // Clear the cart after successful order
      clearCart();
      
      // Show success message and navigate to tracking
      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order has been confirmed and is being prepared.\n\nOrder ID: ${orderId}\nTracking: ${trackingNumber}\n\nEstimated delivery: ${selectedTimeData?.time || '30-45 min'}`,
        [
          { 
            text: 'Track Order', 
            onPress: () => {
              router.replace({
                pathname: '/order-tracking',
                params: {
                  orderId,
                  trackingNumber,
                  foodTitle: cartData.items[0]?.title || 'Your Order',
                  cookName: cartData.items[0]?.cookName || 'Cook',
                  quantity: cartData.items.reduce((sum, item) => sum + item.quantity, 0).toString(),
                  totalPrice: cartData.total.toString(),
                }
              });
            }
          },
          { 
            text: 'View Orders', 
            onPress: () => router.replace('/(tabs)/orders') 
          }
        ]
      );

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Order Failed',
        'There was an error placing your order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPlacingOrder(false);
    }
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
            <View key={item.id} style={styles.orderItem}>
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
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((payment) => (
            <TouchableOpacity
              key={payment.id}
              style={[
                styles.optionItem,
                selectedPayment === payment.id && styles.optionItemSelected
              ]}
              onPress={() => setSelectedPayment(payment.id)}
            >
              <CreditCard size={20} color={theme.colors.primary} />
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{payment.label}</Text>
              </View>
              {selectedPayment === payment.id && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Payment Method</Text>
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
  addButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
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
});