import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Searchbar, Card, Chip, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';
import { useSubscription } from '../context/SubscriptionContext';
import { theme } from '../theme/theme';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  cookName: string;
  cookRating: number;
  distance: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  availableQuantity: number;
  tags: string[];
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { address } = useLocation();
  const { isSubscribed } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    // Mock data - replace with actual API call
    const mockFoodItems: FoodItem[] = [
      {
        id: '1',
        title: 'Homemade Pasta Carbonara',
        description: 'Creamy pasta with bacon and parmesan cheese',
        price: 12.99,
        image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        cookName: 'Maria Rodriguez',
        cookRating: 4.8,
        distance: 2.3,
        mealType: 'lunch',
        availableQuantity: 5,
        tags: ['Italian', 'Pasta', 'Creamy'],
      },
      {
        id: '2',
        title: 'Fresh Avocado Toast',
        description: 'Multigrain bread with fresh avocado and herbs',
        price: 8.50,
        image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg',
        cookName: 'Sarah Johnson',
        cookRating: 4.6,
        distance: 1.8,
        mealType: 'breakfast',
        availableQuantity: 8,
        tags: ['Healthy', 'Vegetarian', 'Fresh'],
      },
      {
        id: '3',
        title: 'Grilled Salmon with Vegetables',
        description: 'Fresh salmon with seasonal grilled vegetables',
        price: 18.99,
        image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg',
        cookName: 'David Chen',
        cookRating: 4.9,
        distance: 3.1,
        mealType: 'dinner',
        availableQuantity: 3,
        tags: ['Healthy', 'Seafood', 'Grilled'],
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
                         item.cookName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMealType = selectedMealType === 'all' || item.mealType === selectedMealType;
    return matchesSearch && matchesMealType;
  });

  const handleFoodItemPress = (item: FoodItem) => {
    if (!isSubscribed) {
      navigation.navigate('Subscription' as never);
      return;
    }
    navigation.navigate('FoodDetail' as never, { foodItem: item } as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning!</Text>
        <Text style={styles.location}>{address || 'Loading location...'}</Text>
      </View>

      <Searchbar
        placeholder="Search for homemade food..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mealTypeContainer}
      >
        {['all', 'breakfast', 'lunch', 'dinner'].map((mealType) => (
          <Chip
            key={mealType}
            selected={selectedMealType === mealType}
            onPress={() => setSelectedMealType(mealType)}
            style={styles.mealTypeChip}
            textStyle={styles.chipText}
          >
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.foodList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredFoodItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleFoodItemPress(item)}
          >
            <Card style={styles.foodCard}>
              <View style={styles.cardContent}>
                <Image source={{ uri: item.image }} style={styles.foodImage} />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodTitle}>{item.title}</Text>
                  <Text style={styles.foodDescription}>{item.description}</Text>
                  <Text style={styles.cookName}>by {item.cookName}</Text>
                  <View style={styles.foodMeta}>
                    <Text style={styles.price}>${item.price}</Text>
                    <Text style={styles.distance}>{item.distance}km away</Text>
                  </View>
                  <View style={styles.tags}>
                    {item.tags.slice(0, 2).map((tag) => (
                      <Chip key={tag} compact style={styles.tag}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!isSubscribed && (
        <FAB
          style={styles.fab}
          icon="crown"
          label="Subscribe"
          onPress={() => navigation.navigate('Subscription' as never)}
        />
      )}
    </View>
  );
};

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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  searchBar: {
    margin: 20,
    elevation: 4,
  },
  mealTypeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mealTypeChip: {
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
  },
  foodList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodCard: {
    marginBottom: 15,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  foodInfo: {
    flex: 1,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  foodDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 5,
  },
  cookName: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 10,
  },
  foodMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  distance: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 5,
    marginBottom: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.secondary,
  },
});

export default HomeScreen;