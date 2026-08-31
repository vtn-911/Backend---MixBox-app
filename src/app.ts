import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';

// Import Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import documentRoutes from './routes/document.routes';
import folderRoutes from './routes/folder.routes';
import categoryRoutes from './routes/category.routes';
import quizRoutes from './routes/quiz.routes';
import savedDocumentRoutes from './routes/savedDocument.routes';

const app = express();

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow local uploads to be retrieved statically
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/saved-documents', savedDocumentRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
