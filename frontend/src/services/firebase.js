import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Fill in your Firebase project values in .env.local
// Minimum required: VITE_FIREBASE_DATABASE_URL
const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL       || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
};

let database = null;

if (config.databaseURL) {
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    database = getDatabase(app);
  } catch (e) {
    console.warn('[Firebase] Init failed:', e.message);
  }
} else {
  console.info('[Firebase] No databaseURL configured — running in simulation mode only.');
}

export { database };
