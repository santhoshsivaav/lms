const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema for tracking lesson progress within a course
const lessonProgressSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    lastPosition: {
        type: Number,
        default: 0
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    }
});

// Schema for tracking course progress
const courseProgressSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    lessonProgress: [lessonProgressSchema],
    overallProgress: {
        type: Number,
        default: 0
    }
}, { _id: true });

// Schema for subscription details
const subscriptionSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        default: false
    },
    plan: {
        type: String,
        enum: ['basic', 'premium', null],
        default: null
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    razorpaySubscriptionId: {
        type: String,
        default: null
    },
    razorpayCustomerId: {
        type: String,
        default: null
    },
    paymentHistory: [{
        amount: Number,
        currency: String,
        paymentId: String,
        date: Date
    }]
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: null
    },
    preferredCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    }],
    subscription: subscriptionSchema,
    progress: [courseProgressSchema],
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        }
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            // Initialize subscription if it doesn't exist
            if (!this.subscription) {
                this.subscription = {
                    isActive: false,
                    plan: null,
                    startDate: null,
                    endDate: null,
                    razorpaySubscriptionId: null,
                    razorpayCustomerId: null,
                    paymentHistory: []
                };
            }
            return next();
        }
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if subscription is active
userSchema.methods.hasActiveSubscription = function () {
    try {
        if (!this.subscription) {
            return false;
        }
        return Boolean(
            this.subscription.isActive &&
            this.subscription.endDate &&
            new Date(this.subscription.endDate) > new Date()
        );
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
};

// Method to get course progress
userSchema.methods.getCourseProgress = function (courseId) {
    const progress = this.progress.find(p => p.courseId.toString() === courseId.toString());
    if (!progress) return null;

    return {
        enrolledAt: progress.enrolledAt,
        lastAccessed: progress.lastAccessed,
        completedLessons: progress.completedLessons,
        overallProgress: progress.overallProgress
    };
};

// Method to update course progress
userSchema.methods.updateCourseProgress = async function (courseId, lessonId, completed = false, position = 0) {
    const progress = this.progress.find(p => p.courseId.toString() === courseId.toString());
    if (!progress) return null;

    const lessonProgress = progress.lessonProgress.find(lp => lp.lessonId.toString() === lessonId.toString());
    if (lessonProgress) {
        lessonProgress.completed = completed;
        lessonProgress.lastPosition = position;
        lessonProgress.lastAccessed = new Date();
    } else {
        progress.lessonProgress.push({
            lessonId,
            completed,
            lastPosition: position,
            lastAccessed: new Date()
        });
    }

    if (completed && !progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
    }

    progress.lastAccessed = new Date();
    await this.save();
    return progress;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 