import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ReportIssueScreen = () => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = () => {
        if (!subject.trim() || !description.trim() || !email.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Create email body with the issue details
        const emailBody = `
Subject: ${subject}

Description:
${description}

Contact Email: ${email}

---
This issue was reported through the mobile app.
        `;

        // Encode the email body for the mailto link
        const encodedBody = encodeURIComponent(emailBody);
        const mailtoLink = `mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;

        // Open email client
        Linking.openURL(mailtoLink).catch((err) => {
            Alert.alert('Error', 'Could not open email client');
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Report an Issue</Text>
                    <Text style={styles.subtitle}>
                        Help us improve by reporting any problems you encounter
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="Brief description of the issue"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Please provide detailed information about the issue"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Your Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email address"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Submit Report</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
                        <Text style={styles.infoText}>
                            Our support team will review your report and get back to you as soon as possible.
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={24} color="#007AFF" />
                        <Text style={styles.infoText}>
                            Typical response time is within 24-48 hours during business days.
                        </Text>
                    </View>
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
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        marginTop: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});

export default ReportIssueScreen; 