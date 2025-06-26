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
import { ArrowLeft, CreditCard, Plus, Trash2, Shield } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ]);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
          },
        },
      ]
    );
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
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
          <CreditCard size={32} color="white" />
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <Text style={styles.headerSubtitle}>
            Manage your payment options
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Shield size={24} color={theme.colors.success} />
            <Text style={styles.securityTitle}>Secure Payments</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your full card details.
          </Text>
        </Card>

        {/* Payment Methods List */}
        <View style={styles.paymentList}>
          {paymentMethods.map((method) => (
            <Card key={method.id} style={styles.paymentCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{getCardIcon(method.brand || '')}</Text>
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardBrand}>{method.brand}</Text>
                      <Text style={styles.cardNumber}>
                        {formatCardNumber(method.last4 || '')}
                      </Text>
                      {method.expiryMonth && method.expiryYear && (
                        <Text style={styles.cardExpiry}>
                          Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.setDefaultButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Text style={styles.setDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePaymentMethod(method.id)}
                  >
                    <Trash2 size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Add Payment Method */}
        <TouchableOpacity style={styles.addPaymentButton}>
          <Card style={styles.addPaymentCard}>
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addPaymentText}>Add New Payment Method</Text>
          </Card>
        </TouchableOpacity>

        {/* Supported Payment Types */}
        <Card style={styles.supportedCard}>
          <Text style={styles.supportedTitle}>Supported Payment Methods</Text>
          <View style={styles.supportedMethods}>
            <View style={styles.supportedMethod}>
              <Text style={styles.supportedIcon}>💳</Text>
              <Text style={styles.supportedText}>Credit & Debit Cards</Text>
            </View>
            <View style={styles.supportedMethod}>
              <Text style={styles.supportedIcon}>📱</Text>
              <Text style={styles.supportedText}>Apple Pay</Text>
            </View>
            <View style={styles.supportedMethod}>
              <Text style={styles.supportedIcon}>🤖</Text>
              <Text style={styles.supportedText}>Google Pay</Text>
            </View>
            <View style={styles.supportedMethod}>
              <Text style={styles.supportedIcon}>💙</Text>
              <Text style={styles.supportedText}>PayPal</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
  },
  securityCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  securityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  paymentList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  paymentCard: {
    padding: theme.spacing.lg,
  },
  cardContent: {
    gap: theme.spacing.md,
  },
  cardInfo: {
    gap: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardDetails: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  cardNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  cardExpiry: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setDefaultButton: {
    paddingVertical: theme.spacing.sm,
  },
  setDefaultText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  addPaymentButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  addPaymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    gap: theme.spacing.md,
  },
  addPaymentText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  supportedCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  supportedTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  supportedMethods: {
    gap: theme.spacing.md,
  },
  supportedMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  supportedIcon: {
    fontSize: 24,
  },
  supportedText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
});