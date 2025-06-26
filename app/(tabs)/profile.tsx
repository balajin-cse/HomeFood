import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Avatar, Card, List, Switch, Button } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isSubscribed } = useSubscription();
  const [notifications, setNotifications] = useState(true);

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

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: 'account-edit',
      onPress: () => router.push('/edit-profile'),
    },
    {
      title: 'Delivery Address',
      icon: 'map-marker',
      onPress: () => router.push('/delivery-address'),
    },
    {
      title: 'Payment Methods',
      icon: 'credit-card',
      onPress: () => router.push('/payment-methods'),
    },
    {
      title: 'Order History',
      icon: 'history',
      onPress: () => router.push('/order-history'),
    },
    {
      title: 'Favorites',
      icon: 'heart',
      onPress: () => router.push('/favorites'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => router.push('/help-support'),
    },
    {
      title: 'Terms & Privacy',
      icon: 'file-document',
      onPress: () => router.push('/terms-privacy'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.name?.charAt(0) || 'U'}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.isCook && (
          <Text style={styles.cookBadge}>🍳 Home Cook</Text>
        )}
      </View>

      <Card style={styles.subscriptionCard}>
        <View style={styles.subscriptionContent}>
          <Text style={styles.subscriptionTitle}>Subscription Status</Text>
          {isSubscribed ? (
            <View>
              <Text style={styles.subscriptionStatus}>✅ Premium Member</Text>
              <Text style={styles.subscriptionDetails}>
                Enjoy unlimited access to homemade meals
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.subscriptionStatus}>❌ Free Account</Text>
              <Text style={styles.subscriptionDetails}>
                Subscribe to order from home cooks
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/subscription')}
                style={styles.subscribeButton}
              >
                Subscribe Now
              </Button>
            </View>
          )}
        </View>
      </Card>

      {!user?.isCook && (
        <Card style={styles.cookCard}>
          <View style={styles.cookContent}>
            <Text style={styles.cookTitle}>Become a Home Cook</Text>
            <Text style={styles.cookDescription}>
              Share your culinary skills and earn money by cooking for your community
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/cook-registration')}
              style={styles.cookButton}
            >
              Apply to Cook
            </Button>
          </View>
        </Card>
      )}

      <Card style={styles.settingsCard}>
        <List.Section>
          <List.Subheader>Settings</List.Subheader>
          
          <List.Item
            title="Push Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={theme.colors.primary}
              />
            )}
          />

          {menuItems.map((item, index) => (
            <List.Item
              key={index}
              title={item.title}
              left={props => <List.Icon {...props} icon={item.icon} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={item.onPress}
            />
          ))}
        </List.Section>
      </Card>

      <Card style={styles.dangerCard}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.version}>HomeFood v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    backgroundColor: theme.colors.secondary,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  userEmail: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
  },
  cookBadge: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontFamily: 'Inter-Medium',
  },
  subscriptionCard: {
    margin: 20,
    elevation: 2,
  },
  subscriptionContent: {
    padding: 20,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
  },
  subscriptionStatus: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Inter-Medium',
  },
  subscriptionDetails: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
  },
  subscribeButton: {
    alignSelf: 'flex-start',
  },
  cookCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  cookContent: {
    padding: 20,
  },
  cookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
  },
  cookDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  cookButton: {
    alignSelf: 'flex-start',
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  dangerCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  logoutButton: {
    padding: 20,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  version: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.5,
    fontFamily: 'Inter-Regular',
  },
});