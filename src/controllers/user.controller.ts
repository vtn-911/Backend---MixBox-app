import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const profile = await UserService.getUserProfile(userId);
      return sendSuccess(res, 'User profile retrieved successfully', profile);
    } catch (error) {
      return next(error);
    }
  }

  static async updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      // If multer file was uploaded
      if (!req.file) {
        throw new AppError('No avatar file uploaded', 400);
      }

      // Convert local path to a URL format
      const avatarUrl = `/uploads/${req.file.filename}`;
      const user = await UserService.updateAvatar(userId, avatarUrl);

      return sendSuccess(res, 'Avatar updated successfully', user);
    } catch (error) {
      return next(error);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const stats = await UserService.getUserStats(userId);
      return sendSuccess(res, 'User statistics retrieved successfully', stats);
    } catch (error) {
      return next(error);
    }
  }
}
