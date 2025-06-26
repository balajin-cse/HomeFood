import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, Card, RadioButton, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';
import { theme } from '../theme/theme';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { foodItem, quantity, totalPrice } = route.params as any;
  const { address } = useLocation();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState(address || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const deliveryFee = 2.99;
  const finalTotal = totalPrice + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. The cook will confirm it shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Orders' as never);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <Card style={styles.orderSummaryCard}>
        <Text style={styles.cardTitle}>Order Summary</Text>
        <View style={styles.orderItem}>
          <Text style={styles.itemName}>{foodItem.title}</Text>
          <Text style={styles.itemDetails}>
            by {foodItem.cookName} • Quantity: {quantity}
          </Text>
          <Text style={styles.itemPrice}>${totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Delivery Fee</Text>
          <Text style={styles.feeValue}>${deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </Card>

      <Card style={styles.deliveryCard}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <TextInput
          label="Address"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.addressInput}
        />
      </Card>

      <Card style={styles.paymentCard}>
        <Text style={styles.cardTitle}>Payment Method</Text>
        <RadioButton.Group
          onValueChange={setPaymentMethod}
          value={paymentMethod}
        >
          <View style={styles.paymentOption}>
            <RadioButton value="card" color={theme.colors.primary} />
            <Text style={styles.paymentLabel}>💳 Credit/Debit Card</Text>
          </View>
          <View style={styles.paymentOption}>
            <RadioButton value="cash" color={theme.colors.primary} />
            <Text style={styles.paymentLabel}>💵 Cash on Delivery</Text>
          </View>
          <View style={styles.paymentOption}>
            <RadioButton value="digital" color={theme.colors.primary} />
            <Text style={styles.paymentLabel}>📱 Digital Wallet</Text>
          </View>
        </RadioButton.Group>
      </Card>

      <Card style={styles.instructionsCard}>
        <Text style={styles.cardTitle}>Special Instructions</Text>
        <TextInput
          label="Any special requests or instructions?"
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="e.g., Extra spicy, No onions, Ring doorbell twice..."
          style={styles.instructionsInput}
        />
      </Card>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading}
          style={styles.placeOrderButton}
          contentStyle={styles.placeOrderButtonContent}
        >
          {loading ? 'Placing Order...' : `Place Order - $${finalTotal.toFixed(2)}`}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  orderSummaryCard: {
    margin: 20,
    padding: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    marginBottom: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  feeLabel: {
    fontSize: 16,
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  deliveryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    elevation: 2,
  },
  addressInput: {
    marginTop: 10,
  },
  paymentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    elevation: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  instructionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    elevation: 2,
  },
  instructionsInput: {
    marginTop: 10,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  placeOrderButton: {
    paddingVertical: 8,
  },
  placeOrderButtonContent: {
    paddingVertical: 8,
  },
});

export default CheckoutScreen;