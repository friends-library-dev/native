import { EditionType } from '@friends-library/types';
import { State } from '..';
import { DocumentEntityInterface } from '../../lib/models';
import Editions from '../../lib/Editions';

export function documentSelectedEdition(
  document: DocumentEntityInterface,
  state: State,
): EditionType | null {
  const fromState = state.ebook.selectedEdition[document.documentId];
  if (fromState) {
    return fromState;
  }

  const editions = Editions.getDocumentEditions(document);
  const mostModernized = editions.filter((e) => e.isMostModernized)[0];
  return mostModernized?.type ?? editions.shift()?.type ?? null;
}
