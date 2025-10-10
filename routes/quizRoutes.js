// routes/quizRoutes.js

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { teacher, student } = require('../middleware/roleMiddleware');
const { 
    createQuiz,
    getQuizForStudent,
    submitQuiz,
    getStudentQuizResult,
    getStudentQuizzes,
    getTeacherQuizzes,
    getQuizSubmissionsForTeacher,
} = require('../controllers/quizController');

const router = express.Router();

// Public routes for quiz (if needed, but for security, keep them protected)
// router.get('/:quizId', getQuizById); // Example

// Teacher routes
router.post('/', protect, teacher, createQuiz);
router.get('/class/:classId', protect, teacher, getTeacherQuizzes); // Get all quizzes for a class (for teacher)
router.get('/:quizId/submissions', protect, teacher, getQuizSubmissionsForTeacher); // Get all submissions for a quiz (for teacher)

// Student routes
router.get('/', protect, student, getStudentQuizzes); 
router.get('/:quizId', protect, student, getQuizForStudent); // Student views a specific quiz to take
router.post('/:quizId/submit', protect, student, submitQuiz); // Student submits answers
router.get('/:quizId/result', protect, student, getStudentQuizResult); // Student views their result

module.exports = router;