const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Subscription plans configuration
const subscriptionPlans = {
    basic: {
        name: 'Basic Plan',
        amount: 499,
        duration: 30, // days
        features: [
            'Access to all courses',
            'HD video quality',
            'Download videos',
            '24/7 support',
        ],
    },
    premium: {
        name: 'Premium Plan',
        amount: 999,
        duration: 90, // days
        features: [
            'Access to all courses',
            '4K video quality',
            'Download videos',
            '24/7 priority support',
            'Early access to new courses',
        ],
    },
};

// Create a new order
const createOrder = async (planId) => {
    try {
        const plan = subscriptionPlans[planId];
        if (!plan) {
            throw new Error('Invalid plan selected');
        }

        const options = {
            amount: plan.amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan: planId,
        };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
};

// Verify payment signature
const verifyPayment = (orderId, paymentId, signature) => {
    try {
        const text = `${orderId}|${paymentId}`;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generatedSignature === signature;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};

// Calculate subscription end date
const calculateEndDate = (planId) => {
    const plan = subscriptionPlans[planId];
    if (!plan) {
        throw new Error('Invalid plan selected');
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);
    return endDate;
};

module.exports = {
    razorpay,
    subscriptionPlans,
    createOrder,
    verifyPayment,
    calculateEndDate,
}; 