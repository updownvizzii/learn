const express = require('express');
const fs = require('fs');
const router = express.Router();
const {
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
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Routes
router.get('/', getAllCourses);
router.get('/my-courses', protect, getTeacherCourses);
router.get('/enrolled', protect, getEnrolledCourses);
router.get('/teacher-stats', protect, getTeacherStats);
router.get('/student-stats', protect, getStudentStats);
router.post('/', protect, createCourse);

// Parameterized Routes (Must be at the bottom)
router.get('/:id', getCourseById);
router.post('/:id/enroll', protect, enrollInCourse);
router.post('/:id/lectures/:lectureId/complete', protect, markLectureCompleted);
router.get('/:id/certificate', protect, getCertificate);
router.delete('/:id', protect, deleteCourse);
router.put('/:id', protect, updateCourse);

// Transcription routes
const transcriptionController = require('../controllers/transcriptionController');
router.post('/:courseId/lectures/:lectureId/transcribe', protect, transcriptionController.transcribeLecture);
router.get('/:courseId/lectures/:lectureId/transcript', protect, transcriptionController.getLectureTranscript);
router.post('/:courseId/transcribe-all', protect, transcriptionController.transcribeAllLectures);

const cloudflareStream = require('../services/cloudflareStreamService');

// Upload route removed in favor of UploadThing
// See /api/uploadthing in server.js

// Get video playback URL (with enrollment check)
router.get('/:courseId/video/:videoUid', protect, async (req, res) => {
    try {
        const { courseId, videoUid } = req.params;

        // Check if user is enrolled in the course
        const course = await require('../models/Course').findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await require('../models/User').findById(req.user._id);
        const isEnrolled = user.enrolledCourses.some(
            enroll => enroll.courseId.toString() === courseId
        );

        if (!isEnrolled && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Generate playback URL
        const playbackUrl = cloudflareStream.getStreamPlayerUrl(videoUid);
        const iframeUrl = cloudflareStream.getIframeUrl(videoUid);

        res.json({
            playbackUrl,
            iframeUrl,
            videoUid
        });
    } catch (error) {
        console.error('Video playback error:', error);
        res.status(500).json({ message: 'Failed to get video playback URL' });
    }
});

module.exports = router;
