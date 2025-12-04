import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Tooltip,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticipantTags from '../../components/ParticipantTags/ParticipantTags';
import PasswordProtect from '../../components/PasswordProtect/PasswordProtect';
import { createRoom, deleteRoom, subscribeToAllRooms } from '../../firebase/roomsService';
import { Room } from '../../types';
import './HomePage.css';

/**
 * HomePage - Admin page to create rooms and view all existing rooms
 * Protected by password authentication
 */
export default function HomePage() {
  const [roomName, setRoomName] = useState('');
  const [participantNames, setParticipantNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    roomId: string;
    roomName: string;
  }>({ open: false, roomId: '', roomName: '' });
  const navigate = useNavigate();

  // Subscribe to all rooms
  useEffect(() => {
    const unsubscribe = subscribeToAllRooms((updatedRooms) => {
      setRooms(updatedRooms);
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

    setLoading(true);

    try {
      const roomId = await createRoom(trimmedRoomName, names);
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
      setLoading(false);
    }
  };

  const handleCopyRoomLink = (roomId: string) => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    setDeleteDialog({ open: true, roomId, roomName });
  };

  const confirmDelete = async () => {
    const { roomId, roomName } = deleteDialog;
    setDeleteDialog({ open: false, roomId: '', roomName: '' });

    try {
      await deleteRoom(roomId);
      setSnackbar({
        open: true,
        message: `Room "${roomName}" deleted successfully`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting room:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete room. Please try again.',
        severity: 'error',
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <PasswordProtect>
      <div className="page home-page admin-page">
        <div className="container">
          <h1>🎅 Secret Santa Admin</h1>
          <p className="subtitle">Manage your Secret Santa rooms</p>

          <div className="admin-grid">
            {/* Left column: Create new room */}
            <div className="admin-column">
              <div className="card">
                <h2>Create New Room</h2>
                <form onSubmit={handleSubmit} className="create-room-form">
                  <label htmlFor="roomName">Room Name:</label>
                  <input
                    type="text"
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g., Office Party 2025"
                    disabled={loading}
                    required
                  />

                  <label htmlFor="participants">
                    Enter participant names (one per line):
                  </label>
                  <textarea
                    id="participants"
                    value={participantNames}
                    onChange={(e) => setParticipantNames(e.target.value)}
                    placeholder={'Alice\nBob\nCharlie\nDiana\nEvan'}
                    rows={10}
                    disabled={loading}
                    required
                  />

                  {error && <div className="error-message">{error}</div>}

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      mt: 1,
                      fontSize: '1rem',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#218838',
                      },
                      '&:disabled': {
                        backgroundColor: '#28a745',
                        opacity: 0.6,
                      },
                    }}
                  >
                    {loading ? 'Creating room...' : 'Create room'}
                  </Button>
                </form>

                <div className="info-box">
                  <h3>Instructions:</h3>
                  <ol>
                    <li>Enter participant names (one per line)</li>
                    <li>Click "Create room"</li>
                    <li>Copy and share the room link</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Right column: List of existing rooms */}
            <div className="admin-column">
              <div className="card">
                <h2>Existing Rooms ({rooms.length})</h2>
                <div className="rooms-list">
                  {rooms.length === 0 ? (
                    <p className="no-rooms">No rooms created yet.</p>
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
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                              }}
                            >
                              <span className="room-id">{room.name}</span>
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
                                    handleCopyRoomLink(room.id);
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
                                      background: 'rgba(0, 0, 0, 0.04)',
                                      color: 'var(--text-primary)',
                                    },
                                  }}
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '20px' }}
                                  >
                                    link
                                  </span>
                                </Button>
                              </Tooltip>
                            </div>
                            <div className="room-header-actions">
                              <span
                                className="material-symbols-outlined room-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/room/${room.id}`);
                                }}
                                title="Open room"
                              >
                                open_in_new
                              </span>
                            </div>
                          </div>

                          <div className="room-details">
                            <p className="room-date">{formatDate(room.createdAt)}</p>
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

                          <div className="room-actions">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRoom(room.id, room.name);
                              }}
                              title="Delete room"
                              sx={{
                                borderRadius: '50%',
                                minWidth: 'auto',
                                width: '40px',
                                height: '40px',
                                padding: '0.5rem',
                                border: 'none',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                  backgroundColor: '#c82333',
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
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, roomId: '', roomName: '' })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1,
          },
        }}
      >
        <DialogTitle
          id="delete-dialog-title"
          sx={{ fontWeight: 600, fontSize: '1.5rem' }}
        >
          Delete Room?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            sx={{ fontSize: '1rem', color: 'text.primary' }}
          >
            Are you sure you want to delete the room{' '}
            <strong>"{deleteDialog.roomName}"</strong>? This action cannot be undone and
            all participant data will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, roomId: '', roomName: '' })}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
            autoFocus
          >
            Delete Room
          </Button>
        </DialogActions>
      </Dialog>
    </PasswordProtect>
  );
}
