const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Public route to get all users
router.get('/', async (req, res) => {
    console.log('=== All Users Route Hit ===');
    try {
        console.log('Fetching users from database...');
        const users = await User.find()
            .select('-password -subscription -progress -preferences') // Exclude sensitive data
            .sort({ createdAt: -1 });

        console.log(`Found ${users.length} users`);
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Add a test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'AllUsers router is working' });
});

// Public route to delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
});

// Public route to update a user by ID
router.put('/:id', async (req, res) => {
    try {
        const updateData = req.body;
        if (updateData.password === '') delete updateData.password;
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
    }
});
module.exports = router;