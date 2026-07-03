import fs from 'fs';
import path from 'path';
import {
  User,
  Submission,
  Recommendation,
  DuplicateGroup,
  PublicDataset,
  Notification,
  ActivityLog,
  Prediction,
  RAGDocument
} from './db.types';

const DB_FILE_PATH = path.join(__dirname, '../../local_db.json');

interface Schema {
  users: User[];
  submissions: Submission[];
  recommendations: Recommendation[];
  duplicateGroups: DuplicateGroup[];
  publicDatasets: PublicDataset[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  predictions: Prediction[];
  ragDocuments: RAGDocument[];
}

const emptyDb: Schema = {
  users: [],
  submissions: [],
  recommendations: [],
  duplicateGroups: [],
  publicDatasets: [],
  notifications: [],
  activityLogs: [],
  predictions: [],
  ragDocuments: []
};

class LocalDB {
  private initDb() {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(emptyDb, null, 2), 'utf-8');
    }
  }

  private readDb(): Schema {
    this.initDb();
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Schema;
    } catch (e) {
      console.error('Error reading local JSON database, resetting...', e);
      return emptyDb;
    }
  }

  private writeDb(data: Schema): void {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getCollection<K extends keyof Schema>(collection: K): Schema[K] {
    const db = this.readDb();
    return db[collection] || [];
  }

  public getDoc<K extends keyof Schema>(collection: K, id: string): Schema[K][number] | null {
    const items = this.getCollection(collection);
    return (items as any[]).find((item) => item.id === id || item.uid === id) || null;
  }

  public addDoc<K extends keyof Schema>(collection: K, doc: Schema[K][number]): void {
    const db = this.readDb();
    if (!db[collection]) {
      db[collection] = [] as any;
    }
    (db[collection] as any[]).push(doc);
    this.writeDb(db);
  }

  public updateDoc<K extends keyof Schema>(collection: K, id: string, updates: Partial<Schema[K][number]>): boolean {
    const db = this.readDb();
    const items = db[collection] as any[];
    const idx = items.findIndex((item) => item.id === id || item.uid === id);
    if (idx === -1) return false;

    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    this.writeDb(db);
    return true;
  }

  public deleteDoc<K extends keyof Schema>(collection: K, id: string): boolean {
    const db = this.readDb();
    const items = db[collection] as any[];
    const lengthBefore = items.length;
    db[collection] = items.filter((item) => item.id !== id && item.uid !== id) as any;
    this.writeDb(db);
    return db[collection].length < lengthBefore;
  }

  public clearAll(): void {
    this.writeDb(emptyDb);
  }
}

export const localDB = new LocalDB();
