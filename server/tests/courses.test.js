const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Course = require('../models/Course');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Course Endpoints', () => {
    let adminToken;
    let userToken;
    let testCourse;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST);

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        // Create regular user
        const user = await User.create({
            name: 'Test User',
            email: 'user@example.com',
            password: 'password123'
        });

        // Generate tokens
        adminToken = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        userToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Course.deleteMany({});
        testCourse = await Course.create({
            title: 'Test Course',
            description: 'Test Description',
            level: 'beginner',
            price: 99.99,
            videos: []
        });
    });

    describe('GET /api/courses', () => {
        it('should get all courses', async () => {
            const res = await request(app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data)).toBeTruthy();
            expect(res.body.data.length).toBe(1);
        });
    });

    describe('GET /api/courses/:id', () => {
        it('should get course by id', async () => {
            const res = await request(app)
                .get(`/api/courses/${testCourse._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('title', 'Test Course');
        });

        it('should return 404 for non-existent course', async () => {
            const res = await request(app)
                .get(`/api/courses/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/courses', () => {
        it('should create new course (admin only)', async () => {
            const res = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'New Course',
                    description: 'New Description',
                    level: 'intermediate',
                    price: 149.99
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data).toHaveProperty('title', 'New Course');
        });

        it('should not allow non-admin to create course', async () => {
            const res = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'New Course',
                    description: 'New Description',
                    level: 'intermediate',
                    price: 149.99
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/courses/:id', () => {
        it('should update course (admin only)', async () => {
            const res = await request(app)
                .put(`/api/courses/${testCourse._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Updated Course',
                    price: 199.99
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('title', 'Updated Course');
            expect(res.body.data).toHaveProperty('price', 199.99);
        });

        it('should not allow non-admin to update course', async () => {
            const res = await request(app)
                .put(`/api/courses/${testCourse._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Updated Course'
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /api/courses/:id', () => {
        it('should delete course (admin only)', async () => {
            const res = await request(app)
                .delete(`/api/courses/${testCourse._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const course = await Course.findById(testCourse._id);
            expect(course).toBeNull();
        });

        it('should not allow non-admin to delete course', async () => {
            const res = await request(app)
                .delete(`/api/courses/${testCourse._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
}); 