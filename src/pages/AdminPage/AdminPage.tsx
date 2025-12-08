import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassDialog from '../../components/GlassDialog/GlassDialog';
import InstructionsBox from '../../components/InstructionsBox/InstructionsBox';
import PasswordProtect from '../../components/PasswordProtect/PasswordProtect';
import RoomCreationForm from '../../components/RoomCreationForm/RoomCreationForm';
import RoomsList from '../../components/RoomsList/RoomsList';
import {
  createRoom,
  deleteRoom,
  resetRoomAssignments,
  subscribeToAllRooms,
  updateRoomName,
  updateRoomParticipants,
} from '../../firebase/roomsService';
import { useAppSelector } from '../../store/hooks';
import { Room } from '../../types';
import './AdminPage.css';

/**
 * AdminPage - Admin page to create rooms and view all existing rooms
 * Protected by password authentication
 */
export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const currentUser = useAppSelector((state) => state.user);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [copiedPinRoomId, setCopiedPinRoomId] = useState<string | null>(null);
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

  const handleCreateRoom = async (data: {
    roomName: string;
    participantNames: string[];
    isSecured: boolean;
  }) => {
    setLoading(true);

    try {
      const { roomId, pin } = await createRoom(
        data.roomName,
        data.participantNames,
        currentUser.uid || undefined,
        data.isSecured,
        currentUser.displayName || 'Admin',
        currentUser.email || 'amir.hilal@hilalpines.com'
      );
      navigate(`/room-created/${roomId}`, {
        state: { roomName: data.roomName, pin, isSecured: data.isSecured },
      });
    } catch (err: any) {
      setLoading(false);
      throw err; // Re-throw to let the form component handle the error
    }
  };

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
                <RoomCreationForm onSubmit={handleCreateRoom} isLoading={loading} />
                <InstructionsBox />
              </div>
            </div>

            {/* Right column: List of existing rooms */}
            <div className="admin-column">
              <div className="card">
                <h2>Existing Rooms ({rooms.length})</h2>
                <RoomsList
                  rooms={rooms}
                  copiedRoomId={copiedRoomId}
                  copiedPinRoomId={copiedPinRoomId}
                  onCopyRoomLink={handleCopyRoomLink}
                  onCopyPin={handleCopyPin}
                  onDeleteRoom={handleDeleteRoom}
                  onEditRoom={handleEditRoom}
                  onResetRoom={handleResetRoom}
                  showActions={true}
                />
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
