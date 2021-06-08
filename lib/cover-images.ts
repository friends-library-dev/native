import { EditionId } from '../types';
import { SquareCoverImageEntity, FsPath, ThreeDCoverImageEntity } from './models';
import FS from './fs';
import Editions from './Editions';

export function coverImage(
  type: 'square' | 'threeD',
  editionId: EditionId,
  layoutSize: number,
): {
  entity: FsPath;
  uri: string;
  networkUrl: string;
  downloaded: boolean;
} | null {
  const edition = Editions.get(editionId);
  if (!edition) {
    return null;
  }

  const entity =
    type === `square`
      ? SquareCoverImageEntity.fromLayoutWidth(editionId, layoutSize)
      : ThreeDCoverImageEntity.fromLayoutWidth(editionId, layoutSize);

  const networkUrl =
    type === `square`
      ? edition.images.square.find((i) => i.width === entity.size)?.url
      : edition.images.threeD.find((i) => i.width === entity.size)?.url;

  if (!networkUrl) {
    return null;
  }

  let uri = networkUrl;
  let downloaded = false;
  if (FS.hasFile(entity)) {
    uri = FS.url(entity);
    downloaded = true;
  }

  return { entity, uri, networkUrl, downloaded };
}
