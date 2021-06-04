import { combineReducers } from '@reduxjs/toolkit';
import playback, { initialState as playbackInit } from './playback';
import trackPosition, { initialState as trackPositionInit } from './track-position';
import activePart, { initialState as activePartInit } from './active-part';
import filesystem, { initialState as filesystemInit } from './filesystem';

const audioRootReducer = combineReducers({
  playback,
  trackPosition,
  activePart,
  filesystem,
});

export type AudioState = ReturnType<typeof audioRootReducer>;

export const initialState: AudioState = {
  playback: playbackInit,
  trackPosition: trackPositionInit,
  activePart: activePartInit,
  filesystem: filesystemInit,
};

export default audioRootReducer;
