import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { Avatar, Card, List, Switch, Button } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { X, TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle, MessageCircle, LogIn, LogOut, ChefHat, TrendingUp, DollarSign } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReportedIssue {
  id: string;
  orderId?: string;
  issueType: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  reportDate: string;
  lastUpdate: string;
  response?: string;
}

// Cook Profile Interface
function CookProfileInterface() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    loadCookData();
  }, []);

  const loadCookData = async () => {
    try {
      // Load orders
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        const cookOrders = allOrders.filter((order: any) => 
          order.cookId === user?.id || order.cookName === user?.name
        );
        setOrders(cookOrders);
      }

      // Load menu items
      const storedItems = await AsyncStorage.getItem(`menuItems_${user?.id}`);
      if (storedItems) {
        setMenuItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error loading cook data:', error);
    }
  };

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

  const todayEarnings = orders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() && order.status === 'delivered';
    })
    .reduce((total, order) => total + order.totalPrice, 0);

  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const activeOrders = orders.filter(order => 
    ['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
  ).length;

  const cookMenuItems = [
    {
      title: 'Kitchen Management',
      icon: 'chef-hat',
      onPress: () => router.push('/(tabs)'),
    },
    {
      title: 'Order Management',
      icon: 'package-variant',
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      title: 'Delivery Management',
      icon: 'truck-delivery',
      onPress: () => router.push('/(tabs)/delivery'),
    },
    {
      title: 'Edit Profile',
      icon: 'account-edit',
      onPress: () => router.push('/edit-profile'),
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
      {/* Cook Header */}
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.name?.charAt(0) || 'C'}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.cookBadgeContainer}>
          <ChefHat size={16} color="white" />
          <Text style={styles.cookBadge}>Home Cook</Text>
        </View>
      </View>

      {/* Cook Stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Performance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <DollarSign size={24} color={theme.colors.success} />
            <Text style={styles.statValue}>${todayEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statItem}>
            <TrendingUp size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <CheckCircle size={24} color={theme.colors.success} />
            <Text style={styles.statValue}>{completedOrders}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={24} color={theme.colors.secondary} />
            <Text style={styles.statValue}>{activeOrders}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)')}
          >
            <ChefHat size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Manage Kitchen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)')}
          >
            <ChefHat size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Kitchen</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Settings */}
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

          {cookMenuItems.map((item, index) => (
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

      {/* Logout */}
      <Card style={styles.authCard}>
        <TouchableOpacity onPress={handleLogout} style={styles.authButton}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.version}>HomeFood Cook v1.0.0</Text>
        <View style={styles.badgesContainer}>
          <Image 
            source={{ uri: "https://github.com/kickiniteasy/bolt-hackathon-badge/blob/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.png" }} 
            style={styles.badgeImage}
            resizeMode="contain"
          />
          <View style={styles.partnersContainer}>
            <Image 
              source={{ uri: "https://assets.entri.app/logo.svg" }} 
              style={styles.partnerLogo}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: "https://www.netlify.com/v3/img/components/logomark.png" }} 
              style={styles.partnerLogo}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: "https://supabase.com/favicon/favicon-32x32.png" }} 
              style={styles.partnerLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// Customer Profile Interface (existing)
function CustomerProfileInterface() {
  const { user, logout } = useAuth();
  const { isSubscribed } = useSubscription();
  const [notifications, setNotifications] = useState(true);
  const [reportedIssues, setReportedIssues] = useState<ReportedIssue[]>([]);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ReportedIssue | null>(null);

  useEffect(() => {
    loadReportedIssues();
  }, []);

  const loadReportedIssues = async () => {
    try {
      const storedIssues = await AsyncStorage.getItem('reportedIssues');
      if (storedIssues) {
        setReportedIssues(JSON.parse(storedIssues));
      }
    } catch (error) {
      console.error('Error loading reported issues:', error);
    }
  };

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

  const handleLogin = () => {
    router.push('/auth');
  };

  const getStatusIcon = (status: ReportedIssue['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={theme.colors.warning} />;
      case 'in_progress':
        return <MessageCircle size={16} color={theme.colors.primary} />;
      case 'resolved':
        return <CheckCircle size={16} color={theme.colors.success} />;
      case 'closed':
        return <CheckCircle size={16} color={theme.colors.onSurfaceVariant} />;
      default:
        return <AlertTriangle size={16} color={theme.colors.error} />;
    }
  };

  const getStatusColor = (status: ReportedIssue['status']) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'in_progress':
        return theme.colors.primary;
      case 'resolved':
        return theme.colors.success;
      case 'closed':
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.error;
    }
  };

  const handleIssuePress = (issue: ReportedIssue) => {
    setSelectedIssue(issue);
  };

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: 'account-edit',
      onPress: () => router.push('/edit-profile'),
      requiresAuth: true,
    },
    {
      title: 'Delivery Address',
      icon: 'map-marker',
      onPress: () => router.push('/delivery-address'),
      requiresAuth: true,
    },
    {
      title: 'Payment Methods',
      icon: 'credit-card',
      onPress: () => router.push('/payment-methods'),
      requiresAuth: true,
    },
    {
      title: 'Order History',
      icon: 'history',
      onPress: () => router.push('/order-history'),
      requiresAuth: true,
    },
    {
      title: 'Favorites',
      icon: 'heart',
      onPress: () => router.push('/favorites'),
      requiresAuth: true,
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => router.push('/help-support'),
      requiresAuth: false,
    },
    {
      title: 'Terms & Privacy',
      icon: 'file-document',
      onPress: () => router.push('/terms-privacy'),
      requiresAuth: false,
    },
  ];

  const availableMenuItems = menuItems.filter(item => !item.requiresAuth || user);

  return (
    <ScrollView style={styles.container}>
      {user ? (
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={user.name?.charAt(0) || 'U'}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      ) : (
        <View style={styles.guestHeader}>
          <Avatar.Icon
            size={80}
            icon="account"
            style={styles.guestAvatar}
          />
          <Text style={styles.guestTitle}>Welcome to HomeFood</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to access your profile, orders, and favorites
          </Text>
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            icon={() => <LogIn size={20} color="white" />}
          >
            Sign In
          </Button>
        </View>
      )}

      {user && (
        <>
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

          {reportedIssues.length > 0 && (
            <Card style={styles.issuesCard}>
              <View style={styles.issuesHeader}>
                <Text style={styles.sectionTitle}>Reported Issues</Text>
                <TouchableOpacity onPress={() => setShowIssuesModal(true)}>
                  <Text style={styles.viewAllText}>View All ({reportedIssues.length})</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.recentIssues}>
                {reportedIssues.slice(0, 3).map((issue) => (
                  <TouchableOpacity
                    key={issue.id}
                    style={styles.issueItem}
                    onPress={() => handleIssuePress(issue)}
                  >
                    <View style={styles.issueHeader}>
                      <Text style={styles.issueType} numberOfLines={1}>
                        {issue.issueType}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                        {getStatusIcon(issue.status)}
                        <Text style={styles.statusText}>{issue.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.issueDescription} numberOfLines={2}>
                      {issue.description}
                    </Text>
                    <Text style={styles.issueDate}>
                      {new Date(issue.reportDate).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}
        </>
      )}

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
          
          {user && (
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
          )}

          {availableMenuItems.map((item, index) => (
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

      <Card style={styles.authCard}>
        {user ? (
          <TouchableOpacity onPress={handleLogout} style={styles.authButton}>
            <LogOut size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLogin} style={styles.authButton}>
            <LogIn size={20} color={theme.colors.primary} />
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </Card>

      <View style={styles.footer}>
        <Text style={styles.version}>HomeFood v1.0.0</Text>
        <View style={styles.badgesContainer}>
          <Image 
            source={{ uri: "https://github.com/kickiniteasy/bolt-hackathon-badge/blob/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.png" }} 
            style={styles.badgeImage}
            resizeMode="contain"
          />
          <View style={styles.partnersContainer}>
            <Image 
              source={{ uri: "https://assets.entri.app/logo.svg" }} 
              style={styles.partnerLogo}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: "https://www.netlify.com/v3/img/components/logomark.png" }} 
              style={styles.partnerLogo}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: "https://supabase.com/favicon/favicon-32x32.png" }} 
              style={styles.partnerLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Issues Modal */}
      <Modal
        visible={showIssuesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowIssuesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reported Issues</Text>
            <TouchableOpacity 
              onPress={() => setShowIssuesModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {reportedIssues.length === 0 ? (
              <View style={styles.emptyIssues}>
                <AlertTriangle size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyIssuesTitle}>No Issues Reported</Text>
                <Text style={styles.emptyIssuesText}>
                  When you report issues with orders or the app, they'll appear here for tracking.
                </Text>
              </View>
            ) : (
              <View style={styles.allIssues}>
                {reportedIssues.map((issue) => (
                  <Card key={issue.id} style={styles.issueCard}>
                    <TouchableOpacity
                      style={styles.issueCardContent}
                      onPress={() => handleIssuePress(issue)}
                    >
                      <View style={styles.issueCardHeader}>
                        <Text style={styles.issueCardType}>{issue.issueType}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                          {getStatusIcon(issue.status)}
                          <Text style={styles.statusText}>{issue.status}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.issueCardDescription}>
                        {issue.description}
                      </Text>
                      
                      {issue.orderId && (
                        <Text style={styles.issueOrderId}>
                          Order: {issue.orderId}
                        </Text>
                      )}
                      
                      <View style={styles.issueCardFooter}>
                        <Text style={styles.issueCardDate}>
                          Reported: {new Date(issue.reportDate).toLocaleDateString()}
                        </Text>
                        <Text style={styles.issueCardUpdate}>
                          Updated: {new Date(issue.lastUpdate).toLocaleDateString()}
                        </Text>
                      </View>
                      
                      {issue.response && (
                        <View style={styles.responseSection}>
                          <Text style={styles.responseLabel}>Support Response:</Text>
                          <Text style={styles.responseText}>{issue.response}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Issue Detail Modal */}
      <Modal
        visible={!!selectedIssue}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedIssue(null)}
      >
        {selectedIssue && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Details</Text>
              <TouchableOpacity 
                onPress={() => setSelectedIssue(null)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Card style={styles.issueDetailCard}>
                <View style={styles.issueDetailHeader}>
                  <Text style={styles.issueDetailType}>{selectedIssue.issueType}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIssue.status) }]}>
                    {getStatusIcon(selectedIssue.status)}
                    <Text style={styles.statusText}>{selectedIssue.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.issueDetailDescription}>
                  {selectedIssue.description}
                </Text>
                
                {selectedIssue.orderId && (
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderInfoLabel}>Related Order:</Text>
                    <Text style={styles.orderInfoValue}>{selectedIssue.orderId}</Text>
                  </View>
                )}
                
                <View style={styles.dateInfo}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Reported:</Text>
                    <Text style={styles.dateValue}>
                      {new Date(selectedIssue.reportDate).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Last Updated:</Text>
                    <Text style={styles.dateValue}>
                      {new Date(selectedIssue.lastUpdate).toLocaleString()}
                    </Text>
                  </View>
                </View>
                
                {selectedIssue.response && (
                  <View style={styles.responseSection}>
                    <Text style={styles.responseLabel}>Support Response:</Text>
                    <Text style={styles.responseText}>{selectedIssue.response}</Text>
                  </View>
                )}
              </Card>
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

// Main component
export default function ProfileScreen() {
  const { user } = useAuth();

  // Show cook interface for cooks, customer interface for customers
  if (user?.isCook) {
    return <CookProfileInterface />;
  }

  return <CustomerProfileInterface />;
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
  guestHeader: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    backgroundColor: theme.colors.secondary,
    marginBottom: 15,
  },
  guestAvatar: {
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
  guestTitle: {
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
  guestSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  cookBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: theme.spacing.xs,
  },
  cookBadge: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-Medium',
  },
  loginButton: {
    marginTop: 10,
  },
  statsCard: {
    margin: 20,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  quickActionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginTop: 8,
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
  issuesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  issuesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
  noIssuesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  recentIssues: {
    gap: theme.spacing.md,
  },
  issueItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  issueType: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textTransform: 'capitalize',
  },
  issueDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  issueDate: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
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
  authCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    color: theme.colors.error,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  loginText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  version: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.5,
    fontFamily: 'Inter-Regular',
  },
  badgesContainer: {
    alignItems: 'center',
    gap: 12,
  },
  badgeImage: {
    width: 80,
    height: 80,
  },
  partnersContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerLogo: {
    width: 32,
    height: 32,
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
  emptyIssues: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  emptyIssuesTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  emptyIssuesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  allIssues: {
    gap: theme.spacing.md,
  },
  issueCard: {
    padding: 0,
  },
  issueCardContent: {
    padding: theme.spacing.lg,
  },
  issueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  issueCardType: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  issueCardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  issueOrderId: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  issueCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  issueCardDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  issueCardUpdate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  responseSection: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  responseLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  responseText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  issueDetailCard: {
    marginBottom: theme.spacing.lg,
  },
  issueDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  issueDetailType: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  issueDetailDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  orderInfoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
    marginRight: theme.spacing.md,
  },
  orderInfoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  dateInfo: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  dateValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
});