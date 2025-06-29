import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Star, Clock, MapPin } from 'lucide-react-native';

interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  cookName: string;
  cookId: string;
  cookRating: number;
  distance: number;
  prepTime: number;
  tags: string[];
}

export default function FavoritesScreen() {
  const [favorites] = useState<FavoriteItem[]>([
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440001',
      title: 'Homemade Pasta Carbonara',
      description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese',
      price: 16.99,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookName: 'Maria Rodriguez',
      cookId: '550e8400-e29b-41d4-a716-446655440001',
      cookRating: 4.9,
      distance: 1.2,
      prepTime: 25,
      tags: ['Italian', 'Pasta', 'Creamy'],
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440002',
      title: 'Artisan Avocado Toast',
      description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, and microgreens',
      price: 12.50,
      image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookName: 'Sarah Johnson',
      cookId: '550e8400-e29b-41d4-a716-446655440002',
      cookRating: 4.7,
      distance: 0.8,
      prepTime: 15,
      tags: ['Healthy', 'Vegetarian', 'Fresh'],
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440004',
      title: 'Thai Green Curry',
      description: 'Aromatic green curry with coconut milk, Thai basil, and jasmine rice',
      price: 17.50,
      image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookName: 'Kenji Tanaka',
      cookId: '550e8400-e29b-41d4-a716-446655440004',
      cookRating: 4.7,
      distance: 1.9,
      prepTime: 30,
      tags: ['Japanese', 'Spicy', 'Traditional'],
    },
  ]);

  const FavoriteCard = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity style={styles.heartButton}>
            <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.cookInfo}>
          <Text style={styles.cookName}>{item.cookName}</Text>
          <View style={styles.rating}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{item.cookRating}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <View style={styles.details}>
            <View style={styles.detail}>
              <MapPin size={12} color="#666" />
              <Text style={styles.detailText}>{item.distance} mi</Text>
            </View>
            <View style={styles.detail}>
              <Clock size={12} color="#666" />
              <Text style={styles.detailText}>{item.prepTime} min</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>My Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={48} color="#DDD" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring and add items to your favorites!
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {favorites.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  heartButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cookInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cookName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  details: {
    flexDirection: 'row',
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});