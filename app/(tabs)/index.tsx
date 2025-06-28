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
import { Search, MapPin, Filter, Crown, ChevronDown, Plus, Check, Navigation, X, Star, Award, Clock, Users, Heart, ChefHat, Package, TrendingUp, DollarSign } from 'lucide-react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  availableQuantity: number;
  tags: string[];
  isActive: boolean;
  cookId: string;
  rating: number;
  totalReviews: number;
  image: string;
}

interface Order {
  orderId: string;
  trackingNumber: string;
  items: any[];
  cookId: string;
  cookName: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  quantity: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  deliveryInstructions?: string;
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

const MEAL_TYPES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🥐' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
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
  const [selectedCook, setSelectedCook] = useState<CookProfile | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
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

  // Cook-specific state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cookOrders, setCookOrders] = useState<Order[]>([]);
  const [cookStats, setCookStats] = useState({
    totalEarnings: 0,
    todayOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    if (user?.isCook) {
      loadCookData();
    } else {
      loadCustomerData();
    }
  }, [user, params.cookId]);

  const loadCookData = async () => {
    await loadMenuItems();
    await loadCookOrders();
    calculateCookStats();
  };

  const loadCustomerData = async () => {
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
  };

  const loadMenuItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(`menuItems_${user?.id}`);
      if (storedItems) {
        setMenuItems(JSON.parse(storedItems));
      } else {
        // Default items for demo
        const mockItems: MenuItem[] = [
          {
            id: '1',
            title: 'Homemade Pasta Carbonara',
            description: 'Fresh pasta with creamy sauce',
            price: 16.99,
            mealType: 'lunch',
            availableQuantity: 5,
            tags: ['Italian', 'Pasta'],
            isActive: true,
            cookId: user?.id || '1',
            rating: 4.8,
            totalReviews: 23,
            image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
        ];
        setMenuItems(mockItems);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const loadCookOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        // Filter orders for this cook
        const cookSpecificOrders = allOrders.filter((order: Order) => 
          order.cookId === user?.id || order.cookName === user?.name
        );
        setCookOrders(cookSpecificOrders);
      }
    } catch (error) {
      console.error('Error loading cook orders:', error);
    }
  };

  const calculateCookStats = () => {
    const today = new Date().toDateString();
    const todayOrders = cookOrders.filter(order => 
      new Date(order.orderDate).toDateString() === today
    );
    const activeOrders = cookOrders.filter(order => 
      ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
    );
    const completedOrders = cookOrders.filter(order => 
      order.status === 'delivered'
    );
    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    setCookStats({
      totalEarnings,
      todayOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
    });
  };

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
      // Additional items for Maria Rodriguez
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
    ];
    setFoodItems(mockFoodItems);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.isCook) {
      await loadCookData();
    } else {
      await loadFoodItems();
      await loadCooks();
    }
    setRefreshing(false);
  };

  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.cookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMealType = selectedMealType === 'all' || item.mealType === selectedMealType;
    const matchesCook = !selectedCookId || item.cookId === selectedCookId;
    return matchesSearch && matchesMealType && matchesCook;
  });

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayAddress = selectedAddress?.address || address || 'Getting your location...';
  const selectedCookData = selectedCookId ? cooks.find(c => c.id === selectedCookId) : null;

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

  // Cook Dashboard View
  if (user?.isCook) {
    return (
      <View style={styles.container}>
        {/* Cook Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{getGreeting()}!</Text>
              <Text style={styles.userName}>{user?.name || 'Chef'}</Text>
            </View>
            
            <View style={styles.cookStatsRow}>
              <View style={styles.statCard}>
                <DollarSign size={20} color="white" />
                <Text style={styles.statValue}>${cookStats.totalEarnings.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statCard}>
                <Package size={20} color="white" />
                <Text style={styles.statValue}>{cookStats.activeOrders}</Text>
                <Text style={styles.statLabel}>Active Orders</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={20} color="white" />
                <Text style={styles.statValue}>{cookStats.todayOrders}</Text>
                <Text style={styles.statLabel}>Today's Orders</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/orders')}
            >
              <Package size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionTitle}>Manage Orders</Text>
              <Text style={styles.quickActionSubtitle}>{cookStats.activeOrders} active</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/delivery')}
            >
              <Truck size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionTitle}>Delivery</Text>
              <Text style={styles.quickActionSubtitle}>Ready orders</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Orders */}
          <Card style={styles.recentOrdersCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {cookOrders.slice(0, 3).map((order) => (
              <View key={order.orderId} style={styles.orderPreview}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>
                    {order.items[0]?.title || 'Order'} 
                    {order.items.length > 1 && ` +${order.items.length - 1} more`}
                  </Text>
                  <Text style={styles.orderCustomer}>
                    {order.customerName} • ${order.totalPrice.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>
            ))}

            {cookOrders.length === 0 && (
              <View style={styles.emptyOrders}>
                <Package size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyOrdersText}>No orders yet</Text>
              </View>
            )}
          </Card>

          {/* Menu Items */}
          <Card style={styles.menuCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Menu</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/cook')}>
                <Text style={styles.viewAllText}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            {menuItems.slice(0, 2).map((item) => (
              <View key={item.id} style={styles.menuPreview}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.menuQuantity}>Available: {item.availableQuantity}</Text>
                </View>
                <View style={[styles.activeIndicator, { backgroundColor: item.isActive ? theme.colors.success : theme.colors.outline }]} />
              </View>
            ))}

            {menuItems.length === 0 && (
              <View style={styles.emptyMenu}>
                <ChefHat size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyMenuText}>Add your first dish</Text>
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    );
  }

  // Customer Discovery View (existing code)
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
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={theme.colors.primary} />
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
                  : 'Try adjusting your search or meal type filter'
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
                  onPress={() => {
                    setShowCookProfile(false);
                    setSelectedCookId(selectedCook.id);
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

  function getStatusColor(status: Order['status']) {
    switch (status) {
      case 'confirmed':
        return '#FF9800';
      case 'preparing':
        return theme.colors.primary;
      case 'ready':
        return theme.colors.secondary;
      case 'picked_up':
        return '#2196F3';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return theme.colors.onSurface;
    }
  }

  function getStatusText(status: Order['status']) {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'picked_up':
        return 'Picked Up';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  // Cook Dashboard Styles
  cookStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
    gap: theme.spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  recentOrdersCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  orderPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  orderCustomer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyOrdersText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  menuCard: {
    marginBottom: theme.spacing.lg,
  },
  menuPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    gap: theme.spacing.md,
  },
  menuImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  menuPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  menuQuantity: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyMenu: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyMenuText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
});