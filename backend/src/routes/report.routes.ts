import { Router } from 'express';
import { exportCSV, exportPDF } from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/csv', requireAuth, exportCSV);
router.get('/pdf', requireAuth, exportPDF);

export default router;
