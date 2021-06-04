import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as select from '../selectors/audio-selectors';
import Service from '../../lib/service';
import { EditionId } from '../../types';
import { Thunk, Dispatch, State } from '..';
import { AudioPartEntity } from '../../lib/models';
import Editions from '../../lib/Editions';

type AudioPartEntityStateKey = string;

interface Part {
  editionId: EditionId;
  index: number;
}

export type TrackPositionState = Record<AudioPartEntityStateKey, number | undefined>;

export const initialState: TrackPositionState = {};

const trackPosition = createSlice({
  name: `trackPosition`,
  initialState,
  reducers: {
    setTrackPosition: (
      state,
      action: PayloadAction<{ part: Part; position: number }>,
    ) => {
      const { part, position } = action.payload;
      state[stateKey(part)] = position;
    },
  },
});

export const { setTrackPosition } = trackPosition.actions;
export default trackPosition.reducer;

export const setCurrentTrackPosition = (position: number): Thunk => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const { editionId } = state.audio.playback;
  if (!editionId) return;
  const index = select.audioActivePartIndex(editionId, state);
  dispatch(setTrackPosition({ part: { editionId, index }, position }));
};

export const seekTo = (
  editionId: EditionId,
  partIndex: number,
  position: number,
): Thunk => async (dispatch, getState) => {
  return seek(editionId, partIndex, () => position, getState, dispatch);
};

export const seekRelative = (
  editionId: EditionId,
  partIndex: number,
  delta: number,
): Thunk => async (dispatch, getState) => {
  return seek(editionId, partIndex, (current) => current + delta, getState, dispatch);
};

function seek(
  editionId: EditionId,
  partIndex: number,
  getNewPosition: (currentPosition: number) => number,
  getState: () => State,
  dispatch: Dispatch,
): void {
  const state = getState();
  const found = Editions.getAudioPart(editionId, partIndex);
  if (!found) return;
  const [part] = found;
  const currentPosition = select.trackPosition(editionId, partIndex, state);
  const newPosition = Math.max(
    0,
    Math.min(part.duration, getNewPosition(currentPosition)),
  );
  dispatch(
    setTrackPosition({ part: { editionId, index: partIndex }, position: newPosition }),
  );
  if (select.isAudioPartActive(editionId, partIndex, state)) {
    Service.audioSeekTo(newPosition);
  }
}

function stateKey(part: Part): string {
  return new AudioPartEntity(part.editionId, part.index).stateKey;
}
