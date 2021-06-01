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

      // clear out the old resources and re-download fresh
      // no need to write a migration for a perf optimization
      resources: {},
    },

    ephemeral: {
      ...INIT.ephemeral,
    },

    dimensions: {
      ...INIT.dimensions,
      audioSortHeaderHeight: v1.preferences.audioSortHeaderHeight,
    },

    preferences: {
      ...omit(v1.preferences ?? {}, [`searchQuery`, `audioSortHeaderHeight`]),
      audioSearchQuery: v1.preferences?.searchQuery ?? ``,
      sortEditionsBy: INIT.preferences.sortEditionsBy,
      ebookColorScheme: INIT.preferences.ebookColorScheme,
      ebookFontSize: INIT.preferences.ebookFontSize,
      editionSearchQuery: INIT.preferences.editionSearchQuery,
    },

    editions: {
      ...INIT.editions,
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