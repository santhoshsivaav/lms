const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceId: {
        type: String,
        required: true
    },
    deviceName: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'other'],
        required: true
    },
    browser: String,
    os: String,
    lastActive: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    ipAddress: String,
    location: String,
    loginHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        location: String
    }]
}, {
    timestamps: true
});

// Compound index for user and deviceId
deviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device; 