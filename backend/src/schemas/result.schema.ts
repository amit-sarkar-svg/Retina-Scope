import { z } from 'zod';

export const screeningParamSchema = z.object({
  id: z.string().min(1, 'Screening ID is required'),
});

export type ScreeningParamInput = z.infer<typeof screeningParamSchema>;
