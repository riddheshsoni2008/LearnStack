import { Request, Response } from 'express';
import { GetAllBadgesUseCase } from '../../application/use-cases/GetAllBadgesUseCase';
import { GetMyBadgesUseCase } from '../../application/use-cases/GetMyBadgesUseCase';

export class BadgeCleanController {
  constructor(
    private readonly getAllBadgesUseCase: GetAllBadgesUseCase,
    private readonly getMyBadgesUseCase: GetMyBadgesUseCase
  ) {}

  async getAllBadges(req: Request, res: Response): Promise<void> {
    try {
      const badges = await this.getAllBadgesUseCase.execute();
      res.status(200).json({ success: true, data: badges });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyBadges(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id;
      const badges = await this.getMyBadgesUseCase.execute(userId);
      res.status(200).json({ success: true, data: badges });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
