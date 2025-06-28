import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, MapPin, Filter, Crown, ChevronDown, Plus, Check, Navigation, X, Star, Award, Clock, Users, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FoodCard } from '@/components/FoodCard';
import { MapSelector } from '@/components/MapSelector';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { theme } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface FilterOptions {
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'prep_time';
  priceRange: { min: number; max: number };
  maxDistance: number;
  minRating: number;
  maxPrepTime: number;
  cuisineTypes: string[];
  dietaryRestrictions: string[];
}

const MEAL_TYPES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🥐' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'distance', label: 'Nearest First' },
  { id: 'prep_time', label: 'Fastest Prep' },
];

const CUISINE_TYPES = [
  'Italian', 'Asian', 'Mexican', 'American', 'Mediterranean', 'Indian', 
  'Thai', 'Japanese', 'French', 'Chinese', 'Greek', 'Middle Eastern'
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Keto', 'Low-Carb', 'Halal', 'Kosher', 'Organic'
];

export default function HomeScreen() {
  const { address, updateLocation } = useLocation();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedCookId, setSelectedCookId] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [cooks, setCooks] = useState<CookProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showCookProfile, setShowCookProfile] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCook, setSelectedCook] = useState<CookProfile | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sortBy: 'relevance',
    priceRange: { min: 0, max: 100 },
    maxDistance: 25,
    minRating: 0,
    maxPrepTime: 120,
    cuisineTypes: [],
    dietaryRestrictions: [],
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: '1',
      label: 'Home',
      address: 'San Francisco, CA',
      coordinates: { latitude: 37.7749, longitude: -122.4194 }
    },
    {
      id: '2',
      label: 'Work',
      address: 'Palo Alto, CA',
      coordinates: { latitude: 37.4419, longitude: -122.1430 }
    },
    {
      id: '3',
      label: 'Friend\'s Place',
      address: 'Berkeley, CA',
      coordinates: { latitude: 37.8715, longitude: -122.2730 }
    }
  ]);

  useEffect(() => {
    loadFoodItems();
    loadCooks();
    // Set default address if none selected
    if (!selectedAddress && savedAddresses.length > 0) {
      setSelectedAddress(savedAddresses[0]);
    }
    
    // Check if we have a cook filter from navigation params
    if (params.cookId) {
      setSelectedCookId(params.cookId as string);
    }
  }, [params.cookId]);

  const loadCooks = async () => {
    // Enhanced mock cook data with detailed profiles
    const mockCooks: CookProfile[] = [
      {
        id: '1',
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
      {
        id: '2',
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
      {
        id: '3',
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
      {
        id: '4',
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
    ];
    setCooks(mockCooks);
  };

  const loadFoodItems = async () => {
    // Enhanced mock data with detailed food ratings and cook information
    const mockFoodItems: FoodItem[] = [
      // Maria Rodriguez (Cook ID: 1) - Italian dishes
      {
        id: '1',
        title: 'Homemade Pasta Carbonara',
        description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese made with love',
        price: 16.99,
        image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '1',
        cookName: 'Maria Rodriguez',
        cookRating: 4.9,
        distance: 1.2,
        prepTime: 25,
        mealType: 'lunch',
        tags: ['Italian', 'Pasta', 'Creamy', 'Comfort Food'],
        foodRating: 4.8,
        totalFoodReviews: 89,
        isPopular: true,
        isNew: false,
        allergens: ['Eggs', 'Dairy', 'Gluten'],
        nutritionInfo: {
          calories: 520,
          protein: 22,
          carbs: 45,
          fat: 28,
        },
      },
      {
        id: '5',
        title: 'Margherita Pizza',
        description: 'Traditional Neapolitan pizza with fresh mozzarella, basil, and San Marzano tomatoes',
        price: 19.99,
        image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '1',
        cookName: 'Maria Rodriguez',
        cookRating: 4.9,
        distance: 1.2,
        prepTime: 30,
        mealType: 'dinner',
        tags: ['Italian', 'Pizza', 'Traditional', 'Vegetarian'],
        foodRating: 4.7,
        totalFoodReviews: 45,
        isPopular: false,
        isNew: false,
        allergens: ['Dairy', 'Gluten'],
        nutritionInfo: {
          calories: 420,
          protein: 18,
          carbs: 52,
          fat: 16,
        },
      },
      {
        id: '6',
        title: 'Osso Buco Risotto',
        description: 'Slow-braised veal shanks with creamy saffron risotto and gremolata',
        price: 28.99,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '1',
        cookName: 'Maria Rodriguez',
        cookRating: 4.9,
        distance: 1.2,
        prepTime: 60,
        mealType: 'dinner',
        tags: ['Italian', 'Gourmet', 'Risotto', 'Meat'],
        foodRating: 4.9,
        totalFoodReviews: 32,
        isPopular: true,
        isNew: false,
        allergens: ['Dairy', 'Gluten'],
        nutritionInfo: {
          calories: 650,
          protein: 42,
          carbs: 48,
          fat: 28,
        },
      },
      // Sarah Johnson (Cook ID: 2) - Healthy/Vegan dishes
      {
        id: '2',
        title: 'Artisan Avocado Toast',
        description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, microgreens, and hemp seeds',
        price: 12.50,
        image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '2',
        cookName: 'Sarah Johnson',
        cookRating: 4.7,
        distance: 0.8,
        prepTime: 15,
        mealType: 'breakfast',
        tags: ['Healthy', 'Vegetarian', 'Fresh', 'Organic'],
        foodRating: 4.6,
        totalFoodReviews: 67,
        isPopular: false,
        isNew: true,
        allergens: ['Gluten'],
        nutritionInfo: {
          calories: 320,
          protein: 12,
          carbs: 35,
          fat: 18,
        },
      },
      {
        id: '7',
        title: 'Quinoa Buddha Bowl',
        description: 'Nutrient-packed bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
        price: 15.99,
        image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '2',
        cookName: 'Sarah Johnson',
        cookRating: 4.7,
        distance: 0.8,
        prepTime: 20,
        mealType: 'lunch',
        tags: ['Healthy', 'Vegan', 'Gluten-Free', 'Protein Rich'],
        foodRating: 4.8,
        totalFoodReviews: 54,
        isPopular: true,
        isNew: false,
        allergens: ['Sesame'],
        nutritionInfo: {
          calories: 380,
          protein: 16,
          carbs: 42,
          fat: 14,
        },
      },
      // David Chen (Cook ID: 3) - Asian Fusion dishes
      {
        id: '3',
        title: 'Pan-Seared Salmon',
        description: 'Atlantic salmon with roasted vegetables and lemon herb butter sauce, served with quinoa',
        price: 24.99,
        image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '3',
        cookName: 'David Chen',
        cookRating: 4.8,
        distance: 2.1,
        prepTime: 35,
        mealType: 'dinner',
        tags: ['Seafood', 'Healthy', 'Gourmet', 'Protein Rich'],
        foodRating: 4.9,
        totalFoodReviews: 124,
        isPopular: true,
        isNew: false,
        allergens: ['Fish'],
        nutritionInfo: {
          calories: 450,
          protein: 35,
          carbs: 25,
          fat: 22,
        },
      },
      {
        id: '8',
        title: 'Korean BBQ Tacos',
        description: 'Fusion tacos with marinated bulgogi beef, kimchi slaw, and gochujang aioli',
        price: 18.99,
        image: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '3',
        cookName: 'David Chen',
        cookRating: 4.8,
        distance: 2.1,
        prepTime: 25,
        mealType: 'lunch',
        tags: ['Asian Fusion', 'Korean', 'Spicy', 'Street Food'],
        foodRating: 4.7,
        totalFoodReviews: 78,
        isPopular: false,
        isNew: true,
        allergens: ['Gluten', 'Soy'],
        nutritionInfo: {
          calories: 520,
          protein: 28,
          carbs: 35,
          fat: 26,
        },
      },
      // Kenji Tanaka (Cook ID: 4) - Japanese dishes
      {
        id: '4',
        title: 'Authentic Ramen Bowl',
        description: 'Rich tonkotsu broth with handmade noodles, chashu pork, soft-boiled egg, and nori',
        price: 18.99,
        image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '4',
        cookName: 'Kenji Tanaka',
        cookRating: 4.9,
        distance: 1.5,
        prepTime: 45,
        mealType: 'lunch',
        tags: ['Japanese', 'Ramen', 'Comfort Food', 'Authentic'],
        foodRating: 4.9,
        totalFoodReviews: 156,
        isPopular: true,
        isNew: false,
        allergens: ['Eggs', 'Gluten', 'Soy'],
        nutritionInfo: {
          calories: 680,
          protein: 28,
          carbs: 65,
          fat: 32,
        },
      },
      {
        id: '9',
        title: 'Chirashi Bowl',
        description: 'Fresh sashimi selection over seasoned sushi rice with wasabi and pickled vegetables',
        price: 26.99,
        image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookId: '4',
        cookName: 'Kenji Tanaka',
        cookRating: 4.9,
        distance: 1.5,
        prepTime: 20,
        mealType: 'dinner',
        tags: ['Japanese', 'Sushi', 'Fresh', 'Premium'],
        foodRating: 4.8,
        totalFoodReviews: 92,
        isPopular: true,
        isNew: false,
        allergens: ['Fish', 'Soy'],
        nutritionInfo: {
          calories: 420,
          protein: 32,
          carbs: 45,
          fat: 12,
        },
      },
    ];
    setFoodItems(mockFoodItems);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoodItems();
    await loadCooks();
    setRefreshing(false);
  };

  const applyFilters = (items: FoodItem[]) => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply meal type filter
    if (selectedMealType !== 'all') {
      filtered = filtered.filter(item => item.mealType === selectedMealType);
    }

    // Apply cook filter
    if (selectedCookId) {
      filtered = filtered.filter(item => item.cookId === selectedCookId);
    }

    // Apply price range filter
    filtered = filtered.filter(item => 
      item.price >= filterOptions.priceRange.min && 
      item.price <= filterOptions.priceRange.max
    );

    // Apply distance filter
    filtered = filtered.filter(item => item.distance <= filterOptions.maxDistance);

    // Apply rating filter
    if (filterOptions.minRating > 0) {
      filtered = filtered.filter(item => item.foodRating >= filterOptions.minRating);
    }

    // Apply prep time filter
    filtered = filtered.filter(item => item.prepTime <= filterOptions.maxPrepTime);

    // Apply cuisine type filter
    if (filterOptions.cuisineTypes.length > 0) {
      filtered = filtered.filter(item =>
        item.tags.some(tag => filterOptions.cuisineTypes.includes(tag))
      );
    }

    // Apply dietary restrictions filter
    if (filterOptions.dietaryRestrictions.length > 0) {
      filtered = filtered.filter(item =>
        filterOptions.dietaryRestrictions.every(restriction =>
          item.tags.includes(restriction)
        )
      );
    }

    // Apply sorting
    switch (filterOptions.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.foodRating - a.foodRating);
        break;
      case 'distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'prep_time':
        filtered.sort((a, b) => a.prepTime - b.prepTime);
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }

    return filtered;
  };

  const filteredFoodItems = applyFilters(foodItems);

  const handleFoodItemPress = (item: FoodItem) => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    if (!isSubscribed) {
      router.push('/subscription');
      return;
    }
    
    router.push({
      pathname: '/food-detail',
      params: { foodItem: JSON.stringify(item) }
    });
  };

  const handleCookPress = (cookId: string) => {
    const cook = cooks.find(c => c.id === cookId);
    if (cook) {
      setSelectedCook(cook);
      setShowCookProfile(true);
    }
  };

  const handleViewCookMenu = (cookId: string) => {
    setSelectedCookId(cookId);
    setShowCookProfile(false);
  };

  const handleAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
    if (address.coordinates) {
      updateLocation(address.coordinates, address.address);
    }
    setShowAddressModal(false);
  };

  const handleMapLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      label: 'Selected Location',
      address: location.address,
      coordinates: { latitude: location.latitude, longitude: location.longitude }
    };
    
    setSelectedAddress(newAddress);
    updateLocation({ latitude: location.latitude, longitude: location.longitude }, location.address);
    setShowMapSelector(false);
    setShowAddressModal(false);
  };

  const clearCookFilter = () => {
    setSelectedCookId(null);
  };

  const clearAllFilters = () => {
    setFilterOptions({
      sortBy: 'relevance',
      priceRange: { min: 0, max: 100 },
      maxDistance: 25,
      minRating: 0,
      maxPrepTime: 120,
      cuisineTypes: [],
      dietaryRestrictions: [],
    });
    setSelectedMealType('all');
    setSearchQuery('');
    setSelectedCookId(null);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filterOptions.sortBy !== 'relevance') count++;
    if (filterOptions.priceRange.min > 0 || filterOptions.priceRange.max < 100) count++;
    if (filterOptions.maxDistance < 25) count++;
    if (filterOptions.minRating > 0) count++;
    if (filterOptions.maxPrepTime < 120) count++;
    if (filterOptions.cuisineTypes.length > 0) count++;
    if (filterOptions.dietaryRestrictions.length > 0) count++;
    if (selectedMealType !== 'all') count++;
    if (searchQuery) count++;
    if (selectedCookId) count++;
    return count;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayAddress = selectedAddress?.address || address || 'Getting your location...';
  const selectedCookData = selectedCookId ? cooks.find(c => c.id === selectedCookId) : null;
  const activeFilterCount = getActiveFilterCount();

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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header - Fixed Width */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>{getGreeting()}!</Text>
                <Text style={styles.userName}>{user?.name || 'Food Lover'}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.locationSection}
                onPress={() => setShowAddressModal(true)}
                activeOpacity={0.7}
              >
                <MapPin size={16} color="white" />
                <Text style={styles.location} numberOfLines={1}>
                  {displayAddress}
                </Text>
                <ChevronDown size={16} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
            <Input
              placeholder="Search for delicious homemade food..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color={activeFilterCount > 0 ? 'white' : theme.colors.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Cook Filter Banner */}
        {selectedCookData && (
          <View style={styles.cookFilterBanner}>
            <Card style={styles.cookFilterCard}>
              <View style={styles.cookFilterContent}>
                <Image source={{ uri: selectedCookData.avatar }} style={styles.cookFilterAvatar} />
                <View style={styles.cookFilterInfo}>
                  <Text style={styles.cookFilterName}>Showing dishes by {selectedCookData.name}</Text>
                  <View style={styles.cookFilterRating}>
                    <View style={styles.ratingStars}>
                      {renderStars(selectedCookData.rating, 12)}
                    </View>
                    <Text style={styles.cookFilterRatingText}>
                      {selectedCookData.rating} • {selectedCookData.specialties.join(', ')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={clearCookFilter} style={styles.clearFilterButton}>
                  <X size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Meal Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mealTypeContainer}
          contentContainerStyle={styles.mealTypeContent}
        >
          {MEAL_TYPES.map((mealType) => (
            <TouchableOpacity
              key={mealType.id}
              style={[
                styles.mealTypeChip,
                selectedMealType === mealType.id && styles.mealTypeChipActive,
              ]}
              onPress={() => setSelectedMealType(mealType.id)}
            >
              <Text style={styles.mealTypeEmoji}>{mealType.emoji}</Text>
              <Text
                style={[
                  styles.mealTypeText,
                  selectedMealType === mealType.id && styles.mealTypeTextActive,
                ]}
              >
                {mealType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Premium Banner - Only show if not subscribed */}
        {!isSubscribed && (
          <TouchableOpacity 
            onPress={() => router.push('/subscription')}
            style={styles.premiumBannerContainer}
          >
            <Card style={styles.premiumBanner}>
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                style={styles.premiumGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={24} color="white" />
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Unlock Premium</Text>
                  <Text style={styles.premiumSubtitle}>Order from amazing home cooks</Text>
                </View>
                <Text style={styles.premiumCta}>Subscribe →</Text>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        )}

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredFoodItems.length} {filteredFoodItems.length === 1 ? 'dish' : 'dishes'} found
            </Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Food List */}
        <View style={styles.foodListContainer}>
          {filteredFoodItems.length === 0 ? (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {selectedCookData ? `No dishes found from ${selectedCookData.name}` : 'No dishes found'}
              </Text>
              <Text style={styles.emptyStateText}>
                {selectedCookData 
                  ? 'This cook might not have dishes matching your current filters'
                  : 'Try adjusting your search or filters'
                }
              </Text>
              {selectedCookData && (
                <Button
                  title="Clear Cook Filter"
                  onPress={clearCookFilter}
                  variant="outline"
                  style={styles.clearFilterButtonLarge}
                />
              )}
              {activeFilterCount > 0 && (
                <Button
                  title="Clear All Filters"
                  onPress={clearAllFilters}
                  style={styles.clearFilterButtonLarge}
                />
              )}
            </Card>
          ) : (
            filteredFoodItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                cook={cooks.find(c => c.id === item.cookId)}
                onPress={() => handleFoodItemPress(item)}
                onCookPress={() => handleCookPress(item.cookId)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Cook Profile Modal */}
      <Modal
        visible={showCookProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCookProfile(false)}
      >
        {selectedCook && (
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
                <Image source={{ uri: selectedCook.avatar }} style={styles.cookProfileAvatar} />
                <View style={styles.cookProfileInfo}>
                  <View style={styles.cookProfileNameRow}>
                    <Text style={styles.cookProfileName}>{selectedCook.name}</Text>
                    {selectedCook.isVerified && (
                      <Award size={20} color={theme.colors.primary} />
                    )}
                  </View>
                  <Text style={styles.cookProfileLocation}>{selectedCook.location}</Text>
                  <View style={styles.cookProfileRating}>
                    <View style={styles.ratingStars}>
                      {renderStars(selectedCook.rating, 16)}
                    </View>
                    <Text style={styles.cookProfileRatingText}>
                      {selectedCook.rating} ({selectedCook.totalReviews} reviews)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cook Stats */}
              <View style={styles.cookStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedCook.yearsExperience}</Text>
                  <Text style={styles.statLabel}>Years Experience</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedCook.totalOrders}</Text>
                  <Text style={styles.statLabel}>Total Orders</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedCook.responseTime}</Text>
                  <Text style={styles.statLabel}>Response Time</Text>
                </View>
              </View>

              {/* Badges */}
              <View style={styles.cookBadges}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.badgesList}>
                  {selectedCook.badges.map((badge, index) => (
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
                  {selectedCook.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Bio */}
              <View style={styles.cookBio}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{selectedCook.bio}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.cookActions}>
                <Button
                  title="View Menu"
                  onPress={() => handleViewCookMenu(selectedCook.id)}
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

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    filterOptions.sortBy === option.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilterOptions(prev => ({ ...prev, sortBy: option.id as any }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterOptions.sortBy === option.id && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {filterOptions.sortBy === option.id && (
                    <Check size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <Input
                  placeholder="Min"
                  value={filterOptions.priceRange.min.toString()}
                  onChangeText={(text) => setFilterOptions(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: parseInt(text) || 0 }
                  }))}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <Text style={styles.priceRangeSeparator}>to</Text>
                <Input
                  placeholder="Max"
                  value={filterOptions.priceRange.max.toString()}
                  onChangeText={(text) => setFilterOptions(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: parseInt(text) || 100 }
                  }))}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>
            </View>

            {/* Distance */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Max Distance: {filterOptions.maxDistance}km</Text>
              <View style={styles.distanceOptions}>
                {[1, 5, 10, 15, 25].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceOption,
                      filterOptions.maxDistance === distance && styles.distanceOptionSelected
                    ]}
                    onPress={() => setFilterOptions(prev => ({ ...prev, maxDistance: distance }))}
                  >
                    <Text style={[
                      styles.distanceOptionText,
                      filterOptions.maxDistance === distance && styles.distanceOptionTextSelected
                    ]}>
                      {distance}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingOptions}>
                {[0, 3, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingOption,
                      filterOptions.minRating === rating && styles.ratingOptionSelected
                    ]}
                    onPress={() => setFilterOptions(prev => ({ ...prev, minRating: rating }))}
                  >
                    <Text style={[
                      styles.ratingOptionText,
                      filterOptions.minRating === rating && styles.ratingOptionTextSelected
                    ]}>
                      {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Prep Time */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Max Prep Time: {filterOptions.maxPrepTime} min</Text>
              <View style={styles.prepTimeOptions}>
                {[15, 30, 45, 60, 120].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.prepTimeOption,
                      filterOptions.maxPrepTime === time && styles.prepTimeOptionSelected
                    ]}
                    onPress={() => setFilterOptions(prev => ({ ...prev, maxPrepTime: time }))}
                  >
                    <Text style={[
                      styles.prepTimeOptionText,
                      filterOptions.maxPrepTime === time && styles.prepTimeOptionTextSelected
                    ]}>
                      {time} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cuisine Types */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Cuisine Types</Text>
              <View style={styles.cuisineGrid}>
                {CUISINE_TYPES.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.cuisineOption,
                      filterOptions.cuisineTypes.includes(cuisine) && styles.cuisineOptionSelected
                    ]}
                    onPress={() => setFilterOptions(prev => ({
                      ...prev,
                      cuisineTypes: prev.cuisineTypes.includes(cuisine)
                        ? prev.cuisineTypes.filter(c => c !== cuisine)
                        : [...prev.cuisineTypes, cuisine]
                    }))}
                  >
                    <Text style={[
                      styles.cuisineOptionText,
                      filterOptions.cuisineTypes.includes(cuisine) && styles.cuisineOptionTextSelected
                    ]}>
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dietary Restrictions */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Dietary Restrictions</Text>
              <View style={styles.dietaryGrid}>
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <TouchableOpacity
                    key={restriction}
                    style={[
                      styles.dietaryOption,
                      filterOptions.dietaryRestrictions.includes(restriction) && styles.dietaryOptionSelected
                    ]}
                    onPress={() => setFilterOptions(prev => ({
                      ...prev,
                      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                        ? prev.dietaryRestrictions.filter(d => d !== restriction)
                        : [...prev.dietaryRestrictions, restriction]
                    }))}
                  >
                    <Text style={[
                      styles.dietaryOptionText,
                      filterOptions.dietaryRestrictions.includes(restriction) && styles.dietaryOptionTextSelected
                    ]}>
                      {restriction}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Filter Actions */}
          <View style={styles.filterActions}>
            <Button
              title="Clear All"
              variant="outline"
              onPress={clearAllFilters}
              style={styles.filterActionButton}
            />
            <Button
              title="Apply Filters"
              onPress={() => setShowFilterModal(false)}
              style={styles.filterActionButton}
            />
          </View>
        </View>
      </Modal>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Delivery Address</Text>
            <TouchableOpacity 
              onPress={() => setShowAddressModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Current Location Option */}
            <TouchableOpacity 
              style={styles.addressOption}
              onPress={() => {
                updateLocation(
                  { latitude: 37.7749, longitude: -122.4194 },
                  address || 'Current Location'
                );
                setShowAddressModal(false);
              }}
            >
              <View style={styles.addressOptionContent}>
                <Navigation size={20} color={theme.colors.primary} />
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Use Current Location</Text>
                  <Text style={styles.addressText}>
                    {address || 'Detecting your location...'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Saved Addresses */}
            <View style={styles.savedAddressesSection}>
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressOption,
                    selectedAddress?.id === addr.id && styles.addressOptionSelected
                  ]}
                  onPress={() => handleAddressSelect(addr)}
                >
                  <View style={styles.addressOptionContent}>
                    <MapPin size={20} color={theme.colors.primary} />
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      <Text style={styles.addressText}>{addr.address}</Text>
                    </View>
                    {selectedAddress?.id === addr.id && (
                      <Check size={20} color={theme.colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add New Address */}
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => {
                setShowAddressModal(false);
                router.push('/delivery-address');
              }}
            >
              <Plus size={20} color={theme.colors.primary} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Map Selector Modal */}
      <Modal
        visible={showMapSelector}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapSelector(false)}
      >
        <MapSelector
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMapSelector(false)}
          initialLocation={selectedAddress?.coordinates}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    width: screenWidth,
    marginLeft: 0,
    marginRight: 0,
  },
  header: {
    width: screenWidth,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    marginLeft: 0,
    marginRight: 0,
  },
  headerContent: {
    gap: theme.spacing.md,
    width: '100%',
  },
  greetingSection: {
    gap: theme.spacing.xs,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    opacity: 0.95,
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: theme.spacing.md,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 48,
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  cookFilterBanner: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cookFilterCard: {
    padding: theme.spacing.md,
  },
  cookFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cookFilterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cookFilterInfo: {
    flex: 1,
  },
  cookFilterName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  cookFilterRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cookFilterRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  clearFilterButton: {
    padding: theme.spacing.sm,
  },
  clearFilterButtonLarge: {
    marginTop: theme.spacing.md,
    alignSelf: 'center',
  },
  mealTypeContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  mealTypeContent: {
    gap: theme.spacing.md,
  },
  mealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    gap: theme.spacing.sm,
  },
  mealTypeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  mealTypeEmoji: {
    fontSize: 16,
  },
  mealTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  mealTypeTextActive: {
    color: 'white',
  },
  premiumBannerContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  premiumBanner: {
    padding: 0,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  premiumSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
  },
  premiumCta: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  resultsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  clearFiltersText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  foodListContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
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
  addressOption: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  addressOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceVariant,
  },
  addressOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  savedAddressesSection: {
    marginBottom: theme.spacing.xl,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    gap: theme.spacing.md,
  },
  addAddressText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  // Filter Modal Styles
  filterSection: {
    marginBottom: theme.spacing.xl,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  filterOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceVariant,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  filterOptionTextSelected: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
  priceRangeSeparator: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  distanceOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  distanceOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  distanceOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  distanceOptionTextSelected: {
    color: 'white',
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  ratingOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  ratingOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  ratingOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  ratingOptionTextSelected: {
    color: 'white',
  },
  prepTimeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  prepTimeOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  prepTimeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  prepTimeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  prepTimeOptionTextSelected: {
    color: 'white',
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  cuisineOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  cuisineOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  cuisineOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  cuisineOptionTextSelected: {
    color: 'white',
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dietaryOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  dietaryOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  dietaryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  dietaryOptionTextSelected: {
    color: 'white',
  },
  filterActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  filterActionButton: {
    flex: 1,
  },
});