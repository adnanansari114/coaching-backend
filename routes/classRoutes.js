// routes/classRoutes.js

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { teacher, student } = require('../middleware/roleMiddleware');
const {
  createClass,
  getTeacherClasses,
  addStudentsToClass,
  getStudentClasses,
  takeAttendance,
  getStudentAttendance,
  getClassAttendanceData,
  getStudentsOfClass
} = require('../controllers/classController');
 
const router = express.Router();

// Teacher routes
router.post('/create', protect, teacher, createClass);
router.get('/teacher', protect, teacher, getTeacherClasses);
router.post('/:classId/add-students', protect, teacher, addStudentsToClass);
router.get('/:classId/students', protect, teacher, getStudentsOfClass); // New route to get students
router.post('/:classId/attendance', protect, teacher, takeAttendance);
router.get('/:classId/attendance-data', protect, teacher, getClassAttendanceData);

// Student routes
router.get('/my-classes', protect, student, getStudentClasses);
router.get('/:classId/attendance', protect, student, getStudentAttendance);


module.exports = router;