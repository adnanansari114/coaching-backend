// models/Quiz.js

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    // Removed the redundant 'course' field
    title: { type: String, required: true },
    description: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }, // Changed ref to 'Class'
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true }
    }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isRealTime: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);