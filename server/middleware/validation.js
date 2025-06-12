const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};

// Auth validation rules
const authValidation = {
    register: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters long'),
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please enter a valid email'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    login: [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please enter a valid email'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required'),
    ],
};

// Course validation rules
const courseValidation = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long'),
        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required')
            .isLength({ min: 10 })
            .withMessage('Description must be at least 10 characters long'),
        body('category')
            .trim()
            .notEmpty()
            .withMessage('Category is required'),
        body('level')
            .trim()
            .notEmpty()
            .withMessage('Level is required')
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('Invalid level'),
        body('price')
            .notEmpty()
            .withMessage('Price is required')
            .isNumeric()
            .withMessage('Price must be a number')
            .isFloat({ min: 0 })
            .withMessage('Price must be greater than or equal to 0'),
    ],
    update: [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long'),
        body('description')
            .optional()
            .trim()
            .isLength({ min: 10 })
            .withMessage('Description must be at least 10 characters long'),
        body('level')
            .optional()
            .trim()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('Invalid level'),
        body('price')
            .optional()
            .isNumeric()
            .withMessage('Price must be a number')
            .isFloat({ min: 0 })
            .withMessage('Price must be greater than or equal to 0'),
    ],
};

// Video validation rules
const videoValidation = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long'),
        body('duration')
            .notEmpty()
            .withMessage('Duration is required')
            .isNumeric()
            .withMessage('Duration must be a number')
            .isFloat({ min: 0 })
            .withMessage('Duration must be greater than or equal to 0'),
        body('order')
            .notEmpty()
            .withMessage('Order is required')
            .isInt({ min: 0 })
            .withMessage('Order must be a non-negative integer'),
    ],
    update: [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long'),
        body('duration')
            .optional()
            .isNumeric()
            .withMessage('Duration must be a number')
            .isFloat({ min: 0 })
            .withMessage('Duration must be greater than or equal to 0'),
        body('order')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Order must be a non-negative integer'),
    ],
};

module.exports = {
    validate,
    authValidation,
    courseValidation,
    videoValidation,
}; 