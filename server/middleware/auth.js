const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        // Remove 'Bearer ' from token
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            // Find user
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Set user in request
            req.user = user;
            console.log('User set in request:', req.user._id);
            req.token = token;
            req.hasActiveSubscription = user.hasActiveSubscription();
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Middleware to check if user has active subscription
const subscriptionAuth = (req, res, next) => {
    // Allow access to preview content without subscription
    if (req.query.preview === 'true') {
        req.previewOnly = true;
        return next();
    }

    // For video routes, check is done in the controller
    if (req.path.includes('/videos/')) {
        return next();
    }

    // For course routes, allow access but mark as subscription required
    // The controller will filter content based on subscription status
    next();
};

// Protect routes
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if token is expired
            if (decoded.exp && decoded.exp < Date.now() / 1000) {
                return res.status(401).json({ message: 'Token expired' });
            }

            // Add subscription status to request
            req.hasActiveSubscription = req.user.hasActiveSubscription();

            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } catch (error) {
        console.error('Error in protect middleware:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Optional auth middleware - allows access but adds user if authenticated
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');

                if (user) {
                    req.user = user;
                    req.hasActiveSubscription = user.hasActiveSubscription();
                }
            } catch (error) {
                console.error('Error verifying token in optional auth:', error);
            }
        }

        next();
    } catch (error) {
        console.error('Error in optional auth middleware:', error);
        next();
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role ${req.user.role} is not authorized to access this resource`
            });
        }

        next();
    };
};

module.exports = {
    auth,
    adminAuth,
    subscriptionAuth,
    protect,
    admin,
    optionalAuth,
    authorize
}; 