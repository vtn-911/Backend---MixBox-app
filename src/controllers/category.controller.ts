import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { sendSuccess } from '../utils/response';

export class CategoryController {
  static async list(_req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const categories = await CategoryService.listCategories();
      return sendSuccess(res, 'Categories retrieved successfully', categories);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const category = await CategoryService.createCategory(req.body);
      return sendSuccess(res, 'Category created successfully', category, 201);
    } catch (error) {
      return next(error);
    }
  }
}
