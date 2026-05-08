import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createProfile, type Profile } from '../../types/profile';

const profileSlice = createSlice({
  name: 'profile',
  initialState: createProfile(),
  reducers: {
    setProfile(_state, action: PayloadAction<Profile>) {
      return action.payload;
    },
    updateProfile(state, action: PayloadAction<Partial<Profile>>) {
      return { ...state, ...action.payload };
    },
    resetProfile() {
      return createProfile();
    },
  },
});

export const { setProfile, updateProfile, resetProfile } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
