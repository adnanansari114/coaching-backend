// models/QuizSubmission.js

const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        selectedOption: { type: String, required: true },
    }],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);