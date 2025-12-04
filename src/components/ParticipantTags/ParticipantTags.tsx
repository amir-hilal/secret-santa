import { Assignment, Participant } from '../../types';
import './ParticipantTags.css';

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
      {Object.values(participants)
        .sort((a, b) => {
          const aHasPicked = !!assignments[a.id];
          const bHasPicked = !!assignments[b.id];
          // Unpicked (false) comes before picked (true)
          if (aHasPicked === bHasPicked) return 0;
          return aHasPicked ? 1 : -1;
        })
        .map((p) => {
          const hasPicked = !!assignments[p.id];
          const isClickable = selectable && !hasPicked;

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
