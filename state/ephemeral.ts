import { createSlice } from '@reduxjs/toolkit';

export interface EphemeralState {
  showingEbookSettings: boolean;
  showingEbookHeader: boolean;
}

export const initialState: EphemeralState = {
  showingEbookSettings: false,
  showingEbookHeader: true,
};

const ephemeral = createSlice({
  name: `ephemeral`,
  initialState,
  reducers: {
    toggleShowingEbookHeader: (state) => {
      state.showingEbookHeader = !state.showingEbookHeader;
    },
    toggleShowingEbookSettings: (state) => {
      state.showingEbookSettings = !state.showingEbookSettings;
    },
  },
});

export const { toggleShowingEbookSettings, toggleShowingEbookHeader } = ephemeral.actions;

export default ephemeral.reducer;
