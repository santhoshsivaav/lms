import api from './api';

export const authService = {
    // Register a new user
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Profile error:', error);
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}; 