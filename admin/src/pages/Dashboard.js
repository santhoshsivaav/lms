import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Tab,
    Tabs,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    DialogContentText,
} from '@mui/material';
import Courses from './Courses';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Dashboard = () => {
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        preferredCategories: []
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        if (value === 0) {
            fetchUsers();
            fetchCategories();
        }
    }, [navigate, value]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://lms-yunus-app.onrender.com/api/allusers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.status === 429) {
                // Rate limit exceeded, wait and retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchUsers();
            }

            if (response.ok) {
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setUsers(result.data);
                } else {
                    setError('Invalid data format received');
                    setUsers([]);
                }
            } else {
                setError('Failed to fetch users');
                setUsers([]);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('An error occurred while fetching users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://lms-yunus-app.onrender.com/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.status === 429) {
                // Rate limit exceeded, wait and retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchCategories();
            }

            if (response.ok) {
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setCategories(result.data);
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
        if (newValue === 1) {
            navigate('/courses');
        } else if (newValue === 2) {
            navigate('/categories');
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                preferredCategories: user.preferredCategories || []
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user',
                preferredCategories: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            preferredCategories: []
        });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please login again.');
                return;
            }

            console.log('Using token for user update:', token.substring(0, 10) + '...');

            // Use correct API endpoint
            const url = editingUser
                ? `https://lms-yunus-app.onrender.com/api/users/${editingUser._id}`
                : 'https://lms-yunus-app.onrender.com/api/auth/register';

            // Prepare the data to send
            const userData = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                preferredCategories: formData.preferredCategories.map(catId => catId.toString())
            };

            // Only include password if it's not empty
            if (formData.password) {
                userData.password = formData.password;
            }

            console.log('Sending user data:', userData);

            const response = await fetch(url, {
                method: editingUser ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                fetchUsers();
                handleCloseDialog();
            } else {
                const errorData = await response.json().catch(() => ({ message: `Failed with status: ${response.status}` }));
                console.error('Update user error response:', response.status, errorData);
                setError(errorData.message || `Failed to save user: ${response.status}`);
            }
        } catch (err) {
            console.error('Error saving user:', err);
            setError(`An error occurred while saving the user: ${err.message}`);
        }
    };

    const handleDeleteConfirm = () => {
        if (userToDelete) {
            handleDeleteUser(userToDelete);
        }
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteUser = async (user) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please login again.');
                return;
            }

            console.log('Deleting user with ID:', user._id);
            console.log('Using token:', token.substring(0, 10) + '...');

            // Use correct API endpoint
            const response = await fetch(`https://lms-yunus-app.onrender.com/api/users/${user._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Remove user from local state
                setUsers(users.filter(u => u._id !== user._id));
            } else {
                const errorData = await response.json().catch(() => ({ message: `Failed with status: ${response.status}` }));
                console.error('Delete user error response:', response.status, errorData);
                setError(errorData.message || `Failed to delete user: ${response.status}`);
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(`An error occurred while deleting the user: ${err.message}`);
        }
    };

    if (loading && value === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={value} onChange={handleTabChange}>
                    <Tab label="Users" />
                    <Tab label="Courses" />
                    <Tab label="Categories" />
                    <Tab label="Settings" />
                </Tabs>
            </Box>

            {value === 0 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h4">Users</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add User
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Preferred Categories</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id || user.email}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            {user.preferredCategories && user.preferredCategories.length > 0
                                                ? categories
                                                    .filter(cat => user.preferredCategories.includes(cat._id))
                                                    .map(cat => cat.name)
                                                    .join(', ')
                                                : 'None'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {value === 1 && <Courses />}

            {value === 3 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Settings
                    </Typography>
                    {/* Add settings content here */}
                </Box>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            helperText={!editingUser ? "Password must be at least 6 characters long and contain a number" : "Leave blank to keep current password"}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            >
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Preferred Categories</InputLabel>
                            <Select
                                multiple
                                value={formData.preferredCategories}
                                label="Preferred Categories"
                                onChange={(e) => {
                                    console.log('Selected categories:', e.target.value); // Debug log
                                    setFormData(prev => ({ ...prev, preferredCategories: e.target.value }));
                                }}
                                renderValue={(selected) => {
                                    const selectedCategories = categories
                                        .filter(cat => selected.includes(cat._id))
                                        .map(cat => cat.name)
                                        .join(', ');
                                    return selectedCategories;
                                }}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name || !formData.email || (!editingUser && !formData.password)}
                    >
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard; 