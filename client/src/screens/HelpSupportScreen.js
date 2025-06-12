import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = ({ navigation }) => {
    const supportItems = [
        {
            title: 'Contact Us',
            description: 'Get in touch with our support team',
            icon: 'mail-outline',
            action: () => Linking.openURL('mailto:support@example.com'),
        },
        {
            title: 'FAQs',
            description: 'Find answers to common questions',
            icon: 'help-circle-outline',
            action: () => navigation.navigate('FAQs'),
        },
        {
            title: 'Report an Issue',
            description: 'Let us know if you encounter any problems',
            icon: 'bug-outline',
            action: () => navigation.navigate('ReportIssue'),
        },
        {
            title: 'User Guide',
            description: 'Learn how to use the app effectively',
            icon: 'book-outline',
            action: () => navigation.navigate('UserGuide'),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>Help & Support</Text>
                    <Text style={styles.subtitle}>
                        We're here to help you with any questions or concerns
                    </Text>
                </View>

                <View style={styles.content}>
                    {supportItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.supportItem}
                            onPress={item.action}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon} size={24} color="#007AFF" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Need Immediate Assistance?</Text>
                    <Text style={styles.contactText}>
                        Our support team is available Monday to Friday, 9 AM to 6 PM
                    </Text>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => Linking.openURL('tel:+1234567890')}
                    >
                        <Text style={styles.contactButtonText}>Call Support</Text>
                    </TouchableOpacity>
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
    header: {
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 28,
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
    supportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: '#666',
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

export default HelpSupportScreen; 