import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@device_id';

export const generateDeviceId = async () => {
    try {
        // Try to get existing device ID
        let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

        if (!deviceId) {
            // Generate new device ID using device info
            const uniqueId = await DeviceInfo.getUniqueId();
            const brand = await DeviceInfo.getBrand();
            const model = await DeviceInfo.getModel();
            const systemVersion = await DeviceInfo.getSystemVersion();

            deviceId = `${brand}-${model}-${systemVersion}-${uniqueId}`.replace(/\s+/g, '-');
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
        const brand = await DeviceInfo.getBrand();
        const model = await DeviceInfo.getModel();
        const systemVersion = await DeviceInfo.getSystemVersion();
        const appVersion = await DeviceInfo.getVersion();
        const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

        return {
            deviceId,
            deviceName: `${brand} ${model}`,
            deviceType,
            os: `${deviceType} ${systemVersion}`,
            appVersion
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            deviceId: await generateDeviceId(),
            deviceName: 'Unknown Device',
            deviceType: 'other',
            os: 'Unknown',
            appVersion: '1.0.0'
        };
    }
}; 