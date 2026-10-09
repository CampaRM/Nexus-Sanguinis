import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { RegisterDtoSchema, LoginDtoSchema } from '../dtos/auth.dto';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', validateBody(RegisterDtoSchema), (req, res, next) => controller.register(req, res, next));
router.post('/login', validateBody(LoginDtoSchema), (req, res, next) => controller.login(req, res, next));
router.get('/me', authenticateJwt, (req, res, next) => controller.getProfile(req, res, next));

export default router;
