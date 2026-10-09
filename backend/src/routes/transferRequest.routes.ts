import { Router } from 'express';
import { TransferRequestController } from '../controllers/transferRequest.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateTransferRequestDtoSchema, ProcessTransferDtoSchema } from '../dtos/transferRequest.dto';

const router = Router();
const controller = new TransferRequestController();

router.use(authenticateJwt);

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', validateBody(CreateTransferRequestDtoSchema), (req, res, next) =>
  controller.create(req, res, next)
);

// ACID Transactional Endpoint: Approve/Reject transfer and reallocate units
router.post(
  '/:id/process',
  requireRoles('ADMIN_GENERAL', 'BANK_MANAGER'),
  validateBody(ProcessTransferDtoSchema),
  (req, res, next) => controller.processTransfer(req, res, next)
);

export default router;
