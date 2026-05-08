import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createUiState, type UiState } from '../../types/ui';

const uiSlice = createSlice({
  name: 'ui',
  initialState: createUiState(),
  reducers: {
    setUi(_state, action: PayloadAction<UiState>) {
      return action.payload;
    },
    updateUi(state, action: PayloadAction<Partial<UiState>>) {
      return { ...state, ...action.payload };
    },
    resetUi() {
      return createUiState();
    },
  },
});

export const { setUi, updateUi, resetUi } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
