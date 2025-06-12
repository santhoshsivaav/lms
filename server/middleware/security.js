const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Security middleware
const securityMiddleware = [
    // Set security HTTP headers
    helmet(),
    
    // Data sanitization against XSS
    xss(),
    
    // Data sanitization against NoSQL query injection
    mongoSanitize(),
    
    // Prevent parameter pollution
    hpp(),
];

module.exports = securityMiddleware; 