import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

// Generate secure certificate ID: LS-YYYY-RANDOM
const generateCertificateId = (): string => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LS-${year}-${random}`;
};

export interface ICertificate extends Document {
  certificateId: string;
  userId: mongoose.Types.ObjectId;
  certificateType: 'TRACK' | 'ADVANCED' | 'PROFESSIONAL' | 'HACKATHON_PARTICIPATION' | 'HACKATHON_QUALIFIED' | 'HACKATHON_WINNER';
  trackId?: mongoose.Types.ObjectId;
  hackathonId?: mongoose.Types.ObjectId;
  hackathonName?: string;
  studentName: string;
  trackName?: string;
  issuedAt: Date;
  completionPercentage: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  verificationUrl: string;
  qrCodeUrl?: string;
  isValid: boolean;
  isRevoked: boolean;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  certificateId: {
    type: String,
    unique: true,
    default: generateCertificateId,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateType: {
    type: String,
    enum: ['TRACK', 'ADVANCED', 'PROFESSIONAL', 'HACKATHON_PARTICIPATION', 'HACKATHON_QUALIFIED', 'HACKATHON_WINNER'],
    required: true,
    default: 'TRACK'
  },
  trackId: {
    type: Schema.Types.ObjectId,
    ref: 'Track',
    required: function (this: ICertificate) { return this.certificateType === 'TRACK'; }
  },
  hackathonId: {
    type: Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: function (this: ICertificate) { return this.certificateType && this.certificateType.startsWith('HACKATHON_'); }
  },
  hackathonName: {
    type: String,
    required: function (this: ICertificate) { return this.certificateType && this.certificateType.startsWith('HACKATHON_'); }
  },

  // Snapshots (must never change once issued)
  studentName: {
    type: String,
    required: true
  },
  trackName: {
    type: String,
    required: function (this: ICertificate) { return this.certificateType === 'TRACK'; }
  },

  issuedAt: {
    type: Date,
    default: Date.now
  },

  // Progress Data
  completionPercentage: {
    type: Number,
    required: true,
    min: 100,
    max: 100
  },
  totalLessons: {
    type: Number,
    required: true
  },
  completedLessons: {
    type: Number,
    required: true
  },
  totalQuizzes: {
    type: Number,
    required: true
  },
  completedQuizzes: {
    type: Number,
    required: true
  },

  verificationUrl: {
    type: String,
    required: true
  },
  qrCodeUrl: {
    type: String
  },

  // Status
  isValid: {
    type: Boolean,
    default: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Enforce strictly one certificate per user per type per track
CertificateSchema.index({ userId: 1, certificateType: 1, trackId: 1 }, { unique: true });

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
