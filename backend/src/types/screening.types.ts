import { ScreeningStatus, ReferralPriority, ReviewDecision } from '@prisma/client';

export interface ScreeningQueryParams {
  page?: number;
  limit?: number;
  status?: ScreeningStatus;
  priority?: ReferralPriority;
  search?: string;
  patientId?: string;
}

export interface SpecialistReviewInput {
  decision: ReviewDecision;
  notes?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
