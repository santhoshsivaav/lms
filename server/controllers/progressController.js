const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get user progress for a specific course
 */
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        // Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find user progress for this course
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Look up the user's progress for this course
        const courseProgress = user.progress.find(
            progress => progress.courseId.toString() === courseId
        ) || { courseId, completedVideos: [], currentPosition: {} };

        // Calculate overall progress
        const totalVideos = course.videos.length;
        const completedVideos = courseProgress.completedVideos.length;
        const percentComplete = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

        // Find the last watched video if any
        let lastWatchedVideo = null;
        if (courseProgress.currentPosition.videoId) {
            const videoId = courseProgress.currentPosition.videoId;
            const video = course.videos.id(videoId);
            if (video) {
                lastWatchedVideo = {
                    _id: video._id,
                    title: video.title,
                    position: courseProgress.currentPosition.position || 0
                };
            }
        }

        res.json({
            courseId,
            totalVideos,
            completedVideos,
            percentComplete,
            completedVideoIds: courseProgress.completedVideos,
            lastWatchedVideo
        });
    } catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({ message: 'Failed to fetch course progress' });
    }
};

/**
 * Update progress for a specific video
 */
const updateVideoProgress = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { progress } = req.body;
        const userId = req.user._id;

        if (progress === undefined) {
            return res.status(400).json({ message: 'Progress value is required' });
        }

        // Find the course that contains this video
        const course = await Course.findOne({ 'videos._id': videoId });
        if (!course) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Get the video details to check if it exists
        const video = course.videos.id(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Update or create the progress entry for this course
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    [`progress.$[elem].currentPosition`]: {
                        videoId,
                        position: progress
                    }
                }
            },
            {
                arrayFilters: [{ 'elem.courseId': course._id }],
                new: true
            }
        );

        // If the user doesn't have a progress entry for this course yet, create one
        const user = await User.findById(userId);
        const hasCourseProgress = user.progress.some(p => p.courseId.toString() === course._id.toString());

        if (!hasCourseProgress) {
            await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        progress: {
                            courseId: course._id,
                            completedVideos: [],
                            currentPosition: {
                                videoId,
                                position: progress
                            }
                        }
                    }
                }
            );
        }

        res.json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Error updating video progress:', error);
        res.status(500).json({ message: 'Failed to update video progress' });
    }
};

/**
 * Mark a video as completed
 */
const markVideoCompleted = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        // Find the course that contains this video
        const course = await Course.findOne({ 'videos._id': videoId });
        if (!course) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Get the video details to check if it exists
        const video = course.videos.id(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Update progress for the user
        const user = await User.findById(userId);
        const courseProgressIndex = user.progress.findIndex(
            p => p.courseId.toString() === course._id.toString()
        );

        if (courseProgressIndex === -1) {
            // If no progress exists for this course, create one
            await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        progress: {
                            courseId: course._id,
                            completedVideos: [videoId],
                            currentPosition: {
                                videoId,
                                position: 0
                            }
                        }
                    }
                }
            );
        } else {
            // Check if video is already marked as completed
            const isAlreadyCompleted = user.progress[courseProgressIndex].completedVideos
                .some(id => id.toString() === videoId.toString());

            if (!isAlreadyCompleted) {
                // Add to completedVideos array if not already there
                await User.findByIdAndUpdate(
                    userId,
                    { $push: { [`progress.${courseProgressIndex}.completedVideos`]: videoId } }
                );
            }
        }

        res.json({ message: 'Video marked as completed' });
    } catch (error) {
        console.error('Error marking video as completed:', error);
        res.status(500).json({ message: 'Failed to mark video as completed' });
    }
};

/**
 * Get user's enrolled courses with progress
 */
const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user with progress data
        const user = await User.findById(userId).populate({
            path: 'progress.courseId',
            select: 'title thumbnailUrl videos category rating',
            populate: {
                path: 'instructor',
                select: 'name'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format the response
        const enrolledCourses = user.progress.map(progress => {
            const course = progress.courseId;

            if (!course) {
                return null; // Skip if course has been deleted
            }

            // Find last watched video details
            let lastWatchedVideo = null;
            if (progress.currentPosition && progress.currentPosition.videoId) {
                const videoId = progress.currentPosition.videoId;
                const video = course.videos.id(videoId);
                if (video) {
                    lastWatchedVideo = {
                        _id: video._id,
                        title: video.title
                    };
                }
            }

            return {
                _id: progress._id,
                course: {
                    _id: course._id,
                    title: course.title,
                    thumbnailUrl: course.thumbnailUrl,
                    category: course.category,
                    rating: course.rating
                },
                progress: {
                    completedVideos: progress.completedVideos.length,
                    totalVideos: course.videos.length,
                    lastWatchedVideo
                }
            };
        }).filter(Boolean); // Remove any null entries if courses were deleted

        res.json(enrolledCourses);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: 'Failed to fetch enrolled courses' });
    }
};

module.exports = {
    getCourseProgress,
    updateVideoProgress,
    markVideoCompleted,
    getEnrolledCourses
}; 