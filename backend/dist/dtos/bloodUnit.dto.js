"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodUnitFilterDtoSchema = exports.UpdateBloodUnitDtoSchema = exports.CreateBloodUnitDtoSchema = exports.BloodUnitStatusEnum = exports.RhFactorEnum = exports.BloodTypeEnum = void 0;
const zod_1 = require("zod");
exports.BloodTypeEnum = zod_1.z.enum(['A', 'B', 'AB', 'O']);
exports.RhFactorEnum = zod_1.z.enum(['POSITIVE', 'NEGATIVE']);
exports.BloodUnitStatusEnum = zod_1.z.enum(['AVAILABLE', 'NEAR_EXPIRATION', 'EXPIRED', 'DISCARDED', 'TRANSFERRED']);
exports.CreateBloodUnitDtoSchema = zod_1.z.object({
    blood_type: exports.BloodTypeEnum,
    rh_factor: exports.RhFactorEnum,
    extraction_date: zod_1.z.string().or(zod_1.z.date()).transform((val) => new Date(val)),
    expiration_date: zod_1.z.string().or(zod_1.z.date()).transform((val) => new Date(val)),
    status: exports.BloodUnitStatusEnum.optional().default('AVAILABLE'),
    id_medical_center: zod_1.z.number().int().positive(),
});
exports.UpdateBloodUnitDtoSchema = zod_1.z.object({
    status: exports.BloodUnitStatusEnum.optional(),
    id_medical_center: zod_1.z.number().int().positive().optional(),
    expiration_date: zod_1.z.string().or(zod_1.z.date()).transform((val) => new Date(val)).optional(),
});
exports.BloodUnitFilterDtoSchema = zod_1.z.object({
    blood_type: exports.BloodTypeEnum.optional(),
    rh_factor: exports.RhFactorEnum.optional(),
    status: exports.BloodUnitStatusEnum.optional(),
    id_medical_center: zod_1.z.coerce.number().int().positive().optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
