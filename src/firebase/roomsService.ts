import { get, onValue, push, ref, runTransaction, set } from 'firebase/database';
import { Assignment, Participant, Room } from '../types';
import { db } from './firebase';

/**
 * Create a new Secret Santa room with the given participant names
 *
 * @param roomName - The name of the room
 * @param participantNames - Array of participant names
 * @param creatorId - User ID of the room creator (optional)
 * @param isSecured - Whether the room requires a PIN
 * @returns The newly created room data including ID and PIN if secured
 */
export async function createRoom(
  roomName: string,
  participantNames: string[],
  creatorId?: string,
  isSecured: boolean = false
): Promise<{ roomId: string; pin?: string }> {
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

  // Generate 4-digit PIN if secured
  const pin = isSecured ? Math.floor(1000 + Math.random() * 9000).toString() : undefined;

  // Create the room object
  const room: Omit<Room, 'id'> = {
    name: roomName.trim(),
    createdAt: Date.now(),
    status: 'open',
    participants,
    availableTargets,
    assignments: {},
    ...(creatorId && { creatorId }),
    ...(isSecured && { isSecured, pin }),
  };

  // Save to database
  await set(newRoomRef, room);

  return { roomId, pin };
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

/**
 * Delete a room by ID
 *
 * @param roomId - The room ID to delete
 */
export async function deleteRoom(roomId: string): Promise<void> {
  const roomRef = ref(db, `rooms/${roomId}`);
  await set(roomRef, null);
}

/**
 * Update room name
 *
 * @param roomId - The room ID to update
 * @param newName - The new room name
 */
export async function updateRoomName(roomId: string, newName: string): Promise<void> {
  const roomNameRef = ref(db, `rooms/${roomId}/name`);
  await set(roomNameRef, newName.trim());
}

/**
 * Update room participants
 *
 * @param roomId - The room ID to update
 * @param participantNames - Array of new participant names
 */
export async function updateRoomParticipants(
  roomId: string,
  participantNames: string[]
): Promise<void> {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const room = snapshot.val();

  // Create new participant objects
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

  // Update participants while preserving other room data
  await set(roomRef, {
    ...room,
    participants,
    availableTargets,
    assignments: room.assignments || {},
  });
}

/**
 * Reset all assignments in a room (keeps participants, clears assignments)
 *
 * @param roomId - The room ID to reset
 */
export async function resetRoomAssignments(roomId: string): Promise<void> {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const room = snapshot.val();

  // Reset availableTargets to all true
  const availableTargets: Record<string, boolean> = {};
  Object.keys(room.participants).forEach((participantId) => {
    availableTargets[participantId] = true;
  });

  // Clear assignments and reset status
  await set(roomRef, {
    ...room,
    availableTargets,
    assignments: {},
    status: 'open',
  });
}

/**
 * Verify room PIN
 *
 * @param roomId - The room ID
 * @param pin - The PIN to verify
 * @returns True if PIN is correct, false otherwise
 */
export async function verifyRoomPin(roomId: string, pin: string): Promise<boolean> {
  const room = await getRoom(roomId);

  if (!room) {
    throw new Error('Room not found');
  }

  if (!room.isSecured || !room.pin) {
    return true; // Room is not secured
  }

  return room.pin === pin;
}
