import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getRoom } from '../../firebase/roomsService';
import './RoomCreatedPage.css';

interface LocationState {
  roomName?: string;
  pin?: string;
  isSecured?: boolean;
}

/**
 * RoomCreatedPage - Shows room URL and PIN after successful creation
 */
export default function RoomCreatedPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = location.state as LocationState;
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [roomName, setRoomName] = useState(state?.roomName || '');
  const [pin, setPin] = useState(state?.pin);
  const [loading, setLoading] = useState(!state?.roomName);
  const navigate = useNavigate();

  useEffect(() => {
    // If we don't have room data from navigation state, fetch it
    if (!state?.roomName && roomId) {
      const fetchRoomData = async () => {
        try {
          const room = await getRoom(roomId);
          if (room) {
            setRoomName(room.name);
            setPin(room.pin);
          }
        } catch (err) {
          console.error('Error fetching room:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchRoomData();
    }
  }, [roomId, state]);

  const roomUrl = `${window.location.origin}/room/${roomId}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleViewRoom = () => {
    navigate(`/room/${roomId}`);
  };

  const handleManageRooms = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="page room-created-page">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="page room-created-page">
        <div className="container">
          <p>Room not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page room-created-page">
      <div className="container">
        <div className="success-header">
          <h1>🎉 Room Created Successfully!</h1>
        </div>

        <div className="card success-card">
          <h2>📋 Room Details</h2>

          <div className="room-detail-item">
            <label>Room Name:</label>
            <div className="detail-value">{roomName}</div>
          </div>

          <div className="room-detail-item">
            <label>Room URL:</label>
            <div className="detail-value-with-copy">
              <input
                type="text"
                value={roomUrl}
                readOnly
                className="url-input"
              />
              <Button
                onClick={handleCopyUrl}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: copiedUrl
                    ? 'var(--primary-color)'
                    : 'var(--primary-color)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'var(--primary-hover)',
                  },
                }}
              >
                {copiedUrl ? '✓ Copied!' : 'Copy URL'}
              </Button>
            </div>
          </div>

          {pin && (
            <div className="room-detail-item pin-section">
              <label>🔒 Security PIN:</label>
              <div className="detail-value-with-copy">
                <div className="pin-display">{pin}</div>
                <Button
                  onClick={handleCopyPin}
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'var(--font-weight-semibold)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    borderColor: 'var(--primary-color)',
                    color: copiedPin ? 'var(--primary-color)' : 'var(--primary-color)',
                    '&:hover': {
                      borderColor: 'var(--primary-hover)',
                      backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    },
                  }}
                >
                  {copiedPin ? '✓ Copied!' : 'Copy PIN'}
                </Button>
              </div>
              <p className="pin-note">
                ⚠️ Participants will need this PIN to access the room
              </p>
            </div>
          )}
        </div>

        <div className="info-box">
          <h3>📤 Next Steps:</h3>
          <ol>
            <li>Copy the room URL and share it with participants</li>
            {pin && <li>Share the 4-digit PIN with participants</li>}
            <li>Participants will use the link to join and pick their Secret Santa</li>
            <li>You can manage this room from your admin dashboard</li>
          </ol>
        </div>

        <div className="action-buttons">
          <Button
            onClick={handleViewRoom}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-base)',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'var(--primary-hover)',
              },
            }}
          >
            View Room
          </Button>
          <Button
            onClick={handleManageRooms}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-base)',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              borderColor: 'var(--primary-color)',
              color: 'var(--primary-color)',
              '&:hover': {
                borderColor: 'var(--primary-hover)',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
              },
            }}
          >
            Manage All Rooms
          </Button>
        </div>
      </div>
    </div>
  );
}
