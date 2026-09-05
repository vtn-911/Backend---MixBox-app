import { PrismaClient, Visibility, QuestionType, Difficulty } from '@prisma/client';
import type { Folder } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Fetch existing Users and Categories
  // Không tạo mới, chỉ lấy ra từ DB để đảm bảo tuân thủ yêu cầu
  const john = await prisma.user.findUnique({ where: { email: 'john.doe@example.com' } });
  const jane = await prisma.user.findUnique({ where: { email: 'jane.smith@example.com' } });

  if (!john || !jane) {
    throw new Error('Required users (John and Jane) not found. Vui lòng đảm bảo User đã có trong DB.');
  }

  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    throw new Error('Categories not found. Vui lòng đảm bảo Category đã có trong DB.');
  }

  const getCategory = (name: string) => {
    const cat = categories.find((c) => c.name === name);
    if (!cat) throw new Error(`Category ${name} not found`);
    return cat.id;
  };

  const programmingId = getCategory('Programming');
  const databaseId = getCategory('Database');
  const mathId = getCategory('Mathematics');
  const swEngId = getCategory('Software Engineering');
  const otherId = getCategory('Other');

  // 2. Seed Folders
  const folderData = [
    { user_id: john.id, name: 'Programming' },
    { user_id: john.id, name: 'Database' },
    { user_id: john.id, name: 'Personal Study' },
    { user_id: jane.id, name: 'Flutter' },
    { user_id: jane.id, name: 'Mathematics' },
    { user_id: jane.id, name: 'Software Engineering' },
    { user_id: jane.id, name: 'Saved Documents' },
  ];

  const folders: Folder[] = [];
  for (const data of folderData) {
    let folder = await prisma.folder.findFirst({
      where: { user_id: data.user_id, name: data.name },
    });
    if (!folder) {
      folder = await prisma.folder.create({ data });
    }
    folders.push(folder);
  }

  const getFolder = (userName: string, folderName: string) => {
    const userId = userName === 'John' ? john.id : jane.id;
    return folders.find((f) => f.user_id === userId && f.name === folderName)!;
  };

  // 3. Seed Documents
  const documentData = [
    { title: 'Intro to Node.js', owner_id: john.id, category_id: programmingId, file_url: 'sample-local-pdf.pdf', file_type: 'application/pdf', file_size: 102400, page_count: 5, visibility: Visibility.PUBLIC },
    { title: 'Advanced React', owner_id: john.id, category_id: programmingId, file_url: 'http://example.com/react.pdf', file_type: 'application/pdf', file_size: 204800, page_count: 4, visibility: Visibility.PUBLIC },
    { title: 'MySQL Optimization', owner_id: john.id, category_id: databaseId, file_url: 'http://example.com/mysql.pdf', file_type: 'application/pdf', file_size: 512000, page_count: 3, visibility: Visibility.PRIVATE },
    { title: 'Life Advice', owner_id: john.id, category_id: otherId, file_url: 'http://example.com/life.pdf', file_type: 'application/pdf', file_size: 1024, page_count: 2, visibility: Visibility.PRIVATE },
    { title: 'Flutter Basics', owner_id: jane.id, category_id: programmingId, file_url: 'http://example.com/flutter.pdf', file_type: 'application/pdf', file_size: 307200, page_count: 5, visibility: Visibility.PUBLIC },
    { title: 'State Management in Flutter', owner_id: jane.id, category_id: programmingId, file_url: 'http://example.com/flutter_state.pdf', file_type: 'application/pdf', file_size: 409600, page_count: 4, visibility: Visibility.PUBLIC },
    { title: 'Calculus I', owner_id: jane.id, category_id: mathId, file_url: 'http://example.com/calc.pdf', file_type: 'application/pdf', file_size: 153600, page_count: 5, visibility: Visibility.PUBLIC },
    { title: 'Linear Algebra', owner_id: jane.id, category_id: mathId, file_url: 'http://example.com/algebra.pdf', file_type: 'application/pdf', file_size: 256000, page_count: 3, visibility: Visibility.PUBLIC },
    { title: 'Clean Code', owner_id: jane.id, category_id: swEngId, file_url: 'http://example.com/cleancode.pdf', file_type: 'application/pdf', file_size: 1024000, page_count: 5, visibility: Visibility.PRIVATE },
    { title: 'Design Patterns', owner_id: jane.id, category_id: swEngId, file_url: 'http://example.com/patterns.pdf', file_type: 'application/pdf', file_size: 819200, page_count: 4, visibility: Visibility.PUBLIC },
    { title: 'Docker for Beginners', owner_id: john.id, category_id: swEngId, file_url: 'http://example.com/docker.pdf', file_type: 'application/pdf', file_size: 204800, page_count: 3, visibility: Visibility.PUBLIC },
    { title: 'MongoDB vs PostgreSQL', owner_id: jane.id, category_id: databaseId, file_url: 'http://example.com/db.pdf', file_type: 'application/pdf', file_size: 102400, page_count: 2, visibility: Visibility.PUBLIC },
  ];

  const documents = [];
  for (const data of documentData) {
    let doc = await prisma.document.findFirst({
      where: { owner_id: data.owner_id, title: data.title },
    });
    if (!doc) {
      doc = await prisma.document.create({ data });
    }
    documents.push(doc);
  }

  // 4. Seed DocumentPages
  for (const doc of documents) {
    const pageCount = doc.page_count || 1;
    for (let i = 1; i <= pageCount; i++) {
      await prisma.documentPage.upsert({
        where: {
          document_id_page_number: { document_id: doc.id, page_number: i },
        },
        update: {},
        create: {
          document_id: doc.id,
          page_number: i,
          image_url: `http://example.com/doc_${doc.id}_page_${i}.png`,
        },
      });
    }
  }

  // 5. Seed DocumentFolders (N-N)
  const documentFolderLinks = [
    // John's documents in his folders
    { docTitle: 'Intro to Node.js', folderOwner: 'John', folderName: 'Programming' },
    { docTitle: 'Advanced React', folderOwner: 'John', folderName: 'Programming' },
    { docTitle: 'MySQL Optimization', folderOwner: 'John', folderName: 'Database' },
    { docTitle: 'Life Advice', folderOwner: 'John', folderName: 'Personal Study' },
    { docTitle: 'Docker for Beginners', folderOwner: 'John', folderName: 'Programming' },

    // Jane's documents in her folders
    { docTitle: 'Flutter Basics', folderOwner: 'Jane', folderName: 'Flutter' },
    { docTitle: 'State Management in Flutter', folderOwner: 'Jane', folderName: 'Flutter' },
    { docTitle: 'Calculus I', folderOwner: 'Jane', folderName: 'Mathematics' },
    { docTitle: 'Linear Algebra', folderOwner: 'Jane', folderName: 'Mathematics' },
    { docTitle: 'Clean Code', folderOwner: 'Jane', folderName: 'Software Engineering' },
    { docTitle: 'Design Patterns', folderOwner: 'Jane', folderName: 'Software Engineering' },

    // Cross-ownership: Một Document có mặt trong nhiều folder
    // Jane đưa document do John sở hữu vào folder cá nhân của Jane
    { docTitle: 'Intro to Node.js', folderOwner: 'Jane', folderName: 'Saved Documents' },
    { docTitle: 'Docker for Beginners', folderOwner: 'Jane', folderName: 'Software Engineering' },

    // John đưa document do Jane sở hữu vào folder cá nhân của John
    { docTitle: 'MongoDB vs PostgreSQL', folderOwner: 'John', folderName: 'Database' },
    { docTitle: 'Design Patterns', folderOwner: 'John', folderName: 'Personal Study' },

    // Một document ở trong 2 folder của cùng 1 user (Jane)
    { docTitle: 'Clean Code', folderOwner: 'Jane', folderName: 'Saved Documents' },
  ];

  for (const link of documentFolderLinks) {
    const doc = documents.find((d) => d.title === link.docTitle);
    const folder = getFolder(link.folderOwner, link.folderName);

    if (doc && folder) {
      await prisma.documentFolder.upsert({
        where: {
          document_id_folder_id: { document_id: doc.id, folder_id: folder.id },
        },
        update: {},
        create: {
          document_id: doc.id,
          folder_id: folder.id,
        },
      });
    }
  }

  // 6. Seed SavedDocuments
  const savedDocLinks = [
    { userName: 'Jane', docTitle: 'Intro to Node.js' },
    { userName: 'Jane', docTitle: 'Advanced React' },
    { userName: 'Jane', docTitle: 'Docker for Beginners' },
    { userName: 'John', docTitle: 'MongoDB vs PostgreSQL' },
    { userName: 'John', docTitle: 'Design Patterns' },
    { userName: 'John', docTitle: 'Clean Code' },
  ];

  for (const link of savedDocLinks) {
    const doc = documents.find((d) => d.title === link.docTitle);
    const userId = link.userName === 'John' ? john.id : jane.id;

    if (doc) {
      await prisma.savedDocument.upsert({
        where: {
          user_id_document_id: { user_id: userId, document_id: doc.id },
        },
        update: {},
        create: {
          user_id: userId,
          document_id: doc.id,
        },
      });
    }
  }

  // 7. Seed Quizzes
  const quizData = [
    { title: 'Node.js Basics Quiz', creator_id: john.id, docTitle: 'Intro to Node.js', question_type: QuestionType.MULTIPLE_CHOICE, question_count: 5, difficulty: Difficulty.EASY, time_limit: 300 },
    { title: 'React Expert Quiz', creator_id: john.id, docTitle: 'Advanced React', question_type: QuestionType.MIXED, question_count: 5, difficulty: Difficulty.HARD, time_limit: 600 },
    { title: 'Flutter Foundation', creator_id: jane.id, docTitle: 'Flutter Basics', question_type: QuestionType.MULTIPLE_CHOICE, question_count: 5, difficulty: Difficulty.EASY, time_limit: 300 },
    { title: 'Calculus True/False', creator_id: jane.id, docTitle: 'Calculus I', question_type: QuestionType.TRUE_FALSE, question_count: 5, difficulty: Difficulty.MEDIUM, time_limit: 300 },
    { title: 'Design Patterns Mastery', creator_id: jane.id, docTitle: 'Design Patterns', question_type: QuestionType.MIXED, question_count: 6, difficulty: Difficulty.HARD, time_limit: 900 },
    { title: 'Docker Quick Test', creator_id: john.id, docTitle: 'Docker for Beginners', question_type: QuestionType.TRUE_FALSE, question_count: 4, difficulty: Difficulty.EASY, time_limit: 200 },
  ];

  const quizzes = [];
  for (const data of quizData) {
    const doc = documents.find(d => d.title === data.docTitle);
    if (!doc) continue;

    let quiz = await prisma.quiz.findFirst({
      where: { creator_id: data.creator_id, title: data.title },
    });
    if (!quiz) {
      quiz = await prisma.quiz.create({
        data: {
          title: data.title,
          creator_id: data.creator_id,
          document_id: doc.id,
          question_type: data.question_type,
          question_count: data.question_count,
          difficulty: data.difficulty,
          time_limit: data.time_limit,
        },
      });
    }
    quizzes.push(quiz);
  }

  // 8. Seed QuizQuestions & 9. QuizAnswers
  for (const quiz of quizzes) {
    for (let i = 1; i <= quiz.question_count; i++) {
      let question = await prisma.quizQuestion.findFirst({
        where: { quiz_id: quiz.id, order_number: i },
      });

      if (!question) {
        let qType = quiz.question_type;
        if (qType === QuestionType.MIXED) {
          qType = i % 2 === 0 ? QuestionType.TRUE_FALSE : QuestionType.MULTIPLE_CHOICE;
        }

        question = await prisma.quizQuestion.create({
          data: {
            quiz_id: quiz.id,
            question_text: `Sample question ${i} for ${quiz.title}?`,
            question_type: qType,
            order_number: i,
            explanation: `Explanation for question ${i}`,
          },
        });

        if (qType === QuestionType.MULTIPLE_CHOICE) {
          await prisma.quizAnswer.createMany({
            data: [
              { question_id: question.id, answer_text: 'Option A (Correct)', is_correct: true },
              { question_id: question.id, answer_text: 'Option B', is_correct: false },
              { question_id: question.id, answer_text: 'Option C', is_correct: false },
              { question_id: question.id, answer_text: 'Option D', is_correct: false },
            ],
          });
        } else if (qType === QuestionType.TRUE_FALSE) {
          await prisma.quizAnswer.createMany({
            data: [
              { question_id: question.id, answer_text: 'True', is_correct: true },
              { question_id: question.id, answer_text: 'False', is_correct: false },
            ],
          });
        }
      }
    }
  }

  // 10. Seed QuizResult
  for (const quiz of quizzes) {
    for (const user of [john, jane]) {
      let result = await prisma.quizResult.findFirst({
        where: { user_id: user.id, quiz_id: quiz.id },
      });

      if (!result) {
        const correct = Math.floor(quiz.question_count * 0.8);
        const wrong = quiz.question_count - correct;
        const score = (correct / quiz.question_count) * 100;

        await prisma.quizResult.create({
          data: {
            user_id: user.id,
            quiz_id: quiz.id,
            score: score,
            correct_count: correct,
            wrong_count: wrong,
            time_spent: 120, // 2 minutes
          },
        });
      }
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
