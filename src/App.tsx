import Lottie from 'lottie-react';
import { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import LoadingAnimation from './components/LoadingAnimation/LoadingAnimation';
import { subscribeToAuthState } from './firebase/authService';
import ChristmasSleighAnimation from './lottie/ChristmasSleigh.json';
import AdminPage from './pages/AdminPage/AdminPage';
import LandingPage from './pages/LandingPage/LandingPage';
import MyRoomsPage from './pages/MyRoomsPage/MyRoomsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import RoomCreatedPage from './pages/RoomCreatedPage/RoomCreatedPage';
import RoomPage from './pages/RoomPage/RoomPage';
import RoomPinPage from './pages/RoomPinPage/RoomPinPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { clearUser, setUser, showLoginOverlay } from './store/userSlice';

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
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthLoading = useAppSelector((state) => state.user.isAuthLoading);

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
    if (location.pathname === '/') {
      dispatch(showLoginOverlay());
    }
  };

  // Show loading screen while auth initializes
  if (isAuthLoading) {
    return (
      <>
        <Header onSignInClick={handleSignInClick} />
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <LoadingAnimation animationData={ChristmasSleighAnimation} width={300} height={300} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header onSignInClick={handleSignInClick} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-rooms" element={<ProtectedRoute><MyRoomsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/room-created/:roomId" element={<RoomCreatedPage />} />
        <Route path="/room/:roomId/pin" element={<RoomPinPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
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
