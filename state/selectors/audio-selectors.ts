import { isNotNull } from 'x-ts-utils';
import { utf8ShortTitle } from '@friends-library/adoc-utils';
import { State } from '..';
import FS from '../../lib/fs';
import * as keys from '../../lib/keys';
import { TrackData, AudioResource, AudioPart } from '../../types';
import { FileState } from '../filesystem';
import { backgroundPartTitle, totalDuration } from '../../lib/utils';
import { AudioPartEntity } from '../../lib/models';
import { coverImage } from './filesystem-selectors';

export function isAudioPartPlaying(
  audioId: string,
  partIndex: number,
  state: State,
): boolean {
  return (
    isAudioPlaying(audioId, state) && partIndex === audioActivePartIndex(audioId, state)
  );
}
export function isAudioPartPaused(
  audioId: string,
  partIndex: number,
  state: State,
): boolean {
  return (
    isAudioPaused(audioId, state) && partIndex === audioActivePartIndex(audioId, state)
  );
}

export function isAudioPartActive(
  audioId: string,
  partIndex: number,
  state: State,
): boolean {
  return partIndex === audioActivePartIndex(audioId, state);
}

export function audio(audioId: string, state: State): AudioResource | null {
  return state.audio.resources[audioId] || null;
}

export function trackPosition(audioId: string, partIndex: number, state: State): number {
  const key = keys.audioPart(audioId, partIndex);
  return state.audio.trackPosition[key] ?? 0;
}

export function currentlyPlayingPart(state: State): null | [AudioPart, AudioResource] {
  const audioId = state.audio.playback.audioId;
  if (!audioId) return null;
  return activeAudioPart(audioId, state);
}

export function audioPart(
  audioId: string,
  partIndex: number,
  state: State,
): null | [AudioPart, AudioResource] {
  const audioResource = audio(audioId, state);
  if (!audioResource) return null;
  const part = audioResource.parts[partIndex];
  if (!part) return null;
  return [part, audioResource];
}

export function activeAudioPart(
  audioId: string,
  state: State,
): null | [AudioPart, AudioResource] {
  return audioPart(audioId, audioActivePartIndex(audioId, state), state);
}

export function isAudioPaused(audioId: string, state: State): boolean {
  return isAudioSelected(audioId, state) && state.audio.playback.state === `PAUSED`;
}

export function isAudioPlaying(audioId: string, state: State): boolean {
  return isAudioSelected(audioId, state) && state.audio.playback.state === `PLAYING`;
}

export function isAudioSelected(audioId: string, state: State): boolean {
  return state.audio.playback.audioId === audioId;
}

export function audioActivePartIndex(audioId: string, state: State): number {
  return state.audio.activePart[audioId] ?? 0;
}

export function audioFiles(audioId: string, state: State): null | FileState[] {
  const audioResource = audio(audioId, state);
  if (!audioResource) return null;
  return audioResource.parts.map((part, index) => audioPartFile(audioId, index, state));
}

export function audioPartFile(
  audioId: string,
  partIndex: number,
  state: State,
): FileState {
  const quality = state.preferences.audioQuality;
  const audioEntity = new AudioPartEntity(audioId, partIndex, quality);
  const audio = state.audio.resources[audioId];
  let fallbackSize = 10000;
  if (audio && audio.parts[partIndex]) {
    fallbackSize =
      audio.parts[partIndex]?.[quality === `HQ` ? `size` : `sizeLq`] ?? fallbackSize;
  }
  return (
    state.filesystem[audioEntity.fsPath] || {
      totalBytes: fallbackSize,
      bytesOnDisk: 0,
    }
  );
}

export function trackQueue(audioId: string, state: State): null | TrackData[] {
  const audioResource = audio(audioId, state);
  if (!audioResource) return null;
  const tracks = audioResource.parts
    .map((part) => trackData(audioId, part.index, state))
    .filter(isNotNull);
  return tracks.length > 0 ? tracks : null;
}

export function trackData(
  audioId: string,
  partIndex: number,
  state: State,
): TrackData | null {
  const {
    audio: { resources },
    preferences: prefs,
  } = state;
  const audioPath = new AudioPartEntity(audioId, partIndex, prefs.audioQuality).fsPath;
  const audio = resources[audioId];
  const image = coverImage(`square`, audioId, Infinity, state);
  if (!audio || !image) return null;
  const part = audio.parts[partIndex];
  if (!part) return null;
  const title = utf8ShortTitle(audio.title);
  return {
    id: keys.audioPart(audioId, partIndex),
    filepath: `file://${FS.abspath(audioPath)}`,
    title: backgroundPartTitle(part.title, title),
    artist: audio.friend.startsWith(`Compila`) ? title : audio.friend,
    album: audio.friend.startsWith(`Compila`) ? `Friends Library` : audio.friend,
    artworkUrl: image.uri,
    duration: part.duration,
  };
}

export function progress(audioId: string, state: State): number {
  const active = activeAudioPart(audioId, state);
  if (!active) return 0;
  const [activePart, audio] = active;
  const position = trackPosition(audioId, activePart.index, state);
  if (activePart.index === 0 && position === 0) {
    return 0;
  }
  const total = totalDuration(audio);
  let listened = 0;
  audio.parts.forEach((part) => {
    if (part.index < activePart.index) {
      listened += part.duration;
    } else if (part.index === activePart.index) {
      listened += position;
    }
  });

  console.log({ listened, total, audioId });
  return Math.floor((listened / total) * 100);
}
