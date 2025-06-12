import api from '../api/api';

export const categoryService = {
    // Get all categories
    getAllCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get category by ID
    getCategoryById: async (id) => {
        try {
            const response = await api.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new category (admin only)
    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update category (admin only)
    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(`/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete category (admin only)
    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 