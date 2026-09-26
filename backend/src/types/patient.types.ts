import { Gender } from '@prisma/client';

export interface CreatePatientInput {
  patientCode: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
}

export interface UpdatePatientInput {
  name?: string;
  age?: number;
  gender?: Gender;
  phone?: string;
}

export interface PatientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
