import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await AuthService.register({ ...req.body, avatar: req.file });
      return sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, 'User logged in successfully', result, 200);
    } catch (error) {
      return next(error);
    }
  }
}
