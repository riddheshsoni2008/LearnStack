const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Quiz', QuizSchema);
