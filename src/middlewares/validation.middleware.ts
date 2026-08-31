import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          'Validation failed',
          400,
          error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        );
        return;
      }
      return next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.params);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          'Validation failed',
          400,
          error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        );
        return;
      }
      return next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.query);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          'Validation failed',
          400,
          error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        );
        return;
      }
      return next(error);
    }
  };
}
