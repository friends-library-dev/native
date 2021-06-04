import omit from 'lodash.omit';
import { State, INITIAL_STATE as INIT } from '../';

export default function migrate(input: unknown): State {
  if (!input || typeof input !== `object` || Array.isArray(input)) {
    return { ...INIT };
  }

  const obj = input as Record<string, any>;
  if (obj.version === 2) {
    return obj as State;
  }

  return migrate1to2(obj);
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

      // @TODO add test?
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
    },

    ...omit(v1, [
      `audioResources`,
      `preferences`,
      `playback`,
      `activePart`,
      `trackPosition`,
    ]),
  } as State;

  return migrated;
}
