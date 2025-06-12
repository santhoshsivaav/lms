const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { verifyWebhook } = require('../middleware/webhookMiddleware');

// Razorpay webhook endpoint
router.post('/razorpay', verifyWebhook, webhookController.handleRazorpayWebhook);

// Subscription status update endpoint
router.post('/subscription/update', webhookController.handleSubscriptionUpdate);

module.exports = router; 