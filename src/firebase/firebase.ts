import { initializeApp } from 'firebase/app';
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

export default app;
