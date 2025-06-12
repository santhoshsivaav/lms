import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Alert,
    BackHandler
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Function to get device information
const getDeviceInfo = async () => {
    try {
        const deviceId = await Device.getDeviceIdAsync();
        const deviceName = Device.deviceName || 'Unknown Device';
        return {
            deviceId,
            deviceName
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            deviceId: 'unknown',
            deviceName: 'Unknown Device'
        };
    }
};

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.replace('Onboarding');
                return true; // Prevent default behavior
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () =>
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
    );

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

            // Login successful - store the token and user data in parallel
            if (data.data && data.data.token && data.data.user) {
                await Promise.all([
                    AsyncStorage.setItem('user', JSON.stringify(data.data.user)),
                    AsyncStorage.setItem('token', data.data.token),
                    login(data.data.token, data.data.user)
                ]);

                // Navigate to Home screen immediately after successful login
                navigation.replace('Home');
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <StatusBar style="dark" />

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Welcome Back</Text>
                        <Text style={styles.subHeaderText}>Login to your account</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

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

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    inner: {
        flex: 1,
        padding: 20,
    },
    backButton: {
        marginTop: 40,
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: '#3498db',
    },
    headerContainer: {
        marginBottom: 40,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#2c3e50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#3498db',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    registerLink: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: '600',
    },
});

export default LoginScreen; 