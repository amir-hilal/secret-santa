import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticipantTags from '../../components/ParticipantTags/ParticipantTags';
import { subscribeToAllRooms } from '../../firebase/roomsService';
import { useAppSelector } from '../../store/hooks';
import { Room } from '../../types';
import './MyRoomsPage.css';

/**
 * MyRoomsPage - Display rooms created by the logged-in user
 */
export default function MyRoomsPage() {
  const currentUser = useAppSelector((state) => state.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [copiedPinRoomId, setCopiedPinRoomId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Subscribe to all rooms and filter by creator
  useEffect(() => {
    if (!currentUser.uid) {
      navigate('/');
      return;
    }

    const unsubscribe = subscribeToAllRooms((updatedRooms) => {
      // Filter rooms created by current user
      const userRooms = updatedRooms.filter((room) => room.creatorId === currentUser.uid);
      setRooms(userRooms);
    });

    return () => unsubscribe();
  }, [currentUser.uid, navigate]);

  const handleCopyRoomLink = (roomId: string) => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  const handleCopyPin = (roomId: string, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPinRoomId(roomId);
    setTimeout(() => setCopiedPinRoomId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="page my-rooms-page">
      <div className="container">
        <div className="page-header">
          <h1>🎅 My Secret Santa Rooms</h1>
          <p className="subtitle">
            Rooms created by <strong>{currentUser.email}</strong>
          </p>
        </div>

        <div className="action-bar">
          <Button
            onClick={() => navigate('/')}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 'var(--font-weight-semibold)',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'var(--primary-hover)',
              },
            }}
          >
            Create New Room
          </Button>
        </div>

        <div className="card">
          <h2>Your Rooms ({rooms.length})</h2>
          <div className="rooms-list">
            {rooms.length === 0 ? (
              <p className="no-rooms">
                You haven't created any rooms yet. Click "Create New Room" to get started!
              </p>
            ) : (
              rooms.map((room) => {
                const totalParticipants = Object.keys(room.participants).length;
                const assignedCount = room.assignments
                  ? Object.keys(room.assignments).length
                  : 0;

                return (
                  <div
                    key={room.id}
                    className="room-item"
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    <div className="room-header">
                      <div className="room-title-section">
                        <h3>{room.name}</h3>
                        {room.isSecured && (
                          <span className="secured-badge">🔒 Secured</span>
                        )}
                      </div>
                      <div className="room-header-actions">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyRoomLink(room.id);
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
                          {copiedRoomId === room.id ? '✓ Copied' : 'Copy Link'}
                        </Button>
                        {room.isSecured && room.pin && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPin(room.id, room.pin!);
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
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
