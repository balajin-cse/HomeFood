import React, { useState } from 'react';
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
import { ArrowLeft, Clock, Star, RotateCcw } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { theme } from '@/constants/theme';
import { format } from 'date-fns';
import { useLocalSearchParams, Link } from 'expo-router';
import { Alert, Modal, Image, ActivityIndicator, X } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderHistoryItem {
  id: string;
  foodTitle: string;
  cookName: string;
  quantity: number;
  totalPrice: number;
  status: 'delivered' | 'cancelled';
  orderDate: string | Date;
  rating?: number;
  image: string;
}

interface Review {
  orderId: string;
  rating: number;
  comment: string;
  date: string;
}

export default function OrderHistoryScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { orders, refreshOrders, refreshing } = useOrders();
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load saved reviews on mount
  useEffect(() => {
    loadReviews();
    
    // Check if we need to highlight an order for rating
    if (params.highlightOrderId && params.action === 'rate') {
      const orderToHighlight = completedOrders.find(
        order => order.id === params.highlightOrderId
      );
      
      if (orderToHighlight && orderToHighlight.status === 'delivered') {
        // Only open review modal for delivered orders
        setTimeout(() => {
          handleWriteReview(orderToHighlight);
        }, 500); // Small delay to ensure component is fully mounted
      }
    }
  }, []);
  
  const loadReviews = async () => {
    try {
      const savedReviews = await AsyncStorage.getItem('orderReviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };
  
  // Filter to get only completed or cancelled orders
  const completedOrders = orders.length > 0 ? orders
    .filter(order => ['delivered', 'cancelled'].includes(order.status))
    .map(order => ({
      id: order.orderId,
      foodTitle: order.items[0]?.title || 'Order',
      cookName: order.cookName,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status as 'delivered' | 'cancelled',
      originalOrderId: order.orderId,
      originalItems: order.items,
      cookId: order.cookId,
      cookId: order.cookId,
      hasReview: false, // TODO: Implement review tracking
      orderDate: order.orderDate,
      image: order.items[0]?.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    })) : [];

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
  
  const handleOrderAgain = (order: OrderHistoryItem) => {
    if (!order.originalItems || order.originalItems.length === 0) {
      Alert.alert('Error', 'Could not find the original order items.');
      return;
    }
    
    try {
      // Add each item back to cart
      order.originalItems.forEach(item => {
        addToCart(
          {
            foodId: item.id,
            title: item.title,
            description: '',
            price: item.price,
            image: item.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
            cookId: order.cookId,
            cookName: order.cookName,
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
    } catch (error) {
      console.error('Error adding items to cart:', error);
      Alert.alert('Error', 'There was a problem adding these items to your cart.');
    }
  };
  
  const handleWriteReview = (order: OrderHistoryItem) => {
    if (order.status !== 'delivered') {
      Alert.alert('Info', 'You can only review delivered orders.');
      return;
    }

    // Check if order already has a review
    const existingReview = reviews.find(r => r.orderId === order.id);
    if (existingReview) {
      Alert.alert(
        'Review Exists', 
        'You have already reviewed this order.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedOrder(order);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const saveReview = async () => {
    if (!selectedOrder || !reviewComment.trim()) {
      Alert.alert('Error', 'Please add a comment to your review.');
      return;
    }

    setSubmittingReview(true);

    try {
      // Create new review
      const newReview: Review = {
        orderId: selectedOrder.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        date: new Date().toISOString()
      };

      // Add to existing reviews
      const updatedReviews = [...reviews, newReview];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('orderReviews', JSON.stringify(updatedReviews));
      
      // Update state
      setReviews(updatedReviews);
      
      // Close modal and show success message
      setShowReviewModal(false);
      
      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. It helps other customers find great home cooks.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving review:', error);
      Alert.alert('Error', 'There was a problem saving your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
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
            View {completedOrders.length} past orders
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
        {completedOrders.length === 0 ? (
          <Card style={styles.emptyState}>
            <Clock size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Order History</Text>
            <Text style={styles.emptyText}>
              Your completed orders will appear here
            </Text>
          </Card>
        ) : (
          <View style={styles.ordersList}>
            {completedOrders.map((order) => (
              <Card key={order.id} style={[styles.orderCard, order.status === 'cancelled' && styles.cancelledCard]}>
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
                    
                    {/* Show if order has a review */}
                    {reviews.some(review => review.orderId === order.id) && (
                      <View style={styles.ratingSection}>
                        <Text style={styles.ratingLabel}>Your rating:</Text>
                        <View style={styles.stars}>
                          {renderStars(reviews.find(review => review.orderId === order.id)?.rating || 5)}
                        </View>
                      </View>
                    )}
                    
                    <View style={styles.orderActions}>
                      {order.status === 'delivered' && (
                        <>
                          <Button
                            title="Order Again"
                            variant="outline"
                            onPress={() => handleOrderAgain(order)}
                            style={[styles.actionButton, { flex: 1 }]}
                          />
                          {!reviews.some(review => review.orderId === order.id) && (
                            <Button
                              title="Write Review"
                              onPress={() => handleWriteReview(order)}
                              style={[styles.actionButton, { flex: 1 }]}
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

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <TouchableOpacity 
              onPress={() => setShowReviewModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.reviewOrderInfo}>
                  <Text style={styles.reviewOrderTitle}>{selectedOrder.foodTitle}</Text>
                  <Text style={styles.reviewOrderCook}>by {selectedOrder.cookName}</Text>
                  <Text style={styles.reviewOrderDate}>
                    {new Date(selectedOrder.orderDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.ratingSelector}>
                  <Text style={styles.ratingTitle}>How would you rate this order?</Text>
                  <View style={styles.starSelector}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity 
                        key={star}
                        onPress={() => setReviewRating(star)}
                        style={styles.starButton}
                      >
                        <Star
                          size={32}
                          color={star <= reviewRating ? theme.colors.secondary : theme.colors.outline}
                          fill={star <= reviewRating ? theme.colors.secondary : 'transparent'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.commentSection}>
                  <Text style={styles.commentTitle}>Share your experience</Text>
                  <Input
                    placeholder="What did you like or dislike about this order?"
                    multiline
                    numberOfLines={5}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    style={styles.commentInput}
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowReviewModal(false)}
              style={styles.modalActionButton}
            />
            <Button
              title={submittingReview ? "Submitting..." : "Submit Review"}
              onPress={saveReview}
              disabled={submittingReview || !reviewComment.trim()}
              style={styles.modalActionButton}
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
  cancelledCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
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
  // Modal styles
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
  reviewOrderInfo: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  reviewOrderTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  reviewOrderCook: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  reviewOrderDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  ratingSelector: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  starSelector: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  starButton: {
    padding: theme.spacing.sm,
  },
  commentSection: {
    marginBottom: theme.spacing.xl,
  },
  commentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  commentInput: {
    height: 120,
  },
  modalActions: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  modalActionButton: {
    flex: 1,
  },
});