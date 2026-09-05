import prisma from '../prisma/prisma.service';
import { AppError } from '../middlewares/error.middleware';

export class CategoryService {
  static async listCategories() {
    return prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createCategory(data: { name: string; description?: string }) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError('Category already exists', 400);
    }

    return prisma.category.create({
      data,
    });
  }

  static async seedDefaultCategories() {
    const defaults = [
      { name: 'Programming', description: 'Coding languages and paradigms' },
      { name: 'Database', description: 'SQL, NoSQL and database design' },
      { name: 'Mathematics', description: 'Calculus, algebra, discrete math, etc.' },
      { name: 'Software Engineering', description: 'Design patterns, SDLC, testing' },
      { name: 'Other', description: 'General document category' },
    ];

    for (const cat of defaults) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }
  }
}
