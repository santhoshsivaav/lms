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

const UserGuideScreen = () => {
    const guideSections = [
        {
            title: 'Getting Started',
            icon: 'rocket-outline',
            items: [
                {
                    title: 'Creating an Account',
                    content: 'Sign up using your email address or social media accounts. Verify your email to get started.',
                },
                {
                    title: 'Profile Setup',
                    content: 'Complete your profile by adding your name, profile picture, and other relevant information.',
                },
                {
                    title: 'Navigation Basics',
                    content: 'Use the bottom navigation bar to switch between Home, My Courses, and Profile sections.',
                },
            ],
        },
        {
            title: 'Course Management',
            icon: 'book-outline',
            items: [
                {
                    title: 'Browsing Courses',
                    content: 'Explore courses by category, search for specific topics, or view recommended courses.',
                },
                {
                    title: 'Enrolling in Courses',
                    content: 'Click "Enroll Now" on any course to start learning. Some courses may require payment.',
                },
                {
                    title: 'Tracking Progress',
                    content: 'Monitor your progress through the course dashboard. Complete lessons and assignments to advance.',
                },
            ],
        },
        {
            title: 'Learning Features',
            icon: 'school-outline',
            items: [
                {
                    title: 'Video Lessons',
                    content: 'Watch high-quality video lessons. Use playback controls to adjust speed and quality.',
                },
                {
                    title: 'Downloading Content',
                    content: 'Save lessons for offline viewing by clicking the download icon next to the content.',
                },
                {
                    title: 'Taking Notes',
                    content: 'Use the note-taking feature to jot down important points during lessons.',
                },
            ],
        },
        {
            title: 'Account Settings',
            icon: 'settings-outline',
            items: [
                {
                    title: 'Notification Preferences',
                    content: 'Customize which notifications you receive about courses, updates, and promotions.',
                },
                {
                    title: 'Privacy Settings',
                    content: 'Manage your privacy settings and control what information is visible to others.',
                },
                {
                    title: 'Account Security',
                    content: 'Update your password, enable two-factor authentication, and manage connected devices.',
                },
            ],
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>User Guide</Text>
                    <Text style={styles.subtitle}>
                        Learn how to make the most of our learning platform
                    </Text>
                </View>

                <View style={styles.content}>
                    {guideSections.map((section, sectionIndex) => (
                        <View key={sectionIndex} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name={section.icon} size={24} color="#007AFF" />
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                            </View>

                            {section.items.map((item, itemIndex) => (
                                <View key={itemIndex} style={styles.guideItem}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <Text style={styles.itemContent}>{item.content}</Text>
                                </View>
                            ))}
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
    section: {
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    guideItem: {
        marginBottom: 16,
        paddingLeft: 36,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemContent: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
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

export default UserGuideScreen; 