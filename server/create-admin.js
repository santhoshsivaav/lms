const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lmsyunus:yunus123@lmsfinal.qg4tbjb.mongodb.net/lmsyunus')
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Check if admin already exists
            const adminExists = await User.findOne({ role: 'admin' });
            if (adminExists) {
                console.log('Admin user already exists');
                process.exit(0);
            }

            // Create admin user
            const admin = new User({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                isAdmin: true
            });

            await admin.save();
            console.log('Admin user created successfully');
            process.exit(0);
        } catch (error) {
            console.error('Error creating admin:', error);
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }); 