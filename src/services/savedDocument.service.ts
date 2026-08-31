import prisma from '../prisma/prisma.service';
import { AppError } from '../middlewares/error.middleware';

export class SavedDocumentService {
  static async saveDocument(userId: string, documentId: string) {
    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Check if already saved
    const existing = await prisma.savedDocument.findUnique({
      where: {
        user_id_document_id: {
          user_id: userId,
          document_id: documentId,
        },
      },
    });

    if (existing) {
      throw new AppError('Document is already saved', 400);
    }

    return prisma.savedDocument.create({
      data: {
        user_id: userId,
        document_id: documentId,
      },
      include: {
        document: true,
      },
    });
  }

  static async unsaveDocument(userId: string, documentId: string) {
    const existing = await prisma.savedDocument.findUnique({
      where: {
        user_id_document_id: {
          user_id: userId,
          document_id: documentId,
        },
      },
    });

    if (!existing) {
      throw new AppError('Document is not saved by this user', 404);
    }

    await prisma.savedDocument.delete({
      where: {
        user_id_document_id: {
          user_id: userId,
          document_id: documentId,
        },
      },
    });

    return { success: true };
  }

  static async listSavedDocuments(userId: string) {
    return prisma.savedDocument.findMany({
      where: { user_id: userId },
      orderBy: { saved_at: 'desc' },
      include: {
        document: {
          include: {
            owner: {
              select: {
                id: true,
                full_name: true,
                avatar_url: true,
              },
            },
            category: true,
          },
        },
      },
    });
  }
}
