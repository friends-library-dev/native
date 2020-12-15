import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioQuality } from '@friends-library/types';

export interface PreferencesState {
  audioQuality: AudioQuality;
  sortAudiosBy: 'length' | 'length_reverse' | 'published' | 'alphabetical';
  searchQuery: string;
}

export const initialState: PreferencesState = {
  audioQuality: `HQ`,
  sortAudiosBy: `published`,
  searchQuery: ``,
};

const preferences = createSlice({
  name: `preferences`,
  initialState,
  reducers: {
    setSortAudiosBy: (state, action: PayloadAction<PreferencesState['sortAudiosBy']>) => {
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
} = preferences.actions;

export default preferences.reducer;
