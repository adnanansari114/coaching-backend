// controllers/reviewController.js

const Review = require('../models/Review');
const Course = require('../models/Course');
 
// STUDENT ONLY: Create a new review for a course
const createReview = async (req, res) => {
    const { courseId, rating, comment } = req.body;
    const studentId = req.user.id;

    try {
        const existingReview = await Review.findOne({ course: courseId, student: studentId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this course." });
        }

        const newReview = new Review({
            rating,
            comment,
            course: courseId,
            student: studentId
        });
        await newReview.save();
        res.status(201).json({ message: "Review added successfully.", review: newReview });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to add review." });
    }
};

// ALL LOGGED-IN USERS: Get all reviews for a specific course
const getCourseReviews = async (req, res) => {
    const { courseId } = req.params;

    try {
        const reviews = await Review.find({ course: courseId }).populate('student', 'name email');
        
        // Calculate average rating
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            reviews,
            averageRating: Number(averageRating.toFixed(1))
});
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reviews." });
    }
};

// TEACHER ONLY: Get reviews for all their courses
const getTeacherReviews = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const courses = await Course.find({ teacher: teacherId }).select('_id');
        const courseIds = courses.map(course => course._id);
        
        const reviews = await Review.find({ course: { $in: courseIds } })
            .populate('course', 'title')
            .populate('student', 'name email');

        // Calculate average rating across all courses
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            reviews,
            averageRating: Number(averageRating.toFixed(1))
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch teacher reviews." });
    }
};

module.exports = {
    createReview,
    getCourseReviews,
    getTeacherReviews
};  