/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Audio } from '@friends-library/friends';
import { State } from '../';
import { BookListItem, AudioResource } from '../../types';
import * as select from './audio-selectors';
import { LANG } from '../../env';

export default function selectAudioBooklist(
  state: State,
): { headerHeight: number; resources: BookListItem[] } {
  const query = state.preferences.audioSearchQuery.toLowerCase().trim();
  const sort = state.preferences.sortAudiosBy;
  const headerHeight = state.preferences.audioSortHeaderHeight;

  const resources: BookListItem[] = Object.values(state.audio.resources)
    .filter((audio) => {
      // this is a possibly expensive filter than can get run many times
      // while the user is updating their query, order, etc.
      // so, we do the undefined check here, instead of with a dedicated
      // `.filter(isDefined)`, trading all the `!`s below for some perf
      if (!audio) {
        return false;
      }

      if (query.length < 1) {
        return true;
      }
      return (
        audio.friend.toLowerCase().includes(query) ||
        audio.title.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case `author`: {
          if (a!.friendSort === b!.friendSort) return 0;
          return a!.friendSort > b!.friendSort ? 1 : -1;
        }
        case `title`:
          return sortable(a!.title) < sortable(b!.title) ? -1 : 1;
        case `duration`:
          return totalDuration(a!) < totalDuration(b!) ? -1 : 1;
        default:
          return Number(new Date(a!.date)) > Number(new Date(b!.date)) ? -1 : 1;
      }
    })
    .map((audio) => {
      const progress = select.progress(audio!.id, state);
      return {
        artworkId: audio!.id,
        title: audio!.title,
        navigateTo: `Listen` as const,
        resourceId: audio!.id,
        duration: Audio.humanDuration(
          audio!.parts.map((p) => p.duration),
          `abbrev`,
          LANG,
        ),
        progress,
        isNew: isNew(audio!.date, progress),
        name: audio!.friend,
        nameDisplay:
          sort === `author`
            ? (audio!.friendSort ?? audio!.friend).replace(/, *$/, ``)
            : audio!.friend,
      };
    });
  return { resources, headerHeight };
}

export function isNew(dateStr: string, progress: number): boolean {
  if (progress > 4) {
    return false;
  }
  return Date.now() - Number(new Date(dateStr)) < NEW_MS;
}

// 60 days
const NEW_MS = 1000 * 60 * 60 * 24 * 60;

export function sortable(str: string): string {
  return str.replace(/^(A|The) /, ``);
}

function totalDuration(audio: AudioResource): number {
  return audio.parts.reduce((acc, part) => acc + part.duration, 0);
}
