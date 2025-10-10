// routes/adminRoutes.js

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { teacher } = require('../middleware/roleMiddleware');
const {  updateProfile, getAllUsers, getProfile } = require('../controllers/userController');
const router = express.Router();
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/allusers', protect, teacher, getAllUsers);

module.exports = router;