import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name must be at least 1 character').max(100, 'Folder name too long'),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name must be at least 1 character').max(100, 'Folder name too long'),
});
