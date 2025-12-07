import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import AdminPage from './pages/AdminPage/AdminPage';
import LandingPage from './pages/LandingPage/LandingPage';
import MyRoomsPage from './pages/MyRoomsPage/MyRoomsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import RoomCreatedPage from './pages/RoomCreatedPage/RoomCreatedPage';
import RoomPage from './pages/RoomPage/RoomPage';
import RoomPinPage from './pages/RoomPinPage/RoomPinPage';
import { useAppDispatch } from './store/hooks';
import { showLoginOverlay } from './store/userSlice';

/**
 * Main App component with routing
 */
function AppContent() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const handleSignInClick = () => {
    if (location.pathname === '/') {
      dispatch(showLoginOverlay());
    }
  };

  return (
    <>
      <Header onSignInClick={handleSignInClick} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-rooms" element={<MyRoomsPage />} />
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
