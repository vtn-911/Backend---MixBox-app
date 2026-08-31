import app from './app';
import { env } from './config/env';
import { CategoryService } from './services/category.service';
import prisma from './prisma/prisma.service';

async function bootstrap() {
  try {
    // Test Database connection
    await prisma.$connect();
    console.log('🔌 Connected to the database successfully.');

    // Seed categories
    await CategoryService.seedDefaultCategories();
    console.log('🌱 Default categories seeded successfully.');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
}

bootstrap();
