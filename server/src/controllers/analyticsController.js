const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const Subscription = require('../models/Subscription');

const analyticsController = {
    // Get overall analytics
    getOverallAnalytics: async (req, res) => {
        try {
            const [
                totalUsers,
                activeSubscriptions,
                totalRevenue,
                courseEngagement
            ] = await Promise.all([
                User.countDocuments(),
                Subscription.countDocuments({ status: 'active' }),
                Subscription.aggregate([
                    { $match: { 'payment.status': 'completed' } },
                    { $group: { _id: null, total: { $sum: '$payment.amount' } } }
                ]),
                Course.aggregate([
                    { $unwind: '$videos' },
                    { $group: { _id: null, totalViews: { $sum: '$videos.views' } } }
                ])
            ]);

            res.json({
                totalUsers,
                activeSubscriptions,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalVideoViews: courseEngagement[0]?.totalViews || 0
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching analytics' });
        }
    },

    // Get user growth analytics
    getUserGrowth: async (req, res) => {
        try {
            const { period = 'month' } = req.query;
            const startDate = new Date();

            switch (period) {
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
            }

            const userGrowth = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: period === 'week' ? '%Y-%m-%d' : '%Y-%m',
                                date: '$createdAt'
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.json(userGrowth);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user growth' });
        }
    },

    // Get course analytics
    getCourseAnalytics: async (req, res) => {
        try {
            const courseAnalytics = await Course.aggregate([
                {
                    $lookup: {
                        from: 'videos',
                        localField: 'videos',
                        foreignField: '_id',
                        as: 'videoDetails'
                    }
                },
                {
                    $project: {
                        title: 1,
                        totalViews: { $sum: '$videoDetails.views' },
                        totalDuration: { $sum: '$videoDetails.duration' },
                        videoCount: { $size: '$videoDetails' }
                    }
                },
                { $sort: { totalViews: -1 } }
            ]);

            res.json(courseAnalytics);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching course analytics' });
        }
    },

    // Get revenue analytics
    getRevenueAnalytics: async (req, res) => {
        try {
            const { period = 'month' } = req.query;
            const startDate = new Date();

            switch (period) {
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
            }

            const revenueAnalytics = await Subscription.aggregate([
                {
                    $match: {
                        'payment.status': 'completed',
                        'payment.createdAt': { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: period === 'week' ? '%Y-%m-%d' : '%Y-%m',
                                date: '$payment.createdAt'
                            }
                        },
                        revenue: { $sum: '$payment.amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.json(revenueAnalytics);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching revenue analytics' });
        }
    },

    // Get video engagement analytics
    getVideoEngagement: async (req, res) => {
        try {
            const videoEngagement = await Video.aggregate([
                {
                    $lookup: {
                        from: 'courses',
                        localField: '_id',
                        foreignField: 'videos',
                        as: 'courseDetails'
                    }
                },
                {
                    $project: {
                        title: 1,
                        views: 1,
                        duration: 1,
                        courseTitle: { $arrayElemAt: ['$courseDetails.title', 0] }
                    }
                },
                { $sort: { views: -1 } },
                { $limit: 10 }
            ]);

            res.json(videoEngagement);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching video engagement' });
        }
    }
};

module.exports = analyticsController; 