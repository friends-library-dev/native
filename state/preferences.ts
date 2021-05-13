import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioQuality } from '@friends-library/types';
import { BookSortMethod } from '../types';

export interface PreferencesState {
  audioQuality: AudioQuality;
  sortAudiosBy: BookSortMethod;
  audioSearchQuery: string;
  audioSortHeaderHeight: number;
  sortEditionsBy: BookSortMethod;
  editionSearchQuery: string;
  editionSortHeaderHeight: number;
}

export const initialState: PreferencesState = {
  audioQuality: `HQ`,
  sortAudiosBy: `published`,
  audioSearchQuery: ``,
  sortEditionsBy: `published`,
  editionSearchQuery: ``,

  // maybe not technically a "preference", but these are in essence
  // derived at runtime from their font-size, which sort of is a pref.
  audioSortHeaderHeight: 113.5,
  editionSortHeaderHeight: 113.5,
};

const preferences = createSlice({
  name: `preferences`,
  initialState,
  reducers: {
    setEditionSortHeaderHeight: (state, action: PayloadAction<number>) => {
      state.editionSortHeaderHeight = action.payload;
    },
    setSortEditionsBy: (state, action: PayloadAction<BookSortMethod>) => {
      state.sortEditionsBy = action.payload;
    },
    setEditionSearchQuery: (state, action: PayloadAction<string>) => {
      state.editionSearchQuery = action.payload;
    },
    setAudioSortHeaderHeight: (state, action: PayloadAction<number>) => {
      state.audioSortHeaderHeight = action.payload;
    },
    setSortAudiosBy: (state, action: PayloadAction<BookSortMethod>) => {
      state.sortAudiosBy = action.payload;
    },
    setAudioSearchQuery: (state, action: PayloadAction<string>) => {
      state.audioSearchQuery = action.payload;
    },
    setQuality: (state, action: PayloadAction<AudioQuality>) => {
      state.audioQuality = action.payload;
    },
    toggleQuality: (state) => {
      state.audioQuality = state.audioQuality === `HQ` ? `LQ` : `HQ`;
    },
  },
});

export const {
  setQuality,
  toggleQuality,
  setAudioSearchQuery,
  setSortAudiosBy,
  setAudioSortHeaderHeight,
  setEditionSortHeaderHeight,
  setSortEditionsBy,
  setEditionSearchQuery,
} = preferences.actions;

export default preferences.reducer;
