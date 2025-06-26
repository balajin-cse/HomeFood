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
import { ArrowLeft, MapPin, Plus, Edit, Trash2 } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export default function DeliveryAddressScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      address: '123 Main Street, San Francisco, CA 94102',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Work',
      address: '456 Market Street, San Francisco, CA 94105',
      isDefault: false,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
  });

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      label: newAddress.label,
      address: newAddress.address,
      isDefault: addresses.length === 0,
    };

    setAddresses(prev => [...prev, address]);
    setNewAddress({ label: '', address: '' });
    setShowAddForm(false);
    Alert.alert('Success', 'Address added successfully!');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
          },
        },
      ]
    );
  };

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
          <MapPin size={32} color="white" />
          <Text style={styles.headerTitle}>Delivery Addresses</Text>
          <Text style={styles.headerSubtitle}>
            Manage your delivery locations
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Address Form */}
        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Address</Text>
            
            <Input
              label="Address Label"
              placeholder="e.g., Home, Work, Friend's Place"
              value={newAddress.label}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, label: text }))}
            />

            <Input
              label="Full Address"
              placeholder="Enter complete address with city and zip code"
              value={newAddress.address}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, address: text }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddForm(false)}
                style={styles.cancelButton}
              />
              <Button
                title="Add Address"
                onPress={handleAddAddress}
                style={styles.addButton}
              />
            </View>
          </Card>
        )}

        {/* Address List */}
        <View style={styles.addressList}>
          {addresses.map((address) => (
            <Card key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{address.label}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{address.address}</Text>
                </View>
              </View>

              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.iconActions}>
                  <TouchableOpacity style={styles.iconButton}>
                    <Edit size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Add Address Button */}
        {!showAddForm && (
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => setShowAddForm(true)}
          >
            <Card style={styles.addAddressCard}>
              <Plus size={24} color={theme.colors.primary} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </Card>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    fontSize: 24,
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
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
  },
  addForm: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  formButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
  addressList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  addressCard: {
    padding: theme.spacing.lg,
  },
  addressHeader: {
    marginBottom: theme.spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addressLabel: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
  },
  setDefaultText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  iconActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
  addAddressButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  addAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    gap: theme.spacing.md,
  },
  addAddressText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
});