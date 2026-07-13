import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  trackId: mongoose.Types.ObjectId;
  weekNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  content: string;
  codeSnippet: string;
  language: string;
  xpReward: number;
  order: number;
  challenge: string;
  codingChallenge: {
    title: string;
    description: string;
    starterCode: string;
    expectedOutput: string;
    hint: string;
  };
  resources: { title: string; url: string }[];
  isPublished: boolean;
}

const LessonSchema = new Schema<ILesson>({
  trackId: {
    type: Schema.Types.ObjectId,
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
    type: String,
    default: ''
  },
  codingChallenge: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    expectedOutput: { type: String, default: '' },
    hint: { type: String, default: '' }
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

export default mongoose.model<ILesson>('Lesson', LessonSchema);
