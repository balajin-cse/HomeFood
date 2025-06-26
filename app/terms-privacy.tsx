import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, FileText, Shield } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';

export default function TermsPrivacyScreen() {
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
          <FileText size={32} color="white" />
          <Text style={styles.headerTitle}>Terms & Privacy</Text>
          <Text style={styles.headerSubtitle}>
            Our commitment to your privacy and service terms
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Policy */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
          </View>
          
          <Text style={styles.lastUpdated}>Last updated: January 1, 2024</Text>
          
          <Text style={styles.sectionText}>
            At HomeFood, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our service.
          </Text>

          <Text style={styles.subheading}>Information We Collect</Text>
          <Text style={styles.bodyText}>
            • Personal information (name, email, phone number)
            {'\n'}• Location data to find nearby home cooks
            {'\n'}• Payment information (processed securely)
            {'\n'}• Order history and preferences
            {'\n'}• Device information and usage analytics
          </Text>

          <Text style={styles.subheading}>How We Use Your Information</Text>
          <Text style={styles.bodyText}>
            • To provide and improve our services
            {'\n'}• To process orders and payments
            {'\n'}• To connect you with local home cooks
            {'\n'}• To send important updates and notifications
            {'\n'}• To ensure safety and prevent fraud
          </Text>

          <Text style={styles.subheading}>Information Sharing</Text>
          <Text style={styles.bodyText}>
            We do not sell your personal information. We may share information with:
            {'\n'}• Home cooks for order fulfillment
            {'\n'}• Payment processors for transactions
            {'\n'}• Service providers who help us operate
            {'\n'}• Law enforcement when required by law
          </Text>

          <Text style={styles.subheading}>Data Security</Text>
          <Text style={styles.bodyText}>
            We use industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.
          </Text>
        </Card>

        {/* Terms of Service */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Terms of Service</Text>
          </View>
          
          <Text style={styles.lastUpdated}>Last updated: January 1, 2024</Text>
          
          <Text style={styles.sectionText}>
            By using HomeFood, you agree to these terms. Please read them carefully.
          </Text>

          <Text style={styles.subheading}>Service Description</Text>
          <Text style={styles.bodyText}>
            HomeFood is a platform that connects food lovers with local home cooks. We facilitate orders but do not prepare food ourselves.
          </Text>

          <Text style={styles.subheading}>User Responsibilities</Text>
          <Text style={styles.bodyText}>
            • Provide accurate information
            {'\n'}• Use the service lawfully
            {'\n'}• Respect other users and cooks
            {'\n'}• Pay for orders promptly
            {'\n'}• Report any issues or concerns
          </Text>

          <Text style={styles.subheading}>Cook Responsibilities</Text>
          <Text style={styles.bodyText}>
            • Follow all local health regulations
            {'\n'}• Maintain food safety standards
            {'\n'}• Provide accurate menu information
            {'\n'}• Fulfill orders as promised
            {'\n'}• Maintain required certifications
          </Text>

          <Text style={styles.subheading}>Payments and Refunds</Text>
          <Text style={styles.bodyText}>
            • Payments are processed securely through our platform
            {'\n'}• Refunds may be issued for cancelled or problematic orders
            {'\n'}• Subscription fees are non-refundable except as required by law
            {'\n'}• Cooks receive payment after successful order completion
          </Text>

          <Text style={styles.subheading}>Limitation of Liability</Text>
          <Text style={styles.bodyText}>
            HomeFood is not responsible for food quality, safety, or delivery issues. We facilitate connections but do not control the cooking or delivery process.
          </Text>

          <Text style={styles.subheading}>Termination</Text>
          <Text style={styles.bodyText}>
            We may suspend or terminate accounts that violate these terms. Users may cancel their accounts at any time.
          </Text>
        </Card>

        {/* Contact Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have questions about these terms or our privacy practices, please contact us:
            {'\n\n'}Email: legal@homefood.app
            {'\n'}Phone: +1-555-HOMEFOOD
            {'\n'}Address: 123 Food Street, San Francisco, CA 94102
          </Text>
        </Card>
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
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
});