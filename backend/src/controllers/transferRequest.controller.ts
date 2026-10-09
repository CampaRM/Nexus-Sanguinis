import { Response, NextFunction } from 'express';
import { TransferRequestService } from '../services/transferRequest.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { TransferRequestStatus } from '@prisma/client';

const transferRequestService = new TransferRequestService();

export class TransferRequestController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as TransferRequestStatus | undefined;
      const requests = await transferRequestService.getAll(status);
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const request = await transferRequestService.getById(id);
      res.status(200).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await transferRequestService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Transfer request submitted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  async processTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id_user;
      const result = await transferRequestService.processTransfer(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: `Transfer request processed: ${req.body.action}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}