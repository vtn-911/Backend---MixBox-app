import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { DocumentService } from '../services/document.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';
import path from 'path';

export class DocumentController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const documentFile = files?.['document']?.[0];
      const thumbnailFile = files?.['thumbnail']?.[0];

      if (!documentFile) {
        throw new AppError('Document file is required', 400);
      }

      // Automatically determine file_type, file_size from upload metadata
      const ext = path.extname(documentFile.originalname).replace('.', '').toUpperCase();
      const fileType = ext || 'UNKNOWN';
      const fileSize = documentFile.size;

      // Extract body payload (which might be sent as string fields in multipart form)
      const { title, description, category_id, folder_id, visibility, page_count } = req.body;

      const document = await DocumentService.createDocument(
        userId,
        {
          title,
          description,
          category_id,
          folder_id: folder_id || null,
          visibility: visibility || 'PRIVATE',
          file_type: fileType,
          file_size: fileSize,
          page_count: page_count ? parseInt(page_count, 10) : null,
        },
        documentFile,
        thumbnailFile
      );

      return sendSuccess(res, 'Document uploaded successfully', document, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async search(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const filters = {
        query: req.query.query as string | undefined,
        category_id: req.query.category_id as string | undefined,
        folder_id: req.query.folder_id as string | undefined,
        visibility: req.query.visibility as any,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const results = await DocumentService.searchDocuments(userId, filters);
      return sendSuccess(res, 'Documents retrieved successfully', results);
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string;
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Document ID is required', 400);

      const document = await DocumentService.getDocumentById(userId, id);
      return sendSuccess(res, 'Document retrieved successfully', document);
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string;
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Document ID is required', 400);

      const document = await DocumentService.updateDocument(userId, id, req.body);
      return sendSuccess(res, 'Document updated successfully', document);
    } catch (error) {
      return next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string;
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Document ID is required', 400);

      const result = await DocumentService.deleteDocument(userId, id);
      return sendSuccess(res, 'Document deleted successfully', result);
    } catch (error) {
      return next(error);
    }
  }
}
