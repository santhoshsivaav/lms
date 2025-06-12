const { SubscriptionPlan, Subscription } = require('../models/Subscription');
const User = require('../models/User');
const { createOrder: createRazorpayOrder, verifyPaymentSignature, getPaymentById } = require('../utils/razorpay');

/**
 * Get all subscription plans
 */
const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({ isActive: true });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({ message: 'Failed to fetch subscription plans' });
    }
};

/**
 * Create a new Razorpay order for subscription
 */
const createOrder = async (req, res) => {
    try {
        const { planId } = req.body;

        if (!planId) {
            return res.status(400).json({ message: 'Plan ID is required' });
        }

        const plan = await SubscriptionPlan.findById(planId);

        if (!plan || !plan.isActive) {
            return res.status(404).json({ message: 'Subscription plan not found or inactive' });
        }

        // Create a Razorpay order
        const orderData = {
            amount: plan.price,
            currency: 'INR',
            receipt: `subscription_${req.user._id}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                planId: plan._id.toString(),
                planName: plan.name,
                durationMonths: plan.durationMonths
            }
        };

        const order = await createRazorpayOrder(orderData);

        res.json({
            orderId: order.id,
            amount: order.amount / 100, // Convert back to rupees
            currency: order.currency,
            plan: {
                id: plan._id,
                name: plan.name,
                price: plan.price,
                durationMonths: plan.durationMonths
            }
        });
    } catch (error) {
        console.error('Error creating subscription order:', error);
        res.status(500).json({ message: 'Failed to create subscription order' });
    }
};

/**
 * Verify Razorpay payment and activate subscription
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
            return res.status(400).json({ message: 'Missing required payment information' });
        }

        // Verify payment signature
        const isValidSignature = verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });

        if (!isValidSignature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Get payment details
        const paymentDetails = await getPaymentById(razorpay_payment_id);

        if (paymentDetails.status !== 'captured') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Find the plan
        const plan = await SubscriptionPlan.findById(planId);

        if (!plan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }

        // Calculate subscription end date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);

        // Create subscription record
        const subscription = new Subscription({
            user: req.user._id,
            plan: plan.name.toLowerCase(),
            startDate,
            endDate,
            isActive: true,
            paymentDetails: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature,
                amount: paymentDetails.amount / 100,
                currency: paymentDetails.currency,
                status: 'paid'
            }
        });

        await subscription.save();

        // Update user subscription status
        await User.findByIdAndUpdate(req.user._id, {
            'subscription.isActive': true,
            'subscription.plan': plan.name.toLowerCase(),
            'subscription.startDate': startDate,
            'subscription.endDate': endDate,
            'subscription.razorpaySubscriptionId': subscription._id
        });

        res.json({
            success: true,
            message: 'Subscription activated successfully',
            subscription: {
                id: subscription._id,
                plan: subscription.plan,
                startDate,
                endDate,
                isActive: true
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
};

/**
 * Get current user's subscription status
 */
const getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isActive = user.hasActiveSubscription();

        res.json({
            isActive,
            plan: user.subscription.plan,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
            daysRemaining: isActive ?
                Math.ceil((user.subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0
        });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ message: 'Failed to fetch subscription status' });
    }
};

/**
 * Cancel user's subscription
 */
const cancelSubscription = async (req, res) => {
    try {
        // Find active subscription
        const subscription = await Subscription.findOne({
            user: req.user._id,
            isActive: true
        });

        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        // Update subscription status
        subscription.isActive = false;
        await subscription.save();

        // Update user subscription status
        await User.findByIdAndUpdate(req.user._id, {
            'subscription.isActive': false
        });

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
};

module.exports = {
    getSubscriptionPlans,
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    cancelSubscription
}; 