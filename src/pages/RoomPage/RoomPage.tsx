import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';
import ParticipantTags from '../../components/ParticipantTags/ParticipantTags';
import { assignSecretSanta, getTargetName } from '../../firebase/roomsService';
import { useRoom } from '../../hooks/useRoom';
import { useAppDispatch } from '../../store/hooks';
import { setRoom } from '../../store/roomSlice';
import { getLocalParticipant, setLocalParticipant } from '../../utils/localStorage';
import './RoomPage.css';

/**
 * RoomPage - Participants join and pick their Secret Santa
 */
export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { room, loading: roomLoading, error: roomError } = useRoom(roomId);

  const [localParticipantId, setLocalParticipantId] = useState<string | null>(null);
  const [localParticipantName, setLocalParticipantName] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    participantId: string;
    name: string;
  }>({ open: false, participantId: '', name: '' });
  const [shuffling, setShuffling] = useState(false);
  const [shuffledName, setShuffledName] = useState<string>('');

  const dispatch = useAppDispatch();

  // Load Lottie animation
  useEffect(() => {
    import('../../lottie/ChristmasSleigh.json')
      .then((data) => setAnimationData(data.default || data))
      .catch(() => setAnimationData(null));
  }, []);

  // Load participant from localStorage on mount
  useEffect(() => {
    if (!roomId) return;

    const localData = getLocalParticipant(roomId);
    if (localData) {
      setLocalParticipantId(localData.participantId);
      setLocalParticipantName(localData.name);
    }
  }, [roomId]);

  // Update Redux store when room changes
  useEffect(() => {
    if (room) {
      dispatch(setRoom(room));
    }
  }, [room, dispatch]);

  // Handle participant selection
  const handleParticipantSelect = (participantId: string, name: string) => {
    setConfirmDialog({ open: true, participantId, name });
  };

  // Confirm participant identity
  const confirmIdentity = () => {
    const { participantId, name } = confirmDialog;
    setConfirmDialog({ open: false, participantId: '', name: '' });

    if (!roomId) return;

    // Save to localStorage and state
    const localData = {
      participantId,
      name,
    };
    setLocalParticipant(roomId, localData);
    setLocalParticipantId(participantId);
    setLocalParticipantName(name);
  };

  // Cancel participant selection
  const cancelIdentity = () => {
    setConfirmDialog({ open: false, participantId: '', name: '' });
  };

  // Handle picking Secret Santa
  const handlePick = async () => {
    if (!roomId || !localParticipantId || !room) return;

    setPicking(true);
    setShuffling(true);
    setPickError(null);

    // Get available participants for shuffling
    const availableParticipants = Object.entries(room.participants)
      .filter(([id]) => {
        if (id === localParticipantId) return false; // Can't pick yourself
        if (room.availableTargets && !room.availableTargets[id]) return false;
        return true;
      })
      .map(([, participant]) => participant.name);

    // Shuffle animation for 5 seconds
    const shuffleInterval = setInterval(() => {
      const randomName =
        availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
      setShuffledName(randomName);
    }, 300); // Change name every 800ms to match animation duration

    // After 5 seconds, make the actual assignment
    setTimeout(async () => {
      clearInterval(shuffleInterval);
      setShuffling(false);

      try {
        await assignSecretSanta(roomId, localParticipantId);

        // The room will update via the subscription, triggering a re-render
        // Update localStorage with target name once we have it
        if (room) {
          const targetName = getTargetName(room, localParticipantId);
          if (targetName && localParticipantName) {
            setLocalParticipant(roomId, {
              participantId: localParticipantId,
              name: localParticipantName,
              targetName,
            });
          }
        }
      } catch (err) {
        console.error('Error picking Secret Santa:', err);
        setPickError(
          err instanceof Error
            ? err.message
            : 'Failed to pick Secret Santa. Please try again.'
        );
      } finally {
        setPicking(false);
      }
    }, 5000);
  };

  // Loading state
  if (roomLoading) {
    return (
      <div className="page room-page loading-page">
        <LoadingAnimation
          animationData={animationData || undefined}
          width={300}
          height={300}
        />
      </div>
    );
  }

  // Error state
  if (roomError || !room || !roomId) {
    return (
      <div className="page room-page">
        <div className="container">
          <div className="error-message">{roomError || 'Room not found'}</div>
          <Button
            onClick={() => navigate('/')}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              mt: 2,
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '8px',
            }}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalParticipants = Object.keys(room.participants).length;
  const assignedCount = room.assignments ? Object.keys(room.assignments).length : 0;
  const isCompleted = room.status === 'completed';

  // User hasn't identified themselves yet
  if (!localParticipantId) {
    return (
      <div className="page room-page">
        <div className="container">
          <h1>🎅 {room.name}</h1>

          <div className="card">
            <h2>Who are you?</h2>
            <p>Select your name from the participants below.</p>

            <div className="participant-list">
              <ParticipantTags
                participants={room.participants}
                assignments={room.assignments}
                onSelect={handleParticipantSelect}
                selectable={true}
              />
            </div>
          </div>
        </div>

        <Dialog
          open={confirmDialog.open}
          onClose={cancelIdentity}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          slotProps={{
            paper: {
              sx: {
                borderRadius: 3,
                padding: 1,
              },
            },
          }}
        >
          <DialogTitle
            id="confirm-dialog-title"
            sx={{ fontWeight: 600, fontSize: '1.5rem' }}
          >
            Confirm Identity
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="confirm-dialog-description"
              sx={{ fontSize: '1rem', color: 'text.primary' }}
            >
              Is that really you <strong>{confirmDialog.name}</strong>? Don't ruin it!
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: 2, gap: 1 }}>
            <Button
              onClick={cancelIdentity}
              variant="outlined"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                borderColor: '#999',
                color: '#666',
                '&:hover': {
                  borderColor: '#666',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              no, sorry :(
            </Button>
            <Button
              onClick={confirmIdentity}
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: '#28a745',
                '&:hover': {
                  backgroundColor: '#218838',
                },
              }}
              autoFocus
            >
              YES!
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  } // User has identified themselves
  const hasAssignment = room.assignments && room.assignments[localParticipantId];
  const targetName = hasAssignment ? getTargetName(room, localParticipantId) : null;

  return (
    <div className="page room-page">
      <div className="container">
        <h1>🎅 {room.name}</h1>

        <div className="room-info">
          <p>
            <strong>Your name:</strong> {localParticipantName}
          </p>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Total participants:</span>
            <span className="stat-value">{totalParticipants}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Assignments made:</span>
            <span className="stat-value">
              {assignedCount} / {totalParticipants}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status:</span>
            <span className="stat-value">
              {isCompleted ? '✅ Completed' : '🔄 In progress'}
            </span>
          </div>
        </div>

        {targetName ? (
          // User has already picked
          <div className="card result-card">
            <h2>🎁 Your Secret Santa is:</h2>
            <div className="target-name">{targetName}</div>
            <p className="info-text">
              You've already picked your Secret Santa. Remember to keep it a secret! 🤫
            </p>
          </div>
        ) : (
          // User hasn't picked yet
          <div className="card pick-card">
            <h2>Ready to pick your Secret Santa?</h2>
            <p className="info-text">
              Click the button below to randomly select who you'll be giving a gift to.
              Once you pick, you cannot change it!
            </p>

            {pickError && <div className="error-message">{pickError}</div>}

            <AnimatePresence>
              {shuffling && (
                <motion.div
                  className="shuffle-animation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="shuffling-label">🎲 Shuffling...</h3>
                  <div className="shuffled-names-container">
                    <motion.div
                      key={shuffledName}
                      className="shuffled-name"
                      initial={{
                        x: Math.random() * 800 - 400,
                        y: Math.random() * 400 - 200,
                        opacity: 0,
                        scale: 0.3,
                        rotate: Math.random() * 90 - 45,
                      }}
                      animate={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeOut',
                      }}
                    >
                      {shuffledName}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handlePick}
              disabled={picking}
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.25rem',
                padding: '1rem 2rem',
                borderRadius: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                '&:hover:not(:disabled)': {
                  backgroundColor: '#218838',
                },
                '&:disabled': {
                  backgroundColor: '#28a745',
                  opacity: 0.6,
                },
              }}
            >
              {picking ? 'Picking...' : '🎲 Pick my Secret Santa'}
            </Button>

            <div className="available-count">
              {room.availableTargets
                ? Object.values(room.availableTargets).filter(Boolean).length
                : totalParticipants}{' '}
              participants still available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
