import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function HelpSupportScreen() {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'How do I place an order?',
      answer: 'To place an order, browse available dishes on the home screen, select a dish you like, choose your quantity, and proceed to checkout. You\'ll need an active subscription to place orders.',
      expanded: false,
    },
    {
      id: '2',
      question: 'What are the subscription plans?',
      answer: 'We offer three subscription plans: Daily ($4.99/day), Weekly ($24.99/week), and Monthly ($79.99/month). Each plan includes different features and benefits.',
      expanded: false,
    },
    {
      id: '3',
      question: 'How do I become a home cook?',
      answer: 'To become a home cook, go to your profile and tap "Become a Home Cook". You\'ll need to fill out an application, provide certifications, and pass our verification process.',
      expanded: false,
    },
    {
      id: '4',
      question: 'What if my order is late or incorrect?',
      answer: 'If your order is late or incorrect, please contact the cook directly through the app or reach out to our support team. We\'ll help resolve the issue and may provide a refund or credit.',
      expanded: false,
    },
    {
      id: '5',
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription anytime through your device\'s subscription settings (App Store or Google Play). Your subscription will remain active until the end of the current billing period.',
      expanded: false,
    },
    {
      id: '6',
      question: 'Are the home cooks verified?',
      answer: 'Yes, all home cooks go through a verification process including background checks, kitchen inspections, and food safety certifications before they can start selling on our platform.',
      expanded: false,
    },
  ]);

  const toggleFAQ = (id: string) => {
    setFaqs(prev =>
      prev.map(faq =>
        faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
      )
    );
  };

  const handleContactSupport = (method: 'phone' | 'email' | 'chat') => {
    switch (method) {
      case 'phone':
        Linking.openURL('tel:+1-555-HOMEFOOD');
        break;
      case 'email':
        Linking.openURL('mailto:support@homefood.app');
        break;
      case 'chat':
        // In a real app, this would open a chat interface
        console.log('Opening chat support...');
        break;
    }
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
          <HelpCircle size={32} color="white" />
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            Get help and find answers to common questions
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <Card style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => handleContactSupport('chat')}
            >
              <MessageCircle size={24} color={theme.colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactSubtitle}>Available 24/7</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => handleContactSupport('phone')}
            >
              <Phone size={24} color={theme.colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactSubtitle}>+1-555-HOMEFOOD</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => handleContactSupport('email')}
            >
              <Mail size={24} color={theme.colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@homefood.app</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* FAQ Section */}
        <Card style={styles.faqCard}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <Text style={styles.questionText}>{faq.question}</Text>
                  {faq.expanded ? (
                    <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                  ) : (
                    <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
                
                {faq.expanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            <Button
              title="Report an Issue"
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Request Refund"
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Suggest a Feature"
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoItems}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Terms of Service</Text>
              <TouchableOpacity>
                <Text style={styles.infoLink}>View</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Privacy Policy</Text>
              <TouchableOpacity>
                <Text style={styles.infoLink}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  contactCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
  },
  contactOptions: {
    gap: theme.spacing.md,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  contactSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  faqCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  faqList: {
    gap: theme.spacing.md,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    paddingBottom: theme.spacing.md,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  faqAnswer: {
    paddingTop: theme.spacing.md,
  },
  answerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  actionsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    gap: theme.spacing.md,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  infoCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  infoItems: {
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurface,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
  infoLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
});