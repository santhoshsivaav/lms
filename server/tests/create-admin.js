const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://lmsyunus:yunus123@lmsfinal.qg4tbjb.mongodb.net/lmsyunus', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Function to create admin user
async function createAdminUser() {
    try {
        console.log('\n=== Creating Admin User ===');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            isAdmin: true
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        mongoose.connection.close();
    }
}

// Run the function
createAdminUser(); 