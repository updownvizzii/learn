const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const { awardXP, unlockAchievement, updateStreak } = require('./gamificationController');

const calculateTotalDuration = (sections) => {
    let totalSeconds = 0;
    if (!sections || !Array.isArray(sections)) return '0H 0M';

    sections.forEach(section => {
        if (section.lectures && Array.isArray(section.lectures)) {
            section.lectures.forEach(lecture => {
                const duration = lecture.duration || '0:00';
                const parts = duration.split(':').map(Number);
                if (parts.length === 2) { // mm:ss
                    totalSeconds += (isNaN(parts[0]) ? 0 : parts[0]) * 60 + (isNaN(parts[1]) ? 0 : parts[1]);
                } else if (parts.length === 3) { // hh:mm:ss
                    totalSeconds += (isNaN(parts[0]) ? 0 : parts[0]) * 3600 + (isNaN(parts[1]) ? 0 : parts[1]) * 60 + (isNaN(parts[2]) ? 0 : parts[2]);
                }
            });
        }
    });

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.ceil((totalSeconds % 3600) / 60);

    return `${h}H ${m}M`;
};

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
            status: 'Active',
            duration: calculateTotalDuration(sections)
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

        const formattedCourses = courses.map(course => {
            const courseObj = course.toObject();
            courseObj.duration = calculateTotalDuration(course.sections);
            return courseObj;
        });

        res.json(formattedCourses);
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

        const formattedCourses = courses.map(course => {
            const courseObj = course.toObject();
            courseObj.duration = calculateTotalDuration(course.sections);
            return courseObj;
        });

        res.json(formattedCourses);
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
            .populate('instructor', 'username email profilePicture bio expertise preloaderText preloaderImage')
            .populate('reviews.user', 'username profilePicture');

        if (course) {
            const courseObj = course.toObject();
            courseObj.duration = calculateTotalDuration(course.sections);
            res.json(courseObj);
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

            const courseObj = course.toObject();
            courseObj.duration = calculateTotalDuration(course.sections);

            return {
                ...courseObj,
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

        // Push to watch history for uptime tracking
        user.watchHistory.push({
            videoId: lectureId,
            timestamp: new Date()
        });
        await user.save();

        // --- Gamification Logic ---
        // Award 50 XP for lecture completion
        const xpResult = await awardXP(user._id, 50, `Completed lecture in ${course.title}`);

        // Update daily streak (only if they watch a video)
        const streakResult = await updateStreak(user._id);

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
                achievement: achievementResult,
                streak: streakResult
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

        // Calculate real course performance (Enrollments and Earnings per course)
        const coursePerformance = courses.map(c => {
            const studentCount = students.filter(s =>
                s.enrolledCourses.some(e => e.courseId.toString() === c._id.toString())
            ).length;
            return {
                name: c.title.length > 15 ? c.title.substring(0, 12) + '...' : c.title,
                students: studentCount,
                revenue: studentCount * (c.price || 0),
                rating: c.rating || 0
            };
        }).sort((a, b) => b.students - a.students).slice(0, 5);

        // Calculate real monthly earnings based on enrollment dates
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyDataMap = {};

        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthlyDataMap[months[d.getMonth()]] = 0;
        }

        students.forEach(student => {
            student.enrolledCourses.forEach(enroll => {
                if (courseIds.some(id => id.toString() === enroll.courseId.toString())) {
                    const course = courses.find(c => c._id.toString() === enroll.courseId.toString());
                    const pDate = enroll.purchaseDate || enroll.enrolledAt || new Date(); // Fallback to current if missing
                    const month = months[new Date(pDate).getMonth()];
                    if (monthlyDataMap[month] !== undefined) {
                        monthlyDataMap[month] += (course.price || 0);
                    }
                }
            });
        });

        const monthlyEarningsReal = Object.keys(monthlyDataMap).map(name => ({
            name,
            amount: monthlyDataMap[name]
        }));

        res.json({
            totalStudents: studentsEnrolled,
            totalEarnings,
            activeCourses,
            coursePerformance,
            totalCourses: courses.length,
            monthlyEarnings: monthlyEarningsReal
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

        // --- HUMAN-CENTRIC METRICS (Advanced Analytics) ---
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        let currentWeekUptime = 0;
        let previousWeekUptime = 0;
        const activeDaysSet = new Set();

        if (user.watchHistory && user.watchHistory.length > 0) {
            user.watchHistory.forEach(history => {
                const hDate = new Date(history.timestamp);
                // Track for momentum
                if (hDate >= oneWeekAgo) {
                    currentWeekUptime += 0.25;
                } else if (hDate >= twoWeeksAgo) {
                    previousWeekUptime += 0.25;
                }
                // Track unique days for consistency ratio
                activeDaysSet.add(hDate.toDateString());
            });
        }

        // 1. Weekly Momentum Score (Percentage change)
        const weeklyMomentum = previousWeekUptime === 0
            ? (currentWeekUptime > 0 ? 100 : 0)
            : Math.round(((currentWeekUptime - previousWeekUptime) / previousWeekUptime) * 100);

        // 2. Consistency Ratio (Active Days / Total Days since joining)
        const joinDate = new Date(user.createdAt);
        const totalDaysSinceJoining = Math.max(1, Math.ceil((now - joinDate) / (1000 * 60 * 60 * 24)));
        const activeDaysCount = activeDaysSet.size;
        const consistencyRatio = Math.min(100, Math.round((activeDaysCount / totalDaysSinceJoining) * 100));

        // 3. Recovery Rate (Days since last activity - inverse score)
        const lastActiveDate = user.watchHistory && user.watchHistory.length > 0
            ? new Date(user.watchHistory[user.watchHistory.length - 1].timestamp)
            : joinDate;
        const daysSinceLastActivity = Math.floor((now - lastActiveDate) / (1000 * 60 * 60 * 24));
        const recoveryScore = Math.max(0, 100 - (daysSinceLastActivity * 10)); // Loses 10 points every day idle

        // --- REAL ACTIVITY DATA (Uptime Tracker) ---
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activityMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

        if (user.watchHistory && user.watchHistory.length > 0) {
            user.watchHistory.forEach(history => {
                const date = new Date(history.timestamp);
                if (date >= oneWeekAgo) {
                    const dayName = days[date.getDay()];
                    activityMap[dayName] = (activityMap[dayName] || 0) + 0.25;
                }
            });
        }

        const realActivityData = Object.keys(activityMap).map(name => ({
            name,
            hours: Number(activityMap[name].toFixed(2))
        }));

        // All-time hours calculation
        const allTimeHours = (user.watchHistory?.length || 0) * 0.25;

        // --- SKILL DOMINATION (Categories) ---
        const categoryData = skillsData.length > 0 ? skillsData : [
            { subject: 'Strategy', A: 80, fullMark: 100 },
            { subject: 'Tactics', A: 70, fullMark: 100 },
            { subject: 'Execution', A: 90, fullMark: 100 }
        ];

        // --- SECTOR ISOLATION (Progress) ---
        const progressDistribution = [
            { name: 'Completed', value: completedCount, fill: '#10b981' },
            { name: 'In Progress', value: inProgressCount, fill: '#6366f1' },
            { name: 'Not Started', value: notStartedCount, fill: '#f59e0b' },
        ];

        const streak = user.streak || 0;
        const currentDayName = days[new Date().getDay()];
        const dailyMinutes = Math.round((activityMap[currentDayName] || 0) * 60);

        res.json({
            enrolledCourses: enrolledCount,
            completedCourses: completedCount,
            avgProgress,
            certificatesEarned: completedCount,
            hoursLearned: Number(allTimeHours.toFixed(1)),
            weeklyHours: Number(currentWeekUptime.toFixed(1)),
            activityData: realActivityData,
            skillsData: categoryData,
            progressDistribution,
            streak,
            dailyMinutes,
            currentDay: totalDaysSinceJoining,
            dailyGoalProgress: Math.min(100, Math.round((dailyMinutes / 60) * 100)), // Goal: 60 mins
            // Advanced Human-Centric Metrics
            weeklyMomentum,
            consistencyRatio,
            recoveryScore
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
            duration: calculateTotalDuration(sections || course.sections)
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
