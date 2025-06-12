import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TermsPrivacyScreen = () => {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' or 'privacy'

  const termsContent = {
    terms: {
      title: 'Terms of Service',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.',
        },
        {
          title: '2. Use License',
          content: 'Permission is granted to temporarily download one copy of the application per device for personal, non-commercial transitory viewing only.',
        },
        {
          title: '3. User Account',
          content: 'You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.',
        },
        {
          title: '4. User Conduct',
          content: 'You agree not to use the application for any unlawful purpose or in any way that could damage, disable, or impair the application.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          title: '1. Information Collection',
          content: 'We collect information that you provide directly to us, including but not limited to your name, email address, and usage data.',
        },
        {
          title: '2. Information Usage',
          content: 'We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect our company and users.',
        },
        {
          title: '3. Information Sharing',
          content: 'We do not share your personal information with third parties except as described in this privacy policy.',
        },
        {
          title: '4. Data Security',
          content: 'We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.',
        },
      ],
    },
  };

  const renderContent = () => {
    const content = termsContent[activeTab];
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>{content.title}</Text>
        {content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
        >
          <Text
            style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}
          >
            Terms of Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'privacy' && styles.activeTabText,
            ]}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderContent()}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default TermsPrivacyScreen; 