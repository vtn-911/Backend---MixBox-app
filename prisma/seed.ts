import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // Hash password for users: "password123"
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  const john = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: passwordHash,
      avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password_hash: passwordHash,
      avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jane',
    },
  });

  console.log('✅ Users seeded:');
  console.log(`- Email: ${john.email} / Password: password123`);
  console.log(`- Email: ${jane.email} / Password: password123`);

  // 2. Seed Default Categories (if not already done)
  const categories = [
    { name: 'Programming', description: 'Coding languages and paradigms' },
    { name: 'Database', description: 'SQL, NoSQL and database design' },
    { name: 'Mathematics', description: 'Calculus, algebra, discrete math, etc.' },
    { name: 'Software Engineering', description: 'Design patterns, SDLC, testing' },
    { name: 'Other', description: 'General document category' },
  ];

  console.log('🌱 Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
