import api from '../api/api';

const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    getEnrolledCourses: () => api.get('/users/courses'),
    getSubscription: () => api.get('/users/subscription'),
};

export default userService; 