import { get, onValue, push, ref, runTransaction, set } from 'firebase/database';
import { Assignment, Participant, Room } from '../types';
import { db } from './firebase';

/**
 * Create a new Secret Santa room with the given participant names
 *
 * @param participantNames - Array of participant names
 * @returns The newly created room ID
 */
export async function createRoom(participantNames: string[]): Promise<string> {
  // Create a new room reference with auto-generated ID
  const roomsRef = ref(db, 'rooms');
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key!;

  // Create participant objects with unique IDs
  const participants: Record<string, Participant> = {};
  const availableTargets: Record<string, boolean> = {};

  participantNames.forEach((name, index) => {
    const participantId = `p${index + 1}_${Date.now()}`;
    participants[participantId] = {
      id: participantId,
      name: name.trim(),
    };
    availableTargets[participantId] = true;
  });

  // Create the room object
  const room: Omit<Room, 'id'> = {
    createdAt: Date.now(),
    status: 'open',
    participants,
    availableTargets,
    assignments: {},
  };

  // Save to database
  await set(newRoomRef, room);

  return roomId;
}

/**
 * Get a room by ID (one-time read)
 *
 * @param roomId - The room ID to fetch
 * @returns The room data or null if not found
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: roomId,
    ...snapshot.val(),
  } as Room;
}

/**
 * Subscribe to real-time updates for a room
 *
 * @param roomId - The room ID to subscribe to
 * @param callback - Function called with updated room data
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToRoom(
  roomId: string,
  callback: (room: Room | null) => void
): () => void {
  const roomRef = ref(db, `rooms/${roomId}`);

  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const room: Room = {
      id: roomId,
      ...snapshot.val(),
    };

    callback(room);
  });

  return unsubscribe;
}

/**
 * Assign a Secret Santa target to a participant using a transaction
 * This ensures race-condition-safe assignment when multiple users pick simultaneously
 *
 * @param roomId - The room ID
 * @param participantId - The participant making the pick
 * @throws Error if no valid targets available or transaction fails
 */
export async function assignSecretSanta(
  roomId: string,
  participantId: string
): Promise<void> {
  const roomRef = ref(db, `rooms/${roomId}`);

  // Use a transaction to safely read-modify-write
  await runTransaction(roomRef, (currentRoom) => {
    if (!currentRoom) {
      throw new Error('Room not found');
    }

    // Check if this participant already has an assignment
    if (currentRoom.assignments && currentRoom.assignments[participantId]) {
      // Already assigned, don't modify anything
      return currentRoom;
    }

    // Get available targets
    const availableTargets = currentRoom.availableTargets || {};

    // Filter valid targets:
    // - Must be marked as available (true)
    // - Cannot be the participant themselves (no self-assignment)
    const validTargetIds = Object.keys(availableTargets).filter(
      (targetId) => availableTargets[targetId] === true && targetId !== participantId
    );

    if (validTargetIds.length === 0) {
      throw new Error('No valid targets available');
    }

    // Randomly pick one target
    const randomIndex = Math.floor(Math.random() * validTargetIds.length);
    const selectedTargetId = validTargetIds[randomIndex];

    // Create the assignment
    const assignment: Assignment = {
      participantId,
      targetId: selectedTargetId,
      assignedAt: Date.now(),
    };

    // Update the room data
    const updatedRoom = { ...currentRoom };

    // Initialize assignments if needed
    if (!updatedRoom.assignments) {
      updatedRoom.assignments = {};
    }
    updatedRoom.assignments[participantId] = assignment;

    // Mark the target as no longer available
    if (!updatedRoom.availableTargets) {
      updatedRoom.availableTargets = {};
    }
    updatedRoom.availableTargets[selectedTargetId] = false;

    // Check if all participants have been assigned
    const totalParticipants = Object.keys(updatedRoom.participants).length;
    const assignedCount = Object.keys(updatedRoom.assignments).length;

    if (assignedCount === totalParticipants) {
      updatedRoom.status = 'completed';
    }

    return updatedRoom;
  });
}

/**
 * Find a participant ID by name (case-insensitive)
 *
 * @param room - The room to search in
 * @param name - The participant name to find
 * @returns The participant ID or null if not found
 */
export function findParticipantIdByName(room: Room, name: string): string | null {
  const normalizedName = name.trim().toLowerCase();

  for (const [participantId, participant] of Object.entries(room.participants)) {
    if (participant.name.toLowerCase() === normalizedName) {
      return participantId;
    }
  }

  return null;
}

/**
 * Get the target name for a participant's assignment
 *
 * @param room - The room containing assignment data
 * @param participantId - The participant ID
 * @returns The target's name or null if no assignment
 */
export function getTargetName(room: Room, participantId: string): string | null {
  if (!room.assignments || !room.assignments[participantId]) {
    return null;
  }

  const assignment = room.assignments[participantId];
  const target = room.participants[assignment.targetId];

  return target ? target.name : null;
}

/**
 * Subscribe to all rooms in the database
 *
 * @param callback - Function called with updated rooms data
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToAllRooms(callback: (rooms: Room[]) => void): () => void {
  const roomsRef = ref(db, 'rooms');

  const unsubscribe = onValue(roomsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const roomsData = snapshot.val();
    const rooms: Room[] = Object.keys(roomsData).map((roomId) => ({
      id: roomId,
      ...roomsData[roomId],
    }));

    // Sort by creation date (newest first)
    rooms.sort((a, b) => b.createdAt - a.createdAt);

    callback(rooms);
  });

  return unsubscribe;
}
