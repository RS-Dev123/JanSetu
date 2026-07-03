import { Router } from 'express';
import {
  getPriorityReport,
  optimizeBudget,
  planDevelopment,
  getPredictions,
  simulateScenario,
  generateMeetingBrief,
  updateLifecycleStage,
  getDuplicateClusters,
  getGovData
} from '../controllers/ai.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/priority-report', requireAuth, getPriorityReport);
router.post('/budget-optimize', requireAuth, requireRole(['mp', 'officer', 'admin']), optimizeBudget);
router.post('/planner', requireAuth, requireRole(['mp', 'officer', 'admin']), planDevelopment);
router.get('/predict', requireAuth, getPredictions);
router.post('/simulate', requireAuth, simulateScenario);
router.post('/meeting-brief', requireAuth, requireRole(['mp', 'officer', 'admin']), generateMeetingBrief);
router.post('/lifecycle-stage', requireAuth, updateLifecycleStage);
router.get('/duplicate-clusters', requireAuth, requireRole(['mp', 'officer', 'admin']), getDuplicateClusters);
router.get('/gov-data', requireAuth, getGovData);

export default router;
