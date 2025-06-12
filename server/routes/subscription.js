const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        const plans = [
            {
                id: 'basic',
                name: 'Basic Plan',
                price: 999, // in paise (₹9.99)
                duration: 30, // days
                features: [
                    'Access to all courses',
                    'HD video quality',
                    'Download resources',
                    'Certificate of completion'
                ]
            },
            {
                id: 'premium',
                name: 'Premium Plan',
                price: 1999, // in paise (₹19.99)
                duration: 30, // days
                features: [
                    'All Basic Plan features',
                    'Priority support',
                    'Live sessions',
                    'One-on-one mentoring'
                ]
            }
        ];

        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Failed to fetch subscription plans' });
    }
});

// Create subscription order
router.post('/create-order', protect, async (req, res) => {
    try {
        const { planId } = req.body;

        // Validate plan
        const plans = {
            basic: { price: 999, duration: 30 },
            premium: { price: 1999, duration: 30 }
        };

        const plan = plans[planId];
        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: plan.price,
            currency: 'INR',
            receipt: `sub_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                planId,
                duration: plan.duration
            }
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create subscription order' });
    }
});

// Verify payment and activate subscription
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Get plan details
        const plans = {
            basic: { duration: 30 },
            premium: { duration: 30 }
        };

        const plan = plans[planId];
        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Update user subscription
        const user = await User.findById(req.user._id);
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration);

        user.subscription = {
            isActive: true,
            plan: planId,
            startDate,
            endDate,
            razorpaySubscriptionId: razorpay_order_id,
            razorpayCustomerId: req.user._id.toString(),
            paymentHistory: [{
                amount: 999, // Amount in paise
                currency: 'INR',
                paymentId: razorpay_payment_id,
                date: new Date()
            }]
        };

        await user.save();

        res.json({
            message: 'Subscription activated successfully',
            subscription: user.subscription
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
});

// Get subscription status
router.get('/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if subscription exists and is active
        const hasActiveSubscription = user.subscription &&
            user.subscription.isActive === true &&
            user.subscription.endDate &&
            new Date(user.subscription.endDate) > new Date();

        console.log('User subscription check:', {
            userId: user._id,
            hasSubscription: !!user.subscription,
            isActive: user.subscription?.isActive,
            endDate: user.subscription?.endDate,
            hasActiveSubscription
        });

        res.json({
            success: true,
            isActive: hasActiveSubscription,
            subscription: user.subscription
        });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription status'
        });
    }
});

// Cancel subscription (admin only)
router.post('/cancel/:userId', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.subscription.isActive = false;
        user.subscription.endDate = new Date();
        await user.save();

        res.json({
            message: 'Subscription cancelled successfully',
            subscription: user.subscription
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
});

module.exports = router; 