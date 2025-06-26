import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Card, Chip, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme/theme';

const FoodDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { foodItem } = route.params as any;
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= foodItem.availableQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    navigation.navigate('Checkout' as never, {
      foodItem,
      quantity,
      totalPrice: foodItem.price * quantity,
    } as never);
  };

  const totalPrice = foodItem.price * quantity;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Image source={{ uri: foodItem.image }} style={styles.foodImage} />
        
        <View style={styles.details}>
          <Text style={styles.title}>{foodItem.title}</Text>
          <Text style={styles.description}>{foodItem.description}</Text>
          
          <View style={styles.cookInfo}>
            <Text style={styles.cookName}>👨‍🍳 {foodItem.cookName}</Text>
            <Text style={styles.rating}>⭐ {foodItem.cookRating}</Text>
            <Text style={styles.distance}>📍 {foodItem.distance}km away</Text>
          </View>

          <View style={styles.tags}>
            {foodItem.tags.map((tag: string) => (
              <Chip key={tag} style={styles.tag}>
                {tag}
              </Chip>
            ))}
          </View>

          <Card style={styles.priceCard}>
            <View style={styles.priceContent}>
              <View style={styles.priceInfo}>
                <Text style={styles.price}>${foodItem.price}</Text>
                <Text style={styles.priceLabel}>per serving</Text>
              </View>
              <Text style={styles.availability}>
                {foodItem.availableQuantity} servings available
              </Text>
            </View>
          </Card>

          <Card style={styles.quantityCard}>
            <View style={styles.quantityContent}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantityControls}>
                <IconButton
                  icon="minus"
                  onPress={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                />
                <Text style={styles.quantityValue}>{quantity}</Text>
                <IconButton
                  icon="plus"
                  onPress={() => handleQuantityChange(1)}
                  disabled={quantity >= foodItem.availableQuantity}
                />
              </View>
            </View>
          </Card>

          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {foodItem.title} x {quantity}
              </Text>
              <Text style={styles.summaryValue}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>$2.99</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${(totalPrice + 2.99).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleAddToCart}
          style={styles.orderButton}
          contentStyle={styles.orderButtonContent}
        >
          Order Now - ${(totalPrice + 2.99).toFixed(2)}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  foodImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  details: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 20,
  },
  cookInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  cookName: {
    fontSize: 16,
    fontWeight: '500',
  },
  rating: {
    fontSize: 16,
  },
  distance: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  priceCard: {
    marginBottom: 15,
    elevation: 2,
  },
  priceContent: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    alignItems: 'flex-start',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  availability: {
    fontSize: 14,
    color: theme.colors.success,
  },
  quantityCard: {
    marginBottom: 20,
    elevation: 2,
  },
  quantityContent: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  orderSummary: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.text,
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  orderButton: {
    paddingVertical: 8,
  },
  orderButtonContent: {
    paddingVertical: 8,
  },
});

export default FoodDetailScreen;