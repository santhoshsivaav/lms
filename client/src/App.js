import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext';

// Screens
import HomeScreen from './screens/main/HomeScreen';
import CourseDetailScreen from './screens/main/CourseDetailScreen';
import VideoPlayerScreen from './screens/main/VideoPlayerScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ProfileScreen from './screens/main/ProfileScreen';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#3498db',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'Courses' }}
                    />
                    <Stack.Screen
                        name="CourseDetail"
                        component={CourseDetailScreen}
                        options={{ title: 'Course Details' }}
                    />
                    <Stack.Screen
                        name="VideoPlayer"
                        component={VideoPlayerScreen}
                        options={{ title: 'Video Player' }}
                    />
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ title: 'Login' }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ title: 'Register' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{ title: 'Profile' }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
};

export default App; 