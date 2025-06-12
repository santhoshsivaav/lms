import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Alert,
    Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'https://lms-yunus-app.onrender.com';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token); // Debug log

            if (!token) {
                setError('No authentication token found. Please log in.');
                return;
            }

            const response = await axios.get('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else {
                setError('Failed to fetch categories');
            }
        }
    };

    const handleOpen = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setEditMode(true);
        } else {
            setCurrentCategory({ name: '', description: '' });
            setEditMode(false);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCategory({ name: '', description: '' });
        setEditMode(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in.');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            if (editMode) {
                await axios.put(`/api/categories/${currentCategory._id}`, currentCategory, { headers });
                setSuccess('Category updated successfully');
            } else {
                await axios.post('/api/categories', currentCategory, { headers });
                setSuccess('Category created successfully');
            }
            handleClose();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else {
                setError(error.response?.data?.message || 'Failed to save category');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`/api/categories/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setSuccess('Category deleted successfully');
                fetchCategories();
            } catch (error) {
                setError('Failed to delete category');
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Categories</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                    Add Category
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category._id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.description}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(category)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(category._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editMode ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={currentCategory.name}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={currentCategory.description}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editMode ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Categories; 