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
import Constants from 'expo-constants';
import { getDeviceInfo } from '../../utils/deviceUtils';

// Get API URL from app config
const API_URL = Constants.expoConfig.extra.apiUrl || 'https://lms-yunus-app.onrender.com/api';

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
            console.log('Device info:', deviceInfo);

            // Call the login function from AuthContext
            const success = await login(email, password);

            if (success) {
                navigation.replace('Main');
            } else {
                Alert.alert('Error', 'Login failed. Please check your credentials.');
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