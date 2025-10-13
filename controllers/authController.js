const User = require('../models/User');
// const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

// Setup Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// Generate JWT Token
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const existingOTP = await OTP.findOne({ email: email.toLowerCase() });
    if (existingOTP) {
      return res.status(400).json({ message: 'OTP already sent. Please wait 5 minutes or try again.' });
    }

    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp });

    await sendEmail({
      email,
      subject: 'Your OTP for Registration',
      message: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    });

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await OTP.deleteOne({ email: email.toLowerCase(), otp });
    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, username, email, password, role } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    if (otpRecord) {
      return res.status(400).json({ message: 'Please verify OTP first.' });
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already taken.' });
    }

    const user = new User({
      name,
      username,
      email: email.toLowerCase(),
      password,
      role: role || 'user'
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful! Please wait for admin approval.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // agar email ya password invalid hai to yahan se 400 return karega
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Forget Password - Send OTP
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const existingOTP = await OTP.findOne({ email: email.toLowerCase() });
    if (existingOTP) {
      return res.status(400).json({ message: 'OTP already sent. Please wait 5 minutes or try again.' });
    }

    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp });

    await sendEmail({
      email,
      subject: 'Your OTP for Password Reset',
      message: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    });

    res.status(200).json({ message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    console.error('Error sending forget password OTP:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();
    await OTP.deleteOne({ email: email.toLowerCase(), otp });
    console.log('Password reset for:', email);
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};


module.exports = {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword
};