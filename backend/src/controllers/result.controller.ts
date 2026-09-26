import { Request, Response } from 'express';
import { resultService } from '../services/result.service';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS } from '../config/constants';

export class ResultController {
  public getResult = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await resultService.getScreeningResult(id);
    return ApiResponse.success(res, result, 'Screening result retrieved successfully', HTTP_STATUS.OK);
  };
}

export const resultController = new ResultController();
