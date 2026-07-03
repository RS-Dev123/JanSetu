import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { localDB } from '../models/localDB';

dotenv.config();

let useLocalFallback = process.env.USE_LOCAL_FALLBACK === 'true';

if (!useLocalFallback) {
  const hasGcpAuth = !!(process.env.K_SERVICE || process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const hasEnvKeys = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
  if (!hasGcpAuth && !hasEnvKeys) {
    useLocalFallback = true;
  }
}

if (useLocalFallback) {
  console.log('🤖 DATABASE CONFIG: Running in Local Fallback mode using JSON database.');
} else {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        })
      });
      console.log('🔥 DATABASE CONFIG: Firebase Admin initialized successfully using service account credentials.');
    } else {
      admin.initializeApp();
      console.log('🔥 DATABASE CONFIG: Firebase Admin initialized successfully using Application Default Credentials.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin, falling back to Local JSON DB:', error);
    useLocalFallback = true;
  }
}

// Database Abstraction Interface
export const db = {
  isLocal: useLocalFallback,

  async getCollection(collectionName: string): Promise<any[]> {
    if (useLocalFallback) {
      return localDB.getCollection(collectionName as any);
    } else {
      const snapshot = await admin.firestore().collection(collectionName).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  async getDoc(collectionName: string, id: string): Promise<any | null> {
    if (useLocalFallback) {
      return localDB.getDoc(collectionName as any, id);
    } else {
      const doc = await admin.firestore().collection(collectionName).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    }
  },

  async addDoc(collectionName: string, id: string, data: any): Promise<void> {
    if (useLocalFallback) {
      localDB.addDoc(collectionName as any, { ...data, id });
    } else {
      await admin.firestore().collection(collectionName).doc(id).set(data);
    }
  },

  async updateDoc(collectionName: string, id: string, data: any): Promise<void> {
    if (useLocalFallback) {
      localDB.updateDoc(collectionName as any, id, data);
    } else {
      await admin.firestore().collection(collectionName).doc(id).update(data);
    }
  },

  async deleteDoc(collectionName: string, id: string): Promise<void> {
    if (useLocalFallback) {
      localDB.deleteDoc(collectionName as any, id);
    } else {
      await admin.firestore().collection(collectionName).doc(id).delete();
    }
  }
};

export { admin };
