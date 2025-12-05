import { Alert, Button, Snackbar, Tooltip } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassDialog from '../../components/GlassDialog/GlassDialog';
import ParticipantTags from '../../components/ParticipantTags/ParticipantTags';
import PasswordProtect from '../../components/PasswordProtect/PasswordProtect';
import {
  createRoom,
  deleteRoom,
  resetRoomAssignments,
  subscribeToAllRooms,
  updateRoomName,
  updateRoomParticipants,
} from '../../firebase/roomsService';
import { Room } from '../../types';
import './AdminPage.css';

/**
 * AdminPage - Admin page to create rooms and view all existing rooms
 * Protected by password authentication
 */
export default function AdminPage() {
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
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    roomId: string;
    roomName: string;
    participants: string;
  }>({ open: false, roomId: '', roomName: '', participants: '' });
  const [resetDialog, setResetDialog] = useState<{
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

  const handleEditRoom = (room: Room) => {
    const participantsList = Object.values(room.participants)
      .map((p) => p.name)
      .join('\n');
    setEditDialog({
      open: true,
      roomId: room.id,
      roomName: room.name,
      participants: participantsList,
    });
  };

  const confirmEdit = async () => {
    const { roomId, roomName, participants } = editDialog;

    // Validate
    if (!roomName.trim()) {
      setSnackbar({
        open: true,
        message: 'Room name cannot be empty',
        severity: 'error',
      });
      return;
    }

    const names = participants
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length < 2) {
      setSnackbar({
        open: true,
        message: 'Please enter at least 2 participants',
        severity: 'error',
      });
      return;
    }

    // Check for duplicates
    const uniqueNames = new Set(names.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== names.length) {
      setSnackbar({
        open: true,
        message: 'Duplicate names detected',
        severity: 'error',
      });
      return;
    }

    setEditDialog({ open: false, roomId: '', roomName: '', participants: '' });

    try {
      await updateRoomName(roomId, roomName);
      await updateRoomParticipants(roomId, names);
      setSnackbar({
        open: true,
        message: 'Room updated successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating room:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update room. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleResetRoom = (roomId: string, roomName: string) => {
    setResetDialog({ open: true, roomId, roomName });
  };

  const confirmReset = async () => {
    const { roomId, roomName } = resetDialog;
    setResetDialog({ open: false, roomId: '', roomName: '' });

    try {
      await resetRoomAssignments(roomId);
      setSnackbar({
        open: true,
        message: `Room "${roomName}" has been reset successfully`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error resetting room:', err);
      setSnackbar({
        open: true,
        message: 'Failed to reset room. Please try again.',
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
                      fontWeight: 'var(--font-weight-semibold)',
                      mt: 1,
                      fontSize: 'var(--font-size-base)',
                      padding: '0.75rem 1.5rem',
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
                                      background: 'var(--overlay-light)',
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
                                handleResetRoom(room.id, room.name);
                              }}
                              title="Reset assignments"
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
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRoom(room);
                              }}
                              title="Edit room"
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

      <GlassDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, roomId: '', roomName: '' })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        dialogData={{
          type: 'delete-room',
          roomName: deleteDialog.roomName,
          onConfirm: confirmDelete,
          onCancel: () => setDeleteDialog({ open: false, roomId: '', roomName: '' }),
        }}
      />

      <GlassDialog
        open={editDialog.open}
        onClose={() =>
          setEditDialog({ open: false, roomId: '', roomName: '', participants: '' })
        }
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
        dialogData={{
          type: 'edit-room',
          roomName: editDialog.roomName,
          participants: editDialog.participants,
          onRoomNameChange: (name) => setEditDialog({ ...editDialog, roomName: name }),
          onParticipantsChange: (participants) =>
            setEditDialog({ ...editDialog, participants }),
          onConfirm: confirmEdit,
          onCancel: () =>
            setEditDialog({ open: false, roomId: '', roomName: '', participants: '' }),
        }}
      />

      <GlassDialog
        open={resetDialog.open}
        onClose={() => setResetDialog({ open: false, roomId: '', roomName: '' })}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
        dialogData={{
          type: 'reset-room',
          roomName: resetDialog.roomName,
          onConfirm: confirmReset,
          onCancel: () => setResetDialog({ open: false, roomId: '', roomName: '' }),
        }}
      />
    </PasswordProtect>
  );
}
