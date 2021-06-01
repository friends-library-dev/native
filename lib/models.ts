import {
  AudioQuality,
  SquareCoverImageSize,
  ThreeDCoverImageWidth,
  SQUARE_COVER_IMAGE_SIZES,
  THREE_D_COVER_IMAGE_WIDTHS,
  EditionType,
} from '@friends-library/types';
import { PixelRatio } from 'react-native';
import { FileSystem } from './fs';

export interface DocumentEntityInterface {
  readonly documentId: string;
}

interface EditionEntityInterface {
  readonly editionId: string;
  readonly documentId: string;
  readonly document: DocumentEntityInterface;
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

export class DocumentEntity implements DocumentEntityInterface, StateKey {
  public constructor(public readonly documentId: string) {}

  public get stateKey(): string {
    return this.documentId;
  }
}

export class EditionEntity
  implements EditionEntityInterface, DocumentEntityInterface, StateKey {
  public static fromDocumentIdAndEditionType(
    documentId: string,
    editionType: EditionType,
  ): EditionEntity {
    return new EditionEntity(`${documentId}--${editionType}`);
  }

  public constructor(public readonly editionId: string) {}

  public get stateKey(): string {
    return this.editionId;
  }

  public get document(): DocumentEntityInterface {
    return new DocumentEntity(this.documentId);
  }

  public get documentId(): string {
    return this.editionId.split(`--`).shift() ?? ``;
  }
}

export class AudioPartEntity
  extends EditionEntity
  implements FsPath, FsFilename, EditionEntityInterface {
  public constructor(
    editionId: string,
    private partIndex: number,
    private quality: AudioQuality,
  ) {
    super(editionId);
  }

  public get fsFilename(): string {
    return `${this.editionId}--${this.partIndex}--${this.quality}.mp3`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.audio}/${this.fsFilename}`;
  }
}

export class SquareCoverImageEntity
  extends EditionEntity
  implements FsPath, FsFilename, EditionEntityInterface {
  public static fromLayoutWidth(
    editionId: string,
    layoutWidth: number,
  ): SquareCoverImageEntity {
    return new SquareCoverImageEntity(
      editionId,
      bestImageSize(layoutWidth, [...SQUARE_COVER_IMAGE_SIZES]),
    );
  }

  public constructor(editionId: string, public readonly size: SquareCoverImageSize) {
    super(editionId);
  }

  public get fsFilename(): string {
    return `${this.editionId}--square-cover--${this.size}x${this.size}.png`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.images}/${this.fsFilename}`;
  }
}

export class ThreeDCoverImageEntity
  extends EditionEntity
  implements FsPath, FsFilename, EditionEntityInterface {
  public static fromLayoutWidth(
    editionId: string,
    layoutWidth: number,
  ): ThreeDCoverImageEntity {
    return new ThreeDCoverImageEntity(
      editionId,
      bestImageSize(layoutWidth, [...THREE_D_COVER_IMAGE_WIDTHS]),
    );
  }

  public constructor(editionId: string, public readonly size: ThreeDCoverImageWidth) {
    super(editionId);
  }

  public get fsFilename(): string {
    return `${this.editionId}--three-d-cover--w${this.size}.png`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.images}/${this.fsFilename}`;
  }
}

function bestImageSize<T extends number[]>(layoutSize: number, sizes: T): T[number] {
  const pixelSize = PixelRatio.getPixelSizeForLayoutSize(layoutSize);
  let imageSize: T[number] | null = null;
  for (const size of sizes) {
    if (size <= pixelSize) {
      imageSize = size;
    }
  }
  return (imageSize || sizes[sizes.length - 1])!;
}
