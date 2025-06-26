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
import { ArrowLeft, Heart, Star, MapPin, Clock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

interface FavoriteItem {
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

export default function FavoritesScreen() {
  const [favorites] = useState<FavoriteItem[]>([
    {
      id: '1',
      title: 'Homemade Pasta Carbonara',
      description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese',
      price: 16.99,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookName: 'Maria Rodriguez',
      cookRating: 4.9,
      distance: 1.2,
      prepTime: 25,
      tags: ['Italian', 'Pasta', 'Creamy'],
    },
    {
      id: '2',
      title: 'Artisan Avocado Toast',
      description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, and microgreens',
      price: 12.50,
      image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookName: 'Sarah Johnson',
      cookRating: 4.7,
      distance: 0.8,
      prepTime: 15,
      tags: ['Healthy', 'Vegetarian', 'Fresh'],
    },
    {
      id: '3',
      title: 'Thai Green Curry',
      description: 'Aromatic green curry with coconut milk, Thai basil, and jasmine rice',
      price: 17.50,
      image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookName: 'Siriporn Nakamura',
      cookRating: 4.7,
      distance: 1.9,
      prepTime: 30,
      tags: ['Thai', 'Spicy', 'Coconut'],
    },
  ]);

  const handleOrderNow = (item: FavoriteItem) => {
    router.push({
      pathname: '/food-detail',
      params: { foodItem: JSON.stringify(item) }
    });
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
          <Heart size={32} color="white" />
          <Text style={styles.headerTitle}>Favorites</Text>
          <Text style={styles.headerSubtitle}>
            Your saved dishes and favorite cooks
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <Card style={styles.emptyState}>
            <Heart size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
              Heart dishes you love to save them here for easy reordering
            </Text>
            <Button
              title="Discover Food"
              onPress={() => router.push('/(tabs)')}
              style={styles.discoverButton}
            />
          </Card>
        ) : (
          <View style={styles.favoritesList}>
            {favorites.map((item) => (
              <Card key={item.id} style={styles.favoriteCard}>
                <View style={styles.cardContent}>
                  <View style={styles.imageContainer}>
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imageEmoji}>🍽️</Text>
                    </View>
                    <TouchableOpacity style={styles.heartButton}>
                      <Heart size={20} color={theme.colors.error} fill={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                    
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <View style={styles.cookInfo}>
                      <Text style={styles.cookName}>by {item.cookName}</Text>
                      <View style={styles.rating}>
                        <Star size={14} color={theme.colors.secondary} fill={theme.colors.secondary} />
                        <Text style={styles.ratingText}>{item.cookRating}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.meta}>
                      <View style={styles.metaItem}>
                        <MapPin size={14} color={theme.colors.onSurfaceVariant} />
                        <Text style={styles.metaText}>{item.distance}km</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={theme.colors.onSurfaceVariant} />
                        <Text style={styles.metaText}>{item.prepTime}min</Text>
                      </View>
                    </View>
                    
                    <View style={styles.tags}>
                      {item.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <Button
                      title="Order Now"
                      onPress={() => handleOrderNow(item)}
                      size="small"
                      style={styles.orderButton}
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
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  discoverButton: {
    alignSelf: 'center',
  },
  favoritesList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  favoriteCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: {
    fontSize: 32,
  },
  heartButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  itemPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  cookInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cookName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
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
  orderButton: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
});