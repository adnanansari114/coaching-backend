// routes/adminRoutes.js

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const {  getAdminStats, getAdminProfile, updateAdminProfile, getAllUsers, updateUserRole, } = require('../controllers/adminController');
const router = express.Router();

// Get all users (admin only)
router.get('/stats', protect, admin, getAdminStats);
// Get profile
router.get('/profile', protect, admin, getAdminProfile);
router.put("/profile", protect, admin, updateAdminProfile);
//get all user
router.get('/users', protect, admin, getAllUsers);
// Approve or change user role (admin only)
router.put('/approve/:userId', protect, admin, updateUserRole);

module.exports = router;