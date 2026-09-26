import { Prisma, ScreeningStatus, ReferralPriority } from '@prisma/client';
import { prisma } from '../prisma/client';
import { PaginationInfo } from '../utils/api-response';

export interface QueueQueryParams {
  page?: number;
  limit?: number;
  status?: ScreeningStatus;
  priority?: ReferralPriority;
  search?: string;
}

export class QueueService {
  public async getQueue(query: QueueQueryParams) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ScreeningWhereInput = {};

    // Filter by specific status if provided, or default to all active queue items
    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.aiResult = {
        referralPriority: query.priority,
      };
    }

    if (query.search && query.search.trim().length > 0) {
      const search = query.search.trim();
      where.patient = {
        OR: [
          { patientCode: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, items] = await Promise.all([
      prisma.screening.count({ where }),
      prisma.screening.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          patient: true,
          aiResult: true,
          specialistReview: {
            include: {
              reviewer: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      }),
    ]);

    const formattedItems = items.map(item => ({
      id: item.id,
      screeningId: item.id,
      patient: item.patient,
      imagePath: item.imagePath,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      severity: item.aiResult?.severity || null,
      drGrade: item.aiResult?.drGrade ?? null,
      confidence: item.aiResult?.drConfidence ?? null,
      priority: item.aiResult?.referralPriority || ReferralPriority.LOW,
      dmeRisk: item.aiResult?.dmeRisk || null,
      hasReview: !!item.specialistReview,
      specialistReview: item.specialistReview || null,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
    };

    return { queue: formattedItems, pagination };
  }
}

export const queueService = new QueueService();
