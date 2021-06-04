import { isDefined } from 'x-ts-utils';
import { EditionType } from '@friends-library/types';
import { EbookData, EditionResource, EditionId } from '../../types';
import { State } from '..';
import Service from '../../lib/service';
import { DocumentEntityInterface } from '../../lib/models';
import Editions from '../../lib/Editions';

export function ebookPosition(editionId: EditionId, state: State): number {
  return state.ebook.position[editionId] || 0;
}

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

export async function ebookData(
  editionId: EditionId,
  state: State,
): Promise<EbookData | null> {
  const edition = Editions.get(editionId);
  if (!edition) {
    return null;
  }

  const fsData = await Service.fsEbookData(editionId);
  if (fsData && fsData.sha === edition.revision) {
    return fsData;
  }

  if (!state.network.connected) {
    return fsData;
  }

  const freshHtml = await Service.downloadLatestEbookHtml(edition);
  if (freshHtml) {
    return {
      sha: edition.revision,
      innerHtml: freshHtml,
    };
  }

  return fsData;
}
