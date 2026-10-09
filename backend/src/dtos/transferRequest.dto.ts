import { z } from 'zod';
import { BloodTypeEnum } from './bloodUnit.dto';

export const TransferRequestStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED']);

export const CreateTransferRequestDtoSchema = z.object({
  id_requesting_center: z.number().int().positive(),
  id_supplying_center: z.number().int().positive(),
  blood_type: BloodTypeEnum,
  quantity: z.number().int().positive().max(100),
});

export const ProcessTransferDtoSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  id_blood_units: z.array(z.number().int().positive()).optional(),
});

export type CreateTransferRequestDto = z.infer<typeof CreateTransferRequestDtoSchema>;
export type ProcessTransferDto = z.infer<typeof ProcessTransferDtoSchema>;
