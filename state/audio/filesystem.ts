import pLimit from 'p-limit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioQuality } from '@friends-library/types';
import { EditionId } from '../../types';
import { Thunk, Dispatch, State } from '..';
import { canDownloadNow } from '../network';
import Editions from '../../lib/Editions';
import { AudioPartQualityEntity } from '../../lib/models';
import FS from '../../lib/fs';
import Service from '../../lib/service';
import * as select from '../../state/selectors/audio-selectors';

export interface FileState {
  totalBytes: number;
  bytesOnDisk: number;
  queued?: boolean;
}

interface Part {
  editionId: EditionId;
  index: number;
  quality: AudioQuality;
}

type AudioPartQualityEntityStateKey = string;

export type FilesystemState = Record<
  AudioPartQualityEntityStateKey,
  FileState | undefined
>;

export const initialState: FilesystemState = {};

const filesystem = createSlice({
  name: `audio.filesystem`,
  initialState,
  reducers: {
    set: (state, action: PayloadAction<{ part: Part; fileState: FileState }>) => {
      const { part, fileState } = action.payload;
      state[stateKey(part)] = fileState;
    },

    batchSet: (state, action: PayloadAction<FilesystemState>) => {
      return {
        ...state,
        ...action.payload,
      };
    },

    setQueued: (state, action: PayloadAction<{ part: Part; queued: boolean }>) => {
      const { part, queued } = action.payload;
      const key = stateKey(part);
      const file = state[key];
      if (!file) {
        state[key] = {
          totalBytes: 0,
          bytesOnDisk: filesize(part),
          queued,
        };
        return;
      }
      file.queued = queued;
    },

    completeDownload: (state, { payload: part }: PayloadAction<Part>) => {
      const key = stateKey(part);
      const file = state[key];
      if (!file) {
        state[key] = {
          bytesOnDisk: filesize(part),
          totalBytes: filesize(part),
        };
        return;
      }
      file.bytesOnDisk = file.totalBytes;
    },

    resetDownload: (state, { payload: part }: PayloadAction<Part>) => {
      const key = stateKey(part);
      const file = state[key];
      if (!file) {
        state[key] = {
          bytesOnDisk: 0,
          totalBytes: filesize(part),
        };
        return;
      }
      file.bytesOnDisk = 0;
    },
  },
});

export const {
  set,
  setQueued,
  completeDownload,
  resetDownload,
  batchSet,
} = filesystem.actions;

export default filesystem.reducer;

export const downloadAudio = (editionId: EditionId, partIndex: number): Thunk => async (
  dispatch,
  getState,
) => {
  const state = getState();
  if (!canDownloadNow(state, dispatch)) return;
  return execDownloadAudio(editionId, partIndex, dispatch, state);
};

export const deleteAllAudioParts = (editionId: EditionId): Thunk => async (dispatch) => {
  const audio = Editions.getAudio(editionId);
  if (!audio) return;
  const deletedFiles: FilesystemState = {};
  const fsPaths: string[] = [];
  audio.parts.forEach((part, index) => {
    ([`HQ`, `LQ`] as const).forEach((quality) => {
      const entity = new AudioPartQualityEntity(editionId, index, quality);
      fsPaths.push(entity.fsPath);
      const key = entity.stateKey;
      const part = { editionId, index, quality };
      deletedFiles[key] = {
        totalBytes: filesize(part),
        bytesOnDisk: 0,
        queued: false,
      };
    });
  });
  dispatch(batchSet(deletedFiles));
  Service.fsBatchDelete(fsPaths);
};

export const deleteAllAudios = (): Thunk => async (dispatch, getState) => {
  const filesystem = getState().audio.filesystem;
  const deleted = Object.entries(filesystem).reduce<FilesystemState>(
    (acc, [key, file]) => {
      acc[key] = { totalBytes: file!.totalBytes, bytesOnDisk: 0 };
      return acc;
    },
    {},
  );
  dispatch(batchSet(deleted));
  Service.fsDeleteAllAudios();
};

const limit = pLimit(3);

export const downloadAllAudios = (editionId: EditionId): Thunk => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const quality = state.preferences.audioQuality;
  const audioPartFiles = select.audioFiles(editionId, state);
  if (!audioPartFiles || !canDownloadNow(state, dispatch)) {
    return;
  }

  const undownloadedIndexes = audioPartFiles
    .map((part, index) => ({ part, partIndex: index }))
    .filter(({ part }) => !isDownloaded(part) && !isDownloading(part))
    .map(({ partIndex }) => partIndex);

  undownloadedIndexes.forEach((index) => {
    const part = { editionId, index, quality };
    dispatch(setQueued({ part, queued: true }));
  });

  const batchedPromises = undownloadedIndexes.map((partIndex) =>
    limit(() => execDownloadAudio(editionId, partIndex, dispatch, state)),
  );

  return Promise.all(batchedPromises);
};

function execDownloadAudio(
  editionId: EditionId,
  partIndex: number,
  dispatch: Dispatch,
  state: State,
): Promise<void> {
  const quality = state.preferences.audioQuality;
  const found = Editions.getAudioPart(editionId, partIndex);
  if (!found) return Promise.resolve(undefined);
  const [audioPart] = found;
  const key = new AudioPartQualityEntity(editionId, partIndex, quality).stateKey;
  const url = audioPart[quality === `HQ` ? `url` : `urlLq`];
  const part = { editionId, index: partIndex, quality };
  return FS.eventedDownload(
    key,
    url,
    (totalBytes) => {
      dispatch(set({ part, fileState: { bytesOnDisk: 1, totalBytes } }));
      dispatch(setQueued({ part, queued: false }));
    },
    (bytesWritten, totalBytes) =>
      dispatch(set({ part, fileState: { bytesOnDisk: bytesWritten, totalBytes } })),
    (success) => dispatch(success ? completeDownload(part) : resetDownload(part)),
  );
}

export const maybeDownloadNextQueuedTrack = (position: number): Thunk => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const current = select.currentlyPlayingPart(state);
  if (!current || !state.network.connected) {
    return;
  }

  const [part, edition, audio] = current;
  if (audio.parts.length === 1 || part.index === audio.parts.length - 1) {
    return; // no next track to download
  }

  const nextPart = audio.parts[part.index + 1];
  if (!nextPart) {
    return;
  }

  // only pre-download when they've hit 75% of current track
  if (position / part.duration < 0.75) {
    return;
  }

  const nextFile = select.audioPartFile(edition.id, nextPart.index, state);
  if (!isDownloaded(nextFile) && !isDownloading(nextFile)) {
    execDownloadAudio(edition.id, nextPart.index, dispatch, state);
  }
};

export function isQueued({ queued }: FileState): boolean {
  return queued === true;
}

export function isDownloaded({ bytesOnDisk, totalBytes }: FileState): boolean {
  return bytesOnDisk === totalBytes;
}

export function isDownloading({ bytesOnDisk, totalBytes }: FileState): boolean {
  return bytesOnDisk > 0 && bytesOnDisk < totalBytes;
}

export function downloadProgress({ bytesOnDisk, totalBytes }: FileState): number {
  return (bytesOnDisk / totalBytes) * 100;
}

function stateKey(part: Part): string {
  return new AudioPartQualityEntity(part.editionId, part.index, part.quality).stateKey;
}

function filesize(part: Part): number {
  const resourceFilesize = Editions.getAudioPartFilesize(
    part.editionId,
    part.index,
    part.quality,
  );
  return resourceFilesize ?? ERROR_FALLBACK_SIZE;
}

const ERROR_FALLBACK_SIZE = 10000;
