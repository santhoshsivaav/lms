import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FAQsScreen = () => {
    const faqs = [
        {
            question: 'How do I enroll in a course?',
            answer: 'To enroll in a course, simply browse through our course catalog, select the course you\'re interested in, and click the "Enroll Now" button. You\'ll be prompted to confirm your enrollment, and once confirmed, you\'ll have immediate access to the course content.',
        },
        {
            question: 'Can I access courses offline?',
            answer: 'Yes, you can download course content for offline viewing. Look for the download icon next to the video or content you want to save. Note that some interactive elements may require an internet connection.',
        },
        {
            question: 'How do I track my progress?',
            answer: 'Your progress is automatically tracked as you complete lessons and assignments. You can view your progress in the "My Courses" section, where each course shows a progress bar and completion percentage.',
        },
        {
            question: 'What if I need to reset my password?',
            answer: 'If you need to reset your password, click on the "Forgot Password" link on the login screen. You\'ll receive an email with instructions to reset your password securely.',
        },
        {
            question: 'Are certificates provided upon completion?',
            answer: 'Yes, certificates are provided for all completed courses. Once you finish all course requirements, you can download your certificate from the course completion page.',
        },
        {
            question: 'How do I update my profile information?',
            answer: 'You can update your profile information by going to the Profile section, clicking on the edit button, and making your desired changes. Don\'t forget to save your changes when you\'re done.',
        },
        {
            question: 'What payment methods are accepted?',
            answer: 'We accept various payment methods including credit/debit cards, PayPal, and other major payment gateways. All transactions are secure and encrypted.',
        },
        {
            question: 'Can I get a refund if I\'m not satisfied?',
            answer: 'Yes, we offer a 30-day money-back guarantee for all courses. If you\'re not satisfied with your purchase, you can request a refund within 30 days of enrollment.',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Frequently Asked Questions</Text>
                    <Text style={styles.subtitle}>
                        Find answers to common questions about our platform
                    </Text>
                </View>

                <View style={styles.content}>
                    {faqs.map((faq, index) => (
                        <View key={index} style={styles.faqItem}>
                            <Text style={styles.question}>{faq.question}</Text>
                            <Text style={styles.answer}>{faq.answer}</Text>
                        </View>
                    ))}
                </View>

                
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    content: {
        padding: 20,
    },
    faqItem: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    answer: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    contactSection: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        marginTop: 20,
        borderRadius: 12,
        margin: 20,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    contactButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FAQsScreen; 