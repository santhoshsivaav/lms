const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lms-app',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'webm'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // For images
            { quality: 'auto' }, // Auto quality
        ],
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        // Accept video files
        if (
            file.mimetype === 'video/mp4' ||
            file.mimetype === 'video/mpeg' ||
            file.mimetype === 'video/quicktime' ||
            file.mimetype === 'video/x-msvideo' ||
            file.mimetype === 'video/webm'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    } else {
        // Accept image files
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/webp'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
};

// Configure upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: file => {
            if (file.fieldname === 'video') {
                return 600 * 1024 * 1024; // 600MB for videos
            }
            return 5 * 1024 * 1024; // 5MB for images
        }
    }
});

module.exports = upload; 