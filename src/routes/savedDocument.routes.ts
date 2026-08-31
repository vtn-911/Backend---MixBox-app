import { Router } from 'express';
import { SavedDocumentController } from '../controllers/savedDocument.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', SavedDocumentController.save);
router.get('/', SavedDocumentController.list);
router.delete('/:id', SavedDocumentController.unsave); // id here refers to the document_id

export default router;
