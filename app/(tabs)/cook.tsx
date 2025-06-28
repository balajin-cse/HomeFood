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
} from 'react-native';
import { FAB, Card, Button, TextInput, Chip } from 'react-native-paper';
import { Star, Award, MapPin, Clock, Users, ChefHat, X, Plus, Eye } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';

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

export default function CookScreen() {
  const { user } = useAuth();
  const [cooks, setCooks] = useState<CookProfile[]>([]);
  const [selectedCook, setSelectedCook] = useState<CookProfile | null>(null);
  const [showCookProfile, setShowCookProfile] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
    loadCooks();
    loadMenuItems();
  }, []);

  const loadCooks = () => {
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
        menuItemsCount: 12,
        averagePrice: 16.50,
        isOnline: true,
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
        menuItemsCount: 8,
        averagePrice: 13.75,
        isOnline: false,
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
        menuItemsCount: 15,
        averagePrice: 22.30,
        isOnline: true,
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
        menuItemsCount: 6,
        averagePrice: 18.99,
        isOnline: true,
      },
      {
        id: '5',
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
        bio: 'Born in Athens, I bring authentic Greek flavors and Mediterranean wellness to every dish. Using family recipes passed down for generations.',
        location: 'Castro, SF',
        distance: 1.8,
        menuItemsCount: 10,
        averagePrice: 15.25,
        isOnline: false,
      },
      {
        id: '6',
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
        bio: 'Jamaican-born chef specializing in Caribbean cuisine and authentic jerk seasonings. Bringing island vibes to the Bay Area.',
        location: 'Oakland, CA',
        distance: 2.7,
        menuItemsCount: 9,
        averagePrice: 17.80,
        isOnline: true,
      },
    ];
    setCooks(mockCooks);
  };

  const loadMenuItems = () => {
    // Mock data - replace with actual API call
    const mockItems: MenuItem[] = [
      {
        id: '1',
        title: 'Homemade Pasta Carbonara',
        description: 'Fresh pasta with tomato sauce',
        price: 12.99,
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
  };

  const handleAddItem = () => {
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
      cookId: user?.id || '1',
      rating: 0,
      totalReviews: 0,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    };

    setMenuItems(prev => [...prev, item]);
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

  const toggleItemStatus = (id: string) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleCookPress = (cook: CookProfile) => {
    setSelectedCook(cook);
    setShowCookProfile(true);
  };

  const handleViewCookMenu = (cookId: string) => {
    setShowCookProfile(false);
    // Navigate to discover page with cook filter
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

  if (!user?.isCook) {
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
              Browse talented home cooks in your area
            </Text>
          </View>
        </LinearGradient>

        {/* Cooks List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                {/* Cook Profile Header */}
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
                <View style={styles.cookStatsDetailed}>
                  <View style={styles.statItemDetailed}>
                    <Text style={styles.statNumberDetailed}>{selectedCook.yearsExperience}</Text>
                    <Text style={styles.statLabelDetailed}>Years Experience</Text>
                  </View>
                  <View style={styles.statItemDetailed}>
                    <Text style={styles.statNumberDetailed}>{selectedCook.totalOrders}</Text>
                    <Text style={styles.statLabelDetailed}>Total Orders</Text>
                  </View>
                  <View style={styles.statItemDetailed}>
                    <Text style={styles.statNumberDetailed}>{selectedCook.responseTime}</Text>
                    <Text style={styles.statLabelDetailed}>Response Time</Text>
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
                <View style={styles.cookSpecialtiesDetailed}>
                  <Text style={styles.sectionTitle}>Specialties</Text>
                  <View style={styles.specialtiesList}>
                    {selectedCook.specialties.map((specialty, index) => (
                      <View key={index} style={styles.specialtyTagDetailed}>
                        <Text style={styles.specialtyTextDetailed}>{specialty}</Text>
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
                    mode="contained"
                    onPress={() => handleViewCookMenu(selectedCook.id)}
                    style={styles.actionButton}
                    icon={() => <Eye size={20} color="white" />}
                  >
                    View Menu
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      // Open messaging
                    }}
                    style={styles.actionButton}
                  >
                    Message Cook
                  </Button>
                </View>
              </ScrollView>
            </View>
          )}
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Kitchen</Text>
        <Text style={styles.headerSubtitle}>Manage your menu items</Text>
      </View>

      <ScrollView style={styles.content}>
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
                  <View style={styles.menuRating}>
                    <View style={styles.ratingStars}>
                      {renderStars(item.rating)}
                    </View>
                    <Text style={styles.ratingText}>
                      {item.rating > 0 ? `${item.rating} (${item.totalReviews})` : 'No reviews yet'}
                    </Text>
                  </View>
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
    </View>
  );
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
  },
  content: {
    flex: 1,
    padding: 20,
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
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
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
  cookStatsDetailed: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  statItemDetailed: {
    alignItems: 'center',
  },
  statNumberDetailed: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabelDetailed: {
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
  cookSpecialtiesDetailed: {
    marginBottom: theme.spacing.xl,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  specialtyTagDetailed: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  specialtyTextDetailed: {
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
  menuRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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
});