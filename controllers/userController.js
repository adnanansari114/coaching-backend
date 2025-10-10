// controllers/userController.js

const User = require('../models/User');

const getProfile = async (req, res) => {
    try {
        // req.user JWT token se aayega
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    } 
};
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};
const updateProfile = async (req, res) => {
    const { gender, class: userClass, subject, interest, career } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update profile fields
        user.profile.gender = gender || user.profile.gender;
        user.profile.class = userClass || user.profile.class;
        user.profile.subject = subject || user.profile.subject;
        user.profile.interest = interest || user.profile.interest;
        user.profile.career = career || user.profile.career;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = { 
    getProfile,
    updateProfile,
    getAllUsers
};  