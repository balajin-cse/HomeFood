import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChefHat, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';

export default function AuthScreen() {
  const { login, register, createTestUsers } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    isCook: false,
  });

  const handleSubmit = async () => {
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && (!formData.name)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          isCook: formData.isCook,
        });
      }

      if (result.success) {
        if (isLogin) {
          console.log('✅ Login successful, navigating to main app');
          router.replace('/(tabs)');
        } else {
          // For registration, show success message and switch to login
          Alert.alert(
            'Registration Successful!',
            result.error || 'You can now log in with your credentials.',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  setIsLogin(true);
                  setFormData(prev => ({ ...prev, password: '' }));
                }
              }
            ]
          );
        }
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createTestUsers();
      if (result.success) {
        Alert.alert(
          'Test Users Created!',
          'Demo users have been created. You can now log in with the test credentials.',
          [{ text: 'OK' }]
        );
      } else {
        setError(result.error || 'Failed to create test users');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create test users');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setError(null); // Clear error when user types
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fillTestCredentials = (type: 'user' | 'cook') => {
    if (type === 'user') {
      setFormData({
        email: 'bala@example.com',
        password: 'pass123',
        name: 'Bala',
        phone: '+1234567890',
        isCook: false,
      });
    } else {
      setFormData({
        email: 'ck-cookname@homefood.app',
        password: 'cookpass',
        name: 'Cook Name',
        phone: '+1234567891',
        isCook: true,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <View style={styles.logoContainer}>
            <ChefHat size={48} color="white" />
            <Text style={styles.logo}>HomeFood</Text>
          </View>
          <Text style={styles.tagline}>
            Discover amazing homemade meals from local cooks in your neighborhood
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.authCard} variant="elevated">
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>
              {isLogin ? 'Welcome Back!' : 'Join Our Community'}
            </Text>
            <Text style={styles.authSubtitle}>
              {isLogin 
                ? 'Sign in to discover delicious homemade meals'
                : 'Create your account and start your culinary journey'
              }
            </Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Demo Setup */}
          <View style={styles.setupSection}>
            <Text style={styles.setupTitle}>First Time Setup</Text>
            <Text style={styles.setupText}>
              Create demo users for testing the app:
            </Text>
            <Button
              title={loading ? 'Creating Users...' : 'Create Demo Users'}
              onPress={handleCreateTestUsers}
              disabled={loading}
              variant="outline"
              style={styles.setupButton}
            />
          </View>

          {/* Demo Credentials */}
          {isLogin && (
            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Accounts:</Text>
              <View style={styles.demoButtons}>
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => fillTestCredentials('user')}
                >
                  <Text style={styles.demoButtonText}>Customer Login</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => fillTestCredentials('cook')}
                >
                  <Text style={styles.demoButtonText}>Cook Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry
              autoComplete="password"
            />

            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                  autoComplete="name"
                />

                <Input
                  label="Phone Number (Optional)"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />

                <TouchableOpacity
                  style={styles.cookToggle}
                  onPress={() => updateFormData('isCook', !formData.isCook)}
                >
                  <View style={styles.cookToggleContent}>
                    <ChefHat size={20} color={theme.colors.primary} />
                    <View style={styles.cookToggleText}>
                      <Text style={styles.cookToggleTitle}>Become a Home Cook</Text>
                      <Text style={styles.cookToggleSubtitle}>
                        Share your culinary skills and earn money
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    formData.isCook && styles.checkboxActive
                  ]}>
                    {formData.isCook && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              </>
            )}

            <Button
              title={loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            />

            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData(prev => ({ ...prev, password: '' }));
              }}
              style={styles.switchModeButton}
            >
              <Text style={styles.switchModeText}>
                {isLogin 
                  ? "Don't have an account? " 
                  : "Already have an account? "
                }
                <Text style={styles.switchModeLink}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Test Credentials Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Test Credentials</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Customer Account:</Text>
            {'\n'}Email: bala@example.com
            {'\n'}Password: pass123
            {'\n\n'}
            <Text style={styles.infoLabel}>Cook Account:</Text>
            {'\n'}Email: ck-cookname@homefood.app
            {'\n'}Password: cookpass
          </Text>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: theme.spacing.md,
  },
  tagline: {
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
  authCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  authTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  authSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.error,
    textAlign: 'center',
  },
  setupSection: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary + '30',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
  },
  setupTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  setupText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  setupButton: {
    alignSelf: 'center',
  },
  demoCredentials: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  demoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  demoButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  form: {
    gap: theme.spacing.lg,
  },
  cookToggle: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cookToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  cookToggleText: {
    flex: 1,
  },
  cookToggleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  cookToggleSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  switchModeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  switchModeLink: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
  },
  infoCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceVariant,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  infoLabel: {
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
});</parameter>