import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ResumeState {
  lastAudiobookEditionId: string | undefined;
  lastEbookEditionId: string | undefined;
}

export const initialState: ResumeState = {
  lastAudiobookEditionId: undefined,
  lastEbookEditionId: undefined,
};

const resume = createSlice({
  name: `resume`,
  initialState,
  reducers: {
    setLastEbookEditionId: (state, action: PayloadAction<string | undefined>) => {
      state.lastEbookEditionId = action.payload;
    },
    setLastAudiobookEditionId: (state, action: PayloadAction<string | undefined>) => {
      state.lastAudiobookEditionId = action.payload;
    },
  },
});

export const { setLastAudiobookEditionId, setLastEbookEditionId } = resume.actions;

export default resume.reducer;
