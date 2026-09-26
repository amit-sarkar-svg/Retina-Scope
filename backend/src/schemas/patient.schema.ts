import { z } from 'zod';
import { Gender } from '@prisma/client';

export const createPatientSchema = z.object({
  patientCode: z
    .string()
    .min(2, 'Patient code must be at least 2 characters')
    .max(50)
    .trim(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  age: z.coerce.number().int().min(0, 'Age cannot be negative').max(130, 'Invalid age'),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: 'Gender must be MALE, FEMALE, or OTHER' }),
  }),
  phone: z
    .string()
    .min(5, 'Phone number must be at least 5 characters')
    .max(25)
    .trim(),
});

export const updatePatientSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  age: z.coerce.number().int().min(0).max(130).optional(),
  gender: z.nativeEnum(Gender).optional(),
  phone: z.string().min(5).max(25).trim().optional(),
});

export const patientQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export type CreatePatientSchemaInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientSchemaInput = z.infer<typeof updatePatientSchema>;
export type PatientQuerySchemaInput = z.infer<typeof patientQuerySchema>;
