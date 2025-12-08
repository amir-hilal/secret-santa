import { Button, FormControlLabel, Switch } from '@mui/material';
import { FormEvent, useState } from 'react';
import './RoomCreationForm.css';

interface RoomCreationFormProps {
  onSubmit: (data: {
    roomName: string;
    participantNames: string[];
    isSecured: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

/**
 * RoomCreationForm - Reusable form component for creating Secret Santa rooms
 */
export default function RoomCreationForm({ onSubmit, isLoading = false }: RoomCreationFormProps) {
  const [roomName, setRoomName] = useState('');
  const [participantNames, setParticipantNames] = useState('');
  const [isSecured, setIsSecured] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      await onSubmit({
        roomName: trimmedRoomName,
        participantNames: names,
        isSecured,
      });
      // Reset form on success
      setRoomName('');
      setParticipantNames('');
      setIsSecured(false);
    } catch (err: any) {
      // Handle specific errors
      if (err.message?.includes('Room limit reached')) {
        setError(
          'Room limit reached. You can create a maximum of 10 rooms. Please delete some rooms before creating new ones.'
        );
      } else {
        setError(err.message || 'Failed to create room. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="room-creation-form">
      <label htmlFor="roomName">Room Name:</label>
      <input
        type="text"
        id="roomName"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="e.g., Office Party 2025"
        disabled={isLoading}
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
        disabled={isLoading}
        required
      />

      <FormControlLabel
        control={
          <Switch
            checked={isSecured}
            onChange={(e) => setIsSecured(e.target.checked)}
            disabled={isLoading}
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
        label="🔒 Secure with PIN"
        sx={{
          marginTop: '1rem',
          '& .MuiFormControlLabel-label': {
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-base)',
          },
        }}
      />

      {error && <div className="error-message">{error}</div>}

      <Button
        type="submit"
        disabled={isLoading}
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
        {isLoading ? 'Creating room...' : 'Create room'}
      </Button>
    </form>
  );
}
