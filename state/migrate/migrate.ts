import omit from 'lodash.omit';
import { State, INITIAL_STATE as INIT } from '../';

export default function migrate(input: unknown): State {
  if (!input || typeof input !== `object` || Array.isArray(input)) {
    return { ...INIT };
  }

  const state = input as Record<string, any>;
  if (state.version === 3) {
    return state as State;
  }

  if (state.version === 2) {
    return migrate2to3(state);
  }
  return migrate2to3(migrate1to2(state));
}

function migrate2to3(v2: Record<string, any>): State {
  const v3 = { ...v2 };
  v3.version = 3;
  if (v3.preferences) {
    v3.preferences.ebookJustify = INIT.preferences.ebookJustify;
  } else {
    v3.preferences = INIT.preferences;
  }
  return v3 as State;
}

function migrate1to2(v1: Record<string, any>): State {
  const migrated = {
    version: 2,

    audio: {
      // .playback -> .audio.playback
      playback: v1.playback,

      // .activePart -> .audio.activePart
      activePart: v1.activePart,

      // .trackPosition -> .audio.trackPosition
      trackPosition: v1.trackPosition,

      filesystem: {
        ...INIT.audio.filesystem,
      },
    },

    ebook: {
      ...INIT.ebook,
    },

    ephemeral: {
      ...INIT.ephemeral,
    },

    resume: {
      ...INIT.resume,
    },

    network: {
      ...INIT.network,
    },

    dimensions: {
      ...INIT.dimensions,
      audioSortHeaderHeight: v1.preferences.audioSortHeaderHeight,
    },

    preferences: {
      ...omit(v1.preferences ?? {}, [`searchQuery`, `audioSortHeaderHeight`]),
      audioSearchQuery: v1.preferences?.searchQuery ?? ``,
      sortEbooksBy: INIT.preferences.sortEbooksBy,
      ebookColorScheme: INIT.preferences.ebookColorScheme,
      ebookFontSize: INIT.preferences.ebookFontSize,
      ebookSearchQuery: INIT.preferences.ebookSearchQuery,
      ebookJustify: INIT.preferences.ebookJustify,
    },

    ...omit(v1, [
      `audioResources`,
      `preferences`,
      `playback`,
      `activePart`,
      `trackPosition`,
      `filesystem`,
    ]),
  } as State;

  return migrated;
}
