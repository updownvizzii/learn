const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const { awardXP, unlockAchievement } = require('./gamificationController');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Teacher/Admin)
const createCourse = async (req, res) => {
    try {
        console.log('Received Create Course Request:', JSON.stringify(req.body, null, 2));
        console.log('Operator ID:', req.user?._id);

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
            upiId,
            learningObjectives,
            requirements,
            targetAudience
        } = req.body;

        const courseData = {
            title,
            subtitle,
            description,
            category,
            level,
            language,
            price: Number(price) || 0,
            currency,
            sections,
            thumbnail: thumbnail || undefined,
            learningObjectives: Array.isArray(learningObjectives) ? learningObjectives.filter(item => item.trim() !== '') : [],
            requirements: Array.isArray(requirements) ? requirements.filter(item => item.trim() !== '') : [],
            targetAudience: Array.isArray(targetAudience) ? targetAudience.filter(item => item.trim() !== '') : [],
            instructor: req.user._id,
            status: 'Active'
        };

        const course = await Course.create(courseData);

        if (upiId) {
            await User.findByIdAndUpdate(req.user._id, { upiId });
        }

        res.status(201).json(course);
    } catch (error) {
        console.error('Create Course Detailed Error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Strategic Validation Failure: ' + messages.join(', '),
                error: error.errors
            });
        }

        res.status(500).json({
            message: 'Internal System Error: ' + error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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

            const totalLectures = course.sections ? course.sections.reduce((acc, sec) => acc + (sec.lectures ? sec.lectures.length : 0), 0) : 0;
            const completedCount = enrollment.completedLectures ? enrollment.completedLectures.length : 0;
            const progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

            return {
                ...course.toObject(),
                purchaseDate: enrollment.purchaseDate,
                completedLectures: enrollment.completedLectures || [],
                isCompleted: enrollment.isCompleted || false,
                progress
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
            purchaseDate: new Date(),
            completedLectures: [],
            isCompleted: false
        });

        await user.save();

        // Also add student to course
        course.students.push(user._id);
        await course.save();

        // Award XP for enrollment
        await awardXP(user._id, 25, `Enrolled in ${course.title}`);

        // Check for enrollment achievement
        if (user.enrolledCourses.length === 5) {
            await unlockAchievement(user._id, {
                achievementId: 'five_courses',
                title: 'Tactical Expansion',
                xp: 250
            });
        }

        res.status(200).json({ message: 'Enrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark lecture as completed
// @route   POST /api/courses/:id/lectures/:lectureId/complete
// @access  Private
const markLectureCompleted = async (req, res) => {
    try {
        const { id: courseId, lectureId } = req.params;
        const user = await User.findById(req.user._id);
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ message: 'Course not found' });

        const enrollment = user.enrolledCourses.find(e => e.courseId.toString() === courseId);
        if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });

        if (!enrollment.completedLectures) enrollment.completedLectures = [];

        if (!enrollment.completedLectures.includes(lectureId)) {
            enrollment.completedLectures.push(lectureId);
        }

        // Check completion
        const totalLectures = course.sections.reduce((acc, sec) => acc + sec.lectures.length, 0);
        if (enrollment.completedLectures.length >= totalLectures && totalLectures > 0) {
            enrollment.isCompleted = true;
            enrollment.completionDate = new Date();
        }

        await user.save();

        // --- Gamification Logic ---
        // Award 50 XP for lecture completion
        const xpResult = await awardXP(user._id, 50, `Completed lecture in ${course.title}`);

        // If course is completed, award 500 XP and check for achievements
        let courseXpResult = null;
        let achievementResult = null;

        if (enrollment.isCompleted) {
            courseXpResult = await awardXP(user._id, 500, `Completed Course: ${course.title}`);

            // Check for 'first_course' achievement
            const completedCoursesCount = user.enrolledCourses.filter(e => e.isCompleted).length;
            if (completedCoursesCount === 1) {
                achievementResult = await unlockAchievement(user._id, {
                    achievementId: 'first_course',
                    title: 'First Steps',
                    xp: 100
                });
            }
        }

        res.json({
            success: true,
            completedLectures: enrollment.completedLectures,
            isCompleted: enrollment.isCompleted,
            gamification: {
                lectureXP: xpResult,
                courseXP: courseXpResult,
                achievement: achievementResult
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get certificate data
// @route   GET /api/courses/:id/certificate
// @access  Private
const getCertificate = async (req, res) => {
    try {
        const { id: courseId } = req.params;
        const user = await User.findById(req.user._id);
        const enrollment = user.enrolledCourses.find(e => e.courseId.toString() === courseId);

        if (!enrollment || !enrollment.isCompleted) {
            return res.status(400).json({ message: 'Course not completed' });
        }

        const course = await Course.findById(courseId).populate('instructor', 'username');

        res.json({
            studentName: user.username,
            courseName: course.title,
            instructorName: course.instructor.username,
            completionDate: enrollment.completionDate || new Date(),
            uniqueId: `CERT-${user._id.toString().slice(-6)}-${course._id.toString().slice(-6)}-${Date.now().toString().slice(-6)}`.toUpperCase(),
            category: course.category || 'Programming',
            courseSubtitle: course.subtitle || '',
            skills: course.learningObjectives || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get teacher analytics
// @route   GET /api/courses/teacher-stats
// @access  Private (Teacher)
const getTeacherStats = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id });
        const courseIds = courses.map(c => c._id);

        const studentsEnrolled = await User.countDocuments({
            'enrolledCourses.courseId': { $in: courseIds }
        });

        // Calculate total earnings
        let totalEarnings = 0;
        const students = await User.find({
            'enrolledCourses.courseId': { $in: courseIds }
        });

        students.forEach(student => {
            student.enrolledCourses.forEach(enroll => {
                if (courseIds.some(id => id.toString() === enroll.courseId.toString())) {
                    const course = courses.find(c => c._id.toString() === enroll.courseId.toString());
                    if (course) {
                        totalEarnings += course.price || 0;
                    }
                }
            });
        });

        const activeCourses = courses.filter(c => c.status === 'Active' || c.status === 'Published').length;

        // Mock course performance data from real course titles
        const coursePerformance = courses.map(c => ({
            name: c.title.substring(0, 10) + '...',
            students: c.students.length,
            rating: c.rating || 0
        })).sort((a, b) => b.students - a.students).slice(0, 5);

        // Mock monthly earnings (normally would aggregate from a transaction model)
        const monthlyEarnings = [
            { name: 'Jan', amount: Math.round(totalEarnings * 0.1) },
            { name: 'Feb', amount: Math.round(totalEarnings * 0.15) },
            { name: 'Mar', amount: Math.round(totalEarnings * 0.2) },
            { name: 'Apr', amount: Math.round(totalEarnings * 0.15) },
            { name: 'May', amount: Math.round(totalEarnings * 0.2) },
            { name: 'Jun', amount: Math.round(totalEarnings * 0.2) }
        ];

        res.json({
            totalStudents: studentsEnrolled,
            totalEarnings,
            activeCourses,
            coursePerformance,
            totalCourses: courses.length,
            monthlyEarnings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student analytics
// @route   GET /api/courses/student-stats
// @access  Private (Student)
const getStudentStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const enrolledCount = user.enrolledCourses.length;
        const completedCount = user.enrolledCourses.filter(e => e.isCompleted).length;
        const inProgressCount = user.enrolledCourses.filter(e => !e.isCompleted && e.completedLectures.length > 0).length;
        const notStartedCount = Math.max(0, enrolledCount - completedCount - inProgressCount);

        // Calculate average progress
        let totalProgress = 0;
        const courses = await Course.find({
            _id: { $in: user.enrolledCourses.map(e => e.courseId) }
        });

        // Skills Data: Count categories from enrolled courses
        const categoryMap = {};
        courses.forEach(c => {
            categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
        });

        const skillsData = Object.keys(categoryMap).map(cat => ({
            subject: cat,
            A: Math.min(100, (categoryMap[cat] * 25) + 30), // Proficiency based on course count
            fullMark: 100
        }));

        user.enrolledCourses.forEach(enroll => {
            const course = courses.find(c => c._id.toString() === enroll.courseId.toString());
            if (course && course.sections) {
                const totalLectures = course.sections.reduce((acc, sec) => acc + (sec.lectures?.length || 0), 0);
                const completedCount = enroll.completedLectures ? enroll.completedLectures.length : 0;
                totalProgress += totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0;
            }
        });

        const avgProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;

        // Mock activity data (normally would aggregate from a session/event log)
        const activityData = [
            { name: 'Mon', hours: 2 },
            { name: 'Tue', hours: 4.5 },
            { name: 'Wed', hours: 1.5 },
            { name: 'Thu', hours: 5 },
            { name: 'Fri', hours: 3 },
            { name: 'Sat', hours: 6 },
            { name: 'Sun', hours: 4 },
        ];

        // Derived streak from lastActive
        const lastActiveDate = new Date(user.lastActive || Date.now());
        const today = new Date();
        const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
        const streak = diffDays <= 1 ? 7 : (diffDays <= 3 ? 3 : 0);

        res.json({
            enrolledCourses: enrolledCount,
            completedCourses: completedCount,
            avgProgress,
            certificatesEarned: completedCount,
            hoursLearned: Math.round(totalProgress * 0.5 / 10), // Realistic hours
            activityData,
            skillsData: skillsData.length > 0 ? skillsData : [
                { subject: 'Learning', A: 80, fullMark: 100 },
                { subject: 'Focus', A: 70, fullMark: 100 },
                { subject: 'Progress', A: 90, fullMark: 100 }
            ],
            progressDistribution: [
                { name: 'Completed', value: completedCount, fill: '#10b981' },
                { name: 'In Progress', value: inProgressCount, fill: '#6366f1' },
                { name: 'Not Started', value: notStartedCount, fill: '#f59e0b' },
            ],
            streak,
            dailyGoalProgress: Math.min(100, (avgProgress % 30) + 40),
            dailyMinutes: 32,
            currentDay: Math.floor(Math.random() * 30) + 1
        });
    } catch (error) {
        console.error('Student Stats Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const deleteCourse = async (req, res) => {
    console.log(`[TACTICAL] Decommission request received for ID: ${req.params.id}`);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Tactical ID: Asset identifier format is corrupted.' });
    }

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Strategic Asset not found' });
        }

        // Check if the user is the instructor of the course
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied: You do not have clearance to decommission this sector.' });
        }

        // Remove course reference from enrolled students
        await User.updateMany(
            { 'enrolledCourses.courseId': req.params.id },
            { $pull: { enrolledCourses: { courseId: req.params.id } } }
        );

        await Course.findByIdAndDelete(req.params.id);

        res.json({ message: 'Sector decommissioned successfully. Tactical cleanup complete.' });
    } catch (error) {
        console.error('Delete Course Error:', error);
        res.status(500).json({ message: 'Internal System Error: ' + error.message });
    }
};

// @desc    Update an existing course
// @route   PUT /api/courses/:id
// @access  Private (Teacher/Admin)
const updateCourse = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Tactical ID' });
    }

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Strategic Asset not found' });
        }

        // Check ownership
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied: You do not have clearance to modify this sector.' });
        }

        const {
            title, subtitle, description, category, level, language,
            price, currency, sections, thumbnail, upiId,
            learningObjectives, requirements, targetAudience
        } = req.body;

        const updateData = {
            title: title || course.title,
            subtitle: subtitle || course.subtitle,
            description: description || course.description,
            category: category || course.category,
            level: level || course.level,
            language: language || course.language,
            price: price !== undefined ? Number(price) : course.price,
            currency: currency || course.currency,
            sections: sections || course.sections,
            thumbnail: thumbnail || course.thumbnail,
            learningObjectives: Array.isArray(learningObjectives) ? learningObjectives.filter(item => item.trim() !== '') : course.learningObjectives,
            requirements: Array.isArray(requirements) ? requirements.filter(item => item.trim() !== '') : course.requirements,
            targetAudience: Array.isArray(targetAudience) ? targetAudience.filter(item => item.trim() !== '') : course.targetAudience,
        };

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (upiId) {
            await User.findByIdAndUpdate(req.user._id, { upiId });
        }

        res.json(updatedCourse);
    } catch (error) {
        console.error('Update Course Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Strategic Validation Failure: ' + messages.join(', ') });
        }
        res.status(500).json({ message: 'Internal System Error: ' + error.message });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    getEnrolledCourses,
    enrollInCourse,
    markLectureCompleted,
    getCertificate,
    getTeacherStats,
    getStudentStats,
    deleteCourse,
    updateCourse
};
