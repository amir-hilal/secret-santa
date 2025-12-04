import { useState, useEffect } from 'react';
import { Room } from '../types';
import { subscribeToRoom } from '../firebase/roomsService';

/**
 * Custom hook to subscribe to real-time room updates
 *
 * @param roomId - The room ID to subscribe to
 * @returns Object containing room data, loading state, and error state
 */
export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      setError('No room ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom === null) {
        setError('Room not found');
        setRoom(null);
      } else {
        setRoom(updatedRoom);
        setError(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return { room, loading, error };
}
