import { z } from 'zod';
import { QuestionType, Difficulty } from '@prisma/client';

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  document_id: z.string().uuid('Document ID must be a valid UUID'),
  question_type: z.nativeEnum(QuestionType),
  question_count: z.number().int().positive('Question count must be positive'),
  time_limit: z.number().int().positive('Time limit must be positive').nullable().optional(),
  difficulty: z.nativeEnum(Difficulty),
  questions: z.array(
    z.object({
      question_text: z.string().min(1, 'Question text is required'),
      question_type: z.nativeEnum(QuestionType),
      order_number: z.number().int().positive(),
      explanation: z.string().optional(),
      answers: z.array(
        z.object({
          answer_text: z.string().min(1, 'Answer text is required'),
          is_correct: z.boolean(),
        })
      ).min(1, 'Each question must have at least one answer option'),
    })
  ).optional(), // Can create empty quiz shell, but typically contains questions
});

export const submitQuizResultSchema = z.object({
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  correct_count: z.number().int().nonnegative(),
  wrong_count: z.number().int().nonnegative(),
  time_spent: z.number().int().nonnegative('Time spent in seconds must be non-negative'),
});
