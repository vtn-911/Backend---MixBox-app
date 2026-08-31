import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { FolderService } from '../services/folder.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';

export class FolderController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const folder = await FolderService.createFolder(userId, req.body.name);
      return sendSuccess(res, 'Folder created successfully', folder, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const folders = await FolderService.listFolders(userId);
      return sendSuccess(res, 'Folders retrieved successfully', folders);
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string;
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Folder ID is required', 400);

      const folder = await FolderService.updateFolder(userId, id, req.body.name);
      return sendSuccess(res, 'Folder updated successfully', folder);
    } catch (error) {
      return next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string;
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Folder ID is required', 400);

      const result = await FolderService.deleteFolder(userId, id);
      return sendSuccess(res, 'Folder deleted successfully', result);
    } catch (error) {
      return next(error);
    }
  }
}
