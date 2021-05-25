import { EbookData, EditionResource } from 'types';
import { State } from '../';
import Service from '../../lib/service';

export function editionResource(editionId: string, state: State): EditionResource | null {
  return state.editions.resources[editionId] || null;
}

export function ebookPosition(editionId: string, state: State): number {
  return state.editions.ebookPosition[editionId] || 0;
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
