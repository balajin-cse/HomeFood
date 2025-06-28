import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, CreditCard as Edit3 } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { theme } from '@/constants/theme';

export default function CartScreen() {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { address } = useLocation();
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const deliveryFee = cartTotal > 0 ? 3.99 : 0;
  const serviceFee = cartTotal > 0 ? 2.50 : 0;
  const total = cartTotal + deliveryFee + serviceFee;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', onPress: () => removeFromCart(itemId), style: 'destructive' },
        ]
      );
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is already empty.');
      return;
    }

    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          onPress: () => {
            clearCart();
            Alert.alert('Cart Cleared', 'All items have been removed from your cart.');
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to proceed with checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }

    // Navigate to checkout with cart data
    router.push({
      pathname: '/checkout',
      params: {
        cartData: JSON.stringify({
          items: cartItems,
          deliveryInstructions,
          subtotal: cartTotal,
          deliveryFee,
          serviceFee,
          total,
        }),
      },
    });
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <ShoppingCart size={32} color="white" />
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerSubtitle}>
              Add delicious items to get started
            </Text>
          </View>
        </LinearGradient>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <ShoppingCart size={64} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Discover amazing homemade dishes from local cooks and add them to your cart
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.push('/(tabs)')}
            style={styles.startShoppingButton}
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
        <View style={styles.headerContent}>
          <ShoppingCart size={32} color="white" />
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSubtitle}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'} • ${cartTotal.toFixed(2)}
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <Card style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <MapPin size={20} color={theme.colors.primary} />
            <Text style={styles.addressTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push('/delivery-address')}>
              <Edit3 size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.addressText}>
            {address || 'Please set your delivery address'}
          </Text>
        </Card>

        {/* Cart Items */}
        <View style={styles.cartItems}>
          {cartItems.map((item) => (
            <Card key={item.id} style={styles.cartItem}>
              <View style={styles.itemContent}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemCook}>by {item.cookName}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
                  
                  {item.specialInstructions && (
                    <Text style={styles.itemInstructions}>
                      Note: {item.specialInstructions}
                    </Text>
                  )}
                </View>
                
                <View style={styles.itemActions}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
                      onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >
                      <Minus size={16} color={item.quantity === 1 ? theme.colors.onSurfaceVariant : theme.colors.primary} />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.itemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Delivery Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Delivery Instructions</Text>
          <Input
            placeholder="Add any special delivery instructions..."
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
            style={styles.instructionsInput}
          />
        </Card>

        {/* Order Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>Total</Text>
            <Text style={styles.summaryValueTotal}>${total.toFixed(2)}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <Button
          title={`Proceed to Checkout • $${total.toFixed(2)}`}
          onPress={handleCheckout}
          size="large"
          style={styles.checkoutButton}
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
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  startShoppingButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  addressCard: {
    marginBottom: theme.spacing.lg,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addressTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  cartItems: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  cartItem: {
    padding: theme.spacing.md,
  },
  itemContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  itemCook: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
  },
  itemInstructions: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  instructionsCard: {
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  instructionsInput: {
    marginBottom: 0,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryRowTotal: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    marginTop: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  summaryValueTotal: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  checkoutContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  checkoutButton: {
    marginBottom: 0,
  },
});