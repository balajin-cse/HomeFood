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
import { ArrowLeft, ChefHat, Upload, Check } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';

export default function CookRegistrationScreen() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    specialties: '',
    experience: '',
    kitchenAddress: '',
    phone: user?.phone || '',
    certifications: '',
    availability: '',
  });

  const [documents, setDocuments] = useState({
    foodHandlersCert: false,
    businessLicense: false,
    kitchenPhotos: false,
    identityVerification: false,
  });

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.description || !formData.specialties) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate application submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Application Submitted!',
        'Thank you for applying to become a home cook. We will review your application and get back to you within 3-5 business days.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDocument = (doc: keyof typeof documents) => {
    setDocuments(prev => ({ ...prev, [doc]: !prev[doc] }));
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
          <ChefHat size={48} color="white" />
          <Text style={styles.headerTitle}>Become a Home Cook</Text>
          <Text style={styles.headerSubtitle}>
            Share your culinary passion and earn money cooking for your community
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Requirements */}
        <Card style={styles.requirementsCard}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirements}>
            <View style={styles.requirement}>
              <Check size={20} color={theme.colors.success} />
              <Text style={styles.requirementText}>Food handler's certification</Text>
            </View>
            <View style={styles.requirement}>
              <Check size={20} color={theme.colors.success} />
              <Text style={styles.requirementText}>Clean, inspected kitchen</Text>
            </View>
            <View style={styles.requirement}>
              <Check size={20} color={theme.colors.success} />
              <Text style={styles.requirementText}>Business license (if required)</Text>
            </View>
            <View style={styles.requirement}>
              <Check size={20} color={theme.colors.success} />
              <Text style={styles.requirementText}>Identity verification</Text>
            </View>
          </View>
        </Card>

        {/* Application Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          
          <Input
            label="Business/Kitchen Name *"
            placeholder="e.g., Maria's Authentic Italian Kitchen"
            value={formData.businessName}
            onChangeText={(text) => updateFormData('businessName', text)}
          />

          <Input
            label="Description *"
            placeholder="Tell us about your cooking style and what makes your food special"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
          />

          <Input
            label="Specialties *"
            placeholder="e.g., Italian pasta, Mexican street food, Vegan desserts"
            value={formData.specialties}
            onChangeText={(text) => updateFormData('specialties', text)}
          />

          <Input
            label="Cooking Experience"
            placeholder="Years of experience and any professional background"
            value={formData.experience}
            onChangeText={(text) => updateFormData('experience', text)}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Kitchen Address *"
            placeholder="Where you'll be cooking from"
            value={formData.kitchenAddress}
            onChangeText={(text) => updateFormData('kitchenAddress', text)}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Phone Number *"
            placeholder="Your contact number"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            keyboardType="phone-pad"
          />

          <Input
            label="Certifications"
            placeholder="Food safety, culinary school, etc."
            value={formData.certifications}
            onChangeText={(text) => updateFormData('certifications', text)}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Availability"
            placeholder="Days and hours you're available to cook"
            value={formData.availability}
            onChangeText={(text) => updateFormData('availability', text)}
            multiline
            numberOfLines={2}
          />
        </Card>

        {/* Document Upload */}
        <Card style={styles.documentsCard}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <Text style={styles.documentsSubtitle}>
            Upload or indicate you have these documents ready
          </Text>
          
          <View style={styles.documentsList}>
            {Object.entries(documents).map(([key, uploaded]) => (
              <TouchableOpacity
                key={key}
                style={styles.documentItem}
                onPress={() => toggleDocument(key as keyof typeof documents)}
              >
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {key === 'foodHandlersCert' && 'Food Handler\'s Certification'}
                    {key === 'businessLicense' && 'Business License'}
                    {key === 'kitchenPhotos' && 'Kitchen Photos'}
                    {key === 'identityVerification' && 'Identity Verification'}
                  </Text>
                  <Text style={styles.documentStatus}>
                    {uploaded ? 'Ready ✓' : 'Required'}
                  </Text>
                </View>
                <View style={[
                  styles.uploadButton,
                  uploaded && styles.uploadButtonUploaded
                ]}>
                  {uploaded ? (
                    <Check size={20} color="white" />
                  ) : (
                    <Upload size={20} color={theme.colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Terms */}
        <Card style={styles.termsCard}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            By submitting this application, you agree to:
            {'\n\n'}• Follow all local health and safety regulations
            {'\n'}• Maintain high food quality standards
            {'\n'}• Provide accurate information about ingredients and allergens
            {'\n'}• Respond to orders in a timely manner
            {'\n'}• Maintain a clean and safe cooking environment
            {'\n\n'}We reserve the right to inspect your kitchen and verify all provided information.
          </Text>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomAction}>
        <Button
          title={loading ? 'Submitting Application...' : 'Submit Application'}
          onPress={handleSubmit}
          disabled={loading}
          size="large"
          style={styles.submitButton}
        />
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
  requirementsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  requirements: {
    gap: theme.spacing.md,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
    flex: 1,
  },
  formCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  documentsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  documentsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.lg,
  },
  documentsList: {
    gap: theme.spacing.md,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  documentStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  uploadButtonUploaded: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  termsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  termsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  termsText: {
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
  submitButton: {
    marginBottom: 0,
  },
});