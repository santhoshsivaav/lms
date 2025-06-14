import api from '../api/api';

export const courseService = {
    // Get all published courses
    getAllCourses: async () => {
        try {
            console.log('Making API call to fetch courses...');
            const response = await api.get('/courses');
            console.log('API Response:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch courses');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error in getAllCourses:', error);
            throw error;
        }
    },

    // Get course by ID with videos
    getCourseById: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch course');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error in getCourseById:', error);
            throw error;
        }
    },

    // Get video details with watermarked URL
    getVideoDetails: async (courseId, videoId) => {
        try {
            console.log('Fetching video details:', { courseId, videoId });
            const response = await api.get(`/courses/${courseId}/lesson/${videoId}`);
            console.log('Response:', response);

            // Check if we have a valid response - the API might return the data directly
            if (response.data) {
                // Check if the response follows the success/data structure
                if (response.data.success === false) {
                    throw new Error(response.data.message || 'Failed to fetch video details');
                }

                // If the response directly contains the video data (no success/data wrapper)
                if (response.data.content && response.data._id) {
                    return response.data;
                }

                // If the response follows the standard success/data structure
                if (response.data.data) {
                    if (!response.data.data.content?.videoUrl) {
                        throw new Error('Video URL not found in lesson content');
                    }
                    return response.data.data;
                }
            }

            throw new Error('Invalid response structure from API');
        } catch (error) {
            console.error('Error in getVideoDetails:', error);
            throw error;
        }
    },

    // Get course progress
    getCourseProgress: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/progress`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch course progress');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error in getCourseProgress:', error);
            throw error;
        }
    },

    // Get all progress for a user
    getProgress: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/progress`);
            console.log('Progress response:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch progress');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error in getProgress:', error);
            throw error;
        }
    },

    // Get video progress
    getVideoProgress: async (courseId, videoId) => {
        try {
            const response = await api.get(`/courses/${courseId}/lesson/${videoId}/progress`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch video progress');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error in getVideoProgress:', error);
            throw error;
        }
    },

    // Update video progress
    updateVideoProgress: async (courseId, videoId, progress) => {
        try {
            const response = await api.post(`/courses/${courseId}/lesson/${videoId}/progress`, { progress });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update video progress');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error in updateVideoProgress:', error);
            throw error;
        }
    },

    // Mark video as completed
    markVideoCompleted: async (courseId, videoId) => {
        try {
            console.log(`Marking video as completed - courseId: ${courseId}, lessonId: ${videoId}`);

            // Send proper payload with lessonId to fix the validation error
            const payload = {
                lessonId: videoId
            };

            const response = await api.post(`/courses/${courseId}/lesson/${videoId}/complete`, payload);
            console.log('Mark completed response:', response.data);

            if (!response.data.success) {
                console.error('API returned error:', response.data);
                throw new Error(response.data.message || 'Failed to mark video as completed');
            }
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error in markVideoCompleted:', error);
            // Return more detailed error information
            return {
                success: false,
                error: error.message || 'Unknown error marking video as completed'
            };
        }
    },

    // Search courses
    searchCourses: async (query) => {
        try {
            const response = await api.get(`/courses/search?query=${encodeURIComponent(query)}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to search courses');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error in searchCourses:', error);
            throw error;
        }
    },

    // Get enrolled courses
    getEnrolledCourses: async () => {
        try {
            console.log('Fetching enrolled courses...');
            const response = await api.get('/courses/enrolled');
            console.log('Enrolled courses response:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch enrolled courses');
            }

            // Return empty array if no courses are found
            return response.data.data || [];
        } catch (error) {
            console.error('Error in getEnrolledCourses:', error);
            // Return empty array instead of throwing error
            return [];
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

    // Get courses by category
    getCoursesByCategory: async (categoryId) => {
        try {
            const response = await api.get(`/courses/category/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get recommended courses based on user's preferred categories
    getRecommendedCourses: async () => {
        try {
            const response = await api.get('/courses/recommended');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new course (admin only)
    createCourse: async (courseData) => {
        try {
            const response = await api.post('/courses', courseData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update course (admin only)
    updateCourse: async (id, courseData) => {
        try {
            const response = await api.put(`/courses/${id}`, courseData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete course (admin only)
    deleteCourse: async (id) => {
        try {
            const response = await api.delete(`/courses/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Enroll in course
    enrollInCourse: async (courseId) => {
        try {
            const response = await api.post(`/courses/${courseId}/enroll`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get original lesson content directly from course data
    getOriginalLessonContent: async (courseId, lessonId) => {
        try {
            console.log('Fetching original lesson content for:', { courseId, lessonId });
            // Get the full course data
            const courseResponse = await api.get(`/courses/${courseId}`);

            if (!courseResponse.data.success) {
                throw new Error(courseResponse.data.message || 'Failed to fetch course data');
            }

            const course = courseResponse.data.data;

            // Find the lesson in the course modules
            let lessonContent = null;
            if (course && course.modules) {
                for (const module of course.modules) {
                    if (module.lessons) {
                        const lesson = module.lessons.find(l => l._id === lessonId);
                        if (lesson) {
                            console.log('Found original lesson content:', lesson);
                            lessonContent = lesson;
                            break;
                        }
                    }
                }
            }

            if (!lessonContent) {
                throw new Error('Lesson not found in course data');
            }

            return lessonContent;
        } catch (error) {
            console.error('Error in getOriginalLessonContent:', error);
            throw error;
        }
    },
}; 