// routes/reviewRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { student, teacher } = require('../middleware/roleMiddleware');
const { createReview, getCourseReviews, getTeacherReviews } = require('../controllers/reviewController');

const router = express.Router();

// Teacher-specific routes (must come first to avoid conflict)
router.get('/teacher/my-reviews', protect, teacher, getTeacherReviews);

// Student-specific routes
router.post('/submit/:courseId', protect, student, createReview);

// Public routes for logged-in users (viewing reviews)
router.get('/:courseId', protect, getCourseReviews);

module.exports = router;
