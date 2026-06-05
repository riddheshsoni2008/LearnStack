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
  }]
}, {
  timestamps: true
});

// Ensure one document per user per day
ExerciseHistoryDailySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ExerciseHistoryDaily', ExerciseHistoryDailySchema);
