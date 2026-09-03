import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { uploadAvatarField } from '../middlewares/upload.middleware';

const router = Router();

router.post('/register', uploadAvatarField, validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);

export default router;
