import { Router } from 'express';
import {
  getRecommendations,
  generateRecommendations,
  approveRecommendation
} from '../controllers/recommendation.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getRecommendations);
router.post('/generate', requireAuth, requireRole(['mp', 'officer', 'admin']), generateRecommendations);
router.patch('/:id/approve', requireAuth, requireRole(['mp', 'officer', 'admin']), approveRecommendation);

export default router;
