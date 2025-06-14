import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

// Ignore specific warnings that might appear due to dependencies
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'Failed prop type',
    'Animated: `useNativeDriver` was not specified'
]);

// Add debug test for Google Drive URLs if needed during development
if (__DEV__) {
    const { isGoogleDriveUrl, createGoogleDriveStreamUrl } = require('./src/utils/googleDriveHelper');

    // Test various Google Drive URL formats
    const testUrls = [
        'https://drive.google.com/file/d/1abcdefg123456789/view?usp=sharing',
        'https://drive.google.com/open?id=1abcdefg123456789',
        'https://drive.google.com/uc?id=1abcdefg123456789',
        'https://example.com/not-drive'
    ];

    console.log('=== Google Drive URL Test ===');
    testUrls.forEach(url => {
        console.log(`URL: ${url}`);
        console.log(`Is Google Drive URL: ${isGoogleDriveUrl(url)}`);
        console.log(`Stream URL: ${createGoogleDriveStreamUrl(url)}`);
        console.log('---');
    });
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <CartProvider>
                    <NotificationProvider>
                        <NavigationContainer>
                            <StatusBar style="auto" />
                            <AppNavigator />
                        </NavigationContainer>
                    </NotificationProvider>
                </CartProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
} 