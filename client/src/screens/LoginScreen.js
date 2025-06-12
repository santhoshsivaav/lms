import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { getDeviceInfo } from '../utils/deviceUtils';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Get device information
            const deviceInfo = await getDeviceInfo();

            // Attempt login with device info
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    deviceId: deviceInfo.deviceId,
                    deviceName: deviceInfo.deviceName
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    // Device limit reached
                    Alert.alert(
                        'Device Limit Reached',
                        'You have reached the maximum number of devices. Please remove a device from your account to continue.',
                        [
                            {
                                text: 'Manage Devices',
                                onPress: () => navigation.navigate('Profile', { screen: 'DeviceManagement' })
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel'
                            }
                        ]
                    );
                } else {
                    throw new Error(data.message || 'Login failed');
                }
                return;
            }

            // Login successful - store the token and user data
            if (data.data && data.data.token && data.data.user) {
                await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
                await AsyncStorage.setItem('token', data.data.token);
                // Update the auth context
                await login(data.data.token, data.data.user);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.registerButtonText}>
                        Don't have an account? Register
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#0066cc',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#0066cc',
        fontSize: 16,
    },
});

export default LoginScreen; 