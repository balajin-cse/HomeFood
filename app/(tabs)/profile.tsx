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
} from 'react-native';
import { Avatar, Card, List, Switch, Button } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { X, TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle, MessageCircle, LogIn, LogOut, ChefHat, Package, TrendingUp, DollarSign } from 'lucide-react-native';
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

interface CookStats {
  totalEarnings: number;
  totalOrders: number;
  averageRating: number;
  completionRate: number;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isSubscribed } = useSubscription();
  const [notifications, setNotifications] = useState(true);
  const [reportedIssues, setReportedIssues] = useState<ReportedIssue[]>([]);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ReportedIssue | null>(null);
  const [cookStats, setCookStats] = useState<CookStats>({
    totalEarnings: 0,
    totalOrders: 0,
    averageRating: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadReportedIssues();
    if (user?.isCook) {
      loadCookStats();
    }
  }, [user]);

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

  const loadCookStats = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        const cookOrders = allOrders.filter((order: any) => 
          order.cookId === user?.id || order.cookName === user?.name
        );
        
        const totalEarnings = cookOrders
          .filter((order: any) => order.status === 'delivered')
          .reduce((sum: number, order: any) => sum + order.totalPrice, 0);
        
        const totalOrders = cookOrders.length;
        const completedOrders = cookOrders.filter((order: any) => order.status === 'delivered').length;
        const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
        
        setCookStats({
          totalEarnings,
          totalOrders,
          averageRating: 4.8, // Mock rating
          completionRate,
        });
      }
    } catch (error) {
      console.error('Error loading cook stats:', error);
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

  // Define menu items based on user type
  const getMenuItems = () => {
    if (user?.isCook) {
      return [
        {
          title: 'Edit Profile',
          icon: 'account-edit',
          onPress: () => router.push('/edit-profile'),
        },
        {
          title: 'Kitchen Settings',
          icon: 'chef-hat',
          onPress: () => router.push('/(tabs)/cook'),
        },
        {
          title: 'Order Management',
          icon: 'package-variant',
          onPress: () => router.push('/(tabs)/orders'),
        },
        {
          title: 'Delivery Management',
          icon: 'truck',
          onPress: () => router.push('/(tabs)/delivery'),
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
    } else {
      return [
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
      ].filter(item => !item.requiresAuth || user);
    }
  };

  const menuItems = getMenuItems();

  return (
    <ScrollView style={styles.container}>
      {user ? (
        // Authenticated User Header
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={user.name?.charAt(0) || 'U'}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.isCook && (
            <Text style={styles.cookBadge}>🍳 Home Cook</Text>
          )}
        </View>
      ) : (
        // Guest User Header
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

      {user && !user.isCook && (
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
      )}

      {user?.isCook && (
        <Card style={styles.cookStatsCard}>
          <Text style={styles.sectionTitle}>Cook Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <DollarSign size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>${cookStats.totalEarnings.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statItem}>
              <Package size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{cookStats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{cookStats.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statItem}>
              <CheckCircle size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{cookStats.completionRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </View>
        </Card>
      )}

      {user && (
        <>
          {/* Reported Issues Section */}
          <Card style={styles.issuesCard}>
            <View style={styles.issuesHeader}>
              <Text style={styles.sectionTitle}>Reported Issues</Text>
              <TouchableOpacity onPress={() => setShowIssuesModal(true)}>
                <Text style={styles.viewAllText}>View All ({reportedIssues.length})</Text>
              </TouchableOpacity>
            </View>
            
            {reportedIssues.length === 0 ? (
              <Text style={styles.noIssuesText}>No issues reported</Text>
            ) : (
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
            )}
          </Card>
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

      {/* Authentication Actions */}
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
  cookBadge: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontFamily: 'Inter-Medium',
  },
  loginButton: {
    marginTop: 10,
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
  cookStatsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    width: '48%',
    gap: theme.spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
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
  },
  version: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.5,
    fontFamily: 'Inter-Regular',
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
  date # Chia-Network/chia-blockchain
# chia/wallet/wallet_node.py
from __future__ import annotations

import asyncio
import dataclasses
import json
import logging
import multiprocessing
import multiprocessing.context
import random
import sys
import time
import traceback
from pathlib import Path
from typing import Any, ClassVar, Dict, List, Optional, Set, Tuple, Union, cast

import aiohttp
from blspy import AugSchemeMPL, G1Element, G2Element, PrivateKey

from chia.consensus.block_record import BlockRecord
from chia.consensus.blockchain import AddBlockResult
from chia.consensus.constants import ConsensusConstants
from chia.daemon.keychain_proxy import KeychainProxy, connect_to_keychain_and_validate, wrap_local_keychain
from chia.full_node.full_node_api import FullNodeAPI
from chia.protocols import wallet_protocol
from chia.protocols.full_node_protocol import RequestProofOfWeight, RespondProofOfWeight
from chia.protocols.protocol_message_types import ProtocolMessageTypes
from chia.protocols.wallet_protocol import (
    CoinState,
    RequestBlockHeader,
    RequestTransaction,
    RespondBlockHeader,
    RespondTransaction,
    RespondToCoinUpdates,
    RespondToPhUpdates,
)
from chia.rpc.rpc_server import StateChangedProtocol, default_get_connections
from chia.server.node_discovery import WalletPeers
from chia.server.outbound_message import Message, NodeType, make_msg
from chia.server.peer_store_resolver import PeerStoreResolver
from chia.server.server import ChiaServer
from chia.server.ws_connection import WSChiaConnection
from chia.types.blockchain_format.coin import Coin
from chia.types.blockchain_format.sized_bytes import bytes32
from chia.types.header_block import HeaderBlock
from chia.types.mempool_inclusion_status import MempoolInclusionStatus
from chia.types.peer_info import PeerInfo
from chia.types.spend_bundle import SpendBundle
from chia.types.weight_proof import WeightProof
from chia.util.byte_types import hexstr_to_bytes
from chia.util.config import lock_and_load_config, process_config_start_method, save_config
from chia.util.errors import KeychainIsEmpty, KeychainIsLocked, KeychainKeyNotFound, KeychainProxyConnectionFailure
from chia.util.hash import std_hash
from chia.util.ints import uint16, uint32, uint64, uint128
from chia.util.keychain import Keychain
from chia.util.path import path_from_root
from chia.util.profiler import profile_task
from chia.wallet.transaction_record import TransactionRecord
from chia.wallet.util.new_peak_queue import NewPeakItem, NewPeakQueue, NewPeakQueueTypes
from chia.wallet.util.peer_request_cache import PeerRequestCache, can_use_peer_request_cache
from chia.wallet.util.wallet_sync_utils import (
    PeerRequestException,
    fetch_header_blocks_in_range,
    request_and_validate_additions,
    request_and_validate_removals,
    subscribe_to_coin_updates,
    subscribe_to_phs,
)
from chia.wallet.util.wallet_types import CoinType, WalletType
from chia.wallet.wallet_action import WalletAction
from chia.wallet.wallet_blockchain import WalletBlockchain
from chia.wallet.wallet_coin_record import WalletCoinRecord
from chia.wallet.wallet_coin_store import WalletCoinStore
from chia.wallet.wallet_interested_store import WalletInterestedStore
from chia.wallet.wallet_pool_store import WalletPoolStore
from chia.wallet.wallet_puzzle_store import WalletPuzzleStore
from chia.wallet.wallet_retry_store import WalletRetryStore
from chia.wallet.wallet_transaction_store import WalletTransactionStore
from chia.wallet.wallet_user_store import WalletUserStore
from chia.wallet.wallet_weight_proof_handler import WalletWeightProofHandler


class WalletNode:
    key_config: Dict[str, Any]
    config: Dict[str, Any]
    constants: ConsensusConstants
    server: Optional[ChiaServer]
    log: logging.Logger
    # Maintains the state of the wallet (blockchain and transactions), handles DB connections
    wallet_state_manager: Optional[Any]  # WalletStateManager
    _shut_down: bool
    root_path: Path
    state_changed_callback: Optional[StateChangedProtocol]
    syncing: bool
    full_node_peer: Optional[PeerInfo]
    peer_task: Optional[asyncio.Task[None]]
    logged_in: bool
    wallet_peers_initialized: bool
    keychain_proxy: Optional[KeychainProxy]
    use_local_keychain: bool
    # Peers that we have requested header blocks from
    synced_peers: Set[bytes32]
    wallet_peers: Optional[WalletPeers]
    validation_semaphore: Optional[asyncio.Semaphore]
    local_node_synced: bool
    LONG_SYNC_THRESHOLD: ClassVar[int] = 300
    last_wallet_tx_resend_time: int = 0
    # Duration in seconds
    wallet_tx_resend_timeout_secs: int = 1800
    _process_new_subscriptions_task: Optional[asyncio.Task[None]] = None
    _retry_failed_transactions_task: Optional[asyncio.Task[None]] = None
    _secondary_peer_sync_task: Optional[asyncio.Task[None]] = None
    full_node_subscriptions: Dict[bytes32, Set[bytes32]]
    wallet_coin_store: WalletCoinStore
    wallet_transaction_store: WalletTransactionStore
    wallet_puzzle_store: WalletPuzzleStore
    wallet_user_store: WalletUserStore
    wallet_interested_store: WalletInterestedStore
    wallet_retry_store: WalletRetryStore
    wallet_pool_store: WalletPoolStore
    blockchain: WalletBlockchain
    weight_proof_handler: WalletWeightProofHandler
    new_peak_queue: NewPeakQueue
    _new_peak_queue_task: Optional[asyncio.Task[None]]
    full_node_peer_list: List[PeerInfo]
    peer_request_cache: PeerRequestCache
    wallet_sync_task: Optional[asyncio.Task[None]]
    wallet_sync_initialized: bool
    _wallet_tx_resend_task: Optional[asyncio.Task[None]]

    @staticmethod
    async def create(
        config: Dict[str, Any],
        root_path: Path,
        name: Optional[str] = None,
        wallet_peers_path_override_input: Optional[Path] = None,
    ) -> WalletNode:
        """
        Don't use this method directly, use WalletNode.create instead. This is a helper method.
        """
        self = WalletNode()
        self.config = config
        self.root_path = root_path
        self.log = logging.getLogger(name if name else __name__)
        self.wallet_state_manager = None
        self._shut_down = False
        self.syncing = False
        self.logged_in = False
        self.wallet_peers_initialized = False
        self.local_node_synced = False
        self.validation_semaphore = None
        self.server = None
        self.state_changed_callback = None
        self.full_node_peer = None
        self.peer_task = None
        self.keychain_proxy = None
        self.use_local_keychain = self.config.get("use_local_keychain", True)
        self.synced_peers = set()
        self.wallet_peers = None
        self.full_node_subscriptions = {}
        peer_db_path_override = None if wallet_peers_path_override_input is None else wallet_peers_path_override_input
        self.wallet_coin_store = await WalletCoinStore.create(self.root_path, self.config)
        self.wallet_transaction_store = await WalletTransactionStore.create(self.root_path, self.config)
        self.wallet_puzzle_store = await WalletPuzzleStore.create(self.root_path, self.config)
        self.wallet_user_store = await WalletUserStore.create(self.root_path, self.config)
        self.wallet_interested_store = await WalletInterestedStore.create(self.root_path, self.config)
        self.wallet_retry_store = await WalletRetryStore.create(self.root_path, self.config)
        self.wallet_pool_store = await WalletPoolStore.create(self.root_path, self.config)
        self.log.info("Starting wallet node ...")
        self.wallet_sync_initialized = False
        self.wallet_sync_task = None
        self.new_peak_queue = NewPeakQueue()
        self._new_peak_queue_task = None
        self._process_new_subscriptions_task = None
        self._retry_failed_transactions_task = None
        self._secondary_peer_sync_task = None
        self._wallet_tx_resend_task = None
        self.peer_request_cache = PeerRequestCache()
        self.full_node_peer_list = []
        multiprocessing_start_method = process_config_start_method(config=self.config, log=self.log)
        multiprocessing_context = multiprocessing.get_context(method=multiprocessing_start_method)
        self.weight_proof_handler = WalletWeightProofHandler(self.constants, multiprocessing_context)
        self.blockchain = await WalletBlockchain.create(self.constants, self.root_path, self.config)

        if self.config.get("enable_profiler", False):
            asyncio.create_task(profile_task(self.root_path / "wallet.profile"))

        self.constants = self.blockchain.constants
        self.key_config = load_key_config(self.root_path)
        self.wallet_peers = await WalletPeers.create(
            self.root_path,
            self.config,
            self.key_config,
            self.constants,
            PeerStoreResolver(
                self.root_path,
                self.config,
                selected_network=self.config["selected_network"],
                peers_file_path_key="wallet_peers_file_path",
                legacy_peer_db_path_key=self.config.get("wallet_peers_path", None),
                default_peers_file_path=peer_db_path_override,
            ),
        )
        return self

    def get_connections(self, request_node_type: Optional[NodeType]) -> List[Dict[str, Any]]:
        return default_get_connections(server=self.server, request_node_type=request_node_type)

    async def ensure_keychain_proxy(self) -> KeychainProxy:
        if self.keychain_proxy is None:
            if self.use_local_keychain:
                self.keychain_proxy = wrap_local_keychain(Keychain(), log=self.log)
            else:
                self.keychain_proxy = await connect_to_keychain_and_validate(self.root_path, self.log)
                if not self.keychain_proxy:
                    raise KeychainProxyConnectionFailure()
        return self.keychain_proxy

    def get_full_node_peer(self) -> Optional[WSChiaConnection]:
        for connection in self.server.get_connections(NodeType.FULL_NODE):
            if self.full_node_peer is not None and connection.peer_info == self.full_node_peer:
                return connection
        return None

    def get_full_node_peers_in_order(self) -> List[WSChiaConnection]:
        if self.full_node_peer is None:
            return []
        # Short circuit the case where we want to prioritize a specific peer and
        # we are connected to it.
        if full_node_connection := self.get_full_node_peer():
            return [full_node_connection]

        # Otherwise, we're not connected to the peer we want to prioritize, so
        # gather up all full node connections for the caller to try.
        return self.server.get_connections(NodeType.FULL_NODE)

    def set_full_node_peer(self, peer: Optional[PeerInfo]) -> None:
        self.full_node_peer = peer

    async def on_connect(self, connection: WSChiaConnection) -> None:
        if self.wallet_state_manager is None:
            return None

        if connection.connection_type is NodeType.FULL_NODE:
            await self.weight_proof_handler.fetch_used_indices()
            self.synced_peers.add(connection.peer_node_id)
            if await self.wallet_peers.is_trusted(connection.peer_node_id):
                self.full_node_peer_list.append(connection.peer_info)
                if self.full_node_peer is None:
                    self.full_node_peer = connection.peer_info
                    asyncio.create_task(self.wallet_state_manager.blockchain.set_finished_sync_up_to(0))
            if self._wallet_tx_resend_task is None or self._wallet_tx_resend_task.done():
                self._wallet_tx_resend_task = asyncio.create_task(self._resend_queue())

    def on_disconnect(self, connection: WSChiaConnection) -> None:
        if connection.connection_type is NodeType.FULL_NODE:
            self.synced_peers.discard(connection.peer_node_id)
            if connection.peer_info in self.full_node_peer_list:
                self.full_node_peer_list.remove(connection.peer_info)
            if connection.peer_info == self.full_node_peer:
                self.full_node_peer = None
                if len(self.full_node_peer_list) > 0:
                    self.full_node_peer = self.full_node_peer_list[0]

    async def _action_messages(self) -> None:
        if self.wallet_state_manager is None:
            return None

        while not self._shut_down:
            message = await self.wallet_state_manager.action_store.get_next_action_id()
            if message is None:
                await asyncio.sleep(1)
                continue
            data = json.loads(message.data)
            action_data = data["data"]["action_data"]
            action = WalletAction(data["action"])
            if action == WalletAction.INCOMING_TX:
                tx_record: TransactionRecord = TransactionRecord.from_json_dict_convenience(action_data)
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "add_transaction",
                        {
                            "transaction": tx_record,
                            "wallet_id": tx_record.wallet_id,
                        },
                    )
            elif action == WalletAction.COIN_ADDED:
                added_coin = Coin.from_json_dict(action_data["coin"])
                wallet_id = uint32(action_data["wallet_id"])
                coin_name = added_coin.name()
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "coin_added",
                        {
                            "coin": added_coin,
                            "wallet_id": wallet_id,
                            "coin_name": coin_name,
                        },
                    )
            elif action == WalletAction.COIN_REMOVED:
                removed_coin = Coin.from_json_dict(action_data["coin"])
                wallet_id = uint32(action_data["wallet_id"])
                coin_name = removed_coin.name()
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "coin_removed",
                        {
                            "coin": removed_coin,
                            "wallet_id": wallet_id,
                            "coin_name": coin_name,
                        },
                    )
            elif action == WalletAction.COIN_FARMED:
                coin_record = WalletCoinRecord.from_json_dict_coin_record(action_data["coin_record"])
                wallet_id = uint32(action_data["wallet_id"])
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "coin_farmed",
                        {
                            "coin_record": coin_record,
                            "wallet_id": wallet_id,
                        },
                    )
            elif action == WalletAction.COIN_RECEIVED:
                coin_record = WalletCoinRecord.from_json_dict_coin_record(action_data["coin_record"])
                wallet_id = uint32(action_data["wallet_id"])
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "coin_received",
                        {
                            "coin_record": coin_record,
                            "wallet_id": wallet_id,
                        },
                    )
            elif action == WalletAction.OFFER_CANCELLED:
                trade_id = bytes32.from_hexstr(action_data["trade_id"])
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "offer_cancelled",
                        {
                            "trade_id": trade_id,
                        },
                    )
            elif action == WalletAction.OFFER_ADDED:
                offer = action_data["offer"]
                offer_id = bytes32.from_hexstr(action_data["offer_id"])
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "offer_added",
                        {
                            "offer": offer,
                            "offer_id": offer_id,
                        },
                    )
            elif action == WalletAction.PENDING_TRANSACTION:
                tx_record: TransactionRecord = TransactionRecord.from_json_dict_convenience(action_data)
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "pending_transaction",
                        {
                            "transaction": tx_record,
                            "wallet_id": tx_record.wallet_id,
                        },
                    )
            elif action == WalletAction.NEW_BLOCK:
                height: uint32 = uint32(action_data["height"])
                timestamp: uint64 = uint64(action_data["timestamp"])
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "new_block",
                        {
                            "height": height,
                            "timestamp": timestamp,
                        },
                    )
            elif action == WalletAction.NEW_PEAK:
                height: uint32 = uint32(action_data["height"])
                timestamp: uint64 = uint64(action_data["timestamp"])
                if self.state_changed_callback is not None:
                    self.state_changed_callback(
                        "new_peak",
                        {
                            "height": height,
                            "timestamp": timestamp,
                        },
                    )
            await self.wallet_state_manager.action_store.delete_action(message.id)

    async def _await_closed(self) -> None:
        await self.server.await_closed()

    async def _handle_state_changed(self, *args: Any) -> None:
        if self.state_changed_callback is not None:
            self.state_changed_callback(*args)

    def state_changed(self, state: str, data_point: Optional[Dict[str, Any]] = None, wallet_id: Optional[int] = None) -> None:
        if data_point is None:
            data_point = {}
        if wallet_id is not None:
            data_point["wallet_id"] = wallet_id
        if self.wallet_state_manager is not None:
            asyncio.create_task(self.wallet_state_manager.action_store.add_action(state, data_point))
        if self.state_changed_callback is not None:
            self.state_changed_callback(state, data_point)

    def set_callback(self, callback: StateChangedProtocol) -> None:
        self.state_changed_callback = callback

    async def _start_with_fingerprint(self, fingerprint: int) -> bool:
        try:
            await self.ensure_keychain_proxy()
            self.logged_in = await self.keychain_proxy.check_key_used_for_fingerprint(fingerprint)
            if not self.logged_in:
                return False
            private_key = await self.keychain_proxy.get_key_for_fingerprint(fingerprint)
            if private_key is None:
                self.logged_in = False
                return False

            # Never pass the private key beyond this point.
            #
            # self.wallet_state_manager and self.keychain_proxy are created before this
            # function is called.
            assert self.wallet_state_manager is not None
            assert self.keychain_proxy is not None

            await self.wallet_state_manager.add_private_key(private_key)
            await self.wallet_state_manager.log_in(private_key)
            if self.state_changed_callback is not None:
                self.state_changed_callback("logged_in", {})
            return True
        except KeychainIsEmpty:
            self.logged_in = False
            return False
        except KeychainKeyNotFound:
            self.logged_in = False
            return False
        except KeychainIsLocked:
            self.logged_in = False
            return False
        except Exception as e:
            self.logged_in = False
            self.log.error(f"Error while logging in: {e}")
            raise

    async def _start(
        self,
        fingerprint: Optional[int] = None,
    ) -> bool:
        # Makes sure the coin_store, puzzle_store, and user_store exist in the DB
        await self.wallet_coin_store.warmup()
        await self.wallet_puzzle_store.warmup()
        await self.wallet_user_store.warmup()
        await self.wallet_transaction_store.warmup()
        await self.wallet_interested_store.warmup()
        await self.wallet_retry_store.warmup()
        await self.wallet_pool_store.warmup()

        # Start the wallet node
        from chia.wallet.wallet_state_manager import WalletStateManager

        self.wallet_state_manager = await WalletStateManager.create(
            self.config,
            self.root_path,
            self.wallet_coin_store,
            self.wallet_transaction_store,
            self.wallet_puzzle_store,
            self.wallet_user_store,
            self.wallet_interested_store,
            self.wallet_retry_store,
            self.wallet_pool_store,
            self.blockchain,
            self.log,
            self,
        )

        if fingerprint is not None:
            self.logged_in = await self._start_with_fingerprint(fingerprint)
            if not self.logged_in:
                return False

        if self.wallet_peers is None:
            self.wallet_peers = await WalletPeers.create(
                self.root_path,
                self.config,
                self.key_config,
                self.constants,
                PeerStoreResolver(
                    self.root_path,
                    self.config,
                    selected_network=self.config["selected_network"],
                    peers_file_path_key="wallet_peers_file_path",
                    legacy_peer_db_path_key=self.config.get("wallet_peers_path", None),
                ),
            )

        await self.wallet_state_manager.blockchain.set_finished_sync_up_to(0)
        if self.wallet_state_manager.blockchain.synced_weight_proof is not None:
            await self.wallet_state_manager.blockchain.new_valid_weight_proof(
                self.wallet_state_manager.blockchain.synced_weight_proof,
                None,
            )

        if self.state_changed_callback is not None:
            self.wallet_state_manager.set_callback(self.state_changed_callback)

        self.wallet_state_manager.set_pending_callback(self._pending_tx_handler)
        self._process_new_subscriptions_task = asyncio.create_task(self._process_new_subscriptions())
        self._retry_failed_transactions_task = asyncio.create_task(self._retry_failed_transactions())

        self.wallet_peers_initialized = True
        return True

    async def _process_new_subscriptions(self) -> None:
        while not self._shut_down:
            # Here we process four types of messages in the queue, where the first one has higher priority (lower
            # number in the queue), and priority decreases for each type.
            peer: Optional[WSChiaConnection] = None
            item: Optional[NewPeakItem] = None
            try:
                peer, item = None, None
                item = await self.new_peak_queue.get()
                self.log.debug("Pulled from queue: %s", item)
                assert item is not None
                if item.item_type == NewPeakQueueTypes.COIN_ID_SUBSCRIPTION:
                    # Subscriptions are the highest priority, because we don't want to process any more peaks or
                    # state updates until we are sure that we subscribed to everything that we need to. Otherwise,
                    # we might not be able to process some state.
                    coin_ids: List[bytes32] = item.data
                    for peer in self.get_full_node_peers_in_order():
                        try:
                            coin_states: List[CoinState] = await subscribe_to_coin_updates(
                                coin_ids, peer, uint32(0)
                            )
                            if len(coin_states) > 0:
                                async with self.wallet_state_manager.lock:
                                    await self.wallet_state_manager.coin_store.add_coin_states(
                                        coin_states, peer.peer_node_id
                                    )
                            break
                        except Exception as e:
                            self.log.error(f"Exception from peer {peer.peer_host} {e}")
                elif item.item_type == NewPeakQueueTypes.PUZZLE_HASH_SUBSCRIPTION:
                    puzzle_hashes: List[bytes32] = item.data
                    for peer in self.get_full_node_peers_in_order():
                        try:
                            coin_states = await subscribe_to_phs(puzzle_hashes, peer, uint32(0))
                            if len(coin_states) > 0:
                                async with self.wallet_state_manager.lock:
                                    await self.wallet_state_manager.coin_store.add_coin_states(
                                        coin_states, peer.peer_node_id
                                    )
                            break
                        except Exception as e:
                            self.log.error(f"Exception from peer {peer.peer_host} {e}")
                elif item.item_type == NewPeakQueueTypes.FULL_NODE_STATE_UPDATED:
                    # Note: this can take a while when we have a lot of transactions. We want to process these
                    # before new_peaks, but we don't want to block the entire queue on this.
                    request: wallet_protocol.RespondToPhUpdates = item.data[0]
                    peer = item.data[1]
                    assert peer is not None
                    if request.puzzle_hashes is not None and peer.peer_node_id is not None:
                        async with self.wallet_state_manager.lock:
                            await self.wallet_state_manager.coin_store.add_coin_states(
                                request.coin_states, peer.peer_node_id
                            )
                            await self.wallet_state_manager.add_interested_puzzle_hashes(
                                request.puzzle_hashes, peer.peer_node_id
                            )
                    else:
                        self.log.warning(f"Invalid state from peer {peer}")
                elif item.item_type == NewPeakQueueTypes.NEW_PEAK_WALLET:
                    # This can take a VERY long time, because it might trigger a long sync. It should be the lowest
                    # priority.
                    request = item.data[0]
                    peer = item.data[1]
                    assert peer is not None
                    await self.new_peak_from_peer(request, peer)
                else:
                    self.log.debug(f"Unknown item in queue: {item}")
            except asyncio.CancelledError:
                self.log.info("Queue task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception handling {item}, {e} {traceback.format_exc()}")
                if peer is not None:
                    await peer.close(9999)

    async def _retry_failed_transactions(self) -> None:
        while not self._shut_down:
            try:
                await asyncio.sleep(self.config.get("tx_resend_timeout_secs", 60 * 10))
                if self.wallet_state_manager is None:
                    continue
                now = int(time.time())
                retry_txs = await self.wallet_state_manager.tx_store.get_transactions_to_retry(now)
                for record in retry_txs:
                    await self.wallet_state_manager.retry_transaction(record)

            except asyncio.CancelledError:
                self.log.info("Retry task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception handling retry: {e} {traceback.format_exc()}")

    async def _resend_queue(self) -> None:
        while not self._shut_down:
            if self.wallet_state_manager is None:
                await asyncio.sleep(0.1)
                continue
            try:
                await asyncio.sleep(10)
                now = int(time.time())
                # Only try to resend once per hour, for each transaction
                if now - self.last_wallet_tx_resend_time < self.wallet_tx_resend_timeout_secs:
                    continue
                self.last_wallet_tx_resend_time = now
                txs = await self.wallet_state_manager.tx_store.get_all_unconfirmed()
                for record in txs:
                    if record.spend_bundle is None:
                        continue
                    if record.sent_to == []:
                        continue
                    for peer in self.get_full_node_peers_in_order():
                        if not self._shut_down and peer.peer_node_id in record.sent_to:
                            await self.wallet_state_manager.tx_store.increment_sent(
                                record.name, peer.peer_node_id, "tx_reorg_message"
                            )
                            await peer.send_message(
                                make_msg(
                                    ProtocolMessageTypes.send_transaction,
                                    wallet_protocol.SendTransaction(record.spend_bundle),
                                )
                            )
                            self.wallet_state_manager.state_changed("tx_sent")
            except asyncio.CancelledError:
                self.log.info("Resend task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception handling resend: {e} {traceback.format_exc()}")

    async def _process_new_peak_queue(self) -> None:
        while not self._shut_down:
            try:
                item = await self.new_peak_queue.get()
                assert item is not None
                await self.new_peak_queue.put(item)
                await self._process_new_subscriptions()
            except asyncio.CancelledError:
                self.log.info("Process new peak queue task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception handling new peak queue: {e} {traceback.format_exc()}")

    async def new_peak_from_peer(self, new_peak: wallet_protocol.NewPeakWallet, peer: WSChiaConnection) -> None:
        if self.wallet_state_manager is None:
            return None
        current_peak = self.wallet_state_manager.blockchain.get_peak()
        if current_peak is not None and new_peak.weight <= current_peak.weight:
            return None

        request = wallet_protocol.RequestBlockHeader(new_peak.height)
        response: Optional[RespondBlockHeader] = await peer.call_api(
            FullNodeAPI.request_block_header, request, timeout=10
        )
        if response is None:
            self.log.warning(f"Peer {peer.peer_host} did not respond in time.")
            await peer.close(9999)
            return None
        header_block = response.header_block

        latest_timestamp = await self.wallet_state_manager.blockchain.get_latest_timestamp()
        if latest_timestamp > 0:
            # Skip reorgs that are more than 1 day in the past, they are most likely not valid
            # This is to prevent long tasks of syncing and validating the chain from an attacker
            # Note that this is only used to detect a reorg, validation happens in the case of a reorg
            # We check if the reorg is more than 1 day in the past
            if header_block.foliage_transaction_block is not None:
                timestamp = header_block.foliage_transaction_block.timestamp
                now = time.time()
                if timestamp < now - 60 * 60 * 24:
                    self.log.warning(
                        f"Received a header block with timestamp {timestamp}, which is more than 1 day in the past."
                    )
                    return None

        if await self.wallet_state_manager.blockchain.contains_block(header_block.header_hash):
            return None

        syncing = await self.wallet_state_manager.synced() is False
        if syncing and new_peak.height > current_peak.height + 500:
            self.log.info(f"Syncing and received a block at height: {new_peak.height}")
            return None

        request_weight_proof = False
        if current_peak is None or new_peak.weight > current_peak.weight:
            # If we haven't synced up to the tip yet, check if the new peak can help
            synced_up_to = await self.wallet_state_manager.blockchain.get_finished_sync_up_to()
            if synced_up_to is None or new_peak.height > synced_up_to:
                request_weight_proof = True

        if request_weight_proof:
            if syncing:
                self.log.debug(f"Will not request weight proof because we are syncing, height {new_peak.height}")
                return None

            weight_request = RequestProofOfWeight(new_peak.height, new_peak.header_hash)
            weight_proof_response: Optional[RespondProofOfWeight] = await peer.call_api(
                FullNodeAPI.request_proof_of_weight, weight_request
            )
            if weight_proof_response is None:
                self.log.warning(f"Weight proof response was None from peer: {peer.peer_host}")
                return None
            weight_proof = weight_proof_response.wp
            if weight_proof.recent_chain_data[-1].height != new_peak.height:
                self.log.warning(f"Weight proof height does not match peak height: {peer.peer_host}")
                return None
            if new_peak.header_hash != weight_proof.recent_chain_data[-1].header_hash:
                self.log.warning(f"Weight proof hash does not match peak hash: {peer.peer_host}")
                return None

            try:
                validated, fork_point, summaries = await self.weight_proof_handler.validate_weight_proof(weight_proof)
            except Exception as e:
                self.log.warning(f"Weight proof validation threw an error {e}: {peer.peer_host}")
                return None
            if not validated:
                self.log.warning(f"Weight proof validation failed: {peer.peer_host}")
                return None

            await self.wallet_state_manager.blockchain.new_valid_weight_proof(weight_proof, fork_point)
            await self.wallet_state_manager.blockchain.set_finished_sync_up_to(new_peak.height)

        else:
            # The peer has a blockchain that is not heavier than our blockchain, so we don't need to sync it.
            # Or, we have already validated the weight proof for this peer.
            # Still, we need to validate the header block, and if it's valid, we need to add it to our blockchain.
            # We also need to check if this is a new peak, and if it is, we need to set the new peak.
            # We don't need to get the weight proof, because we already have a weight proof for this peer.
            