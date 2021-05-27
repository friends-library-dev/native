import { AudioQuality, Sha, SquareCoverImageSize } from '@friends-library/types';

export function audioPart(audioId: string, partIndex: number): string {
  return `${audioId}--${partIndex}`;
}

export function squareCoverImageFilepath(
  resourceId: string,
  size: SquareCoverImageSize,
): string {
  return ``;
}

export function edition(editionId: string): string {
  return `editions/${editionId}`;
}

export function ebookHtmlFilepathPrefix(editionId: string): string {
  return `${edition(editionId)}--`;
}

export function ebookRevisionHtmlFilepath(editionId: string, sha: Sha): string {
  return `${ebookHtmlFilepathPrefix(editionId)}${sha}.html`;
}

export function ebookCssFilepath(): string {
  return `editions/ebook.css`;
}
