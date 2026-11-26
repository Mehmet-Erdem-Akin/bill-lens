import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = (): boolean =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase yapılandırması eksik. EXPO_PUBLIC_FIREBASE_* değişkenlerini ayarlayın.',
    );
  }
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
};

const getNativePersistence = (): Persistence | null => {
  try {
    // Metro resolves the RN auth build which exports this; TS web typings do not.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const authModule = require('firebase/auth') as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
    };
    if (!authModule.getReactNativePersistence) return null;
    return authModule.getReactNativePersistence(AsyncStorage);
  } catch {
    return null;
  }
};

export const getFirebaseAuth = (): Auth => {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();

  if (Platform.OS === 'web') {
    auth = getAuth(firebaseApp);
    return auth;
  }

  try {
    const persistence = getNativePersistence();
    auth = persistence
      ? initializeAuth(firebaseApp, { persistence })
      : getAuth(firebaseApp);
  } catch {
    auth = getAuth(firebaseApp);
  }
  return auth;
};

export const getFirebaseDb = (): Firestore => {
  if (db) return db;
  db = getFirestore(getFirebaseApp());
  return db;
};

export const getFunctionsBaseUrl = (): string => {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return 'http://127.0.0.1:5001/bill-lens/europe-west1/api';

  if (process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    return `http://127.0.0.1:5001/${projectId}/europe-west1/api`;
  }

  return `https://europe-west1-${projectId}.cloudfunctions.net/api`;
};
