import mongoose, { Document, Schema } from 'mongoose';

export interface IGameAchievement extends Document {
  name: string;
  description: string;
  icon: string;
  type: 'LEVEL_COMPLETE' | 'BUG_FIX_COMPLETE' | 'BOSS_DEFEATED' | 'FIRST_CHALLENGE';
  target: number;
}

const GameAchievementSchema = new Schema<IGameAchievement>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: {
    type: String,
    enum: ['LEVEL_COMPLETE', 'BUG_FIX_COMPLETE', 'BOSS_DEFEATED', 'FIRST_CHALLENGE'],
    required: true
  },
  target: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IGameAchievement>('GameAchievement', GameAchievementSchema);
