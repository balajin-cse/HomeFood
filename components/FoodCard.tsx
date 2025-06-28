import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MapPin, Clock, Award, Users, Heart } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useFavorites } from '@/contexts/FavoritesContext';
import { theme } from '@/constants/theme';

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
  mealType: 'breakfast' | 'lunch' | 'dinner';
  tags: string[];
  foodRating: number;
  totalFoodReviews: number;
  isPopular: boolean;
  isNew: boolean;
  allergens: string[];
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface FoodCardProps {
  item: FoodItem;
  cook?: CookProfile;
  onPress: () => void;
  onCookPress?: () => void;
}

export function FoodCard({ item, cook, onPress, onCookPress }: FoodCardProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isItemFavorite = isFavorite(item.id);

  const handleFavoritePress = async () => {
    try {
      if (isItemFavorite) {
        await removeFromFavorites(item.id);
      } else {
        await addToFavorites({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          image: item.image,
          cookId: item.cookId,
          cookName: item.cookName,
          cookRating: item.cookRating,
          distance: item.distance,
          prepTime: item.prepTime,
          tags: item.tags,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={styles.card}>
        {/* Food Image with Badges */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.badges}>
            {item.isPopular && (
              <View style={[styles.badge, styles.popularBadge]}>
                <Text style={styles.badgeText}>Popular</Text>
              </View>
            )}
            {item.isNew && (
              <View style={[styles.badge, styles.newBadge]}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.heartButton} onPress={handleFavoritePress}>
            <Heart 
              size={20} 
              color={isItemFavorite ? theme.colors.error : "white"} 
              fill={isItemFavorite ? theme.colors.error : "transparent"}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {/* Food Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          
          {/* Food Rating */}
          <View style={styles.foodRating}>
            <View style={styles.ratingStars}>
              {renderStars(item.foodRating)}
            </View>
            <Text style={styles.ratingText}>
              {item.foodRating} ({item.totalFoodReviews} reviews)
            </Text>
          </View>
          
          {/* Cook Info */}
          <TouchableOpacity 
            style={styles.cookSection}
            onPress={onCookPress}
          >
            <Image 
              source={{ uri: cook?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }} 
              style={styles.cookAvatar} 
            />
            <View style={styles.cookInfo}>
              <View style={styles.cookNameRow}>
                <Text style={styles.cookName}>{item.cookName}</Text>
                {cook?.isVerified && (
                  <Award size={14} color={theme.colors.primary} />
                )}
              </View>
              <View style={styles.cookRating}>
                <Star size={12} color={theme.colors.secondary} fill={theme.colors.secondary} />
                <Text style={styles.cookRatingText}>{item.cookRating}</Text>
                <Text style={styles.cookExperience}>
                  • {cook?.yearsExperience || 0}y exp
                </Text>
              </View>
            </View>
            {onCookPress && (
              <Text style={styles.viewProfile}>View →</Text>
            )}
          </TouchableOpacity>
          
          {/* Meta Info */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{item.distance}km</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{item.prepTime}min</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{cook?.totalOrders || 0} orders</Text>
            </View>
          </View>
          
          {/* Tags */}
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  badges: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  popularBadge: {
    backgroundColor: theme.colors.secondary,
  },
  newBadge: {
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  heartButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  foodRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  cookSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  cookAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cookInfo: {
    flex: 1,
  },
  cookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  cookName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  cookRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  cookRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  cookExperience: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  viewProfile: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  meta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
});