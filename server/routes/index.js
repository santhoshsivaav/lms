const express = require('express');
const router = express.Router();
const { validate, authValidation, courseValidation, videoValidation } = require('../middleware/validation');
const { auth, adminAuth, subscriptionAuth } = require('../middleware/auth');
const {
    register,
    login,
    getProfile,
} = require('../controllers/authController');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addVideo,
    updateVideo,
    deleteVideo,
    getAllVideos,
} = require('../controllers/courseController');
const {
    getSubscriptionPlans,
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    cancelSubscription,
} = require('../controllers/subscriptionController');
const {
    uploadFile,
    uploadMultipleFiles,
    deleteUploadedFile,
    uploadVideo,
} = require('../controllers/uploadController');
const {
    getCourseProgress,
    updateVideoProgress,
    markVideoCompleted,
    getEnrolledCourses
} = require('../controllers/progressController');
const analyticsController = require('../controllers/analyticsController');
const upload = require('../middleware/upload');

// Auth routes
router.post('/auth/register', authValidation.register, validate, register);
router.post('/auth/login', authValidation.login, validate, login);
router.get('/auth/profile', auth, getProfile);

// Course routes
router.get('/courses', getAllCourses);
router.get('/courses/:id', auth, getCourseById);
router.post('/courses', auth, adminAuth, courseValidation.create, validate, createCourse);
router.put('/courses/:id', auth, adminAuth, courseValidation.update, validate, updateCourse);
router.delete('/courses/:id', auth, adminAuth, deleteCourse);

// Course video routes
router.get('/courses/videos', auth, adminAuth, getAllVideos);
router.post('/courses/upload-video', auth, adminAuth, upload.single('video'), uploadVideo);
router.post('/courses/:id/videos', auth, adminAuth, videoValidation.create, validate, addVideo);
router.put('/courses/:id/videos/:videoId', auth, adminAuth, videoValidation.update, validate, updateVideo);
router.delete('/courses/:id/videos/:videoId', auth, adminAuth, deleteVideo);

// Subscription routes
router.get('/subscriptions/plans', getSubscriptionPlans);
router.post('/subscriptions/order', auth, createOrder);
router.post('/subscriptions/verify', auth, verifyPayment);
router.get('/subscriptions/status', auth, getSubscriptionStatus);
router.post('/subscriptions/cancel', auth, cancelSubscription);

// Upload routes
router.post('/upload', auth, uploadFile);
router.post('/upload/multiple', auth, uploadMultipleFiles);
router.delete('/upload/:publicId', auth, deleteUploadedFile);

// Progress tracking routes
router.get('/courses/:courseId/progress', auth, subscriptionAuth, getCourseProgress);
router.post('/videos/:videoId/progress', auth, subscriptionAuth, updateVideoProgress);
router.post('/videos/:videoId/complete', auth, subscriptionAuth, markVideoCompleted);
router.get('/user/enrolled-courses', auth, getEnrolledCourses);

// Analytics routes (admin only)
router.get('/analytics/overall', auth, adminAuth, analyticsController.getOverallAnalytics);
router.get('/analytics/users/growth', auth, adminAuth, analyticsController.getUserGrowth);
router.get('/analytics/courses', auth, adminAuth, analyticsController.getCourseAnalytics);
router.get('/analytics/revenue', auth, adminAuth, analyticsController.getRevenueAnalytics);
router.get('/analytics/videos/engagement', auth, adminAuth, analyticsController.getVideoEngagement);

module.exports = router; 