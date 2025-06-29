import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Clock, MapPin, Phone, RotateCcw } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { theme } from '@/constants/theme';

export default function OrdersScreen() {
  const { user } = useAuth();
  const { 
    orders, 
    loading, 
    refreshing, 
    refreshOrders 
  } = useOrders();

  // Filter orders for customer view (exclude cook orders)
  const customerOrders = orders.filter(order => !user?.isCook || order.customerName === user?.name);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.primary;
      case 'preparing':
        return theme.colors.secondary;
      case 'ready':
        return theme.colors.success;
      case 'picked_up':
        return theme.colors.secondary;
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: string) => {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Clock size={32} color="white" />
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            Track your current orders and deliveries
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshOrders} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : customerOrders.length === 0 ? (
          <Card style={styles.emptyState}>
            <Clock size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Active Orders</Text>
            <Text style={styles.emptyText}>
              Your current orders will appear here
            </Text>
            <Button
              title="Browse Food"
              onPress={() => router.push('/(tabs)/')}
              style={styles.browseButton}
            />
          </Card>
        ) : (
          <View style={styles.ordersList}>
            {customerOrders.map((order) => (
              <Card key={order.orderId} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.trackingNumber}>
                      Order #{order.trackingNumber}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderContent}>
                  {order.items.map((item, index) => (
                    <View key={`${item.id}-${index}`} style={styles.orderItem}>
                      <View style={styles.itemImage}>
                        <Text style={styles.itemImagePlaceholder}>🍽️</Text>
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.cookName}>by {order.cookName}</Text>
                        <Text style={styles.itemPrice}>
                          ${item.price.toFixed(2)} × {item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color={theme.colors.onSurfaceVariant} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Clock size={16} color={theme.colors.onSurfaceVariant} />
                    <Text style={styles.detailText}>
                      Est. delivery: {order.deliveryTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.totalSection}>
                    <Text style={styles.totalText}>
                      Total: ${order.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.orderActions}>
                    <Button
                      title="Track Order"
                      variant="outline"
                      size="small"
                      onPress={() => router.push({
                        pathname: '/order-tracking',
                        params: {
                          orderId: order.orderId,
                          trackingNumber: order.trackingNumber,
                          foodTitle: order.items[0]?.title || 'Order',
                          cookName: order.cookName,
                          quantity: order.quantity.toString(),
                          totalPrice: order.totalPrice.toString(),
                        }
                      })}
                      style={styles.actionButton}
                    />
                    <Button
                      title="Contact Cook"
                      size="small"
                      style={styles.actionButton}
                    />
                  </View>
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
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
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
    marginHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  browseButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  ordersList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  orderCard: {
    padding: theme.spacing.lg,
  },
  orderHeader: {
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  orderContent: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImagePlaceholder: {
    fontSize: 20,
  },
  itemDetails: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  cookName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  itemPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  orderDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  orderFooter: {
    gap: theme.spacing.md,
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  orderActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});