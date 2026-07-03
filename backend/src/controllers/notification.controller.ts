import { Response } from 'express';
import { db } from '../config/firebase';
import { Notification } from '../models/db.types';

export const getNotifications = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const notifications = await db.getCollection('notifications') as Notification[];
    const userNotifications = notifications.filter(n => n.userId === userId);
    res.status(200).json(userNotifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.updateDoc('notifications', id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
