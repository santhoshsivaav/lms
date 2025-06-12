const mongoose = require('mongoose');
const Course = require('../models/Course');

const MONGODB_URI = 'mongodb+srv://lmsyunus:yunus123@lmsfinal.qg4tbjb.mongodb.net/lmsyunus';

const sampleCourse = {
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners!",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg",
    tags: ["web development", "html", "css", "javascript", "beginner"],
    skills: ["HTML", "CSS", "JavaScript", "Web Development"],
    status: "published",
    modules: [
        {
            title: "Getting Started with HTML",
            description: "Learn the basics of HTML and its structure",
            order: 1,
            lessons: [
                {
                    title: "Introduction to HTML",
                    description: "Learn the basics of HTML and its structure",
                    type: "video",
                    content: {
                        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4"
                    },
                    order: 1
                },
                {
                    title: "HTML Elements and Tags",
                    description: "Understanding HTML elements and their usage",
                    type: "video",
                    content: {
                        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4"
                    },
                    order: 2
                }
            ]
        },
        {
            title: "CSS Fundamentals",
            description: "Learn how to style your web pages with CSS",
            order: 2,
            lessons: [
                {
                    title: "Introduction to CSS",
                    description: "Understanding CSS and its importance",
                    type: "video",
                    content: {
                        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4"
                    },
                    order: 1
                },
                {
                    title: "CSS Selectors and Properties",
                    description: "Learn about CSS selectors and common properties",
                    type: "video",
                    content: {
                        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4"
                    },
                    order: 2
                }
            ]
        }
    ]
};

const createSampleCourse = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Delete existing sample course if it exists
        await Course.deleteOne({ title: sampleCourse.title });
        console.log('Deleted existing sample course if any');

        // Create new course
        const course = new Course(sampleCourse);
        await course.save();
        console.log('Sample course created successfully:', {
            id: course._id,
            title: course.title,
            modulesCount: course.modules.length,
            totalLessons: course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
        });

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error creating sample course:', error);
        process.exit(1);
    }
};

// Run the script
createSampleCourse(); 