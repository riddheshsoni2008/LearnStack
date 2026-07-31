import { BadgeEntity } from '../../domain/entities/BadgeEntity';
import { IBadgeRepository } from '../../domain/repositories/IBadgeRepository';
import Badge from '../../../../../models/Badge';
import User from '../../../../../models/User';

export class MongooseBadgeRepository implements IBadgeRepository {
  async findAll(): Promise<BadgeEntity[]> {
    const docs = await Badge.find({}).sort({ rarity: 1, name: 1 }).lean();
    return docs.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      icon: doc.icon,
      description: doc.description,
      rarity: doc.rarity,
      condition: doc.condition,
      conditionValue: doc.conditionValue,
      xpBonus: doc.xpBonus
    }));
  }

  async findByUserId(userId: string): Promise<BadgeEntity[]> {
    const user = await User.findById(userId).populate('badges').lean();
    if (!user || !user.badges) return [];
    
    return (user.badges as any[]).map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      icon: doc.icon,
      description: doc.description,
      rarity: doc.rarity,
      condition: doc.condition,
      conditionValue: doc.conditionValue,
      xpBonus: doc.xpBonus
    }));
  }
}
