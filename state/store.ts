import { Platform } from 'react-native';
import { configureStore, getDefaultMiddleware, Store, AnyAction } from '@reduxjs/toolkit';
import SplashScreen from 'react-native-splash-screen';
import throttle from 'lodash.throttle';
import merge from 'lodash.merge';
import rootReducer from './root-reducer';
import FS from '../lib/fs';
import Player from '../lib/player';
import { INITIAL_STATE, State } from './';
import { batchSet as batchSetFilesystem } from './filesystem';
import migrate from './migrate/migrate';

export default async function getStore(): Promise<Store<any, AnyAction>> {
  Player.init();
  await FS.init();

  let savedState: Partial<State> = {};
  if (FS.hasFile(FS.paths.state)) {
    savedState = await FS.readJson(FS.paths.state);
    savedState = migrate(savedState);
  }

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: merge({}, INITIAL_STATE, savedState),
    middleware: getDefaultMiddleware({
      serializableCheck:
        Platform.OS === `ios` ? { warnAfter: 100, ignoredPaths: [`audios`] } : false,
      immutableCheck: Platform.OS === `ios` ? { warnAfter: 200 } : false,
    }),
    devTools: Platform.OS === `ios`,
  });

  // eslint-disable-next-line require-atomic-updates
  Player.dispatch = store.dispatch;

  store.subscribe(
    throttle(
      () => {
        const state = store.getState();
        const saveState: State = {
          version: state.version,
          audio: {
            ...state.audio,
            playback: {
              ...state.audio.playback,
              state: `STOPPED`,
            },
          },
          editions: state.editions,
          preferences: {
            ...state.preferences,
            audioSearchQuery: ``,
          },
          network: INITIAL_STATE.network,
          ephemeral: INITIAL_STATE.ephemeral,
          filesystem: {},
        };
        FS.writeFile(FS.paths.state, JSON.stringify(saveState));
      },
      5000,
      { leading: false, trailing: true },
    ),
  );

  SplashScreen.hide();

  return store;
}
