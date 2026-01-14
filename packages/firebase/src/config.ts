import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Singleton instances
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _rtdb: Database | null = null;
let _storage: FirebaseStorage | null = null;
let _initialized = false;

/**
 * Firebase configuration interface
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseURL?: string;
}

// Store config for lazy initialization
let _config: FirebaseConfig | null = null;

/**
 * Initialize Firebase with config
 * This should be called once at app startup
 */
export function initializeFirebase(config: FirebaseConfig): void {
  if (_initialized) {
    console.warn('Firebase already initialized');
    return;
  }

  _config = config;
}

/**
 * Get Firebase configuration
 * First tries stored config, then falls back to env vars
 */
export function getFirebaseConfig(): FirebaseConfig {
  // If config was explicitly set, use it
  if (_config) {
    return _config;
  }

  // Fall back to environment variables (works when transpiled by Next.js)
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  };

  return envConfig;
}

/**
 * Validate required configuration
 */
function validateConfig(config: FirebaseConfig): void {
  const missing: string[] = [];

  if (!config.apiKey) missing.push('apiKey');
  if (!config.authDomain) missing.push('authDomain');
  if (!config.projectId) missing.push('projectId');

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missing.join(', ')}. ` +
        'Make sure to call initializeFirebase() or set NEXT_PUBLIC_FIREBASE_* env vars.'
    );
  }
}

/**
 * Initialize Firebase (called lazily on first use)
 */
function ensureInitialized(): void {
  if (_initialized) return;

  const config = getFirebaseConfig();
  validateConfig(config);

  const existingApps = getApps();
  if (existingApps.length > 0) {
    _app = existingApps[0];
  } else {
    _app = initializeApp(config);
  }

  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);
  
  // Only initialize Realtime Database if databaseURL is provided
  if (config.databaseURL) {
    try {
      _rtdb = getDatabase(_app);
    } catch (error) {
      // Silently ignore if RTDB not needed
      _rtdb = null;
    }
  }
  
  _initialized = true;
}

/**
 * Get Firebase App instance
 */
export const app = {
  get instance(): FirebaseApp {
    ensureInitialized();
    return _app!;
  },
};

/**
 * Get Firebase Auth instance
 */
export const auth = {
  get instance(): Auth {
    ensureInitialized();
    return _auth!;
  },
};

/**
 * Get Firestore instance
 */
export const db = {
  get instance(): Firestore {
    ensureInitialized();
    return _db!;
  },
};

/**
 * Get Realtime Database instance
 * Returns null if Realtime Database is not configured
 */
export const rtdb = {
  get instance(): Database | null {
    ensureInitialized();
    if (!_rtdb) {
      console.warn('Realtime Database not configured. Set NEXT_PUBLIC_FIREBASE_DATABASE_URL.');
    }
    return _rtdb;
  },
};

/**
 * Get Firebase Storage instance
 */
export const storage = {
  get instance(): FirebaseStorage {
    ensureInitialized();
    return _storage!;
  },
};

// Direct getter functions for convenience
export function getFirebaseApp(): FirebaseApp {
  ensureInitialized();
  return _app!;
}

export function getFirebaseAuth(): Auth {
  ensureInitialized();
  return _auth!;
}

export function getFirebaseDb(): Firestore {
  ensureInitialized();
  return _db!;
}

export function getFirebaseRtdb(): Database | null {
  ensureInitialized();
  if (!_rtdb) {
    console.warn('Realtime Database not configured. Set NEXT_PUBLIC_FIREBASE_DATABASE_URL.');
  }
  return _rtdb;
}

export function getFirebaseStorage(): FirebaseStorage {
  ensureInitialized();
  return _storage!;
}
