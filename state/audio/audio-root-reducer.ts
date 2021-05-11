import { combineReducers } from '@reduxjs/toolkit';
import resources, { initialState as resourcesInit } from './resources';
import playback, { initialState as playbackInit } from './playback';
import trackPosition, { initialState as trackPositionInit } from './track-position';
import activePart, { initialState as activePartInit } from './active-part';

const audioRootReducer = combineReducers({
  resources,
  playback,
  trackPosition,
  activePart,
});

export type AudioState = ReturnType<typeof audioRootReducer>;

export const initialState: AudioState = {
  resources: resourcesInit,
  playback: playbackInit,
  trackPosition: trackPositionInit,
  activePart: activePartInit,
};

export default audioRootReducer;
