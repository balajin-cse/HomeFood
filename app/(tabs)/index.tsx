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
  Alert,
  Modal,
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

// Cook Kitchen Management Interface
function CookKitchenInterface() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
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
    loadMenuItems();
    loadOrders();
  }, []);

  const loadMenuItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(`menuItems_${user?.id}`);
      if (storedItems) {
        setMenuItems(JSON.parse(storedItems));
      } else {
        // Default items for demo based on cook
        let mockItems = [];
        
        if (user?.id === 'ck-maria' || user?.name === 'Maria Rodriguez') {
          mockItems = [
            {
              id: '1',
              title: 'Homemade Pasta Carbonara',
              description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese',
              price: 16.99,
              mealType: 'lunch',
              availableQuantity: 8,
              tags: ['Italian', 'Pasta', 'Creamy'],
              isActive: true,
              cookId: user?.id || 'ck-maria',
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
              availableQuantity: 6,
              tags: ['Italian', 'Pizza', 'Vegetarian'],
              isActive: true,
              cookId: user?.id || 'ck-maria',
              rating: 4.7,
              totalReviews: 45,
              image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '3',
              title: 'Tiramisu',
              description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream',
              price: 8.99,
              mealType: 'dinner',
              availableQuantity: 10,
              tags: ['Italian', 'Dessert', 'Coffee'],
              isActive: true,
              cookId: user?.id || 'ck-maria',
              rating: 4.9,
              totalReviews: 37,
              image: 'https://images.pexels.com/photos/6133305/pexels-photo-6133305.jpeg?auto=compress&cs=tinysrgb&w=400',
            }
          ];
        } else if (user?.id === 'ck-sarah' || user?.name === 'Sarah Johnson') {
          mockItems = [
            {
              id: '1',
              title: 'Artisan Avocado Toast',
              description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, and microgreens',
              price: 12.50,
              mealType: 'breakfast',
              availableQuantity: 12,
              tags: ['Healthy', 'Vegetarian', 'Fresh'],
              isActive: true,
              cookId: user?.id || 'ck-sarah',
              rating: 4.6,
              totalReviews: 67,
              image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '2',
              title: 'Quinoa Buddha Bowl',
              description: 'Nutrient-rich bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
              price: 14.99,
              mealType: 'lunch',
              availableQuantity: 8,
              tags: ['Vegan', 'Healthy', 'Gluten-Free'],
              isActive: true,
              cookId: user?.id || 'ck-sarah',
              rating: 4.7,
              totalReviews: 42,
              image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '3',
              title: 'Chia Seed Pudding',
              description: 'Overnight chia pudding with coconut milk, fresh berries, and maple syrup',
              price: 7.99,
              mealType: 'breakfast',
              availableQuantity: 15,
              tags: ['Vegan', 'Breakfast', 'Healthy'],
              isActive: true,
              cookId: user?.id || 'ck-sarah',
              rating: 4.5,
              totalReviews: 31,
              image: 'https://images.pexels.com/photos/3066/healthy-breakfast-fruit-cereals.jpg?auto=compress&cs=tinysrgb&w=400',
            }
          ];
        } else if (user?.id === 'ck-david' || user?.name === 'David Chen') {
          mockItems = [
            {
              id: '1',
              title: 'Pan-Seared Salmon',
              description: 'Atlantic salmon with roasted vegetables and lemon herb butter sauce, served with quinoa',
              price: 24.99,
              mealType: 'dinner',
              availableQuantity: 6,
              tags: ['Seafood', 'Healthy', 'Gourmet'],
              isActive: true,
              cookId: user?.id || 'ck-david',
              rating: 4.9,
              totalReviews: 124,
              image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '2',
              title: 'Lobster Fried Rice',
              description: 'Wok-fried jasmine rice with chunks of fresh lobster, vegetables, and XO sauce',
              price: 28.99,
              mealType: 'dinner',
              availableQuantity: 4,
              tags: ['Asian Fusion', 'Seafood', 'Gourmet'],
              isActive: true,
              cookId: user?.id || 'ck-david',
              rating: 4.8,
              totalReviews: 86,
              image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '3',
              title: 'Miso Black Cod',
              description: 'Black cod marinated in sweet miso, sake, and mirin, broiled to perfection',
              price: 26.99,
              mealType: 'dinner',
              availableQuantity: 5,
              tags: ['Japanese', 'Seafood', 'Gourmet'],
              isActive: true,
              cookId: user?.id || 'ck-david',
              rating: 4.9,
              totalReviews: 92,
              image: 'https://images.pexels.com/photos/842142/pexels-photo-842142.jpeg?auto=compress&cs=tinysrgb&w=400',
            }
          ];
        } else if (user?.id === 'ck-kenji' || user?.name === 'Kenji Tanaka') {
          mockItems = [
            {
              id: '1',
              title: 'Authentic Ramen Bowl',
              description: 'Rich tonkotsu broth with handmade noodles, chashu pork, soft-boiled egg, and nori',
              price: 18.99,
              mealType: 'lunch',
              availableQuantity: 10,
              tags: ['Japanese', 'Ramen', 'Comfort Food'],
              isActive: true,
              cookId: user?.id || 'ck-kenji',
              rating: 4.9,
              totalReviews: 156,
              image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '2',
              title: 'Chicken Katsu Curry',
              description: 'Crispy panko-breaded chicken cutlet with Japanese curry sauce and steamed rice',
              price: 16.99,
              mealType: 'dinner',
              availableQuantity: 8,
              tags: ['Japanese', 'Curry', 'Comfort Food'],
              isActive: true,
              cookId: user?.id || 'ck-kenji',
              rating: 4.8,
              totalReviews: 112,
              image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '3',
              title: 'Assorted Sushi Platter',
              description: 'Chef\'s selection of fresh nigiri and maki rolls with wasabi, ginger, and soy sauce',
              price: 29.99,
              mealType: 'dinner',
              availableQuantity: 5,
              tags: ['Japanese', 'Sushi', 'Raw'],
              isActive: true,
              cookId: user?.id || 'ck-kenji',
              rating: 4.9,
              totalReviews: 98,
              image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400',
            }
          ];
        } else if (user?.id === 'ck-elena' || user?.name === 'Elena Papadopoulos') {
          mockItems = [
            {
              id: '1',
              title: 'Authentic Greek Moussaka',
              description: 'Layers of eggplant, potato, and seasoned ground lamb topped with béchamel sauce',
              price: 17.99,
              mealType: 'dinner',
              availableQuantity: 6,
              tags: ['Greek', 'Mediterranean', 'Comfort Food'],
              isActive: true,
              cookId: user?.id || 'ck-elena',
              rating: 4.8,
              totalReviews: 87,
              image: 'https://images.pexels.com/photos/6419736/pexels-photo-6419736.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '2',
              title: 'Greek Salad',
              description: 'Fresh tomatoes, cucumber, red onion, olives, and feta cheese with olive oil dressing',
              price: 12.99,
              mealType: 'lunch',
              availableQuantity: 10,
              tags: ['Greek', 'Salad', 'Healthy'],
              isActive: true,
              cookId: user?.id || 'ck-elena',
              rating: 4.7,
              totalReviews: 65,
              image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '3',
              title: 'Spanakopita',
              description: 'Flaky phyllo pastry filled with spinach, feta cheese, onions, and herbs',
              price: 14.99,
              mealType: 'lunch',
              availableQuantity: 8,
              tags: ['Greek', 'Vegetarian', 'Pastry'],
              isActive: true,
              cookId: user?.id || 'ck-elena',
              rating: 4.6,
              totalReviews: 54,
              image: 'https://images.pexels.com/photos/6419737/pexels-photo-6419737.jpeg?auto=compress&cs=tinysrgb&w=400',
            }
          ];
        } else if (user?.id === 'ck-marcus' || user?.name === 'Marcus Campbell') {
          mockItems = [
            {
              id: '1',
              title: 'Jerk Chicken with Rice & Peas',
              description: 'Spicy marinated chicken with traditional Jamaican rice and kidney beans',
              price: 18.99,
              mealType: 'dinner',
              availableQuantity: 8,
              tags: ['Caribbean', 'Spicy', 'Chicken'],
              isActive: true,
              cookId: user?.id || 'ck-marcus',
              rating: 4.9,
              totalReviews: 108,
              image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '2',
              title: 'Oxtail Stew',
              description: 'Slow-cooked oxtail with butter beans, carrots, and traditional Caribbean spices',
              price: 22.99,
              mealType: 'dinner',
              availableQuantity: 6,
              tags: ['Caribbean', 'Stew', 'Comfort Food'],
              isActive: true,
              cookId: user?.id || 'ck-marcus',
              rating: 4.8,
              totalReviews: 76,
              image: 'https://images.pexels.com/photos/5409010/pexels-photo-5409010.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              id: '3',
              title: 'Ackee and Saltfish',
              description: 'Jamaica\'s national dish with ackee fruit, salted cod, onions, and spices',
              price: 16.99,
              mealType: 'breakfast',
              availableQuantity: 5,
              tags: ['Caribbean', 'Seafood', 'Traditional'],
              isActive: true,
              cookId: user?.id || 'ck-marcus',
              rating: 4.7,
              totalReviews: 62,
              image: 'https://images.pexels.com/photos/5409009/pexels-photo-5409009.jpeg?auto=compress&cs=tinysrgb&w=400',
            }
          ];
        } else {
          // Default items for any other cook
          mockItems = [
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
            {
              id: '2',
              title: 'Chicken Curry',
              description: 'Spicy chicken curry with basmati rice',
              price: 14.99,
              mealType: 'dinner',
              availableQuantity: 7,
              tags: ['Indian', 'Spicy', 'Chicken'],
              isActive: true,
              cookId: user?.id || '1',
              rating: 4.6,
              totalReviews: 18,
              image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
            }
          ];
        }
        
        setMenuItems(mockItems);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(`menuItems_${user?.id}`, JSON.stringify(mockItems));
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        // Filter orders for this cook
        const cookSpecificOrders = allOrders.filter((order: any) => 
          order.cookId === user?.id || order.cookName === user?.name
        );
        setOrders(cookSpecificOrders);
      }
    } catch (error) {
      console.error('Error loading cook orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCookOrders();
    await loadMenuItems();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.price || !newItem.availableQuantity) {
      Alert.alert('Error', 'Please fill in all fields');
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
    ['confirmed', 'preparing', 'ready'].includes(order.status)
  );

  const todayEarnings = orders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() && order.status === 'delivered';
    })
    .reduce((total, order) => total + order.totalPrice, 0);

  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;

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
            Welcome back, {user?.name}!
          </Text>
        </View>
        
        {/* Dashboard Stats */}
        <View style={styles.dashboardStats}>
          <View style={styles.statCard}>
            <DollarSign size={20} color="white" />
            <Text style={styles.statValue}>${todayEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={20} color="white" />
            <Text style={styles.statValue}>{activeOrders.length}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="white" />
            <Text style={styles.statValue}>{menuItems.length}</Text>
            <Text style={styles.statLabel}>Menu Items</Text>
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
            <Navigation size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Deliveries</Text>
          </TouchableOpacity>
        </View>

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <Card style={styles.activeOrdersCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
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
              value={newItem.title}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, title: text }))}
              placeholder="e.g., Homemade Pasta Carbonara"
            />

            <Input
              label="Description"
              value={newItem.description}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              placeholder="Describe your delicious dish..."
            />

            <Input
              label="Price ($)"
              value={newItem.price}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
              placeholder="16.99"
            />

            <Input
              label="Available Quantity"
              value={newItem.availableQuantity}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, availableQuantity: text }))}
              keyboardType="numeric"
              placeholder="5"
            />

            <Input
              label="Tags (comma separated)"
              value={newItem.tags}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, tags: text }))}
              placeholder="e.g., Italian, Vegetarian, Spicy"
            />

            <View style={styles.mealTypeContainer}>
              <Text style={styles.mealTypeLabel}>Meal Type:</Text>
              <View style={styles.mealTypeButtons}>
                {['breakfast', 'lunch', 'dinner'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeChip,
                      newItem.mealType === type && styles.mealTypeChipActive
                    ]}
                    onPress={() => setNewItem(prev => ({ ...prev, mealType: type as any }))}
                  >
                    <Text style={[
                      styles.mealTypeText,
                      newItem.mealType === type && styles.mealTypeTextActive
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
          <Text style={styles.sectionTitle}>Your Menu</Text>
          {menuItems.map((item) => (
            <Card key={item.id} style={styles.menuCard}>
              <View style={styles.menuCardContent}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                  <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.menuQuantity}>
                    Available: {item.availableQuantity}
                  </Text>
                  <View style={styles.menuTags}>
                    {item.tags.map((tag: string) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.menuActions}>
                  <Button
                    title={item.isActive ? 'Active' : 'Inactive'}
                    variant={item.isActive ? 'primary' : 'outline'}
                    size="small"
                    onPress={() => toggleItemStatus(item.id)}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Customer Discovery Interface (existing)
function CustomerDiscoveryInterface() {
  const { address, updateLocation } = useLocation();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedCookId, setSelectedCookId] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [cooks, setCooks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    priceRange: { min: '', max: '' },
    distance: 25,
    rating: 'any',
    prepTime: 120,
    cuisineTypes: [] as string[],
    dietaryRestrictions: [] as string[],
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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
    'Italian', 'Asian', 'Mexican', 'American', 'Mediterranean', 'Indian', 'Thai', 'Japanese', 'French', 'Greek'
  ];

  const DIETARY_RESTRICTIONS = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Low-Carb', 'Halal', 'Kosher'
  ];

  useEffect(() => {
    loadFoodItems();
    loadCooks();
    
    if (params.cookId) {
      setSelectedCookId(params.cookId as string);
    }
  }, [params.cookId]);

  useEffect(() => {
    countActiveFilters();
  }, [filters, selectedCookId]);

  const loadCooks = async () => {
    const mockCooks = [
      {
        id: 'ck-maria',
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
        bio: 'Passionate Italian chef with 8 years of experience.',
        location: 'North Beach, SF',
        distance: 1.2,
      },
      {
        id: 'ck-sarah',
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
        bio: 'Certified nutritionist and plant-based chef.',
        location: 'Mission District, SF',
        distance: 0.8,
      },
      {
        id: 'ck-david',
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
        bio: 'Former Michelin-starred restaurant chef specializing in seafood and Asian fusion.',
        location: 'Chinatown, SF',
        distance: 2.1,
      },
      {
        id: 'ck-kenji',
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
        bio: 'Third-generation ramen master from Tokyo.',
        location: 'Japantown, SF',
        distance: 1.5,
      },
      {
        id: 'ck-elena',
        name: 'Elena Papadopoulos',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.6,
        totalReviews: 134,
        yearsExperience: 6,
        specialties: ['Greek', 'Mediterranean', 'Healthy'],
        totalOrders: 567,
        responseTime: '< 30 min',
        isVerified: true,
        badges: ['Mediterranean Expert', 'Fresh Ingredients'],
        joinedDate: '2020-11-08',
        bio: 'Born in Athens, bringing authentic Greek flavors.',
        location: 'Castro, SF',
        distance: 1.8,
      },
      {
        id: 'ck-marcus',
        name: 'Marcus Campbell',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.8,
        totalReviews: 203,
        yearsExperience: 10,
        specialties: ['Caribbean', 'BBQ', 'Spicy'],
        totalOrders: 892,
        responseTime: '< 20 min',
        isVerified: true,
        badges: ['Spice Master', 'BBQ Expert', 'Island Flavors'],
        joinedDate: '2019-08-12',
        bio: 'Jamaican-born chef specializing in Caribbean cuisine.',
        location: 'Oakland, CA',
        distance: 2.7,
      },
    ];
    setCooks(mockCooks);
  };

  const loadFoodItems = async () => {
    try {
      // First try to load all cook menu items from AsyncStorage
      const allMenuItems = [];
      
      // Get all cook IDs
      const cookIds = [
        'ck-maria', 'ck-sarah', 'ck-david', 'ck-kenji', 'ck-elena', 'ck-marcus'
      ];
      
      // Load menu items for each cook
      for (const cookId of cookIds) {
        const storedItems = await AsyncStorage.getItem(`menuItems_${cookId}`);
        if (storedItems) {
          const items = JSON.parse(storedItems);
          allMenuItems.push(...items);
        }
      }
      
      if (allMenuItems.length > 0) {
        setFoodItems(allMenuItems);
        return;
      }
      
      // If no stored items found, use mock data
      const mockFoodItems = [
        {
          id: '1',
          title: 'Homemade Pasta Carbonara',
          description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese',
          price: 16.99,
          image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-maria',
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
          nutritionInfo: { calories: 520, protein: 22, carbs: 45, fat: 28 },
        },
        {
          id: '2',
          title: 'Margherita Pizza',
          description: 'Traditional Neapolitan pizza with fresh mozzarella, basil, and San Marzano tomatoes',
          price: 19.99,
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-maria',
          cookName: 'Maria Rodriguez',
          cookRating: 4.9,
          distance: 1.2,
          prepTime: 30,
          mealType: 'dinner',
          tags: ['Italian', 'Pizza', 'Vegetarian'],
          foodRating: 4.7,
          totalFoodReviews: 45,
          isPopular: false,
          isNew: false,
          allergens: ['Dairy', 'Gluten'],
          nutritionInfo: { calories: 420, protein: 18, carbs: 52, fat: 16 },
        },
        {
          id: '3',
          title: 'Tiramisu',
          description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream',
          price: 8.99,
          image: 'https://images.pexels.com/photos/6133305/pexels-photo-6133305.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-maria',
          cookName: 'Maria Rodriguez',
          cookRating: 4.9,
          distance: 1.2,
          prepTime: 20,
          mealType: 'dinner',
          tags: ['Italian', 'Dessert', 'Coffee'],
          foodRating: 4.9,
          totalFoodReviews: 37,
          isPopular: true,
          isNew: false,
          allergens: ['Eggs', 'Dairy', 'Gluten'],
          nutritionInfo: { calories: 350, protein: 5, carbs: 40, fat: 18 },
        },
        {
          id: '4',
          title: 'Artisan Avocado Toast',
          description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, and microgreens',
          price: 12.50,
          image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-sarah',
          cookName: 'Sarah Johnson',
          cookRating: 4.7,
          distance: 0.8,
          prepTime: 15,
          mealType: 'breakfast',
          tags: ['Healthy', 'Vegetarian', 'Fresh'],
          foodRating: 4.6,
          totalFoodReviews: 67,
          isPopular: false,
          isNew: true,
          allergens: ['Gluten'],
          nutritionInfo: { calories: 320, protein: 12, carbs: 35, fat: 18 },
        },
        {
          id: '5',
          title: 'Quinoa Buddha Bowl',
          description: 'Nutrient-rich bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
          price: 14.99,
          image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-sarah',
          cookName: 'Sarah Johnson',
          cookRating: 4.7,
          distance: 0.8,
          prepTime: 20,
          mealType: 'lunch',
          tags: ['Vegan', 'Healthy', 'Gluten-Free'],
          foodRating: 4.7,
          totalFoodReviews: 42,
          isPopular: true,
          isNew: false,
          allergens: [],
          nutritionInfo: { calories: 380, protein: 15, carbs: 45, fat: 12 },
        },
        {
          id: '6',
          title: 'Chia Seed Pudding',
          description: 'Overnight chia pudding with coconut milk, fresh berries, and maple syrup',
          price: 7.99,
          image: 'https://images.pexels.com/photos/3066/healthy-breakfast-fruit-cereals.jpg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-sarah',
          cookName: 'Sarah Johnson',
          cookRating: 4.7,
          distance: 0.8,
          prepTime: 10,
          mealType: 'breakfast',
          tags: ['Vegan', 'Breakfast', 'Healthy'],
          foodRating: 4.5,
          totalFoodReviews: 31,
          isPopular: false,
          isNew: false,
          allergens: [],
          nutritionInfo: { calories: 280, protein: 8, carbs: 32, fat: 14 },
        },
        {
          id: '7',
          title: 'Pan-Seared Salmon',
          description: 'Atlantic salmon with roasted vegetables and lemon herb butter sauce, served with quinoa',
          price: 24.99,
          image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-david',
          cookName: 'David Chen',
          cookRating: 4.8,
          distance: 2.1,
          prepTime: 35,
          mealType: 'dinner',
          tags: ['Seafood', 'Healthy', 'Gourmet'],
          foodRating: 4.9,
          totalFoodReviews: 124,
          isPopular: true,
          isNew: false,
          allergens: ['Fish'],
          nutritionInfo: { calories: 450, protein: 35, carbs: 25, fat: 22 },
        },
        {
          id: '8',
          title: 'Lobster Fried Rice',
          description: 'Wok-fried jasmine rice with chunks of fresh lobster, vegetables, and XO sauce',
          price: 28.99,
          image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-david',
          cookName: 'David Chen',
          cookRating: 4.8,
          distance: 2.1,
          prepTime: 30,
          mealType: 'dinner',
          tags: ['Asian Fusion', 'Seafood', 'Gourmet'],
          foodRating: 4.8,
          totalFoodReviews: 86,
          isPopular: true,
          isNew: false,
          allergens: ['Shellfish', 'Soy'],
          nutritionInfo: { calories: 520, protein: 28, carbs: 60, fat: 18 },
        },
        {
          id: '9',
          title: 'Miso Black Cod',
          description: 'Black cod marinated in sweet miso, sake, and mirin, broiled to perfection',
          price: 26.99,
          image: 'https://images.pexels.com/photos/842142/pexels-photo-842142.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-david',
          cookName: 'David Chen',
          cookRating: 4.8,
          distance: 2.1,
          prepTime: 40,
          mealType: 'dinner',
          tags: ['Japanese', 'Seafood', 'Gourmet'],
          foodRating: 4.9,
          totalFoodReviews: 92,
          isPopular: false,
          isNew: true,
          allergens: ['Fish', 'Soy'],
          nutritionInfo: { calories: 380, protein: 32, carbs: 18, fat: 20 },
        },
        {
          id: '10',
          title: 'Authentic Ramen Bowl',
          description: 'Rich tonkotsu broth with handmade noodles, chashu pork, soft-boiled egg, and nori',
          price: 18.99,
          image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-kenji',
          cookName: 'Kenji Tanaka',
          cookRating: 4.9,
          distance: 1.5,
          prepTime: 45,
          mealType: 'lunch',
          tags: ['Japanese', 'Ramen', 'Comfort Food'],
          foodRating: 4.9,
          totalFoodReviews: 156,
          isPopular: true,
          isNew: false,
          allergens: ['Eggs', 'Gluten', 'Soy'],
          nutritionInfo: { calories: 680, protein: 28, carbs: 65, fat: 32 },
        },
        {
          id: '11',
          title: 'Chicken Katsu Curry',
          description: 'Crispy panko-breaded chicken cutlet with Japanese curry sauce and steamed rice',
          price: 16.99,
          image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-kenji',
          cookName: 'Kenji Tanaka',
          cookRating: 4.9,
          distance: 1.5,
          prepTime: 35,
          mealType: 'dinner',
          tags: ['Japanese', 'Curry', 'Comfort Food'],
          foodRating: 4.8,
          totalFoodReviews: 112,
          isPopular: true,
          isNew: false,
          allergens: ['Gluten', 'Soy'],
          nutritionInfo: { calories: 720, protein: 32, carbs: 85, fat: 24 },
        },
        {
          id: '12',
          title: 'Assorted Sushi Platter',
          description: 'Chef\'s selection of fresh nigiri and maki rolls with wasabi, ginger, and soy sauce',
          price: 29.99,
          image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-kenji',
          cookName: 'Kenji Tanaka',
          cookRating: 4.9,
          distance: 1.5,
          prepTime: 30,
          mealType: 'dinner',
          tags: ['Japanese', 'Sushi', 'Raw'],
          foodRating: 4.9,
          totalFoodReviews: 98,
          isPopular: false,
          isNew: false,
          allergens: ['Fish', 'Shellfish', 'Soy'],
          nutritionInfo: { calories: 520, protein: 30, carbs: 60, fat: 15 },
        },
        {
          id: '13',
          title: 'Authentic Greek Moussaka',
          description: 'Layers of eggplant, potato, and seasoned ground lamb topped with béchamel sauce',
          price: 17.99,
          image: 'https://images.pexels.com/photos/6419736/pexels-photo-6419736.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-elena',
          cookName: 'Elena Papadopoulos',
          cookRating: 4.6,
          distance: 1.8,
          prepTime: 50,
          mealType: 'dinner',
          tags: ['Greek', 'Mediterranean', 'Comfort Food'],
          foodRating: 4.8,
          totalFoodReviews: 87,
          isPopular: true,
          isNew: false,
          allergens: ['Dairy', 'Gluten'],
          nutritionInfo: { calories: 580, protein: 26, carbs: 42, fat: 32 },
        },
        {
          id: '14',
          title: 'Greek Salad',
          description: 'Fresh tomatoes, cucumber, red onion, olives, and feta cheese with olive oil dressing',
          price: 12.99,
          image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-elena',
          cookName: 'Elena Papadopoulos',
          cookRating: 4.6,
          distance: 1.8,
          prepTime: 15,
          mealType: 'lunch',
          tags: ['Greek', 'Salad', 'Healthy'],
          foodRating: 4.7,
          totalFoodReviews: 65,
          isPopular: false,
          isNew: false,
          allergens: ['Dairy'],
          nutritionInfo: { calories: 320, protein: 12, carbs: 18, fat: 22 },
        },
        {
          id: '15',
          title: 'Spanakopita',
          description: 'Flaky phyllo pastry filled with spinach, feta cheese, onions, and herbs',
          price: 14.99,
          image: 'https://images.pexels.com/photos/6419737/pexels-photo-6419737.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-elena',
          cookName: 'Elena Papadopoulos',
          cookRating: 4.6,
          distance: 1.8,
          prepTime: 25,
          mealType: 'lunch',
          tags: ['Greek', 'Vegetarian', 'Pastry'],
          foodRating: 4.6,
          totalFoodReviews: 54,
          isPopular: false,
          isNew: true,
          allergens: ['Dairy', 'Gluten'],
          nutritionInfo: { calories: 380, protein: 14, carbs: 28, fat: 24 },
        },
        {
          id: '16',
          title: 'Jerk Chicken with Rice & Peas',
          description: 'Spicy marinated chicken with traditional Jamaican rice and kidney beans',
          price: 18.99,
          image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-marcus',
          cookName: 'Marcus Campbell',
          cookRating: 4.8,
          distance: 2.7,
          prepTime: 40,
          mealType: 'dinner',
          tags: ['Caribbean', 'Spicy', 'Chicken'],
          foodRating: 4.9,
          totalFoodReviews: 108,
          isPopular: true,
          isNew: false,
          allergens: [],
          nutritionInfo: { calories: 620, protein: 38, carbs: 65, fat: 22 },
        },
        {
          id: '17',
          title: 'Oxtail Stew',
          description: 'Slow-cooked oxtail with butter beans, carrots, and traditional Caribbean spices',
          price: 22.99,
          image: 'https://images.pexels.com/photos/5409010/pexels-photo-5409010.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-marcus',
          cookName: 'Marcus Campbell',
          cookRating: 4.8,
          distance: 2.7,
          prepTime: 60,
          mealType: 'dinner',
          tags: ['Caribbean', 'Stew', 'Comfort Food'],
          foodRating: 4.8,
          totalFoodReviews: 76,
          isPopular: false,
          isNew: false,
          allergens: [],
          nutritionInfo: { calories: 580, protein: 42, carbs: 38, fat: 28 },
        },
        {
          id: '18',
          title: 'Ackee and Saltfish',
          description: 'Jamaica\'s national dish with ackee fruit, salted cod, onions, and spices',
          price: 16.99,
          image: 'https://images.pexels.com/photos/5409009/pexels-photo-5409009.jpeg?auto=compress&cs=tinysrgb&w=800',
          cookId: 'ck-marcus',
          cookName: 'Marcus Campbell',
          cookRating: 4.8,
          distance: 2.7,
          prepTime: 30,
          mealType: 'breakfast',
          tags: ['Caribbean', 'Seafood', 'Traditional'],
          foodRating: 4.7,
          totalFoodReviews: 62,
          isPopular: false,
          isNew: true,
          allergens: ['Fish'],
          nutritionInfo: { calories: 420, protein: 28, carbs: 32, fat: 18 },
        }
      ];
      
      setFoodItems(mockFoodItems);
    } catch (error) {
      console.error('Error loading food items:', error);
    }
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.sortBy !== 'relevance') count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.distance < 25) count++;
    if (filters.rating !== 'any') count++;
    if (filters.prepTime < 120) count++;
    if (filters.cuisineTypes.length > 0) count++;
    if (filters.dietaryRestrictions.length > 0) count++;
    if (selectedCookId) count++;
    setActiveFiltersCount(count);
  };

  const applyFilters = () => {
    let filtered = [...foodItems];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by meal type
    if (selectedMealType !== 'all') {
      filtered = filtered.filter(item => item.mealType === selectedMealType);
    }

    // Filter by cook
    if (selectedCookId) {
      filtered = filtered.filter(item => item.cookId === selectedCookId);
    }

    // Apply price range filter
    if (filters.priceRange.min) {
      filtered = filtered.filter(item => item.price >= parseFloat(filters.priceRange.min));
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(item => item.price <= parseFloat(filters.priceRange.max));
    }

    // Apply cuisine type filter
    if (filters.cuisineTypes.length > 0) {
      filtered = filtered.filter(item => 
        item.tags.some((tag: string) => filters.cuisineTypes.includes(tag))
      );
    }

    // Apply dietary restrictions filter
    if (filters.dietaryRestrictions.length > 0) {
      filtered = filtered.filter(item => 
        item.tags.some((tag: string) => filters.dietaryRestrictions.includes(tag))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
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
      default:
        // Default relevance sorting (no change)
        break;
    }

    return filtered;
  };

  const filteredFoodItems = applyFilters();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoodItems();
    await loadCooks();
    setRefreshing(false);
  };

  const handleFoodItemPress = (item: any) => {
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

  const clearCookFilter = () => {
    setSelectedCookId(null);
  };

  const selectedCookData = selectedCookId ? cooks.find(c => c.id === selectedCookId) : null;

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
                <Text style={styles.greeting}>Good {getGreeting()}!</Text>
                <Text style={styles.userName}>{user?.name || 'Food Lover'}</Text>
              </View>
              
              <TouchableOpacity style={styles.locationSection}>
                <MapPin size={16} color="white" />
                <Text style={styles.location} numberOfLines={1}>
                  {address || 'Getting your location...'}
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
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color={theme.colors.primary} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
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
                  <Text style={styles.cookFilterRatingText}>
                    {selectedCookData.rating} • {selectedCookData.specialties.join(', ')}
                  </Text>
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
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredFoodItems.length} {filteredFoodItems.length === 1 ? 'dish' : 'dishes'} found
            </Text>
          </View>
          
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
                onCookPress={() => {
                  const cook = cooks.find(c => c.id === item.cookId);
                  if (cook) {
                    setSelectedCookId(cook.id);
                  }
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

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
                    filters.sortBy === option.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, sortBy: option.id }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.sortBy === option.id && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {filters.sortBy === option.id && (
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
                  value={filters.priceRange.min}
                  onChangeText={(text) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, min: text }
                  }))}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <Text style={styles.priceRangeSeparator}>to</Text>
                <Input
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChangeText={(text) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: text }
                  }))}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>
            </View>

            {/* Cuisine Types */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Cuisine Type</Text>
              <View style={styles.chipContainer}>
                {CUISINE_TYPES.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.filterChip,
                      filters.cuisineTypes.includes(cuisine) && styles.filterChipSelected
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        cuisineTypes: prev.cuisineTypes.includes(cuisine)
                          ? prev.cuisineTypes.filter(c => c !== cuisine)
                          : [...prev.cuisineTypes, cuisine]
                      }));
                    }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.cuisineTypes.includes(cuisine) && styles.filterChipTextSelected
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
              <View style={styles.chipContainer}>
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <TouchableOpacity
                    key={restriction}
                    style={[
                      styles.filterChip,
                      filters.dietaryRestrictions.includes(restriction) && styles.filterChipSelected
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                          ? prev.dietaryRestrictions.filter(r => r !== restriction)
                          : [...prev.dietaryRestrictions, restriction]
                      }));
                    }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.dietaryRestrictions.includes(restriction) && styles.filterChipTextSelected
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
              onPress={() => {
                setFilters({
                  sortBy: 'relevance',
                  priceRange: { min: '', max: '' },
                  distance: 25,
                  rating: 'any',
                  prepTime: 120,
                  cuisineTypes: [],
                  dietaryRestrictions: [],
                });
                setSelectedCookId(null);
              }}
              style={styles.filterClearButton}
            />
            <Button
              title="Apply Filters"
              onPress={() => setShowFilterModal(false)}
              style={styles.filterApplyButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper functions
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
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
    width: '100%',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    gap: theme.spacing.md,
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
  dashboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  statValue: {
    fontSize: 20,
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
    marginTop: -theme.spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    gap: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  activeOrdersCard: {
    marginHorizontal: theme.spacing.lg,
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
  orderItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
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
  mealTypeContainer: {
    marginBottom: theme.spacing.lg,
  },
  mealTypeLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  mealTypeButtons: {
    flexDirection: 'row',
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
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  menuCard: {
    marginBottom: theme.spacing.md,
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
    fontSize: 14,
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
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  menuActions: {
    justifyContent: 'center',
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
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
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
  resultsHeader: {
    marginBottom: theme.spacing.md,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
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
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  filterOptionSelected: {
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  filterChipTextSelected: {
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
  filterClearButton: {
    flex: 1,
  },
  filterApplyButton: {
    flex: 1,
  },
});