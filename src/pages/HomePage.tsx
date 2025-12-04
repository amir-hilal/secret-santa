import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordProtect from '../components/PasswordProtect';
import { createRoom, subscribeToAllRooms } from '../firebase/roomsService';
import { Room } from '../types';

/**
 * HomePage - Admin page to create rooms and view all existing rooms
 * Protected by password authentication
 */
export default function HomePage() {
  const [participantNames, setParticipantNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
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
      const roomId = await createRoom(names);
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
    alert('Room link copied to clipboard!');
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

                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Creating room...' : 'Create room'}
                  </button>
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
                        <div key={room.id} className="room-item">
                          <div className="room-header">
                            <span className="room-id">Room: {room.id}</span>
                            <span className={`room-status ${room.status}`}>
                              {room.status === 'completed' ? '✅' : '🔄'}
                            </span>
                          </div>

                          <div className="room-details">
                            <p className="room-date">{formatDate(room.createdAt)}</p>
                            <p className="room-progress">
                              Progress: {assignedCount} / {totalParticipants} assigned
                            </p>
                            <div className="room-participants">
                              <strong>Participants:</strong>
                              <div className="participants-tags">
                                {Object.values(room.participants).map((p) => (
                                  <span key={p.id} className="participant-tag">
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="room-actions">
                            <button
                              onClick={() => navigate(`/room/${room.id}`)}
                              className="btn btn-small"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => handleCopyRoomLink(room.id)}
                              className="btn btn-small btn-secondary"
                            >
                              Copy Link
                            </button>
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
    </PasswordProtect>
  );
}
