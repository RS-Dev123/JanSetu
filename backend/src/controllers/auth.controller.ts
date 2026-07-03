import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, admin } from '../config/firebase';
import { User } from '../models/db.types';

const JWT_SECRET = process.env.JWT_SECRET || 'jan_setu_secret_key_jwt_authentication_2026';

// Helper to verify Firebase ID tokens or local fallback tokens
const verifyFirebaseToken = async (token: string): Promise<{ uid: string; email?: string; name?: string; picture?: string }> => {
  if (!db.isLocal) {
    const decoded = await admin.auth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture
    };
  } else {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.photoURL
      };
    } catch {
      const decoded = jwt.decode(token) as any;
      return {
        uid: decoded?.sub || decoded?.uid || 'usr_demo',
        email: decoded?.email || 'demo@jansetu.in',
        name: decoded?.name || 'Demo User',
        picture: decoded?.picture || ''
      };
    }
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, constituency } = req.body;

    if (!email || !password || !name || !role || !constituency) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const validRoles = ['citizen', 'mp', 'officer', 'admin'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid user role' });
      return;
    }

    const users = await db.getCollection('users') as User[];
    const userExists = users.some(u => u.email === email);
    if (userExists) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const uid = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newUser: User & { passwordHash: string } = {
      uid,
      email,
      name,
      role: role as any,
      constituency,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await db.addDoc('users', uid, newUser);

    const token = jwt.sign(
      { uid: newUser.uid, email: newUser.email, role: newUser.role, constituency: newUser.constituency },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const logId = 'log_' + Math.random().toString(36).substr(2, 9);
    await db.addDoc('activityLogs', logId, {
      id: logId,
      userId: uid,
      userName: name,
      role,
      action: 'REGISTER',
      details: `User registered with role ${role} in constituency ${constituency}`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      token,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        constituency: newUser.constituency,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const users = await db.getCollection('users') as (User & { passwordHash?: string })[];
    const user = users.find(u => u.email === email);

    if (!user || !user.passwordHash) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { uid: user.uid, email: user.email, role: user.role, constituency: user.constituency },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const logId = 'log_' + Math.random().toString(36).substr(2, 9);
    await db.addDoc('activityLogs', logId, {
      id: logId,
      userId: user.uid,
      userName: user.name,
      role: user.role,
      action: 'LOGIN',
      details: `User logged in`,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        constituency: user.constituency,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseToken(token);

    const user = await db.getDoc('users', decoded.uid) as User;
    if (!user) {
      res.status(200).json({
        profileExists: false,
        uid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || '',
        photoURL: decoded.picture || ''
      });
      return;
    }

    // Sign local JWT
    const jwtToken = jwt.sign(
      { uid: user.uid, email: user.email, role: user.role, constituency: user.constituency },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date().toISOString();
    await db.addDoc('users', user.uid, user);

    res.status(200).json({
      profileExists: true,
      token: jwtToken,
      user
    });
  } catch (error: any) {
    console.error('Google Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const googleRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseToken(token);

    const { role, constituency, state, district, phone, preferredLanguage } = req.body;

    const validRoles = ['citizen', 'mp', 'officer', 'admin'];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid user role' });
      return;
    }

    const newUser: User = {
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || 'User',
      displayName: decoded.name || 'User',
      photoURL: decoded.picture || '',
      role: role || 'citizen',
      constituency: constituency || 'New Delhi',
      state: state || 'Delhi',
      district: district || 'New Delhi',
      phone: phone || '',
      preferredLanguage: preferredLanguage || 'en',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await db.addDoc('users', decoded.uid, newUser);

    const jwtToken = jwt.sign(
      { uid: newUser.uid, email: newUser.email, role: newUser.role, constituency: newUser.constituency },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token: jwtToken,
      user: newUser
    });
  } catch (error: any) {
    console.error('Google Register Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logout = async (req: any, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (uid) {
      const logId = 'log_' + Math.random().toString(36).substr(2, 9);
      await db.addDoc('activityLogs', logId, {
        id: logId,
        userId: uid,
        userName: req.user.name || 'User',
        role: req.user.role || 'citizen',
        action: 'LOGOUT',
        details: `User logged out`,
        createdAt: new Date().toISOString()
      });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await db.getDoc('users', userId) as User;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      displayName: user.displayName || user.name,
      photoURL: user.photoURL || '',
      role: user.role,
      constituency: user.constituency,
      status: user.status || 'Active',
      state: user.state || '',
      district: user.district || '',
      preferredLanguage: user.preferredLanguage || 'en',
      phone: user.phone || '',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || user.createdAt
    });
  } catch (error: any) {
    console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingUser = await db.getDoc('users', uid) as User;
    const {
      name,
      displayName,
      photoURL,
      role,
      constituency,
      phone,
      state,
      district,
      preferredLanguage,
      status,
      email
    } = req.body;

    const userEmail = email || req.user?.email || existingUser?.email || '';

    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        name: name !== undefined ? name : existingUser.name,
        displayName: displayName !== undefined ? displayName : (existingUser.displayName || existingUser.name),
        photoURL: photoURL !== undefined ? photoURL : existingUser.photoURL,
        role: role !== undefined ? role : existingUser.role,
        constituency: constituency !== undefined ? constituency : existingUser.constituency,
        phone: phone !== undefined ? phone : existingUser.phone,
        state: state !== undefined ? state : existingUser.state,
        district: district !== undefined ? district : existingUser.district,
        preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : existingUser.preferredLanguage,
        status: status !== undefined ? status : existingUser.status,
        lastLogin: new Date().toISOString()
      };
      await db.addDoc('users', uid, updatedUser);
      res.status(200).json(updatedUser);
    } else {
      const newUser: User = {
        uid,
        email: userEmail,
        name: name || displayName || 'User',
        displayName: displayName || name || 'User',
        photoURL: photoURL || '',
        role: role || 'citizen',
        constituency: constituency || 'New Delhi',
        phone: phone || '',
        state: state || 'Delhi',
        district: district || 'New Delhi',
        preferredLanguage: preferredLanguage || 'en',
        status: status || 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      await db.addDoc('users', uid, newUser);
      res.status(200).json(newUser);
    }
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    if (!db.isLocal) {
      const link = await admin.auth().generatePasswordResetLink(email);
      console.log(`[Firebase Admin] Password reset link for ${email}: ${link}`);
    } else {
      console.log(`[Local Database] Password reset link requested for ${email}`);
    }

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Locate the user in local DB / Firestore
    const users = await db.getCollection('users') as (User & { passwordHash?: string })[];
    const user = users.find(u => u.email === email);

    if (!user) {
      res.status(404).json({ error: 'User with this email does not exist.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update password in DB
    user.passwordHash = passwordHash;
    await db.addDoc('users', user.uid, user);

    // Update in Firebase Auth if not local
    if (!db.isLocal) {
      await admin.auth().updateUser(user.uid, { password });
      console.log(`[Firebase Admin] Updated password for ${email}`);
    }

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
