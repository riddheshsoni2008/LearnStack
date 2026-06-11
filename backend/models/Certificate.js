const mongoose = require('mongoose');
const crypto = require('crypto');

// Generate secure certificate ID: LS-YYYY-RANDOM
const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LS-${year}-${random}`;
};

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    default: generateCertificateId,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: function() { return this.certificateType === 'TRACK'; }
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: function() { return this.certificateType && this.certificateType.startsWith('HACKATHON_'); }
  },
  hackathonName: {
    type: String,
    required: function() { return this.certificateType && this.certificateType.startsWith('HACKATHON_'); }
  },
  
  // Snapshots (must never change once issued)
  studentName: {
    type: String,
    required: true
  },
  trackName: {
    type: String,
    required: function() { return this.certificateType === 'TRACK'; }
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

module.exports = mongoose.model('Certificate', CertificateSchema);
