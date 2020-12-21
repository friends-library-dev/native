import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioQuality } from '@friends-library/types';

export type AudioSortCriteria = 'duration' | 'published' | 'author' | 'title';

export interface PreferencesState {
  audioQuality: AudioQuality;
  sortAudiosBy: AudioSortCriteria;
  searchQuery: string;
  audioSortHeaderHeight: number;
}

export const initialState: PreferencesState = {
  audioQuality: `HQ`,
  sortAudiosBy: `published`,
  searchQuery: ``,

  // maybe not technically a "preference", but is in essence
  // derived at runtime from their font-size, which sort of is a pref.
  audioSortHeaderHeight: 113.5,
};

const preferences = createSlice({
  name: `preferences`,
  initialState,
  reducers: {
    setAudioSortHeaderHeight: (state, action: PayloadAction<number>) => {
      state.audioSortHeaderHeight = action.payload;
    },
    setSortAudiosBy: (state, action: PayloadAction<AudioSortCriteria>) => {
      state.sortAudiosBy = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
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
  setSearchQuery,
  setSortAudiosBy,
  setAudioSortHeaderHeight,
} = preferences.actions;

export default preferences.reducer;
