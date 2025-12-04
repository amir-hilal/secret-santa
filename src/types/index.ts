/**
 * Participant in the Secret Santa game
 */
export interface Participant {
  id: string;
  name: string;
}

/**
 * Assignment of a participant to their Secret Santa target
 */
export interface Assignment {
  participantId: string;
  targetId: string;
  assignedAt: number;
}

/**
 * Room containing all Secret Santa game data
 */
export interface Room {
  id: string;
  name: string;
  createdAt: number;
  status: 'open' | 'completed';
  participants: Record<string, Participant>;
  assignments?: Record<string, Assignment>;
  availableTargets?: Record<string, boolean>;
}

/**
 * Local participant data stored in localStorage
 */
export interface LocalParticipant {
  participantId: string;
  name: string;
  targetName?: string;
}
