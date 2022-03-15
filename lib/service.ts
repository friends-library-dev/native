import { Result } from 'x-ts-utils';
import { InteractionManager } from 'react-native';
import { EbookData, TrackData } from '../types';
import FS from './fs';
import Player from './player';
import { API_URL, LANG } from '../env';
import { FsPath, EbookCss, EbookEntity } from './models';

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

  public static async fsEbookData(entity: EbookEntity): Promise<EbookData | null> {
    const file = await FS.md5File(entity);
    if (!file) {
      return null;
    }

    return { md5: file.md5, innerHtml: file.contents };
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
    entity: EbookEntity,
    networkUrl: string,
  ): Promise<string | null> {
    if (!(await FS.download(entity, networkUrl))) {
      return null;
    }

    return FS.readFile(entity);
  }

  public static async networkFetchEditions(): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/app-editions/v1/${LANG}`);
      return await res.json();
    } catch (err) {
      // ¯\_(ツ)_/¯
    }
  }

  public static async shouldDownloadCurrentNetworkFile(
    file: FsPath,
    networkUrl: string,
    knownLocalMd5?: string,
  ): Promise<Result<boolean>> {
    // if we don't have a local copy to compare, we need to download
    if (!FS.hasFile(file)) {
      return {
        success: true,
        value: true,
      };
    }

    const getRemoteMd5Promise = fetch(networkUrl, { method: `HEAD` })
      .then((res) => res.headers.get(`etag`)?.replace(/"/g, ``) ?? null)
      .catch(() => null);

    const [localMd5, remoteMd5] = await Promise.all([
      knownLocalMd5
        ? Promise.resolve(knownLocalMd5)
        : FS.md5File(file).then((data) => data?.md5 ?? null),
      getRemoteMd5Promise,
    ]);

    if (!localMd5) {
      return {
        success: false,
        error: `unable to determine md5 of local file`,
      };
    }

    if (!remoteMd5) {
      return {
        success: false,
        error: `unable to determine md5 of remote file`,
      };
    }

    return {
      success: true,
      value: localMd5 !== remoteMd5,
    };
  }

  public static async refreshNetworkFileIfChanged(
    priority: 'immediate' | 'background',
    file: FsPath,
    networkUrl: string,
    knownLocalMd5?: string,
  ): Promise<void> {
    const now = Date.now();
    const lastChecked = networkFileCheckCache[file.fsPath];
    networkFileCheckCache[file.fsPath] = now;
    if (lastChecked && now - lastChecked < ONE_HOUR_MS) {
      return;
    }

    const refreshIfChanged: () => Promise<void> = async () => {
      const didChangeCheck = await Service.shouldDownloadCurrentNetworkFile(
        file,
        networkUrl,
        knownLocalMd5,
      );
      if (didChangeCheck.success && didChangeCheck.value === true) {
        Service.fsDownloadFile(file, networkUrl);
      }
    };

    if (priority === `background`) {
      return new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          refreshIfChanged().then(resolve);
        });
      });
    } else {
      return refreshIfChanged();
    }
  }
}

const networkFileCheckCache: Record<string, number> = {};
const ONE_HOUR_MS = 60 * 60 * 1000;
