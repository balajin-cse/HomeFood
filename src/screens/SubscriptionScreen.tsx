import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Card, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../context/SubscriptionContext';
import { theme } from '../theme/theme';

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { offerings, purchasePackage, restorePurchases, loading } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (packageToPurchase: any) => {
    try {
      setPurchasing(true);
      const success = await purchasePackage(packageToPurchase);
      
      if (success) {
        Alert.alert(
          'Success!',
          'Welcome to HomeFood Premium! You can now order from home cooks.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to complete purchase. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert('Restored', 'Your purchases have been restored.');
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  const subscriptionPlans = [
    {
      id: 'daily',
      title: 'Daily Plan',
      price: '$4.99',
      period: 'per day',
      features: [
        'Order from local home cooks',
        'Fresh homemade meals',
        'Same-day delivery',
        'Customer support',
      ],
      popular: false,
    },
    {
      id: 'weekly',
      title: 'Weekly Plan',
      price: '$24.99',
      period: 'per week',
      features: [
        'All Daily Plan features',
        'Priority ordering',
        'Meal planning assistance',
        '20% discount on bulk orders',
        'Free delivery',
      ],
      popular: true,
    },
    {
      id: 'monthly',
      title: 'Monthly Plan',
      price: '$79.99',
      period: 'per month',
      features: [
        'All Weekly Plan features',
        'Exclusive chef access',
        'Custom meal requests',
        'Nutrition consultation',
        'Premium customer support',
        '30% discount on all orders',
      ],
      popular: false,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <Text style={styles.headerSubtitle}>
          Get access to homemade meals from local cooks in your area
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.valueProposition}>
          <Text style={styles.valueTitle}>Why HomeFood Premium?</Text>
          <View style={styles.valuePoints}>
            <Text style={styles.valuePoint}>🏠 Support local home cooks</Text>
            <Text style={styles.valuePoint}>🍽️ Fresh, homemade meals daily</Text>
            <Text style={styles.valuePoint}>📍 Delivery within 5-10km radius</Text>
            <Text style={styles.valuePoint}>⭐ Rated cooks and quality assurance</Text>
          </View>
        </View>

        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} style={[styles.planCard, plan.popular && styles.popularCard]}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
              </View>
            </View>
            <View style={styles.features}>
              {plan.features.map((feature, index) => (
                <Text key={index} style={styles.feature}>
                  ✓ {feature}
                </Text>
              ))}
            </View>
            <Button
              mode="contained"
              onPress={() => handlePurchase(plan)}
              style={[styles.subscribeButton, plan.popular && styles.popularButton]}
              disabled={purchasing}
              loading={purchasing}
            >
              {purchasing ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </Card>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Subscriptions auto-renew unless cancelled.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.text,
  },
  header: {
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  valueProposition: {
    marginBottom: 30,
  },
  valueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  valuePoints: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 12,
  },
  valuePoint: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
  },
  planCard: {
    marginBottom: 20,
    padding: 20,
    elevation: 3,
  },
  popularCard: {
    borderColor: theme.colors.secondary,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  period: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
  },
  features: {
    marginBottom: 25,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  subscribeButton: {
    paddingVertical: 8,
  },
  popularButton: {
    backgroundColor: theme.colors.secondary,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;