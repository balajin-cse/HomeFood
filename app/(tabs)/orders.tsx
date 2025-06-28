import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Platform,
  RefreshControl,
} from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, TriangleAlert as AlertTriangle, MessageCircle, RefreshCw, Package, ChefHat, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Order {
  orderId: string;
  trackingNumber: string;
  items: any[];
  cookName: string;
  cookId?: string;
  customerName?: string;
  totalPrice: number;
  quantity: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  deliveryInstructions?: string;
  cancellationReason?: string;
  cancellationMessage?: string;
}

interface ReportIssueData {
  orderId: string;
  issueType: string;
  description: string;
  contactMethod: 'phone' | 'email';
}

interface CookNotification {
  id: string;
  cookId: string;
  cookName: string;
  type: 'order_cancelled' | 'order_issue';
  orderId: string;
  customerName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Cook Orders Management Interface
function CookOrdersInterface() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        // Filter orders for this cook
        const cookOrders = allOrders.filter((order: Order) => 
          order.cookId === user?.id || order.cookName === user?.name
        );
        setOrders(cookOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        const updatedOrders = allOrders.map((order: Order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        );
        
        await AsyncStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
        
        const updatedCookOrders = orders.map(order =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedCookOrders);
        
        Alert.alert('Success', `Order status updated to ${getStatusText(newStatus)}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
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
        return theme.colors.onSurface;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'picked_up':
        return 'Picked Up';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const activeOrders = orders.filter(order => 
    ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
  );

  const orderHistory = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const displayOrders = selectedTab === 'active' ? activeOrders : orderHistory;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Package size={32} color="white" />
          <Text style={styles.headerTitle}>Order Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage incoming orders and track progress
          </Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
            History ({orderHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyStateText}>
              {selectedTab === 'active' 
                ? 'No active orders' 
                : 'No order history'
              }
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedTab === 'active' 
                ? 'New orders will appear here when customers place them'
                : 'Completed and cancelled orders will appear here'
              }
            </Text>
          </View>
        ) : (
          displayOrders.map((order) => (
            <Card key={order.orderId} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>
                    {order.items[0]?.title || 'Order'} 
                    {order.items.length > 1 && ` +${order.items.length - 1} more`}
                  </Text>
                  <Text style={styles.customerName}>Customer: {order.customerName}</Text>
                  <Text style={styles.trackingNumber}>#{order.trackingNumber}</Text>
                </View>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
                  textStyle={styles.statusText}
                >
                  {getStatusText(order.status)}
                </Chip>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Order ID:</Text>
                  <Text style={styles.metaValue}>{order.orderId}</Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Quantity:</Text>
                  <Text style={styles.metaValue}>{order.quantity} items</Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Total:</Text>
                  <Text style={styles.metaValue}>${order.totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Order Date:</Text>
                  <Text style={styles.metaValue}>
                    {format(new Date(order.orderDate), 'MMM dd, yyyy • h:mm a')}
                  </Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Delivery Time:</Text>
                  <Text style={styles.metaValue}>{order.deliveryTime}</Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Address:</Text>
                  <Text style={styles.metaValue}>{order.deliveryAddress}</Text>
                </View>
                
                {order.deliveryInstructions && (
                  <View style={styles.instructionsSection}>
                    <Text style={styles.instructionsLabel}>Delivery Instructions:</Text>
                    <Text style={styles.instructionsText}>{order.deliveryInstructions}</Text>
                  </View>
                )}
              </View>

              {/* Order Items */}
              <View style={styles.itemsSection}>
                <Text style={styles.itemsLabel}>Order Items:</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.title}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              {selectedTab === 'active' && (
                <View style={styles.orderActions}>
                  {order.status === 'confirmed' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'preparing')}
                      style={styles.actionButton}
                    >
                      Start Preparing
                    </Button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'ready')}
                      style={styles.actionButton}
                    >
                      Mark Ready
                    </Button>
                  )}
                  
                  {order.status === 'ready' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'picked_up')}
                      style={styles.actionButton}
                    >
                      Mark Picked Up
                    </Button>
                  )}

                  {order.status === 'picked_up' && (
                    <View style={styles.deliveryNote}>
                      <Text style={styles.deliveryNoteText}>
                        Order is out for delivery. Use the Delivery tab to complete delivery.
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {selectedTab === 'history' && order.status === 'delivered' && (
                <View style={styles.completedIndicator}>
                  <CheckCircle size={20} color={theme.colors.success} />
                  <Text style={styles.completedText}>Order Completed Successfully</Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// Customer Orders Interface (existing functionality)
function CustomerOrdersInterface() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForReport, setSelectedOrderForReport] = useState<Order | null>(null);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);
  const [reportIssue, setReportIssue] = useState({
    issueType: '',
    description: '',
    contactMethod: 'email' as 'phone' | 'email',
  });
  const [cancellationData, setCancellationData] = useState({
    reason: '',
    message: '',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      } else {
        const mockOrders: Order[] = [
          {
            orderId: 'ORD1234567890',
            trackingNumber: 'HF12345678',
            items: [
              {
                id: '1',
                title: 'Homemade Pasta Carbonara',
                cookName: 'Maria Rodriguez',
                price: 16.99,
                quantity: 2,
              }
            ],
            cookName: 'Maria Rodriguez',
            cookId: 'ck-maria',
            customerName: 'Bala',
            totalPrice: 40.47,
            quantity: 2,
            status: 'preparing',
            orderDate: new Date().toISOString(),
            deliveryTime: '12:30 PM - 1:00 PM',
            deliveryAddress: '123 Main St, San Francisco, CA',
            paymentMethod: 'Visa ending in 4242',
          },
        ];
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
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
        return theme.colors.onSurface;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Being Prepared';
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

  const sendNotificationToCook = async (notification: Omit<CookNotification, 'id' | 'timestamp' | 'isRead'>) => {
    try {
      const cookNotification: CookNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      const existingNotifications = await AsyncStorage.getItem('cookNotifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      notifications.unshift(cookNotification);
      
      await AsyncStorage.setItem('cookNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error sending notification to cook:', error);
    }
  };

  const handleCancelOrder = (order: Order) => {
    if (order.status !== 'confirmed') {
      Alert.alert(
        'Cannot Cancel',
        'This order cannot be cancelled as it is already being prepared or has been completed.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedOrderForCancel(order);
    setCancellationData({ reason: '', message: '' });
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrderForCancel) return;

    if (!cancellationData.reason) {
      Alert.alert('Error', 'Please select a reason for cancellation.');
      return;
    }

    try {
      const updatedOrders = orders.map(o => 
        o.orderId === selectedOrderForCancel.orderId 
          ? { 
              ...o, 
              status: 'cancelled' as const,
              cancellationReason: cancellationData.reason,
              cancellationMessage: cancellationData.message,
            }
          : o
      );
      
      setOrders(updatedOrders);
      await AsyncStorage.setItem('orderHistory', JSON.stringify(updatedOrders));

      if (selectedOrderForCancel.cookId) {
        await sendNotificationToCook({
          cookId: selectedOrderForCancel.cookId,
          cookName: selectedOrderForCancel.cookName,
          type: 'order_cancelled',
          orderId: selectedOrderForCancel.orderId,
          customerName: selectedOrderForCancel.customerName || 'Customer',
          message: `Order ${selectedOrderForCancel.trackingNumber} has been cancelled by the customer. Reason: ${cancellationData.reason}${cancellationData.message ? `. Message: ${cancellationData.message}` : ''}`,
        });
      }

      setShowCancelModal(false);
      setSelectedOrderForCancel(null);
      
      Alert.alert(
        'Order Cancelled',
        'Your order has been cancelled successfully. The cook has been notified. You will receive a refund within 3-5 business days.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    }
  };

  const handleReportIssue = (order: Order) => {
    setSelectedOrderForReport(order);
    setReportIssue({
      issueType: '',
      description: '',
      contactMethod: 'email',
    });
    setShowReportModal(true);
  };

  const submitReportIssue = async () => {
    if (!reportIssue.issueType || !reportIssue.description) {
      Alert.alert('Missing Information', 'Please select an issue type and provide a description.');
      return;
    }

    try {
      const issueReport = {
        id: Date.now().toString(),
        orderId: selectedOrderForReport!.orderId,
        issueType: reportIssue.issueType,
        description: reportIssue.description,
        status: 'pending' as const,
        reportDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        contactMethod: reportIssue.contactMethod,
      };

      try {
        const existingIssues = await AsyncStorage.getItem('reportedIssues');
        const issues = existingIssues ? JSON.parse(existingIssues) : [];
        issues.unshift(issueReport);
        
        await AsyncStorage.setItem('reportedIssues', JSON.stringify(issues));
      } catch (storageError) {
        console.error('Error saving issue report:', storageError);
      }

      if (selectedOrderForReport!.cookId) {
        await sendNotificationToCook({
          cookId: selectedOrderForReport!.cookId,
          cookName: selectedOrderForReport!.cookName,
          type: 'order_issue',
          orderId: selectedOrderForReport!.orderId,
          customerName: selectedOrderForReport!.customerName || 'Customer',
          message: `Issue reported for order ${selectedOrderForReport!.trackingNumber}: ${reportIssue.issueType}. ${reportIssue.description}`,
        });
      }

      setShowReportModal(false);
      setSelectedOrderForReport(null);

      Alert.alert(
        'Issue Reported',
        `Thank you for reporting this issue. Our support team will contact you via ${reportIssue.contactMethod} within 24 hours to resolve this matter. The cook has also been notified. You can track the status of your report in your profile.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const handleTrackOrder = (order: Order) => {
    router.push({
      pathname: '/order-tracking',
      params: {
        orderId: order.orderId,
        trackingNumber: order.trackingNumber,
        foodTitle: order.items[0]?.title || 'Your Order',
        cookName: order.cookName,
        quantity: order.quantity.toString(),
        totalPrice: order.totalPrice.toString(),
      }
    });
  };

  const handleReorder = (order: Order) => {
    router.push('/(tabs)');
  };

  const handleViewOrderDetails = (order: Order) => {
    handleTrackOrder(order);
  };

  const activeOrders = orders.filter(order => 
    ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
  );

  const orderHistory = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const displayOrders = selectedTab === 'active' ? activeOrders : orderHistory;

  const issueTypes = [
    'Order is taking too long',
    'Wrong order received',
    'Food quality issue',
    'Missing items',
    'Delivery address issue',
    'Payment problem',
    'Cook communication issue',
    'Other'
  ];

  const cancellationReasons = [
    'Changed my mind',
    'Found a better option',
    'Emergency came up',
    'Delivery time too long',
    'Cook not responding',
    'Payment issue',
    'Other'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track and manage your orders</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
            History ({orderHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.ordersList}>
        {displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyStateText}>
              {selectedTab === 'active' 
                ? 'No active orders' 
                : 'No order history'
              }
            </Text>
            {selectedTab === 'active' && (
              <Button
                mode="contained"
                onPress={() => router.push('/(tabs)')}
                style={styles.startOrderingButton}
              >
                Start Ordering
              </Button>
            )}
          </View>
        ) : (
          displayOrders.map((order) => (
            <Card key={order.orderId} style={styles.orderCard}>
              <TouchableOpacity onPress={() => handleViewOrderDetails(order)}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle}>
                      {order.items[0]?.title || 'Order'} 
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </Text>
                    <Text style={styles.cookName}>by {order.cookName}</Text>
                    <Text style={styles.trackingNumber}>#{order.trackingNumber}</Text>
                  </View>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
                    textStyle={styles.statusText}
                  >
                    {getStatusText(order.status)}
                  </Chip>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaLabel}>Order ID:</Text>
                    <Text style={styles.metaValue}>{order.orderId}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaLabel}>Quantity:</Text>
                    <Text style={styles.metaValue}>{order.quantity} items</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaLabel}>Total:</Text>
                    <Text style={styles.metaValue}>${order.totalPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaLabel}>Order Date:</Text>
                    <Text style={styles.metaValue}>
                      {format(new Date(order.orderDate), 'MMM dd, yyyy • h:mm a')}
                    </Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaLabel}>Delivery Time:</Text>
                    <Text style={styles.metaValue}>{order.deliveryTime}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaLabel}>Address:</Text>
                    <Text style={styles.metaValue}>{order.deliveryAddress}</Text>
                  </View>
                  
                  {order.status === 'cancelled' && order.cancellationReason && (
                    <View style={styles.cancellationInfo}>
                      <Text style={styles.cancellationLabel}>Cancellation Reason:</Text>
                      <Text style={styles.cancellationReason}>{order.cancellationReason}</Text>
                      {order.cancellationMessage && (
                        <>
                          <Text style={styles.cancellationLabel}>Message:</Text>
                          <Text style={styles.cancellationMessage}>{order.cancellationMessage}</Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.orderActions}>
                {selectedTab === 'active' && (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => handleTrackOrder(order)}
                      style={styles.actionButton}
                    >
                      Track Order
                    </Button>
                    
                    {order.status === 'confirmed' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleCancelOrder(order)}
                        style={[styles.actionButton, styles.cancelButton]}
                        textColor={theme.colors.error}
                      >
                        Cancel Order
                      </Button>
                    )}
                    
                    <Button
                      mode="outlined"
                      onPress={() => handleReportIssue(order)}
                      style={styles.actionButton}
                    >
                      Report Issue
                    </Button>
                  </>
                )}

                {selectedTab === 'history' && order.status === 'delivered' && (
                  <>
                    <Button
                      mode="outlined"
                      onPress={() => handleReorder(order)}
                      style={styles.actionButton}
                    >
                      Order Again
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => {
                        Alert.alert('Review', 'Review functionality will be implemented soon!');
                      }}
                      style={styles.actionButton}
                    >
                      Write Review
                    </Button>
                  </>
                )}

