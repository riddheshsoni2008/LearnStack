export interface BadgeEntity {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: string;
  conditionValue: string;
  xpBonus: number;
}
