import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Truck, MapPin, Phone, MessageCircle, CircleCheck as CheckCircle, Clock, Navigation, Package } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { theme } from '@/constants/theme';

interface Order {
  orderId: string;
  trackingNumber: string;
  items: any[];
  cookId: string;
  cookName: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  quantity: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  deliveryInstructions?: string;
}

export default function DeliveryScreen() {
  const { user } = useAuth();
  const { 
    orders, 
    loading, 
    refreshing, 
    updateOrderStatus, 
    refreshOrders,
    getOrdersByStatus 
  } = useOrders();
  const [selectedTab, setSelectedTab] = useState<'ready' | 'delivering' | 'completed'>('ready');

  // Filter orders for this cook only
  const cookOrders = orders.filter(order => order.cookId === user?.id);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order status updated to ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleContactCustomer = (order: Order) => {
    Alert.alert(
      'Contact Customer',
      `Would you like to call ${order.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling customer...') },
        { text: 'Message', onPress: () => console.log('Opening chat...') },
      ]
    );
  };

  const handleStartDelivery = (order: Order) => {
    Alert.alert(
      'Start Delivery',
      `Are you ready to deliver this order to ${order.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Delivery', 
          onPress: () => handleUpdateOrderStatus(order.orderId, 'picked_up')
        },
      ]
    );
  };

  const handleCompleteDelivery = (order: Order) => {
    Alert.alert(
      'Complete Delivery',
      'Confirm that the order has been successfully delivered to the customer.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Delivered', 
          onPress: () => handleUpdateOrderStatus(order.orderId, 'delivered')
        },
      ]
    );
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ready':
        return theme.colors.secondary;
      case 'picked_up':
        return theme.colors.primary;
      case 'delivered':
        return theme.colors.success;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getFilteredOrders = () => {
    switch (selectedTab) {
      case 'ready':
        return cookOrders.filter(order => order.status === 'ready');
      case 'delivering':
        return cookOrders.filter(order => order.status === 'picked_up');
      case 'completed':
        return cookOrders.filter(order => order.status === 'delivered');
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();

  if (!user?.isCook) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Truck size={32} color="white" />
            <Text style={styles.headerTitle}>Access Denied</Text>
            <Text style={styles.headerSubtitle}>
              This page is only available for registered cooks
            </Text>
          </View>
        </LinearGradient>
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
          <Truck size={32} color="white" />
          <Text style={styles.headerTitle}>Delivery Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage your order deliveries and customer communication
          </Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'ready' && styles.activeTab]}
          onPress={() => setSelectedTab('ready')}
        >
          <Text style={[styles.tabText, selectedTab === 'ready' && styles.activeTabText]}>
            Ready ({cookOrders.filter(o => o.status === 'ready').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'delivering' && styles.activeTab]}
          onPress={() => setSelectedTab('delivering')}
        >
          <Text style={[styles.tabText, selectedTab === 'delivering' && styles.activeTabText]}>
            Delivering ({cookOrders.filter(o => o.status === 'picked_up').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Completed ({cookOrders.filter(o => o.status === 'delivered').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshOrders} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <Card style={styles.emptyState}>
            <Package size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'ready' && 'No orders ready for delivery'}
              {selectedTab === 'delivering' && 'No orders currently being delivered'}
              {selectedTab === 'completed' && 'No completed deliveries'}
            </Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'ready' && 'Orders marked as ready will appear here'}
              {selectedTab === 'delivering' && 'Orders out for delivery will appear here'}
              {selectedTab === 'completed' && 'Your completed deliveries will appear here'}
            </Text>
          </Card>
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <Card key={order.orderId} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle}>
                      {order.items[0]?.title || 'Order'} 
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </Text>
                    <Text style={styles.orderDetails}>
                      Order #{order.trackingNumber} • ${order.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>

                {/* Customer Information */}
                <View style={styles.customerSection}>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.customerPhone}>{order.customerPhone}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => handleContactCustomer(order)}
                  >
                    <Phone size={16} color={theme.colors.primary} />
                    <Text style={styles.contactButtonText}>Contact</Text>
                  </TouchableOpacity>
                </View>

                {/* Delivery Address */}
                <View style={styles.addressSection}>
                  <MapPin size={16} color={theme.colors.primary} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>Delivery Address</Text>
                    <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                  </View>
                  <TouchableOpacity style={styles.navigationButton}>
                    <Navigation size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Delivery Instructions */}
                {order.deliveryInstructions && (
                  <View style={styles.instructionsSection}>
                    <Text style={styles.instructionsLabel}>Delivery Instructions</Text>
                    <Text style={styles.instructionsText}>{order.deliveryInstructions}</Text>
                  </View>
                )}

                {/* Order Items */}
                <View style={styles.itemsSection}>
                  <Text style={styles.itemsLabel}>Order Items</Text>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.itemName}>{item.title}</Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {order.status === 'ready' && (
                    <Button
                      title="Start Delivery"
                      onPress={() => handleStartDelivery(order)}
                      style={styles.actionButton}
                    />
                  )}
                  
                  {order.status === 'picked_up' && (
                    <Button
                      title="Mark as Delivered"
                      onPress={() => handleCompleteDelivery(order)}
                      style={styles.actionButton}
                    />
                  )}

                  {order.status === 'delivered' && (
                    <View style={styles.completedIndicator}>
                      <CheckCircle size={20} color={theme.colors.success} />
                      <Text style={styles.completedText}>Delivery Completed</Text>
                    </View>
                  )}
                </View>

                {/* Delivery Time */}
                <View style={styles.timeSection}>
                  <Clock size={14} color={theme.colors.onSurfaceVariant} />
                  <Text style={styles.timeText}>
                    {order.status === 'delivered' 
                      ? `Delivered on ${new Date(order.orderDate).toLocaleDateString()}`
                      : `Expected: ${order.deliveryTime}`
                    }
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
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
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
    opacity: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  ordersList: {
    gap: theme.spacing.lg,
  },
  orderCard: {
    padding: theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  orderDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  customerPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
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
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  addressInfo: {
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
  navigationButton: {
    padding: theme.spacing.sm,
  },
  instructionsSection: {
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
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
  itemsSection: {
    marginBottom: theme.spacing.lg,
  },
  itemsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  actionButtons: {
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    marginBottom: 0,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  completedText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.success,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
});