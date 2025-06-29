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
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, MapPin, Filter, Crown, ChevronDown, Plus, Check, Navigation, X, Star, Award, Clock, Users, Heart, ChefHat, TrendingUp, Package, DollarSign } from 'lucide-react-native';
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

const MEAL_TYPES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🥐' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
];

// Cook Kitchen Interface
function CookKitchenInterface() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({ today: 0, total: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
        // Generate default menu items based on cook specialties
        const defaultItems = generateDefaultMenuItems();
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
      }

      // Load earnings
      const storedEarnings = await AsyncStorage.getItem('cookEarnings');
      if (storedEarnings) {
        const allEarnings = JSON.parse(storedEarnings);
        const cookEarnings = allEarnings[user?.id || ''];
        if (cookEarnings) {
          setEarnings({
            today: cookEarnings.todayEarnings || 0,
            total: cookEarnings.totalEarnings || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading cook data:', error);
    }
  };

  const generateDefaultMenuItems = (): MenuItem[] => {
    const cookSpecialties = getCookSpecialties(user?.name || '');
    const baseItems = getMenuItemsForSpecialties(cookSpecialties);
    
    return baseItems.map((item, index) => ({
      ...item,
      id: `${user?.id}_${index}`,
      cookId: user?.id || '',
      rating: 4.5 + Math.random() * 0.5,
      totalReviews: Math.floor(Math.random() * 50) + 10,
    }));
  };

  const getCookSpecialties = (cookName: string): string[] => {
    const specialtyMap: { [key: string]: string[] } = {
      'Maria Rodriguez': ['Italian', 'Mediterranean', 'Pasta'],
      'Sarah Johnson': ['Healthy', 'Vegan', 'Organic'],
      'David Chen': ['Asian Fusion', 'Seafood', 'Gourmet'],
      'Kenji Tanaka': ['Japanese', 'Ramen', 'Traditional'],
      'Elena Papadopoulos': ['Greek', 'Mediterranean', 'Healthy'],
      'Marcus Campbell': ['Caribbean', 'BBQ', 'Spicy'],
    };
    
    return specialtyMap[cookName] || ['International', 'Comfort Food', 'Homestyle'];
  };

  const getMenuItemsForSpecialties = (specialties: string[]): Omit<MenuItem, 'id' | 'cookId' | 'rating' | 'totalReviews'>[] => {
    const itemsBySpecialty: { [key: string]: any[] } = {
      'Italian': [
        {
          title: 'Homemade Pasta Carbonara',
          description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese',
          price: 16.99,
          mealType: 'lunch',
          availableQuantity: 8,
          tags: ['Italian', 'Pasta', 'Creamy', 'Comfort Food'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Margherita Pizza',
          description: 'Traditional Neapolitan pizza with fresh mozzarella, basil, and San Marzano tomatoes',
          price: 19.99,
          mealType: 'dinner',
          availableQuantity: 6,
          tags: ['Italian', 'Pizza', 'Traditional', 'Vegetarian'],
          isActive: true,
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Osso Buco Risotto',
          description: 'Slow-braised veal shanks with creamy saffron risotto and gremolata',
          price: 28.99,
          mealType: 'dinner',
          availableQuantity: 4,
          tags: ['Italian', 'Gourmet', 'Risotto', 'Meat'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Tiramisu',
          description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
          price: 8.99,
          mealType: 'dinner',
          availableQuantity: 10,
          tags: ['Italian', 'Dessert', 'Coffee', 'Sweet'],
          isActive: true,
          image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ],
      'Healthy': [
        {
          title: 'Artisan Avocado Toast',
          description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, and microgreens',
          price: 12.50,
          mealType: 'breakfast',
          availableQuantity: 12,
          tags: ['Healthy', 'Vegetarian', 'Fresh', 'Organic'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Superfood Buddha Bowl',
          description: 'Quinoa bowl with roasted vegetables, chickpeas, and tahini dressing',
          price: 15.99,
          mealType: 'lunch',
          availableQuantity: 8,
          tags: ['Healthy', 'Vegan', 'Protein Rich', 'Colorful'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Green Goddess Smoothie Bowl',
          description: 'Spinach and mango smoothie bowl topped with granola and fresh berries',
          price: 11.99,
          mealType: 'breakfast',
          availableQuantity: 10,
          tags: ['Healthy', 'Smoothie', 'Fresh', 'Energizing'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ],
      'Asian Fusion': [
        {
          title: 'Korean BBQ Bowl',
          description: 'Marinated bulgogi beef with steamed rice, kimchi, and sesame vegetables',
          price: 18.99,
          mealType: 'lunch',
          availableQuantity: 6,
          tags: ['Korean', 'BBQ', 'Spicy', 'Rice Bowl'],
          isActive: true,
          image: 'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Thai Green Curry',
          description: 'Aromatic green curry with coconut milk, Thai basil, and jasmine rice',
          price: 17.50,
          mealType: 'dinner',
          availableQuantity: 8,
          tags: ['Thai', 'Spicy', 'Coconut', 'Aromatic'],
          isActive: true,
          image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Seafood Paella',
          description: 'Spanish-style paella with fresh seafood, saffron rice, and vegetables',
          price: 24.99,
          mealType: 'dinner',
          availableQuantity: 4,
          tags: ['Spanish', 'Seafood', 'Rice', 'Gourmet'],
          isActive: true,
          image: 'https://images.pexels.com/photos/16743489/pexels-photo-16743489.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ],
      'Japanese': [
        {
          title: 'Authentic Ramen Bowl',
          description: 'Rich tonkotsu broth with handmade noodles, chashu pork, and soft-boiled egg',
          price: 18.99,
          mealType: 'lunch',
          availableQuantity: 6,
          tags: ['Japanese', 'Ramen', 'Comfort Food', 'Authentic'],
          isActive: true,
          image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Chirashi Bowl',
          description: 'Fresh sashimi over seasoned sushi rice with pickled vegetables',
          price: 22.99,
          mealType: 'lunch',
          availableQuantity: 5,
          tags: ['Japanese', 'Sushi', 'Fresh', 'Raw Fish'],
          isActive: true,
          image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Miso Ramen',
          description: 'Hearty miso-based ramen with corn, green onions, and bamboo shoots',
          price: 16.99,
          mealType: 'dinner',
          availableQuantity: 8,
          tags: ['Japanese', 'Ramen', 'Miso', 'Vegetarian Option'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ],
      'Greek': [
        {
          title: 'Traditional Moussaka',
          description: 'Layered eggplant casserole with ground lamb and béchamel sauce',
          price: 19.99,
          mealType: 'dinner',
          availableQuantity: 6,
          tags: ['Greek', 'Traditional', 'Casserole', 'Lamb'],
          isActive: true,
          image: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Greek Village Salad',
          description: 'Fresh tomatoes, cucumbers, olives, and feta with olive oil dressing',
          price: 13.99,
          mealType: 'lunch',
          availableQuantity: 10,
          tags: ['Greek', 'Salad', 'Fresh', 'Vegetarian'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Souvlaki Platter',
          description: 'Grilled chicken skewers with tzatziki, pita bread, and Greek potatoes',
          price: 17.99,
          mealType: 'dinner',
          availableQuantity: 8,
          tags: ['Greek', 'Grilled', 'Chicken', 'Traditional'],
          isActive: true,
          image: 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ],
      'Caribbean': [
        {
          title: 'Jerk Chicken',
          description: 'Spicy marinated chicken with rice and peas and fried plantains',
          price: 18.99,
          mealType: 'dinner',
          availableQuantity: 6,
          tags: ['Caribbean', 'Spicy', 'Chicken', 'Island Flavors'],
          isActive: true,
          image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Curry Goat',
          description: 'Tender goat meat in aromatic Caribbean curry with rice',
          price: 21.99,
          mealType: 'dinner',
          availableQuantity: 4,
          tags: ['Caribbean', 'Curry', 'Goat', 'Spicy'],
          isActive: true,
          image: 'https://images.pexels.com/photos/8477552/pexels-photo-8477552.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          title: 'Ackee and Saltfish',
          description: 'Jamaica\'s national dish with ackee fruit and salted cod',
          price: 16.99,
          mealType: 'breakfast',
          availableQuantity: 5,
          tags: ['Caribbean', 'Traditional', 'Fish', 'Jamaican'],
          isActive: true,
          image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ],
    };

    let allItems: any[] = [];
    specialties.forEach(specialty => {
      if (itemsBySpecialty[specialty]) {
        allItems = [...allItems, ...itemsBySpecialty[specialty]];
      }
    });

    // Add some generic items if no specialties match
    if (allItems.length === 0) {
      allItems = [
        {
          title: 'Homestyle Comfort Bowl',
          description: 'A hearty bowl of comfort food made with love',
          price: 14.99,
          mealType: 'lunch',
          availableQuantity: 8,
          tags: ['Comfort Food', 'Homestyle', 'Hearty'],
          isActive: true,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ];
    }

    return allItems;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCookData();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.price || !newItem.availableQuantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      price: parseFloat(newItem.price),
      mealType: newItem.mealType,
      availableQuantity: parseInt(newItem.availableQuantity),
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isActive: true,
      cookId: user?.id || '',
      rating: 0,
      totalReviews: 0,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
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
    Alert.alert('Success', 'Menu item added successfully!');
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
        
        {/* Dashboard Stats */}
        <View style={styles.dashboardStats}>
          <View style={styles.statCard}>
            <DollarSign size={20} color="white" />
            <Text style={styles.statValue}>${earnings.today.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="white" />
            <Text style={styles.statValue}>{menuItems.length}</Text>
            <Text style={styles.statLabel}>Menu Items</Text>
          </View>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Package size={20} color="white" />
            <Text style={styles.statValue}>{activeOrders.length}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </TouchableOpacity>
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
            style={styles.quickActionButton}
            onPress={() => setShowAddForm(true)}
          >
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Add Dish</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Package size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>View Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/delivery')}
          >
            <TrendingUp size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Delivery</Text>
          </TouchableOpacity>
        </View>

        {/* Active Orders Preview */}
        {activeOrders.length > 0 && (
          <Card style={styles.activeOrdersCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {activeOrders.slice(0, 3).map((order) => (
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
          </Card>
        )}

        {/* Add Item Form */}
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
              placeholder="0.00"
              value={newItem.price}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />

            <Input
              label="Available Quantity"
              placeholder="How many can you make?"
              value={newItem.availableQuantity}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, availableQuantity: text }))}
              keyboardType="numeric"
            />

            <Input
              label="Tags (comma separated)"
              placeholder="e.g., Italian, Vegetarian, Spicy"
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
        <View style={styles.menuItems}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Menu ({menuItems.length})</Text>
            {!showAddForm && (
              <TouchableOpacity onPress={() => setShowAddForm(true)}>
                <Plus size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {menuItems.map((item) => (
            <Card key={item.id} style={styles.menuCard}>
              <View style={styles.menuCardContent}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.menuQuantity}>
                    Available: {item.availableQuantity}
                  </Text>
                  <View style={styles.menuTags}>
                    {item.tags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.menuActions}>
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
              </View>
            </Card>
          ))}

          {menuItems.length === 0 && !showAddForm && (
            <Card style={styles.emptyMenu}>
              <ChefHat size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyMenuTitle}>No menu items yet</Text>
              <Text style={styles.emptyMenuText}>
                Add your first delicious dish to start receiving orders
              </Text>
              <Button
                title="Add Your First Dish"
                onPress={() => setShowAddForm(true)}
                style={styles.addFirstDishButton}
              />
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Customer Discovery Interface
function CustomerDiscoveryInterface() {
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
      {
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
      {
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
      {
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
    ];
    setCooks(mockCooks);
  };

  const loadFoodItems = async () => {
    try {
      // Load all menu items from all cooks
      const allFoodItems: FoodItem[] = [];
      
      // Load items from each cook
      for (const cook of cooks) {
        const storedItems = await AsyncStorage.getItem(`menuItems_${cook.id}`);
        if (storedItems) {
          const cookItems = JSON.parse(storedItems);
          const foodItems = cookItems
            .filter((item: MenuItem) => item.isActive)
            .map((item: MenuItem) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              price: item.price,
              image: item.image,
              cookId: item.cookId,
              cookName: cook.name,
              cookRating: cook.rating,
              distance: cook.distance,
              prepTime: 20 + Math.floor(Math.random() * 20),
              mealType: item.mealType,
              tags: item.tags,
              foodRating: item.rating,
              totalFoodReviews: item.totalReviews,
              isPopular: Math.random() > 0.7,
              isNew: Math.random() > 0.8,
              allergens: [],
              nutritionInfo: {
                calories: 300 + Math.floor(Math.random() * 400),
                protein: 10 + Math.floor(Math.random() * 30),
                carbs: 20 + Math.floor(Math.random() * 50),
                fat: 5 + Math.floor(Math.random() * 25),
              },
            }));
          allFoodItems.push(...foodItems);
        }
      }
      
      // If no items found, use mock data
      if (allFoodItems.length === 0) {
        const mockFoodItems: FoodItem[] = [
          {
            id: 'menu-item-550e8400-e29b-41d4-a716-446655440001',
            title: 'Homemade Pasta Carbonara',
            description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese made with love',
            price: 16.99,
            image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
            cookId: '550e8400-e29b-41d4-a716-446655440001',
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
            id: 'menu-item-550e8400-e29b-41d4-a716-446655440002',
            title: 'Artisan Avocado Toast',
            description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, microgreens, and hemp seeds',
            price: 12.50,
            image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
            cookId: '550e8400-e29b-41d4-a716-446655440002',
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
            id: 'menu-item-550e8400-e29b-41d4-a716-446655440003',
            title: 'Pan-Seared Salmon',
            description: 'Atlantic salmon with roasted vegetables and lemon herb butter sauce, served with quinoa',
            price: 24.99,
            image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=800',
            cookId: '550e8400-e29b-41d4-a716-446655440003',
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
            id: 'menu-item-550e8400-e29b-41d4-a716-446655440004',
            title: 'Authentic Ramen Bowl',
            description: 'Rich tonkotsu broth with handmade noodles, chashu pork, soft-boiled egg, and nori',
            price: 18.99,
            image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800',
            cookId: '550e8400-e29b-41d4-a716-446655440004',
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
        ];
        allFoodItems.push(...mockFoodItems);
      }
      
      setFoodItems(allFoodItems);
    } catch (error) {
      console.error('Error loading food items:', error);
    }
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
              <View key={item.id}>
                <FoodCard
                  item={item}
                  cook={cooks.find(c => c.id === item.cookId)}
                  onPress={() => handleFoodItemPress(item)}
                  onCookPress={() => handleCookPress(item.cookId)}
                />
                {item.quantity <= 0 && (
                  <View style={styles.soldOutBadge}>
                    <Text style={styles.soldOutText}>Sold Out</Text>
                  </View>
                )}
              </View>
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

  return <CustomerDiscoveryInterface />;
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
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
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
  dashboardStats: {
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
    gap: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  activeOrdersCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
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
  addForm: {
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  mealTypeContainer: {
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
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceVariant,
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  mealTypeButtonTextActive: {
    color: theme.colors.primary,
  },
  formButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
  menuItems: {
    gap: theme.spacing.md,
  },
  menuCard: {
    padding: theme.spacing.md,
  },
  menuCardContent: {
    flexDirection: 'row',
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
  menuDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
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
  },
  tag: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  menuActions: {
    justifyContent: 'center',
  },
  statusToggle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusToggleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusToggleInactive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outline,
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
  emptyMenu: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  emptyMenuTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  emptyMenuText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  addFirstDishButton: {
    alignSelf: 'center',
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
  cookBadges: {
    marginBottom: theme.spacing.xl,
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
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  badgeText: {
    fontSize: 12,
    color: '#333',
  },
  soldOutBadge: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  soldOutText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  }
});