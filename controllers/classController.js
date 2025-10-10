const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ClassStudent = require('../models/ClassStudent');
const Course = require('../models/Course'); // Assuming you have a Course model
const { getIO } = require('../socket');
const { model } = require('mongoose');

const createClass = async (req, res) => {
  const { title, courseId, date, section } = req.body;
  const teacherId = req.user.id;

  if (!title || !courseId || !date) {
    return res.status(400).json({ message: "Please provide a title, course, and date." });
  }

  try {
    const newClass = new Class({
      teacher: teacherId,
      title,
      course: courseId,
      date,
      section
    });
    await newClass.save();

    const io = req.app.get("socketio");
    if (io) {
      io.emit("newClass", {
        message: `A new class for "${newClass.title}" has been scheduled.`,
        classId: newClass._id,
      });
    }

    res.status(201).json({ message: "Class created successfully.", newClass });
  } catch (error) {
    console.error("Error creating class", error);
    res.status(500).json({ message: "Server error." });
  }
};

// TEACHER ONLY: Get all classes they created
const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const classes = await Class.find({ teacher: teacherId })
      .populate('course', 'title')
      .populate('teacher', 'name email');
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    res.status(500).json({ message: "Failed to fetch classes." });
  }
};

// TEACHER ONLY: Add students to a class
const addStudentsToClass = async (req, res) => {
  const { classId } = req.params;
  const { studentEmails } = req.body;
  const teacherId = req.user.id;

  try {
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found." });
    }

    if (classObj.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Forbidden. You are not the teacher of this class." });
    }

    const students = await User.find({ email: { $in: studentEmails }, role: 'student' });
    const studentIds = students.map(s => s._id);

    const newClassStudents = studentIds.map(studentId => ({
      class: classId,
      student: studentId
    }));

    await ClassStudent.insertMany(newClassStudents);

    res.status(200).json({ message: "Students added to class successfully." });
  } catch (error) {
    console.error("Error adding students to class:", error);
    res.status(500).json({ message: "Server error while adding students to class." });
  }
};

// STUDENT ONLY: Get all classes they are in
const getStudentClasses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentClasses = await ClassStudent.find({ student: studentId })
      .populate({
        path: 'class',
        populate: [
          { path: 'teacher', select: 'name email' },
          { path: 'course', select: 'title' }
        ]
      });

    const classes = studentClasses.map(item => item.class);
    res.status(200).json({ classes });
  } catch (error) {
    console.error("Error fetching student classes:", error);
    res.status(500).json({ message: "Failed to fetch student classes." });
  }
};

// TEACHER ONLY: Take attendance for a class
const takeAttendance = async (req, res) => {
  const { classId } = req.params;
  const { attendanceData, date } = req.body; 
  try {
    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });

    if (classObj.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Forbidden. You are not the teacher of this class." });
    }

    const existingAttendance = await Attendance.findOne({ class: classId, date: new Date(date) });
    if (existingAttendance) {
      return res.status(409).json({ message: "Attendance for this class on this date has already been recorded." });
    }

    for (const record of attendanceData) {
      const isStudentInClass = await ClassStudent.findOne({
        class: classId,
        student: record.studentId,
      });

      if (!isStudentInClass) {
        console.warn(`Student ${record.studentId} is not in this class.`);
        continue;
      }

      await Attendance.create({
        class: classId,
        student: record.studentId,
        status: record.status,
        date: new Date(date),
      });
    }

    res.status(200).json({ message: "Attendance saved successfully." });
  } catch (error) {
    console.error("Error taking attendance:", error);
    res.status(500).json({ message: "Server error while taking attendance.", error });
  }
};

// TEACHER ONLY: Get all attendance data for a specific class
const getClassAttendanceData = async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  try {
    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found." });

    if (classObj.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Forbidden. You are not the teacher of this class." });
    }

    const attendanceRecords = await Attendance.find({ class: classId }).populate('student', 'name email').sort({ date: 1 });

    const attendanceData = {};
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!attendanceData[dateKey]) {
        attendanceData[dateKey] = [];
      }
      attendanceData[dateKey].push({
        student: record.student,
        status: record.status
      });
    });

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error("Error fetching class attendance data:", error);
    res.status(500).json({ message: "Server error while fetching attendance data." });
  }
};

// STUDENT ONLY: Get my attendance for a specific class
const getStudentAttendance = async (req, res) => {
  const { classId } = req.params;
  const studentId = req.user.id;
  try {
    const attendance = await Attendance.find({ class: classId, student: studentId }).sort({ date: 1 });
    if (attendance.length === 0) {
      return res.status(404).json({ message: "No attendance records found for you in this class." });
    }
    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Server error while fetching attendance." });
  }
};
const getStudentsOfClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found." });
    }
    if (classObj.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: "Forbidden. You are not the teacher of this class." });
    }

    const studentsInClass = await ClassStudent.find({ class: classId })
      .populate('student', 'name email');

    res.status(200).json(studentsInClass);
  } catch (error) {
    console.error("Error fetching students for class:", error);
    res.status(500).json({ message: "Server error while fetching students." });
  }
};

module.exports = {
  createClass,
  getTeacherClasses,
  addStudentsToClass,
  getStudentClasses,
  takeAttendance,
  getClassAttendanceData,
  getStudentAttendance,
  getStudentsOfClass
};