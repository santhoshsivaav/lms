const { upload, deleteFile } = require('../utils/cloudinary');

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
}; 