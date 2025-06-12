const Course = require('../../models/Course');
const { generateWatermarkedVideoUrl } = require('../../utils/cloudinary');
const CourseProgress = require('../../models/CourseProgress');

const courseController = {
    // Get all courses
    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find().sort({ createdAt: -1 });
            res.json({ data: courses });
        } catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({ message: 'Error fetching courses' });
        }
    },

    // Get course by ID
    getCourseById: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json({ data: course });
        } catch (error) {
            console.error('Error fetching course:', error);
            res.status(500).json({ message: 'Error fetching course' });
        }
    },

    // Create new course
    createCourse: async (req, res) => {
        try {
            // Debug log
            console.log('Received request body:', JSON.stringify(req.body, null, 2));

            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Only admins can create courses' });
            }

            // Validate required fields
            const { title, description, thumbnail, modules, tags, skills } = req.body;

            // Debug log for each required field
            console.log('Required fields:', {
                title: !!title,
                description: !!description,
                thumbnail: !!thumbnail,
                hasModules: !!modules,
                modulesLength: modules?.length
            });

            // Validate basic course fields
            if (!title || !description || !thumbnail) {
                return res.status(400).json({
                    message: 'Missing required fields: title, description, and thumbnail are required',
                    missing: {
                        title: !title,
                        description: !description,
                        thumbnail: !thumbnail
                    }
                });
            }

            // Validate modules
            if (!modules || !Array.isArray(modules) || modules.length === 0) {
                return res.status(400).json({
                    message: 'At least one module is required',
                    modules: modules
                });
            }

            // Validate each module
            for (const module of modules) {
                if (!module.title || !module.description || !module.order) {
                    return res.status(400).json({
                        message: 'Each module must have title, description, and order',
                        module: module
                    });
                }

                // Validate lessons in each module
                if (!module.lessons || !Array.isArray(module.lessons) || module.lessons.length === 0) {
                    return res.status(400).json({
                        message: `Module "${module.title}" must have at least one lesson`,
                        module: module
                    });
                }

                // Validate each lesson
                for (const lesson of module.lessons) {
                    if (!lesson.title || !lesson.description || !lesson.order) {
                        return res.status(400).json({
                            message: `Lesson in module "${module.title}" must have title, description, and order`,
                            lesson: lesson
                        });
                    }
                }
            }

            // Create the course with the exact structure
            const course = new Course({
                title,
                description,
                thumbnail,
                tags: tags || [],
                skills: skills || [],
                modules: modules.map(module => ({
                    title: module.title,
                    description: module.description,
                    order: module.order,
                    lessons: module.lessons.map(lesson => ({
                        title: lesson.title,
                        description: lesson.description,
                        type: lesson.type || 'video',
                        content: {
                            videoUrl: lesson.content?.videoUrl || lesson.videoUrl
                        },
                        order: lesson.order
                    }))
                })),
                createdBy: req.user._id
            });

            await course.save();
            res.status(201).json({ data: course });
        } catch (error) {
            console.error('Error creating course:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: error.message,
                    errors: error.errors
                });
            }
            res.status(500).json({ message: 'Error creating course' });
        }
    },

    // Update course
    updateCourse: async (req, res) => {
        try {
            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Only admins can update courses' });
            }

            const course = await Course.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updatedBy: req.user._id },
                { new: true, runValidators: true }
            );

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json({ data: course });
        } catch (error) {
            console.error('Error updating course:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating course' });
        }
    },

    // Delete course
    deleteCourse: async (req, res) => {
        try {
            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Only admins can delete courses' });
            }

            const course = await Course.findByIdAndDelete(req.params.id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json({ message: 'Course deleted successfully' });
        } catch (error) {
            console.error('Error deleting course:', error);
            res.status(500).json({ message: 'Error deleting course' });
        }
    },

    // Get video details with watermark
    getVideoDetails: async (req, res) => {
        try {
            const { courseId, videoId } = req.params;
            console.log('Fetching video details:', { courseId, videoId });

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            // Find the video in the course modules
            let video = null;
            for (const module of course.modules) {
                const foundVideo = module.lessons.find(lesson => lesson._id.toString() === videoId);
                if (foundVideo) {
                    video = {
                        ...foundVideo.toObject(),
                        videoUrl: foundVideo.content.videoUrl // Extract videoUrl from content
                    };
                    break;
                }
            }

            if (!video) {
                return res.status(404).json({
                    success: false,
                    message: 'Video not found in course'
                });
            }

            // Generate watermarked URL if user is logged in
            if (req.user) {
                const watermarkedUrl = await generateWatermarkedVideoUrl(
                    video.videoUrl,
                    req.user.email
                );
                video.videoUrl = watermarkedUrl;
            }

            res.json({
                success: true,
                data: video
            });
        } catch (error) {
            console.error('Error fetching video details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch video details',
                error: error.message
            });
        }
    },

    // Search courses
    searchCourses: async (req, res) => {
        try {
            const { query } = req.query;
            const courses = await Course.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } }
                ]
            });
            res.json({ data: courses });
        } catch (error) {
            console.error('Error searching courses:', error);
            res.status(500).json({ message: 'Error searching courses' });
        }
    },

    // Get all videos (admin only)
    getAllVideos: async (req, res) => {
        try {
            const courses = await Course.find().select('modules.lessons');
            const allVideos = courses.flatMap(course =>
                course.modules.flatMap(module =>
                    module.lessons.map(lesson => ({
                        courseId: course._id,
                        courseTitle: course.title,
                        moduleTitle: module.title,
                        ...lesson.toObject()
                    }))
                )
            );
            res.json({ data: allVideos });
        } catch (error) {
            console.error('Error fetching all videos:', error);
            res.status(500).json({ message: 'Error fetching videos' });
        }
    },

    // Get enrolled courses for a user
    getEnrolledCourses: async (req, res) => {
        try {
            const courses = await Course.find({
                'enrolledStudents': req.user._id
            }).sort({ createdAt: -1 });
            res.json({ data: courses });
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            res.status(500).json({ message: 'Error fetching enrolled courses' });
        }
    },

    // Get video player URL with watermark
    getVideoPlayerUrl: async (req, res) => {
        try {
            const { courseId, lessonId } = req.params;
            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            let lesson = null;
            for (const module of course.modules) {
                const foundLesson = module.lessons.find(l => l._id.toString() === lessonId);
                if (foundLesson) {
                    lesson = foundLesson;
                    break;
                }
            }

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            // Generate watermarked URL
            const watermarkedUrl = await generateWatermarkedVideoUrl(
                lesson.content.videoUrl,
                req.user.email
            );

            res.json({ data: { videoUrl: watermarkedUrl } });
        } catch (error) {
            console.error('Error getting video player URL:', error);
            res.status(500).json({ message: 'Error getting video URL' });
        }
    },

    // Get lesson details
    getLessonDetails: async (req, res) => {
        try {
            const { courseId, lessonId } = req.params;
            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            let lesson = null;
            for (const module of course.modules) {
                const foundLesson = module.lessons.find(l => l._id.toString() === lessonId);
                if (foundLesson) {
                    lesson = foundLesson;
                    break;
                }
            }

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json({ data: lesson });
        } catch (error) {
            console.error('Error getting lesson details:', error);
            res.status(500).json({ message: 'Error getting lesson details' });
        }
    },

    // Add video to course
    addVideo: async (req, res) => {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Only admins can add videos' });
            }

            const { courseId } = req.params;
            const { moduleId, title, description, videoUrl, order } = req.body;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const module = course.modules.id(moduleId);
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }

            module.lessons.push({
                title,
                description,
                type: 'video',
                content: { videoUrl },
                order
            });

            await course.save();
            res.status(201).json({ data: course });
        } catch (error) {
            console.error('Error adding video:', error);
            res.status(500).json({ message: 'Error adding video' });
        }
    },

    // Update video
    updateVideo: async (req, res) => {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Only admins can update videos' });
            }

            const { courseId, lessonId } = req.params;
            const { title, description, videoUrl, order } = req.body;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            let lesson = null;
            for (const module of course.modules) {
                const foundLesson = module.lessons.id(lessonId);
                if (foundLesson) {
                    lesson = foundLesson;
                    break;
                }
            }

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            Object.assign(lesson, {
                title,
                description,
                content: { videoUrl },
                order
            });

            await course.save();
            res.json({ data: course });
        } catch (error) {
            console.error('Error updating video:', error);
            res.status(500).json({ message: 'Error updating video' });
        }
    },

    // Delete video
    deleteVideo: async (req, res) => {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Only admins can delete videos' });
            }

            const { courseId, lessonId } = req.params;
            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            let deleted = false;
            for (const module of course.modules) {
                const lessonIndex = module.lessons.findIndex(l => l._id.toString() === lessonId);
                if (lessonIndex !== -1) {
                    module.lessons.splice(lessonIndex, 1);
                    deleted = true;
                    break;
                }
            }

            if (!deleted) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            await course.save();
            res.json({ message: 'Video deleted successfully' });
        } catch (error) {
            console.error('Error deleting video:', error);
            res.status(500).json({ message: 'Error deleting video' });
        }
    },

    // Get course progress
    getCourseProgress: async (req, res) => {
        try {
            const { courseId } = req.params;
            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            // Get user's progress for this course
            const progress = await CourseProgress.findOne({
                course: courseId,
                user: req.user._id
            });

            res.json({ data: progress || { completedLessons: [] } });
        } catch (error) {
            console.error('Error getting course progress:', error);
            res.status(500).json({ message: 'Error getting course progress' });
        }
    },

    // Enroll in course
    enrollInCourse: async (req, res) => {
        try {
            const { courseId } = req.params;
            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            // Check if already enrolled
            if (course.enrolledStudents.includes(req.user._id)) {
                return res.status(400).json({ message: 'Already enrolled in this course' });
            }

            // Add user to enrolled students
            course.enrolledStudents.push(req.user._id);
            await course.save();

            // Initialize progress
            await CourseProgress.create({
                course: courseId,
                user: req.user._id,
                completedLessons: []
            });

            res.json({ message: 'Successfully enrolled in course' });
        } catch (error) {
            console.error('Error enrolling in course:', error);
            res.status(500).json({ message: 'Error enrolling in course' });
        }
    },

    // Get courses by user's categories
    getCoursesByUserCategories: async (req, res) => {
        try {
            const user = req.user;
            if (!user || !user.preferredCategories || user.preferredCategories.length === 0) {
                return res.json({ data: [] });
            }

            // Extract category IDs from the preferredCategories array
            const categoryIds = user.preferredCategories.map(cat => cat._id || cat);

            const courses = await Course.find({
                category: { $in: categoryIds }
            })
                .populate('category', 'name description')
                .sort({ createdAt: -1 });

            res.json({ data: courses });
        } catch (error) {
            console.error('Error fetching courses by user categories:', error);
            res.status(500).json({ message: 'Error fetching courses' });
        }
    }
};

module.exports = courseController; 