                {selectedTab === 'history' && order.status === 'cancelled' && (
                  <Button
                    mode="outlined"
                    onPress={() => handleReorder(order)}
                    style={styles.actionButton}
                  >
                    Order Again
                  </Button>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Cancel Order Modal */}
      <Modal
        visible={showCancelModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <TouchableOpacity 
              onPress={() => setShowCancelModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedOrderForCancel && (
              <View style={styles.orderSummary}>
                <Text style={styles.orderSummaryTitle}>Order Details</Text>
                <Text style={styles.orderSummaryText}>
                  {selectedOrderForCancel.items[0]?.title} by {selectedOrderForCancel.cookName}
                </Text>
                <Text style={styles.orderSummaryText}>
                  Order #{selectedOrderForCancel.trackingNumber}
                </Text>
              </View>
            )}

            <View style={styles.reasonSection}>
              <Text style={styles.sectionTitle}>Why are you cancelling?</Text>
              <View style={styles.reasonOptions}>
                {cancellationReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      cancellationData.reason === reason && styles.reasonOptionSelected
                    ]}
                    onPress={() => setCancellationData(prev => ({ ...prev, reason }))}
                  >
                    <Text style={[
                      styles.reasonText,
                      cancellationData.reason === reason && styles.reasonTextSelected
                    ]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.messageSection}>
              <Text style={styles.sectionTitle}>Message to Cook (Optional)</Text>
              <Input
                placeholder="Let the cook know why you're cancelling..."
                value={cancellationData.message}
                onChangeText={(text) => setCancellationData(prev => ({ ...prev, message: text }))}
                multiline
                numberOfLines={3}
                style={styles.messageInput}
              />
            </View>

            <View style={styles.warningSection}>
              <AlertTriangle size={20} color={theme.colors.warning} />
              <Text style={styles.warningText}>
                The cook will be notified immediately about this cancellation. You will receive a full refund within 3-5 business days.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowCancelModal(false)}
              style={styles.modalCancelButton}
            >
              Keep Order
            </Button>
            <Button
              mode="contained"
              onPress={confirmCancelOrder}
              style={[styles.modalSubmitButton, { backgroundColor: theme.colors.error }]}
            >
              Cancel Order
            </Button>
          </View>
        </View>
      </Modal>

