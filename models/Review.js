// models/Review.js

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating between 1 and 5.']
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment.']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Prevent a student from leaving more than one review for a single course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);