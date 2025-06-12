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
        fileSize: 600 * 1024 * 1024, // 600MB limit
    },
});

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImage = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'image',
            quality: 'auto'
        });
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Upload a video to Cloudinary
 * @param {string} videoPath - Path to the video file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadVideo = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            chunk_size: 10000000, // 10MB chunks for better performance with large files
            eager: [
                { format: 'mp4', quality: 'auto' }
            ],
            eager_async: true,
            timeout: 120000, // 120 seconds timeout for large files
            upload_preset: 'video_upload',
            resource_type: 'video',
            invalidate: true,
            use_filename: true,
            unique_filename: true,
            overwrite: true
        });
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
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