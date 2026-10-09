import { Response, NextFunction } from 'express';
import { BloodUnitService } from '../services/bloodUnit.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const bloodUnitService = new BloodUnitService();

export class BloodUnitController {
  async getFiltered(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await bloodUnitService.getFiltered(req.query as any);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const unit = await bloodUnitService.getById(id);
      res.status(200).json({ success: true, data: unit });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id_user;
      const unit = await bloodUnitService.create(req.body, userId);
      res.status(201).json({ success: true, message: 'Blood unit registered', data: unit });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id_user;
      const unit = await bloodUnitService.update(id, req.body, userId);
      res.status(200).json({ success: true, message: 'Blood unit updated', data: unit });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id_user;
      await bloodUnitService.delete(id, userId);
      res.status(200).json({ success: true, message: 'Blood unit discarded successfully' });
    } catch (error) {
      next(error);
    }
  }
}