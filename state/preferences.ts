import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioQuality } from '@friends-library/types';
import { BookSortMethod, EbookColorScheme } from '../types';

export interface PreferencesState {
  audioQuality: AudioQuality;
  sortAudiosBy: BookSortMethod;
  audioSearchQuery: string;
  sortEbooksBy: BookSortMethod;
  ebookSearchQuery: string;
  ebookColorScheme: EbookColorScheme;
  ebookFontSize: number;
  ebookJustify: boolean;
}

export const initialState: PreferencesState = {
  // audio prefs
  audioQuality: `HQ`,
  sortAudiosBy: `published`,
  audioSearchQuery: ``,

  // edition/ebook prefs
  sortEbooksBy: `published`,
  ebookSearchQuery: ``,
  ebookColorScheme: `white`,
  ebookFontSize: 5,
  ebookJustify: true,
};

const preferences = createSlice({
  name: `preferences`,
  initialState,
  reducers: {
    setSortEbooksBy: (state, action: PayloadAction<BookSortMethod>) => {
      state.sortEbooksBy = action.payload;
    },
    setEbookSearchQuery: (state, action: PayloadAction<string>) => {
      state.ebookSearchQuery = action.payload;
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
    setEbookColorScheme: (state, action: PayloadAction<EbookColorScheme>) => {
      state.ebookColorScheme = action.payload;
    },
    setEbookFontSize: (state, action: PayloadAction<number>) => {
      state.ebookFontSize = action.payload;
    },
  },
});

export const {
  setQuality,
  toggleQuality,
  setAudioSearchQuery,
  setSortAudiosBy,
  setSortEbooksBy,
  setEbookSearchQuery,
  setEbookColorScheme,
  setEbookFontSize,
} = preferences.actions;

export default preferences.reducer;
