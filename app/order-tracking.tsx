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
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useOrders } from '@/contexts/OrderContext';
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
  const { orders, updateOrderStatus, realTimeEnabled } = useOrders();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadOrderDetails();
    
    // Set up auto-refresh every 20 seconds if not using real-time
    if (!realTimeEnabled) {
      const interval = setInterval(() => {
        loadOrderDetails();
      }, 20000);
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadOrderDetails = () => {
    // Find the order in the context
    const orderId = params.orderId as string;
    const orderFromContext = orders.find(order => order.orderId === orderId);
    
    if (orderFromContext) {
      // Create order details from context data
      const orderDetails: OrderDetails = {
        id: orderFromContext.orderId,
        trackingNumber: orderFromContext.trackingNumber,
        foodTitle: orderFromContext.items[0]?.title || 'Your Order',
        cookName: orderFromContext.cookName,
        cookPhone: '+1 (555) 123-4567', // Mock phone for demo
        quantity: orderFromContext.quantity,
        totalPrice: orderFromContext.totalPrice,
        status: orderFromContext.status,
        orderDate: new Date(orderFromContext.orderDate),
        estimatedDeliveryTime: orderFromContext.deliveryTime,
        deliveryAddress: orderFromContext.deliveryAddress,
        specialInstructions: orderFromContext.deliveryInstructions,
      };
      
      setOrderDetails(orderDetails);
      generateTrackingSteps(orderDetails);
      return;
    }
    
    // Fallback to params if order not found in context
    if (params.orderId) {
      const fallbackOrder: OrderDetails = {
        id: params.orderId as string,
        trackingNumber: params.trackingNumber as string || `HF${Date.now().toString().slice(-8)}`,
        foodTitle: params.foodTitle as string || 'Your Order',
        cookName: params.cookName as string || 'Home Cook',
        cookPhone: '+1 (555) 123-4567',
        quantity: parseInt(params.quantity as string) || 1,
        totalPrice: parseFloat(params.totalPrice as string) || 0,
        status: 'confirmed',
        orderDate: new Date(),
        estimatedDeliveryTime: 'ASAP',
        deliveryAddress: 'Your delivery address',
      };

      setOrderDetails(fallbackOrder);
      generateTrackingSteps(fallbackOrder);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.primary;
      case 'preparing':
        return theme.colors.warning;
      case 'ready':
        return theme.colors.info;
      case 'picked_up':
        return theme.colors.primary;
      case 'delivered':
        return '#4CAF50'; // Success green
      case 'cancelled':
        return '#F44336'; // Error red
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Food';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Out for Delivery';
      case 'delivered':
        return 'Order Delivered';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return status;
    }
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
      'What issue are you having with this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Order is Late', 
          onPress: () => Alert.alert('Report Submitted', 'We\'ve notified the cook about the delay.') 
        },
        { 
          text: 'Wrong Food', 
          onPress: () => Alert.alert('Report Submitted', 'We\'ve reported the issue to the cook.') 
        },
        { 
          text: 'Quality Issue', 
          onPress: () => Alert.alert('Report Submitted', 'We\'ve reported the quality issue.') 
        },
      ]
    );
  };
  
  const handleCancelOrder = async () => {
    if (!orderDetails) return;
    
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await updateOrderStatus(orderDetails.id, 'cancelled');
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
              loadOrderDetails(); // Reload to update UI
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel the order. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleOrderAgain = () => {
    if (!orderDetails) return;
    
    try {
      // Get the order from the context
      const orderFromContext = orders.find(order => order.orderId === orderDetails.id);
      
      if (orderFromContext && orderFromContext.items && orderFromContext.items.length > 0) {
        // Add each item back to cart
        orderFromContext.items.forEach(item => {
          addToCart(
            {
              foodId: item.id,
              title: item.title,
              description: '',
              price: item.price,
              image: item.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
              cookId: orderFromContext.cookId,
              cookName: orderFromContext.cookName,
            },
            item.quantity,
            item.specialInstructions
          );
        });
        
        Alert.alert(
          'Added to Cart',
          'The items from this order have been added to your cart.',
          [
            { text: 'Continue Shopping', style: 'cancel' },
            { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') }
          ]
        );
      } else {
        Alert.alert('Error', 'Could not find the items from this order.');
      }
    } catch (error) {
      console.error('Error adding items to cart:', error);
      Alert.alert('Error', 'There was a problem adding these items to your cart.');
    }
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
            <View style={styles.orderTitleWrapper}>
              <Text style={styles.orderTitle}>{orderDetails.foodTitle}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderDetails.status) }]}>
                <Text style={styles.statusBadgeText}>
                  {getStatusText(orderDetails.status)}
                </Text>
              </View>
            </View>
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
            title={orderDetails.status === 'delivered' ? 'Rate Order' : 'Report an Issue'}
            variant="outline"
            onPress={orderDetails.status === 'delivered' ? () => router.replace('/order-history') : handleReportIssue}
            style={styles.actionButton}
          />
          {
            ['confirmed', 'preparing'].includes(orderDetails.status) ? (
              <Button
                title="Cancel Order"
                variant="outline"
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelOrder}
              />
            ) : (
              <Button
                title="Order Again"
                onPress={handleOrderAgain}
                style={styles.actionButton}
              />
            )
          }
        </View>
      </ScrollView>
      
      {/* Connection Status */}
      {!realTimeEnabled && (
        <View style={styles.connectionIndicator}>
          <Text style={styles.connectionText}>
            Live updates disabled. Pull down to refresh.
          </Text>
        </View>
      )}
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
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  orderTitleWrapper: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  orderTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
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
  cancelButton: {
    borderColor: theme.colors.error,
  },
  connectionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  connectionText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});