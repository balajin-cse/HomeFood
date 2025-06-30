import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { FoodCard } from '@/components/FoodCard';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { router } from 'expo-router';
import { 
  Search, 
  Clock, 
  ChefHat, 
  Coffee, 
  Utensils, 
  Soup, 
  MapPin, 
  Filter, 
  Bell, 
  Award,
  X 
} from 'lucide-react-native';
import { theme } from '@/constants/theme';

const windowWidth = Dimensions.get('window').width;

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

const categoryIcons = {
  breakfast: <Coffee size={24} color={theme.colors.primary} />,
  lunch: <Utensils size={24} color={theme.colors.primary} />,
  dinner: <Soup size={24} color={theme.colors.primary} />,
  all: <ChefHat size={24} color={theme.colors.primary} />,
};

export default function DiscoverScreen() {
  const { user } = useAuth();
  const { address } = useLocation();
  const { isSubscribed } = useSubscription();
  
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [cookProfiles, setCookProfiles] = useState<Record<string, CookProfile>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxDistance: 10,
    maxPrice: 50,
    tags: [] as string[],
    sortBy: 'distance' as 'distance' | 'price' | 'rating',
  });
  const [notifications, setNotifications] = useState<any[]>([]);

  // Mock food data (for development)
  const mockFoodItems: FoodItem[] = [
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440001',
      title: 'Homemade Pasta Carbonara',
      description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese',
      price: 16.99,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440001',
      cookName: 'Maria Rodriguez',
      cookRating: 4.9,
      distance: 1.2,
      prepTime: 25,
      mealType: 'lunch',
      tags: ['Italian', 'Pasta', 'Creamy'],
      foodRating: 4.8,
      totalFoodReviews: 124,
      isPopular: true,
      isNew: false,
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      nutritionInfo: {
        calories: 650,
        protein: 22,
        carbs: 48,
        fat: 30
      }
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440002',
      title: 'Artisan Avocado Toast',
      description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, and microgreens',
      price: 12.50,
      image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440002',
      cookName: 'Sarah Johnson',
      cookRating: 4.7,
      distance: 0.8,
      prepTime: 15,
      mealType: 'breakfast',
      tags: ['Healthy', 'Vegetarian', 'Fresh'],
      foodRating: 4.6,
      totalFoodReviews: 87,
      isPopular: false,
      isNew: true,
      allergens: ['Gluten'],
      nutritionInfo: {
        calories: 320,
        protein: 8,
        carbs: 32,
        fat: 18
      }
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440003',
      title: 'Miso Glazed Salmon',
      description: 'Pan-seared salmon with miso glaze, served with steamed rice and vegetables',
      price: 22.99,
      image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440003',
      cookName: 'David Chen',
      cookRating: 4.8,
      distance: 2.1,
      prepTime: 30,
      mealType: 'dinner',
      tags: ['Asian Fusion', 'Seafood', 'Gourmet'],
      foodRating: 4.9,
      totalFoodReviews: 156,
      isPopular: true,
      isNew: false,
      allergens: ['Fish', 'Soy'],
      nutritionInfo: {
        calories: 520,
        protein: 35,
        carbs: 42,
        fat: 22
      }
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440004',
      title: 'Thai Green Curry',
      description: 'Aromatic green curry with coconut milk, Thai basil, and jasmine rice',
      price: 17.50,
      image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440004',
      cookName: 'Kenji Tanaka',
      cookRating: 4.7,
      distance: 1.9,
      prepTime: 30,
      mealType: 'dinner',
      tags: ['Thai', 'Spicy', 'Curry'],
      foodRating: 4.7,
      totalFoodReviews: 103,
      isPopular: true,
      isNew: false,
      allergens: ['Shellfish', 'Peanuts'],
      nutritionInfo: {
        calories: 580,
        protein: 18,
        carbs: 45,
        fat: 25
      }
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440005',
      title: 'Greek Moussaka',
      description: 'Traditional layered casserole with eggplant, meat sauce, and béchamel',
      price: 19.99,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440005',
      cookName: 'Elena Papadopoulos',
      cookRating: 4.6,
      distance: 2.5,
      prepTime: 35,
      mealType: 'dinner',
      tags: ['Greek', 'Mediterranean', 'Comfort Food'],
      foodRating: 4.8,
      totalFoodReviews: 92,
      isPopular: false,
      isNew: false,
      allergens: ['Dairy', 'Gluten', 'Eggs'],
      nutritionInfo: {
        calories: 720,
        protein: 32,
        carbs: 38,
        fat: 28
      }
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440006',
      title: 'Jerk Chicken with Rice and Peas',
      description: 'Authentic Caribbean jerk chicken with coconut rice and kidney beans',
      price: 16.99,
      image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440006',
      cookName: 'Marcus Campbell',
      cookRating: 4.9,
      distance: 3.0,
      prepTime: 40,
      mealType: 'lunch',
      tags: ['Caribbean', 'Spicy', 'Traditional'],
      foodRating: 4.9,
      totalFoodReviews: 78,
      isPopular: true,
      isNew: false,
      allergens: ['None'],
      nutritionInfo: {
        calories: 680,
        protein: 42,
        carbs: 52,
        fat: 18
      }
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440007',
      title: 'Breakfast Burrito',
      description: 'Flour tortilla filled with scrambled eggs, bacon, cheese, potatoes, and salsa',
      price: 10.99,
      image: 'https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440002',
      cookName: 'Sarah Johnson',
      cookRating: 4.7,
      distance: 0.8,
      prepTime: 20,
      mealType: 'breakfast',
      tags: ['Breakfast', 'Mexican-inspired', 'Hearty'],
      foodRating: 4.5,
      totalFoodReviews: 62,
      isPopular: false,
      isNew: false,
      allergens: ['Eggs', 'Dairy', 'Gluten'],
      nutritionInfo: {
        calories: 550,
        protein: 24,
        carbs: 42,
        fat: 32
      }
    },
    {
      id: 'menu-item-550e8400-e29b-41d4-a716-446655440008',
      title: 'Classic French Omelette',
      description: 'Fluffy omelette with herbs and Gruyère cheese, served with a side salad',
      price: 13.99,
      image: 'https://images.pexels.com/photos/6824418/pexels-photo-6824418.jpeg?auto=compress&cs=tinysrgb&w=800',
      cookId: '550e8400-e29b-41d4-a716-446655440001',
      cookName: 'Maria Rodriguez',
      cookRating: 4.9,
      distance: 1.2,
      prepTime: 15,
      mealType: 'breakfast',
      tags: ['French', 'Eggs', 'Light'],
      foodRating: 4.7,
      totalFoodReviews: 45,
      isPopular: true,
      isNew: true,
      allergens: ['Eggs', 'Dairy'],
      nutritionInfo: {
        calories: 380,
        protein: 21,
        carbs: 5,
        fat: 28
      }
    },
  ];

  // Mock cook profile data
  const mockCookProfiles: Record<string, CookProfile> = {
    '550e8400-e29b-41d4-a716-446655440001': {
      id: '550e8400-e29b-41d4-a716-446655440001',
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
    '550e8400-e29b-41d4-a716-446655440002': {
      id: '550e8400-e29b-41d4-a716-446655440002',
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
    '550e8400-e29b-41d4-a716-446655440003': {
      id: '550e8400-e29b-41d4-a716-446655440003',
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
    '550e8400-e29b-41d4-a716-446655440004': {
      id: '550e8400-e29b-41d4-a716-446655440004',
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
    '550e8400-e29b-41d4-a716-446655440005': {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Elena Papadopoulos',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.6,
      totalReviews: 178,
      yearsExperience: 7,
      specialties: ['Greek', 'Mediterranean', 'Traditional'],
      totalOrders: 650,
      responseTime: '< 30 min',
      isVerified: true,
      badges: ['Authentic Recipes', 'Family Tradition'],
      joinedDate: '2019-08-05',
      bio: 'I grew up cooking in my family's restaurant in Athens. All my recipes have been passed down through generations, bringing authentic Greek flavors to your table.',
      location: 'Castro, SF',
      distance: 2.5,
    },
    '550e8400-e29b-41d4-a716-446655440006': {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Marcus Campbell',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.9,
      totalReviews: 203,
      yearsExperience: 9,
      specialties: ['Caribbean', 'Jamaican', 'BBQ'],
      totalOrders: 870,
      responseTime: '< 20 min',
      isVerified: true,
      badges: ['Spice Master', 'Community Favorite'],
      joinedDate: '2019-05-18',
      bio: 'Born in Jamaica and raised on traditional family recipes. I bring the authentic flavors of the Caribbean to every dish, specializing in jerk seasoning and slow-cooked meats.',
      location: 'Oakland, CA',
      distance: 3.0,
    },
  };

  useEffect(() => {
    loadFoodItems();
  }, []);

  // Search and filter
  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, foodItems]);

  const loadFoodItems = async () => {
    setLoading(true);
    
    try {
      // Try to fetch from Supabase first
      console.log('Fetching menu items from Supabase...');
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          profiles:cook_id(name)
        `)
        .eq('is_active', true);
        
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // Transform Supabase data to our FoodItem format
        const transformedItems: FoodItem[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          price: parseFloat(item.price),
          image: item.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: item.cook_id,
          cookName: item.profiles?.name || 'Unknown Cook',
          cookRating: 4.7, // Mock value
          distance: Math.random() * 5 + 0.5, // Random distance between 0.5 and 5.5 km
          prepTime: Math.floor(Math.random() * 30) + 15, // Random prep time between 15 and 45 min
          mealType: item.meal_type,
          tags: item.tags || [],
          foodRating: 4.5 + Math.random() * 0.5, // Random rating between 4.5 and 5.0
          totalFoodReviews: Math.floor(Math.random() * 150) + 50, // Random review count
          isPopular: Math.random() > 0.7, // 30% chance of being popular
          isNew: Math.random() > 0.8, // 20% chance of being new
          allergens: ['Dairy', 'Gluten', 'Nuts'].filter(() => Math.random() > 0.5), // Random allergens
          nutritionInfo: {
            calories: Math.floor(Math.random() * 600) + 200,
            protein: Math.floor(Math.random() * 30) + 10,
            carbs: Math.floor(Math.random() * 40) + 20,
            fat: Math.floor(Math.random() * 25) + 5
          }
        }));
        
        console.log(`Loaded ${transformedItems.length} items from Supabase`);
        setFoodItems(transformedItems);
      } else {
        // Fallback to mock data
        console.log('No data found in Supabase, using mock data');
        setFoodItems(mockFoodItems);
        setCookProfiles(mockCookProfiles);
      }
    } catch (error) {
      console.error('Error loading food items:', error);
      
      // Fallback to mock data
      console.log('Error connecting to Supabase, using mock data');
      setFoodItems(mockFoodItems);
      setCookProfiles(mockCookProfiles);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...foodItems];
    
    // Filter by search query
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) || 
        item.cookName.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.mealType === selectedCategory);
    }
    
    // Apply additional filters
    if (showFilters) {
      filtered = filtered.filter(item => 
        item.distance <= filters.maxDistance &&
        item.price <= filters.maxPrice
      );
      
      // Filter by tags if any are selected
      if (filters.tags.length > 0) {
        filtered = filtered.filter(item => 
          item.tags.some(tag => filters.tags.includes(tag))
        );
      }
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'distance':
          filtered.sort((a, b) => a.distance - b.distance);
          break;
        case 'price':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.foodRating - a.foodRating);
          break;
      }
    }
    
    setFilteredItems(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoodItems();
    setRefreshing(false);
  };

  const handleFoodPress = (item: FoodItem) => {
    // Navigate to food detail page
    router.push({
      pathname: '/food-detail',
      params: { foodItem: JSON.stringify(item) }
    });
  };

  const handleCookPress = (cookId: string) => {
    // Navigate to cook profile
    const cook = cookProfiles[cookId];
    if (cook) {
      router.push({
        pathname: '/cook-profile', 
        params: { cookId }
      });
    }
  };

  const SubscriptionBanner = () => (
    <TouchableOpacity 
      style={styles.subscriptionBanner}
      onPress={() => router.push('/subscription')}
    >
      <View style={styles.subscriptionContent}>
        <Text style={styles.subscriptionTitle}>
          {isSubscribed ? 'Premium Membership Active' : 'Unlock Full Access'}
        </Text>
        <Text style={styles.subscriptionText}>
          {isSubscribed 
            ? 'Enjoy unlimited access to all home cooks'
            : 'Subscribe to order delicious homemade food'
          }
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.subscriptionButton}
        onPress={() => router.push('/subscription')}
      >
        <Text style={styles.subscriptionButtonText}>
          {isSubscribed ? 'My Plan' : 'Subscribe'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Categories for horizontal scrolling menu
  const categories = [
    { id: 'all', name: 'All', icon: categoryIcons.all },
    { id: 'breakfast', name: 'Breakfast', icon: categoryIcons.breakfast },
    { id: 'lunch', name: 'Lunch', icon: categoryIcons.lunch },
    { id: 'dinner', name: 'Dinner', icon: categoryIcons.dinner },
  ];

  // Tags for filter selection
  const availableTags = ['Italian', 'Asian', 'Vegetarian', 'Vegan', 'Healthy', 'Comfort Food', 'Spicy', 'Gluten-Free', 'Dessert'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.addressBar}>
          <MapPin size={18} color={theme.colors.onSurface} />
          <Text style={styles.addressText} numberOfLines={1}>
            {address || 'Set your location'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/delivery-address')}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setNotifications(prev => [
              { id: Date.now().toString(), message: 'New cook joined near you!' },
              ...prev
            ])}
          >
            <Bell size={24} color={theme.colors.onSurface} />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription Banner (only for non-subscribers or on special occasions) */}
      {(!isSubscribed || (Math.random() > 0.7 && isSubscribed)) && <SubscriptionBanner />}

      {/* Main Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Message */}
        <Text style={styles.welcomeText}>
          {user 
            ? `Welcome back${user.name ? ', ' + user.name.split(' ')[0] : ''}!` 
            : 'Discover amazing home cooks near you'}
        </Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes, cooks, cuisines..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Advanced Filters (collapsible) */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterHeader}>
              <Text style={styles.filtersTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            
            {/* Filter options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Maximum Distance</Text>
              <View style={styles.sliderContainer}>
                <TextInput
                  style={styles.sliderValue}
                  value={filters.maxDistance.toString()}
                  keyboardType="numeric"
                  onChangeText={(value) => {
                    const numValue = parseInt(value) || 1;
                    setFilters(prev => ({ ...prev, maxDistance: Math.min(Math.max(numValue, 1), 50) }));
                  }}
                />
                <Text style={styles.sliderUnit}>km</Text>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Maximum Price</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.sliderValue}
                  value={filters.maxPrice.toString()}
                  keyboardType="numeric"
                  onChangeText={(value) => {
                    const numValue = parseInt(value) || 1;
                    setFilters(prev => ({ ...prev, maxPrice: Math.min(Math.max(numValue, 1), 100) }));
                  }}
                />
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {['distance', 'price', 'rating'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortOption,
                      filters.sortBy === option && styles.sortOptionSelected
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, sortBy: option as any }))}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      filters.sortBy === option && styles.sortOptionTextSelected
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Dietary Preferences</Text>
              <View style={styles.tagOptions}>
                {availableTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagOption,
                      filters.tags.includes(tag) && styles.tagOptionSelected
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                          ? prev.tags.filter(t => t !== tag)
                          : [...prev.tags, tag]
                      }));
                    }}
                  >
                    <Text style={[
                      styles.tagOptionText,
                      filters.tags.includes(tag) && styles.tagOptionTextSelected
                    ]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setFilters({
                  maxDistance: 10,
                  maxPrice: 50,
                  tags: [],
                  sortBy: 'distance',
                })}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => {
                  filterItems();
                  setShowFilters(false);
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Categories (Horizontal Scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.categoryItemSelected
              ]}
              onPress={() => setSelectedCategory(category.id as any)}
            >
              {category.icon}
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' 
                ? 'Featured Dishes' 
                : `Best ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
            </Text>
            {filteredItems.length > 0 && (
              <Text style={styles.sectionSubtitle}>{filteredItems.length} results</Text>
            )}
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading delicious meals...</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ChefHat size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyTitle}>No dishes found</Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try different keywords.` 
                  : 'No dishes available in this category at the moment.'}
              </Text>
            </View>
          ) : (
            <View>
              {/* Food Items */}
              {filteredItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  cook={cookProfiles[item.cookId]}
                  onPress={() => handleFoodPress(item)}
                  onCookPress={() => handleCookPress(item.cookId)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Featured Cooks */}
        {Object.keys(cookProfiles).length > 0 && (
          <View style={styles.cooksSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Cooks</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/cook')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cooksContainer}
              contentContainerStyle={styles.cooksContent}
            >
              {Object.values(cookProfiles).map((cook) => (
                <TouchableOpacity 
                  key={cook.id} 
                  style={styles.cookCard}
                  onPress={() => handleCookPress(cook.id)}
                >
                  <View style={styles.cookImageContainer}>
                    <Image source={{ uri: cook.avatar }} style={styles.cookImage} />
                    {cook.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Award size={12} color="white" />
                      </View>
                    )}
                  </View>
                  <View style={styles.cookInfo}>
                    <Text style={styles.cookName} numberOfLines={1}>{cook.name}</Text>
                    <View style={styles.cookStats}>
                      <Text style={styles.cookRating}>★ {cook.rating.toFixed(1)}</Text>
                      <Text style={styles.cookDistance}>• {cook.distance}km</Text>
                    </View>
                    <View style={styles.specialties}>
                      {cook.specialties.slice(0, 1).map((specialty, index) => (
                        <View key={index} style={styles.specialtyTag}>
                          <Text style={styles.specialtyText}>{specialty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* App Info */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Image
              source={{ uri: "https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.png" }}
              style={styles.footerLogo}
              resizeMode="contain"
            />
            <Text style={styles.footerText}>HomeFood Web v1.0.0</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerCopyright}>© 2025 HomeFood. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  subscriptionBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  subscriptionContent: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  subscriptionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  subscriptionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 46,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingRight: theme.spacing.xl,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    minWidth: 100,
  },
  categoryItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginTop: theme.spacing.sm,
  },
  categoryTextSelected: {
    color: 'white',
  },
  featuredSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  filtersTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderValue: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  sliderUnit: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  currencySymbol: {
    marginRight: theme.spacing.xs,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sortOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  sortOptionSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  sortOptionTextSelected: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
  },
  tagOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tagOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  tagOptionSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  tagOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  tagOptionTextSelected: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  resetButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  applyButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  cooksSection: {
    marginBottom: theme.spacing.xl,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  cooksContainer: {
    flexGrow: 0,
  },
  cooksContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingRight: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  cookCard: {
    width: 150,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    padding: theme.spacing.sm,
  },
  cookImageContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  cookImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cookInfo: {
    padding: theme.spacing.xs,
  },
  cookName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  cookStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cookRating: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  cookDistance: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginLeft: theme.spacing.xs,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  specialtyTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    marginTop: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  footerLogo: {
    width: 24,
    height: 24,
    marginRight: theme.spacing.sm,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  footerCopyright: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
});