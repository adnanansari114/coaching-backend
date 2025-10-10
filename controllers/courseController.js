const Course = require('../models/Course');
const multer = require('multer');

const storage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// TEACHER ONLY: Create a new course
const createCourse = async (req, res) => {
    const { title, description } = req.body;
    const teacherId = req.user.id;

    try {
        const newCourse = new Course({
            title,
            description,
            teacher: teacherId
        });
        await newCourse.save();
        res.status(201).json({ message: "Course created successfully.", course: newCourse });
    } catch (error) {
        res.status(500).json({ message: "Failed to create course." });
    }
};
// TEACHER ONLY: Get all courses for the logged-in teacher
const getTeacherCourses = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const courses = await Course.find({ teacher: teacherId }).populate('teacher', 'name email');
        res.status(200).json({ courses });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch teacher courses." });
    }
};
// TEACHER ONLY: Add notes and quiz to a course
const addNotesAndQuiz = async (req, res) => {
    const { courseId } = req.params;
    const { notes, quiz } = req.body;
    const teacherId = req.user.id;
    const pdfPath = req.file ? req.file.path : null;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        if (course.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized to edit this course." });
        }

        course.notes.push({ ...JSON.parse(notes), pdfPath });
        course.quiz = JSON.parse(quiz);

        await course.save();
        res.status(200).json({ message: "Notes and quiz added successfully.", course });
    } catch (error) {
        res.status(500).json({ message: "Failed to add notes and quiz." });
    }
};
// ALL LOGGED-IN USERS: Get all courses with pagination
const getAllCourses = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const courses = await Course.find()
            .populate('teacher', 'name email')
            .limit(limit)
            .skip(skip);

        const totalCourses = await Course.countDocuments();
        const totalPages = Math.ceil(totalCourses / limit);

        res.status(200).json({
            courses,
            page,
            totalPages,
            totalCourses,
            limit
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch courses." });
    }
};
// ALL LOGGED-IN USERS: Get course notes and quiz
const getCourseNotesAndQuiz = async (req, res) => {
    const { courseId } = req.params;
    try {
        const course = await Course.findById(courseId).select('notes quiz');
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch course details." });
    }
};
const submitQuiz = async (req, res) => {
    const { courseId } = req.params;
    const userAnswers = req.body.answers;

    try {
        const course = await Course.findById(courseId).select('quiz');
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        let score = 0;
        const totalQuestions = course.quiz.length;
        const correctAnswersMap = new Map();
        course.quiz.forEach(q => {
            correctAnswersMap.set(q._id.toString(), q.correctAnswer);
        });

        userAnswers.forEach((answer, index) => {
            const questionId = course.quiz[index]._id.toString(); 
            if (correctAnswersMap.has(questionId)) {
                if (answer === correctAnswersMap.get(questionId)) {
                    score++;
                }
            }
        });

        res.status(200).json({
            message: "Quiz submitted successfully.",
            score,
            totalQuestions
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to submit quiz." });
    }
};
// STUDENT ONLY: Download PDF
const downloadPDF = async (req, res) => {
    const { courseId, noteId } = req.params;
    const studentId = req.user.id;
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Only students can download this file." });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        const note = course.notes.id(noteId);
        if (!note || !note.pdfPath) {
            return res.status(404).json({ message: "PDF not found." });
        }

        res.download(note.pdfPath);
    } catch (error) {
        res.status(500).json({ message: "Failed to download file." });
    }
};

// Update course (title/description). Also allow replacing whole quiz array and notes metadata (no file upload here)
const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const teacherId = req.user.id;
    const { title, description, quiz, notes } = req.body;


    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        if (course.teacher.toString() !== teacherId) return res.status(403).json({ message: 'Not authorized.' });


        if (title) course.title = title;
        if (description) course.description = description;

        if (quiz) {
            course.quiz = typeof quiz === 'string' ? JSON.parse(quiz) : quiz;
        }


        if (notes) {
            course.notes = typeof notes === 'string' ? JSON.parse(notes) : notes;
        }


        await course.save();
        res.status(200).json({ message: 'Course updated successfully.', course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update course.' });
    }
};

// TEACHER ONLY: Delete a course
const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }
        if (course.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized to delete this course." });
        }
        await course.deleteOne();
        res.status(200).json({ message: "Course deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete course." });
    }
};















const getCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await Course.findById(courseId).populate('teacher', 'name email');
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch course details." });
    }
};


module.exports = {
    createCourse,
    getTeacherCourses,
    addNotesAndQuiz,
    getAllCourses,
    getCourseNotesAndQuiz,
    submitQuiz,
    downloadPDF,
    updateCourse,
    deleteCourse,
    getCourse
};