// models/Course.js

const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    pdfPath: { type: String }
});

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
});
 
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: [notesSchema],
    quiz: [quizSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);