import { Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../../firebase/authService';
import { useAppSelector } from '../../store/hooks';
import './Header.css';

/**
 * Header - Navigation header with profile dropdown
 */
export default function Header() {
  const currentUser = useAppSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMyRooms = () => {
    handleClose();
    navigate('/my-rooms');
  };

  const handleAdmin = () => {
    handleClose();
    navigate('/admin');
  };

  const handleSignOut = async () => {
    handleClose();
    await signOutUser();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo" onClick={handleHome}>
          🎅 Secret Santa
        </div>
        {currentUser.uid && (
          <div className="header-profile">
          <div className="profile-avatar" onClick={handleClick}>
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
            ) : (
              <div className="avatar-placeholder">
                {currentUser.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            disableScrollLock={true}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                backgroundColor: 'var(--card-background)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                minWidth: '200px',
              },
            }}
          >
            <div className="menu-header">
              <div className="menu-user-email">{currentUser.email}</div>
            </div>
            <MenuItem
              onClick={handleMyRooms}
              sx={{
                color: 'var(--text-primary)',
                '&:hover': {
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                },
              }}
            >
              View My Rooms
            </MenuItem>
            {currentUser.email === 'amir.hilal@hilalpines.com' && (
              <MenuItem
                onClick={handleAdmin}
                sx={{
                  color: 'var(--secondary-color)',
                  '&:hover': {
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  },
                }}
              >
                View as Admin
              </MenuItem>
            )}
            <MenuItem
              onClick={handleSignOut}
              sx={{
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border-color)',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                '&:hover': {
                  backgroundColor: 'rgba(128, 128, 128, 0.1)',
                },
              }}
            >
              Sign Out
            </MenuItem>
          </Menu>
        </div>
        )}
      </div>
    </header>
  );
}
