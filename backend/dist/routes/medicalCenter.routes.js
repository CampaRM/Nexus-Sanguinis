"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicalCenter_controller_1 = require("../controllers/medicalCenter.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const medicalCenter_dto_1 = require("../dtos/medicalCenter.dto");
const router = (0, express_1.Router)();
const controller = new medicalCenter_controller_1.MedicalCenterController();
router.use(auth_middleware_1.authenticateJwt);
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
// Restricted to ADMIN_GENERAL
router.post('/', (0, role_middleware_1.requireRoles)('ADMIN_GENERAL'), (0, validate_middleware_1.validateBody)(medicalCenter_dto_1.CreateMedicalCenterDtoSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', (0, role_middleware_1.requireRoles)('ADMIN_GENERAL'), (0, validate_middleware_1.validateBody)(medicalCenter_dto_1.UpdateMedicalCenterDtoSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (0, role_middleware_1.requireRoles)('ADMIN_GENERAL'), (req, res, next) => controller.delete(req, res, next));
exports.default = router;
