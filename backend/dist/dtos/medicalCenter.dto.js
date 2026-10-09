"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicalCenterDtoSchema = exports.CreateMedicalCenterDtoSchema = void 0;
const zod_1 = require("zod");
exports.CreateMedicalCenterDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150),
    type: zod_1.z.string().min(2).max(60),
    address: zod_1.z.string().min(2).max(255),
    phone: zod_1.z.string().min(2).max(50),
});
exports.UpdateMedicalCenterDtoSchema = exports.CreateMedicalCenterDtoSchema.partial();
