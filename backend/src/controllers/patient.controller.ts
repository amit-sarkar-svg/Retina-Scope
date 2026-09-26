import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';
import {
  createPatientSchema,
  updatePatientSchema,
  patientQuerySchema,
} from '../schemas/patient.schema';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS } from '../config/constants';

export class PatientController {
  public create = async (req: Request, res: Response) => {
    const validatedData = createPatientSchema.parse(req.body);
    const patient = await patientService.createPatient(validatedData);
    return ApiResponse.success(res, patient, 'Patient created successfully', HTTP_STATUS.CREATED);
  };

  public getAll = async (req: Request, res: Response) => {
    const query = patientQuerySchema.parse(req.query);
    const { patients, pagination } = await patientService.getPatients(query);
    return ApiResponse.success(
      res,
      patients,
      'Patients retrieved successfully',
      HTTP_STATUS.OK,
      pagination
    );
  };

  public getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const patient = await patientService.getPatientById(id);
    return ApiResponse.success(res, patient, 'Patient retrieved successfully', HTTP_STATUS.OK);
  };

  public update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updatePatientSchema.parse(req.body);
    const updated = await patientService.updatePatient(id, validatedData);
    return ApiResponse.success(res, updated, 'Patient updated successfully', HTTP_STATUS.OK);
  };
}

export const patientController = new PatientController();
