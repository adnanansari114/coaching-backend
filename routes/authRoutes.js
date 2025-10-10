const express = require('express');
const { sendOTP, verifyOTP, registerUser, loginUser, changePassword, forgetPassword, resetPassword } = require('../controllers/authController');
const router = express.Router();
const { body } = require('express-validator');

// Routes for OTP and registration
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail()
], sendOTP);
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], verifyOTP);
router.post('/register', [
  body('name').notEmpty(),
  body('username').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'teacher'])
], registerUser);
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], loginUser);
router.post('/change-password', [
  body('email').isEmail().normalizeEmail(),
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').notEmpty()
], changePassword);
router.post('/forget-password', [
  body('email').isEmail().normalizeEmail()
], forgetPassword);
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').notEmpty()
], resetPassword);

module.exports = router;