import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, TriangleAlert as AlertTriangle, MessageCircle, RefreshCw, Package } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/theme';

interface Order {
  orderId: string;
  trackingNumber: string;
  items: any[];
  cookName: string;
  totalPrice: number;
  quantity: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  deliveryInstructions?: string;
}

interface ReportIssueData {
  orderId: string;
  issueType: string;
  description: string;
  contactMethod: 'phone' | 'email';
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedOrderForReport, setSelectedOrderForReport] = useState<Order | null>(null);
  const [reportIssue, setReportIssue] = useState({
    issueType: '',
    description: '',
    contactMethod: 'email' as 'phone' | 'email',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Load orders from AsyncStorage
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      } else {
        // Fallback to mock data if no stored orders
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

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel your order for ${order.items[0]?.title}? This action cannot be undone.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update order status to cancelled
              const updatedOrders = orders.map(o => 
                o.orderId === order.orderId 
                  ? { ...o, status: 'cancelled' as const }
                  : o
              );
              
              setOrders(updatedOrders);
              await AsyncStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
              
              Alert.alert(
                'Order Cancelled',
                'Your order has been cancelled successfully. You will receive a refund within 3-5 business days.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          }
        }
      ]
    );
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
      // Create the issue report
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

      // Store the issue in AsyncStorage for tracking
      try {
        const existingIssues = await AsyncStorage.getItem('reportedIssues');
        const issues = existingIssues ? JSON.parse(existingIssues) : [];
        issues.unshift(issueReport); // Add to beginning of array
        
        await AsyncStorage.setItem('reportedIssues', JSON.stringify(issues));
      } catch (storageError) {
        console.error('Error saving issue report:', storageError);
      }

      setShowReportModal(false);
      setSelectedOrderForReport(null);

      Alert.alert(
        'Issue Reported',
        `Thank you for reporting this issue. Our support team will contact you via ${reportIssue.contactMethod} within 24 hours to resolve this matter. You can track the status of your report in your profile.`,
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
    // Navigate back to the food item or cook's menu
    router.push('/(tabs)');
  };

  const handleViewOrderDetails = (order: Order) => {
    // Navigate to order tracking page for detailed view
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
                        // Navigate to review page or show review modal
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
    fontFamily: 'Inter-Bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'Inter-Regular',
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
  issueTypeSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
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