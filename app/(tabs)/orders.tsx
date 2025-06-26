import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { format } from 'date-fns';
import { theme } from '@/constants/theme';

interface Order {
  id: string;
  foodTitle: string;
  cookName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryTime: string;
  address: string;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    // Mock data - replace with actual API call
    const mockOrders: Order[] = [
      {
        id: '1',
        foodTitle: 'Homemade Pasta Carbonara',
        cookName: 'Maria Rodriguez',
        quantity: 2,
        totalPrice: 25.98,
        status: 'preparing',
        orderDate: new Date(),
        deliveryTime: '12:30 PM - 1:00 PM',
        address: '123 Main St, City',
      },
      {
        id: '2',
        foodTitle: 'Fresh Avocado Toast',
        cookName: 'Sarah Johnson',
        quantity: 1,
        totalPrice: 8.50,
        status: 'delivered',
        orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        deliveryTime: '8:00 AM - 8:30 AM',
        address: '123 Main St, City',
      },
    ];
    setOrders(mockOrders);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
      case 'preparing':
        return theme.colors.primary;
      case 'ready':
        return theme.colors.secondary;
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
      case 'pending':
        return 'Pending Confirmation';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Being Prepared';
      case 'ready':
        return 'Ready for Pickup';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );

  const orderHistory = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const displayOrders = selectedTab === 'active' ? activeOrders : orderHistory;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
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
            <Text style={styles.emptyStateText}>
              {selectedTab === 'active' 
                ? 'No active orders' 
                : 'No order history'
              }
            </Text>
          </View>
        ) : (
          displayOrders.map((order) => (
            <Card key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>{order.foodTitle}</Text>
                  <Text style={styles.cookName}>by {order.cookName}</Text>
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
                  <Text style={styles.metaLabel}>Quantity:</Text>
                  <Text style={styles.metaValue}>{order.quantity}</Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Total:</Text>
                  <Text style={styles.metaValue}>${order.totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Order Date:</Text>
                  <Text style={styles.metaValue}>
                    {format(order.orderDate, 'MMM dd, yyyy')}
                  </Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Delivery Time:</Text>
                  <Text style={styles.metaValue}>{order.deliveryTime}</Text>
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaLabel}>Address:</Text>
                  <Text style={styles.metaValue}>{order.address}</Text>
                </View>
              </View>

              {selectedTab === 'active' && (
                <View style={styles.orderActions}>
                  {order.status === 'pending' && (
                    <Button
                      mode="outlined"
                      onPress={() => {/* Handle cancel */}}
                      style={styles.actionButton}
                    >
                      Cancel Order
                    </Button>
                  )}
                  <Button
                    mode="contained"
                    onPress={() => {/* Handle contact cook */}}
                    style={styles.actionButton}
                  >
                    Contact Cook
                  </Button>
                </View>
              )}

              {selectedTab === 'history' && order.status === 'delivered' && (
                <View style={styles.orderActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {/* Handle reorder */}}
                    style={styles.actionButton}
                  >
                    Order Again
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {/* Handle review */}}
                    style={styles.actionButton}
                  >
                    Write Review
                  </Button>
                </View>
              )}
            </Card>
          ))
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
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
  },
  emptyStateText: {
    fontSize: 18,
    color: theme.colors.onSurface,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
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
  },
  orderActions: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});