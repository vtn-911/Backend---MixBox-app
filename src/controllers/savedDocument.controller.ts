import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SavedDocumentService } from '../services/savedDocument.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';

export class SavedDocumentController {
  static async save(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const { document_id } = req.body;
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!document_id) throw new AppError('Document ID is required', 400);

      const saved = await SavedDocumentService.saveDocument(userId, document_id);
      return sendSuccess(res, 'Document saved successfully', saved, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async unsave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string; // documentId
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Document ID is required', 400);

      const result = await SavedDocumentService.unsaveDocument(userId, id);
      return sendSuccess(res, 'Document unsaved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const savedDocs = await SavedDocumentService.listSavedDocuments(userId);
      return sendSuccess(res, 'Saved documents retrieved successfully', savedDocs);
    } catch (error) {
      return next(error);
    }
  }
}
