import { Request, Response, NextFunction } from 'express';
import { MedicalCenterService } from '../services/medicalCenter.service';

const medicalCenterService = new MedicalCenterService();

export class MedicalCenterController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const centers = await medicalCenterService.getAll();
      res.status(200).json({ success: true, data: centers });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const center = await medicalCenterService.getById(id);
      res.status(200).json({ success: true, data: center });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const center = await medicalCenterService.create(req.body);
      res.status(201).json({ success: true, message: 'Medical center created', data: center });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const center = await medicalCenterService.update(id, req.body);
      res.status(200).json({ success: true, message: 'Medical center updated', data: center });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await medicalCenterService.delete(id);
      res.status(200).json({ success: true, message: 'Medical center deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}