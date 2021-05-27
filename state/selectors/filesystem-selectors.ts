import { State } from '../';
import { CoverImageEntity } from '../../lib/models';
import FS from '../../lib/fs';

export function squareCoverImage(
  resourceId: string,
  layoutSize: number,
  state: State,
): {
  entity: CoverImageEntity;
  uri: string;
  networkUrl: string;
  downloaded: boolean;
} | null {
  const resource = state.editions.resources[resourceId];
  if (!resource) {
    console.log(`here? ${resourceId}`);
    return null;
  }

  const entity = CoverImageEntity.fromLayoutSize(resourceId, layoutSize);
  const networkUrl = resource.images.find((i) => i.size === entity.size)?.url;
  if (!networkUrl) {
    return null;
  }

  let uri = networkUrl;
  let downloaded = false;
  if (entity.fsPath in state.filesystem) {
    uri = `file://${FS.abspath(entity.fsPath)}`;
    downloaded = true;
  }

  return { entity, uri, networkUrl, downloaded };
}
