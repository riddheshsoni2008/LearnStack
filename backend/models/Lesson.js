const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,     // YouTube video ID (e.g. "dQw4w9WgXcQ")
    default: ''
  },
  content: {
    type: String,     // Short explanation / notes (supports markdown)
    default: ''
  },
  codeSnippet: {
    type: String,     // Code example
    default: ''
  },
  language: {
    type: String,     // Programming language for syntax highlighting
    default: 'javascript'
  },
  xpReward: {
    type: Number,
    default: 10
  },
  order: {
    type: Number,
    default: 0
  },
  challenge: {
    type: String,     // Optional mini coding challenge description
    default: ''
  },
  resources: [{
    title: { type: String },
    url: { type: String }
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', LessonSchema);
