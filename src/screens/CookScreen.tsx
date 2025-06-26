import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FAB, Card, Button, TextInput, Chip } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  availableQuantity: number;
  tags: string[];
  isActive: boolean;
}

const CookScreen: React.FC = () => {
  const { user } = useAuth();
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
    loadMenuItems();
  }, []);

  const loadMenuItems = () => {
    // Mock data - replace with actual API call
    const mockItems: MenuItem[] = [
      {
        id: '1',
        title: 'Homemade Pasta',
        description: 'Fresh pasta with tomato sauce',
        price: 12.99,
        mealType: 'lunch',
        availableQuantity: 5,
        tags: ['Italian', 'Pasta'],
        isActive: true,
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

  if (!user?.isCook) {
    return (
      <View style={styles.notCookContainer}>
        <Text style={styles.notCookTitle}>Become a Cook</Text>
        <Text style={styles.notCookText}>
          To start selling your homemade food, you need to register as a cook.
          Contact our support team to get started!
        </Text>
        <Button mode="contained" style={styles.contactButton}>
          Contact Support
        </Button>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  notCookContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notCookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  notCookText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  contactButton: {
    paddingHorizontal: 20,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addForm: {
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 10,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  menuQuantity: {
    fontSize: 14,
    marginBottom: 10,
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

export default CookScreen;