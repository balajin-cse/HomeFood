import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function TestUsers() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const createTestUsers = async () => {
    setLoading(true);
    
    try {
      console.log('Creating test users...');
      
      // Create regular user
      const userSuccess = await register({
        email: 'bala@homefood.com',
        password: 'userpass123',
        name: 'Bala User',
        phone: '+1234567890',
        isCook: false,
      });

      // Create cook user
      const cookSuccess = await register({
        email: 'ck-cookname@homefood.com',
        password: 'cookpass',
        name: 'Cook Name',
        phone: '+1234567891',
        isCook: true,
      });

      if (userSuccess && cookSuccess) {
        Alert.alert('Success', 'Test users created successfully!\n\nUser: bala@homefood.com\nCook: ck-cookname@homefood.com');
      } else {
        Alert.alert('Error', 'Failed to create some test users. Check console for details.');
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      Alert.alert('Error', 'Failed to create test users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test User Creation</Text>
      <Text style={styles.description}>
        This will create test users for the application:
        {'\n\n'}
        • Regular User: bala@homefood.com (password: userpass123)
        {'\n'}
        • Cook User: ck-cookname@homefood.com (password: cookpass)
      </Text>
      
      <Button
        title={loading ? 'Creating Users...' : 'Create Test Users'}
        onPress={createTestUsers}
        disabled={loading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    marginTop: 20,
  },
});