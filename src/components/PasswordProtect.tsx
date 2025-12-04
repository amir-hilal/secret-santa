import { FormEvent, useState } from 'react';

interface PasswordProtectProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = '1password123';
const STORAGE_KEY = 'secretSanta_adminAuth';

/**
 * PasswordProtect - Overlay component that requires password to access admin features
 */
export default function PasswordProtect({ children }: PasswordProtectProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if already authenticated in sessionStorage
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="password-overlay">
      <div className="password-modal">
        <h2>🔒 Admin Access Required</h2>
        <p>Enter the password to create a new Secret Santa room.</p>

        <form onSubmit={handleSubmit} className="password-form">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary">
            Unlock
          </button>
        </form>

        <p className="info-text">
          Only administrators can create rooms. If you're a participant, ask your
          organizer for the room link.
        </p>
      </div>
    </div>
  );
}
