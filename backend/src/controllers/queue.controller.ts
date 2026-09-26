import { Request, Response } from 'express';
import { queueService } from '../services/queue.service';
import { screeningQuerySchema } from '../schemas/screening.schema';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS } from '../config/constants';

export class QueueController {
  public getQueue = async (req: Request, res: Response) => {
    const query = screeningQuerySchema.parse(req.query);
    const { queue, pagination } = await queueService.getQueue(query);
    return ApiResponse.success(
      res,
      queue,
      'Screening queue retrieved successfully',
      HTTP_STATUS.OK,
      pagination
    );
  };
}

export const queueController = new QueueController();
