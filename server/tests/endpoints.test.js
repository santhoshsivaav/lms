const axios = require('axios');
const API_URL = 'http://192.168.219.119:5000/api';

// Test user credentials
const testUser = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
};

// Test admin credentials
const testAdmin = {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
};

let userToken = '';
let adminToken = '';

// Helper function to log test results
const logTest = (endpoint, status, message) => {
    console.log(`\n=== Testing ${endpoint} ===`);
    console.log(`Status: ${status ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Message: ${message}`);
    console.log('=====================\n');
};

// Test Authentication Endpoints
const testAuthEndpoints = async () => {
    try {
        // First, try to login as admin
        try {
            const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: testAdmin.email,
                password: testAdmin.password
            });
            adminToken = adminLoginResponse.data.token;
            logTest('POST /auth/login (admin)', true, 'Admin logged in successfully');
        } catch (error) {
            // If admin doesn't exist, create admin
            const adminRegisterResponse = await axios.post(`${API_URL}/auth/register`, testAdmin);
            adminToken = adminRegisterResponse.data.token;
            logTest('POST /auth/register (admin)', true, 'Admin registered successfully');
        }

        // Then, try to login as test user
        try {
            const userLoginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
            userToken = userLoginResponse.data.token;
            logTest('POST /auth/login (user)', true, 'User logged in successfully');
        } catch (error) {
            // If user doesn't exist, create user
            const userRegisterResponse = await axios.post(`${API_URL}/auth/register`, testUser);
            userToken = userRegisterResponse.data.token;
            logTest('POST /auth/register (user)', true, 'User registered successfully');
        }

        // Get user profile
        const profileResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        logTest('GET /auth/me', true, 'User profile retrieved successfully');
    } catch (error) {
        logTest('Auth Endpoints', false, error.message);
    }
};

// Test Course Endpoints
const testCourseEndpoints = async () => {
    try {
        // Get all courses
        const coursesResponse = await axios.get(`${API_URL}/courses`);
        logTest('GET /courses', true, 'Courses retrieved successfully');

        // Create new course (admin only)
        const newCourse = {
            title: 'Test Course',
            description: 'Test Description',
            price: 99.99,
            modules: [{
                title: 'Test Module',
                lessons: [{
                    title: 'Test Lesson',
                    content: 'Test Content'
                }]
            }]
        };

        const createResponse = await axios.post(`${API_URL}/courses`, newCourse, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const courseId = createResponse.data._id;
        logTest('POST /courses', true, 'Course created successfully');

        // Get course by ID
        const courseResponse = await axios.get(`${API_URL}/courses/${courseId}`);
        logTest('GET /courses/:id', true, 'Course retrieved successfully');

        // Update course
        const updateResponse = await axios.put(`${API_URL}/courses/${courseId}`, {
            title: 'Updated Course'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('PUT /courses/:id', true, 'Course updated successfully');

        // Delete course
        const deleteResponse = await axios.delete(`${API_URL}/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('DELETE /courses/:id', true, 'Course deleted successfully');
    } catch (error) {
        logTest('Course Endpoints', false, error.message);
    }
};

// Test User Endpoints
const testUserEndpoints = async () => {
    try {
        // Get all users (admin only)
        const usersResponse = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('GET /users', true, 'Users retrieved successfully');

        // Get user profile
        const profileResponse = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        logTest('GET /users/profile', true, 'User profile retrieved successfully');

        // Update user profile
        const updateResponse = await axios.put(`${API_URL}/users/profile`, {
            name: 'Updated Name'
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        logTest('PUT /users/profile', true, 'User profile updated successfully');
    } catch (error) {
        logTest('User Endpoints', false, error.message);
    }
};

// Test Subscription Endpoints
const testSubscriptionEndpoints = async () => {
    try {
        // Get subscription plans
        const plansResponse = await axios.get(`${API_URL}/subscriptions/plans`);
        logTest('GET /subscriptions/plans', true, 'Subscription plans retrieved successfully');

        // Create a test plan (admin only)
        const newPlan = {
            name: 'Test Plan',
            price: 99.99,
            duration: 30,
            features: ['Feature 1', 'Feature 2']
        };

        const createPlanResponse = await axios.post(`${API_URL}/subscriptions/plans`, newPlan, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const planId = createPlanResponse.data._id;
        logTest('POST /subscriptions/plans', true, 'Subscription plan created successfully');

        // Subscribe to plan
        const subscribeResponse = await axios.post(`${API_URL}/subscriptions/subscribe`, {
            planId: planId
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        logTest('POST /subscriptions/subscribe', true, 'Subscription created successfully');

        // Get subscription status
        const statusResponse = await axios.get(`${API_URL}/subscriptions/status`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        logTest('GET /subscriptions/status', true, 'Subscription status retrieved successfully');
    } catch (error) {
        logTest('Subscription Endpoints', false, error.message);
    }
};

// Test Analytics Endpoints
const testAnalyticsEndpoints = async () => {
    try {
        // Get overall analytics
        const overallResponse = await axios.get(`${API_URL}/analytics/overall`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('GET /analytics/overall', true, 'Overall analytics retrieved successfully');

        // Get course analytics
        const courseResponse = await axios.get(`${API_URL}/analytics/courses`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('GET /analytics/courses', true, 'Course analytics retrieved successfully');

        // Get revenue analytics
        const revenueResponse = await axios.get(`${API_URL}/analytics/revenue`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('GET /analytics/revenue', true, 'Revenue analytics retrieved successfully');
    } catch (error) {
        logTest('Analytics Endpoints', false, error.message);
    }
};

// Run all tests
const runAllTests = async () => {
    console.log('Starting API Endpoint Tests...\n');

    await testAuthEndpoints();
    await testCourseEndpoints();
    await testUserEndpoints();
    await testSubscriptionEndpoints();
    await testAnalyticsEndpoints();

    console.log('All tests completed!');
};

runAllTests().catch(console.error); 