import { Button, FormControlLabel, Switch } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  signInWithGoogle,
  subscribeToAuthState,
} from '../../firebase/authService';
import { createRoom } from '../../firebase/roomsService';
import './LandingPage.css';

/**
 * LandingPage - First page users see to create a new Secret Santa room
 */
export default function LandingPage() {
  const [roomName, setRoomName] = useState('');
  const [participantNames, setParticipantNames] = useState('');
  const [isSecured, setIsSecured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

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
    if (!currentUser) {
      setShowLoginOverlay(true);
      return;
    }

    // If logged in, create the room
    await handleCreateRoom(trimmedRoomName, names);
  };

  const handleCreateRoom = async (name: string, names: string[]) => {
    if (!currentUser) return;

    setIsCreating(true);
    setError(null);

    try {
      const { roomId, pin } = await createRoom(name, names, currentUser.uid, isSecured);

      // Navigate to room created page
      navigate(`/room-created/${roomId}`, {
        state: { roomName: name, pin, isSecured },
      });
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setShowLoginOverlay(false);

      // After login, create the room with the stored data
      const names = participantNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      await handleCreateRoom(roomName.trim(), names);
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Failed to sign in with Google. Please try again.');
      setShowLoginOverlay(false);
    }
  };

  return (
    <div className="page landing-page">
      <div className="container">
        <div className="landing-header">
          <h1>🎅 Secret Santa Generator</h1>
          <p className="subtitle">Create your Secret Santa event in seconds!</p>
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
                padding: '1rem 2rem',
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

        {currentUser && (
          <div className="user-info">
            <p>
              Signed in as: <strong>{currentUser.email}</strong>
            </p>
            <Button
              onClick={() => navigate('/admin')}
              variant="outlined"
              sx={{
                textTransform: 'none',
                mt: 1,
                borderColor: 'var(--primary-color)',
                color: 'var(--primary-color)',
                '&:hover': {
                  borderColor: 'var(--primary-hover)',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                },
              }}
            >
              View My Rooms
            </Button>
          </div>
        )}
      </div>

      {/* Login Overlay */}
      {showLoginOverlay && (
        <div className="login-overlay">
          <div className="login-overlay-content">
            <div className="login-card">
              <h2>🎅 Sign In Required</h2>
              <p>You need to sign in to create a Secret Santa room</p>

              <div className="login-buttons">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outlined"
                  fullWidth
                  sx={{
                    fontFamily: "'Roboto', arial, sans-serif",
                    textTransform: 'none',
                    fontWeight: 400,
                    fontSize: '14px',
                    letterSpacing: '0.25px',
                    padding: '0 12px',
                    height: '40px',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    color: '#1f1f1f',
                    border: '1px solid #747775',
                    boxShadow: 'none',
                    transition:
                      'background-color .218s, border-color .218s, box-shadow .218s',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      borderColor: '#747775',
                      boxShadow:
                        '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
                    },
                    '&:active': {
                      backgroundColor: '#f1f3f4',
                    },
                  }}
                  startIcon={
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="20"
                      height="20"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  }
                >
                  Continue with Google
                </Button>

                <Button
                  onClick={() => setShowLoginOverlay(false)}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    color: 'var(--text-secondary)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
