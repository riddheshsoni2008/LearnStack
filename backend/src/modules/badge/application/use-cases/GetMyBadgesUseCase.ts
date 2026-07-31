import { BadgeEntity } from '../../domain/entities/BadgeEntity';
import { IBadgeRepository } from '../../domain/repositories/IBadgeRepository';

export class GetMyBadgesUseCase {
  constructor(private readonly badgeRepository: IBadgeRepository) {}

  async execute(userId: string): Promise<BadgeEntity[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return await this.badgeRepository.findByUserId(userId);
  }
}
