import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardMedia
} from '@mui/material';
import {
    PlayCircleOutline as PlayIcon,
    Lock as LockIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { courseService } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [progress, setProgress] = useState({});

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const [courseData, progressData] = await Promise.all([
                courseService.getCourseById(courseId),
                courseService.getCourseProgress(courseId)
            ]);
            setCourse(courseData);
            setProgress(progressData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch course details. Please try again later.');
            console.error('Error fetching course details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSelect = async (video) => {
        try {
            const videoDetails = await courseService.getVideoDetails(courseId, video._id);
            setSelectedVideo(videoDetails);
        } catch (err) {
            console.error('Error fetching video details:', err);
        }
    };

    const handleVideoProgress = async (videoId, currentTime) => {
        try {
            await courseService.updateVideoProgress(videoId, currentTime);
        } catch (err) {
            console.error('Error updating video progress:', err);
        }
    };

    const handleVideoComplete = async (videoId) => {
        try {
            await courseService.markVideoCompleted(videoId);
            fetchCourseDetails(); // Refresh progress
        } catch (err) {
            console.error('Error marking video as complete:', err);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!course) {
        return (
            <Container>
                <Alert severity="info">Course not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Course Header */}
                <Grid item xs={12}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="300"
                            image={course.thumbnail}
                            alt={course.title}
                        />
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h4" gutterBottom>
                                {course.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {course.description}
                            </Typography>
                            <Box display="flex" gap={2} alignItems="center">
                                <Typography variant="h6" color="primary">
                                    ${course.price}
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* Course Content */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Course Content
                        </Typography>
                        <List>
                            {course.modules.map((module) => (
                                <React.Fragment key={module._id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={module.title}
                                            secondary={`${module.lessons.length} lessons`}
                                        />
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CourseDetail; 