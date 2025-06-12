const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lms-app',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // For images
            { quality: 'auto' }, // Auto quality
        ],
    },
});

// Configure upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
});

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImage = async (imagePath, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'lms-app/images',
            resource_type: 'image',
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        };

        const result = await cloudinary.uploader.upload(
            imagePath,
            { ...defaultOptions, ...options }
        );

        return result;
    } catch (error) {
        console.error('Cloudinary image upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

/**
 * Upload a video to Cloudinary
 * @param {string} videoPath - Path to the video file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadVideo = async (videoPath, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'lms-app/videos',
            resource_type: 'video',
            eager: [
                {
                    format: 'mp4',
                    transformation: [
                        { quality: 'auto' },
                        { streaming_profile: 'hd' }
                    ]
                }
            ],
            eager_async: true,
            eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL
        };

        const result = await cloudinary.uploader.upload(
            videoPath,
            { ...defaultOptions, ...options }
        );

        return result;
    } catch (error) {
        console.error('Cloudinary video upload error:', error);
        throw new Error('Failed to upload video to Cloudinary');
    }
};

/**
 * Generate a watermarked video URL
 * @param {string} videoUrl - Original video URL
 * @param {string} watermark - Watermark text
 * @returns {string} - Watermarked video URL
 */
const generateWatermarkedVideoUrl = (videoUrl, watermark) => {
    try {
        const publicId = videoUrl.split('/').pop().split('.')[0];
        return cloudinary.url(publicId, {
            resource_type: 'video',
            transformation: [
                {
                    overlay: {
                        font_family: 'Arial',
                        font_size: 60,
                        text: watermark
                    },
                    color: '#ffffff',
                    opacity: 50
                }
            ]
        });
    } catch (error) {
        console.error('Error generating watermarked URL:', error);
        return videoUrl; // Return original URL if watermarking fails
    }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary delete result
 */
const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file from Cloudinary');
    }
};

module.exports = {
    cloudinary,
    upload,
    deleteFile,
    uploadImage,
    uploadVideo,
    generateWatermarkedVideoUrl
}; 