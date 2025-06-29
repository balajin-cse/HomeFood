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
import { Truck, MapPin, Phone, MessageCircle, CircleCheck as CheckCircle, Clock, Navigation, Package, Bell, Users } from 'lucide-react-native';
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
  customerId: string;
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
    getCookActiveOrders,
    realTimeEnabled
  } = useOrders();
  const [selectedTab, setSelectedTab] = useState<'new' | 'preparing' | 'ready' | 'delivering' | 'completed'>('new');
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Filter orders for this cook only
  const cookOrders = orders.filter(order => order.cookId === user?.id);
  const activeOrders = getCookActiveOrders(user?.id || '');

  // Monitor for new orders and show notification
  useEffect(() => {
    const newOrderCount = cookOrders.filter(order => order.status === 'confirmed').length;
    if (newOrderCount > lastOrderCount && lastOrderCount > 0) {
      // New order received!
      Alert.alert(
        '🔔 New Order Received!',
        `You have ${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} waiting for preparation.`,
        [{ text: 'View Orders', onPress: () => setSelectedTab('new') }]
      );
    }
    setLastOrderCount(newOrderCount);
  }, [cookOrders, lastOrderCount]);

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
      `Would you like to contact ${order.customerName}?`,
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
      case 'confirmed':
        return '#FF9800';
      case 'preparing':
        return theme.colors.primary;
      case 'ready':
        return theme.colors.secondary;
      case 'picked_up':
        return '#2196F3';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'New Order';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getFilteredOrders = () => {
    switch (selectedTab) {
      case 'new':
        return cookOrders.filter(order => order.status === 'confirmed');
      case 'preparing':
        return cookOrders.filter(order => order.status === 'preparing');
      case 'ready':
        return cookOrders.filter(order => order.status === 'ready');
      case 'delivering':
        return cookOrders.filter(order => order.status === 'picked_up');
      case 'completed':
        return cookOrders.filter(order => ['delivered', 'cancelled'].includes(order.status));
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
          <View style={styles.headerTop}>
            <Truck size={32} color="white" />
            <View style={styles.connectionStatus}>
              <View style={[styles.connectionDot, { backgroundColor: realTimeEnabled ? '#4CAF50' : '#FF9800' }]} />
              <Text style={styles.connectionText}>
                {realTimeEnabled ? 'Live' : 'Offline'}
              </Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Order Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage incoming orders and deliveries
          </Text>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{activeOrders.length}</Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{cookOrders.filter(o => o.status === 'confirmed').length}</Text>
              <Text style={styles.statLabel}>New Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{cookOrders.filter(o => o.status === 'delivered').length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'new', label: 'New', count: cookOrders.filter(o => o.status === 'confirmed').length },
          { id: 'preparing', label: 'Preparing', count: cookOrders.filter(o => o.status === 'preparing').length },
          { id: 'ready', label: 'Ready', count: cookOrders.filter(o => o.status === 'ready').length },
          { id: 'delivering', label: 'Delivering', count: cookOrders.filter(o => o.status === 'picked_up').length },
          { id: 'completed', label: 'Completed', count: cookOrders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
              {selectedTab === 'new' && 'No new orders'}
              {selectedTab === 'preparing' && 'No orders being prepared'}
              {selectedTab === 'ready' && 'No orders ready for delivery'}
              {selectedTab === 'delivering' && 'No orders currently being delivered'}
              {selectedTab === 'completed' && 'No completed orders'}
            </Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'new' && 'New customer orders will appear here automatically'}
              {selectedTab === 'preparing' && 'Orders being prepared will appear here'}
              {selectedTab === 'ready' && 'Orders ready for pickup will appear here'}
              {selectedTab === 'delivering' && 'Orders out for delivery will appear here'}
              {selectedTab === 'completed' && 'Your completed orders will appear here'}
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
                    <Text style={styles.orderTime}>
                      {new Date(order.orderDate).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>

                {/* Customer Information */}
                <View style={styles.customerSection}>
                  <View style={styles.customerInfo}>
                    <Users size={16} color={theme.colors.primary} />
                    <View style={styles.customerDetails}>
                      <Text style={styles.customerName}>{order.customerName}</Text>
                      <Text style={styles.customerPhone}>{order.customerPhone}</Text>
                    </View>
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
                  <Text style={styles.itemsLabel}>Order Items ({order.items.length})</Text>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.itemName}>{item.title}</Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {order.status === 'confirmed' && (
                    <Button
                      title="Start Preparing"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'preparing')}
                      style={styles.actionButton}
                    />
                  )}
                  
                  {order.status === 'preparing' && (
                    <Button
                      title="Mark Ready"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'ready')}
                      style={styles.actionButton}
                    />
                  )}

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

                  {order.status === 'cancelled' && (
                    <View style={[styles.completedIndicator, { backgroundColor: theme.colors.error + '20' }]}>
                      <Text style={[styles.completedText, { color: theme.colors.error }]}>Order Cancelled</Text>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  headerTitle: {
    fontSize: 24,
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
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
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
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
    opacity: 1,
  },
  tabBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
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
    marginBottom: theme.spacing.xs,
  },
  orderTime: {
    fontSize: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  customerDetails: {
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
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
    marginHorizontal: theme.spacing.md,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.md,
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