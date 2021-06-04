import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditionId } from '../../types';

export type ActivePartState = Record<EditionId, number | null | undefined>;

export const initialState: ActivePartState = {};

const activePart = createSlice({
  name: `activePart`,
  initialState,
  reducers: {
    set: (state, action: PayloadAction<{ editionId: string; partIndex: number }>) => {
      const { editionId, partIndex } = action.payload;
      state[editionId] = partIndex;
    },
  },
});

export const { set } = activePart.actions;

export default activePart.reducer;
