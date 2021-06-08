import { Audio } from '@friends-library/friends';
import { State } from '../';
import { BookListItem } from '../../types';
import Editions from '../../lib/Editions';
import * as select from './audio-selectors';
import { LANG } from '../../env';

export default function selectAudioBooklist(
  state: State,
): { headerHeight: number; resources: BookListItem[] } {
  const query = state.preferences.audioSearchQuery.toLowerCase().trim();
  const sort = state.preferences.sortAudiosBy;
  const headerHeight = state.dimensions.audioSortHeaderHeight;

  const resources: BookListItem[] = Editions.getAllAudios()
    .map(([audio, edition]) => ({ ...audio, edition }))
    .filter(({ edition }) => {
      if (query.length < 1) {
        return true;
      }
      return (
        edition.friend.name.toLowerCase().includes(query) ||
        edition.document.title.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case `author`: {
          if (a.edition.friend.nameSort === b.edition.friend.nameSort) return 0;
          return a.edition.friend.nameSort > b.edition.friend.nameSort ? 1 : -1;
        }
        case `title`:
          return sortable(a.edition.document.title) < sortable(b.edition.document.title)
            ? -1
            : 1;
        case `duration`:
          return a.totalDuration < b.totalDuration ? -1 : 1;
        default:
          return Number(new Date(a.publishedDate)) > Number(new Date(b.publishedDate))
            ? -1
            : 1;
      }
    })
    .map((audio) => {
      const progress = select.progress(audio.edition.id, state);
      return {
        editionId: audio.edition.id,
        title: audio.edition.document.utf8ShortTitle,
        navigateTo: `Listen` as const,
        duration: Audio.humanDuration(
          audio.parts.map((p) => p.duration),
          `abbrev`,
          LANG,
        ),
        progress,
        isNew: isNew(audio.publishedDate, progress),
        name: audio.edition.friend.name,
        // @TODO, check this, had a `.replace(/, *$/, ``)`
        nameDisplay:
          sort === `author` ? audio.edition.friend.nameSort : audio.edition.friend.name,
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
