import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/login', validateBody(['email', 'password']), login);
router.get('/me', requireAdmin, getMe);

export default router;
