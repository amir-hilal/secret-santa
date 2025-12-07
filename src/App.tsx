import { Button } from '@mui/material';
import Lottie from 'lottie-react';
import { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import GoogleSignInButton from './components/GoogleSignInButton/GoogleSignInButton';
import Header from './components/Header/Header';
import LoadingAnimation from './components/LoadingAnimation/LoadingAnimation';
import { signInWithGoogle, subscribeToAuthState } from './firebase/authService';
import ChristmasSleighAnimation from './lottie/ChristmasSleigh.json';
import AdminPage from './pages/AdminPage/AdminPage';
import LandingPage from './pages/LandingPage/LandingPage';
import MyRoomsPage from './pages/MyRoomsPage/MyRoomsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import RoomCreatedPage from './pages/RoomCreatedPage/RoomCreatedPage';
import RoomPage from './pages/RoomPage/RoomPage';
import RoomPinPage from './pages/RoomPinPage/RoomPinPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  clearUser,
  hideLoginOverlay,
  setUser,
  showLoginOverlay,
} from './store/userSlice';

/**
 * ProtectedRoute - Redirects to home if user is not authenticated
 */
function ProtectedRoute({ children }: { children: ReactElement }) {
  const currentUser = useAppSelector((state) => state.user);

  if (!currentUser.uid) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Main App component with routing
 */
function AppContent() {
  const dispatch = useAppDispatch();
  const isAuthLoading = useAppSelector((state) => state.user.isAuthLoading);
  const showLogin = useAppSelector((state) => state.user.showLoginOverlay);

  // Subscribe to auth state changes globally
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleSignInClick = () => {
    dispatch(showLoginOverlay());
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      dispatch(hideLoginOverlay());
    } catch (err) {
      console.error('Error signing in:', err);
      dispatch(hideLoginOverlay());
    }
  };

  return (
    <>
      <Header onSignInClick={handleSignInClick} />

      {/* Global Login Overlay */}
      {showLogin && (
        <div className="login-overlay">
          <div className="login-overlay-content">
            <div className="login-card">
              <h2>🎅 Sign In Required</h2>
              <p>You need to sign in to access this feature</p>

              <div className="login-buttons">
                <GoogleSignInButton onClick={handleGoogleLogin} fullWidth />

                <Button
                  onClick={() => dispatch(hideLoginOverlay())}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    color: 'var(--text-secondary)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isAuthLoading ? (
        <div
          className="page"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          <LoadingAnimation
            animationData={ChristmasSleighAnimation}
            width={300}
            height={300}
          />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/my-rooms"
            element={
              <ProtectedRoute>
                <MyRoomsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/room-created/:roomId" element={<RoomCreatedPage />} />
          <Route path="/room/:roomId/pin" element={<RoomPinPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  const [snowAnimation, setSnowAnimation] = useState<object | null>(null);

  useEffect(() => {
    import('./lottie/LetItSnow.json')
      .then((data) => setSnowAnimation(data.default || data))
      .catch(() => setSnowAnimation(null));
  }, []);

  return (
    <>
      {snowAnimation && (
        <div className="snow-background">
          <Lottie
            animationData={snowAnimation}
            loop={true}
            style={{ width: 'auto', height: '100dvh', minWidth: '100vw' }}
          />
        </div>
      )}
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  );
}

export default App;
