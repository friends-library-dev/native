import { combineReducers } from '@reduxjs/toolkit';
import audio from './audio/audio-root-reducer';
import filesystem from './filesystem';
import preferences from './preferences';
import network from './network';

const rootReducer = combineReducers({
  version: (): number => 2,
  audio,
  filesystem,
  preferences,
  network,
});

export type State = ReturnType<typeof rootReducer>;

export default rootReducer;
