const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Teacher/Admin)
const createCourse = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            description,
            category,
            level,
            language,
            price,
            currency,
            sections,
            thumbnail,
            upiId
        } = req.body;

        const course = await Course.create({
            title,
            subtitle,
            description,
            category,
            level,
            language,
            price,
            currency,
            sections,
            thumbnail,
            instructor: req.user._id,
            status: 'Active'
        });

        // Update teacher's UPI ID if provided
        if (upiId) {
            await User.findByIdAndUpdate(req.user._id, { upiId });
        }

        res.status(201).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all courses (Public)
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
    try {
        const { keyword, category } = req.query;
        let query = { status: { $in: ['Active', 'Published'] } };

        if (keyword) {
            query.title = { $regex: keyword, $options: 'i' };
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const courses = await Course.find(query)
            .populate('instructor', 'username email')
            .sort({ createdAt: -1 });

        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get courses by logged in teacher
// @route   GET /api/courses/my-courses
// @access  Private (Teacher)
const getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id })
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'username email profilePicture bio expertise')
            .populate('reviews.user', 'username profilePicture');

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get enrolled courses for a student
// @route   GET /api/courses/enrolled
// @access  Private (Student)
const getEnrolledCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'enrolledCourses.courseId',
            populate: {
                path: 'instructor',
                select: 'username'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const courses = user.enrolledCourses.map(enrollment => {
            const course = enrollment.courseId;
            if (!course) return null;
            return {
                ...course.toObject(),
                purchaseDate: enrollment.purchaseDate,
                progress: 0 // Mock progress for now
            };
        }).filter(c => c !== null);

        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
const enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await User.findById(req.user._id);

        // Check if already enrolled
        const isAlreadyEnrolled = user.enrolledCourses.some(
            enroll => enroll.courseId.toString() === req.params.id
        );

        if (isAlreadyEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        user.enrolledCourses.push({
            courseId: course._id,
            purchaseDate: new Date()
        });

        await user.save();

        // Also add student to course
        course.students.push(user._id);
        await course.save();

        res.status(200).json({ message: 'Enrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    getEnrolledCourses,
    enrollInCourse
};
