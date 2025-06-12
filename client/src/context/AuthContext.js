import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';
import { getDeviceInfo } from '../utils/deviceUtils';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await SecureStore.getItemAsync('user');
            const token = await SecureStore.getItemAsync('authToken');
            if (userData && token) {
                setUser(JSON.parse(userData));
                setUserToken(token);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name, email, password, preferredCategories) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authService.register({
                name,
                email,
                password,
                preferredCategories
            });

            if (response.success) {
                const { token, user: userData } = response.data;
                console.log('Registration response:', response.data); // Debug log
                await SecureStore.setItemAsync('user', JSON.stringify(userData));
                await SecureStore.setItemAsync('authToken', token);
                setUser(userData);
                setUserToken(token);
                return true;
            } else {
                setError(response.message);
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'An error occurred during registration');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setIsLoading(true);
            setError(null);

            // Get device information
            const deviceInfo = await getDeviceInfo();

            // Prepare login request
            const loginData = {
                email,
                password,
                deviceId: deviceInfo.deviceId,
                deviceName: deviceInfo.deviceName
            };

            const response = await authService.login(loginData);

            if (response.token && response.user) {
                await SecureStore.setItemAsync('user', JSON.stringify(response.user));
                await SecureStore.setItemAsync('authToken', response.token);
                setUser(response.user);
                setUserToken(response.token);
                return true;
            } else {
                setError('Invalid response from server');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'An error occurred during login');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('authToken');
            setUser(null);
            setUserToken(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserPreferences = async (preferredCategories) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authService.updatePreferences({ preferredCategories });

            if (response.success) {
                const updatedUser = { ...user, preferredCategories };
                await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                return true;
            } else {
                setError(response.message);
                return false;
            }
        } catch (error) {
            console.error('Update preferences error:', error);
            setError(error.message || 'An error occurred while updating preferences');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userToken,
                isLoading,
                error,
                register,
                login,
                logout,
                updateUserPreferences
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}; 