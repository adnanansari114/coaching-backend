const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db'); // config/db.js uses CommonJS
const { initSocket } = require('./socket'); // we'll convert socket.js to CommonJS below

// routes (keep these as they are in your repo)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const topperRoutes = require('./routes/topperRoutes');
const classRoutes = require('./routes/classRoutes');

const app = express();
const server = http.createServer(app);

// connect to DB
connectDB();

// socket init
initSocket(server);

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://coaching-frontend-ktd0.onrender.com',
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads correctly (use absolute path relative to this file)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/toppers', topperRoutes);
app.use('/api/reviews', reviewRoutes);

// If you want to serve frontend build from backend in production, add here
// e.g., app.use(express.static(path.join(__dirname, '../frontend/dist')))

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
