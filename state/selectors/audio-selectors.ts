import { isNotNull } from 'x-ts-utils';
import { t } from '@friends-library/locale';
import { State } from '..';
import FS from '../../lib/fs';
import { TrackData, EditionResource, AudioPart, EditionId, Audio } from '../../types';
import { FileState } from '../audio/filesystem';
import { backgroundPartTitle } from '../../lib/utils';
import { AudioPartEntity, AudioPartQualityEntity } from '../../lib/models';
import Editions from '../../lib/Editions';
import { coverImage } from '../../lib/cover-images';

export function isAudioPartPlaying(
  editionId: EditionId,
  partIndex: number,
  state: State,
): boolean {
  return (
    isAudioPlaying(editionId, state) && isAudioPartActive(editionId, partIndex, state)
  );
}
export function isAudioPartPaused(
  editionId: EditionId,
  partIndex: number,
  state: State,
): boolean {
  return (
    isAudioPaused(editionId, state) && isAudioPartActive(editionId, partIndex, state)
  );
}

export function isAudioPartActive(
  editionId: EditionId,
  partIndex: number,
  state: State,
): boolean {
  return partIndex === audioActivePartIndex(editionId, state);
}

export function trackPosition(
  editionId: EditionId,
  partIndex: number,
  state: State,
): number {
  const key = new AudioPartEntity(editionId, partIndex).stateKey;
  return state.audio.trackPosition[key] ?? 0;
}

export function currentlyPlayingPart(
  state: State,
): null | [AudioPart, EditionResource, Audio] {
  const editionId = state.audio.playback.editionId;
  if (!editionId) return null;
  return activeAudioPart(editionId, state);
}

export function activeAudioPart(
  editionId: EditionId,
  state: State,
): null | [AudioPart, EditionResource, Audio] {
  return Editions.getAudioPart(editionId, audioActivePartIndex(editionId, state));
}

export function isAudioPaused(editionId: EditionId, state: State): boolean {
  return isAudioSelected(editionId, state) && state.audio.playback.state === `PAUSED`;
}

export function isAudioPlaying(editionId: EditionId, state: State): boolean {
  return isAudioSelected(editionId, state) && state.audio.playback.state === `PLAYING`;
}

export function isAudioSelected(editionId: EditionId, state: State): boolean {
  return state.audio.playback.editionId === editionId;
}

export function audioActivePartIndex(editionId: EditionId, state: State): number {
  return state.audio.activePart[editionId] ?? 0;
}

export function audioFiles(editionId: EditionId, state: State): null | FileState[] {
  const audio = Editions.getAudio(editionId);
  if (!audio) return null;
  return audio.parts.map((_, index) => audioPartFile(editionId, index, state));
}

export function audioPartFile(
  editionId: EditionId,
  partIndex: number,
  state: State,
): FileState {
  const quality = state.preferences.audioQuality;
  const audioEntity = new AudioPartQualityEntity(editionId, partIndex, quality);
  return (
    state.audio.filesystem[audioEntity.stateKey] ?? {
      totalBytes: Editions.getAudioPartFilesize(editionId, partIndex, quality) ?? 10000,
      bytesOnDisk: 0,
    }
  );
}

export function trackQueue(editionId: EditionId, state: State): null | TrackData[] {
  const audio = Editions.getAudio(editionId);
  if (!audio) return null;
  const tracks = audio.parts
    .map((part) => trackData(editionId, part.index, state))
    .filter(isNotNull);
  return tracks.length > 0 ? tracks : null;
}

export function trackData(
  editionId: EditionId,
  partIndex: number,
  state: State,
): TrackData | null {
  const quality = state.preferences.audioQuality;
  const entity = new AudioPartQualityEntity(editionId, partIndex, quality);
  const found = Editions.getAudioPart(editionId, partIndex);
  const image = coverImage(`square`, editionId, Infinity);
  if (!found || !image) return null;
  const [part, resource] = found;
  const shortTitle = part.utf8ShortTitle;
  return {
    id: entity.trackId,
    filepath: `file://${FS.abspath(entity.fsPath)}`,
    title: backgroundPartTitle(part.title, shortTitle),
    artist: resource.friend.isCompilations ? shortTitle : resource.friend.name,
    album: resource.friend.isCompilations ? t`Friends Library` : resource.friend.name,
    artworkUrl: image.uri,
    duration: part.duration,
  };
}

export function progress(editionId: EditionId, state: State): number {
  const active = activeAudioPart(editionId, state);
  if (!active) return 0;
  const [activePart, resource] = active;
  const position = trackPosition(editionId, activePart.index, state);
  if (!resource.audio || (activePart.index === 0 && position === 0)) {
    return 0;
  }

  let listened = 0;
  resource.audio.parts.forEach((part) => {
    if (part.index < activePart.index) {
      listened += part.duration;
    } else if (part.index === activePart.index) {
      listened += position;
    }
  });

  return Math.floor((listened / resource.audio.totalDuration) * 100);
}
