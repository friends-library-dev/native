import { AudioResource, EditionResource, TrackData } from '../types';
import FS from './fs';
import Player from './player';
import { LANG } from '../env';

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

  public static fsSaveEditionResources(resources: EditionResource[]): Promise<void> {
    return FS.writeFile(FS.paths.editionResources, JSON.stringify(resources));
  }

  public static fsSaveAudioResources(resources: AudioResource[]): Promise<void> {
    return FS.writeFile(FS.paths.audioResources, JSON.stringify(resources));
  }

  public static async fsDownloadFile(
    relPath: string,
    networkUrl: string,
  ): Promise<number | null> {
    return FS.download(relPath, networkUrl);
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
