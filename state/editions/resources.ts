import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditionResource } from '../../types';
import Service from '../../lib/service';
import { Thunk } from '..';

type EditionResourcesState = Record<string, EditionResource | undefined>;

export const initialState: EditionResourcesState = {};

const editionResourcesSlice = createSlice({
  name: `editions-resources`,
  initialState,
  reducers: {
    replace: (state, action: PayloadAction<EditionResource[]>) => {
      return action.payload.reduce<EditionResourcesState>((acc, audio) => {
        acc[audio.id] = audio;
        return acc;
      }, {});
    },
  },
});

export const { replace } = editionResourcesSlice.actions;
export default editionResourcesSlice.reducer;

export const fetchEditions = (): Thunk => async (dispatch) => {
  const editions = await Service.networkFetchEditions();
  if (editions) {
    dispatch(replace(editions));
    // setAllUndownloadedAudios(dispatch, editions);
    Service.fsSaveEditionResources(editions);
  }
};
