import { Router } from 'express';
import {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmissionStatus
} from '../controllers/submission.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Endpoint for submitting issues, supporting image and voice recordings
router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  createSubmission
);

router.get('/', requireAuth, getSubmissions);
router.get('/:id', requireAuth, getSubmissionById);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole(['mp', 'officer', 'admin']),
  updateSubmissionStatus
);

export default router;
