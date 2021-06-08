import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditionId } from '../types';

export interface ResumeState {
  lastAudiobookEditionId: EditionId | undefined;
  lastEbookEditionId: EditionId | undefined;
}

export const initialState: ResumeState = {
  lastAudiobookEditionId: undefined,
  lastEbookEditionId: undefined,
};

const resume = createSlice({
  name: `resume`,
  initialState,
  reducers: {
    setLastEbookEditionId: (state, action: PayloadAction<EditionId | undefined>) => {
      state.lastEbookEditionId = action.payload;
    },
    setLastAudiobookEditionId: (state, action: PayloadAction<EditionId | undefined>) => {
      state.lastAudiobookEditionId = action.payload;
    },
  },
});

export const { setLastAudiobookEditionId, setLastEbookEditionId } = resume.actions;

export default resume.reducer;
