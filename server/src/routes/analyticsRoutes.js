const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// All analytics routes require admin authentication
router.use(authenticateToken, isAdmin);

// Get overall analytics
router.get('/overall', analyticsController.getOverallAnalytics);

// Get user growth analytics
router.get('/users/growth', analyticsController.getUserGrowth);

// Get course analytics
router.get('/courses', analyticsController.getCourseAnalytics);

// Get revenue analytics
router.get('/revenue', analyticsController.getRevenueAnalytics);

// Get video engagement analytics
router.get('/videos/engagement', analyticsController.getVideoEngagement);

module.exports = router; 