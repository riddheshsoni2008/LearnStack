const mongoose = require('mongoose');

const ExerciseHistoryDailySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
    // Format YYYY-MM-DD
  },
  completedExercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'completedExercises.exerciseType'
    },
    exerciseType: {
      type: String,
      enum: ['Lesson', 'GameLevel'],
      default: 'Lesson'
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    },
    title: {
      type: String,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    }
  }],
  xpHistory: [{
    amount: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      enum: ['quiz', 'lesson', 'coding_challenge', 'streak', 'badge', 'perfect_score', 'daily_challenge', 'mystery_box', 'store_purchase', 'level_up'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    levelBefore: {
      type: Number,
      default: 1
    },
    levelAfter: {
      type: Number,
      default: 1
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalXpEarnedToday: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure one document per user per day
ExerciseHistoryDailySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ExerciseHistoryDaily', ExerciseHistoryDailySchema);
