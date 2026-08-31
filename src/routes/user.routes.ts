import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadAvatarField } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', UserController.getProfile);
router.get('/stats', UserController.getStats);
router.put('/avatar', uploadAvatarField, UserController.updateAvatar);

export default router;
