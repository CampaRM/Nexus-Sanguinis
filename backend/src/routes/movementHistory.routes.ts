import { Router } from 'express';
import { MovementHistoryController } from '../controllers/movementHistory.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();
const controller = new MovementHistoryController();

router.use(authenticateJwt);

router.get('/', (req, res, next) => controller.getAll(req, res, next));

export default router;
