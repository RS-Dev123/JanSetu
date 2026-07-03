import { Router } from 'express';
import { sendChatMessage, getChatHistory } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, sendChatMessage);
router.get('/history', requireAuth, getChatHistory);

export default router;
