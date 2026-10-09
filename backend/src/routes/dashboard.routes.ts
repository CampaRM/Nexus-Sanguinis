import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

router.use(authenticateJwt);

router.get('/metrics', (req, res, next) => controller.getMetrics(req, res, next));

export default router;
