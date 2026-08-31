import prisma from '../prisma/prisma.service';
import { AppError } from '../middlewares/error.middleware';
import { QuestionType, Difficulty } from '@prisma/client';

export class QuizService {
  static async createQuiz(
    userId: string,
    data: {
      title: string;
      document_id: string;
      question_type: QuestionType;
      question_count: number;
      time_limit?: number | null;
      difficulty: Difficulty;
      questions?: Array<{
        question_text: string;
        question_type: QuestionType;
        order_number: number;
        explanation?: string;
        answers: Array<{
          answer_text: string;
          is_correct: boolean;
        }>;
      }>;
    }
  ) {
    // Verify document exists and is accessible
    const doc = await prisma.document.findUnique({
      where: { id: data.document_id },
    });

    if (!doc) {
      throw new AppError('Source document not found', 404);
    }

    if (doc.visibility === 'PRIVATE' && doc.owner_id !== userId) {
      throw new AppError('Access denied to source document', 403);
    }

    // Build the query options to insert quiz, questions and answers
    const quizCreateData: any = {
      creator_id: userId,
      document_id: data.document_id,
      title: data.title,
      question_type: data.question_type,
      question_count: data.question_count,
      time_limit: data.time_limit || null,
      difficulty: data.difficulty,
    };

    if (data.questions && data.questions.length > 0) {
      quizCreateData.questions = {
        create: data.questions.map((q) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          order_number: q.order_number,
          explanation: q.explanation || null,
          answers: {
            create: q.answers.map((a) => ({
              answer_text: a.answer_text,
              is_correct: a.is_correct,
            })),
          },
        })),
      };
    }

    return prisma.quiz.create({
      data: quizCreateData,
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  static async getQuizById(userId: string, quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        document: true,
        creator: {
          select: {
            id: true,
            full_name: true,
          },
        },
        questions: {
          orderBy: { order_number: 'asc' },
          include: {
            answers: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Access check: If document is private, only owner of document can view quiz
    if (quiz.document.visibility === 'PRIVATE' && quiz.document.owner_id !== userId && quiz.creator_id !== userId) {
      throw new AppError('Access denied to this quiz', 403);
    }

    return quiz;
  }

  static async listQuizzes(userId: string, filters: { document_id?: string }) {
    const where: any = {
      OR: [
        { creator_id: userId },
        { document: { visibility: 'PUBLIC' } },
      ],
    };

    if (filters.document_id) {
      where.document_id = filters.document_id;
    }

    return prisma.quiz.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        document: {
          select: {
            title: true,
            file_type: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
    });
  }

  static async submitQuizResult(
    userId: string,
    quizId: string,
    result: {
      score: number;
      correct_count: number;
      wrong_count: number;
      time_spent: number;
    }
  ) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    return prisma.quizResult.create({
      data: {
        user_id: userId,
        quiz_id: quizId,
        score: result.score,
        correct_count: result.correct_count,
        wrong_count: result.wrong_count,
        time_spent: result.time_spent,
      },
      include: {
        quiz: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  static async getQuizResults(userId: string, quizId?: string) {
    const where: any = { user_id: userId };
    if (quizId) {
      where.quiz_id = quizId;
    }

    return prisma.quizResult.findMany({
      where,
      orderBy: { completed_at: 'desc' },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            question_type: true,
          },
        },
      },
    });
  }
}
