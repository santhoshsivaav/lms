import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../utils/config';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false
});

// Add token to requests
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Don't modify Content-Type for FormData
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    } catch (error) {
        console.error('Error getting token:', error);
        return config;
    }
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken
                    });

                    if (response.data.token) {
                        // Save the new token
                        await SecureStore.setItemAsync('authToken', response.data.token);

                        // Update the original request with the new token
                        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;

                        // Retry the original request
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
            }

            // If refresh failed or no refresh token, clear tokens and let the app handle the redirect
            await SecureStore.deleteItemAsync('authToken');
            await SecureStore.deleteItemAsync('refreshToken');
        }

        return Promise.reject(error);
    }
);

// Log API calls in development
if (__DEV__) {
    api.interceptors.request.use(request => {
        console.log('Starting Request:', request);
        return request;
    });

    api.interceptors.response.use(response => {
        console.log('Response:', response);
        return response;
    });
}

export default api; 