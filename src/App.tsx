import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import RoomPage from './pages/RoomPage/RoomPage';

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
            style={{ width: 'auto', height: '100vh', minWidth: '100vw' }}
          />
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
