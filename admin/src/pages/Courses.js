import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Snackbar,
    Alert,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Divider,
    LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Courses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        category: '',
        tags: [],
        skills: [],
        modules: []
    });
    const [currentTag, setCurrentTag] = useState('');
    const [currentSkill, setCurrentSkill] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [currentModule, setCurrentModule] = useState({
        title: '',
        description: '',
        order: 1,
        lessons: []
    });
    const [currentLesson, setCurrentLesson] = useState({
        title: '',
        description: '',
        type: 'video',
        content: {
            videoUrl: '',
            pdfUrl: ''
        },
        order: 1
    });
    const [videoFile, setVideoFile] = useState(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://lms-yunus-app.onrender.com/api/courses', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const result = await response.json();
            console.log('Courses API Response:', result);

            if (response.ok) {
                if (result.data && Array.isArray(result.data)) {
                    setCourses(result.data);
                } else if (Array.isArray(result)) {
                    setCourses(result);
                } else {
                    console.error('Invalid response format:', result);
                    setError('Invalid data format received');
                    setCourses([]);
                }
            } else {
                setError(result.message || 'Failed to fetch courses');
                setCourses([]);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('An error occurred while fetching courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://lms-yunus-app.onrender.com/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setCategories(result.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleOpenDialog = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title || '',
                description: course.description || '',
                thumbnail: course.thumbnail || '',
                category: course.category?._id || '',
                tags: course.tags || [],
                skills: course.skills || [],
                modules: course.modules || []
            });
        } else {
            setEditingCourse(null);
            setFormData({
                title: '',
                description: '',
                thumbnail: '',
                category: '',
                tags: [],
                skills: [],
                modules: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCourse(null);
        setFormData({
            title: '',
            description: '',
            thumbnail: '',
            category: '',
            tags: [],
            skills: [],
            modules: []
        });
        setCurrentModule({
            title: '',
            description: '',
            order: 1,
            lessons: []
        });
        setCurrentLesson({
            title: '',
            description: '',
            type: 'video',
            content: {
                videoUrl: '',
                pdfUrl: ''
            },
            order: 1
        });
    };

    const handleThumbnailChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'lms_app');
                formData.append('cloud_name', 'dzwr8crjj');

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/dzwr8crjj/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                const data = await response.json();
                setFormData(prev => ({ ...prev, thumbnail: data.secure_url }));
            } catch (err) {
                setError('Failed to upload thumbnail');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleFileUpload = async (event, moduleIndex, lessonIndex) => {
        const file = event.target.files[0];
        if (file) {
            setUploadingVideo(true);
            setUploadProgress(0);
            try {
                const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let uploadedChunks = 0;
                let videoUrl = '';

                for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                    const start = chunkIndex * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, file.size);
                    const chunk = file.slice(start, end);

                    const formData = new FormData();
                    formData.append('video', chunk);
                    formData.append('chunkIndex', chunkIndex);
                    formData.append('totalChunks', totalChunks);
                    formData.append('fileName', file.name);

                    const API_URL = process.env.REACT_APP_API_URL || 'https://lms-yunus-app.onrender.com/api';
                    const response = await fetch(
                        `${API_URL}/courses/upload-video`,
                        {
                            method: 'POST',
                            body: formData,
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Upload failed');
                    }

                    const data = await response.json();
                    uploadedChunks++;

                    // Update progress
                    const progress = Math.round((uploadedChunks / totalChunks) * 100);
                    setUploadProgress(progress);

                    // If this is the last chunk, get the final video URL
                    if (chunkIndex === totalChunks - 1) {
                        videoUrl = data.videoUrl;
                    }
                }

                if (moduleIndex !== undefined && lessonIndex !== undefined) {
                    // Editing existing lesson
                    const field = file.type.startsWith('video/') ? 'videoUrl' : 'pdfUrl';
                    const type = file.type.startsWith('video/') ? 'video' : 'pdf';
                    handleEditLesson(moduleIndex, lessonIndex, 'type', type);
                    handleEditLesson(moduleIndex, lessonIndex, field, videoUrl);
                } else {
                    // Adding new lesson
                    const field = file.type.startsWith('video/') ? 'videoUrl' : 'pdfUrl';
                    const type = file.type.startsWith('video/') ? 'video' : 'pdf';
                    setCurrentLesson(prev => ({
                        ...prev,
                        type: type,
                        content: {
                            ...prev.content,
                            [field]: videoUrl,
                            [field === 'videoUrl' ? 'pdfUrl' : 'videoUrl']: ''
                        }
                    }));
                }
            } catch (err) {
                console.error('Upload error:', err);
                setError(err.message || 'Failed to upload file');
            } finally {
                setUploadingVideo(false);
                setUploadProgress(0);
            }
        }
    };

    const handleAddTag = () => {
        if (currentTag && !formData.tags.includes(currentTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag]
            }));
            setCurrentTag('');
        }
    };

    const handleAddSkill = () => {
        if (currentSkill && !formData.skills.includes(currentSkill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, currentSkill]
            }));
            setCurrentSkill('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleAddModule = () => {
        if (currentModule.title && currentModule.description) {
            setFormData(prev => ({
                ...prev,
                modules: [...prev.modules, {
                    ...currentModule,
                    order: prev.modules.length + 1,
                    lessons: []
                }]
            }));
            setCurrentModule({
                title: '',
                description: '',
                order: 1,
                lessons: []
            });
        }
    };

    const handleAddLesson = (moduleIndex) => {
        if (currentLesson.title && currentLesson.description &&
            ((currentLesson.type === 'video' && currentLesson.content.videoUrl) ||
                (currentLesson.type === 'pdf' && currentLesson.content.pdfUrl))) {
            setFormData(prev => ({
                ...prev,
                modules: prev.modules.map((module, index) => {
                    if (index === moduleIndex) {
                        return {
                            ...module,
                            lessons: [...module.lessons, {
                                ...currentLesson,
                                order: module.lessons.length + 1
                            }]
                        };
                    }
                    return module;
                })
            }));
            setCurrentLesson({
                title: '',
                description: '',
                type: 'video',
                content: {
                    videoUrl: '',
                    pdfUrl: ''
                },
                order: 1
            });
        }
    };

    const handleRemoveModule = (moduleIndex) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.filter((_, i) => i !== moduleIndex).map((module, index) => ({
                ...module,
                order: index + 1
            }))
        }));
    };

    const handleRemoveLesson = (moduleIndex, lessonIndex) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((module, index) => {
                if (index === moduleIndex) {
                    return {
                        ...module,
                        lessons: module.lessons
                            .filter((_, j) => j !== lessonIndex)
                            .map((lesson, index) => ({
                                ...lesson,
                                order: index + 1
                            }))
                    };
                }
                return module;
            })
        }));
    };

    const handleEditModule = (moduleIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((module, index) => {
                if (index === moduleIndex) {
                    return { ...module, [field]: value };
                }
                return module;
            })
        }));
    };

    const handleEditLesson = (moduleIndex, lessonIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((module, index) => {
                if (index === moduleIndex) {
                    return {
                        ...module,
                        lessons: module.lessons.map((lesson, lIndex) => {
                            if (lIndex === lessonIndex) {
                                if (field === 'videoUrl' || field === 'pdfUrl') {
                                    return {
                                        ...lesson,
                                        content: { ...lesson.content, [field]: value }
                                    };
                                }
                                return { ...lesson, [field]: value };
                            }
                            return lesson;
                        })
                    };
                }
                return module;
            })
        }));
    };

    const validateCourse = () => {
        const errors = [];

        if (!formData.title?.trim()) {
            errors.push('Course title is required');
        }
        if (!formData.description?.trim()) {
            errors.push('Course description is required');
        }
        if (!formData.thumbnail) {
            errors.push('Course thumbnail is required');
        }
        if (!formData.modules?.length) {
            errors.push('At least one module is required');
        } else {
            formData.modules.forEach((module, index) => {
                if (!module.title?.trim()) {
                    errors.push(`Module ${index + 1}: Title is required`);
                }
                if (!module.description?.trim()) {
                    errors.push(`Module ${index + 1}: Description is required`);
                }
                if (!module.lessons?.length) {
                    errors.push(`Module ${index + 1}: At least one lesson is required`);
                } else {
                    module.lessons.forEach((lesson, lessonIndex) => {
                        if (!lesson.title?.trim()) {
                            errors.push(`Module ${index + 1}, Lesson ${lessonIndex + 1}: Title is required`);
                        }
                        if (!lesson.description?.trim()) {
                            errors.push(`Module ${index + 1}, Lesson ${lessonIndex + 1}: Description is required`);
                        }
                        if (lesson.type === 'video' && !lesson.content?.videoUrl) {
                            errors.push(`Module ${index + 1}, Lesson ${lessonIndex + 1}: Video is required`);
                        }
                        if (lesson.type === 'pdf' && !lesson.content?.pdfUrl) {
                            errors.push(`Module ${index + 1}, Lesson ${lessonIndex + 1}: PDF is required`);
                        }
                    });
                }
            });
        }

        return errors;
    };

    const handleSubmit = async () => {
        try {
            // Validate the course data
            const validationErrors = validateCourse();
            if (validationErrors.length > 0) {
                setError(validationErrors.join('\n'));
                return;
            }

            // Get the token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please login again.');
                return;
            }

            // Format the data to ensure all fields are properly structured
            const formattedData = {
                title: formData.title,
                description: formData.description,
                thumbnail: formData.thumbnail,
                category: formData.category,
                tags: formData.tags,
                skills: formData.skills,
                modules: formData.modules.map((module, index) => ({
                    title: module.title,
                    description: module.description,
                    order: index + 1,
                    lessons: module.lessons.map((lesson, lessonIndex) => ({
                        title: lesson.title,
                        description: lesson.description,
                        type: lesson.type,
                        content: {
                            videoUrl: lesson.type === 'video' ? lesson.content.videoUrl : '',
                            pdfUrl: lesson.type === 'pdf' ? lesson.content.pdfUrl : ''
                        },
                        order: lessonIndex + 1
                    }))
                }))
            };

            console.log('Submitting course data:', formattedData);

            const url = editingCourse
                ? `https://lms-yunus-app.onrender.com/api/courses/${editingCourse._id}`
                : 'https://lms-yunus-app.onrender.com/api/courses';

            const response = await fetch(url, {
                method: editingCourse ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save course');
            }

            const data = await response.json();
            setSuccessMessage(editingCourse ? 'Course updated successfully' : 'Course created successfully');
            setShowSuccess(true);
            setOpenDialog(false);
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            setError(error.message || 'Failed to save course');
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Courses</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Course
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {courses.length === 0 ? (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="text.secondary" align="center">
                                No courses found
                            </Typography>
                        </Grid>
                    ) : (
                        courses.map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        '&:hover': {
                                            boxShadow: 6,
                                            '& .MuiCardActions-root': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={course.thumbnail || 'https://res.cloudinary.com/dzwr8crjj/image/upload/v1/samples/landscapes/nature-mountains.jpg'}
                                        alt={course.title}
                                        sx={{ objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://res.cloudinary.com/dzwr8crjj/image/upload/v1/samples/landscapes/nature-mountains.jpg';
                                        }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {course.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {course.description}
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Tags:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {course.tags.map((tag) => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        size="small"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Skills:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {course.skills.map((skill) => (
                                                    <Chip
                                                        key={skill}
                                                        label={skill}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2">
                                                Modules: {course.modules.length}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions
                                        sx={{
                                            opacity: 0.7,
                                            transition: 'opacity 0.2s',
                                            justifyContent: 'flex-end',
                                            p: 2
                                        }}
                                    >
                                        <IconButton
                                            onClick={() => handleOpenDialog(course)}
                                            color="primary"
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>

                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Title"
                                fullWidth
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Category"
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category._id} value={category._id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>Course Thumbnail</Typography>
                                <input
                                    accept="image/*"
                                    type="file"
                                    id="thumbnail-upload"
                                    onChange={handleThumbnailChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="thumbnail-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Thumbnail'}
                                    </Button>
                                </label>
                                {formData.thumbnail && (
                                    <Box sx={{ mt: 1 }}>
                                        <img
                                            src={formData.thumbnail}
                                            alt="Thumbnail preview"
                                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>Course Tags</Typography>
                                <TextField
                                    label="Add Tag"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                    sx={{ mr: 1 }}
                                />
                                <Button onClick={handleAddTag}>Add Tag</Button>
                                <Box sx={{ mt: 1 }}>
                                    {formData.tags.map((tag) => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            onDelete={() => handleRemoveTag(tag)}
                                            sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>Required Skills</Typography>
                                <TextField
                                    label="Add Skill"
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                    sx={{ mr: 1 }}
                                />
                                <Button onClick={handleAddSkill}>Add Skill</Button>
                                <Box sx={{ mt: 1 }}>
                                    {formData.skills.map((skill) => (
                                        <Chip
                                            key={skill}
                                            label={skill}
                                            onDelete={() => handleRemoveSkill(skill)}
                                            sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" gutterBottom>Course Modules</Typography>
                                {formData.modules.map((module, moduleIndex) => (
                                    <Accordion key={moduleIndex} sx={{ mt: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Module {module.order}: {module.title}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TextField
                                                fullWidth
                                                label="Module Title"
                                                value={module.title}
                                                onChange={(e) => handleEditModule(moduleIndex, 'title', e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Module Description"
                                                multiline
                                                rows={2}
                                                value={module.description}
                                                onChange={(e) => handleEditModule(moduleIndex, 'description', e.target.value)}
                                                sx={{ mb: 2 }}
                                            />

                                            <Typography variant="subtitle1" gutterBottom>Module Lessons</Typography>
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                <Card key={lessonIndex} variant="outlined" sx={{ mb: 2 }}>
                                                    <CardContent>
                                                        <Stack spacing={2}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="h6">
                                                                    Lesson {lessonIndex + 1}: {lesson.title}
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleRemoveLesson(moduleIndex, lessonIndex)}
                                                                    color="error"
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>

                                                            <Typography variant="body2" color="text.secondary">
                                                                {lesson.description}
                                                            </Typography>

                                                            <Box>
                                                                <Chip
                                                                    icon={lesson.type === 'video' ? <VideoLibraryIcon /> : <PictureAsPdfIcon />}
                                                                    label={lesson.type === 'video' ? 'Video Lesson' : 'PDF Document'}
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            </Box>

                                                            <Box>
                                                                <input
                                                                    accept={lesson.type === 'video' ? 'video/*' : 'application/pdf'}
                                                                    type="file"
                                                                    id={`file-upload-${moduleIndex}-${lessonIndex}`}
                                                                    onChange={(e) => handleFileUpload(e, moduleIndex, lessonIndex)}
                                                                    style={{ display: 'none' }}
                                                                />
                                                                <label htmlFor={`file-upload-${moduleIndex}-${lessonIndex}`}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        component="span"
                                                                        startIcon={<CloudUploadIcon />}
                                                                        disabled={uploadingVideo}
                                                                    >
                                                                        {uploadingVideo ? 'Uploading...' : `Replace ${lesson.type === 'video' ? 'Video' : 'PDF'}`}
                                                                    </Button>
                                                                </label>
                                                                {uploadingVideo && (
                                                                    <Box sx={{ width: '100%', mt: 1 }}>
                                                                        <LinearProgress variant="determinate" value={uploadProgress} />
                                                                        <Typography variant="body2" color="text.secondary" align="center">
                                                                            {uploadProgress}%
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {(lesson.content?.videoUrl || lesson.content?.pdfUrl) && !uploadingVideo && (
                                                                    <Alert severity="success">
                                                                        {lesson.type === 'video' ? 'Video' : 'PDF'} uploaded successfully
                                                                    </Alert>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            <Box sx={{ mb: 3 }}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="h6" gutterBottom>
                                                            Add New Lesson
                                                        </Typography>
                                                        <Stack spacing={2}>
                                                            <TextField
                                                                fullWidth
                                                                label="Lesson Title"
                                                                value={currentLesson.title}
                                                                onChange={(e) => setCurrentLesson(prev => ({
                                                                    ...prev,
                                                                    title: e.target.value
                                                                }))}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Lesson Description"
                                                                multiline
                                                                rows={3}
                                                                value={currentLesson.description}
                                                                onChange={(e) => setCurrentLesson(prev => ({
                                                                    ...prev,
                                                                    description: e.target.value
                                                                }))}
                                                            />
                                                            <FormControl fullWidth>
                                                                <InputLabel>Lesson Type</InputLabel>
                                                                <Select
                                                                    value={currentLesson.type}
                                                                    label="Lesson Type"
                                                                    onChange={(e) => setCurrentLesson(prev => ({
                                                                        ...prev,
                                                                        type: e.target.value,
                                                                        content: {
                                                                            videoUrl: '',
                                                                            pdfUrl: ''
                                                                        }
                                                                    }))}
                                                                >
                                                                    <MenuItem value="video">
                                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                                            <VideoLibraryIcon />
                                                                            <Typography>Video Lesson</Typography>
                                                                        </Stack>
                                                                    </MenuItem>
                                                                    <MenuItem value="pdf">
                                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                                            <PictureAsPdfIcon />
                                                                            <Typography>PDF Document</Typography>
                                                                        </Stack>
                                                                    </MenuItem>
                                                                </Select>
                                                            </FormControl>

                                                            <Box>
                                                                <input
                                                                    accept={currentLesson.type === 'video' ? 'video/*' : 'application/pdf'}
                                                                    type="file"
                                                                    id="new-lesson-file-upload"
                                                                    onChange={(e) => handleFileUpload(e)}
                                                                    style={{ display: 'none' }}
                                                                />
                                                                <label htmlFor="new-lesson-file-upload">
                                                                    <Button
                                                                        variant="contained"
                                                                        component="span"
                                                                        startIcon={<CloudUploadIcon />}
                                                                        disabled={uploadingVideo}
                                                                        fullWidth
                                                                        sx={{ mb: 1 }}
                                                                    >
                                                                        {uploadingVideo ? 'Uploading...' : `Upload ${currentLesson.type === 'video' ? 'Video' : 'PDF'}`}
                                                                    </Button>
                                                                </label>
                                                                {uploadingVideo && (
                                                                    <Box sx={{ width: '100%', mt: 1 }}>
                                                                        <LinearProgress variant="determinate" value={uploadProgress} />
                                                                        <Typography variant="body2" color="text.secondary" align="center">
                                                                            {uploadProgress}%
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {(currentLesson.content?.videoUrl || currentLesson.content?.pdfUrl) && !uploadingVideo && (
                                                                    <Alert severity="success" sx={{ mt: 1 }}>
                                                                        {currentLesson.type === 'video' ? 'Video' : 'PDF'} uploaded successfully
                                                                    </Alert>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => handleAddLesson(moduleIndex)}
                                                            disabled={!currentLesson.title || !currentLesson.description ||
                                                                (currentLesson.type === 'video' && !currentLesson.content?.videoUrl) ||
                                                                (currentLesson.type === 'pdf' && !currentLesson.content?.pdfUrl)}
                                                            startIcon={<AddIcon />}
                                                        >
                                                            Add Lesson
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Box>

                                            <IconButton
                                                onClick={() => handleRemoveModule(moduleIndex)}
                                                color="error"
                                                sx={{ mt: 1 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}

                                <Paper sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>Add New Module</Typography>
                                    <TextField
                                        fullWidth
                                        label="Module Title"
                                        value={currentModule.title}
                                        onChange={(e) => setCurrentModule(prev => ({ ...prev, title: e.target.value }))}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Module Description"
                                        multiline
                                        rows={2}
                                        value={currentModule.description}
                                        onChange={(e) => setCurrentModule(prev => ({ ...prev, description: e.target.value }))}
                                        sx={{ mb: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleAddModule}
                                        startIcon={<AddIcon />}
                                        disabled={!currentModule.title || !currentModule.description}
                                    >
                                        Add Module
                                    </Button>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.title || !formData.description || !formData.thumbnail || formData.modules.length === 0}
                    >
                        {editingCourse ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {error && (
                <Typography
                    color="error"
                    sx={{
                        mt: 2,
                        whiteSpace: 'pre-line',
                        backgroundColor: '#fff3f3',
                        padding: 2,
                        borderRadius: 1
                    }}
                >
                    {error}
                </Typography>
            )}

            <Snackbar
                open={showSuccess}
                autoHideDuration={2000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSuccess}
                    severity="success"
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontSize: '1.1rem',
                        padding: '12px 20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem'
                        }
                    }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Courses; 