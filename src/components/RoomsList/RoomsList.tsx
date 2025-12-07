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
                    <span className="material-symbols-outlined">link</span>
                  </Button>
                </Tooltip>
                {room.isSecured && room.pin && (
                  <Tooltip
                    title="Copied!"
                    open={copiedPinRoomId === room.id}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    arrow
                  >
                    <span
                      className="secured-badge clickable"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyPin(room.id, room.pin!);
                      }}
                    >
                      🔒 {room.pin}
                    </span>
                  </Tooltip>
                )}
              </div>
              <div className="room-header-actions">
                <span className="material-symbols-outlined room-icon" title="Open room">
                  open_in_new
                </span>
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
                {onResetRoom && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetRoom(room.id, room.name);
                    }}
                    sx={{
                      borderRadius: '50%',
                      minWidth: 'auto',
                      width: '40px',
                      height: '40px',
                      padding: '0.5rem',
                      border: 'none',
                      backgroundColor: 'var(--warning-color)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: 'var(--warning-hover)',
                      },
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '24px' }}
                    >
                      restart_alt
                    </span>
                  </Button>
                )}
                {onEditRoom && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRoom(room);
                    }}
                    sx={{
                      borderRadius: '50%',
                      minWidth: 'auto',
                      width: '40px',
                      height: '40px',
                      padding: '0.5rem',
                      border: 'none',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: 'var(--primary-hover)',
                      },
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '24px' }}
                    >
                      edit
                    </span>
                  </Button>
                )}
                {onDeleteRoom && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoom(room.id, room.name);
                    }}
                    sx={{
                      borderRadius: '50%',
                      minWidth: 'auto',
                      width: '40px',
                      height: '40px',
                      padding: '0.5rem',
                      border: 'none',
                      backgroundColor: 'var(--error-color)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: 'var(--secondary-hover)',
                      },
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '24px' }}
                    >
                      delete
                    </span>
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
