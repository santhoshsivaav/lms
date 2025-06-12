const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://lmsyunus:yunus123@lmsfinal.qg4tbjb.mongodb.net/lmsyunus', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Function to list all users
async function listUsers() {
    try {
        console.log('\n=== Listing All Users ===');
        const users = await User.find().select('-password');
        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`\nUser ID: ${user._id}`);
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Admin: ${user.isAdmin}`);
            console.log(`Created: ${user.createdAt}`);
            console.log('------------------------');
        });
    } catch (err) {
        console.error('Error listing users:', err);
    } finally {
        mongoose.connection.close();
    }
}

// Run the function
listUsers(); 