const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile, uploadMiddleware } = require('../controllers/uploadController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Upload route (admin only)
router.post('/', adminAuth, uploadMiddleware, uploadFile);

// Delete route (admin only)
router.delete('/', adminAuth, deleteFile);

module.exports = router; 