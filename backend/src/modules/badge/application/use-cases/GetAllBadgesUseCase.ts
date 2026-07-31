import { BadgeEntity } from '../../domain/entities/BadgeEntity';
import { IBadgeRepository } from '../../domain/repositories/IBadgeRepository';

export class GetAllBadgesUseCase {
  constructor(private readonly badgeRepository: IBadgeRepository) {}

  async execute(): Promise<BadgeEntity[]> {
    return await this.badgeRepository.findAll();
  }
}
