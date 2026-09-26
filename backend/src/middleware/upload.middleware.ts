import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '../config/constants';
import { ENV } from '../config/env';
import { AppError } from './error.middleware';
import { HTTP_STATUS } from '../config/constants';

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `retinal-scan-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const mimeType = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeValid = ALLOWED_IMAGE_MIME_TYPES.includes(
    mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
  );
  const isExtValid = ALLOWED_IMAGE_EXTENSIONS.includes(
    ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number]
  );

  if (!isMimeValid || !isExtValid) {
    return cb(
      new AppError(
        `Invalid file type (${file.mimetype}). Allowed formats are JPEG (.jpg, .jpeg) and PNG (.png).`,
        HTTP_STATUS.BAD_REQUEST,
        'INVALID_FILE_TYPE'
      )
    );
  }

  cb(null, true);
};

export const retinalScanUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});
