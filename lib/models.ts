/**
 * In this app, there are lots of CONVENTION-BASED STRINGS -- particularly as KEYS for STATE,
 * and also as PATHS for storing things in the local FILESYSTEM. This file (and all of
 * the thin wrapper classes and interfaces in it) exists to _minimize random strings_ flying
 * around, and so that we can get some measure of type-safety and compile-time errors
 * for modifying and accessing things according to what ultimately boils down to plain strings.
 * The methods on the classes in this file should be the ONLY PLACE were knowledge of
 * these conventions--how to create/assemble/dissemble these conventional strings--lives.
 */
import {
  AudioQuality,
  SquareCoverImageSize,
  ThreeDCoverImageWidth,
  SQUARE_COVER_IMAGE_SIZES,
  THREE_D_COVER_IMAGE_WIDTHS,
  EditionType,
  Sha,
} from '@friends-library/types';
import { PixelRatio } from 'react-native';
import { EditionId, DocumentId, EditionResource } from '../types';
import { FileSystem } from './fs';

export interface DocumentEntityInterface {
  readonly documentId: DocumentId;
}

interface EditionEntityInterface {
  readonly editionId: EditionId;
  readonly documentId: DocumentId;
  readonly document: DocumentEntityInterface;
  readonly editionType: EditionType;
}

export interface EbookRevisionEntityInterface {
  readonly fsFilenamePrefix: string;
  readonly revisionFilenameSuffix: string;
  readonly fsPathPrefix: string;
  readonly fsFilename: string;
  readonly fsPath: string;
}

export interface EbookEntityInterface {
  readonly fsFilenamePrefix: string;
  readonly fsPathPrefix: string;
}

export interface FsFilename {
  readonly fsFilename: string;
}

export interface FsPath {
  readonly fsPath: string;
}

export interface FsPathPrefix {
  readonly fsPathPrefix: string;
}

export interface StateKey {
  readonly stateKey: string;
}

export interface TrackId {
  readonly trackId: string;
}

export class DocumentEntity implements DocumentEntityInterface, StateKey {
  public constructor(public readonly documentId: DocumentId) {}

  public get stateKey(): string {
    return this.documentId;
  }
}

export class EditionEntity
  implements EditionEntityInterface, DocumentEntityInterface, StateKey {
  public static fromDocumentIdAndEditionType(
    documentId: DocumentId,
    editionType: EditionType,
  ): EditionEntity {
    return new EditionEntity(`${documentId}--${editionType}`);
  }

  public static fromResource(resource: EditionResource): EditionEntity {
    return new EditionEntity(resource.id);
  }

  public constructor(public readonly editionId: EditionId) {}

  public get stateKey(): string {
    return this.editionId;
  }

  public get document(): DocumentEntityInterface {
    return new DocumentEntity(this.documentId);
  }

  public get documentId(): DocumentId {
    return this.editionId.split(`--`).shift() ?? ``;
  }

  public get editionType(): EditionType {
    return this.editionId.split(`--`).pop() as EditionType;
  }
}

export class AudioPartEntity
  extends EditionEntity
  implements StateKey, TrackId, EditionEntityInterface {
  public constructor(editionId: EditionId, private partIndex: number) {
    super(editionId);
  }

  public get stateKey(): string {
    return `${this.editionId}--${this.partIndex}`;
  }

  public get trackId(): string {
    // don't just call this.stateKey because of inheritance
    return `${this.editionId}--${this.partIndex}`;
  }
}

export class AudioPartQualityEntity
  extends AudioPartEntity
  implements FsPath, StateKey, TrackId, FsFilename, EditionEntityInterface {
  public constructor(
    editionId: EditionId,
    partIndex: number,
    private quality: AudioQuality,
  ) {
    super(editionId, partIndex);
  }

  public get stateKey(): string {
    return `${super.stateKey}--${this.quality}`;
  }

  public get fsFilename(): string {
    return `${this.stateKey}.mp3`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.audio}/${this.fsFilename}`;
  }
}

export class SquareCoverImageEntity
  extends EditionEntity
  implements FsPath, FsFilename, EditionEntityInterface {
  public static fromLayoutWidth(
    editionId: EditionId,
    layoutWidth: number,
  ): SquareCoverImageEntity {
    return new SquareCoverImageEntity(
      editionId,
      bestImageSize(layoutWidth, [...SQUARE_COVER_IMAGE_SIZES]),
    );
  }

  public constructor(editionId: EditionId, public readonly size: SquareCoverImageSize) {
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
    editionId: EditionId,
    layoutWidth: number,
  ): ThreeDCoverImageEntity {
    return new ThreeDCoverImageEntity(
      editionId,
      bestImageSize(layoutWidth, [...THREE_D_COVER_IMAGE_WIDTHS]),
    );
  }

  public constructor(editionId: EditionId, public readonly size: ThreeDCoverImageWidth) {
    super(editionId);
  }

  public get fsFilename(): string {
    return `${this.editionId}--three-d-cover--w${this.size}.png`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.images}/${this.fsFilename}`;
  }
}

export class EbookEntity
  extends EditionEntity
  implements EbookEntityInterface, FsPathPrefix {
  public static fromResource(resource: EditionResource): EbookEntity {
    return new EbookEntity(resource.id);
  }

  public constructor(editionId: EditionId) {
    super(editionId);
  }

  public get fsFilenamePrefix(): string {
    return `${this.editionId}--`;
  }

  public get fsPathPrefix(): string {
    return `${FileSystem.dirs.ebooks}/${this.fsFilenamePrefix}`;
  }
}

export class EbookRevisionEntity
  extends EbookEntity
  implements EbookRevisionEntityInterface, FsPath, FsFilename {
  public static fromResource(resource: EditionResource): EbookRevisionEntity {
    return new EbookRevisionEntity(resource.id, resource.revision);
  }

  public constructor(editionId: EditionId, private readonly revision: Sha) {
    super(editionId);
  }

  public get fsFilename(): string {
    return `${this.fsFilenamePrefix}${this.revisionFilenameSuffix}`;
  }

  public get revisionFilenameSuffix(): string {
    return `${this.revision}.html`;
  }

  public get fsPath(): string {
    return `${FileSystem.dirs.ebooks}/${this.fsFilename}`;
  }

  public static extractRevisionFromFilename(filename: string): Sha {
    return (
      filename
        .replace(/\.html$/, ``)
        .split(`--`)
        .pop() || ``
    );
  }
}

export class EbookCss implements FsPath {
  public readonly fsPath = `${FileSystem.dirs.ebooks}/ebook.css`;
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
