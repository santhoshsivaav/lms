import api from '../api/api';

export const authService = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Login user
    login: async (loginData) => {
        try {
            const response = await api.post('/auth/login', loginData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update user preferences
    updatePreferences: async (preferences) => {
        try {
            const response = await api.put('/auth/preferences', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 