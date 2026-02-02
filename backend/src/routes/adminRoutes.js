const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    createTeacher,
    getAllTeachers,
    getAllStudents,
    getDashboardStats,
    getAllCourses,
    deleteUser,
    deleteCourse
} = require('../controllers/adminController');

router.use(protect);
router.use(admin);

router.post('/teachers', createTeacher);
router.get('/teachers', getAllTeachers);
router.get('/students', getAllStudents);
router.get('/stats', getDashboardStats);
router.get('/courses', getAllCourses);
router.delete('/users/:id', deleteUser);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
