import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';

export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const fileExists = (filePath: string): boolean => {
  if (!filePath) return false;
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  return fs.existsSync(absolutePath);
};

export const getUploadRelativePath = (filename: string): string => {
  return `uploads/${filename}`;
};

export const getUploadAbsolutePath = (filenameOrRelativePath: string): string => {
  if (path.isAbsolute(filenameOrRelativePath)) {
    return filenameOrRelativePath;
  }
  return path.resolve(process.cwd(), filenameOrRelativePath);
};

// Initialize uploads directory on module load
ensureDirectoryExists(ENV.UPLOAD_DIR);
