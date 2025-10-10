const Quiz = require('../models/Quiz');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const QuizSubmission = require('../models/QuizSubmission'); 
const User = require('../models/User');
const { getIO } = require('../socket');

const createQuiz = async (req, res) => {
    const {
        title,
        description,
        targetClassId,
        questions,
        startTime,
        endTime,
        isRealTime = true,
    } = req.body;
    const teacherId = req.user.id; 

    if (!title || !targetClassId || !questions || questions.length === 0 || !startTime || !endTime) {
        return res.status(400).json({ message: "Please provide all required fields." });
    }

    try {
        const targetClass = await Class.findById(targetClassId);
        if (!targetClass) {
            return res.status(404).json({ message: "Target class not found." });
        }
        if (targetClass.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "Forbidden. You are not the teacher of this class." });
        }
        const newQuiz = new Quiz({
            title,
            description,
            teacher: teacherId,
            targetClass: targetClassId,
            questions,
            startTime,
            endTime,
            isRealTime,
        });

        await newQuiz.save();

        const io = getIO();
        if (io) {
            io.to(targetClassId).emit('new_quiz_available', {
                quizId: newQuiz._id,
                title: newQuiz.title,
                message: `A new quiz "${newQuiz.title}" has been created!`,
            });
            console.log(`🚀 New quiz notification sent to room: ${targetClassId}`);
        } else {
            console.warn("Socket.io is not initialized. Cannot send real-time notification.");
        }

        res.status(201).json({ 
            message: "Quiz created successfully.",
            quiz: newQuiz 
        });

    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ message: "Server error while creating quiz." });
    }
};



// STUDENT ONLY: Get a single quiz by ID for a student to take
const getQuizForStudent = async (req, res) => {
    const { quizId } = req.params;
    const studentId = req.user.id;
    try {
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        if (!quiz.targetClass) {
            return res.status(500).json({ message: "Quiz data is corrupted: Missing target class." });
        }

        const now = new Date();
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(quiz.endTime);

        if (now < startTime || now > endTime) {
            return res.status(403).json({ message: "Quiz is not currently available." });
        }

        const studentEnrollment = await ClassStudent.findOne({ student: studentId, class: quiz.targetClass });
        if (!studentEnrollment) {
            return res.status(403).json({ message: "Forbidden. You are not authorized to take this quiz." });
        }
        
        const existingSubmission = await QuizSubmission.findOne({ quiz: quizId, student: studentId });
        if (existingSubmission) {
            return res.status(403).json({ message: "You have already submitted this quiz." });
        }

        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error fetching quiz for student:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// STUDENT ONLY: Submit quiz answers and calculate score
const submitQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const existingSubmission = await QuizSubmission.findOne({ quiz: quizId, student: studentId });
        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted this quiz." });
        }

        let score = 0;
        const totalQuestions = quiz.questions.length;

        for (const submittedAnswer of answers) {
            const question = quiz.questions.id(submittedAnswer.questionId);
            if (question && question.correctAnswer === submittedAnswer.selectedOption) {
                score++;
            }
        }

        const newSubmission = new QuizSubmission({
            quiz: quizId,
            student: studentId,
            answers: answers,
            score: score,
            totalQuestions: totalQuestions,
        });

        await newSubmission.save();
        
        const io = getIO();
        io.to(quiz.teacher.toString()).emit('studentQuizSubmitted', {
            quizId: quizId,
            studentId: studentId,
            score: score,
        });
        
        const submissionWithDetails = await QuizSubmission.findById(newSubmission._id).populate('quiz').populate('student');
        res.status(201).json(submissionWithDetails);

    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// STUDENT ONLY: Get the result of a submitted quiz
const getStudentQuizResult = async (req, res) => {
    const { quizId } = req.params;
    const studentId = req.user.id;
    try {
        const submission = await QuizSubmission.findOne({ quiz: quizId, student: studentId })
            .populate({
                path: 'quiz',
                populate: { path: 'questions' } 
            })
            .populate('student', 'name email');
        
        if (!submission) {
            return res.status(404).json({ message: "Submission not found." });
        }
        
        res.status(200).json(submission);
    } catch (error) {
        console.error("Error fetching quiz result:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// TEACHER ONLY: View all quizzes for their class
const getTeacherQuizzes = async (req, res) => {
    const { classId } = req.params;
    const teacherId = req.user.id;
    try {
        const classObj = await Class.findById(classId);
        if (!classObj || classObj.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "Forbidden. You are not authorized to view this class." });
        }
        const quizzes = await Quiz.find({ targetClass: classId }).populate('targetClass', 'title');
        res.status(200).json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes for teacher:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// TEACHER ONLY: View all submissions for a specific quiz
const getQuizSubmissionsForTeacher = async (req, res) => {
    const { quizId } = req.params;
    const teacherId = req.user.id;
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "Forbidden. You are not the teacher of this quiz." });
        }
        const submissions = await QuizSubmission.find({ quiz: quizId }).populate('student', 'name email');
        res.status(200).json(submissions);
    } catch (error) {
        console.error("Error fetching quiz submissions for teacher:", error);
        res.status(500).json({ message: "Server error." });
    }
};


// STUDENT ONLY: Get all quizzes for the classes the student is in
const getStudentQuizzes = async (req, res) => {
    const studentId = req.user.id;
    try {
        const studentEnrollments = await ClassStudent.find({ student: studentId }).populate('class');
        const classIds = studentEnrollments.map(enrollment => enrollment.class._id);
        
        const quizzes = await Quiz.find({ targetClass: { $in: classIds } }).populate('targetClass', 'title');
        
        // You can add logic here to only show quizzes within the start/end time
        const now = new Date();
        const availableQuizzes = quizzes.filter(quiz => {
            const startTime = new Date(quiz.startTime);
            const endTime = new Date(quiz.endTime);
            return now >= startTime && now <= endTime;
        });

        res.status(200).json(availableQuizzes);
    } catch (error) {
        console.error("Error fetching quizzes for student:", error);
        res.status(500).json({ message: "Server error." });
    }
};


module.exports = {
    createQuiz,
    getQuizForStudent,
    getStudentQuizResult,
    getTeacherQuizzes,
    getQuizSubmissionsForTeacher,
    submitQuiz,
    getStudentQuizzes   
};
    