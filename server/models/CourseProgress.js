const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course.lessons'
    }],
    lastAccessedLesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course.lessons'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound index for course and user
courseProgressSchema.index({ course: 1, user: 1 }, { unique: true });

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);

module.exports = CourseProgress; 