import { Prisma, ScreeningStatus } from '@prisma/client';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../config/constants';
import { ScreeningQuerySchemaInput } from '../schemas/screening.schema';
import { modelService } from './model/model.service';
import { fileExists, getUploadAbsolutePath } from '../utils/file.utils';
import { PaginationInfo } from '../utils/api-response';

export class ScreeningService {
  public async createScreening(patientId: string, imagePath: string) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new AppError(
        `Patient with ID '${patientId}' does not exist.`,
        HTTP_STATUS.NOT_FOUND,
        'PATIENT_NOT_FOUND'
      );
    }

    const screening = await prisma.screening.create({
      data: {
        patientId,
        imagePath,
        status: ScreeningStatus.UPLOADED,
      },
      include: {
        patient: true,
      },
    });

    return screening;
  }

  public async getScreenings(query: ScreeningQuerySchemaInput) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ScreeningWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
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

    const [total, screenings] = await Promise.all([
      prisma.screening.count({ where }),
      prisma.screening.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

    const totalPages = Math.ceil(total / limit) || 1;

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
    };

    return { screenings, pagination };
  }

  public async getScreeningById(id: string) {
    const screening = await prisma.screening.findUnique({
      where: { id },
      include: {
        patient: true,
        aiResult: true,
        lesions: true,
        specialistReview: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!screening) {
      throw new AppError(
        `Screening with ID '${id}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'SCREENING_NOT_FOUND'
      );
    }

    return screening;
  }

  public async analyzeScreening(id: string) {
    const screening = await prisma.screening.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!screening) {
      throw new AppError(
        `Screening with ID '${id}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'SCREENING_NOT_FOUND'
      );
    }

    const absoluteImagePath = getUploadAbsolutePath(screening.imagePath);
    if (!fileExists(absoluteImagePath)) {
      throw new AppError(
        `Uploaded retinal scan file not found on disk at '${screening.imagePath}'.`,
        HTTP_STATUS.BAD_REQUEST,
        'IMAGE_FILE_NOT_FOUND'
      );
    }

    // Update status to PROCESSING
    await prisma.screening.update({
      where: { id },
      data: { status: ScreeningStatus.PROCESSING },
    });

    try {
      // Execute inference via ModelService (which forwards to ModelAdapter)
      const aiOutput = await modelService.analyzeRetinalScan(screening.imagePath);

      // Save AIResult in database via transaction
      const updatedScreening = await prisma.$transaction(async tx => {
        // Upsert AI result
        await tx.aIResult.upsert({
          where: { screeningId: id },
          create: {
            screeningId: id,
            drGrade: aiOutput.dr.grade,
            severity: aiOutput.dr.severity,
            drConfidence: aiOutput.dr.confidence,
            dmeRisk: aiOutput.dme.risk,
            dmeConfidence: aiOutput.dme.confidence,
            imageQualityStatus: aiOutput.imageQuality.status,
            imageQualityScore: aiOutput.imageQuality.score,
            uncertaintyLevel: aiOutput.uncertainty.level,
            abstain: aiOutput.uncertainty.abstain,
            referralPriority: aiOutput.action.priority,
            referralRecommendation: aiOutput.action.recommendation,
            segmentationMaskPath: aiOutput.visualizations.segmentationMaskPath,
            gradcamPath: aiOutput.visualizations.gradcamPath,
          },
          update: {
            drGrade: aiOutput.dr.grade,
            severity: aiOutput.dr.severity,
            drConfidence: aiOutput.dr.confidence,
            dmeRisk: aiOutput.dme.risk,
            dmeConfidence: aiOutput.dme.confidence,
            imageQualityStatus: aiOutput.imageQuality.status,
            imageQualityScore: aiOutput.imageQuality.score,
            uncertaintyLevel: aiOutput.uncertainty.level,
            abstain: aiOutput.uncertainty.abstain,
            referralPriority: aiOutput.action.priority,
            referralRecommendation: aiOutput.action.recommendation,
            segmentationMaskPath: aiOutput.visualizations.segmentationMaskPath,
            gradcamPath: aiOutput.visualizations.gradcamPath,
          },
        });

        // Delete any existing lesions for this screening
        await tx.lesion.deleteMany({
          where: { screeningId: id },
        });

        // Create new lesion records
        if (aiOutput.lesions && aiOutput.lesions.length > 0) {
          await tx.lesion.createMany({
            data: aiOutput.lesions.map(l => ({
              screeningId: id,
              type: l.type,
              count: l.count,
            })),
          });
        }

        // Update screening status to REVIEW_PENDING
        return tx.screening.update({
          where: { id },
          data: { status: ScreeningStatus.REVIEW_PENDING },
          include: {
            patient: true,
            aiResult: true,
            lesions: true,
            specialistReview: true,
          },
        });
      });

      return updatedScreening;
    } catch (error) {
      // In case of unexpected analysis failure, mark screening status as FAILED
      await prisma.screening.update({
        where: { id },
        data: { status: ScreeningStatus.FAILED },
      });
      throw error;
    }
  }
}

export const screeningService = new ScreeningService();
