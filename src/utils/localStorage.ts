import { LocalParticipant } from '../types';

const STORAGE_KEY_PREFIX = 'secretSanta_';

/**
 * Get the stored participant data for a specific room from localStorage
 *
 * @param roomId - The room ID
 * @returns The local participant data or null if not found
 */
export function getLocalParticipant(roomId: string): LocalParticipant | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${roomId}`;
    const data = localStorage.getItem(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as LocalParticipant;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Save participant data for a specific room to localStorage
 *
 * @param roomId - The room ID
 * @param data - The participant data to store
 */
export function setLocalParticipant(roomId: string, data: LocalParticipant): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${roomId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Clear the stored participant data for a specific room
 *
 * @param roomId - The room ID
 */
export function clearLocalParticipant(roomId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${roomId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
