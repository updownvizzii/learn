const User = require('../models/User');

// @desc    Create a new teacher
// @route   POST /api/admin/teachers
// @access  Private/Admin
const createTeacher = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: 'teacher',
            profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                message: 'Teacher created successfully'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @access  Private/Admin
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Course = require('../models/Course');

module.exports = {
    createTeacher,
    getAllTeachers,
    getAllStudents,

    // @desc    Get dashboard stats
    // @route   GET /api/admin/stats
    // @access  Private/Admin
    getDashboardStats: async (req, res) => {
        try {
            const studentsCount = await User.countDocuments({ role: 'student' });
            const teachersCount = await User.countDocuments({ role: 'teacher' });
            const coursesCount = await Course.countDocuments({ status: { $ne: 'Draft' } });

            // Calculate total revenue (Simplified: Sum of all paid enrollments)
            // Note: In a real app, this should come from a Transaction model
            // For now, calculating potential revenue from current enrollments

            const revenue = 0; // Placeholder until transaction logic is implemented

            res.json({
                studentsCount,
                teachersCount,
                coursesCount,
                revenue
            });
        } catch (error) {
            console.error('Stats Error:', error);
            res.status(500).json({ message: 'Failed to fetch stats' });
        }
    },

    // @desc    Get all courses for admin
    // @route   GET /api/admin/courses
    // @access  Private/Admin
    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find()
                .populate('instructor', 'username email')
                .populate('students', 'username email')
                .sort({ createdAt: -1 });
            res.json(courses);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch courses' });
        }
    }
};
