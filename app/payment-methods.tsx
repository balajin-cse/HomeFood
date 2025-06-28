import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, Plus, Trash2, Shield, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    Alert.alert('Success', 'Default payment method updated!');
  };

  const handleDeletePaymentMethod = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault && paymentMethods.length > 1) {
      Alert.alert(
        'Cannot Delete',
        'You cannot delete your default payment method. Please set another payment method as default first.'
      );
      return;
    }

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
            Alert.alert('Success', 'Payment method deleted successfully!');
          },
        },
      ]
    );
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic validation
    if (newCard.cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    if (newCard.cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return;
    }

    // Determine card brand based on first digit
    const firstDigit = newCard.cardNumber.charAt(0);
    let brand = 'Unknown';
    if (firstDigit === '4') brand = 'Visa';
    else if (firstDigit === '5') brand = 'Mastercard';
    else if (firstDigit === '3') brand = 'Amex';

    const [month, year] = newCard.expiryDate.split('/');
    const last4 = newCard.cardNumber.replace(/\s/g, '').slice(-4);

    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last4,
      brand,
      expiryMonth: parseInt(month),
      expiryYear: parseInt(`20${year}`),
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    });
    setShowAddCardModal(false);
    Alert.alert('Success', 'Payment method added successfully!');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
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

  const formatCardNumberDisplay = (last4: string) => {
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
                        {formatCardNumberDisplay(method.last4 || '')}
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
        <TouchableOpacity 
          style={styles.addPaymentButton}
          onPress={() => setShowAddCardModal(true)}
        >
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

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <TouchableOpacity 
              onPress={() => setShowAddCardModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.addCardForm}>
              <Text style={styles.formTitle}>Card Information</Text>
              
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={newCard.cardholderName}
                onChangeText={(text) => setNewCard(prev => ({ ...prev, cardholderName: text }))}
              />

              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard(prev => ({ ...prev, cardNumber: formatCardNumber(text) }))}
                keyboardType="numeric"
                maxLength={19}
              />

              <View style={styles.cardRow}>
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={newCard.expiryDate}
                  onChangeText={(text) => setNewCard(prev => ({ ...prev, expiryDate: formatExpiryDate(text) }))}
                  keyboardType="numeric"
                  maxLength={5}
                  style={styles.halfInput}
                />

                <Input
                  label="CVV"
                  placeholder="123"
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard(prev => ({ ...prev, cvv: text.replace(/[^0-9]/g, '') }))}
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.halfInput}
                />
              </View>

              <View style={styles.securityNote}>
                <Shield size={16} color={theme.colors.success} />
                <Text style={styles.securityNoteText}>
                  Your card information is encrypted and secure
                </Text>
              </View>
            </Card>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowAddCardModal(false)}
              style={styles.modalCancelButton}
            />
            <Button
              title="Add Card"
              onPress={handleAddCard}
              style={styles.modalAddButton}
            />
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  addCardForm: {
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  securityNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalAddButton: {
    flex: 1,
  },
});