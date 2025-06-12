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
const { uploadVideo } = require('../utils/cloudinary');
const fs = require('fs');
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
        fileSize: 600 * 1024 * 1024, // 600MB limit
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

// Add new route for video upload
router.post('/upload-video', protect, admin, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const { chunkIndex, totalChunks, fileName } = req.body;
        const isLastChunk = parseInt(chunkIndex) === parseInt(totalChunks) - 1;

        // Upload to Cloudinary
        const result = await uploadVideo(req.file.path, {
            chunk_index: chunkIndex,
            total_chunks: totalChunks,
            original_filename: fileName
        });

        // Clean up the temporary file
        fs.unlinkSync(req.file.path);

        // Only return the final video URL on the last chunk
        if (isLastChunk) {
            res.json({
                success: true,
                videoUrl: result.secure_url
            });
        } else {
            res.json({
                success: true,
                message: 'Chunk uploaded successfully'
            });
        }
    } catch (error) {
        console.error('Error uploading video:', error);

        // Clean up temporary file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up temporary file:', unlinkError);
            }
        }

        // Handle specific error types
        if (error.name === 'MulterError') {
            return res.status(400).json({
                message: 'File upload error',
                error: error.message
            });
        }

        if (error.http_code === 413) {
            return res.status(413).json({
                message: 'File too large'
            });
        }

        res.status(500).json({
            message: 'Error uploading video',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router; 