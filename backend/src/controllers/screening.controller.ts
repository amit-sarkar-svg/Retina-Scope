import { Request, Response } from 'express';
import path from 'path';
import { screeningService } from '../services/screening.service';
import {
  createScreeningSchema,
  screeningQuerySchema,
} from '../schemas/screening.schema';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS } from '../config/constants';
import { AppError } from '../middleware/error.middleware';

export class ScreeningController {
  public create = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(
        'Retinal image file is required under field name "image".',
        HTTP_STATUS.BAD_REQUEST,
        'NO_FILE_UPLOADED'
      );
    }

    const validatedData = createScreeningSchema.parse(req.body);
    const relativeImagePath = path.join('uploads', req.file.filename);

    const screening = await screeningService.createScreening(
      validatedData.patientId,
      relativeImagePath
    );

    return ApiResponse.success(
      res,
      screening,
      'Screening created and image uploaded successfully',
      HTTP_STATUS.CREATED
    );
  };

  public getAll = async (req: Request, res: Response) => {
    const query = screeningQuerySchema.parse(req.query);
    const { screenings, pagination } = await screeningService.getScreenings(query);
    return ApiResponse.success(
      res,
      screenings,
      'Screenings retrieved successfully',
      HTTP_STATUS.OK,
      pagination
    );
  };

  public getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const screening = await screeningService.getScreeningById(id);
    return ApiResponse.success(res, screening, 'Screening retrieved successfully', HTTP_STATUS.OK);
  };

  public analyze = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedScreening = await screeningService.analyzeScreening(id);
    return ApiResponse.success(
      res,
      updatedScreening,
      'Screening analysis completed successfully',
      HTTP_STATUS.OK
    );
  };
}

export const screeningController = new ScreeningController();
