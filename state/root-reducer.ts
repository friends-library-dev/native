import { combineReducers } from '@reduxjs/toolkit';
import audio from './audio/audio-root-reducer';
import ebook from './ebook/ebook-root-reducer';
import preferences from './preferences';
import network from './network';
import ephemeral from './ephemeral';
import dimensions from './dimensions';
import resume from './resume';

const rootReducer = combineReducers({
  version: (): number => 3,
  audio,
  ebook,
  preferences,
  network,
  ephemeral,
  dimensions,
  resume,
});

export type State = ReturnType<typeof rootReducer>;

export default rootReducer;
