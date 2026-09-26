import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../config/constants';
import {
  CreatePatientSchemaInput,
  UpdatePatientSchemaInput,
  PatientQuerySchemaInput,
} from '../schemas/patient.schema';
import { PaginationInfo } from '../utils/api-response';

export class PatientService {
  public async createPatient(input: CreatePatientSchemaInput) {
    const existing = await prisma.patient.findUnique({
      where: { patientCode: input.patientCode.trim() },
    });

    if (existing) {
      throw new AppError(
        `Patient with code '${input.patientCode}' already exists.`,
        HTTP_STATUS.CONFLICT,
        'PATIENT_CODE_EXISTS'
      );
    }

    const patient = await prisma.patient.create({
      data: {
        patientCode: input.patientCode.trim(),
        name: input.name.trim(),
        age: input.age,
        gender: input.gender,
        phone: input.phone.trim(),
      },
    });

    return patient;
  }

  public async getPatients(query: PatientQuerySchemaInput) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {};

    if (query.search && query.search.trim().length > 0) {
      const search = query.search.trim();
      where.OR = [
        { patientCode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { screenings: true },
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

    return { patients, pagination };
  }

  public async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        screenings: {
          orderBy: { createdAt: 'desc' },
          include: {
            aiResult: true,
            specialistReview: true,
          },
        },
      },
    });

    if (!patient) {
      throw new AppError(
        `Patient with ID '${id}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'PATIENT_NOT_FOUND'
      );
    }

    return patient;
  }

  public async updatePatient(id: string, input: UpdatePatientSchemaInput) {
    const existing = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(
        `Patient with ID '${id}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'PATIENT_NOT_FOUND'
      );
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.age !== undefined ? { age: input.age } : {}),
        ...(input.gender ? { gender: input.gender } : {}),
        ...(input.phone ? { phone: input.phone.trim() } : {}),
      },
    });

    return updated;
  }
}

export const patientService = new PatientService();
