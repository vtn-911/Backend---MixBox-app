import { Router } from 'express';
import { FolderController } from '../controllers/folder.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { createFolderSchema, updateFolderSchema } from '../validators/folder.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(createFolderSchema), FolderController.create);
router.get('/', FolderController.list);
router.put('/:id', validateBody(updateFolderSchema), FolderController.update);
router.delete('/:id', FolderController.delete);

export default router;
