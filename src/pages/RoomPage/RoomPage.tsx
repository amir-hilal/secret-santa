import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingAnimation from '../../components/LoadingAnimation';
import {
  assignSecretSanta,
  findParticipantIdByName,
  getTargetName,
} from '../../firebase/roomsService';
import { useRoom } from '../../hooks/useRoom';
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
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);

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

  // Handle name submission for first-time users
  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    setNameError(null);

    if (!room || !roomId) return;

    const participantId = findParticipantIdByName(room, nameInput);

    if (!participantId) {
      setNameError(
        'Name not found in this room. Please ask the organizer to spell it exactly as entered.'
      );
      return;
    }

    // Save to localStorage and state
    const localData = {
      participantId,
      name: room.participants[participantId].name,
    };
    setLocalParticipant(roomId, localData);
    setLocalParticipantId(participantId);
    setLocalParticipantName(localData.name);
  };

  // Handle picking Secret Santa
  const handlePick = async () => {
    if (!roomId || !localParticipantId) return;

    setPicking(true);
    setPickError(null);

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
  };

  // Copy room link to clipboard
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Room link copied to clipboard!');
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
          <button onClick={() => navigate('/')} className="btn">
            Go to Home
          </button>
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

          <div className="room-info">
            <button onClick={handleCopyLink} className="btn btn-secondary">
              Copy room link
            </button>
          </div>

          <div className="card">
            <h2>Welcome!</h2>
            <p>Enter your name to join this Secret Santa game.</p>

            <form onSubmit={handleNameSubmit} className="name-form">
              <label htmlFor="name">What is your name?</label>
              <input
                type="text"
                id="name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                required
              />

              {nameError && <div className="error-message">{nameError}</div>}

              <button type="submit" className="btn btn-primary">
                Join room
              </button>
            </form>

            <div className="participant-list">
              <h3>Participants in this room:</h3>
              <ul>
                {Object.values(room.participants).map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has identified themselves
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
          <button onClick={handleCopyLink} className="btn btn-secondary">
            Copy room link
          </button>
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
          <>
            <div className="card pick-card">
              <h2>Ready to pick your Secret Santa?</h2>
              <p className="info-text">
                Click the button below to randomly select who you'll be giving a gift to.
                Once you pick, you cannot change it!
              </p>

              {pickError && <div className="error-message">{pickError}</div>}

              <button
                onClick={handlePick}
                disabled={picking}
                className="btn btn-primary btn-large"
              >
                {picking ? 'Picking...' : '🎲 Pick my Secret Santa'}
              </button>

              <div className="available-count">
                {room.availableTargets
                  ? Object.values(room.availableTargets).filter(Boolean).length
                  : totalParticipants}{' '}
                participants still available
              </div>
            </div>

            <div className="info-box">
              <h3>How it works:</h3>
              <ul>
                <li>Each participant can pick only once</li>
                <li>You cannot pick yourself</li>
                <li>Once someone is picked, they're no longer available for others</li>
                <li>Your pick is saved on this device and in the database</li>
                <li>Keep your Secret Santa assignment secret! 🤫</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
