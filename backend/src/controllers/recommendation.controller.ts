import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Recommendation } from '../models/db.types';
import { generateConstituencyRecommendations } from '../services/recommendation.service';

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { constituency } = req.query;
    let recs = await db.getCollection('recommendations') as Recommendation[];
    if (constituency) {
      recs = recs.filter(r => r.constituency.toLowerCase() === (constituency as string).toLowerCase());
    }
    res.status(200).json(recs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const generateRecommendations = async (req: any, res: Response): Promise<void> => {
  try {
    const constituency = req.user?.constituency || 'New Delhi';
    const recs = await generateConstituencyRecommendations(constituency);
    
    // Log Activity
    const logId = 'log_' + Math.random().toString(36).substr(2, 9);
    await db.addDoc('activityLogs', logId, {
      id: logId,
      userId: req.user?.uid || 'system',
      userName: req.user?.name || 'System Orchestrator',
      role: req.user?.role || 'admin',
      action: 'GENERATE_RECS',
      details: `Generated ${recs.length} project recommendations for ${constituency}`,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({ 
      message: `Generated ${recs.length} recommendations successfully.`, 
      recommendations: recs 
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const approveRecommendation = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!status || !['approved', 'rejected', 'implemented'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const rec = await db.getDoc('recommendations', id) as Recommendation;
    if (!rec) {
      res.status(404).json({ error: 'Recommendation not found.' });
      return;
    }

    await db.updateDoc('recommendations', id, { status });

    // Log Activity
    const logId = 'log_' + Math.random().toString(36).substr(2, 9);
    await db.addDoc('activityLogs', logId, {
      id: logId,
      userId: req.user?.uid || 'system',
      userName: req.user?.name || 'Admin',
      role: req.user?.role || 'admin',
      action: 'APPROVE_REC',
      details: `${status.toUpperCase()} project recommendation: ${rec.title}`,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
