import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Submission, Notification } from '../models/db.types';
import { runAIOrchestrator } from '../services/ai/orchestrator';

// Ray-Casting Algorithm to check if coordinates lie within custom map boundaries
const isPointInPolygon = (point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean => {
  const x = point.lat, y = point.lng;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Heuristic Reverse Geocoder for demo purposes (Maps coordinate grids in India to real regions)
const getIndianRegion = (lat: number, lng: number) => {
  // Mock bounding boxes for constituency
  if (lat > 22.0 && lat < 24.0 && lng > 87.0 && lng < 89.0) {
    return {
      state: 'West Bengal',
      district: 'Paschim Medinipur',
      village: 'Kharagpur Local',
      ward: 'Ward 12',
      address: 'Kharagpur Town, West Bengal, India'
    };
  }
  if (lat > 12.8 && lat < 13.2 && lng > 77.4 && lng < 77.8) {
    return {
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      village: 'Kengeri Hobli',
      ward: 'Ward 198',
      address: 'RR Nagar, Bengaluru, Karnataka, India'
    };
  }
  // Default fallback inside India
  return {
    state: 'Delhi',
    district: 'New Delhi',
    village: 'Chanakyapuri',
    ward: 'Ward 4',
    address: 'Sansad Marg, New Delhi, Delhi, India'
  };
};

export const createSubmission = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, description, category, type, lat, lng, citizenName } = req.body;
    const citizenId = req.user?.uid || 'anonymous_citizen';
    const cName = citizenName || req.user?.name || 'Citizen User';

    if (!title || !description || !lat || !lng) {
      res.status(400).json({ error: 'Title, description, lat, and lng are required.' });
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Handle Uploads
    const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;
    let mediaUrl = '';
    let audioUrl = '';

    const host = req.get('host');
    const protocol = req.protocol;

    if (files) {
      if (files['image'] && files['image'][0]) {
        mediaUrl = `${protocol}://${host}/uploads/${files['image'][0].filename}`;
      }
      if (files['audio'] && files['audio'][0]) {
        audioUrl = `${protocol}://${host}/uploads/${files['audio'][0].filename}`;
      }
    }

    // Geocoding
    const locationInfo = getIndianRegion(latitude, longitude);

    // Call Multi-Agent Pipeline
    const aiResult = await runAIOrchestrator(
      title,
      description,
      files?.['image']?.[0]?.path,
      files?.['audio']?.[0]?.path
    );

    const submissionId = 'sub_' + Math.random().toString(36).substr(2, 9);
    const newSubmission: Submission = {
      id: submissionId,
      citizenId,
      citizenName: cName,
      title,
      description,
      category: (category || aiResult.category) as any,
      type: (type || 'complaint') as any,
      source: 'portal',
      department: category === 'Water Supply' ? 'Ministry of Water Resources & Jal Jeevan' : category === 'Roads & Transport' ? 'Public Works Department (PWD)' : 'Municipal Sanitation & Solid Waste Dept',
      timeline: req.body.timeline ? JSON.parse(req.body.timeline) : [
        { status: 'Submitted', description: `Grievance logged by citizen ${cName} via portal.`, updatedAt: new Date().toISOString() }
      ],
      mediaUrl: mediaUrl || undefined,
      audioUrl: audioUrl || undefined,
      location: {
        lat: latitude,
        lng: longitude,
        address: locationInfo.address,
        village: locationInfo.village,
        ward: locationInfo.ward,
        district: locationInfo.district,
        state: locationInfo.state
      },
      status: 'pending',
      urgency: aiResult.urgency,
      priorityScore: aiResult.priorityScore,
      confidenceScore: aiResult.confidenceScore,
      aiAnalysis: aiResult.aiAnalysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    await db.addDoc('submissions', submissionId, newSubmission);

    // Create Notification
    const notifId = 'notif_' + Math.random().toString(36).substr(2, 9);
    const citizenNotification: Notification = {
      id: notifId,
      userId: citizenId,
      title: 'Submission Received',
      message: `Your report "${title}" has been successfully submitted and is under review. Urgency: ${aiResult.urgency.toUpperCase()}.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await db.addDoc('notifications', notifId, citizenNotification);

    res.status(201).json(newSubmission);
  } catch (error: any) {
    console.error('Create Submission Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, urgency, constituency, polygon } = req.query;
    let submissions = await db.getCollection('submissions') as Submission[];

    // Standard filter queries
    if (category) {
      submissions = submissions.filter(s => s.category.toLowerCase() === (category as string).toLowerCase());
    }
    if (status) {
      submissions = submissions.filter(s => s.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (urgency) {
      submissions = submissions.filter(s => s.urgency.toLowerCase() === (urgency as string).toLowerCase());
    }
    if (constituency) {
      submissions = submissions.filter(s => s.location.district.toLowerCase() === (constituency as string).toLowerCase());
    }

    // Polygon boundary query filter
    if (polygon) {
      try {
        const polyCoords = JSON.parse(polygon as string) as { lat: number; lng: number }[];
        if (Array.isArray(polyCoords) && polyCoords.length >= 3) {
          submissions = submissions.filter(s => isPointInPolygon(s.location, polyCoords));
        }
      } catch (err) {
        console.error('Error parsing polygon coordinates:', err);
      }
    }

    res.status(200).json(submissions);
  } catch (error: any) {
    console.error('Get Submissions Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const submission = await db.getDoc('submissions', id) as Submission;

    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    res.status(200).json(submission);
  } catch (error: any) {
    console.error('Get Submission By ID Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateSubmissionStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminUser = req.user;

    if (!status || !['pending', 'in_progress', 'resolved'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }

    const submission = await db.getDoc('submissions', id) as Submission;
    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    await db.updateDoc('submissions', id, { status });

    // Create Notification
    const notifId = 'notif_' + Math.random().toString(36).substr(2, 9);
    const citizenNotification: Notification = {
      id: notifId,
      userId: submission.citizenId,
      title: `Submission Updated`,
      message: `Your report "${submission.title}" status has been changed to ${status.toUpperCase().replace('_', ' ')}.`,
      type: status === 'resolved' ? 'success' : 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await db.addDoc('notifications', notifId, citizenNotification);

    // Log Activity
    const logId = 'log_' + Math.random().toString(36).substr(2, 9);
    await db.addDoc('activityLogs', logId, {
      id: logId,
      userId: adminUser.uid,
      userName: adminUser.name,
      role: adminUser.role,
      action: 'UPDATE_STATUS',
      details: `Updated submission ${id} status to ${status}`,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: 'Status updated successfully.', status });
  } catch (error: any) {
    console.error('Update Status Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
