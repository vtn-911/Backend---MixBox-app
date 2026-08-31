import prisma from '../prisma/prisma.service';
import { AppError } from '../middlewares/error.middleware';

export class FolderService {
  static async createFolder(userId: string, name: string) {
    return prisma.folder.create({
      data: {
        user_id: userId,
        name,
      },
    });
  }

  static async listFolders(userId: string) {
    return prisma.folder.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });
  }

  static async updateFolder(userId: string, folderId: string, name: string) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, user_id: userId },
    });

    if (!folder) {
      throw new AppError('Folder not found or unauthorized', 404);
    }

    return prisma.folder.update({
      where: { id: folderId },
      data: { name },
    });
  }

  static async deleteFolder(userId: string, folderId: string) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, user_id: userId },
    });

    if (!folder) {
      throw new AppError('Folder not found or unauthorized', 404);
    }

    // SetNull is handled by Prisma configuration onDelete: SetNull in schema.prisma
    await prisma.folder.delete({
      where: { id: folderId },
    });

    return { success: true };
  }
}
