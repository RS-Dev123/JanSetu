import { Request, Response } from 'express';
import { PriorityRankingEngine } from '../services/ai/PriorityRankingEngine';
import { XAIEngine } from '../services/ai/XAIEngine';
import { BudgetOptimizer } from '../services/ai/BudgetOptimizer';
import { DevelopmentPlanner } from '../services/ai/DevelopmentPlanner';
import { PredictiveAnalytics } from '../services/ai/PredictiveAnalytics';
import { ScenarioSimulator } from '../services/ai/ScenarioSimulator';
import { DuplicateDetectionEngine } from '../services/ai/DuplicateDetectionEngine';
import { DepartmentAssigner } from '../services/ai/DepartmentAssigner';
import { ProjectLifecycleEngine, LifecycleStage } from '../services/ai/ProjectLifecycleEngine';
import { MeetingBriefGenerator } from '../services/ai/MeetingBriefGenerator';
import { RiskAssessmentEngine } from '../services/ai/RiskAssessmentEngine';
import { ImpactEstimator } from '../services/ai/ImpactEstimator';
import { db } from '../config/firebase';
import { Submission } from '../models/db.types';
import { RealGovConnector } from '../services/integration/RealGovConnector';

export const getPriorityReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      res.status(400).json({ error: 'submissionId is required.' });
      return;
    }
    const report = await PriorityRankingEngine.generatePriorityReport(submissionId);
    
    // Also attach XAI explanation details
    const submission = await db.getDoc('submissions', submissionId) as Submission | null;
    let explanation = null;
    let riskReport = null;
    let impactReport = null;

    if (submission) {
      explanation = await XAIEngine.explainDecision(
        submission.category,
        report.priorityScore,
        submission.aiAnalysis?.evidence || [],
        submission.description
      );

      riskReport = await RiskAssessmentEngine.assessRisk(
        submission.title,
        submission.category,
        report.estimatedCost,
        report.estimatedCompletion
      );

      impactReport = await ImpactEstimator.estimateImpact(
        submission.title,
        submission.category,
        report.estimatedCost,
        submission.location.village || submission.location.ward || 'General Area'
      );
    }

    res.status(200).json({ report, explanation, riskReport, impactReport });
  } catch (error: any) {
    console.error('Error getting priority report:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const optimizeBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalBudget, constituency, categories } = req.body;
    if (!totalBudget) {
      res.status(400).json({ error: 'totalBudget is required.' });
      return;
    }
    const result = await BudgetOptimizer.optimize(
      totalBudget,
      constituency || 'New Delhi',
      categories
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const planDevelopment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { budget, timelineMonths, departments, district, village, ward, population } = req.body;
    if (!budget || !district) {
      res.status(400).json({ error: 'budget and district are required.' });
      return;
    }
    const result = await DevelopmentPlanner.plan({
      budget,
      timelineMonths: timelineMonths || 12,
      departments: departments || ['PWD', 'Water'],
      district,
      village,
      ward,
      population: population || 50000
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getPredictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { constituency, targetMonth } = req.query;
    if (!constituency || !targetMonth) {
      res.status(400).json({ error: 'constituency and targetMonth queries are required.' });
      return;
    }
    const result = await PredictiveAnalytics.getPredictions(
      constituency as string,
      targetMonth as string
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const simulateScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schools, roads, bridges, solarPlants, waterTanks } = req.body;
    const result = await ScenarioSimulator.simulate({
      schools: schools || 0,
      roads: roads || 0,
      bridges: bridges || 0,
      solarPlants: solarPlants || 0,
      waterTanks: waterTanks || 0
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const generateMeetingBrief = async (req: Request, res: Response): Promise<void> => {
  try {
    const { constituency, type } = req.body;
    if (!constituency || !type) {
      res.status(400).json({ error: 'constituency and type are required.' });
      return;
    }
    const brief = await MeetingBriefGenerator.generateBrief(constituency, type);
    res.status(200).json(brief);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const updateLifecycleStage = async (req: any, res: Response): Promise<void> => {
  try {
    const { submissionId, newStage, remarks } = req.body;
    if (!submissionId || !newStage) {
      res.status(400).json({ error: 'submissionId and newStage are required.' });
      return;
    }

    const userName = req.user?.name || 'Administrator';
    const updated = await ProjectLifecycleEngine.updateStage(
      submissionId,
      newStage as LifecycleStage,
      userName,
      remarks
    );

    if (!updated) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    // Log Activity
    const logId = 'log_' + Math.random().toString(36).substr(2, 9);
    await db.addDoc('activityLogs', logId, {
      id: logId,
      userId: req.user?.uid || 'system',
      userName,
      role: req.user?.role || 'admin',
      action: 'LIFECYCLE_STAGE_UPDATE',
      details: `Advanced submission "${submissionId}" to stage: ${newStage}`,
      createdAt: new Date().toISOString()
    });

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getDuplicateClusters = async (req: Request, res: Response): Promise<void> => {
  try {
    const clusters = await DuplicateDetectionEngine.getDuplicateClusters();
    res.status(200).json(clusters);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getGovData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { district, lat, lng, station } = req.query;
    const nfhs = await RealGovConnector.fetchNFHSIndicators((district as string) || 'New Delhi');
    const pmgsy = await RealGovConnector.fetchPMGSYRoadNetwork((district as string) || 'New Delhi');
    const weather = await RealGovConnector.fetchWeatherData(
      lat ? Number(lat) : 28.62,
      lng ? Number(lng) : 77.21
    );
    const cpcb = await RealGovConnector.fetchAirQuality((station as string) || 'Delhi Central');
    
    res.status(200).json({ nfhs, pmgsy, weather, cpcb });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
