// src/firebase.ts
import { initializeApp, FirebaseApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
];

// 1. Identify missing environment variables
const missingVars = requiredVars.filter(v => {
  const val = import.meta.env[v];
  return !val || val.trim() === "";
});

// 2. Identify placeholder values
const placeholderVars = requiredVars.filter(v => {
  const val = import.meta.env[v] || "";
  return val.toLowerCase().includes("placeholder") || val.toLowerCase().includes("your_");
});

// Firebase configuration using requested environment scheme
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let configError: string | null = null;

if (missingVars.length > 0) {
  configError = `Missing environment variables in .env file: ${missingVars.join(", ")}`;
  console.error(`⚠️ [Firebase Initialization Error] ${configError}`);
} else if (placeholderVars.length > 0) {
  configError = `Placeholder values detected in .env file: ${placeholderVars.join(", ")}`;
  console.error(`⚠️ [Firebase Initialization Error] ${configError}`);
} else {
  try {
    // Singular initialization
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    console.info("[Firebase] Services initialized successfully with project:", firebaseConfig.projectId);
  } catch (err: any) {
    configError = err.message || String(err);
    console.error("❌ [Firebase Initialization Failure]:", err);
  }
}

// Export raw and alias structures for maximum compatibility
export { firebaseApp, auth, db, storage, configError };
export const app = firebaseApp;
export const firestore = db;

export const googleProvider = new GoogleAuthProvider();

export const phoneProvider = auth ? new PhoneAuthProvider(auth) : null;

// Returns a reCAPTCHA verifier helper when auth is active
export const getRecaptchaVerifier = (containerId: string): RecaptchaVerifier | null => {
  if (!auth) {
    console.warn("[Firebase] reCAPTCHA verifier requested but Auth is not initialized.");
    return null;
  }
  return new RecaptchaVerifier(containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
  }, auth);
};

export const isFirebaseEnabled = (): boolean => auth !== null;
export const isFirebaseConfigured = (): boolean => !configError;
export const getFirebaseConfigError = (): string | null => configError;
export const getMissingFirebaseVars = (): string[] => missingVars;
