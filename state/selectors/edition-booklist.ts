/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { State } from '../';
import { BookListItem, EditionResource } from '../../types';
import { isNew, sortable } from './audio-booklist';

export default function selectAudioBooklist({
  preferences,
  editions,
  dimensions,
}: State): { headerHeight: number; resources: BookListItem[] } {
  const query = preferences.editionSearchQuery.toLowerCase();
  const sort = preferences.sortEditionsBy;
  const headerHeight = dimensions.editionSortHeaderHeight;

  const resources: BookListItem[] = Object.values(editions.resources)
    .filter((edition: EditionResource | undefined) => {
      // this is a possibly expensive filter than can get run many times
      // while the user is updating their query, order, etc.
      // so, we do the undefined check here, instead of with a dedicated
      // `.filter(isDefined)`, trading all the `!`s below for some perf
      if (!edition) {
        return false;
      }

      if (!edition.isMostModernized) {
        return false;
      }

      if (query.length < 1) {
        return true;
      }
      return (
        edition.friendName.toLowerCase().includes(query) ||
        edition.documentTitle.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case `author`: {
          if (a!.friendNameSort === b!.friendNameSort) return 0;
          return a!.friendNameSort > b!.friendNameSort ? 1 : -1;
        }
        case `title`:
          return sortable(a!.documentTitle) < sortable(b!.documentTitle) ? -1 : 1;
        case `duration`:
          return a!.numTotalPaperbackPages < b!.numTotalPaperbackPages ? -1 : 1;
        default:
          return Number(new Date(a!.publishedDate)) > Number(new Date(b!.publishedDate))
            ? -1
            : 1;
      }
    })
    .map((edition) => {
      return {
        resourceId: edition!.id,
        artworkId: edition!.id,
        title: edition!.documentTitle,
        navigateTo: `Ebook` as const,
        duration: `${edition!.numTotalPaperbackPages} pages`,
        progress: 0, // TODO
        isNew: isNew(edition!.publishedDate, 0), // TODO `0`
        name: edition!.friendName,
        nameDisplay:
          sort === `author`
            ? edition!.friendNameSort.replace(/, *$/, ``)
            : edition!.friendName,
      };
    });

  return {
    resources,
    headerHeight,
  };
}
