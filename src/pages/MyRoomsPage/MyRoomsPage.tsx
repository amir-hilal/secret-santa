import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassDialog from '../../components/GlassDialog/GlassDialog';
import RoomsList from '../../components/RoomsList/RoomsList';
import {
  deleteRoom,
  resetRoomAssignments,
  subscribeToUserRooms,
  updateRoomName,
  updateRoomParticipants,
} from '../../firebase/roomsService';
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

  // Subscribe to user's rooms only
  useEffect(() => {
    if (!currentUser.uid) return;

    const unsubscribe = subscribeToUserRooms(currentUser.uid, setRooms);

    return () => unsubscribe();
  }, [currentUser.uid]);

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
    const { roomId } = deleteDialog;
    setDeleteDialog({ open: false, roomId: '', roomName: '' });

    try {
      await deleteRoom(roomId);
    } catch (err) {
      console.error('Error deleting room:', err);
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

    if (!roomName.trim()) {
      return;
    }

    const names = participants
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length < 2) {
      return;
    }

    const uniqueNames = new Set(names.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== names.length) {
      return;
    }

    setEditDialog({ open: false, roomId: '', roomName: '', participants: '' });

    try {
      await updateRoomName(roomId, roomName);
      await updateRoomParticipants(roomId, names);
    } catch (err) {
      console.error('Error updating room:', err);
    }
  };

  const handleResetRoom = (roomId: string, roomName: string) => {
    setResetDialog({ open: true, roomId, roomName });
  };

  const confirmReset = async () => {
    const { roomId } = resetDialog;
    setResetDialog({ open: false, roomId: '', roomName: '' });

    try {
      await resetRoomAssignments(roomId);
    } catch (err) {
      console.error('Error resetting room:', err);
    }
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
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'var(--primary-hover)',
              },
            }}
          >
            Create New Room
            <span className="material-symbols-outlined" style={{ marginLeft: '.5rem' }}>
              add
            </span>
          </Button>
        </div>

        <div className="card">
          <h2>Your Rooms ({rooms.length})</h2>
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
    </div>
  );
}
