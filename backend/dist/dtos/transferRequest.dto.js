"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessTransferDtoSchema = exports.CreateTransferRequestDtoSchema = exports.TransferRequestStatusEnum = void 0;
const zod_1 = require("zod");
const bloodUnit_dto_1 = require("./bloodUnit.dto");
exports.TransferRequestStatusEnum = zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED']);
exports.CreateTransferRequestDtoSchema = zod_1.z.object({
    id_requesting_center: zod_1.z.number().int().positive(),
    id_supplying_center: zod_1.z.number().int().positive(),
    blood_type: bloodUnit_dto_1.BloodTypeEnum,
    quantity: zod_1.z.number().int().positive().max(100),
});
exports.ProcessTransferDtoSchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REJECT']),
    id_blood_units: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
});
