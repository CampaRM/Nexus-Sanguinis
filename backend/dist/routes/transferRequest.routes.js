"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transferRequest_controller_1 = require("../controllers/transferRequest.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const transferRequest_dto_1 = require("../dtos/transferRequest.dto");
const router = (0, express_1.Router)();
const controller = new transferRequest_controller_1.TransferRequestController();
router.use(auth_middleware_1.authenticateJwt);
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', (0, validate_middleware_1.validateBody)(transferRequest_dto_1.CreateTransferRequestDtoSchema), (req, res, next) => controller.create(req, res, next));
// ACID Transactional Endpoint: Approve/Reject transfer and reallocate units
router.post('/:id/process', (0, role_middleware_1.requireRoles)('ADMIN_GENERAL', 'BANK_MANAGER'), (0, validate_middleware_1.validateBody)(transferRequest_dto_1.ProcessTransferDtoSchema), (req, res, next) => controller.processTransfer(req, res, next));
exports.default = router;
