import { Assignment, Participant } from '../types';

interface ParticipantTagsProps {
  participants: Record<string, Participant>;
  assignments?: Record<string, Assignment>;
  onSelect?: (participantId: string, name: string) => void;
  selectable?: boolean;
}

/**
 * ParticipantTags - Displays a grid of participant name tags
 * Green tags indicate participants who have picked their Secret Santa
 */
export default function ParticipantTags({
  participants,
  assignments = {},
  onSelect,
  selectable = false,
}: ParticipantTagsProps) {
  const handleClick = (participantId: string, name: string) => {
    if (selectable && onSelect) {
      onSelect(participantId, name);
    }
  };

  return (
    <div className="participants-tags">
      {Object.values(participants).map((p) => {
        const hasPicked = !!assignments[p.id];
        const isClickable = selectable;

        return (
          <span
            key={p.id}
            className={`participant-tag ${hasPicked ? 'picked' : ''} ${
              isClickable ? 'selectable' : ''
            }`}
            onClick={() => handleClick(p.id, p.name)}
            style={isClickable ? { cursor: 'pointer' } : undefined}
          >
            {p.name}
          </span>
        );
      })}
    </div>
  );
}
