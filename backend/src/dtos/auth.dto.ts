import { z } from 'zod';

export const RegisterDtoSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  id_role: z.any().optional().nullable(),
  id_medical_center: z.any().optional().nullable(),
});

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
