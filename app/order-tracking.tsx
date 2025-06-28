import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, Clock, CircleCheck as CheckCircle, Truck, MapPin, Phone, MessageCircle } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { format } from 'date-fns';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  isCompleted: boolean;
  isActive: boolean;
  icon: React.ReactNode;
}

interface OrderDetails {
  id: string;
  trackingNumber: string;
  foodTitle: string;
  cookName: string;
  cookPhone: string;
  quantity: number;
  totalPrice: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered';
  orderDate: Date;
  estimatedDeliveryTime: string;
  deliveryAddress: string;
  specialInstructions?: string;
}

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = () => {
    // Generate mock order details with tracking number
    const trackingNumber = `HF${Date.now().toString().slice(-8)}`;
    
    const mockOrder: OrderDetails = {
      id: params.orderId as string || '1',
      trackingNumber,
      foodTitle: params.foodTitle as string || 'Homemade Pasta Carbonara',
      cookName: params.cookName as string || 'Maria Rodriguez',
      cookPhone: '+1 (555) 123-4567',
      quantity: parseInt(params.quantity as string) || 2,
      totalPrice: parseFloat(params.totalPrice as string) || 33.98,
      status: 'preparing',
      orderDate: new Date(),
      estimatedDeliveryTime: '12:30 PM - 1:00 PM',
      deliveryAddress: '123 Main Street, San Francisco, CA 94102',
      specialInstructions: 'Please ring the doorbell twice',
    };

    setOrderDetails(mockOrder);
    generateTrackingSteps(mockOrder);
  };

  const generateTrackingSteps = (order: OrderDetails) => {
    const now = new Date();
    const steps: TrackingStep[] = [
      {
        id: '1',
        title: 'Order Confirmed',
        description: `Your order has been confirmed by ${order.cookName}`,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
        isCompleted: true,
        isActive: false,
        icon: <CheckCircle size={20} color={theme.colors.success} />,
      },
      {
        id: '2',
        title: 'Preparing Your Food',
        description: 'Your delicious meal is being prepared with love',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
        isCompleted: order.status !== 'confirmed',
        isActive: order.status === 'preparing',
        icon: <Clock size={20} color={order.status === 'preparing' ? theme.colors.primary : theme.colors.outline} />,
      },
      {
        id: '3',
        title: 'Ready for Pickup',
        description: 'Your order is ready and waiting for delivery',
        timestamp: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
        isCompleted: ['picked_up', 'delivered'].includes(order.status),
        isActive: order.status === 'ready',
        icon: <Package size={20} color={order.status === 'ready' ? theme.colors.primary : theme.colors.outline} />,
      },
      {
        id: '4',
        title: 'Out for Delivery',
        description: 'Your order is on its way to you',
        timestamp: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes from now
        isCompleted: order.status === 'delivered',
        isActive: order.status === 'picked_up',
        icon: <Truck size={20} color={order.status === 'picked_up' ? theme.colors.primary : theme.colors.outline} />,
      },
      {
        id: '5',
        title: 'Delivered',
        description: 'Enjoy your delicious homemade meal!',
        timestamp: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
        isCompleted: order.status === 'delivered',
        isActive: false,
        icon: <CheckCircle size={20} color={order.status === 'delivered' ? theme.colors.success : theme.colors.outline} />,
      },
    ];

    setTrackingSteps(steps);
  };

  const handleContactCook = () => {
    Alert.alert(
      'Contact Cook',
      `Would you like to call ${orderDetails?.cookName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling cook...') },
        { text: 'Message', onPress: () => console.log('Opening chat...') },
      ]
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'What seems to be the problem with your order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Order is Late', onPress: () => console.log('Reporting late order...') },
        { text: 'Wrong Order', onPress: () => console.log('Reporting wrong order...') },
        { text: 'Other Issue', onPress: () => console.log('Reporting other issue...') },
      ]
    );
  };

  if (!orderDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order details...</Text>
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
          <Package size={32} color="white" />
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSubtitle}>
            Track your delicious homemade meal
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <Card style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>{orderDetails.foodTitle}</Text>
            <Text style={styles.orderPrice}>${orderDetails.totalPrice.toFixed(2)}</Text>
          </View>
          
          <View style={styles.orderMeta}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Tracking Number:</Text>
              <Text style={styles.metaValue}>{orderDetails.trackingNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order Date:</Text>
              <Text style={styles.metaValue}>
                {format(orderDetails.orderDate, 'MMM dd, yyyy • h:mm a')}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Estimated Delivery:</Text>
              <Text style={styles.metaValue}>{orderDetails.estimatedDeliveryTime}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Quantity:</Text>
              <Text style={styles.metaValue}>{orderDetails.quantity}</Text>
            </View>
          </View>
        </Card>

        {/* Tracking Progress */}
        <Card style={styles.trackingCard}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          
          <View style={styles.trackingSteps}>
            {trackingSteps.map((step, index) => (
              <View key={step.id} style={styles.trackingStep}>
                <View style={styles.stepIndicator}>
                  <View style={[
                    styles.stepIcon,
                    step.isCompleted && styles.stepIconCompleted,
                    step.isActive && styles.stepIconActive,
                  ]}>
                    {step.icon}
                  </View>
                  {index < trackingSteps.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      step.isCompleted && styles.stepLineCompleted,
                    ]} />
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle,
                    step.isActive && styles.stepTitleActive,
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <Text style={styles.stepTime}>
                    {step.isCompleted 
                      ? format(step.timestamp, 'h:mm a')
                      : `Est. ${format(step.timestamp, 'h:mm a')}`
                    }
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Cook Information */}
        <Card style={styles.cookCard}>
          <Text style={styles.sectionTitle}>Cook Information</Text>
          
          <View style={styles.cookInfo}>
            <View style={styles.cookDetails}>
              <Text style={styles.cookName}>{orderDetails.cookName}</Text>
              <Text style={styles.cookPhone}>{orderDetails.cookPhone}</Text>
            </View>
            
            <View style={styles.cookActions}>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handleContactCook}
              >
                <Phone size={16} color={theme.colors.primary} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handleContactCook}
              >
                <MessageCircle size={16} color={theme.colors.primary} />
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Delivery Information */}
        <Card style={styles.deliveryCard}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.deliveryInfo}>
            <View style={styles.addressSection}>
              <MapPin size={20} color={theme.colors.primary} />
              <View style={styles.addressDetails}>
                <Text style={styles.addressLabel}>Delivery Address</Text>
                <Text style={styles.addressText}>{orderDetails.deliveryAddress}</Text>
              </View>
            </View>
            
            {orderDetails.specialInstructions && (
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsLabel}>Special Instructions</Text>
                <Text style={styles.instructionsText}>{orderDetails.specialInstructions}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Report an Issue"
            variant="outline"
            onPress={handleReportIssue}
            style={styles.actionButton}
          />
          
          <Button
            title="Order Again"
            onPress={() => router.push('/(tabs)')}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
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
  orderSummary: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  orderTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  orderPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  orderMeta: {
    gap: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  trackingCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  trackingSteps: {
    gap: theme.spacing.lg,
  },
  trackingStep: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.outline,
  },
  stepIconCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  stepIconActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: theme.colors.outline,
    marginTop: theme.spacing.sm,
  },
  stepLineCompleted: {
    backgroundColor: theme.colors.success,
  },
  stepContent: {
    flex: 1,
    paddingTop: theme.spacing.xs,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  stepTitleActive: {
    color: theme.colors.primary,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  stepTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  cookCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cookInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cookDetails: {
    flex: 1,
  },
  cookName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  cookPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  cookActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  deliveryCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  deliveryInfo: {
    gap: theme.spacing.lg,
  },
  addressSection: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  instructionsSection: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  instructionsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});