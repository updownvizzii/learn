const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');

        const adminExists = await User.findOne({ email: 'admin@edu.com' });

        if (adminExists) {
            console.log('Admin user already exists');
        } else {
            const adminUser = await User.create({
                username: 'System Admin',
                email: 'admin@edu.com',
                password: 'admin123', // Will be hashed by pre-save hook
                role: 'admin',
                profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
            });
            console.log('Admin user created successfully');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
