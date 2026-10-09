import { Router } from 'express';
import { BloodUnitController } from '../controllers/bloodUnit.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
  CreateBloodUnitDtoSchema,
  UpdateBloodUnitDtoSchema,
  BloodUnitFilterDtoSchema,
} from '../dtos/bloodUnit.dto';

const router = Router();
const controller = new BloodUnitController();

router.use(authenticateJwt);

router.get('/', validateQuery(BloodUnitFilterDtoSchema), (req, res, next) =>
  controller.getFiltered(req, res, next)
);
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', validateBody(CreateBloodUnitDtoSchema), (req, res, next) =>
  controller.create(req, res, next)
);
router.put('/:id', validateBody(UpdateBloodUnitDtoSchema), (req, res, next) =>
  controller.update(req, res, next)
);
router.delete('/:id', requireRoles('ADMIN_GENERAL', 'BANK_MANAGER'), (req, res, next) =>
  controller.delete(req, res, next)
);

export default router;
