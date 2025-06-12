// Configuration values for the app
// In a real app, these would be loaded from environment variables

// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://lms-yunus-app.onrender.com/api';

// App Configuration
export const APP_CONFIG = {
    name: 'LMS Platform',
    version: '1.0.0',
    supportEmail: 'support@lms.com',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: {
        video: ['video/mp4', 'video/webm', 'video/ogg'],
        image: ['image/jpeg', 'image/png', 'image/gif'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
};

// Razorpay Configuration
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_XVcuUWMjonpSMU';

export default {
    API_URL,
    RAZORPAY_KEY_ID,
    APP_CONFIG,
}; 