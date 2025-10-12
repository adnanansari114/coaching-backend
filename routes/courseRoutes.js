const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { user, teacher, student } = require('../middleware/roleMiddleware');
const {  
    createCourse, 
    getTeacherCourses,
    addNotesAndQuiz, 
    getAllCourses, 
    getCourseNotesAndQuiz,
    submitQuiz,
    updateCourse,
    deleteCourse,
    // updateNotesAndQuiz,

     
    getCourse,
    downloadPDF,
    
    
} = require('../controllers/courseController');
const multer = require('multer'); 
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Public route for getting ALL courses. This is what you need.
router.get('/', protect, getAllCourses);
// Teacher-specific routes
router.post('/create', protect, teacher, createCourse);
router.get('/teacher/courses', protect, teacher, getTeacherCourses);
router.put('/:courseId/add-content', protect, teacher, upload.single('pdfFile'), addNotesAndQuiz);
router.get('/:courseId/notes', protect, getCourseNotesAndQuiz);
router.post('/:courseId/quiz/submit', protect, submitQuiz);
// TEACHER ONLY: Update a course by ID
router.put('/:courseId', protect, teacher, updateCourse);

// TEACHER ONLY: Delete a course by ID
router.delete('/:courseId', protect, teacher, deleteCourse);

// router.put('/:courseId/content', protect, teacher, upload.single('pdfFile'), updateNotesAndQuiz);

// Corrected Public route for getting a single course by ID
router.get('/:courseId', protect, getCourse);

// Student-specific routes
router.get('/:courseId/notes/:noteId/download', protect, student, downloadPDF);

module.exports = router;
