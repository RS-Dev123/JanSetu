import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import submissionRoutes from './routes/submission.routes';
import recommendationRoutes from './routes/recommendation.routes';
import chatRoutes from './routes/chat.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import aiRoutes from './routes/ai.routes';
import { seedDemoData } from './utils/seeder';
import { db } from './config/firebase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Config CORS dynamically based on ALLOWED_ORIGINS env variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Core routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// ─── Demo Mode Routes ────────────────────────────────────────────────────────

// POST /api/submissions/simulate-complaint — adds one realistic random complaint
// NOTE: mounted on the same router path as submissions
app.post('/api/submissions/simulate-complaint', async (req: Request, res: Response) => {
  try {
    const SIMULATED: Array<{ title: string; description: string; category: string; lat: number; lng: number; district: string; state: string; urgency: string }> = [
      { title: 'Street flooding after rainfall', description: 'Main road flooded after 20 minutes of rain. Drains blocked completely.', category: 'Sanitation & Waste', lat: 28.6200, lng: 77.2000, district: 'New Delhi', state: 'Delhi', urgency: 'high' },
      { title: 'Hospital out of vaccines', description: 'Child vaccination camp cancelled. No stock at PHC for 3 weeks.', category: 'Healthcare', lat: 22.4500, lng: 87.3200, district: 'Paschim Medinipur', state: 'West Bengal', urgency: 'critical' },
      { title: 'Pothole on highway near school', description: 'Huge pothole outside primary school. Children at accident risk daily.', category: 'Roads & Transport', lat: 12.9700, lng: 77.5900, district: 'Bengaluru Urban', state: 'Karnataka', urgency: 'critical' },
      { title: 'Water pipeline burst', description: 'Burst pipeline wasting thousands of litres daily near bus stand.', category: 'Water Supply', lat: 28.6500, lng: 77.2200, district: 'New Delhi', state: 'Delhi', urgency: 'high' },
      { title: 'School building roof leaking', description: 'Roof leaks every monsoon. Classes disrupted. 200 students affected.', category: 'Education', lat: 22.5000, lng: 87.2800, district: 'Paschim Medinipur', state: 'West Bengal', urgency: 'medium' },
    ];
    const pick = SIMULATED[Math.floor(Math.random() * SIMULATED.length)];
    const id = 'sub_' + Math.random().toString(36).substr(2, 9);

    const sub = {
      id,
      citizenId: 'usr_demo',
      citizenName: 'Demo Citizen',
      title: `[Live] ${pick.title}`,
      description: pick.description,
      category: pick.category,
      location: { lat: pick.lat + (Math.random() - 0.5) * 0.05, lng: pick.lng + (Math.random() - 0.5) * 0.05, district: pick.district, state: pick.state, address: `Near ${pick.district}` },
      status: 'pending',
      urgency: pick.urgency,
      priorityScore: Math.floor(Math.random() * 40) + 55,
      confidenceScore: Math.floor(Math.random() * 15) + 82,
      aiAnalysis: {
        detectedLanguage: 'English', englishTranslation: pick.description,
        summary: pick.description.substring(0, 100),
        sentiment: 'negative', urgencyReasoning: 'Simulated live complaint.',
        suggestedSchemes: ['MPLADS'], isDuplicate: false, evidence: ['Live simulation'], uncertaintyLevel: 'low'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.addDoc('submissions', id, sub);
    res.status(201).json(sub);
  } catch (err) {
    console.error('Simulate complaint error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/demo/seed — seeds full demo dataset
app.post('/api/demo/seed', async (req: Request, res: Response) => {
  try {
    const result = await seedDemoData();
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Demo Seed Error:', error);
    res.status(500).json({ error: error.message || 'Seeding failed' });
  }
});

// GET /api/demo/reset — clears database for a fresh demo
app.delete('/api/demo/reset', async (req: Request, res: Response) => {
  try {
    if (db.isLocal) {
      const { localDB } = await import('./models/localDB');
      localDB.clearAll();
      res.status(200).json({ message: 'Demo data cleared.' });
    } else {
      res.status(200).json({ message: 'Reset only supported in local mode.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Reset failed' });
  }
});

// Base health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: "People's Priorities API Server ✅",
    version: '1.0.0',
    mode: db.isLocal ? 'Local JSON DB' : 'Firebase Firestore',
    endpoints: ['/api/auth', '/api/submissions', '/api/recommendations', '/api/chat', '/api/reports', '/api/notifications', '/api/demo/seed', '/api/demo/reset']
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SERVER RUNNING: http://localhost:${PORT}`);
  console.log(`📦 Database Mode: ${db.isLocal ? '📁 Local JSON DB' : '🔥 Firebase Firestore'}`);
  console.log(`\n📋 Quick Start:`);
  console.log(`   Seed demo data: POST http://localhost:${PORT}/api/demo/seed`);
  console.log(`   Reset data:     DELETE http://localhost:${PORT}/api/demo/reset`);
  console.log(`   Health check:   GET http://localhost:${PORT}/\n`);
});