      {/* Report Issue Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report an Issue</Text>
            <TouchableOpacity 
              onPress={() => setShowReportModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedOrderForReport && (
              <View style={styles.orderSummary}>
                <Text style={styles.orderSummaryTitle}>Order Details</Text>
                <Text style={styles.orderSummaryText}>
                  {selectedOrderForReport.items[0]?.title} by {selectedOrderForReport.cookName}
                </Text>
                <Text style={styles.orderSummaryText}>
                  Order #{selectedOrderForReport.trackingNumber}
                </Text>
              </View>
            )}

            <View style={styles.issueTypeSection}>
              <Text style={styles.sectionTitle}>What's the issue?</Text>
              <View style={styles.issueTypes}>
                {issueTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.issueTypeOption,
                      reportIssue.issueType === type && styles.issueTypeOptionSelected
                    ]}
                    onPress={() => setReportIssue(prev => ({ ...prev, issueType: type }))}
                  >
                    <Text style={[
                      styles.issueTypeText,
                      reportIssue.issueType === type && styles.issueTypeTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Describe the issue</Text>
              <Input
                placeholder="Please provide more details about the issue..."
                value={reportIssue.description}
                onChangeText={(text) => setReportIssue(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                style={styles.descriptionInput}
              />
            </View>

            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>How should we contact you?</Text>
              <View style={styles.contactOptions}>
                <TouchableOpacity
                  style={[
                    styles.contactOption,
                    reportIssue.contactMethod === 'email' && styles.contactOptionSelected
                  ]}
                  onPress={() => setReportIssue(prev => ({ ...prev, contactMethod: 'email' }))}
                >
                  <Text style={[
                    styles.contactOptionText,
                    reportIssue.contactMethod === 'email' && styles.contactOptionTextSelected
                  ]}>
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.contactOption,
                    reportIssue.contactMethod === 'phone' && styles.contactOptionSelected
                  ]}
                  onPress={() => setReportIssue(prev => ({ ...prev, contactMethod: 'phone' }))}
                >
                  <Text style={[
                    styles.contactOptionText,
                    reportIssue.contactMethod === 'phone' && styles.contactOptionTextSelected
                  ]}>
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowReportModal(false)}
              style={styles.modalCancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={submitReportIssue}
              style={styles.modalSubmitButton}
            >
              Submit Report
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Main component
export default function OrdersScreen() {
  const { user } = useAuth();

  // Show cook interface for cooks, customer interface for customers
  if (user?.isCook) {
    return <CookOrdersInterface />;
  }

  return <CustomerOrdersInterface />;
}

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
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
    marginTop: theme.spacing.md,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    opacity: 1,
    fontFamily: 'Inter-Bold',
  },
  ordersList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: 18,
    color: theme.colors.onSurface,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  startOrderingButton: {
    paddingHorizontal: 20,
  },
  orderCard: {
    marginBottom: 15,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    paddingBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  cookName: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
    marginBottom: 5,
  },
  trackingNumber: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  statusChip: {
    marginLeft: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  orderDetails: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    flex: 1,
    textAlign: 'right',
  },
  instructionsSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  instructionsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  itemsSection: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: 15,
  },
  itemsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
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
  cancellationInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  cancellationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: theme.colors.error,
    marginBottom: 4,
  },
  cancellationReason: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  cancellationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  cancelButton: {
    borderColor: theme.colors.error,
  },
  deliveryNote: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  deliveryNoteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
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
  // Modal Styles
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
  orderSummary: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  orderSummaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  reasonSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  reasonOptions: {
    gap: theme.spacing.md,
  },
  reasonOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  reasonOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceVariant,
  },
  reasonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  reasonTextSelected: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  messageSection: {
    marginBottom: theme.spacing.xl,
  },
  messageInput: {
    marginBottom: 0,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  issueTypeSection: {
    marginBottom: theme.spacing.xl,
  },
  issueTypes: {
    gap: theme.spacing.md,
  },
  issueTypeOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  issueTypeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceVariant,
  },
  issueTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  issueTypeTextSelected: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  descriptionSection: {
    marginBottom: theme.spacing.xl,
  },
  descriptionInput: {
    marginBottom: 0,
  },
  contactSection: {
    marginBottom: theme.spacing.xl,
  },
  contactOptions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  contactOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  contactOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceVariant,
  },
  contactOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  contactOptionTextSelected: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
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
  modalSubmitButton: {
    flex: 1,
  },
});