import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  RefreshControl,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  Search, 
  Filter, 
  MapPin, 
  ChevronDown, 
  Clock, 
  ArrowDownUp 
} from 'lucide-react-native';
import { FoodCard } from '@/components/FoodCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  menuItemsCount: number;
  averagePrice: number;
  isOnline: boolean;
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

export default function DiscoverScreen() {
  const dimensions = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = dimensions.width >= 1024;
  const isMediumScreen = dimensions.width >= 768 && dimensions.width < 1024;
  const isSmallScreen = dimensions.width < 768;

  const { user } = useAuth();
  const { address, refreshLocation } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');
  const [selectedRange, setSelectedRange] = useState<string>('5 km');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price' | 'distance'>('popular');
  const [isFilterVisible, setIsFilterVisible] = useState(isLargeScreen);
  const [refreshing, setRefreshing] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [cooks, setCooks] = useState<{ [key: string]: CookProfile }>({});

  const getColumnCount = () => {
    if (isLargeScreen) return 3;
    if (isMediumScreen) return 2;
    return 1;
  };

  useEffect(() => {
    loadFoodItems();
  }, [selectedMealType, sortBy]);

  const loadFoodItems = async () => {
    try {
      // In a real app, this would be a fetch to Supabase or another API
      // For now we'll use mocked data 
      
      // Load cooks first
      const mockCooks: { [key: string]: CookProfile } = {
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
          menuItemsCount: 12,
          averagePrice: 16.50,
          isOnline: true,
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
          menuItemsCount: 9,
          averagePrice: 13.99,
          isOnline: true,
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
          menuItemsCount: 14,
          averagePrice: 19.99,
          isOnline: false,
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
          menuItemsCount: 8,
          averagePrice: 17.99,
          isOnline: true,
        },
        '550e8400-e29b-41d4-a716-446655440005': {
          id: '550e8400-e29b-41d4-a716-446655440005',
          name: 'Elena Papadopoulos',
          avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
          rating: 4.6,
          totalReviews: 93,
          yearsExperience: 7,
          specialties: ['Greek', 'Mediterranean', 'Traditional'],
          totalOrders: 420,
          responseTime: '< 30 min',
          isVerified: true,
          badges: ['Authentic Recipes', 'Family Tradition'],
          joinedDate: '2022-05-10',
          bio: 'Born and raised in Athens, I bring traditional Greek recipes passed down through generations to your table.',
          location: 'Castro, SF',
          distance: 3.2,
          menuItemsCount: 7,
          averagePrice: 18.99,
          isOnline: false,
        },
        '550e8400-e29b-41d4-a716-446655440006': {
          id: '550e8400-e29b-41d4-a716-446655440006',
          name: 'Marcus Campbell',
          avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
          rating: 4.8,
          totalReviews: 78,
          yearsExperience: 6,
          specialties: ['Caribbean', 'Jamaican', 'Spicy'],
          totalOrders: 380,
          responseTime: '< 20 min',
          isVerified: true,
          badges: ['Authentic Caribbean', 'Spice Master'],
          joinedDate: '2022-08-05',
          bio: 'Born in Jamaica and raised on family recipes, I bring the vibrant flavors of the Caribbean to every dish.',
          location: 'Oakland, CA',
          distance: 8.5,
          menuItemsCount: 8,
          averagePrice: 17.99,
          isOnline: true,
        },
      };
      setCooks(mockCooks);
      
      // Now load food items
      const mockItems: FoodItem[] = [
        {
          id: 'item-1',
          title: 'Homemade Pasta Carbonara',
          description: 'Fresh pasta with creamy carbonara sauce, pancetta, and fresh herbs',
          price: 16.99,
          image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440001',
          cookName: 'Maria Rodriguez',
          cookRating: 4.9,
          distance: 1.2,
          prepTime: 25,
          mealType: 'lunch',
          tags: ['Italian', 'Pasta', 'Comfort Food'],
          foodRating: 4.8,
          totalFoodReviews: 126,
          isPopular: true,
          isNew: false,
          allergens: ['Gluten', 'Dairy', 'Eggs'],
          nutritionInfo: {
            calories: 650,
            protein: 22,
            carbs: 48,
            fat: 18,
          },
        },
        {
          id: 'item-2',
          title: 'Margherita Pizza',
          description: 'Traditional wood-fired pizza with fresh mozzarella, basil, and tomato sauce',
          price: 14.99,
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440001',
          cookName: 'Maria Rodriguez',
          cookRating: 4.9,
          distance: 1.2,
          prepTime: 20,
          mealType: 'dinner',
          tags: ['Italian', 'Pizza', 'Vegetarian'],
          foodRating: 4.7,
          totalFoodReviews: 98,
          isPopular: true,
          isNew: false,
          allergens: ['Gluten', 'Dairy'],
          nutritionInfo: {
            calories: 580,
            protein: 18,
            carbs: 40,
            fat: 15,
          },
        },
        {
          id: 'item-3',
          title: 'Quinoa Buddha Bowl',
          description: 'Nutritious bowl with quinoa, roasted vegetables, avocado, and tahini dressing',
          price: 13.99,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440002',
          cookName: 'Sarah Johnson',
          cookRating: 4.7,
          distance: 0.8,
          prepTime: 15,
          mealType: 'lunch',
          tags: ['Healthy', 'Vegan', 'Gluten-Free'],
          foodRating: 4.9,
          totalFoodReviews: 112,
          isPopular: true,
          isNew: false,
          allergens: ['Sesame', 'Nuts'],
          nutritionInfo: {
            calories: 420,
            protein: 15,
            carbs: 35,
            fat: 12,
          },
        },
        {
          id: 'item-4',
          title: 'Fresh Avocado Toast',
          description: 'Artisan sourdough topped with smashed avocado, cherry tomatoes, and microgreens',
          price: 12.50,
          image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440002',
          cookName: 'Sarah Johnson',
          cookRating: 4.7,
          distance: 0.8,
          prepTime: 10,
          mealType: 'breakfast',
          tags: ['Healthy', 'Vegetarian', 'Fresh'],
          foodRating: 4.6,
          totalFoodReviews: 87,
          isPopular: true,
          isNew: false,
          allergens: ['Gluten'],
          nutritionInfo: {
            calories: 380,
            protein: 10,
            carbs: 30,
            fat: 15,
          },
        },
        {
          id: 'item-5',
          title: 'Miso Glazed Salmon',
          description: 'Pan-seared salmon with miso glaze, served with steamed rice and vegetables',
          price: 22.99,
          image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440003',
          cookName: 'David Chen',
          cookRating: 4.8,
          distance: 2.1,
          prepTime: 25,
          mealType: 'dinner',
          tags: ['Asian Fusion', 'Seafood', 'Gourmet'],
          foodRating: 4.9,
          totalFoodReviews: 76,
          isPopular: true,
          isNew: false,
          allergens: ['Fish', 'Soy'],
          nutritionInfo: {
            calories: 480,
            protein: 32,
            carbs: 28,
            fat: 8,
          },
        },
        {
          id: 'item-6',
          title: 'Kung Pao Chicken',
          description: 'Spicy Sichuan chicken with peanuts, vegetables, and chili peppers',
          price: 17.99,
          image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440003',
          cookName: 'David Chen',
          cookRating: 4.8,
          distance: 2.1,
          prepTime: 20,
          mealType: 'dinner',
          tags: ['Asian Fusion', 'Spicy', 'Traditional'],
          foodRating: 4.7,
          totalFoodReviews: 92,
          isPopular: false,
          isNew: true,
          allergens: ['Peanuts', 'Soy'],
          nutritionInfo: {
            calories: 520,
            protein: 28,
            carbs: 32,
            fat: 14,
          },
        },
        {
          id: 'item-7',
          title: 'Authentic Tonkotsu Ramen',
          description: 'Rich pork bone broth with handmade noodles, chashu pork, and soft-boiled egg',
          price: 18.99,
          image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440004',
          cookName: 'Kenji Tanaka',
          cookRating: 4.9,
          distance: 1.5,
          prepTime: 30,
          mealType: 'dinner',
          tags: ['Japanese', 'Ramen', 'Traditional'],
          foodRating: 4.9,
          totalFoodReviews: 108,
          isPopular: true,
          isNew: false,
          allergens: ['Gluten', 'Eggs', 'Soy'],
          nutritionInfo: {
            calories: 650,
            protein: 32,
            carbs: 48,
            fat: 18,
          },
        },
        {
          id: 'item-8',
          title: 'Greek Moussaka',
          description: 'Traditional layered casserole with eggplant, meat sauce, and béchamel',
          price: 19.99,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440005',
          cookName: 'Elena Papadopoulos',
          cookRating: 4.6,
          distance: 3.2,
          prepTime: 35,
          mealType: 'dinner',
          tags: ['Greek', 'Mediterranean', 'Traditional'],
          foodRating: 4.8,
          totalFoodReviews: 62,
          isPopular: false,
          isNew: true,
          allergens: ['Dairy', 'Gluten'],
          nutritionInfo: {
            calories: 580,
            protein: 26,
            carbs: 30,
            fat: 22,
          },
        },
        {
          id: 'item-9',
          title: 'Jerk Chicken with Rice and Peas',
          description: 'Authentic Caribbean jerk chicken with coconut rice and kidney beans',
          price: 16.99,
          image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
          cookId: '550e8400-e29b-41d4-a716-446655440006',
          cookName: 'Marcus Campbell',
          cookRating: 4.8,
          distance: 8.5,
          prepTime: 30,
          mealType: 'dinner',
          tags: ['Caribbean', 'Spicy', 'Traditional'],
          foodRating: 4.7,
          totalFoodReviews: 58,
          isPopular: false,
          isNew: true,
          allergens: ['None'],
          nutritionInfo: {
            calories: 620,
            protein: 35,
            carbs: 42,
            fat: 16,
          },
        },
      ];

      // Filter by meal type if needed
      let filteredItems = mockItems;
      if (selectedMealType !== 'all') {
        filteredItems = mockItems.filter(item => item.mealType === selectedMealType);
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(
          item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.cookName.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Sort items
      switch (sortBy) {
        case 'rating':
          filteredItems.sort((a, b) => b.foodRating - a.foodRating);
          break;
        case 'price':
          filteredItems.sort((a, b) => a.price - b.price);
          break;
        case 'distance':
          filteredItems.sort((a, b) => a.distance - b.distance);
          break;
        case 'popular':
        default:
          // First show popular items, then sort by rating
          filteredItems.sort((a, b) => {
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;
            return b.foodRating - a.foodRating;
          });
      }

      setFoodItems(filteredItems);
    } catch (error) {
      console.error('Error loading food items:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    await loadFoodItems();
    setRefreshing(false);
  };

  const handleFoodPress = (foodItem: FoodItem) => {
    router.push({
      pathname: '/food-detail',
      params: { foodItem: JSON.stringify(foodItem) }
    });
  };

  const handleCookPress = (cookId: string) => {
    router.push({
      pathname: '/(tabs)/cook',
      params: { cookId }
    });
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View style={[
      styles.foodItemContainer,
      isWeb && {
        width: isLargeScreen 
          ? `${100 / getColumnCount()}%` 
          : (isMediumScreen ? '50%' : '100%')
      }
    ]}>
      <FoodCard
        item={item}
        cook={cooks[item.cookId]}
        onPress={() => handleFoodPress(item)}
        onCookPress={() => handleCookPress(item.cookId)}
      />
    </View>
  );

  // Responsive layout for web
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="white" />
            <Text style={styles.locationText} numberOfLines={1}>
              {address || 'Set your location'}
            </Text>
            <ChevronDown size={16} color="white" />
          </View>
          
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>
            Find amazing homemade meals from local cooks
          </Text>

          <View style={[
            styles.searchContainer,
            isWeb && isLargeScreen && { maxWidth: 600, alignSelf: 'center', width: '100%' }
          ]}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
              <Input
                placeholder="Search for dishes, cooks, or cuisines..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                onSubmitEditing={loadFoodItems}
              />
            </View>
          </View>

          <View style={[
            styles.mealTypeSelector,
            isWeb && isLargeScreen && { maxWidth: 600, alignSelf: 'center', width: '100%', justifyContent: 'center' }
          ]}>
            {['all', 'breakfast', 'lunch', 'dinner'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type && styles.mealTypeButtonSelected,
                ]}
                onPress={() => setSelectedMealType(type as any)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    selectedMealType === type && styles.mealTypeTextSelected,
                  ]}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={[
        styles.content,
        isWeb && isLargeScreen && styles.webContentLarge,
        isWeb && isMediumScreen && styles.webContentMedium,
      ]}>
        {/* Sidebar for large screens */}
        {isWeb && isLargeScreen && (
          <View style={styles.sidebar}>
            <Card style={styles.filtersCard}>
              <Text style={styles.filtersTitle}>Filters</Text>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Meal Type</Text>
                <View style={styles.filterOptions}>
                  {['all', 'breakfast', 'lunch', 'dinner'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        selectedMealType === type && styles.filterOptionSelected,
                      ]}
                      onPress={() => setSelectedMealType(type as any)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedMealType === type && styles.filterOptionTextSelected,
                        ]}
                      >
                        {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Distance</Text>
                <View style={styles.filterOptions}>
                  {['1 km', '5 km', '10 km', '20 km'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.filterOption,
                        selectedRange === range && styles.filterOptionSelected,
                      ]}
                      onPress={() => setSelectedRange(range)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedRange === range && styles.filterOptionTextSelected,
                        ]}
                      >
                        {range}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: 'popular', label: 'Popular' },
                    { value: 'rating', label: 'Rating' },
                    { value: 'price', label: 'Price' },
                    { value: 'distance', label: 'Distance' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        sortBy === option.value && styles.filterOptionSelected,
                      ]}
                      onPress={() => setSortBy(option.value as any)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          sortBy === option.value && styles.filterOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>

            <Card style={styles.deliveryCard}>
              <Text style={styles.deliveryTitle}>Delivery Address</Text>
              <View style={styles.addressRow}>
                <MapPin size={20} color={theme.colors.primary} />
                <Text style={styles.addressText} numberOfLines={2}>
                  {address || 'Set your delivery address'}
                </Text>
              </View>
              <Button 
                title="Change Address" 
                variant="outline"
                size="small"
                onPress={() => router.push('/delivery-address')}
                style={styles.addressButton}
              />
            </Card>
          </View>
        )}

        {/* Main Content */}
        <View style={[
          styles.mainContent,
          isWeb && isLargeScreen && { flexDirection: 'row', flexWrap: 'wrap' }
        ]}>
          {/* Mobile Filter Button */}
          {!isLargeScreen && (
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setIsFilterVisible(!isFilterVisible)}
              >
                <Filter size={20} color={theme.colors.primary} />
                <Text style={styles.filterButtonText}>Filters</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => {
                  // Show sort options modal or dropdown for mobile
                  // For simplicity, we'll just cycle through sort options
                  const sortOptions: Array<'popular' | 'rating' | 'price' | 'distance'> = [
                    'popular', 'rating', 'price', 'distance'
                  ];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex]);
                }}
              >
                <ArrowDownUp size={20} color={theme.colors.primary} />
                <Text style={styles.sortButtonText}>
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mobile Filters (collapsible) */}
          {!isLargeScreen && isFilterVisible && (
            <Card style={styles.mobileFiltersCard}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Meal Type</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalFilterOptions}
                >
                  {['all', 'breakfast', 'lunch', 'dinner'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        selectedMealType === type && styles.filterOptionSelected,
                      ]}
                      onPress={() => setSelectedMealType(type as any)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedMealType === type && styles.filterOptionTextSelected,
                        ]}
                      >
                        {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Distance</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalFilterOptions}
                >
                  {['1 km', '5 km', '10 km', '20 km'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.filterOption,
                        selectedRange === range && styles.filterOptionSelected,
                      ]}
                      onPress={() => setSelectedRange(range)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedRange === range && styles.filterOptionTextSelected,
                        ]}
                      >
                        {range}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Card>
          )}

          {/* Food Items Display */}
          {isWeb && !isSmallScreen ? (
            <View style={styles.webGrid}>
              {foodItems.map(item => (
                <View key={item.id} style={[
                  styles.webGridItem, 
                  { width: isLargeScreen ? '33.33%' : '50%' }
                ]}>
                  <FoodCard
                    item={item}
                    cook={cooks[item.cookId]}
                    onPress={() => handleFoodPress(item)}
                    onCookPress={() => handleCookPress(item.cookId)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              data={foodItems}
              renderItem={renderFoodItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              numColumns={isWeb ? getColumnCount() : 1}
              key={isWeb ? getColumnCount() : 'single-column'}
              contentContainerStyle={styles.foodList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No dishes found</Text>
                  <Text style={styles.emptyText}>
                    Try adjusting your filters or search term
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    marginHorizontal: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  searchInputContainer: {
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
    backgroundColor: 'white',
    borderWidth: 0,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: theme.spacing.sm,
  },
  mealTypeButtonSelected: {
    backgroundColor: 'white',
  },
  mealTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  mealTypeTextSelected: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
  },
  webContentLarge: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
  },
  webContentMedium: {
    padding: theme.spacing.lg,
  },
  sidebar: {
    width: 300,
    paddingRight: theme.spacing.lg,
  },
  filtersCard: {
    marginBottom: theme.spacing.lg,
  },
  filtersTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  horizontalFilterOptions: {
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  deliveryCard: {
    marginBottom: theme.spacing.lg,
  },
  deliveryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  addressButton: {
    alignSelf: 'flex-start',
  },
  mainContent: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  mobileFiltersCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  foodList: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  foodItemContainer: {
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
  },
  webGridItem: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  }
});