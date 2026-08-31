import { z } from 'zod';
import { Visibility } from '@prisma/client';

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  folder_id: z.string().uuid('Folder ID must be a valid UUID').nullable().optional(),
  visibility: z.nativeEnum(Visibility).default(Visibility.PRIVATE),
  file_type: z.string().min(1, 'File type is required'),
  file_size: z.coerce.number().int().nonnegative('File size must be a non-negative integer'),
  page_count: z.coerce.number().int().positive('Page count must be a positive integer').nullable().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  folder_id: z.string().uuid().nullable().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
});

export const documentSearchQuerySchema = z.object({
  query: z.string().optional(),
  category_id: z.string().uuid().optional(),
  folder_id: z.string().uuid().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
