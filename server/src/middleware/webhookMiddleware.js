const crypto = require('crypto');
const { RAZORPAY_WEBHOOK_SECRET } = process.env;

const verifyWebhook = (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            return res.status(400).json({ message: 'No signature found in request' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        next();
    } catch (error) {
        console.error('Webhook verification error:', error);
        res.status(500).json({ message: 'Error verifying webhook' });
    }
};

module.exports = {
    verifyWebhook,
}; 