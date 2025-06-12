const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { RAZORPAY_WEBHOOK_SECRET } = process.env;

const webhookController = {
    // Handle Razorpay webhooks
    handleRazorpayWebhook: async (req, res) => {
        try {
            const signature = req.headers['x-razorpay-signature'];
            const webhookBody = req.body;

            // Verify webhook signature
            const expectedSignature = crypto
                .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
                .update(JSON.stringify(webhookBody))
                .digest('hex');

            if (signature !== expectedSignature) {
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }

            const { event, payload } = webhookBody;

            switch (event) {
                case 'payment.captured':
                    await handlePaymentCaptured(payload);
                    break;

                case 'payment.failed':
                    await handlePaymentFailed(payload);
                    break;

                case 'subscription.activated':
                    await handleSubscriptionActivated(payload);
                    break;

                case 'subscription.cancelled':
                    await handleSubscriptionCancelled(payload);
                    break;

                case 'subscription.completed':
                    await handleSubscriptionCompleted(payload);
                    break;

                default:
                    console.log(`Unhandled webhook event: ${event}`);
            }

            res.status(200).json({ message: 'Webhook processed successfully' });
        } catch (error) {
            console.error('Webhook processing error:', error);
            res.status(500).json({ message: 'Error processing webhook' });
        }
    },

    // Handle subscription status updates
    handleSubscriptionUpdate: async (req, res) => {
        try {
            const { subscriptionId, status } = req.body;

            const subscription = await Subscription.findOne({ subscriptionId });
            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found' });
            }

            subscription.status = status;
            await subscription.save();

            // Update user's subscription status
            await User.findByIdAndUpdate(subscription.user, {
                'subscription.status': status
            });

            // Send email notification
            const user = await User.findById(subscription.user);
            await sendEmail({
                to: user.email,
                subject: 'Subscription Status Update',
                text: `Your subscription status has been updated to: ${status}`
            });

            res.status(200).json({ message: 'Subscription updated successfully' });
        } catch (error) {
            console.error('Subscription update error:', error);
            res.status(500).json({ message: 'Error updating subscription' });
        }
    }
};

// Helper functions for webhook events
async function handlePaymentCaptured(payload) {
    const { payment, subscription } = payload;

    try {
        // Update subscription payment status
        await Subscription.findOneAndUpdate(
            { subscriptionId: subscription.id },
            {
                'payment.status': 'completed',
                'payment.paymentId': payment.id,
                'payment.amount': payment.amount,
                'payment.currency': payment.currency,
                'payment.method': payment.method
            }
        );

        // Send payment confirmation email
        const subscriptionDoc = await Subscription.findOne({ subscriptionId: subscription.id })
            .populate('user');

        await sendEmail({
            to: subscriptionDoc.user.email,
            subject: 'Payment Successful',
            text: `Your payment of ${payment.amount / 100} ${payment.currency} has been processed successfully.`
        });
    } catch (error) {
        console.error('Error handling payment captured:', error);
        throw error;
    }
}

async function handlePaymentFailed(payload) {
    const { payment, subscription } = payload;

    try {
        // Update subscription payment status
        await Subscription.findOneAndUpdate(
            { subscriptionId: subscription.id },
            {
                'payment.status': 'failed',
                'payment.paymentId': payment.id,
                'payment.error': payment.error
            }
        );

        // Send payment failure email
        const subscriptionDoc = await Subscription.findOne({ subscriptionId: subscription.id })
            .populate('user');

        await sendEmail({
            to: subscriptionDoc.user.email,
            subject: 'Payment Failed',
            text: `Your payment of ${payment.amount / 100} ${payment.currency} has failed. Please try again.`
        });
    } catch (error) {
        console.error('Error handling payment failed:', error);
        throw error;
    }
}

async function handleSubscriptionActivated(payload) {
    const { subscription } = payload;

    try {
        // Update subscription status
        await Subscription.findOneAndUpdate(
            { subscriptionId: subscription.id },
            {
                status: 'active',
                startDate: new Date(subscription.start_at * 1000),
                endDate: new Date(subscription.end_at * 1000)
            }
        );

        // Send activation email
        const subscriptionDoc = await Subscription.findOne({ subscriptionId: subscription.id })
            .populate('user');

        await sendEmail({
            to: subscriptionDoc.user.email,
            subject: 'Subscription Activated',
            text: 'Your subscription has been activated successfully. Enjoy your learning journey!'
        });
    } catch (error) {
        console.error('Error handling subscription activated:', error);
        throw error;
    }
}

async function handleSubscriptionCancelled(payload) {
    const { subscription } = payload;

    try {
        // Update subscription status
        await Subscription.findOneAndUpdate(
            { subscriptionId: subscription.id },
            {
                status: 'cancelled',
                cancelledAt: new Date()
            }
        );

        // Send cancellation email
        const subscriptionDoc = await Subscription.findOne({ subscriptionId: subscription.id })
            .populate('user');

        await sendEmail({
            to: subscriptionDoc.user.email,
            subject: 'Subscription Cancelled',
            text: 'Your subscription has been cancelled. We hope to see you again soon!'
        });
    } catch (error) {
        console.error('Error handling subscription cancelled:', error);
        throw error;
    }
}

async function handleSubscriptionCompleted(payload) {
    const { subscription } = payload;

    try {
        // Update subscription status
        await Subscription.findOneAndUpdate(
            { subscriptionId: subscription.id },
            {
                status: 'completed',
                completedAt: new Date()
            }
        );

        // Send completion email
        const subscriptionDoc = await Subscription.findOne({ subscriptionId: subscription.id })
            .populate('user');

        await sendEmail({
            to: subscriptionDoc.user.email,
            subject: 'Subscription Completed',
            text: 'Your subscription period has ended. Renew your subscription to continue learning!'
        });
    } catch (error) {
        console.error('Error handling subscription completed:', error);
        throw error;
    }
}

module.exports = webhookController; 