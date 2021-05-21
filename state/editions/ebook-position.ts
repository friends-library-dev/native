import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as keys from '../../lib/keys';

export type EbookPositionState = Record<string, number | undefined>;

export const initialState: EbookPositionState = {};

const ebookPosition = createSlice({
  name: `ebookPosition`,
  initialState,
  reducers: {
    setEbookPosition: (
      state,
      action: PayloadAction<{ editionId: string; position: number }>,
    ) => {
      console.log(`got a new position! ${action.payload.position}`);
      const { editionId, position } = action.payload;
      state[editionId] = position;
    },
  },
});

export const { setEbookPosition } = ebookPosition.actions;
export default ebookPosition.reducer;
