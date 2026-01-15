const express = require('express');
const fs = require('fs');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    getEnrolledCourses,
    enrollInCourse
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Routes
router.get('/', getAllCourses);
router.get('/my-courses', protect, getTeacherCourses);
router.get('/enrolled', protect, getEnrolledCourses);
router.post('/', protect, createCourse);

// Parameterized Routes (Must be at the bottom)
router.get('/:id', getCourseById);
router.post('/:id/enroll', protect, enrollInCourse);

const cloudflareStream = require('../services/cloudflareStreamService');

router.post('/upload', protect, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    try {
        const files = req.files;
        const responseData = {};

        const handleUpload = async (fieldName) => {
            if (files[fieldName]) {
                const file = files[fieldName][0];

                // If it's a video, upload to Cloudflare Stream
                if (fieldName === 'video') {
                    const result = await cloudflareStream.uploadVideo(file.path, file.originalname);
                    // Remove local file after successful upload
                    fs.unlinkSync(file.path);
                    return result.uid; // Store the Cloudflare Stream UID
                } else {
                    // For thumbnails, keep local
                    return `/uploads/${file.filename}`;
                }
            }
            return null;
        };

        if (files.video) {
            responseData.videoUrl = await handleUpload('video');
        }
        if (files.thumbnail) {
            responseData.thumbnailUrl = await handleUpload('thumbnail');
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
});

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
