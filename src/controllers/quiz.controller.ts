import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { QuizService } from '../services/quiz.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';

export class QuizController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const quiz = await QuizService.createQuiz(userId, req.body);
      return sendSuccess(res, 'Quiz created successfully', quiz, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string;
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Quiz ID is required', 400);

      const quiz = await QuizService.getQuizById(userId, id);
      return sendSuccess(res, 'Quiz retrieved successfully', quiz);
    } catch (error) {
      return next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const filters = {
        document_id: req.query.document_id as string | undefined,
      };

      const quizzes = await QuizService.listQuizzes(userId, filters);
      return sendSuccess(res, 'Quizzes retrieved successfully', quizzes);
    } catch (error) {
      return next(error);
    }
  }

  static async submitResult(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const id = req.params.id as string; // quizId
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!id) throw new AppError('Quiz ID is required', 400);

      const result = await QuizService.submitQuizResult(userId, id, req.body);
      return sendSuccess(res, 'Quiz result submitted successfully', result, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const quizId = req.query.quiz_id as string | undefined;
      if (!userId) throw new AppError('Unauthorized', 401);

      const results = await QuizService.getQuizResults(userId, quizId);
      return sendSuccess(res, 'Quiz results retrieved successfully', results);
    } catch (error) {
      return next(error);
    }
  }
}
