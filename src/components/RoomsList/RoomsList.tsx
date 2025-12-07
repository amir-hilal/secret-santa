import { Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Room } from '../../types';
import ParticipantTags from '../ParticipantTags/ParticipantTags';
import './RoomsList.css';

interface RoomsListProps {
  rooms: Room[];
  copiedRoomId: string | null;
  copiedPinRoomId: string | null;
  onCopyRoomLink: (roomId: string) => void;
  onCopyPin: (roomId: string, pin: string) => void;
  onDeleteRoom?: (roomId: string, roomName: string) => void;
  onEditRoom?: (room: Room) => void;
  onResetRoom?: (roomId: string, roomName: string) => void;
  showActions?: boolean;
}

/**
 * RoomsList - Reusable component to display a list of rooms
 */
export default function RoomsList({
  rooms,
  copiedRoomId,
  copiedPinRoomId,
  onCopyRoomLink,
  onCopyPin,
  onDeleteRoom,
  onEditRoom,
  onResetRoom,
  showActions = false,
}: RoomsListProps) {
  const navigate = useNavigate();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (rooms.length === 0) {
    return (
      <p className="no-rooms">
        You haven't created any rooms yet. Click "Create New Room" to get started!
      </p>
    );
  }

  return (
    <div className="rooms-list">
      {rooms.map((room) => {
        const totalParticipants = Object.keys(room.participants).length;
        const assignedCount = room.assignments ? Object.keys(room.assignments).length : 0;

        return (
          <div
            key={room.id}
            className="room-item"
            onClick={() => navigate(`/room/${room.id}`)}
          >
            <div className="room-header">
              <div className="room-title-section">
                <h3>{room.name}</h3>
                <Tooltip
                  title="Copied!"
                  open={copiedRoomId === room.id}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  arrow
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyRoomLink(room.id);
                    }}
                    title="Copy link"
                    sx={{
                      borderRadius: '50%',
                      minWidth: 'auto',
                      width: '32px',
                      height: '32px',
                      padding: '0.4rem',
                      background: 'none',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        background: 'var(--overlay-light)',
                        color: 'var(--text-primary)',
                      },
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                    >
                      link
                    </span>
                  </Button>
                </Tooltip>
                {room.isSecured && <span className="secured-badge">🔒 Secured</span>}
              </div>
              <div className="room-header-actions">
                <span
                  className="material-symbols-outlined room-icon"
                  title="Open room"
                >
                  open_in_new
                </span>
                {room.isSecured && room.pin && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyPin(room.id, room.pin!);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'var(--warning-color)',
                      color: 'var(--warning-color)',
                      '&:hover': {
                        borderColor: 'var(--warning-color)',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      },
                    }}
                  >
                    {copiedPinRoomId === room.id ? '✓ Copied' : 'Copy PIN'}
                  </Button>
                )}
              </div>
            </div>

            <div className="room-details">
              <p className="room-date">Created: {formatDate(room.createdAt)}</p>
              <p className="room-progress">
                Progress: {assignedCount} / {totalParticipants} assigned
              </p>
              <div className="room-participants">
                <strong>Participants:</strong>
                <ParticipantTags
                  participants={room.participants}
                  assignments={room.assignments}
                />
              </div>
            </div>

            {showActions && (
              <div className="room-actions">
                {onEditRoom && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRoom(room);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'var(--primary-color)',
                      color: 'var(--primary-color)',
                      '&:hover': {
                        borderColor: 'var(--primary-hover)',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                      },
                    }}
                  >
                    Edit
                  </Button>
                )}
                {onResetRoom && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetRoom(room.id, room.name);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'var(--warning-color)',
                      color: 'var(--warning-color)',
                      '&:hover': {
                        borderColor: 'var(--warning-color)',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      },
                    }}
                  >
                    Reset
                  </Button>
                )}
                {onDeleteRoom && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoom(room.id, room.name);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'var(--error-color)',
                      color: 'var(--error-color)',
                      '&:hover': {
                        borderColor: 'var(--secondary-hover)',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                      },
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
