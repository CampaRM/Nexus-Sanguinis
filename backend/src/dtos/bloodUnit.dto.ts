import { z } from 'zod';

export const BloodTypeEnum = z.enum(['A', 'B', 'AB', 'O']);
export const RhFactorEnum = z.enum(['POSITIVE', 'NEGATIVE']);
export const BloodUnitStatusEnum = z.enum(['AVAILABLE', 'NEAR_EXPIRATION', 'EXPIRED', 'DISCARDED', 'TRANSFERRED']);

export const CreateBloodUnitDtoSchema = z.object({
  blood_type: BloodTypeEnum,
  rh_factor: RhFactorEnum,
  extraction_date: z.string().or(z.date()).transform((val) => new Date(val)),
  expiration_date: z.string().or(z.date()).transform((val) => new Date(val)),
  status: BloodUnitStatusEnum.optional().default('AVAILABLE'),
  id_medical_center: z.number().int().positive(),
});

export const UpdateBloodUnitDtoSchema = z.object({
  status: BloodUnitStatusEnum.optional(),
  id_medical_center: z.number().int().positive().optional(),
  expiration_date: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
});

export const BloodUnitFilterDtoSchema = z.object({
  blood_type: BloodTypeEnum.optional(),
  rh_factor: RhFactorEnum.optional(),
  status: BloodUnitStatusEnum.optional(),
  id_medical_center: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateBloodUnitDto = z.infer<typeof CreateBloodUnitDtoSchema>;
export type UpdateBloodUnitDto = z.infer<typeof UpdateBloodUnitDtoSchema>;
export type BloodUnitFilterDto = z.infer<typeof BloodUnitFilterDtoSchema>;
