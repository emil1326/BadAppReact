import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createAuth, type Auth } from '../../types/auth';

const authSlice = createSlice({
  name: 'auth',
  initialState: createAuth(),
  reducers: {
    setAuth(_state, action: PayloadAction<Auth>) {
      return action.payload;
    },
    updateAuth(state, action: PayloadAction<Partial<Auth>>) {
      return { ...state, ...action.payload };
    },
    resetAuth() {
      return createAuth();
    },
  },
});

export const { setAuth, updateAuth, resetAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
