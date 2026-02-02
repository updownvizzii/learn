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

// @desc    Delete a user (Teacher or Student)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Target asset not found in database.' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Access Denied: Cannot decommission a Master Administrator.' });
        }

        // If user is a teacher, deactivate their courses or handle them
        if (user.role === 'teacher') {
            // Delete courses associated with this teacher
            await Course.deleteMany({ instructor: user._id });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Asset decommissioned. Secure clearing of associated data complete.' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Internal System Error: ' + error.message });
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    getAllStudents,
    deleteUser,

    // @desc    Get dashboard stats
    // @route   GET /api/admin/stats
    // @access  Private/Admin
    getDashboardStats: async (req, res) => {
        try {
            const studentsCount = await User.countDocuments({ role: 'student' });
            const teachersCount = await User.countDocuments({ role: 'teacher' });
            const coursesCount = await Course.countDocuments({ status: { $ne: 'Draft' } });

            // Calculate total revenue
            // Sum of all course prices for each enrollment
            const users = await User.find({ role: 'student' });
            const courses = await Course.find();

            let totalRevenue = 0;
            users.forEach(user => {
                if (user.enrolledCourses) {
                    user.enrolledCourses.forEach(enroll => {
                        const course = courses.find(c => c._id.toString() === enroll.courseId.toString());
                        if (course) {
                            totalRevenue += course.price || 0;
                        }
                    });
                }
            });

            // Calculate monthly enrollment trends (simplified for now)
            // In a real app, this would be grouped by MongoDB aggregation
            const monthlyEnrollments = [
                { month: 'Jan', count: 45 },
                { month: 'Feb', count: 52 },
                { month: 'Mar', count: 48 },
                { month: 'Apr', count: 70 },
                { month: 'May', count: 85 },
                { month: 'Jun', count: 92 },
            ];

            res.json({
                studentsCount,
                teachersCount,
                coursesCount,
                revenue: totalRevenue,
                monthlyEnrollments
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
    },

    // @desc    Delete a course
    // @route   DELETE /api/admin/courses/:id
    // @access  Private/Admin
    deleteCourse: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({ message: 'Sector intel not found.' });
            }

            await Course.findByIdAndDelete(req.params.id);
            res.json({ message: 'Sector decommissioned. Tactical data purged from database.' });
        } catch (error) {
            res.status(500).json({ message: 'Internal System Error: ' + error.message });
        }
    }
};
