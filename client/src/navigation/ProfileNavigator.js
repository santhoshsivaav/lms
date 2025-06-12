import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import DeviceManagement from '../components/DeviceManagement';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333',
                },
            }}
        >
            <Stack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
            <Stack.Screen
                name="DeviceManagement"
                component={DeviceManagement}
                options={{ title: 'Device Management' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
        </Stack.Navigator>
    );
};

export default ProfileNavigator;