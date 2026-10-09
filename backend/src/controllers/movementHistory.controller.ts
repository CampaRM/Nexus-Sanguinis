import { Response, NextFunction } from 'express';
import { MovementHistoryService } from '../services/movementHistory.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const movementHistoryService = new MovementHistoryService();

export class MovementHistoryController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bloodUnitId = req.query.id_blood_unit ? parseInt(req.query.id_blood_unit as string, 10) : undefined;
      const userId = req.query.id_user ? parseInt(req.query.id_user as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const history = await movementHistoryService.getAll(bloodUnitId, userId, limit);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}