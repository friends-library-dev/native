import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import Service from '../../lib/service';
import { State, Dispatch, Thunk } from '..';
import { downloadAudio, isDownloaded } from './filesystem';
import { setLastAudiobookEditionId } from '../resume';
import { set as setActivePart } from './active-part';
import * as select from '../selectors/audio-selectors';
import { seekTo } from './track-position';
import { AudioPart, EditionId, PlayerState } from '../../types';
import { canDownloadNow } from '../network';
import Editions from '../../lib/Editions';
import { AudioPartEntity } from '../../lib/models';

export interface PlaybackState {
  editionId: EditionId | null;
  state: PlayerState;
}

export const initialState: PlaybackState = {
  editionId: null,
  state: `STOPPED`,
};

const playback = createSlice({
  name: `playback`,
  initialState,
  reducers: {
    set: (state, action: PayloadAction<PlaybackState>) => {
      return action.payload;
    },
    setState: (state, action: PayloadAction<PlaybackState['state']>) => {
      state.state = action.payload;
    },
  },
});

export const { setState, set } = playback.actions;
export default playback.reducer;

export const skipNext = (): Thunk => async (dispatch, getState) => {
  skip(true, dispatch, getState());
};

export const skipBack = (): Thunk => async (dispatch, getState) => {
  skip(false, dispatch, getState());
};

async function skip(forward: boolean, dispatch: Dispatch, state: State): Promise<void> {
  const current = select.currentlyPlayingPart(state);
  if (!current) return;
  const [part, edition] = current;
  const nextIndex = part.index + (forward ? 1 : -1);
  const next = edition.audio?.parts[nextIndex];
  if (!next) return;
  dispatch(setActivePart({ editionId: edition.id, partIndex: next.index }));
  Service.audioPause();
  dispatch(setState(`PAUSED`));
  const file = select.audioPartFile(edition.id, next.index, state);
  if (!isDownloaded(file)) {
    // typings are incorrect here, this actually DOES return a promise
    await dispatch(downloadAudio(edition.id, next.index));
  }
  forward ? Service.audioSkipNext() : Service.audioSkipBack();
  if (Platform.OS === `android`) {
    Service.audioResume();
  }
  dispatch(setState(`PLAYING`));
}

export const resume = (): Thunk => async (dispatch) => {
  Service.audioResume();
  dispatch(setState(`PLAYING`));
};

export const play = (editionId: EditionId, partIndex: number): Thunk => async (
  dispatch,
  getState,
) => {
  const queue = select.trackQueue(editionId, getState());
  if (queue) {
    dispatch(setLastAudiobookEditionId(editionId));
    dispatch(setActivePart({ editionId, partIndex }));
    dispatch(set({ editionId, state: `PLAYING` }));
    const trackId = new AudioPartEntity(editionId, partIndex).trackId;
    return Service.audioPlayTrack(trackId, queue);
  }
  return Promise.resolve();
};

export const pause = (): Thunk => async (dispatch) => {
  Service.audioPause();
  dispatch(setState(`PAUSED`));
};

export const togglePartPlayback = (
  editionId: EditionId,
  partIndex: number,
): Thunk => async (dispatch, getState) => {
  const found = Editions.getAudioPart(editionId, partIndex);
  if (!found) return;
  execTogglePartPlayback(editionId, found[0], dispatch, getState());
};

export const togglePlayback = (editionId: EditionId): Thunk => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const found = select.activeAudioPart(editionId, state);
  if (!found) return;
  const [part] = found;
  execTogglePartPlayback(editionId, part, dispatch, state);
};

async function execTogglePartPlayback(
  editionId: EditionId,
  part: AudioPart,
  dispatch: Dispatch,
  state: State,
): Promise<void> {
  dispatch(setLastAudiobookEditionId(editionId));
  const file = select.audioPartFile(editionId, part.index, state);

  if (!isDownloaded(file)) {
    if (!canDownloadNow(state, dispatch)) {
      return;
    }
    // typings are incorrect here, this actually DOES return a promise
    await dispatch(downloadAudio(editionId, part.index));
  }

  if (select.isAudioPartPlaying(editionId, part.index, state)) {
    dispatch(pause());
    return;
  }

  const position = select.trackPosition(editionId, part.index, state);
  if (select.isAudioPartPaused(editionId, part.index, state)) {
    dispatch(seekTo(editionId, part.index, position));
    dispatch(resume());
    return;
  }

  await dispatch(play(editionId, part.index));
  dispatch(seekTo(editionId, part.index, position));
}

/**
 * When a track ends, RNTP will proceed to the next track queued
 * if there is one. The only way we can know this, is by the
 * `playback-track-changed` event, which also fires at other times
 * when the queue is not auto-advancing. This function determines
 * which changes were caused by queue auto-advancing, and therefore
 * which ones we need to opt in to updating our state with.
 */
export const maybeAdvanceQueue = (nextTrackId: string): Thunk => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const current = select.currentlyPlayingPart(state);
  if (!current) return;
  const [part, resource] = current;
  const currentPartId = new AudioPartEntity(resource.id, part.index).trackId;
  if (currentPartId === nextTrackId) {
    // we already know we're playing this track
    return;
  }

  const nextIndex = part.index + 1;
  if (nextIndex === resource.audio!.parts.length) {
    // we just finished the last track, clear the 'last playing' state
    dispatch(setLastAudiobookEditionId(undefined));
    // pause, for good measure, don't leave a weird state
    dispatch(pause());
    return;
  }

  // should be redundant/unecessary
  if (!resource.audio!.parts[nextIndex]) return;

  const nextPartId = new AudioPartEntity(resource.id, nextIndex).trackId;
  if (nextPartId !== nextTrackId) {
    return;
  }

  const file = select.audioPartFile(resource.id, nextIndex, state);
  if (!state.network.connected && !isDownloaded(file)) {
    // we can't go to the next track, because we don't have the track or internet
    dispatch(pause());
    return;
  }

  dispatch(setActivePart({ editionId: resource.id, partIndex: nextIndex }));
};
