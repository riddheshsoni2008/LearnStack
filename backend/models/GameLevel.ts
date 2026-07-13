import mongoose, { Document, Schema } from 'mongoose';

export interface IGameLevel extends Document {
  world: string;
  levelNumber: number;
  title: string;
  story: string;
  challengeText: string;
  gameType: 'CODE_WRITE' | 'BUG_FIX' | 'PREDICT_OUTPUT' | 'MULTI_CHOICE' | 'BOSS_BATTLE';
  language: string;
  initialCode: string;
  expectedOutput: string;
  validationId: string;
  xpReward: number;
  unlockRequirement: mongoose.Types.ObjectId | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'BOSS';
  isBossLevel: boolean;
}

const GameLevelSchema = new Schema<IGameLevel>({
  world: { type: String, required: true },
  levelNumber: { type: Number, required: true },
  title: { type: String, required: true },
  story: { type: String, required: true },
  challengeText: { type: String, required: true },
  gameType: {
    type: String,
    enum: ['CODE_WRITE', 'BUG_FIX', 'PREDICT_OUTPUT', 'MULTI_CHOICE', 'BOSS_BATTLE'],
    required: true
  },
  language: { type: String, default: 'javascript' },
  initialCode: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  validationId: { type: String, required: true },
  xpReward: { type: Number, required: true },
  unlockRequirement: { type: Schema.Types.ObjectId, ref: 'GameLevel', default: null },
  difficulty: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'EXPERT', 'BOSS'],
    default: 'BEGINNER'
  },
  isBossLevel: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IGameLevel>('GameLevel', GameLevelSchema);
