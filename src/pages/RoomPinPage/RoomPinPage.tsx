import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './RoomPinPage.css';

/**
 * RoomPinPage - PIN entry page for secured rooms
 */
export default function RoomPinPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch room name from Firebase
    setRoomName('Test Room');
  }, [roomId]);

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 4 digits
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
      setError(null);
      // Focus the last input
      document.getElementById('pin-3')?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const enteredPin = pin.join('');
    
    if (enteredPin.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    // TODO: Verify PIN with Firebase
    const correctPin = '1234'; // TODO: Get from Firebase
    
    if (enteredPin === correctPin) {
      // Store PIN verification in sessionStorage
      sessionStorage.setItem(`room-${roomId}-verified`, 'true');
      navigate(`/room/${roomId}`);
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin(['', '', '', '']);
      document.getElementById('pin-0')?.focus();
    }
  };

  return (
    <div className="page room-pin-page">
      <div className="container">
        <div className="pin-header">
          <h1>🔒 Secured Room</h1>
          <p className="subtitle">{roomName}</p>
        </div>

        <div className="card pin-card">
          <h2>Enter 4-Digit PIN</h2>
          <p className="pin-instruction">
            This room is protected. Please enter the PIN to access it.
          </p>

          <form onSubmit={handleSubmit} className="pin-form">
            <div className="pin-inputs">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="pin-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-base)',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                mt: 2,
                '&:hover': {
                  backgroundColor: 'var(--primary-hover)',
                },
              }}
            >
              Access Room
            </Button>
          </form>

          <div className="pin-help">
            <p>💡 Don't have the PIN? Contact the room creator.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
