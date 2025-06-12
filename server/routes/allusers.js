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

module.exports = router; 