import { Participant } from '../types';

interface ParticipantTagsProps {
  participants: Record<string, Participant>;
}

/**
 * ParticipantTags - Displays a grid of participant name tags
 */
export default function ParticipantTags({ participants }: ParticipantTagsProps) {
  return (
    <div className="participants-tags">
      {Object.values(participants).map((p) => (
        <span key={p.id} className="participant-tag">
          {p.name}
        </span>
      ))}
    </div>
  );
}
