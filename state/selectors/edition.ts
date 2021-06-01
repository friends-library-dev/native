import { isDefined } from 'x-ts-utils';
import { EbookData, EditionResource } from '../../types';
import { State } from '../';
import Service from '../../lib/service';
import { DocumentEntityInterface } from '../../lib/models';
import { EditionType } from '@friends-library/types';

export function editionResource(editionId: string, state: State): EditionResource | null {
  return state.editions.resources[editionId] || null;
}

export function ebookPosition(editionId: string, state: State): number {
  return state.editions.ebookPosition[editionId] || 0;
}

export function documentSelectedEdition(
  document: DocumentEntityInterface,
  state: State,
): EditionType | null {
  const fromState = state.editions.ebookSelectedEdition[document.documentId];
  if (fromState) {
    return fromState;
  }

  const editions = documentEditions(document, state);
  const mostModernized = editions.filter((e) => e.isMostModernized)[0];
  return mostModernized?.type ?? null;
}

export function documentEditions(
  document: DocumentEntityInterface,
  state: State,
): EditionResource[] {
  return Object.values(state.editions.resources)
    .filter(isDefined)
    .filter((edition) => edition.id.startsWith(document.documentId));
}

export async function ebookData(
  editionId: string,
  state: State,
): Promise<EbookData | null> {
  const resource = editionResource(editionId, state);
  if (!resource) {
    return null;
  }

  const fsData = await Service.fsEbookData(editionId);
  if (fsData && fsData.sha === resource.revision) {
    return fsData;
  }

  if (!state.network.connected) {
    return fsData;
  }

  const freshHtml = await Service.downloadLatestEbookHtml(resource);
  if (freshHtml) {
    return {
      sha: resource.revision,
      innerHtml: freshHtml,
    };
  }

  return fsData;
}
