import { State } from '../';
import { SquareCoverImageEntity, FsPath, ThreeDCoverImageEntity } from '../../lib/models';
import FS from '../../lib/fs';

export function coverImage(
  type: 'square' | 'threeD',
  resourceId: string,
  layoutSize: number,
  state: State,
): {
  entity: FsPath;
  uri: string;
  networkUrl: string;
  downloaded: boolean;
} | null {
  const resource = state.editions.resources[resourceId];
  if (!resource) {
    return null;
  }

  const entity =
    type === `square`
      ? SquareCoverImageEntity.fromLayoutWidth(resourceId, layoutSize)
      : ThreeDCoverImageEntity.fromLayoutWidth(resourceId, layoutSize);

  const networkUrl =
    type === `square`
      ? resource.images.square.find((i) => i.size === entity.size)?.url
      : resource.images.threeD.find((i) => i.width === entity.size)?.url;

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
