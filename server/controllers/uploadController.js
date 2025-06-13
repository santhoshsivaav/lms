const { deleteFile } = require('../utils/cloudinary');

// Upload single file
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: req.file.path,
                publicId: req.file.filename,
            },
        });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file',
        });
    }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded',
            });
        }

        const files = req.files.map((file) => ({
            url: file.path,
            publicId: file.filename,
        }));

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: files,
        });
    } catch (error) {
        console.error('Upload multiple files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload files',
        });
    }
};

// Upload video file
const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const { chunkIndex, totalChunks, fileName } = req.body;
        const isLastChunk = parseInt(chunkIndex) === parseInt(totalChunks) - 1;

        // The file is already uploaded to Cloudinary by multer-storage-cloudinary
        // We just need to return the URL
        if (isLastChunk) {
            res.json({
                success: true,
                videoUrl: req.file.path
            });
        } else {
            res.json({
                success: true,
                message: 'Chunk uploaded successfully'
            });
        }
    } catch (error) {
        console.error('Error uploading video:', error);

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
};

// Delete file
const deleteUploadedFile = async (req, res) => {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID is required',
            });
        }

        await deleteFile(publicId);

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
        });
    }
};

module.exports = {
    uploadFile,
    uploadMultipleFiles,
    deleteUploadedFile,
    uploadVideo
}; 