import { z } from 'zod';
import { ReviewDecision } from '@prisma/client';

export const createReviewSchema = z.object({
  decision: z.nativeEnum(ReviewDecision, {
    errorMap: () => ({
      message: 'Decision must be one of: AGREE, MODIFY, REQUEST_RESUBMISSION, REJECT',
    }),
  }),
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
});

export type CreateReviewSchemaInput = z.infer<typeof createReviewSchema>;
