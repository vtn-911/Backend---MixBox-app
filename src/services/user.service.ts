import prisma from '../prisma/prisma.service';
import { AppError } from '../middlewares/error.middleware';

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateAvatar(userId: string, avatarUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl },
      select: {
        id: true,
        full_name: true,
        email: true,
        avatar_url: true,
      },
    });

    return user;
  }

  static async getUserStats(userId: string) {
    const [documentsCount, foldersCount, quizzesCount, savedDocsCount, quizResultsCount] = await Promise.all([
      prisma.document.count({ where: { owner_id: userId } }),
      prisma.folder.count({ where: { user_id: userId } }),
      prisma.quiz.count({ where: { creator_id: userId } }),
      prisma.savedDocument.count({ where: { user_id: userId } }),
      prisma.quizResult.count({ where: { user_id: userId } }),
    ]);

    return {
      documents_count: documentsCount,
      folders_count: foldersCount,
      quizzes_count: quizzesCount,
      saved_documents_count: savedDocsCount,
      quiz_results_count: quizResultsCount,
    };
  }
}
