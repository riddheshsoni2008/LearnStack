import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  lessonId: mongoose.Types.ObjectId;
  questions: {
    _id: mongoose.Types.ObjectId;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  passingScore: number;
}

const QuizSchema = new Schema<IQuiz>({
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,    // index of correct option (0-3)
      required: true
    },
    explanation: {
      type: String,    // why this answer is correct
      default: ''
    }
  }],
  passingScore: {
    type: Number,
    default: 60       // percentage needed to pass
  }
}, {
  timestamps: true
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
