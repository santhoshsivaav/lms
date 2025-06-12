const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lms-videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'webm', 'mov'],
        transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_VIDEO_SIZE) || 500000000 // 500MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/quicktime').split(',');
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, WebM, and QuickTime videos are allowed.'));
        }
    }
});

// Video streaming middleware
const videoStreaming = (req, res, next) => {
    try {
        const range = req.headers.range;
        if (!range) {
            throw new Error('Range header is required');
        }

        const videoPath = req.file.path;
        const videoSize = req.file.size;

        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        const contentLength = end - start + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, headers);
        const videoStream = cloudinary.video(videoPath, {
            start,
            end,
            resource_type: 'video'
        });

        videoStream.pipe(res);
    } catch (error) {
        error.name = 'VideoStreamingError';
        next(error);
    }
};

module.exports = {
    upload,
    videoStreaming
}; 