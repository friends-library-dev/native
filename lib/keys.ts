import { AudioQuality, Sha } from '@friends-library/types';

export function audioPart(audioId: string, partIndex: number): string {
  return `${audioId}--${partIndex}`;
}

export function audioPartWithQuality(
  audioId: string,
  partIndex: number,
  quality: AudioQuality,
): string {
  return `${audioPart(audioId, partIndex)}--${quality}`;
}

export function audioFilepath(
  audioId: string,
  partIndex: number,
  quality: AudioQuality,
): string {
  return `audio/${audioPartWithQuality(audioId, partIndex, quality)}.mp3`;
}

export function artworkFilepath(resourceId: string): string {
  return `artwork/${resourceId}.png`;
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
