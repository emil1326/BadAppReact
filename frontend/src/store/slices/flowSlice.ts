import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createFlow, type Flow } from '../../types/flow';

const flowSlice = createSlice({
  name: 'flow',
  initialState: createFlow(),
  reducers: {
    setFlow(_state, action: PayloadAction<Flow>) {
      return action.payload;
    },
    updateFlow(state, action: PayloadAction<Partial<Flow>>) {
      return { ...state, ...action.payload };
    },
    resetFlow() {
      return createFlow();
    },
  },
});

export const { setFlow, updateFlow, resetFlow } = flowSlice.actions;
export const flowReducer = flowSlice.reducer;
