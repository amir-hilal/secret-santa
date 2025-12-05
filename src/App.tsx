import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import AdminPage from './pages/AdminPage/AdminPage';
import LandingPage from './pages/LandingPage/LandingPage';
import MyRoomsPage from './pages/MyRoomsPage/MyRoomsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import RoomCreatedPage from './pages/RoomCreatedPage/RoomCreatedPage';
import RoomPage from './pages/RoomPage/RoomPage';
import RoomPinPage from './pages/RoomPinPage/RoomPinPage';

/**
 * Main App component with routing
 */
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
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/my-rooms" element={<MyRoomsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/room-created/:roomId" element={<RoomCreatedPage />} />
          <Route path="/room/:roomId/pin" element={<RoomPinPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
