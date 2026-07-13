import mongoose, { Document, Schema } from 'mongoose';

export interface IExerciseHistoryDaily extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // Format YYYY-MM-DD
  completedExercises: {
    exerciseId: mongoose.Types.ObjectId;
    exerciseType: 'Lesson' | 'GameLevel';
    trackId?: mongoose.Types.ObjectId;
    title: string;
    completedAt: Date;
    score: number;
  }[];
  xpHistory: {
    amount: number;
    source: 'quiz' | 'lesson' | 'coding_challenge' | 'streak' | 'badge' | 'perfect_score' | 'daily_challenge' | 'mystery_box' | 'store_purchase' | 'level_up';
    description: string;
    referenceId: mongoose.Types.ObjectId | null;
    levelBefore: number;
    levelAfter: number;
    createdAt: Date;
  }[];
  totalXpEarnedToday: number;
}

const ExerciseHistoryDailySchema = new Schema<IExerciseHistoryDaily>({
  userId: {
    type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'completedExercises.exerciseType'
    },
    exerciseType: {
      type: String,
      enum: ['Lesson', 'GameLevel'],
      default: 'Lesson'
    },
    trackId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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

export default mongoose.model<IExerciseHistoryDaily>('ExerciseHistoryDaily', ExerciseHistoryDailySchema);
