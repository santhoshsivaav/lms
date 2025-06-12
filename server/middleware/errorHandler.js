// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token. Please log in again.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Your token has expired. Please log in again.'
        });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({
            status: 'error',
            message: 'File upload error',
            error: err.message
        });
    }

    // Handle video streaming errors
    if (err.name === 'VideoStreamingError') {
        return res.status(400).json({
            status: 'error',
            message: 'Video streaming error',
            error: err.message
        });
    }

    // Default error
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler; 