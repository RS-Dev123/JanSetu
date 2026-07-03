import { db } from '../../config/firebase';
import { Submission, DuplicateGroup } from '../../models/db.types';
import { runDuplicateAgent } from './agents/duplicate.agent';

export interface DuplicateCluster {
  id: string;
  category: string;
  submissions: Submission[];
  primarySubmission: Submission | null;
}

export class DuplicateDetectionEngine {
  /**
   * Run duplicate detection on a newly submitted issue
   */
  static async checkDuplicateIssue(
    issueId: string,
    text: string,
    category: string
  ) {
    return await runDuplicateAgent(issueId, text, category);
  }

  /**
   * Automatically groups all current pending/existing duplicate submissions into clusters.
   */
  static async getDuplicateClusters(): Promise<DuplicateCluster[]> {
    const groups = await db.getCollection('duplicateGroups') as DuplicateGroup[];
    const submissions = await db.getCollection('submissions') as Submission[];
    const clusters: DuplicateCluster[] = [];

    for (const group of groups) {
      const clusterSubs = submissions.filter(s => group.submissionIds.includes(s.id));
      const primary = submissions.find(s => s.id === group.primarySubmissionId) || null;
      clusters.push({
        id: group.id,
        category: group.category,
        submissions: clusterSubs,
        primarySubmission: primary
      });
    }

    return clusters;
  }
}
