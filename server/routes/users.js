const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', [protect, admin], async (req, res) => {
    try {
        console.log('\n=== Get All Users Request ===');
        console.log('User making request:', req.user.email);

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        console.log(`Found ${users.length} users`);
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID (Admin only)
router.get('/:id', [protect, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user subscription (Admin only)
router.put('/:id/subscription', [protect, admin], async (req, res) => {
    try {
        const { isSubscribed, subscriptionEndDate } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isSubscribed = isSubscribed;
        user.subscriptionEndDate = subscriptionEndDate;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error('Error updating subscription:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user course progress (Admin only)
router.get('/:id/progress', [protect, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('courseProgress')
            .populate('courseProgress.courseId', 'title');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.courseProgress);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;