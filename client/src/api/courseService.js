import api from './api';

export const courseService = {
    // Get all courses
    getAllCourses: async () => {
        try {
            const response = await api.get('/courses');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch courses');
        }
    },

    // Get enrolled courses
    getEnrolledCourses: async () => {
        try {
            const response = await api.get('/courses/enrolled');
            // Return the data directly if it's an array, otherwise return an empty array
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error in getEnrolledCourses:', error);
            return [];
        }
    },

    // Get course by ID
    getCourseById: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}`);
            return response.data.data; // Return the nested data directly
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch course details');
        }
    },

    // Search courses
    searchCourses: async (query) => {
        try {
            const response = await api.get(`/courses/search?query=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to search courses');
        }
    },

    // Get video details (with watermarked URL)
    getVideoDetails: async (courseId, videoId) => {
        try {
            const response = await api.get(`/courses/${courseId}/lesson/${videoId}`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch video details');
        }
    },

    // Get video player URL
    getVideoPlayerUrl: async (courseId, lessonId) => {
        try {
            console.log('Making API call to get video player URL:', { courseId, lessonId });
            const response = await api.get(`/courses/${courseId}/player/${lessonId}`);
            console.log('Video player URL response:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch video player URL');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error in getVideoPlayerUrl:', error);
            throw error;
        }
    },

    // Get course videos
    getCourseVideos: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/videos`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch course videos');
        }
    },

    // Get user progress for a course
    getCourseProgress: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/progress`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch course progress');
        }
    },

    // Update progress for a video
    updateVideoProgress: async (videoId, progress) => {
        try {
            const response = await api.post(`/videos/${videoId}/progress`, { progress });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update video progress');
        }
    },

    // Mark video as completed
    markVideoCompleted: async (videoId) => {
        try {
            const response = await api.post(`/videos/${videoId}/complete`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to mark video as completed');
        }
    },

    // Get courses by user's categories
    getCoursesByUserCategories: async () => {
        try {
            const response = await api.get('/courses/user-categories');
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch courses by categories');
            }
            return response.data.data || []; // Return the data array or empty array if no data
        } catch (error) {
            console.error('Error fetching courses by categories:', error);
            return []; // Return empty array on error
        }
    },

    // Get lesson details
    getLessonDetails: async (courseId, lessonId) => {
        try {
            const response = await api.get(`/courses/${courseId}/lesson/${lessonId}`);
            // The server returns the lesson data directly without success/data wrapper
            if (response.data && response.data._id) {
                return response.data;
            }
            throw new Error('Invalid lesson data received');
        } catch (error) {
            console.error('Error in getLessonDetails:', error);
            throw error;
        }
    }
};

export default courseService; 