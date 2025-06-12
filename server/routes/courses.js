const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByCategory,
    getRecommendedCourses
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/auth');
const Course = require('../models/Course');
const cloudinary = require('cloudinary').v2;
// const { getEnrolledCourses: progressGetEnrolledCourses } = require('../controllers/progressController');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/') ||
            file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only videos, images, and PDFs are allowed.'));
        }
    }
});

// Public routes
router.get('/', getAllCourses);
router.get('/recommended', protect, getRecommendedCourses);
router.get('/category/:categoryId', getCoursesByCategory);
router.get('/:id', getCourseById);

// Protected routes - authentication required
// (Add more as needed, but only if implemented in the controller)

// Admin routes
router.post('/', protect, admin, upload.single('thumbnail'), createCourse);
router.put('/:id', protect, admin, upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

module.exports = router; 