import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Button, Card, Switch } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    isCook: false,
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && (!formData.name || !formData.phone)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(formData);
      }

      if (!success) {
        Alert.alert('Error', isLogin ? 'Invalid credentials' : 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.logo}>HomeFood</Text>
        <Text style={styles.tagline}>Homemade meals from local cooks</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Card style={styles.authCard}>
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>
              {isLogin ? 'Welcome Back' : 'Join HomeFood'}
            </Text>
            <Text style={styles.authSubtitle}>
              {isLogin 
                ? 'Sign in to order delicious homemade meals'
                : 'Create an account to get started'
              }
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            {!isLogin && (
              <>
                <TextInput
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                />

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>I want to cook and sell food</Text>
                  <Switch
                    value={formData.isCook}
                    onValueChange={(value) => updateFormData('isCook', value)}
                    color={theme.colors.primary}
                  />
                </View>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsLogin(!isLogin)}
              style={styles.switchModeButton}
            >
              {isLogin 
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </Button>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  authCard: {
    padding: 30,
    elevation: 5,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    paddingVertical: 8,
    marginBottom: 15,
  },
  switchModeButton: {
    marginTop: 10,
  },
});

export default AuthScreen;