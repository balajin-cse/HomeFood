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
import { Search, MapPin, Filter, Crown, ChevronDown, Plus, Check, Navigation, X, Star, Award, Clock, Users, Heart, ChefHat, TrendingUp, DollarSign, Package } from 'lucide-react-native';
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

// Cook Kitchen Management Interface
function CookKitchenInterface() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    total: 0,
    totalOrders: 0,
    completedOrders: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    mealType: 'lunch' as 'breakfast' | 'lunch' | 'dinner',
    availableQuantity: '',
    tags: '',
  });

  useEffect(() => {
    loadCookData();
  }, []);

  const loadCookData = async () => {
    try {
      // Load menu items
      const storedItems = await AsyncStorage.getItem(`menuItems_${user?.id}`);
      if (storedItems) {
        setMenuItems(JSON.parse(storedItems));
      } else {
        // Create some default menu items for the cook
        const defaultItems = [
          {
            id: '1',
            title: 'Homemade Pasta Carbonara',
            description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese',
            price: 16.99,
            mealType: 'lunch',
            availableQuantity: 10,
            tags: ['Italian', 'Pasta', 'Creamy'],
            isActive: true,
            cookId: user?.id || '1',
            rating: 4.8,
            totalReviews: 23,
            image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          {
            id: '2',
            title: 'Margherita Pizza',
            description: 'Traditional Neapolitan pizza with fresh mozzarella, basil, and San Marzano tomatoes',
            price: 19.99,
            mealType: 'dinner',
            availableQuantity: 8,
            tags: ['Italian', 'Pizza', 'Traditional'],
            isActive: true,
            cookId: user?.id || '1',
            rating: 4.7,
            totalReviews: 45,
            image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          {
            id: '3',
            title: 'Osso Buco Risotto',
            description: 'Slow-braised veal shanks with creamy saffron risotto and gremolata',
            price: 28.99,
            mealType: 'dinner',
            availableQuantity: 5,
            tags: ['Italian', 'Gourmet', 'Risotto'],
            isActive: true,
            cookId: user?.id || '1',
            rating: 4.9,
            totalReviews: 32,
            image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          {
            id: '4',
            title: 'Tiramisu',
            description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
            price: 8.99,
            mealType: 'dinner',
            availableQuantity: 12,
            tags: ['Italian', 'Dessert', 'Coffee'],
            isActive: true,
            cookId: user?.id || '1',
            rating: 4.9,
            totalReviews: 67,
            image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          {
            id: '5',
            title: 'Bruschetta Trio',
            description: 'Three varieties: classic tomato, mushroom, and ricotta with honey',
            price: 12.99,
            mealType: 'lunch',
            availableQuantity: 15,
            tags: ['Italian', 'Appetizer', 'Fresh'],
            isActive: true,
            cookId: user?.id || '1',
            rating: 4.6,
            totalReviews: 28,
            image: 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
        ];
        setMenuItems(defaultItems);
        await AsyncStorage.setItem(`menuItems_${user?.id}`, JSON.stringify(defaultItems));
      }

      // Load orders
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        const cookOrders = allOrders.filter((order: any) => 
          order.cookId === user?.id || order.cookName === user?.name
        );
        setOrders(cookOrders);

        // Calculate earnings
        const today = new Date().toDateString();
        const todayEarnings = cookOrders
          .filter((order: any) => {
            const orderDate = new Date(order.orderDate);
            return orderDate.toDateString() === today && order.status === 'delivered';
          })
          .reduce((total: number, order: any) => total + (order.totalPrice * 0.85), 0);

        const totalEarnings = cookOrders
          .filter((order: any) => order.status === 'delivered')
          .reduce((total: number, order: any) => total + (order.totalPrice * 0.85), 0);

        const completedOrders = cookOrders.filter((order: any) => order.status === 'delivered').length;

        setEarnings({
          today: todayEarnings,
          total: totalEarnings,
          totalOrders: cookOrders.length,
          completedOrders,
        });
      }
    } catch (error) {
      console.error('Error loading cook data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCookData();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.price || !newItem.availableQuantity) {
      alert('Please fill in all fields');
      return;
    }

    const item = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      price: parseFloat(newItem.price),
      mealType: newItem.mealType,
      availableQuantity: parseInt(newItem.availableQuantity),
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isActive: true,
      cookId: user?.id || '1',
      rating: 0,
      totalReviews: 0,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    };

    const updatedItems = [...menuItems, item];
    setMenuItems(updatedItems);
    
    try {
      await AsyncStorage.setItem(`menuItems_${user?.id}`, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error saving menu items:', error);
    }

    setNewItem({
      title: '',
      description: '',
      price: '',
      mealType: 'lunch',
      availableQuantity: '',
      tags: '',
    });
    setShowAddForm(false);
    alert('Menu item added successfully!');
  };

  const toggleItemStatus = async (id: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setMenuItems(updatedItems);
    
    try {
      await AsyncStorage.setItem(`menuItems_${user?.id}`, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error saving menu items:', error);
    }
  };

  const activeOrders = orders.filter(order => 
    ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ChefHat size={32} color="white" />
          <Text style={styles.headerTitle}>My Kitchen</Text>
          <Text style={styles.headerSubtitle}>
            Manage your menu and track your success
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings Dashboard */}
        <Card style={styles.earningsCard}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.earningsGrid}>
            <View style={styles.earningItem}>
              <DollarSign size={24} color={theme.colors.success} />
              <Text style={styles.earningValue}>${earnings.today.toFixed(2)}</Text>
              <Text style={styles.earningLabel}>Today's Earnings</Text>
            </View>
            <View style={styles.earningItem}>
              <TrendingUp size={24} color={theme.colors.primary} />
              <Text style={styles.earningValue}>${earnings.total.toFixed(2)}</Text>
              <Text style={styles.earningLabel}>Total Earnings</Text>
            </View>
            <View style={styles.earningItem}>
              <Package size={24} color={theme.colors.secondary} />
              <Text style={styles.earningValue}>{activeOrders.length}</Text>
              <Text style={styles.earningLabel}>Active Orders</Text>
            </View>
            <View style={styles.earningItem}>
              <Star size={24} color={theme.colors.secondary} />
              <Text style={styles.earningValue}>{earnings.completedOrders}</Text>
              <Text style={styles.earningLabel}>Completed</Text>
            </View>
          </View>
        </Card>

        {/* Active Orders Preview */}
        {activeOrders.length > 0 && (
          <Card style={styles.ordersPreviewCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {activeOrders.slice(0, 3).map((order) => (
              <View key={order.orderId} style={styles.orderPreviewItem}>
                <View style={styles.orderPreviewInfo}>
                  <Text style={styles.orderPreviewTitle}>
                    {order.items[0]?.title || 'Order'} 
                    {order.items.length > 1 && ` +${order.items.length - 1} more`}
                  </Text>
                  <Text style={styles.orderPreviewCustomer}>
                    {order.customerName} • ${order.totalPrice.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.orderPreviewStatus, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.orderPreviewStatusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Add Menu Item Form */}
        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Menu Item</Text>
            
            <Input
              label="Dish Name"
              placeholder="e.g., Homemade Pasta Carbonara"
              value={newItem.title}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, title: text }))}
            />

            <Input
              label="Description"
              placeholder="Describe your delicious dish..."
              value={newItem.description}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />

            <Input
              label="Price ($)"
              placeholder="16.99"
              value={newItem.price}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />

            <Input
              label="Available Quantity"
              placeholder="10"
              value={newItem.availableQuantity}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, availableQuantity: text }))}
              keyboardType="numeric"
            />

            <Input
              label="Tags (comma separated)"
              placeholder="Italian, Pasta, Creamy"
              value={newItem.tags}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, tags: text }))}
            />

            <View style={styles.mealTypeContainer}>
              <Text style={styles.mealTypeLabel}>Meal Type:</Text>
              <View style={styles.mealTypeButtons}>
                {['breakfast', 'lunch', 'dinner'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      newItem.mealType === type && styles.mealTypeButtonActive
                    ]}
                    onPress={() => setNewItem(prev => ({ ...prev, mealType: type as any }))}
                  >
                    <Text style={[
                      styles.mealTypeButtonText,
                      newItem.mealType === type && styles.mealTypeButtonTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddForm(false)}
                style={styles.cancelButton}
              />
              <Button
                title="Add Item"
                onPress={handleAddItem}
                style={styles.addButton}
              />
            </View>
          </Card>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Menu ({menuItems.length})</Text>
            <TouchableOpacity 
              style={styles.addMenuButton}
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={20} color={theme.colors.primary} />
              <Text style={styles.addMenuText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <Card key={item.id} style={styles.menuCard}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.menuQuantity}>Available: {item.availableQuantity}</Text>
                  <View style={styles.menuTags}>
                    {item.tags.slice(0, 2).map((tag: string) => (
                      <View key={tag} style={styles.menuTag}>
                        <Text style={styles.menuTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.statusToggle,
                      item.isActive ? styles.statusToggleActive : styles.statusToggleInactive
                    ]}
                    onPress={() => toggleItemStatus(item.id)}
                  >
                    <Text style={[
                      styles.statusToggleText,
                      item.isActive ? styles.statusToggleTextActive : styles.statusToggleTextInactive
                    ]}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Customer Discover Interface (existing functionality)
function CustomerDiscoverInterface() {
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

  useEffect(() => {
    loadFoodItems();
    loadCooks();
    if (!selectedAddress && savedAddresses.length > 0) {
      setSelectedAddress(savedAddresses[0]);
    }
    
    if (params.cookId) {
      setSelectedCookId(params.cookId as string);
    }
  }, [params.cookId]);

  const loadCooks = async () => {
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
    ];
    setCooks(mockCooks);
  };

  const loadFoodItems = async () => {
    try {
      // Load all menu items from all cooks
      const allFoodItems: FoodItem[] = [];
      
      // Load items from cook storage
      const cookIds = ['ck-maria', 'ck-sarah', 'ck-david', 'ck-kenji', 'ck-elena', 'ck-marcus'];
      
      for (const cookId of cookIds) {
        try {
          const storedItems = await AsyncStorage.getItem(`menuItems_${cookId}`);
          if (storedItems) {
            const items = JSON.parse(storedItems);
            const formattedItems = items.map((item: any) => ({
              ...item,
              cookId: cookId,
              cookName: getCookNameById(cookId),
              cookRating: 4.8,
              distance: Math.random() * 3 + 0.5,
              foodRating: item.rating || 4.5,
              totalFoodReviews: item.totalReviews || 25,
              isPopular: Math.random() > 0.7,
              isNew: Math.random() > 0.8,
              allergens: ['Gluten', 'Dairy'],
              nutritionInfo: {
                calories: 450,
                protein: 25,
                carbs: 35,
                fat: 20,
              },
            }));
            allFoodItems.push(...formattedItems);
          }
        } catch (error) {
          console.error(`Error loading items for cook ${cookId}:`, error);
        }
      }

      setFoodItems(allFoodItems);
    } catch (error) {
      console.error('Error loading food items:', error);
    }
  };

  const getCookNameById = (cookId: string): string => {
    const cookNames: { [key: string]: string } = {
      'ck-maria': 'Maria Rodriguez',
      'ck-sarah': 'Sarah Johnson',
      'ck-david': 'David Chen',
      'ck-kenji': 'Kenji Tanaka',
      'ck-elena': 'Elena Papadopoulos',
      'ck-marcus': 'Marcus Campbell',
    };
    return cookNames[cookId] || 'Unknown Cook';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoodItems();
    await loadCooks();
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
        {/* Header */}
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

        {/* Premium Banner */}
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

      {/* Modals */}
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

// Helper functions
const getStatusColor = (status: string) => {
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
};

const getStatusText = (status: string) => {
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
};

// Main component
export default function HomeScreen() {
  const { user } = useAuth();

  // Show cook interface for cooks, customer interface for customers
  if (user?.isCook) {
    return <CookKitchenInterface />;
  }

  return <CustomerDiscoverInterface />;
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
    alignItems: 'center',
  },
  greetingSection: {
    gap: theme.spacing.xs,
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 28,
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
    lineHeight: 24,
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
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
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
  // Cook Kitchen Interface Styles
  earningsCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  earningItem: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  earningValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginVertical: theme.spacing.sm,
  },
  earningLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  ordersPreviewCard: {
    marginHorizontal: theme.spacing.lg,
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
  orderPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  orderPreviewInfo: {
    flex: 1,
  },
  orderPreviewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  orderPreviewCustomer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  orderPreviewStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  orderPreviewStatusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  addForm: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  mealTypeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  mealTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  mealTypeButtonTextActive: {
    color: 'white',
  },
  formButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  addMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  addMenuText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  menuGrid: {
    gap: theme.spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  menuPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  menuQuantity: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
  },
  menuTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  menuTag: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  menuTagText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  statusToggle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusToggleActive: {
    backgroundColor: theme.colors.success,
  },
  statusToggleInactive: {
    backgroundColor: theme.colors.outline,
  },
  statusToggleText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  statusToggleTextActive: {
    color: 'white',
  },
  statusToggleTextInactive: {
    color: theme.colors.onSurfaceVariant,
  },
});