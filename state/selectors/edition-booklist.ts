import { State } from '../';
import { BookListItem, EditionResource } from '../../types';
import { isNew, sortable } from './audio-booklist';
import Editions from '../../lib/Editions';

export default function selectAudioBooklist({
  ebook,
  preferences,
  dimensions,
}: State): { headerHeight: number; resources: BookListItem[] } {
  const query = preferences.ebookSearchQuery.toLowerCase();
  const sort = preferences.sortEbooksBy;
  const headerHeight = dimensions.editionSortHeaderHeight;

  const resources: BookListItem[] = Editions.getEditions()
    .filter((edition) => {
      if (!edition.isMostModernized) {
        return false;
      }

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
          if (a.friend.nameSort === b.friend.nameSort) return 0;
          return a.friend.nameSort > b.friend.nameSort ? 1 : -1;
        }
        case `title`:
          return sortable(a.document.title) < sortable(b.document.title) ? -1 : 1;
        case `duration`:
          return a.ebook.numPages < b.ebook.numPages ? -1 : 1;
        default:
          return Number(new Date(a.publishedDate)) > Number(new Date(b.publishedDate))
            ? -1
            : 1;
      }
    })
    .map((edition) => {
      const progress = (ebook.position[edition.id] ?? 0) * 100;
      return {
        editionId: edition.id,
        title: edition.document.utf8ShortTitle,
        navigateTo: `Ebook` as const,
        duration: `${edition.ebook.numPages} pages`,
        progress,
        isNew: isNew(edition.publishedDate, progress),
        name: edition.friend.name,
        nameDisplay: sort === `author` ? edition.friend.nameSort : edition.friend.name,
      };
    });

  return {
    resources,
    headerHeight,
  };
}
