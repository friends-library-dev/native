import {
  AudioQuality,
  SquareCoverImageSize,
  SQUARE_COVER_IMAGE_SIZES,
} from '@friends-library/types';
import { PixelRatio } from 'react-native';
import { FileSystem } from './fs';

interface ResourceEntity {
  readonly resourceId: string;
}

export interface FsFilename {
  readonly fsFilename: string;
}

export interface FsPath {
  readonly fsPath: string;
}

export interface StateKey {
  readonly stateKey: string;
}

abstract class Resource implements ResourceEntity {
  public constructor(public readonly resourceId: string) {}
}

export class AudioPartEntity extends Resource implements FsPath, FsFilename {
  public constructor(
    resourceId: string,
    private partIndex: number,
    private quality: AudioQuality,
  ) {
    super(resourceId);
  }

  public get fsFilename(): string {
    return `${this.resourceId}--${this.partIndex}--${this.quality}.mp3`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.audio}/${this.fsFilename}`;
  }
}

export class CoverImageEntity extends Resource implements FsPath, FsFilename {
  public static fromLayoutSize(resourceId: string, layoutSize: number): CoverImageEntity {
    const pixelSize = PixelRatio.getPixelSizeForLayoutSize(layoutSize);
    let imageSize: SquareCoverImageSize | null = null;
    for (const size of SQUARE_COVER_IMAGE_SIZES) {
      if (size <= pixelSize) {
        imageSize = size;
      }
    }
    return new CoverImageEntity(resourceId, imageSize || 1400);
  }

  public constructor(resourceId: string, public readonly size: SquareCoverImageSize) {
    super(resourceId);
  }

  public get fsFilename(): string {
    return `${this.resourceId}--square-cover--${this.size}x${this.size}.png`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.images}/${this.fsFilename}`;
  }
}
