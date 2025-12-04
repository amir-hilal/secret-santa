import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Room } from '../types';

interface RoomState {
  currentRoom: Room | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  currentRoom: null,
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setRoom, setLoading, setError } = roomSlice.actions;
export default roomSlice.reducer;
