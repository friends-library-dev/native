import { Platform } from 'react-native';
import { configureStore, getDefaultMiddleware, Store, AnyAction } from '@reduxjs/toolkit';
import SplashScreen from 'react-native-splash-screen';
import throttle from 'lodash.throttle';
import merge from 'lodash.merge';
import rootReducer from './rootReducer';
import FS from '../lib/fs';
import Player from '../lib/player';
import { INITIAL_STATE, State } from './';
import { batchSet as batchSetFilesystem } from './filesystem';
import { fetchAudios } from './audio-resources';

export default async function getStore(): Promise<Store<any, AnyAction>> {
  Player.init();
  await FS.init();

  let savedState: Partial<State> = {};
  if (FS.hasFile(`data/state.json`)) {
    savedState = await FS.readJson(`data/state.json`);
  }

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: merge({}, INITIAL_STATE, savedState),
    middleware: getDefaultMiddleware({
      serializableCheck:
        Platform.OS === `ios` ? { warnAfter: 100, ignoredPaths: [`audios`] } : false,
      immutableCheck: Platform.OS === `ios` ? { warnAfter: 100 } : false,
    }),
    devTools: Platform.OS === `ios`,
  });

  // eslint-disable-next-line require-atomic-updates
  Player.dispatch = store.dispatch;

  store.dispatch(
    batchSetFilesystem(
      Object.keys(FS.manifest).reduce((acc, path) => {
        const storedBytes = FS.manifest[path];
        if (typeof storedBytes === `number`) {
          acc[path] = {
            totalBytes: storedBytes,
            bytesOnDisk: storedBytes,
          };
        }
        return acc;
      }, {} as State['filesystem']),
    ),
  );

  store.dispatch(fetchAudios());

  store.subscribe(
    throttle(
      () => {
        const state = store.getState();
        const saveState: State = {
          audioResources: state.audioResources,
          preferences: {
            ...state.preferences,
            searchQuery: ``,
          },
          trackPosition: state.trackPosition,
          network: INITIAL_STATE.network,
          filesystem: {},
          playback: { ...state.playback, state: `STOPPED` },
          activePart: state.activePart,
        };
        FS.writeFile(`data/state.json`, JSON.stringify(saveState));
      },
      5000,
      { leading: false, trailing: true },
    ),
  );

  SplashScreen.hide();

  return store;
}
