const { model } = require('mongoose');
const Course = require('../models/Course'); 
const User = require('../models/User');

// Get admin stats (students, teachers, courses count)
const getAdminStats = async (req, res) => {
    try {
        const studentsCount = await User.countDocuments({ role: 'student' });
        const teachersCount = await User.countDocuments({ role: 'teacher' });
        const coursesCount = await Course.countDocuments();

        res.status(200).json({
            students: studentsCount,
            teachers: teachersCount,
            courses: coursesCount
        });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};
// Update Admin Profile
const updateAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        admin.name = req.body.name || admin.name;
        admin.email = req.body.email || admin.email;
        if (req.body.password) {
            admin.password = req.body.password; 
        }

        await admin.save();
        res.status(200).json({ message: "Profile updated successfully", admin });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};
const getAdminProfile = async (req, res) =>{
    try {
        const admin = await User.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }
        res.status(200).json({ admin });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
}
// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};
// Approve or change user role (admin only)
const updateUserRole = async (req, res) => {
    const userId = req.params.userId;
    const { role } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Cannot change the role of an admin." });
        }
        user.role = role;
        await user.save();
        res.status(200).json({ message: "User role updated successfully.", user });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};


module.exports = {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    updateAdminProfile,
    getAdminProfile
};




