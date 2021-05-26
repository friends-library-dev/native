import { AudioResource, EbookData, EditionResource, TrackData } from '../types';
import FS from './fs';
import Player from './player';
import * as keys from './keys';
import { LANG } from '../env';
import { Html } from '@friends-library/types';

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
    return FS.readFile(keys.ebookCssFilepath());
  }

  public static async fsEbookData(editionId: string): Promise<EbookData | null> {
    const file = FS.filesWithPrefix(keys.ebookHtmlFilepathPrefix(editionId))[0];
    if (!file) {
      return null;
    }

    const sha =
      file.filename
        .replace(/\.html$/, ``)
        .split(`--`)
        .pop() || ``;

    const innerHtml = await FS.readFile(file.relPath, `utf8`);
    if (!innerHtml) {
      return null;
    }

    return { sha, innerHtml };
  }

  public static EBOOK_CSS_NETWORK_URL = `https://flp-assets.nyc3.digitaloceanspaces.com/static/app-ebook.css`;

  public static async downloadLatestEbookCss(): Promise<void> {
    const destPath = keys.ebookCssFilepath();
    const tempPath = `${destPath}.temp.css`;
    if (!(await FS.download(tempPath, Service.EBOOK_CSS_NETWORK_URL))) {
      return;
    }
    await FS.delete(destPath);
    await FS.moveFile(tempPath, destPath);
  }

  public static async downloadLatestEbookHtml(
    edition: Pick<EditionResource, 'url' | 'revision' | 'id'>,
  ): Promise<Html | null> {
    const relPath = keys.ebookRevisionHtmlFilepath(edition.id, edition.revision);
    if (!(await FS.download(relPath, edition.url))) {
      return null;
    }

    const newHtml = FS.readFile(relPath);

    // if we've got good, new fresh data, clean out any old stuff
    if (newHtml) {
      const toDelete = FS.filesWithPrefix(keys.ebookHtmlFilepathPrefix(edition.id))
        .filter((f) => !f.filename.endsWith(`${edition.revision}.html`))
        .map((f) => f.relPath);
      await FS.deleteMany(toDelete);
      return newHtml;
    }

    return null;
  }

  public static async networkFetchAudios(): Promise<AudioResource[] | null> {
    try {
      const res = await fetch(`https://api.friendslibrary.com/app-audios/v1/${LANG}`);
      const resources = await res.json();
      if (audioResourcesValid(resources)) {
        return resources;
      }
    } catch (err) {
      // ¯\_(ツ)_/¯
    }
    return null;
  }

  public static async networkFetchEditions(): Promise<EditionResource[] | null> {
    try {
      const res = await fetch(`http://10.0.1.251:8888/app-editions/v1/${LANG}`);
      const resources = await res.json();
      if (editionResourcesValid(resources)) {
        return resources;
      }
    } catch (err) {
      // ¯\_(ツ)_/¯
    }
    return null;
  }
}

function audioResourcesValid(resources: any): resources is AudioResource[] {
  return (
    Array.isArray(resources) &&
    resources.every((r) => {
      return typeof r.artwork === `string` && Array.isArray(r.parts);
    })
  );
}

function editionResourcesValid(resources: any): resources is EditionResource[] {
  return (
    Array.isArray(resources) &&
    resources.every((r) => {
      return (
        typeof r.squareCoverImageUrl === `string` &&
        Array.isArray(r.chapters) &&
        r.chapters.every((ch: any) => typeof ch?.shortTitle === `string`)
      );
    })
  );
}
