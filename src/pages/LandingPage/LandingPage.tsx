import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructionsBox from '../../components/InstructionsBox/InstructionsBox';
import RoomCreationForm from '../../components/RoomCreationForm/RoomCreationForm';
import { createRoom } from '../../firebase/roomsService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showLoginOverlay as showLoginOverlayAction } from '../../store/userSlice';
import './LandingPage.css';

/**
 * LandingPage - First page users see to create a new Secret Santa room
 */
export default function LandingPage() {
  const [isCreating, setIsCreating] = useState(false);
  const pendingRoomData = useRef<{
    roomName: string;
    participantNames: string[];
    isSecured: boolean;
  } | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user);

  // Auto-create room after login if pending
  useEffect(() => {
    if (currentUser.uid && pendingRoomData.current) {
      const data = pendingRoomData.current;
      pendingRoomData.current = null;
      handleCreateRoom(data);
    }
  }, [currentUser.uid]);

  const handleCreateRoom = async (data: {
    roomName: string;
    participantNames: string[];
    isSecured: boolean;
  }) => {
    // Check if user is logged in
    if (!currentUser.uid) {
      pendingRoomData.current = data;
      dispatch(showLoginOverlayAction());
      throw new Error('Please log in to create a room');
    }

    setIsCreating(true);

    try {
      const { roomId, pin } = await createRoom(
        data.roomName,
        data.participantNames,
        currentUser.uid,
        data.isSecured,
        currentUser.displayName || undefined,
        currentUser.email || undefined
      );

      // Navigate to room created page
      navigate(`/room-created/${roomId}`, {
        state: { roomName: data.roomName, pin, isSecured: data.isSecured },
      });
    } catch (err: any) {
      setIsCreating(false);
      throw err; // Re-throw to let the form component handle the error
    }
  };

  return (
    <div className="page landing-page">
      <div className="container">
        <div className="landing-header">
          <h1>Secret Santa Generator 🎅</h1>
        </div>

        <div className="card landing-card">
          <h2>Create Your Room</h2>
          <RoomCreationForm onSubmit={handleCreateRoom} isLoading={isCreating} />
          <InstructionsBox />
        </div>
      </div>
    </div>
  );
}
