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
                totalCourses,
                activeSubscriptions,
                totalRevenue
            ] = await Promise.all([
                User.countDocuments(),
                Course.countDocuments(),
                Subscription.countDocuments({ status: 'active' }),
                Subscription.aggregate([
                    { $match: { 'payment.status': 'completed' } },
                    { $group: { _id: null, total: { $sum: '$payment.amount' } } }
                ])
            ]);

            res.json({
                success: true,
                data: {
                    totalUsers,
                    totalCourses,
                    activeSubscriptions,
                    totalRevenue: totalRevenue[0]?.total || 0
                }
            });
        } catch (error) {
            console.error('Error in getOverallAnalytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching overall analytics'
            });
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
                        users: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.json({
                success: true,
                data: userGrowth.map(item => ({
                    date: item._id,
                    users: item.users
                }))
            });
        } catch (error) {
            console.error('Error in getUserGrowth:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching user growth analytics'
            });
        }
    },

    // Get course analytics
    getCourseAnalytics: async (req, res) => {
        try {
            const courseStats = await Course.aggregate([
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
                        name: '$title',
                        value: { $size: '$videoDetails' }
                    }
                }
            ]);

            res.json({
                success: true,
                data: courseStats
            });
        } catch (error) {
            console.error('Error in getCourseAnalytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching course analytics'
            });
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
                        revenue: { $sum: '$payment.amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.json({
                success: true,
                data: revenueAnalytics.map(item => ({
                    date: item._id,
                    revenue: item.revenue
                }))
            });
        } catch (error) {
            console.error('Error in getRevenueAnalytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching revenue analytics'
            });
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

            res.json({
                success: true,
                data: videoEngagement
            });
        } catch (error) {
            console.error('Error in getVideoEngagement:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching video engagement analytics'
            });
        }
    }
};

module.exports = analyticsController; 