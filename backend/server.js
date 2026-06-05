const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tracks', require('./routes/track.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/quiz', require('./routes/quiz.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/badges', require('./routes/badge.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/arcade', require('./routes/arcade.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 LearnStack API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
});
