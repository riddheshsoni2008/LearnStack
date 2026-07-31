import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Initialize automated background tasks
import { startCronJob } from './services/hackathonCron.service';
startCronJob();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import Routes
import authRoutes from './routes/auth.routes';
import trackRoutes from './routes/track.routes';
import lessonRoutes from './routes/lesson.routes';
import quizRoutes from './routes/quiz.routes';
import progressRoutes from './routes/progress.routes';
import badgeRoutes from './routes/badge.routes';
import badgeCleanRoutes from './src/modules/badge/infrastructure/routes/badgeClean.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import arcadeRoutes from './routes/arcade.routes';
import aiRoutes from './routes/ai.routes';
import certificateRoutes from './routes/certificate.routes';
import statsRoutes from './routes/stats.routes';
import hackathonRoutes from './routes/hackathon.routes';
import hackathonQuestionRoutes from './routes/hackathonQuestion.routes';
import roundAutomationRoutes from './routes/roundAutomation.routes';
import projectWorkspaceRoutes from './routes/projectWorkspace.routes';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/v2/badges', badgeCleanRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/arcade', arcadeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/hackathon-questions', hackathonQuestionRoutes);

// ── Automated Round 2 APIs ──
app.use('/api', roundAutomationRoutes);
app.use('/api/project-workspace', projectWorkspaceRoutes);

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 LearnStack API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health\n`);
});
