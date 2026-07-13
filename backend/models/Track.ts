import mongoose, { Document, Schema } from 'mongoose';

export interface ITrack extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalWeeks: number;
  totalLessons: number;
  order: number;
  tags: string[];
  isPublished: boolean;
}

const TrackSchema = new Schema<ITrack>({
  title: {
    type: String,
    required: [true, 'Track title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  totalWeeks: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate slug from title
TrackSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

export default mongoose.model<ITrack>('Track', TrackSchema);
