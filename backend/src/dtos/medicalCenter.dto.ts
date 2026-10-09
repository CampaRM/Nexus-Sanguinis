import { z } from 'zod';

export const CreateMedicalCenterDtoSchema = z.object({
  name: z.string().min(2).max(150),
  type: z.string().min(2).max(60),
  address: z.string().min(2).max(255),
  phone: z.string().min(2).max(50),
});

export const UpdateMedicalCenterDtoSchema = CreateMedicalCenterDtoSchema.partial();

export type CreateMedicalCenterDto = z.infer<typeof CreateMedicalCenterDtoSchema>;
export type UpdateMedicalCenterDto = z.infer<typeof UpdateMedicalCenterDtoSchema>;
