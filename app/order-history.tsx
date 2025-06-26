import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Star, RotateCcw } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { format } from 'date-fns';

interface OrderHistoryItem {
  id: string;
  foodTitle: string;
  cookName: string;
  quantity: number;
  totalPrice: number;
  status: 'delivered' | 'cancelled';
  orderDate: Date;
  rating?: number;
  image: string;
}

export default function OrderHistoryScreen() {
  const [orders] = useState<OrderHistoryItem[]>([
    {
      id: '1',
      foodTitle: 'Homemade Pasta Carbonara',
      cookName: 'Maria Rodriguez',
      quantity: 2,
      totalPrice: 33.98,
      status: 'delivered',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rating: 5,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      foodTitle: 'Fresh Avocado Toast',
      cookName: 'Sarah Johnson',
      quantity: 1,
      totalPrice: 12.50,
      status: 'delivered',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      rating: 4,
      image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      foodTitle: 'Thai Green Curry',
      cookName: 'Siriporn Nakamura',
      quantity: 1,
      totalPrice: 17.50,
      status: 'delivered',
      orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '4',
      foodTitle: 'BBQ Pulled Pork Sandwich',
      cookName: 'Jake Williams',
      quantity: 2,
      totalPrice: 27.98,
      status: 'cancelled',
      orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ]);

  const getStatusColor = (status: OrderHistoryItem['status']) => {
    switch (status) {
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? theme.colors.secondary : theme.colors.outline}
        fill={index < rating ? theme.colors.secondary : 'transparent'}
      />
    ));
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
          <Clock size={32} color="white" />
          <Text style={styles.headerTitle}>Order History</Text>
          <Text style={styles.headerSubtitle}>
            View your past orders and reorder favorites
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <Card style={styles.emptyState}>
            <Clock size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Order History</Text>
            <Text style={styles.emptyText}>
              Your completed orders will appear here
            </Text>
          </Card>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <View style={styles.orderContent}>
                  <View style={styles.orderImage}>
                    <Text style={styles.orderImagePlaceholder}>🍽️</Text>
                  </View>
                  
                  <View style={styles.orderInfo}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderTitle} numberOfLines={1}>
                        {order.foodTitle}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>
                          {order.status === 'delivered' ? 'Delivered' : 'Cancelled'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.cookName}>by {order.cookName}</Text>
                    
                    <View style={styles.orderMeta}>
                      <Text style={styles.orderDate}>
                        {format(order.orderDate, 'MMM dd, yyyy')}
                      </Text>
                      <Text style={styles.orderQuantity}>
                        Qty: {order.quantity}
                      </Text>
                      <Text style={styles.orderPrice}>
                        ${order.totalPrice.toFixed(2)}
                      </Text>
                    </View>
                    
                    {order.rating && (
                      <View style={styles.ratingSection}>
                        <Text style={styles.ratingLabel}>Your rating:</Text>
                        <View style={styles.stars}>
                          {renderStars(order.rating)}
                        </View>
                      </View>
                    )}
                    
                    <View style={styles.orderActions}>
                      {order.status === 'delivered' && (
                        <>
                          <Button
                            title="Order Again"
                            variant="outline"
                            size="small"
                            style={styles.actionButton}
                          />
                          {!order.rating && (
                            <Button
                              title="Write Review"
                              size="small"
                              style={styles.actionButton}
                            />
                          )}
                        </>
                      )}
                    </View>
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
  },
  ordersList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  orderCard: {
    padding: theme.spacing.lg,
  },
  orderContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderImagePlaceholder: {
    fontSize: 24,
  },
  orderInfo: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
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
  cookName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  orderQuantity: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  orderPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  orderActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});