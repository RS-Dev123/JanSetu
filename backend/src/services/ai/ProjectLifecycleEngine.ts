import { db } from '../../config/firebase';
import { Submission } from '../../models/db.types';

export type LifecycleStage =
  | 'Submitted'
  | 'Verification'
  | 'AI Analysis'
  | 'Department Assigned'
  | 'Budget Approved'
  | 'Tender'
  | 'Contractor Assigned'
  | 'Work Started'
  | 'Inspection'
  | 'Completed'
  | 'Citizen Feedback';

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  'Submitted',
  'Verification',
  'AI Analysis',
  'Department Assigned',
  'Budget Approved',
  'Tender',
  'Contractor Assigned',
  'Work Started',
  'Inspection',
  'Completed',
  'Citizen Feedback'
];

export class ProjectLifecycleEngine {
  static getNextStage(current: string): LifecycleStage | null {
    const idx = LIFECYCLE_STAGES.indexOf(current as LifecycleStage);
    if (idx === -1 || idx === LIFECYCLE_STAGES.length - 1) return null;
    return LIFECYCLE_STAGES[idx + 1];
  }

  static getPreviousStage(current: string): LifecycleStage | null {
    const idx = LIFECYCLE_STAGES.indexOf(current as LifecycleStage);
    if (idx <= 0) return null;
    return LIFECYCLE_STAGES[idx - 1];
  }

  static async updateStage(
    submissionId: string,
    newStage: LifecycleStage,
    updatedBy: string,
    remarks?: string
  ): Promise<Submission | null> {
    const submission = await db.getDoc('submissions', submissionId) as Submission | null;
    if (!submission) return null;

    const timeline = submission.timeline || [];
    timeline.push({
      status: newStage,
      description: remarks || `Advanced to lifecycle stage: ${newStage}`,
      updatedAt: new Date().toISOString(),
      updatedBy
    });

    // Map the 10 lifecycle stages to the core "status: 'pending' | 'in_progress' | 'resolved'" fields
    let coreStatus: Submission['status'] = 'pending';
    if (newStage === 'Completed' || newStage === 'Citizen Feedback') {
      coreStatus = 'resolved';
    } else if (newStage !== 'Submitted' && newStage !== 'Verification' && newStage !== 'AI Analysis') {
      coreStatus = 'in_progress';
    }

    const updates = {
      status: coreStatus,
      lifecycleStage: newStage, // store extended stage
      timeline,
      updatedAt: new Date().toISOString()
    };

    await db.updateDoc('submissions', submissionId, updates);

    // Push notification to user
    const notificationId = 'notif_' + Math.random().toString(36).substr(2, 9);
    await db.addDoc('notifications', notificationId, {
      id: notificationId,
      userId: submission.citizenId,
      title: `Project Status: ${newStage}`,
      message: `Your complaint "${submission.title}" has transitioned to stage: ${newStage}. Remarks: ${remarks || 'None'}`,
      type: newStage === 'Completed' ? 'success' : 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return {
      ...submission,
      ...updates
    };
  }
}
