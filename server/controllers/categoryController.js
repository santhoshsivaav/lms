const Category = require('../models/Category');

const categoryController = {
    // Get all categories
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find().sort({ name: 1 });
            res.json({ success: true, data: categories });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ success: false, message: 'Error fetching categories' });
        }
    },

    // Get category by ID
    getCategoryById: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            res.json({ success: true, data: category });
        } catch (error) {
            console.error('Error fetching category:', error);
            res.status(500).json({ success: false, message: 'Error fetching category' });
        }
    },

    // Create new category (admin only)
    createCategory: async (req, res) => {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ success: false, message: 'Only admins can create categories' });
            }

            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Category name is required' });
            }

            const category = new Category({
                name,
                description
            });

            await category.save();
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            console.error('Error creating category:', error);
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'Category name already exists' });
            }
            res.status(500).json({ success: false, message: 'Error creating category' });
        }
    },

    // Update category (admin only)
    updateCategory: async (req, res) => {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ success: false, message: 'Only admins can update categories' });
            }

            const { name, description, isActive } = req.body;
            const category = await Category.findById(req.params.id);

            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            if (name) category.name = name;
            if (description !== undefined) category.description = description;
            if (isActive !== undefined) category.isActive = isActive;

            await category.save();
            res.json({ success: true, data: category });
        } catch (error) {
            console.error('Error updating category:', error);
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'Category name already exists' });
            }
            res.status(500).json({ success: false, message: 'Error updating category' });
        }
    },

    // Delete category (admin only)
    deleteCategory: async (req, res) => {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ success: false, message: 'Only admins can delete categories' });
            }

            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            await category.remove();
            res.json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ success: false, message: 'Error deleting category' });
        }
    }
};

module.exports = categoryController; 