import { Html } from '@friends-library/types';
import { EbookData, EditionResource, TrackData } from '../types';
import FS from './fs';
import Player from './player';
import { LANG } from '../env';
import { EbookCss, EbookEntity, EbookRevisionEntity } from './models';

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

  public static fsBatchDelete(paths: string[]): Promise<void> {
    return FS.batchDelete(paths);
  }

  public static async fsDownloadFile(
    relPath: string,
    networkUrl: string,
  ): Promise<number | null> {
    return FS.download(relPath, networkUrl);
  }

  public static async fsEbookCss(): Promise<string | null> {
    return FS.readFile(new EbookCss().fsPath);
  }

  public static async fsEbookData(editionId: string): Promise<EbookData | null> {
    const entity = new EbookEntity(editionId);
    const file = FS.filesWithPrefix(entity.fsPathPrefix)[0];
    if (!file) {
      return null;
    }

    const innerHtml = await FS.readFile(file.relPath, `utf8`);
    if (!innerHtml) {
      return null;
    }

    const sha = EbookRevisionEntity.extractRevisionFromFilename(file.filename);
    return { sha, innerHtml };
  }

  public static EBOOK_CSS_NETWORK_URL = `https://flp-assets.nyc3.digitaloceanspaces.com/static/app-ebook.css`;

  public static async downloadLatestEbookCss(): Promise<void> {
    const destPath = new EbookCss().fsPath;
    const tempPath = `${destPath}.temp.css`;
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
    const relPath = entity.fsPath;
    // @TODO switch to logged
    if (!(await FS.download(relPath, edition.ebookHtmlDirectDownloadUrl))) {
      return null;
    }

    const newHtml = FS.readFile(relPath);

    // if we've got good, new fresh data, clean out any old stuff
    if (newHtml) {
      const toDelete = FS.filesWithPrefix(entity.fsPathPrefix)
        .filter((f) => !f.filename.endsWith(entity.revisionFilenameSuffix))
        .map((f) => f.relPath);
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
