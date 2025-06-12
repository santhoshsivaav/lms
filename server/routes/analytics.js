const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

// Get overall analytics
router.get('/overall', protect, authorize('admin'), async (req, res) => {
    try {
        const [
            totalUsers,
            totalCourses,
            totalSubscribers,
            totalRevenue
        ] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments(),
            User.countDocuments({ 'subscription.isActive': true }),
            User.aggregate([
                {
                    $match: {
                        'subscription.paymentHistory': { $exists: true }
                    }
                },
                {
                    $unwind: '$subscription.paymentHistory'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$subscription.paymentHistory.amount' }
                    }
                }
            ])
        ]);

        // Get user growth over time
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.json({
            totalUsers,
            totalCourses,
            totalSubscribers,
            totalRevenue: totalRevenue[0]?.total || 0,
            userGrowth: userGrowth.map(item => ({
                date: `${item._id.year}-${item._id.month}`,
                count: item.count
            }))
        });
    } catch (error) {
        console.error('Error fetching overall analytics:', error);
        res.status(500).json({ message: 'Failed to fetch overall analytics' });
    }
});

// Get course analytics
router.get('/courses', protect, authorize('admin'), async (req, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'enrolledStudents',
                    foreignField: '_id',
                    as: 'enrolledUsers'
                }
            },
            {
                $project: {
                    title: 1,
                    totalStudents: 1,
                    rating: 1,
                    totalLessons: 1,
                    enrolledCount: { $size: '$enrolledUsers' },
                    completionRate: {
                        $cond: {
                            if: { $eq: ['$totalLessons', 0] },
                            then: 0,
                            else: {
                                $divide: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: '$enrolledUsers',
                                                as: 'user',
                                                cond: {
                                                    $eq: [
                                                        { $size: '$user.progress.completedLessons' },
                                                        '$totalLessons'
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    { $max: ['$totalStudents', 1] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $sort: { enrolledCount: -1 }
            }
        ]);

        res.json({
            courses,
            totalEnrollments: courses.reduce((sum, course) => sum + course.enrolledCount, 0),
            averageCompletionRate: courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length
        });
    } catch (error) {
        console.error('Error fetching course analytics:', error);
        res.status(500).json({ message: 'Failed to fetch course analytics' });
    }
});

// Get revenue analytics
router.get('/revenue', protect, authorize('admin'), async (req, res) => {
    try {
        const monthlyRevenue = await User.aggregate([
            {
                $match: {
                    'subscription.paymentHistory': { $exists: true }
                }
            },
            {
                $unwind: '$subscription.paymentHistory'
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$subscription.paymentHistory.date' },
                        month: { $month: '$subscription.paymentHistory.date' }
                    },
                    revenue: { $sum: '$subscription.paymentHistory.amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
        const averageRevenue = totalRevenue / monthlyRevenue.length || 0;

        res.json({
            monthlyRevenue: monthlyRevenue.map(item => ({
                date: `${item._id.year}-${item._id.month}`,
                revenue: item.revenue
            })),
            totalRevenue,
            averageRevenue
        });
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        res.status(500).json({ message: 'Failed to fetch revenue analytics' });
    }
});

// Get user analytics
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    newUsers: { $sum: 1 },
                    activeSubscriptions: {
                        $sum: {
                            $cond: [
                                { $eq: ['$subscription.isActive', true] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        const subscriptionStats = await User.aggregate([
            {
                $match: {
                    'subscription.isActive': true
                }
            },
            {
                $group: {
                    _id: '$subscription.plan',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            userGrowth: userStats.map(item => ({
                date: `${item._id.year}-${item._id.month}`,
                newUsers: item.newUsers,
                activeSubscriptions: item.activeSubscriptions
            })),
            subscriptionStats: subscriptionStats.map(item => ({
                plan: item._id,
                count: item.count
            }))
        });
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({ message: 'Failed to fetch user analytics' });
    }
});

module.exports = router; 