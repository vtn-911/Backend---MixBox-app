import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadDocumentFields } from '../middlewares/upload.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { createDocumentSchema, updateDocumentSchema, documentSearchQuerySchema } from '../validators/document.validator';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  uploadDocumentFields,
  validateBody(createDocumentSchema),
  DocumentController.create
);

router.get(
  '/',
  validateQuery(documentSearchQuerySchema),
  DocumentController.search
);

router.get('/:id', DocumentController.getById);
router.put('/:id', validateBody(updateDocumentSchema), DocumentController.update);
router.delete('/:id', DocumentController.delete);

export default router;
