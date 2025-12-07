import { Button, FormControlLabel, Switch } from '@mui/material';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../firebase/roomsService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showLoginOverlay as showLoginOverlayAction } from '../../store/userSlice';
import './LandingPage.css';

/**
 * LandingPage - First page users see to create a new Secret Santa room
 */
export default function LandingPage() {
  const [roomName, setRoomName] = useState('');
  const [participantNames, setParticipantNames] = useState('');
  const [isSecured, setIsSecured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const pendingRoomCreation = useRef(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user);

  // Auto-create room after login if pending
  useEffect(() => {
    if (currentUser.uid && pendingRoomCreation.current) {
      pendingRoomCreation.current = false;

      const names = participantNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      handleCreateRoom(roomName.trim(), names);
    }
  }, [currentUser.uid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate room name
    const trimmedRoomName = roomName.trim();
    if (trimmedRoomName.length === 0) {
      setError('Please enter a room name');
      return;
    }

    // Parse and validate participant names
    const names = participantNames
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length < 2) {
      setError('Please enter at least 2 participants (one per line)');
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(names.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== names.length) {
      setError('Duplicate names detected. Please ensure all names are unique.');
      return;
    }

    // Check if user is logged in
    if (!currentUser.uid) {
      pendingRoomCreation.current = true;
      dispatch(showLoginOverlayAction());
      return;
    }

    // If logged in, create the room
    await handleCreateRoom(trimmedRoomName, names);
  };

  const handleCreateRoom = async (name: string, names: string[]) => {
    if (!currentUser.uid) return;

    setIsCreating(true);
    setError(null);

    try {
      const { roomId, pin } = await createRoom(name, names, currentUser.uid, isSecured);

      // Navigate to room created page
      navigate(`/room-created/${roomId}`, {
        state: { roomName: name, pin, isSecured },
      });
    } catch (err: any) {
      console.error('Error creating room:', err);
      if (err.message?.includes('Room limit reached')) {
        setError(
          'Room limit reached. You can create a maximum of 10 rooms. Please delete some rooms before creating new ones.'
        );
      } else {
        setError('Failed to create room. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="page landing-page">
      <div className="container">
        <div className="landing-header">
          <h1>Secret Santa Generator 🎅</h1>
        </div>

        <div className="card landing-card">
          <h2>Create Your Room</h2>
          <form onSubmit={handleSubmit} className="landing-form">
            <div className="form-group">
              <label htmlFor="roomName">Room Name:</label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Office Party 2025"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="participants">Participant Names (one per line):</label>
              <textarea
                id="participants"
                value={participantNames}
                onChange={(e) => setParticipantNames(e.target.value)}
                placeholder={'Alice\nBob\nCharlie\nDiana\nEvan'}
                rows={10}
                required
              />
            </div>

            <div className="form-group">
              <FormControlLabel
                control={
                  <Switch
                    checked={isSecured}
                    onChange={(e) => setIsSecured(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'var(--primary-color)',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'var(--primary-color)',
                      },
                    }}
                  />
                }
                label="Secured room (4-digit PIN will be generated)"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <Button
              type="submit"
              variant="contained"
              disabled={isCreating}
              sx={{
                textTransform: 'none',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-lg)',
                padding: '.41rem 2rem',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'var(--primary-hover)',
                },
                '&:disabled': {
                  backgroundColor: 'var(--primary-color)',
                  opacity: 0.6,
                },
              }}
            >
              {isCreating ? 'Creating room...' : '🎁 Generate Room'}
            </Button>
          </form>
        </div>

        <div className="info-section">
          <h3>How it works:</h3>
          <ol>
            <li>Enter your event name and participant names</li>
            <li>Choose if you want a secured room (optional)</li>
            <li>Click "Generate Room" to create your Secret Santa event</li>
            <li>Share the room link with participants</li>
            <li>Each participant picks their Secret Santa anonymously</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
