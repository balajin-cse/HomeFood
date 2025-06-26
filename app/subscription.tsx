import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Crown, Check, Star, Zap, Shield } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { theme } from '@/constants/theme';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  originalPrice?: number;
  popular?: boolean;
  features: string[];
  color: string;
  icon: React.ReactNode;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'daily_plan',
    name: 'Daily Explorer',
    price: 4.99,
    period: 'day',
    features: [
      'Order from local home cooks',
      'Fresh homemade meals',
      'Same-day delivery',
      'Customer support',
    ],
    color: theme.colors.secondary,
    icon: <Zap size={24} color="white" />,
  },
  {
    id: 'weekly_plan',
    name: 'Weekly Foodie',
    price: 24.99,
    period: 'week',
    originalPrice: 34.93,
    popular: true,
    features: [
      'All Daily Explorer features',
      'Priority ordering',
      'Meal planning assistance',
      '20% discount on bulk orders',
      'Free delivery',
      'Exclusive recipes',
    ],
    color: theme.colors.primary,
    icon: <Star size={24} color="white" />,
  },
  {
    id: 'monthly_plan',
    name: 'Monthly Gourmet',
    price: 79.99,
    period: 'month',
    originalPrice: 149.70,
    features: [
      'All Weekly Foodie features',
      'Exclusive chef access',
      'Custom meal requests',
      'Nutrition consultation',
      'Premium customer support',
      '30% discount on all orders',
      'VIP events access',
    ],
    color: theme.colors.primaryDark,
    icon: <Crown size={24} color="white" />,
  },
];

export default function SubscriptionScreen() {
  const { packages, purchasePackage } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('weekly_plan');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // Find the selected package
      const selectedPackage = packages.find(pkg => pkg.identifier === selectedPlan);
      
      if (selectedPackage) {
        const success = await purchasePackage(selectedPackage);
        if (success) {
          Alert.alert(
            'Subscription Activated!',
            'Welcome to HomeFood Premium! You can now order from amazing home cooks.',
            [
              { text: 'Start Exploring', onPress: () => router.replace('/(tabs)') }
            ]
          );
        } else {
          Alert.alert('Purchase Failed', 'Please try again or contact support.');
        }
      } else {
        // Fallback for web demo
        Alert.alert(
          'Subscription Activated!',
          'Welcome to HomeFood Premium! You can now order from amazing home cooks.',
          [
            { text: 'Start Exploring', onPress: () => router.replace('/(tabs)') }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Crown size={48} color="white" />
          <Text style={styles.headerTitle}>Unlock Premium</Text>
          <Text style={styles.headerSubtitle}>
            Get unlimited access to amazing homemade meals from talented local cooks
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Go Premium?</Text>
          <View style={styles.benefits}>
            {[
              { icon: <Check size={20} color={theme.colors.success} />, text: 'Order from verified home cooks' },
              { icon: <Check size={20} color={theme.colors.success} />, text: 'Fresh, homemade meals daily' },
              { icon: <Check size={20} color={theme.colors.success} />, text: 'Support local food entrepreneurs' },
              { icon: <Check size={20} color={theme.colors.success} />, text: 'Personalized meal recommendations' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefit}>
                {benefit.icon}
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans Section */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plans}>
            {SUBSCRIPTION_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <Card style={[
                  styles.planCardInner,
                  selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 }
                ]}>
                  {plan.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                  
                  <View style={[styles.planHeader, { backgroundColor: plan.color }]}>
                    {plan.icon}
                    <Text style={styles.planName}>{plan.name}</Text>
                  </View>
                  
                  <View style={styles.planPricing}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>${plan.price}</Text>
                      <Text style={styles.period}>/{plan.period}</Text>
                    </View>
                    {plan.originalPrice && (
                      <View style={styles.savingsContainer}>
                        <Text style={styles.originalPrice}>${plan.originalPrice}</Text>
                        <Text style={styles.savings}>
                          Save {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.feature}>
                        <Check size={16} color={theme.colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trust Section */}
        <Card style={styles.trustSection}>
          <View style={styles.trustHeader}>
            <Shield size={24} color={theme.colors.primary} />
            <Text style={styles.trustTitle}>Safe & Secure</Text>
          </View>
          <Text style={styles.trustText}>
            Your payment is protected with bank-level security. Cancel anytime with no hidden fees.
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.selectedPlanInfo}>
          <Text style={styles.selectedPlanText}>
            {selectedPlanData?.name} - ${selectedPlanData?.price}/{selectedPlanData?.period}
          </Text>
          {selectedPlanData?.originalPrice && (
            <Text style={styles.selectedPlanSavings}>
              Save ${(selectedPlanData.originalPrice - selectedPlanData.price).toFixed(2)}
            </Text>
          )}
        </View>
        <Button
          title={loading ? 'Processing...' : 'Start Free Trial'}
          onPress={handleSubscribe}
          disabled={loading}
          size="large"
          style={styles.subscribeButton}
        />
        <Text style={styles.trialText}>
          7-day free trial, then ${selectedPlanData?.price}/{selectedPlanData?.period}
        </Text>
      </View>
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
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
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
    lineHeight: 24,
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
  },
  benefitsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  benefits: {
    gap: theme.spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
    flex: 1,
  },
  plansSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  plans: {
    gap: theme.spacing.lg,
  },
  planCard: {
    position: 'relative',
  },
  planCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  planCardInner: {
    padding: 0,
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  planName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  planPricing: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  period: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginLeft: theme.spacing.xs,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.success,
  },
  planFeatures: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    gap: theme.spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
    flex: 1,
  },
  trustSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  trustTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  trustText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  bottomAction: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  selectedPlanInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  selectedPlanText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  selectedPlanSavings: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.success,
  },
  subscribeButton: {
    marginBottom: theme.spacing.sm,
  },
  trialText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});