import prisma from '../prisma/prisma.service';
import { AppError } from '../middlewares/error.middleware';
import { saveLocalFile, deleteLocalFile } from '../utils/storage';
import { Visibility } from '@prisma/client';

export class DocumentService {
  static async createDocument(
    userId: string,
    data: {
      title: string;
      description?: string;
      category_id: string;
      folder_id?: string | null;
      visibility: Visibility;
      file_type: string;
      file_size: number;
      page_count?: number | null;
    },
    documentFile: Express.Multer.File,
    thumbnailFile?: Express.Multer.File
  ) {
    // Save files
    const storedDoc = await saveLocalFile(documentFile);
    let storedThumbUrl: string | null = null;

    if (thumbnailFile) {
      const storedThumb = await saveLocalFile(thumbnailFile);
      storedThumbUrl = storedThumb.fileUrl;
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.category_id },
    });
    if (!category) {
      // Clean up uploaded files on validation failure
      await deleteLocalFile(storedDoc.fileUrl);
      if (storedThumbUrl) await deleteLocalFile(storedThumbUrl);
      throw new AppError('Category not found', 400);
    }

    // Verify folder exists and belongs to user
    if (data.folder_id) {
      const folder = await prisma.folder.findFirst({
        where: { id: data.folder_id, user_id: userId },
      });
      if (!folder) {
        await deleteLocalFile(storedDoc.fileUrl);
        if (storedThumbUrl) await deleteLocalFile(storedThumbUrl);
        throw new AppError('Folder not found or unauthorized', 400);
      }
    }

    return prisma.document.create({
      data: {
        owner_id: userId,
        category_id: data.category_id,
        folder_id: data.folder_id || null,
        title: data.title,
        description: data.description,
        file_url: storedDoc.fileUrl,
        thumbnail_url: storedThumbUrl,
        file_type: data.file_type,
        file_size: data.file_size,
        page_count: data.page_count || null,
        visibility: data.visibility,
      },
      include: {
        category: true,
        folder: true,
      },
    });
  }

  static async searchDocuments(
    userId: string,
    filters: {
      query?: string;
      category_id?: string;
      folder_id?: string;
      visibility?: Visibility;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Build query conditions
    const where: any = {
      OR: [
        { visibility: Visibility.PUBLIC },
        { owner_id: userId },
      ],
    };

    if (filters.query) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { title: { contains: filters.query } },
          { description: { contains: filters.query } },
        ],
      });
    }

    if (filters.category_id) {
      where.category_id = filters.category_id;
    }

    if (filters.folder_id) {
      where.folder_id = filters.folder_id;
      // If filtering by folder, ensure the user owns the folder (meaning they only see folder docs if they are the owner)
      where.owner_id = userId;
    }

    if (filters.visibility) {
      // If filtering by visibility, ensure it aligns with privacy rules
      if (filters.visibility === Visibility.PRIVATE) {
        where.visibility = Visibility.PRIVATE;
        where.owner_id = userId; // Can only see own private docs
      } else {
        where.visibility = Visibility.PUBLIC;
      }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
            },
          },
          category: true,
          folder: true,
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getDocumentById(userId: string, documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
          },
        },
        category: true,
        folder: true,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Access check: Private document can only be accessed by owner
    if (document.visibility === Visibility.PRIVATE && document.owner_id !== userId) {
      throw new AppError('Access denied. Private document.', 403);
    }

    return document;
  }

  static async updateDocument(
    userId: string,
    documentId: string,
    data: {
      title?: string;
      description?: string;
      category_id?: string;
      folder_id?: string | null;
      visibility?: Visibility;
    }
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.owner_id !== userId) {
      throw new AppError('Unauthorized to update this document', 403);
    }

    // Verify Category if updating
    if (data.category_id) {
      const category = await prisma.category.findUnique({
        where: { id: data.category_id },
      });
      if (!category) throw new AppError('Category not found', 400);
    }

    // Verify Folder if updating
    if (data.folder_id) {
      const folder = await prisma.folder.findFirst({
        where: { id: data.folder_id, user_id: userId },
      });
      if (!folder) throw new AppError('Folder not found or unauthorized', 400);
    }

    return prisma.document.update({
      where: { id: documentId },
      data: {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        folder_id: data.folder_id === undefined ? undefined : data.folder_id,
        visibility: data.visibility,
      },
      include: {
        category: true,
        folder: true,
      },
    });
  }

  static async deleteDocument(userId: string, documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.owner_id !== userId) {
      throw new AppError('Unauthorized to delete this document', 403);
    }

    // Delete actual files on disk
    await deleteLocalFile(document.file_url);
    if (document.thumbnail_url) {
      await deleteLocalFile(document.thumbnail_url);
    }

    // Delete DB record
    await prisma.document.delete({
      where: { id: documentId },
    });

    return { success: true };
  }
}
