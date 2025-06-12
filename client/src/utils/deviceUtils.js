import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@device_id';

export const generateDeviceId = async () => {
    try {
        // Try to get existing device ID
        let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

        if (!deviceId) {
            // Generate new device ID using device info
            const deviceName = Device.deviceName || 'Unknown Device';
            const brand = Device.brand || 'Unknown';
            const model = Device.modelName || 'Unknown';
            const systemVersion = Device.osVersion || 'Unknown';
            const uniqueId = `${brand}-${model}-${systemVersion}-${Date.now()}`.replace(/\s+/g, '-');

            deviceId = uniqueId;
            await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
        }

        return deviceId;
    } catch (error) {
        console.error('Error generating device ID:', error);
        // Fallback to a random ID if device info is not available
        const fallbackId = `device-${Math.random().toString(36).substring(7)}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, fallbackId);
        return fallbackId;
    }
};

export const getDeviceInfo = async () => {
    try {
        const deviceId = await generateDeviceId();
        const deviceName = Device.deviceName || 'Unknown Device';
        const brand = Device.brand || 'Unknown';
        const model = Device.modelName || 'Unknown';
        const systemVersion = Device.osVersion || 'Unknown';
        const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

        return {
            deviceId,
            deviceName,
            deviceType,
            os: `${deviceType} ${systemVersion}`,
            brand,
            model
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            deviceId: await generateDeviceId(),
            deviceName: 'Unknown Device',
            deviceType: 'other',
            os: 'Unknown',
            brand: 'Unknown',
            model: 'Unknown'
        };
    }
}; 