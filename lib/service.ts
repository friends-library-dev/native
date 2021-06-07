import { Html } from '@friends-library/types';
import { EbookData, EditionResource, TrackData } from '../types';
import FS from './fs';
import Player from './player';
import { LANG } from '../env';
import { FsPath, EbookCss, EbookEntity, EbookRevisionEntity } from './models';

export default class Service {
  public static audioSeekTo(position: number): Promise<void> {
    return Player.seekTo(position);
  }

  public static audioSkipBack(): Promise<void> {
    return Player.skipBack();
  }

  public static audioSkipNext(): Promise<void> {
    return Player.skipNext();
  }

  public static audioResume(): Promise<void> {
    return Player.resume();
  }

  public static audioPlayTrack(trackId: string, tracks: TrackData[]): Promise<void> {
    return Player.playPart(trackId, tracks);
  }

  public static audioPause(): Promise<void> {
    return Player.pause();
  }

  public static fsDeleteAllAudios(): Promise<void> {
    return FS.deleteAllAudios();
  }

  public static fsBatchDelete(paths: FsPath[]): Promise<void> {
    return FS.batchDelete(paths);
  }

  public static async fsDownloadFile(
    path: FsPath,
    networkUrl: string,
  ): Promise<number | null> {
    return FS.download(path, networkUrl);
  }

  public static async fsEbookCss(): Promise<string | null> {
    return FS.readFile(new EbookCss());
  }

  public static async fsEbookData(editionId: string): Promise<EbookData | null> {
    const entity = new EbookEntity(editionId);
    const file = FS.filesWithPrefix(entity)[0];
    if (!file) {
      return null;
    }

    const innerHtml = await FS.readFile(file.path, `utf8`);
    if (!innerHtml) {
      return null;
    }

    const sha = EbookRevisionEntity.extractRevisionFromFilename(file.filename);
    return { sha, innerHtml };
  }

  public static EBOOK_CSS_NETWORK_URL = `https://flp-assets.nyc3.digitaloceanspaces.com/static/app-ebook.css`;

  public static async downloadLatestEbookCss(): Promise<void> {
    const destPath = new EbookCss();
    const tempPath = { fsPath: `${destPath}.temp.css` };
    if (!(await FS.download(tempPath, Service.EBOOK_CSS_NETWORK_URL))) {
      return;
    }
    await FS.delete(destPath);
    await FS.moveFile(tempPath, destPath);
  }

  public static async downloadLatestEbookHtml(
    edition: Pick<
      EditionResource,
      'ebookHtmlLoggedDownloadUrl' | 'ebookHtmlDirectDownloadUrl' | 'revision' | 'id'
    >,
  ): Promise<Html | null> {
    const entity = new EbookRevisionEntity(edition.id, edition.revision);
    // @TODO switch to logged
    if (!(await FS.download(entity, edition.ebookHtmlDirectDownloadUrl))) {
      return null;
    }

    const newHtml = FS.readFile(entity);

    // if we've got good, new fresh data, clean out any old stuff
    if (newHtml) {
      const toDelete = FS.filesWithPrefix(entity)
        .filter((f) => !f.filename.endsWith(entity.revisionFilenameSuffix))
        .map((f) => f.path);
      await FS.deleteMany(toDelete);
      return newHtml;
    }

    return null;
  }

  public static async networkFetchEditions(): Promise<any> {
    try {
      // @TODO fake url
      const res = await fetch(`http://10.0.1.251:8888/app-editions/v1/${LANG}`);
      return await res.json();
    } catch (err) {
      // ¯\_(ツ)_/¯
    }
  }
}
