import { Router } from 'express';
import { MedicalCenterController } from '../controllers/medicalCenter.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateMedicalCenterDtoSchema, UpdateMedicalCenterDtoSchema } from '../dtos/medicalCenter.dto';

const router = Router();
const controller = new MedicalCenterController();

router.use(authenticateJwt);

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Restricted to ADMIN_GENERAL
router.post('/', requireRoles('ADMIN_GENERAL'), validateBody(CreateMedicalCenterDtoSchema), (req, res, next) =>
  controller.create(req, res, next)
);
router.put('/:id', requireRoles('ADMIN_GENERAL'), validateBody(UpdateMedicalCenterDtoSchema), (req, res, next) =>
  controller.update(req, res, next)
);
router.delete('/:id', requireRoles('ADMIN_GENERAL'), (req, res, next) => controller.delete(req, res, next));

export default router;
