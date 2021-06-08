import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DimensionsState {
  audioSortHeaderHeight: number;
  editionSortHeaderHeight: number;
  ebookHeaderHeight: number;
}

export const initialState: DimensionsState = {
  audioSortHeaderHeight: 113.5,
  editionSortHeaderHeight: 113.5,
  ebookHeaderHeight: 86,
};

const dimensions = createSlice({
  name: `dimensions`,
  initialState,
  reducers: {
    setEbookSortHeaderHeight: (state, action: PayloadAction<number>) => {
      state.editionSortHeaderHeight = action.payload;
    },
    setAudioSortHeaderHeight: (state, action: PayloadAction<number>) => {
      state.audioSortHeaderHeight = action.payload;
    },
    setEbookHeaderHeight: (state, action: PayloadAction<number>) => {
      state.ebookHeaderHeight = action.payload;
    },
  },
});

export const {
  setEbookSortHeaderHeight,
  setAudioSortHeaderHeight,
  setEbookHeaderHeight,
} = dimensions.actions;

export default dimensions.reducer;
