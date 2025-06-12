const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'images';

        if (file.fieldname === 'video') {
            folder = 'videos';
        }

        const destPath = path.join(uploadDir, folder);

        // Create folder if it doesn't exist
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }

        cb(null, destPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
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
                return 500 * 1024 * 1024; // 500MB for videos
            }
            return 5 * 1024 * 1024; // 5MB for images
        }
    }
});

module.exports = upload; 