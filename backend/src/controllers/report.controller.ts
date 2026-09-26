import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS } from '../config/constants';

export class ReportController {
  public getReportData = async (req: Request, res: Response) => {
    const { screeningId } = req.params;
    const reportData = await reportService.getReportData(screeningId);
    return ApiResponse.success(res, reportData, 'Report data retrieved successfully', HTTP_STATUS.OK);
  };
}

export const reportController = new ReportController();
