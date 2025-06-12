import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    CircularProgress,
    Box,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('CourseList component mounted');
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            console.log('Fetching courses...');
            setLoading(true);
            const data = await courseService.getAllCourses();
            console.log('Courses fetched:', data);
            setCourses(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    console.log('Rendering courses:', courses);

    return (
        <Grid container spacing={3}>
            {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                    <Card
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                boxShadow: 6,
                                cursor: 'pointer'
                            }
                        }}
                        onClick={() => navigate(`/courses/${course._id}`)}
                    >
                        <CardMedia
                            component="img"
                            height="200"
                            image={course.thumbnail}
                            alt={course.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h5" component="h2">
                                {course.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {course.description}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Chip
                                    label={course.level}
                                    color="primary"
                                    size="small"
                                />
                                <Typography variant="h6" color="primary">
                                    ${course.price}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default CourseList; 