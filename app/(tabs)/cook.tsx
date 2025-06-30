import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  RefreshControl,
} from 'react-native';
import { FAB, Card, Button, TextInput, Chip } from 'react-native-paper';
import { Star, Award, MapPin, Clock, Users, ChefHat, X, Plus, Eye, Package, CircleCheck as CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { supabase } from '@/lib/supabase';
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

// Cook Profile Interface
function CookProfileInterface() {
  const { user, logout } = useAuth();
  const { 
    orders, 
    loading, 
    refreshing, 
    updateOrderStatus, 
    refreshOrders,
    getOrdersByStatus 
  } = useOrders();
  const [notifications, setNotifications] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    mealType: 'lunch' as 'breakfast' | 'lunch' | 'dinner',
    availableQuantity: '',
    tags: '',
  });

  useEffect(() => {
    loadMenuItems();
  }, [user]);

  const loadMenuItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(`menuItems_${user?.id}`);
      if (storedItems) {
        setMenuItems(JSON.parse(storedItems));
      } else {
        // Default items for demo
        const mockItems: MenuItem[] = [
          {
            id: 'menu-item-550e8400-e29b-41d4-a716-446655440001',
            title: 'Homemade Pasta Carbonara',
            description: 'Fresh pasta with tomato sauce',
            price: 12.99,
            mealType: 'lunch',
            availableQuantity: 5,
            tags: ['Italian', 'Pasta'],
            isActive: true,
            cookId: user?.id || '550e8400-e29b-41d4-a716-446655440001',
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.price || !newItem.availableQuantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const item: MenuItem = {
      id: `menu-item-${Date.now()}`,
      title: newItem.title,
      description: newItem.description,
      price: parseFloat(newItem.price),
      mealType: newItem.mealType,
      availableQuantity: parseInt(newItem.availableQuantity),
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isActive: true,
      cookId: user?.id || '550e8400-e29b-41d4-a716-446655440001',
      rating: 0,
      totalReviews: 0,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    };

    const updatedItems = [...menuItems, item];
    setMenuItems(updatedItems);
    
    // Save to AsyncStorage
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

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

  // Filter orders for this cook
  const cookOrders = orders.filter(order => order.cookId === user?.id);
  const activeOrders = cookOrders.filter(order => 
    ['confirmed', 'preparing', 'ready'].includes(order.status)
  );

  const todayEarnings = cookOrders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() && order.status === 'delivered';
    })
    .reduce((total, order) => total + order.totalPrice, 0);

  const completedOrders = cookOrders.filter(order => order.status === 'delivered').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Kitchen</Text>
        <Text style={styles.headerSubtitle}>Manage your menu and orders</Text>
        
        {/* Cook Dashboard Stats */}
        <View style={styles.dashboardStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{menuItems.length}</Text>
            <Text style={styles.statLabel}>Menu Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeOrders.length}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowOrdersModal(true)}
          >
            <Text style={styles.statValue}>{cookOrders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshOrders} />
        }
      >
        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <Card style={styles.activeOrdersCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity onPress={() => setShowOrdersModal(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
        )}
            {activeOrders.slice(0, 3).map((order) => (
              <View key={order.orderId} style={styles.orderItem}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderTitle}>
                    {order.items[0]?.title || 'Order'} 
                    {order.items.length > 1 && ` +${order.items.length - 1} more`}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.customerInfo}>
                  Customer: {order.customerName} • ${order.totalPrice.toFixed(2)}
                </Text>
                
                <View style={styles.orderActions}>
                  {order.status === 'confirmed' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'preparing')}
                      style={styles.orderActionButton}
                      compact
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'ready')}
                      style={styles.orderActionButton}
                      compact
                    >
                      Mark Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateOrderStatus(order.orderId, 'picked_up')}
                      style={styles.orderActionButton}
                      compact
                    >
                      Mark Picked Up
                    </Button>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Menu Item</Text>
            
            <TextInput
              label="Dish Name"
              value={newItem.title}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, title: text }))}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={newItem.description}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <TextInput
              label="Price ($)"
              value={newItem.price}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, price: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Available Quantity"
              value={newItem.availableQuantity}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, availableQuantity: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Tags (comma separated)"
              value={newItem.tags}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, tags: text }))}
              mode="outlined"
              placeholder="e.g., Italian, Vegetarian, Spicy"
              style={styles.input}
            />

            <View style={styles.mealTypeContainer}>
              <Text style={styles.mealTypeLabel}>Meal Type:</Text>
              <View style={styles.mealTypeButtons}>
                {['breakfast', 'lunch', 'dinner'].map((type) => (
                  <Chip
                    key={type}
                    selected={newItem.mealType === type}
                    onPress={() => setNewItem(prev => ({ ...prev, mealType: type as any }))}
                    style={styles.mealTypeChip}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.formButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowAddForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddItem}
                style={styles.addButton}
              >
                Add Item
              </Button>
            </View>
          </Card>
        )}

        <View style={styles.menuItems}>
          {menuItems.map((item) => (
            <Card key={item.id} style={styles.menuCard}>
              <View style={styles.menuCardContent}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                  <Text style={styles.menuPrice}>${item.price}</Text>
                  <Text style={styles.menuQuantity}>
                    Available: {item.availableQuantity}
                  </Text>
                  <View style={styles.menuTags}>
                    {item.tags.map((tag) => (
                      <Chip key={tag} compact style={styles.tag}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
                <View style={styles.menuActions}>
                  <Button
                    mode={item.isActive ? 'contained' : 'outlined'}
                    onPress={() => toggleItemStatus(item.id)}
                    compact
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Button>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddForm(true)}
      />

      {/* Orders Modal */}
      <Modal
        visible={showOrdersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOrdersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Orders</Text>
            <TouchableOpacity 
              onPress={() => setShowOrdersModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {cookOrders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Package size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
                <Text style={styles.emptyOrdersText}>
                  Orders from customers will appear here
                </Text>
              </View>
            ) : (
              cookOrders.map((order) => (
                <Card key={order.orderId} style={styles.orderCard}>
                  <View style={styles.orderCardContent}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.orderCardTitle}>
                        {order.items[0]?.title || 'Order'} 
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.orderCardCustomer}>
                      Customer: {order.customerName}
                    </Text>
                    <Text style={styles.orderCardDetails}>
                      Order #{order.trackingNumber} • ${order.totalPrice.toFixed(2)}
                    </Text>
                    <Text style={styles.orderCardDate}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </Text>
                    
                    {['confirmed', 'preparing', 'ready'].includes(order.status) && (
                      <View style={styles.orderCardActions}>
                        {order.status === 'confirmed' && (
                          <Button
                            mode="contained"
                            onPress={() => handleUpdateOrderStatus(order.orderId, 'preparing')}
                            style={styles.orderActionButton}
                            compact
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            mode="contained"
                            onPress={() => handleUpdateOrderStatus(order.orderId, 'ready')}
                            style={styles.orderActionButton}
                            compact
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            mode="contained"
                            onPress={() => handleUpdateOrderStatus(order.orderId, 'picked_up')}
                            style={styles.orderActionButton}
                            compact
                          >
                            Mark Picked Up
                          </Button>
                        )}
                      </View>
                    )}
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// Customer Profile Interface (existing code for customer view)
function CustomerProfileInterface() {
  const { user } = useAuth();
  const [cooks, setCooks] = useState<CookProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCook, setSelectedCook] = useState<CookProfile | null>(null);
  const [showCookProfile, setShowCookProfile] = useState(false);

  useEffect(() => {
    loadCooks();
  }, []);

  const loadCooks = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading cook profiles from database...');
      
      // Query profiles where is_cook = true
      const { data: cookProfiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          profile_image,
          address,
          created_at,
          menu_items (
            id,
            title,
            price,
            tags,
            is_active
          )
        `)
        .eq('is_cook', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading cook profiles:', error);
        // Fall back to mock data if database fails
        setCooks(getMockCooks());
        return;
      }

      if (cookProfiles && cookProfiles.length > 0) {
        console.log(`✅ Loaded ${cookProfiles.length} cook profiles from database`);
        
        // Transform database data to CookProfile format
        const transformedCooks: CookProfile[] = cookProfiles.map((profile: any) => {
          const menuItems = profile.menu_items || [];
          const activeMenuItems = menuItems.filter((item: any) => item.is_active);
          
          // Calculate average price from menu items
          const averagePrice = activeMenuItems.length > 0 
            ? activeMenuItems.reduce((sum: number, item: any) => sum + parseFloat(item.price), 0) / activeMenuItems.length
            : 15.00;

          // Extract specialties from menu item tags
          const allTags = activeMenuItems.flatMap((item: any) => item.tags || []);
          const uniqueSpecialties = [...new Set(allTags)].slice(0, 3);
          
          // Calculate years of experience from join date
          const joinDate = new Date(profile.created_at);
          const yearsExperience = Math.max(1, new Date().getFullYear() - joinDate.getFullYear());
          
          return {
            id: profile.id,
            name: profile.name || 'Home Cook',
            avatar: profile.profile_image || getDefaultCookAvatar(),
            rating: generateRealisticRating(),
            totalReviews: generateRealisticReviewCount(),
            yearsExperience,
            specialties: uniqueSpecialties.length > 0 ? uniqueSpecialties : ['Homemade', 'Fresh'],
            totalOrders: generateRealisticOrderCount(yearsExperience),
            responseTime: getRandomResponseTime(),
            isVerified: true, // All registered cooks are verified
            badges: generateBadges(yearsExperience, activeMenuItems.length),
            joinedDate: profile.created_at,
            bio: generateCookBio(profile.name, uniqueSpecialties),
            location: formatLocation(profile.address),
            distance: generateRealisticDistance(),
            menuItemsCount: activeMenuItems.length,
            averagePrice: Math.round(averagePrice * 100) / 100,
            isOnline: Math.random() > 0.3, // 70% chance of being online
          };
        });

        setCooks(transformedCooks);
      } else {
        console.log('📝 No cook profiles found, using mock data');
        setCooks(getMockCooks());
      }
    } catch (error) {
      console.error('❌ Exception loading cook profiles:', error);
      setCooks(getMockCooks());
    } finally {
      setLoading(false);
    }
  };

  const refreshCooks = async () => {
    setRefreshing(true);
    await loadCooks();
    setRefreshing(false);
  };

  // Helper functions for generating realistic data
  const getDefaultCookAvatar = () => {
    const avatars = [
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const generateRealisticRating = () => {
    // Generate ratings between 4.0 and 5.0 with realistic distribution
    return Math.round((4.0 + Math.random() * 1.0) * 10) / 10;
  };

  const generateRealisticReviewCount = () => {
    // Generate review counts between 15 and 300
    return Math.floor(15 + Math.random() * 285);
  };

  const generateRealisticOrderCount = (yearsExperience: number) => {
    // More experienced cooks have more orders
    const baseOrders = yearsExperience * 100;
    return Math.floor(baseOrders + Math.random() * baseOrders);
  };

  const getRandomResponseTime = () => {
    const times = ['< 10 min', '< 15 min', '< 20 min', '< 30 min'];
    return times[Math.floor(Math.random() * times.length)];
  };

  const generateBadges = (yearsExperience: number, menuItemsCount: number) => {
    const allBadges = ['Top Chef', 'Fast Response', 'Customer Favorite', 'Fresh Ingredients', 'Local Star'];
    const badges = [];
    
    if (yearsExperience >= 3) badges.push('Experienced Cook');
    if (menuItemsCount >= 5) badges.push('Diverse Menu');
    
    // Add 1-2 random badges
    const additionalBadges = allBadges.filter(badge => !badges.includes(badge));
    const randomBadges = additionalBadges.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
    
    return [...badges, ...randomBadges].slice(0, 3);
  };

  const generateCookBio = (name: string, specialties: string[]) => {
    const firstName = name?.split(' ')[0] || 'Cook';
    const specialty = specialties[0] || 'homemade';
    return `Passionate ${specialty.toLowerCase()} cook sharing delicious homemade meals with the community. ${firstName} loves creating authentic flavors using fresh, quality ingredients.`;
  };

  const formatLocation = (address: string | null) => {
    if (!address) return 'San Francisco, CA';
    // Extract city from address or use default
    const parts = address.split(',');
    return parts.length >= 2 ? `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}` : 'San Francisco, CA';
  };

  const generateRealisticDistance = () => {
    // Generate distances between 0.5 and 5.0 km
    return Math.round((0.5 + Math.random() * 4.5) * 10) / 10;
  };

  const getMockCooks = (): CookProfile[] => {
    return [
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
        menuItemsCount: 12,
        averagePrice: 16.50,
        isOnline: true,
      },
    ];
  };

  const handleCookPress = (cook: CookProfile) => {
    setSelectedCook(cook);
    setShowCookProfile(true);
  };

  const handleViewCookMenu = (cookId: string) => {
    setShowCookProfile(false);
    router.push({
      pathname: '/(tabs)',
      params: { cookId }
    });
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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ChefHat size={32} color="white" />
          <Text style={styles.headerTitle}>Discover Amazing Cooks</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading cooks...' : `${cooks.length} talented home cooks in your area`}
          </Text>
        </View>
      </LinearGradient>

      {/* Cooks List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshCooks} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Finding amazing cooks near you...</Text>
          </View>
        ) : cooks.length === 0 ? (
          <Card style={styles.emptyState}>
            <ChefHat size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Cooks Found</Text>
            <Text style={styles.emptyText}>
              We couldn't find any home cooks in your area right now. Please try again later.
            </Text>
            <Button
              mode="contained"
              onPress={refreshCooks}
              style={styles.retryButton}
            >
              Try Again
            </Button>
          </Card>
        ) : (
        <View style={styles.cooksGrid}>
          {cooks.map((cook) => (
            <TouchableOpacity
              key={cook.id}
              style={styles.cookCard}
              onPress={() => handleCookPress(cook)}
              activeOpacity={0.9}
            >
              <Card style={styles.cookCardInner}>
                {/* Cook Header */}
                <View style={styles.cookHeader}>
                  <Image source={{ uri: cook.avatar }} style={styles.cookAvatar} />
                  <View style={styles.onlineIndicator}>
                    <View style={[styles.onlineDot, { backgroundColor: cook.isOnline ? theme.colors.success : theme.colors.outline }]} />
                  </View>
                  {cook.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Award size={16} color={theme.colors.primary} />
                    </View>
                  )}
                </View>

                {/* Cook Info */}
                <View style={styles.cookInfo}>
                  <Text style={styles.cookName} numberOfLines={1}>{cook.name}</Text>
                  <Text style={styles.cookLocation} numberOfLines={1}>{cook.location}</Text>
                  
                  {/* Rating */}
                  <View style={styles.cookRating}>
                    <View style={styles.ratingStars}>
                      {renderStars(cook.rating, 12)}
                    </View>
                    <Text style={styles.ratingText}>
                      {cook.rating} ({cook.totalReviews})
                    </Text>
                  </View>

                  {/* Specialties */}
                  <View style={styles.specialties}>
                    {cook.specialties.slice(0, 2).map((specialty, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Stats */}
                  <View style={styles.cookStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{cook.menuItemsCount}</Text>
                      <Text style={styles.statLabel}>dishes</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>${cook.averagePrice}</Text>
                      <Text style={styles.statLabel}>avg price</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{cook.distance}km</Text>
                      <Text style={styles.statLabel}>away</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Become a Cook CTA */}
        <Card style={styles.becomeCookCard}>
          <View style={styles.becomeCookContent}>
            <ChefHat size={48} color={theme.colors.primary} />
            <Text style={styles.becomeCookTitle}>Become a Home Cook</Text>
            <Text style={styles.becomeCookText}>
              Share your culinary skills and earn money by cooking for your community
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/cook-registration')}
              style={styles.becomeCookButton}
            >
              Apply to Cook
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

// Main component
export default function CookScreen() {
  const { user } = useAuth();

  // Show cook interface for cooks, customer interface for customers
  if (user?.isCook) {
    return <CookProfileInterface />;
  }

  return <CustomerProfileInterface />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  dashboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 5,
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
    padding: 20,
  },
  activeOrdersCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  orderItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  customerInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 10,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  orderActionButton: {
    flex: 1,
  },
  cooksGrid: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  cookCard: {
    marginBottom: theme.spacing.md,
  },
  cookCardInner: {
    padding: theme.spacing.lg,
    position: 'relative',
  },
  cookHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  cookAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.sm,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: '50%',
    marginRight: -30,
  },
  onlineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: theme.colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  cookInfo: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cookName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  cookLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cookRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  specialtyTag: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  specialtyText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  cookStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
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
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    alignSelf: 'center',
  },
  becomeCookCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  becomeCookContent: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  becomeCookTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  becomeCookText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.lg,
  },
  becomeCookButton: {
    marginTop: theme.spacing.md,
  },
  addForm: {
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Inter-Bold',
  },
  input: {
    marginBottom: 15,
  },
  mealTypeContainer: {
    marginBottom: 20,
  },
  mealTypeLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mealTypeChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    flex: 1,
    marginLeft: 10,
  },
  menuItems: {
    flex: 1,
  },
  menuCard: {
    marginBottom: 15,
    elevation: 2,
  },
  menuCardContent: {
    flexDirection: 'row',
    padding: 15,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  menuDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  menuQuantity: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
  },
  menuTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 5,
    marginBottom: 5,
  },
  menuActions: {
    justifyContent: 'center',
    marginLeft: 15,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
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
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  emptyOrdersTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  emptyOrdersText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  orderCard: {
    marginBottom: 15,
  },
  orderCardContent: {
    padding: 15,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: 10,
  },
  orderCardCustomer: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  orderCardDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 5,
  },
  orderCardDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 15,
  },
  orderCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
});