import { BadgeEntity } from '../entities/BadgeEntity';

export interface IBadgeRepository {
  findAll(): Promise<BadgeEntity[]>;
  findByUserId(userId: string): Promise<BadgeEntity[]>;
}
