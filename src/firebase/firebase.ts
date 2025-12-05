import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './firebaseConfig';

/**
 * Initialize Firebase app with the provided configuration
 */
const app = initializeApp(firebaseConfig);

/**
 * Get Firebase Realtime Database instance
 * This is the main database reference used throughout the app
 */
export const db = getDatabase(app);

/**
 * Get Firebase Auth instance
 */
export const auth = getAuth(app);

export { app };
export default app;
