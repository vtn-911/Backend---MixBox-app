import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { createQuizSchema, submitQuizResultSchema } from '../validators/quiz.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(createQuizSchema), QuizController.create);
router.get('/', QuizController.list);
router.get('/results', QuizController.getResults); // Placing /results before /:id to avoid collision
router.get('/:id', QuizController.getById);
router.post('/:id/results', validateBody(submitQuizResultSchema), QuizController.submitResult);

export default router;
