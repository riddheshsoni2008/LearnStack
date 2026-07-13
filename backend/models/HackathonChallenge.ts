import mongoose, { Document, Schema } from 'mongoose';

export interface IHackathonChallenge extends Document {
  hackathonId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  challengeTitle: string;
  businessScenario: string;
  problemStatement: string;
  requirements: string[];
  bonusFeatures: string[];
  evaluationCriteria: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const HackathonChallengeSchema = new Schema<IHackathonChallenge>({
  hackathonId: {
    type: Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true,
    index: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeTitle: {
    type: String,
    required: true
  },
  businessScenario: {
    type: String,
    default: ''
  },
  problemStatement: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  bonusFeatures: [{
    type: String
  }],
  evaluationCriteria: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Ensure a user only gets one challenge per hackathon in this automated flow
HackathonChallengeSchema.index({ hackathonId: 1, assignedTo: 1 }, { unique: true });

export default mongoose.model<IHackathonChallenge>('HackathonChallenge', HackathonChallengeSchema);
