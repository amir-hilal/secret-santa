import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  showLoginOverlay: boolean;
}

interface SetUserPayload {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const initialState: UserState = {
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  showLoginOverlay: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SetUserPayload>) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.photoURL = action.payload.photoURL;
    },
    clearUser: (state) => {
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.photoURL = null;
    },
    showLoginOverlay: (state) => {
      state.showLoginOverlay = true;
    },
    hideLoginOverlay: (state) => {
      state.showLoginOverlay = false;
    },
  },
});

export const { setUser, clearUser, showLoginOverlay, hideLoginOverlay } =
  userSlice.actions;
export default userSlice.reducer;
