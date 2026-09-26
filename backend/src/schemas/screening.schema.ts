import { z } from 'zod';
import { ScreeningStatus, ReferralPriority } from '@prisma/client';

export const createScreeningSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format').or(z.string().min(1, 'Patient ID is required')),
});

export const screeningQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(ScreeningStatus).optional(),
  priority: z.nativeEnum(ReferralPriority).optional(),
  search: z.string().trim().optional(),
  patientId: z.string().optional(),
});

export type CreateScreeningSchemaInput = z.infer<typeof createScreeningSchema>;
export type ScreeningQuerySchemaInput = z.infer<typeof screeningQuerySchema>;
