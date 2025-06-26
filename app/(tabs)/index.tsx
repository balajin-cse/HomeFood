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
} from 'react-native';
import { router } from 'expo-router';
import { Search, MapPin, Filter, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FoodCard } from '@/components/FoodCard';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { theme } from '@/constants/theme';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  cookName: string;
  cookRating: number;
  distance: number;
  prepTime: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  tags: string[];
}

const MEAL_TYPES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🥐' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
];

export default function HomeScreen() {
  const { address } = useLocation();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    // Enhanced mock data with 25+ diverse home cooks and beautiful food images
    const mockFoodItems: FoodItem[] = [
      {
        id: '1',
        title: 'Homemade Pasta Carbonara',
        description: 'Creamy pasta with crispy pancetta, fresh eggs, and aged parmesan cheese made with love',
        price: 16.99,
        image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Maria Rodriguez',
        cookRating: 4.9,
        distance: 1.2,
        prepTime: 25,
        mealType: 'lunch',
        tags: ['Italian', 'Pasta', 'Creamy', 'Comfort Food'],
      },
      {
        id: '2',
        title: 'Artisan Avocado Toast',
        description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, microgreens, and hemp seeds',
        price: 12.50,
        image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Sarah Johnson',
        cookRating: 4.7,
        distance: 0.8,
        prepTime: 15,
        mealType: 'breakfast',
        tags: ['Healthy', 'Vegetarian', 'Fresh', 'Organic'],
      },
      {
        id: '3',
        title: 'Pan-Seared Salmon',
        description: 'Atlantic salmon with roasted vegetables and lemon herb butter sauce, served with quinoa',
        price: 24.99,
        image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'David Chen',
        cookRating: 4.8,
        distance: 2.1,
        prepTime: 35,
        mealType: 'dinner',
        tags: ['Seafood', 'Healthy', 'Gourmet', 'Protein Rich'],
      },
      {
        id: '4',
        title: 'Authentic Ramen Bowl',
        description: 'Rich tonkotsu broth with handmade noodles, chashu pork, soft-boiled egg, and nori',
        price: 18.99,
        image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Kenji Tanaka',
        cookRating: 4.9,
        distance: 1.5,
        prepTime: 45,
        mealType: 'lunch',
        tags: ['Japanese', 'Ramen', 'Comfort Food', 'Authentic'],
      },
      {
        id: '5',
        title: 'Mediterranean Bowl',
        description: 'Quinoa bowl with grilled chicken, hummus, olives, cucumber, and fresh herbs',
        price: 15.99,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Elena Papadopoulos',
        cookRating: 4.6,
        distance: 1.8,
        prepTime: 20,
        mealType: 'lunch',
        tags: ['Mediterranean', 'Healthy', 'Protein', 'Fresh'],
      },
      {
        id: '6',
        title: 'French Croissant Benedict',
        description: 'Buttery croissant with poached eggs, hollandaise sauce, Canadian bacon, and chives',
        price: 14.99,
        image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Pierre Dubois',
        cookRating: 4.8,
        distance: 2.3,
        prepTime: 20,
        mealType: 'breakfast',
        tags: ['French', 'Brunch', 'Eggs', 'Gourmet'],
      },
      {
        id: '7',
        title: 'Thai Green Curry',
        description: 'Aromatic green curry with coconut milk, Thai basil, vegetables, and jasmine rice',
        price: 17.50,
        image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Siriporn Nakamura',
        cookRating: 4.7,
        distance: 1.9,
        prepTime: 30,
        mealType: 'dinner',
        tags: ['Thai', 'Spicy', 'Coconut', 'Aromatic'],
      },
      {
        id: '8',
        title: 'BBQ Pulled Pork Sandwich',
        description: 'Slow-cooked pulled pork with tangy BBQ sauce on brioche bun with coleslaw',
        price: 13.99,
        image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Jake Williams',
        cookRating: 4.5,
        distance: 2.7,
        prepTime: 15,
        mealType: 'lunch',
        tags: ['BBQ', 'Pork', 'Sandwich', 'Comfort Food'],
      },
      {
        id: '9',
        title: 'Vegan Buddha Bowl',
        description: 'Colorful bowl with quinoa, roasted vegetables, tahini dressing, and mixed seeds',
        price: 14.50,
        image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Luna Martinez',
        cookRating: 4.6,
        distance: 1.4,
        prepTime: 25,
        mealType: 'lunch',
        tags: ['Vegan', 'Healthy', 'Colorful', 'Nutritious'],
      },
      {
        id: '10',
        title: 'Indian Butter Chicken',
        description: 'Tender chicken in rich tomato-cream sauce with basmati rice and fresh naan bread',
        price: 19.99,
        image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Priya Sharma',
        cookRating: 4.9,
        distance: 2.0,
        prepTime: 40,
        mealType: 'dinner',
        tags: ['Indian', 'Curry', 'Creamy', 'Spiced'],
      },
      {
        id: '11',
        title: 'Korean Bibimbap',
        description: 'Mixed rice bowl with seasoned vegetables, marinated beef, fried egg, and gochujang',
        price: 16.50,
        image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Min-jun Kim',
        cookRating: 4.8,
        distance: 1.7,
        prepTime: 30,
        mealType: 'lunch',
        tags: ['Korean', 'Rice Bowl', 'Healthy', 'Balanced'],
      },
      {
        id: '12',
        title: 'Mexican Street Tacos',
        description: 'Authentic corn tortillas with carnitas, onions, cilantro, and lime - 3 tacos',
        price: 11.99,
        image: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Carlos Mendoza',
        cookRating: 4.7,
        distance: 1.3,
        prepTime: 20,
        mealType: 'lunch',
        tags: ['Mexican', 'Street Food', 'Authentic', 'Spicy'],
      },
      {
        id: '13',
        title: 'Moroccan Tagine',
        description: 'Slow-cooked lamb with apricots, almonds, and aromatic spices, served with couscous',
        price: 22.99,
        image: 'https://images.pexels.com/photos/8477552/pexels-photo-8477552.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Fatima Al-Zahra',
        cookRating: 4.9,
        distance: 2.5,
        prepTime: 50,
        mealType: 'dinner',
        tags: ['Moroccan', 'Lamb', 'Exotic', 'Aromatic'],
      },
      {
        id: '14',
        title: 'Greek Moussaka',
        description: 'Layered eggplant casserole with ground lamb, béchamel sauce, and fresh herbs',
        price: 18.50,
        image: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Dimitri Kostas',
        cookRating: 4.6,
        distance: 2.2,
        prepTime: 45,
        mealType: 'dinner',
        tags: ['Greek', 'Casserole', 'Traditional', 'Hearty'],
      },
      {
        id: '15',
        title: 'Vietnamese Pho',
        description: 'Traditional beef pho with rice noodles, herbs, bean sprouts, and aromatic broth',
        price: 15.99,
        image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Linh Nguyen',
        cookRating: 4.8,
        distance: 1.6,
        prepTime: 35,
        mealType: 'lunch',
        tags: ['Vietnamese', 'Soup', 'Noodles', 'Comfort'],
      },
      {
        id: '16',
        title: 'Ethiopian Injera Platter',
        description: 'Traditional spongy bread with spiced lentils, vegetables, and berbere sauce',
        price: 17.99,
        image: 'https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Almaz Tadesse',
        cookRating: 4.7,
        distance: 2.8,
        prepTime: 40,
        mealType: 'dinner',
        tags: ['Ethiopian', 'Spicy', 'Traditional', 'Vegetarian'],
      },
      {
        id: '17',
        title: 'Brazilian Feijoada',
        description: 'Traditional black bean stew with pork, sausage, served with rice and collard greens',
        price: 20.99,
        image: 'https://images.pexels.com/photos/8477552/pexels-photo-8477552.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Isabella Santos',
        cookRating: 4.8,
        distance: 3.1,
        prepTime: 55,
        mealType: 'dinner',
        tags: ['Brazilian', 'Hearty', 'Traditional', 'Comfort'],
      },
      {
        id: '18',
        title: 'Turkish Breakfast Spread',
        description: 'Traditional Turkish breakfast with cheese, olives, tomatoes, honey, and fresh bread',
        price: 16.99,
        image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Mehmet Özkan',
        cookRating: 4.6,
        distance: 2.4,
        prepTime: 25,
        mealType: 'breakfast',
        tags: ['Turkish', 'Traditional', 'Fresh', 'Variety'],
      },
      {
        id: '19',
        title: 'Peruvian Ceviche',
        description: 'Fresh fish marinated in lime juice with red onions, cilantro, and sweet potato',
        price: 21.99,
        image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Carmen Flores',
        cookRating: 4.9,
        distance: 1.9,
        prepTime: 20,
        mealType: 'lunch',
        tags: ['Peruvian', 'Seafood', 'Fresh', 'Citrusy'],
      },
      {
        id: '20',
        title: 'Russian Borscht',
        description: 'Traditional beet soup with cabbage, carrots, and sour cream, served with dark bread',
        price: 13.99,
        image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Anya Volkov',
        cookRating: 4.5,
        distance: 2.6,
        prepTime: 35,
        mealType: 'lunch',
        tags: ['Russian', 'Soup', 'Traditional', 'Warming'],
      },
      {
        id: '21',
        title: 'Lebanese Mezze Platter',
        description: 'Assorted Middle Eastern appetizers: hummus, tabbouleh, falafel, and pita bread',
        price: 18.99,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Layla Khoury',
        cookRating: 4.7,
        distance: 2.0,
        prepTime: 30,
        mealType: 'lunch',
        tags: ['Lebanese', 'Mezze', 'Healthy', 'Variety'],
      },
      {
        id: '22',
        title: 'Jamaican Jerk Chicken',
        description: 'Spicy marinated chicken with rice and peas, plantains, and scotch bonnet sauce',
        price: 19.50,
        image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Marcus Campbell',
        cookRating: 4.8,
        distance: 2.7,
        prepTime: 45,
        mealType: 'dinner',
        tags: ['Jamaican', 'Spicy', 'Caribbean', 'Flavorful'],
      },
      {
        id: '23',
        title: 'Polish Pierogi',
        description: 'Handmade dumplings filled with potato and cheese, served with sour cream and onions',
        price: 14.99,
        image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Anna Kowalski',
        cookRating: 4.6,
        distance: 1.8,
        prepTime: 30,
        mealType: 'lunch',
        tags: ['Polish', 'Dumplings', 'Comfort', 'Homemade'],
      },
      {
        id: '24',
        title: 'Nigerian Jollof Rice',
        description: 'Spiced rice with tomatoes, peppers, and chicken, served with plantains',
        price: 16.99,
        image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Adunni Okafor',
        cookRating: 4.7,
        distance: 2.3,
        prepTime: 40,
        mealType: 'dinner',
        tags: ['Nigerian', 'Rice', 'Spicy', 'Traditional'],
      },
      {
        id: '25',
        title: 'Swedish Meatballs',
        description: 'Traditional meatballs with cream sauce, lingonberry jam, and mashed potatoes',
        price: 17.50,
        image: 'https://images.pexels.com/photos/8477552/pexels-photo-8477552.jpeg?auto=compress&cs=tinysrgb&w=800',
        cookName: 'Erik Andersson',
        cookRating: 4.5,
        distance: 2.9,
        prepTime: 35,
        mealType: 'dinner',
        tags: ['Swedish', 'Meatballs', 'Traditional', 'Comfort'],
      },
    ];
    setFoodItems(mockFoodItems);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoodItems();
    setRefreshing(false);
  };

  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.cookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMealType = selectedMealType === 'all' || item.mealType === selectedMealType;
    return matchesSearch && matchesMealType;
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.userName}>{user?.name || 'Food Lover'}</Text>
          </View>
          
          <View style={styles.locationSection}>
            <MapPin size={16} color="white" />
            <Text style={styles.location} numberOfLines={1}>
              {address || 'Getting your location...'}
            </Text>
          </View>
        </View>
      </LinearGradient>

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
        <TouchableOpacity onPress={() => router.push('/subscription')}>
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
      <ScrollView
        style={styles.foodList}
        contentContainerStyle={styles.foodListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredFoodItems.length === 0 ? (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No dishes found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or meal type filter
            </Text>
          </Card>
        ) : (
          filteredFoodItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onPress={() => handleFoodItemPress(item)}
            />
          ))
        )}
      </ScrollView>
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
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    opacity: 0.9,
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
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
  mealTypeContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  premiumBanner: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  foodList: {
    flex: 1,
  },
  foodListContent: {
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
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});