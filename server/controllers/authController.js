const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Device = require('../models/Device');
const deviceController = require('./deviceController');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, preferredCategories } = req.body;
        console.log('Registration data:', { name, email, preferredCategories }); // Debug log

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Validate categories if provided
        let validCategories = [];
        if (preferredCategories && preferredCategories.length > 0) {
            try {
                const Category = require('../models/Category');
                console.log('Validating categories:', preferredCategories); // Debug log

                validCategories = await Category.find({
                    _id: { $in: preferredCategories }
                });

                console.log('Found valid categories:', validCategories); // Debug log

                if (validCategories.length !== preferredCategories.length) {
                    console.log('Category validation failed:', {
                        requested: preferredCategories,
                        found: validCategories.map(c => c._id)
                    });
                    return res.status(400).json({
                        success: false,
                        message: 'One or more invalid categories'
                    });
                }
            } catch (error) {
                console.error('Error validating categories:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error validating categories',
                    error: error.message
                });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with validated categories
        const user = new User({
            name,
            email,
            password: hashedPassword,
            preferredCategories: validCategories.map(cat => cat._id)
        });

        console.log('User before save:', user); // Debug log
        await user.save();
        console.log('User after save:', user); // Debug log

        // Generate token
        const token = generateToken(user._id);

        // Populate categories before sending response
        const populatedUser = await User.findById(user._id).populate('preferredCategories');
        console.log('Populated user:', populatedUser);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: populatedUser._id,
                    name: populatedUser.name,
                    email: populatedUser.email,
                    role: populatedUser.role,
                    preferredCategories: populatedUser.preferredCategories
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password, deviceId, deviceName } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check device limit
        const deviceCount = await Device.countDocuments({
            user: user._id,
            isActive: true
        });

        // If device limit reached and this is a new device
        if (deviceCount >= 2 && !await Device.findOne({ user: user._id, deviceId })) {
            return res.status(403).json({
                message: 'Device limit reached. Please remove a device from your account to continue.',
                limit: 2,
                currentDevices: deviceCount
            });
        }

        // Register or update device
        const deviceResponse = await deviceController.checkAndRegisterDevice(req, res);
        if (deviceResponse.statusCode === 403) {
            return deviceResponse;
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
}; 