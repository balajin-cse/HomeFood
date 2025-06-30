import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChefHat, 
  Package, 
  Plus, 
  X, 
  Clock, 
  DollarSign, 
  Star, 
  MapPin, 
  Award,
  Users,
  Filter,
  Search
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  available_quantity: number;
  is_active: boolean;
}

interface Order {
  id: string;
  tracking_number: string;
  customer_id: string;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  created_at: string;
  customer_name?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  food_title: string;
  food_description: string;
  price: number;
  quantity: number;
}

interface CookProfile {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  menu_count?: number;
  avg_rating?: number;
  total_orders?: number;
  specialties?: string[];
  is_online?: boolean;
}

export default function CookScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cooks, setCooks] = useState<CookProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedCook, setSelectedCook] = useState<CookProfile | null>(null);
  const [showCookModal, setShowCookModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    meal_type: 'lunch' as const,
    available_quantity: '',
  });

  useEffect(() => {
    if (user?.is_cook) {
      loadMenuItems();
      loadOrders();
    } else {
      loadCooks();
    }
  }, [user]);

  const loadCooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_cook', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance cook profiles with mock data for better demo
      const enhancedCooks = (data || []).map((cook, index) => ({
        ...cook,
        profile_image: cook.profile_image || `https://images.pexels.com/photos/${1239291 + index}/pexels-photo-${1239291 + index}.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop`,
        menu_count: Math.floor(Math.random() * 15) + 3,
        avg_rating: 4.2 + Math.random() * 0.7,
        total_orders: Math.floor(Math.random() * 500) + 50,
        specialties: ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian'].slice(0, Math.floor(Math.random() * 3) + 1),
        is_online: Math.random() > 0.3,
      }));

      setCooks(enhancedCooks);
    } catch (error) {
      console.error('Error loading cooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cook_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id(name)
        `)
        .eq('cook_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            customer_name: order.profiles?.name || 'Unknown',
            items: itemsData || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = async () => {
    if (!user || !newItem.title || !newItem.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          cook_id: user.id,
          title: newItem.title,
          description: newItem.description,
          price: parseFloat(newItem.price),
          meal_type: newItem.meal_type,
          available_quantity: parseInt(newItem.available_quantity) || 0,
        });

      if (error) throw error;

      setNewItem({
        title: '',
        description: '',
        price: '',
        meal_type: 'lunch',
        available_quantity: '',
      });
      setShowAddForm(false);
      loadMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
      Alert.alert('Error', 'Failed to add menu item');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const becomeCook = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_cook: true })
        .eq('id', user.id);

      if (error) throw error;
      // The user context will be updated automatically
    } catch (error) {
      console.error('Error becoming cook:', error);
      Alert.alert('Error', 'Failed to register as cook');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.is_cook) {
      await Promise.all([loadMenuItems(), loadOrders()]);
    } else {
      await loadCooks();
    }
    setRefreshing(false);
  };

  const filteredCooks = cooks.filter(cook => 
    cook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cook.specialties && cook.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#FFA500';
      case 'preparing': return '#007AFF';
      case 'ready': return '#34C759';
      case 'picked_up': return '#8E8E93';
      case 'delivered': return '#00C851';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        color={index < Math.floor(rating) ? '#FFD700' : '#E0E0E0'}
        fill={index < Math.floor(rating) ? '#FFD700' : 'transparent'}
      />
    ));
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Customer Interface - Browse Cooks
  if (!user.is_cook) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerHeaderTitle}>Discover Amazing Cooks</Text>
          <Text style={styles.customerHeaderSubtitle}>
            Find talented home cooks near you
          </Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cooks or cuisines..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.cooksContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredCooks.length === 0 ? (
            <View style={styles.emptyState}>
              <ChefHat size={64} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyStateTitle}>No Cooks Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try adjusting your search' : 'Be the first to become a cook!'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity style={styles.becomeCookButton} onPress={becomeCook}>
                  <Text style={styles.becomeCookButtonText}>Become a Cook</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.cooksHeader}>
                <Text style={styles.cooksCount}>
                  {filteredCooks.length} cook{filteredCooks.length !== 1 ? 's' : ''} found
                </Text>
                <TouchableOpacity style={styles.becomeCookLink} onPress={becomeCook}>
                  <ChefHat size={16} color={theme.colors.primary} />
                  <Text style={styles.becomeCookLinkText}>Become a Cook</Text>
                </TouchableOpacity>
              </View>

              {filteredCooks.map((cook) => (
                <TouchableOpacity
                  key={cook.id}
                  style={styles.cookCard}
                  onPress={() => {
                    setSelectedCook(cook);
                    setShowCookModal(true);
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.cookCardHeader}>
                    <View style={styles.cookAvatarContainer}>
                      <Image source={{ uri: cook.profile_image || '' }} style={styles.cookAvatar} />
                      <View style={[
                        styles.onlineIndicator,
                        { backgroundColor: cook.is_online ? '#34C759' : '#8E8E93' }
                      ]} />
                    </View>
                    
                    <View style={styles.cookInfo}>
                      <View style={styles.cookNameRow}>
                        <Text style={styles.cookName}>{cook.name}</Text>
                        <Award size={16} color={theme.colors.primary} />
                      </View>
                      
                      <View style={styles.ratingContainer}>
                        <View style={styles.stars}>
                          {renderStars(cook.avg_rating || 4.5)}
                        </View>
                        <Text style={styles.ratingText}>
                          {(cook.avg_rating || 4.5).toFixed(1)} ({cook.total_orders || 0} orders)
                        </Text>
                      </View>
                      
                      <Text style={styles.cookLocation}>
                        <MapPin size={12} color={theme.colors.onSurfaceVariant} />
                        {cook.address || 'San Francisco, CA'} • {(Math.random() * 3 + 0.5).toFixed(1)}km away
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cookSpecialties}>
                    {(cook.specialties || []).map((specialty, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cookStats}>
                    <View style={styles.cookStat}>
                      <Text style={styles.statNumber}>{cook.menu_count || 0}</Text>
                      <Text style={styles.statLabel}>dishes</Text>
                    </View>
                    <View style={styles.cookStat}>
                      <Text style={styles.statNumber}>{Math.floor(Math.random() * 30 + 15)}</Text>
                      <Text style={styles.statLabel}>min</Text>
                    </View>
                    <View style={styles.cookStat}>
                      <Text style={styles.statNumber}>${Math.floor(Math.random() * 10 + 12)}</Text>
                      <Text style={styles.statLabel}>avg</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        {/* Cook Detail Modal */}
        <Modal
          visible={showCookModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCookModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cook Profile</Text>
              <TouchableOpacity 
                onPress={() => setShowCookModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            {selectedCook && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.cookDetailHeader}>
                  <Image source={{ uri: selectedCook.profile_image || '' }} style={styles.cookDetailAvatar} />
                  <Text style={styles.cookDetailName}>{selectedCook.name}</Text>
                  
                  <View style={styles.cookDetailRating}>
                    <View style={styles.stars}>
                      {renderStars(selectedCook.avg_rating || 4.5)}
                    </View>
                    <Text style={styles.ratingText}>
                      {(selectedCook.avg_rating || 4.5).toFixed(1)} • {selectedCook.total_orders || 0} orders completed
                    </Text>
                  </View>
                </View>

                <View style={styles.cookDetailStats}>
                  <View style={styles.detailStatCard}>
                    <Users size={24} color={theme.colors.primary} />
                    <Text style={styles.detailStatValue}>{selectedCook.total_orders || 0}</Text>
                    <Text style={styles.detailStatLabel}>Happy Customers</Text>
                  </View>
                  <View style={styles.detailStatCard}>
                    <ChefHat size={24} color={theme.colors.primary} />
                    <Text style={styles.detailStatValue}>{selectedCook.menu_count || 0}</Text>
                    <Text style={styles.detailStatLabel}>Dishes Available</Text>
                  </View>
                  <View style={styles.detailStatCard}>
                    <Clock size={24} color={theme.colors.primary} />
                    <Text style={styles.detailStatValue}>{Math.floor(Math.random() * 10 + 15)}</Text>
                    <Text style={styles.detailStatLabel}>Avg Prep Time</Text>
                  </View>
                </View>

                <View style={styles.cookDetailSection}>
                  <Text style={styles.sectionTitle}>Specialties</Text>
                  <View style={styles.specialtiesGrid}>
                    {(selectedCook.specialties || []).map((specialty, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.cookDetailSection}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.aboutText}>
                    Passionate home cook with {Math.floor(Math.random() * 5 + 2)} years of experience. 
                    I love creating delicious, authentic dishes that bring people together. 
                    All my ingredients are fresh and locally sourced when possible.
                  </Text>
                </View>

                <TouchableOpacity style={styles.viewMenuButton}>
                  <Text style={styles.viewMenuButtonText}>View Menu</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Cook Interface (existing code)
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cook Dashboard</Text>
          <TouchableOpacity 
            style={styles.ordersButton}
            onPress={() => setShowOrdersModal(true)}
          >
            <Package size={24} color={theme.colors.primary} />
            <Text style={styles.ordersButtonText}>Orders ({orders.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>
              ${orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>
              {orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length}
            </Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu Items</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={20} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {menuItems.length === 0 ? (
            <View style={styles.emptyState}>
              <ChefHat size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyStateTitle}>No Menu Items</Text>
              <Text style={styles.emptyStateText}>
                Add your first delicious dish to get started!
              </Text>
            </View>
          ) : (
            menuItems.map((item) => (
              <View key={item.id} style={styles.menuItemCard}>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: item.is_active ? '#34C759' : '#8E8E93' }
                ]}>
                  <Text style={styles.statusText}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Menu Item Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Menu Item</Text>
            <TouchableOpacity 
              onPress={() => setShowAddForm(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.title}
                onChangeText={(text) => setNewItem({ ...newItem, title: text })}
                placeholder="Enter dish name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newItem.description}
                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                placeholder="Describe your dish"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.price}
                onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Available Quantity</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.available_quantity}
                onChangeText={(text) => setNewItem({ ...newItem, available_quantity: text })}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddMenuItem}>
              <Text style={styles.submitButtonText}>Add Menu Item</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Orders Modal */}
      <Modal
        visible={showOrdersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOrdersModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
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
            {orders.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
                <Text style={styles.emptyStateText}>
                  Orders from customers will appear here
                </Text>
              </View>
            ) : (
              orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderTitle}>
                      {order.items[0]?.food_title || 'Order'} 
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) }
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.orderCustomer}>
                    Customer: {order.customer_name}
                  </Text>
                  <Text style={styles.orderDetails}>
                    Order #{order.tracking_number} • ${order.total_amount.toFixed(2)}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                  
                  {['confirmed', 'preparing', 'ready'].includes(order.status) && (
                    <View style={styles.orderActions}>
                      {order.status === 'confirmed' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        >
                          <Text style={styles.actionButtonText}>Start Preparing</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'preparing' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleUpdateOrderStatus(order.id, 'ready')}
                        >
                          <Text style={styles.actionButtonText}>Mark Ready</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'ready' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleUpdateOrderStatus(order.id, 'picked_up')}
                        >
                          <Text style={styles.actionButtonText}>Mark Picked Up</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  // Customer Interface Styles
  customerHeader: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customerHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  customerHeaderSubtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  filterButton: {
    padding: 4,
  },
  cooksContainer: {
    flex: 1,
    padding: 20,
  },
  cooksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cooksCount: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  becomeCookLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  becomeCookLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  cookCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cookCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cookAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  cookAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  cookInfo: {
    flex: 1,
  },
  cookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cookName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  cookLocation: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  cookStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cookStat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  // Cook Detail Modal Styles
  cookDetailHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 24,
  },
  cookDetailAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  cookDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  cookDetailRating: {
    alignItems: 'center',
    gap: 8,
  },
  cookDetailStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  detailStatCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 8,
    marginBottom: 4,
  },
  detailStatLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cookDetailSection: {
    marginBottom: 24,
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aboutText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
  },
  viewMenuButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  viewMenuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Existing Cook Interface Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ordersButtonText: {
    marginLeft: 4,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    marginLeft: 4,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
  },
  becomeCookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  becomeCookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  menuItemDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  orderCustomer: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  orderDetails: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  orderActions: {
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});