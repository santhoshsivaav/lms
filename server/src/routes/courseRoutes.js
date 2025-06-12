const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth, admin } = require('../../middleware/auth');

// Public routes
router.get('/', courseController.getAllCourses);

// Protected routes
router.get('/user-categories', auth, courseController.getCoursesByUserCategories);

// Parameterized routes
router.get('/:id', courseController.getCourseById);

// Protected routes (admin only)
router.post('/', auth, admin, courseController.createCourse);
router.put('/:id', auth, admin, courseController.updateCourse);
router.delete('/:id', auth, admin, courseController.deleteCourse);

module.exports = router; 