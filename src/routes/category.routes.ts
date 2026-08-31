import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Categories are public to read but can require authentication or admin privileges to write
router.get('/', CategoryController.list);

// Let's protect category creation with auth
router.post('/', authMiddleware, CategoryController.create);

export default router;
