import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const dashboardService = new DashboardService();

export class DashboardController {
  async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const centerId = req.query.id_medical_center ? parseInt(req.query.id_medical_center as string, 10) : undefined;
      const data = await dashboardService.getMetrics(centerId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}