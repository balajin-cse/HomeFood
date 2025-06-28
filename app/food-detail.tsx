import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Heart, Star, MapPin, Clock, Plus, Minus, ShoppingBag, X, MessageCircle, Send, Award } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '@/constants/theme';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  cookId: string;
  cookName: string;
  cookRating: number;
  distance: number;
  prepTime: number;
  tags: string[];
}

interface CookProfile {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalReviews: number;
  yearsExperience: number;
  specialties: string[];
  totalOrders: number;
  responseTime: string;
  isVerified: boolean;
  badges: string[];
  joinedDate: string;
  bio: string;
  location: string;
  distance: number;
}

interface FoodComment {
  id: string;
  foodId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  rating: number;
  timestamp: string;
}

export default function FoodDetailScreen() {
  const { foodItem } = useLocalSearchParams();
  const { addToCart, getCartItemQuantity } = useCart();
  const { user } = useAuth();
  const { address } = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showCookProfile, setShowCookProfile] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(address || '');
  const [cookProfile, setCookProfile] = useState<CookProfile | null>(null);
  const [comments, setComments] = useState<FoodComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

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

  useEffect(() => {
    loadCookProfile();
    loadComments();
  }, []);

  const loadCookProfile = () => {
    // Mock cook profiles data - in a real app, this would come from an API
    const mockCooks: { [key: string]: CookProfile } = {
      'ck-maria': {
        id: 'ck-maria',
        name: 'Maria Rodriguez',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.9,
        totalReviews: 247,
        yearsExperience: 8,
        specialties: ['Italian', 'Mediterranean', 'Pasta'],
        totalOrders: 1250,
        responseTime: '< 15 min',
        isVerified: true,
        badges: ['Top Chef', 'Fast Response', 'Customer Favorite'],
        joinedDate: '2019-03-15',
        bio: 'Passionate Italian chef with 8 years of experience. I learned traditional recipes from my nonna in Tuscany and love sharing authentic flavors with my community.',
        location: 'North Beach, SF',
        distance: 1.2,
      },
      'ck-sarah': {
        id: 'ck-sarah',
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.7,
        totalReviews: 189,
        yearsExperience: 5,
        specialties: ['Healthy', 'Vegan', 'Organic'],
        totalOrders: 890,
        responseTime: '< 20 min',
        isVerified: true,
        badges: ['Healthy Choice', 'Eco-Friendly'],
        joinedDate: '2020-07-22',
        bio: 'Certified nutritionist and plant-based chef. I create delicious, healthy meals using locally sourced organic ingredients.',
        location: 'Mission District, SF',
        distance: 0.8,
      },
      'ck-david': {
        id: 'ck-david',
        name: 'David Chen',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.8,
        totalReviews: 312,
        yearsExperience: 12,
        specialties: ['Asian Fusion', 'Seafood', 'Gourmet'],
        totalOrders: 1580,
        responseTime: '< 10 min',
        isVerified: true,
        badges: ['Master Chef', 'Premium Quality', 'Lightning Fast'],
        joinedDate: '2018-01-10',
        bio: 'Former Michelin-starred restaurant chef now bringing gourmet experiences to home dining. Specializing in fresh seafood and Asian fusion.',
        location: 'Chinatown, SF',
        distance: 2.1,
      },
      'ck-kenji': {
        id: 'ck-kenji',
        name: 'Kenji Tanaka',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.9,
        totalReviews: 156,
        yearsExperience: 15,
        specialties: ['Japanese', 'Ramen', 'Traditional'],
        totalOrders: 720,
        responseTime: '< 25 min',
        isVerified: true,
        badges: ['Authentic Master', 'Traditional Recipes'],
        joinedDate: '2021-02-14',
        bio: 'Third-generation ramen master from Tokyo. I bring authentic Japanese flavors and traditional techniques to every bowl.',
        location: 'Japantown, SF',
        distance: 1.5,
      },
    };

    const cook = mockCooks[item.cookId];
    if (cook) {
      setCookProfile(cook);
    }
  };

  const loadComments = async () => {
    try {
      const storedComments = await AsyncStorage.getItem(`comments_${item.id}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      } else {
        // Mock comments for demo
        const mockComments: FoodComment[] = [
          {
            id: '1',
            foodId: item.id,
            userId: 'user1',
            userName: 'Sarah M.',
            userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
            comment: 'Absolutely delicious! The pasta was perfectly cooked and the sauce was incredible. Will definitely order again!',
            rating: 5,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            foodId: item.id,
            userId: 'user2',
            userName: 'Mike R.',
            userAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
            comment: 'Great flavors and generous portion. Arrived hot and fresh. Highly recommend!',
            rating: 4,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setComments(mockComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const saveComments = async (updatedComments: FoodComment[]) => {
    try {
      await AsyncStorage.setItem(`comments_${item.id}`, JSON.stringify(updatedComments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const handleViewProfile = () => {
    if (cookProfile) {
      setShowCookProfile(true);
    }
  };

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
        cookId: item.cookId,
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

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add a comment.');
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Comment Required', 'Please enter a comment.');
      return;
    }

    const comment: FoodComment = {
      id: Date.now().toString(),
      foodId: item.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.profileImage || `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`,
      comment: newComment.trim(),
      rating: newRating,
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    await saveComments(updatedComments);

    setNewComment('');
    setNewRating(5);
    
    Alert.alert('Comment Added', 'Your comment has been added successfully!');
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStars = (rating: number, size: number = 14) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={size}
        color={index < Math.floor(rating) ? theme.colors.secondary : theme.colors.outline}
        fill={index < Math.floor(rating) ? theme.colors.secondary : 'transparent'}
      />
    ));
  };

  const renderRatingSelector = () => {
    return (
      <View style={styles.ratingSelector}>
        <Text style={styles.ratingSelectorLabel}>Your Rating:</Text>
        <View style={styles.ratingStars}>
          {Array.from({ length: 5 }, (_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setNewRating(index + 1)}
            >
              <Star
                size={24}
                color={index < newRating ? theme.colors.secondary : theme.colors.outline}
                fill={index < newRating ? theme.colors.secondary : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
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
              <Image 
                source={{ 
                  uri: cookProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' 
                }} 
                style={styles.cookAvatar} 
              />
              <View style={styles.cookDetails}>
                <View style={styles.cookNameRow}>
                  <Text style={styles.cookName}>{item.cookName}</Text>
                  {cookProfile?.isVerified && (
                    <Award size={16} color={theme.colors.primary} />
                  )}
                </View>
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
              onPress={handleViewProfile}
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

        {/* Comments Section */}
        <Card style={styles.commentsCard}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
            <TouchableOpacity 
              style={styles.addCommentButton}
              onPress={() => setShowCommentsModal(true)}
            >
              <MessageCircle size={20} color={theme.colors.primary} />
              <Text style={styles.addCommentText}>Add Comment</Text>
            </TouchableOpacity>
          </View>
          
          {comments.slice(0, 2).map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentHeader}>
                <Image 
                  source={{ 
                    uri: comment.userAvatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' 
                  }} 
                  style={styles.commentAvatar} 
                />
                <View style={styles.commentUserInfo}>
                  <Text style={styles.commentUserName}>{comment.userName}</Text>
                  <View style={styles.commentRating}>
                    {renderStars(comment.rating)}
                  </View>
                </View>
                <Text style={styles.commentTime}>
                  {new Date(comment.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.commentText}>{comment.comment}</Text>
            </View>
          ))}

          {comments.length > 2 && (
            <TouchableOpacity 
              style={styles.viewAllCommentsButton}
              onPress={() => setShowCommentsModal(true)}
            >
              <Text style={styles.viewAllCommentsText}>
                View all {comments.length} comments
              </Text>
            </TouchableOpacity>
          )}

          {comments.length === 0 && (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>No comments yet. Be the first to share your thoughts!</Text>
            </View>
          )}
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

      {/* Cook Profile Modal */}
      <Modal
        visible={showCookProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCookProfile(false)}
      >
        {cookProfile && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cook Profile</Text>
              <TouchableOpacity 
                onPress={() => setShowCookProfile(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Cook Header */}
              <View style={styles.cookProfileHeader}>
                <Image source={{ uri: cookProfile.avatar }} style={styles.cookProfileAvatar} />
                <View style={styles.cookProfileInfo}>
                  <View style={styles.cookProfileNameRow}>
                    <Text style={styles.cookProfileName}>{cookProfile.name}</Text>
                    {cookProfile.isVerified && (
                      <Award size={20} color={theme.colors.primary} />
                    )}
                  </View>
                  <Text style={styles.cookProfileLocation}>{cookProfile.location}</Text>
                  <View style={styles.cookProfileRating}>
                    <View style={styles.ratingStars}>
                      {renderStars(cookProfile.rating, 16)}
                    </View>
                    <Text style={styles.cookProfileRatingText}>
                      {cookProfile.rating} ({cookProfile.totalReviews} reviews)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cook Stats */}
              <View style={styles.cookStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{cookProfile.yearsExperience}</Text>
                  <Text style={styles.statLabel}>Years Experience</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{cookProfile.totalOrders}</Text>
                  <Text style={styles.statLabel}>Total Orders</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{cookProfile.responseTime}</Text>
                  <Text style={styles.statLabel}>Response Time</Text>
                </View>
              </View>

              {/* Badges */}
              <View style={styles.cookBadges}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.badgesList}>
                  {cookProfile.badges.map((badge, index) => (
                    <View key={index} style={styles.achievementBadge}>
                      <Award size={16} color={theme.colors.primary} />
                      <Text style={styles.achievementText}>{badge}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Specialties */}
              <View style={styles.cookSpecialties}>
                <Text style={styles.sectionTitle}>Specialties</Text>
                <View style={styles.specialtiesList}>
                  {cookProfile.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Bio */}
              <View style={styles.cookBio}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{cookProfile.bio}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.cookActions}>
                <Button
                  title="View Menu"
                  onPress={() => {
                    setShowCookProfile(false);
                    router.push({
                      pathname: '/(tabs)',
                      params: { cookId: cookProfile.id }
                    });
                  }}
                  style={styles.actionButton}
                />
                <Button
                  title="Message Cook"
                  variant="outline"
                  onPress={() => {
                    // Open messaging
                  }}
                  style={styles.actionButton}
                />
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity 
              onPress={() => setShowCommentsModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Add Comment Section */}
            {user && (
              <Card style={styles.addCommentCard}>
                <Text style={styles.addCommentCardTitle}>Share your thoughts</Text>
                
                {renderRatingSelector()}
                
                <Input
                  placeholder="Write your comment about this dish..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  numberOfLines={4}
                  style={styles.commentInput}
                />
                
                <Button
                  title="Post Comment"
                  onPress={handleAddComment}
                  style={styles.postCommentButton}
                />
              </Card>
            )}

            {/* All Comments */}
            <View style={styles.allComments}>
              {comments.map((comment) => (
                <Card key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Image 
                      source={{ 
                        uri: comment.userAvatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' 
                      }} 
                      style={styles.commentAvatar} 
                    />
                    <View style={styles.commentUserInfo}>
                      <Text style={styles.commentUserName}>{comment.userName}</Text>
                      <View style={styles.commentRating}>
                        {renderStars(comment.rating)}
                      </View>
                    </View>
                    <Text style={styles.commentTime}>
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </Card>
              ))}

              {comments.length === 0 && (
                <View style={styles.noComments}>
                  <MessageCircle size={48} color={theme.colors.onSurfaceVariant} />
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                  <Text style={styles.noCommentsSubtext}>Be the first to share your thoughts about this dish!</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

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
    marginRight: theme.spacing.md,
  },
  cookDetails: {
    flex: 1,
  },
  cookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  cookName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
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
  commentsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  addCommentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  comment: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  commentRating: {
    flexDirection: 'row',
    gap: 2,
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  viewAllCommentsButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  viewAllCommentsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  noCommentsText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  noCommentsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
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
  // Cook Profile Modal Styles
  cookProfileHeader: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  cookProfileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cookProfileInfo: {
    flex: 1,
  },
  cookProfileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  cookProfileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  cookProfileLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
  },
  cookProfileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cookProfileRatingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  cookStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cookBadges: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  achievementText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  cookSpecialties: {
    marginBottom: theme.spacing.xl,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  specialtyTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  specialtyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  cookBio: {
    marginBottom: theme.spacing.xl,
  },
  bioText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  cookActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  // Comments Modal Styles
  addCommentCard: {
    marginBottom: theme.spacing.lg,
  },
  addCommentCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  ratingSelector: {
    marginBottom: theme.spacing.lg,
  },
  ratingSelectorLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  commentInput: {
    marginBottom: theme.spacing.lg,
  },
  postCommentButton: {
    alignSelf: 'flex-start',
  },
  allComments: {
    gap: theme.spacing.md,
  },
  commentCard: {
    padding: theme.spacing.md,
  },
  // Add to Cart Modal Styles
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