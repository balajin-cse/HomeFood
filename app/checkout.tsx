import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Clock, Check } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';

export default function CheckoutScreen() {
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [selectedPayment, setSelectedPayment] = useState('card1');
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState('asap');

  const addresses = [
    { id: 'home', label: 'Home', address: '123 Main Street, San Francisco, CA 94102' },
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

  const orderItems = [
    { id: '1', name: 'Homemade Pasta Carbonara', quantity: 2, price: 16.99 },
    { id: '2', name: 'Artisan Avocado Toast', quantity: 1, price: 12.50 },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 3.99;
  const serviceFee = 2.50;
  const total = subtotal + deliveryFee + serviceFee;

  const handlePlaceOrder = () => {
    Alert.alert(
      'Order Placed!',
      'Your order has been placed successfully. You will receive a confirmation shortly.',
      [
        { text: 'Track Order', onPress: () => router.replace('/(tabs)/orders') }
      ]
    );
  };

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
          {orderItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </Card>

        {/* Delivery Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.optionItem,
                selectedAddress === address.id && styles.optionItemSelected
              ]}
              onPress={() => setSelectedAddress(address.id)}
            >
              <MapPin size={20} color={theme.colors.primary} />
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{address.label}</Text>
                <Text style={styles.optionDescription}>{address.address}</Text>
              </View>
              {selectedAddress === address.id && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
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

        {/* Order Total */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service Fee</Text>
            <Text style={styles.totalValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>${total.toFixed(2)}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          title={`Place Order • $${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
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
  section: {
    marginHorizontal: theme.spacing.lg,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
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
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
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