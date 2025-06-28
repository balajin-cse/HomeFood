import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Star, MapPin, Clock, Plus, Minus, ShoppingBag, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { theme } from '@/constants/theme';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  cookName: string;
  cookRating: number;
  distance: number;
  prepTime: number;
  tags: string[];
}

export default function FoodDetailScreen() {
  const { foodItem } = useLocalSearchParams();
  const { addToCart, getCartItemQuantity } = useCart();
  const { user } = useAuth();
  const { address } = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(address || '');

  if (!foodItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Food item not found</Text>
      </View>
    );
  }

  const item: FoodItem = JSON.parse(foodItem as string);
  const totalPrice = item.price * quantity;
  const currentCartQuantity = getCartItemQuantity(item.id);

  const handleAddToCart = () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setShowAddToCartModal(true);
  };

  const confirmAddToCart = () => {
    if (!selectedAddress) {
      Alert.alert('Delivery Address Required', 'Please confirm your delivery address before adding to cart.');
      return;
    }

    addToCart(
      {
        foodId: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        image: item.image,
        cookId: '1', // This should come from the item data
        cookName: item.cookName,
      },
      quantity,
      specialInstructions
    );

    setShowAddToCartModal(false);
    
    Alert.alert(
      'Added to Cart!',
      `${quantity}x ${item.title} has been added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') }
      ]
    );

    // Reset form
    setQuantity(1);
    setSpecialInstructions('');
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Heart 
            size={24} 
            color={isFavorite ? theme.colors.error : "white"} 
            fill={isFavorite ? theme.colors.error : "transparent"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Food Image */}
        <Image source={{ uri: item.image }} style={styles.foodImage} />

        {/* Food Info */}
        <Card style={styles.infoCard}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>

          <Text style={styles.description}>{item.description}</Text>

          {/* Cook Info */}
          <View style={styles.cookSection}>
            <View style={styles.cookInfo}>
              <View style={styles.cookAvatar}>
                <Text style={styles.cookInitial}>{item.cookName.charAt(0)}</Text>
              </View>
              <View style={styles.cookDetails}>
                <Text style={styles.cookName}>{item.cookName}</Text>
                <View style={styles.rating}>
                  <Star size={16} color={theme.colors.secondary} fill={theme.colors.secondary} />
                  <Text style={styles.ratingText}>{item.cookRating} rating</Text>
                </View>
              </View>
            </View>
            <Button
              title="View Profile"
              variant="outline"
              size="small"
              onPress={() => {}}
            />
          </View>

          {/* Meta Info */}
          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={styles.metaText}>{item.distance}km away</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.metaText}>{item.prepTime} min prep</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>Tags</Text>
            <View style={styles.tags}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Current Cart Status */}
          {currentCartQuantity > 0 && (
            <View style={styles.cartStatus}>
              <Text style={styles.cartStatusText}>
                {currentCartQuantity} in cart
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
                <Text style={styles.viewCartText}>View Cart →</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Reviews Section */}
        <Card style={styles.reviewsCard}>
          <Text style={styles.reviewsTitle}>Recent Reviews</Text>
          
          <View style={styles.review}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>Sarah M.</Text>
              <View style={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={14} 
                    color={theme.colors.secondary} 
                    fill={theme.colors.secondary} 
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>
              "Absolutely delicious! The pasta was perfectly cooked and the sauce was incredible. Will definitely order again!"
            </Text>
          </View>

          <View style={styles.review}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>Mike R.</Text>
              <View style={styles.reviewRating}>
                {[1, 2, 3, 4].map((star) => (
                  <Star 
                    key={star} 
                    size={14} 
                    color={theme.colors.secondary} 
                    fill={theme.colors.secondary} 
                  />
                ))}
                <Star size={14} color={theme.colors.outline} />
              </View>
            </View>
            <Text style={styles.reviewText}>
              "Great flavors and generous portion. Arrived hot and fresh. Highly recommend!"
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          title={`Add to Cart • $${item.price.toFixed(2)}`}
          onPress={handleAddToCart}
          size="large"
          style={styles.addToCartButton}
        />
      </View>

      {/* Add to Cart Modal */}
      <Modal
        visible={showAddToCartModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddToCartModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Cart</Text>
            <TouchableOpacity 
              onPress={() => setShowAddToCartModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Item Summary */}
            <Card style={styles.itemSummary}>
              <View style={styles.itemSummaryContent}>
                <Image source={{ uri: item.image }} style={styles.itemSummaryImage} />
                <View style={styles.itemSummaryDetails}>
                  <Text style={styles.itemSummaryTitle}>{item.title}</Text>
                  <Text style={styles.itemSummaryCook}>by {item.cookName}</Text>
                  <Text style={styles.itemSummaryPrice}>${item.price.toFixed(2)} each</Text>
                </View>
              </View>
            </Card>

            {/* Quantity Selection */}
            <Card style={styles.quantityCard}>
              <Text style={styles.quantityTitle}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                  onPress={decrementQuantity}
                  disabled={quantity === 1}
                >
                  <Minus size={20} color={quantity === 1 ? theme.colors.onSurfaceVariant : theme.colors.primary} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                >
                  <Plus size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.quantityTotal}>Total: ${totalPrice.toFixed(2)}</Text>
            </Card>

            {/* Delivery Address */}
            <Card style={styles.addressCard}>
              <Text style={styles.addressTitle}>Delivery Address</Text>
              <Input
                placeholder="Enter your delivery address"
                value={selectedAddress}
                onChangeText={setSelectedAddress}
                multiline
                numberOfLines={2}
                style={styles.addressInput}
              />
              <TouchableOpacity onPress={() => router.push('/delivery-address')}>
                <Text style={styles.changeAddressText}>Change Address</Text>
              </TouchableOpacity>
            </Card>

            {/* Special Instructions */}
            <Card style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Special Instructions (Optional)</Text>
              <Input
                placeholder="Any special requests for the cook..."
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
                style={styles.instructionsInput}
              />
            </Card>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowAddToCartModal(false)}
              style={styles.modalCancelButton}
            />
            <Button
              title={`Add ${quantity} to Cart • $${totalPrice.toFixed(2)}`}
              onPress={confirmAddToCart}
              style={styles.modalConfirmButton}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: theme.colors.error,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  foodImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  price: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  cookSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.outline,
  },
  cookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cookAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  cookInitial: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
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
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  metaSection: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  tagsSection: {
    marginBottom: theme.spacing.lg,
  },
  tagsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  cartStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  cartStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  viewCartText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  reviewsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  reviewsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  review: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  bottomAction: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  addToCartButton: {
    marginBottom: 0,
  },
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
  itemSummary: {
    marginBottom: theme.spacing.lg,
  },
  itemSummaryContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  itemSummaryImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  itemSummaryDetails: {
    flex: 1,
  },
  itemSummaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  itemSummaryCook: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  itemSummaryPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  quantityCard: {
    marginBottom: theme.spacing.lg,
  },
  quantityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
    borderColor: theme.colors.outline,
  },
  quantityText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    minWidth: 40,
    textAlign: 'center',
  },
  quantityTotal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  addressCard: {
    marginBottom: theme.spacing.lg,
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  addressInput: {
    marginBottom: theme.spacing.md,
  },
  changeAddressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  instructionsCard: {
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  instructionsInput: {
    marginBottom: 0,
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
  modalConfirmButton: {
    flex: 2,
  },
});