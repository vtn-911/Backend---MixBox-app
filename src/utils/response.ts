import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export function sendSuccess<T = any>(res: Response, message: string, data?: T, statusCode = 200) {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responseBody);
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: any) {
  const responseBody: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(responseBody);
}
