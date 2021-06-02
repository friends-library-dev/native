import filesize from 'filesize';
import { AudioResource } from '../types';

export const humansize = filesize.partial({ round: 0, spacer: `` });

export function backgroundPartTitle(partTitle: string, bookTitle: string): string {
  return partTitle.replace(
    /^(Parte?|Chapter|Capítulo|Sección|Section) (\d+)$/,
    (_, type: string, num: string) => {
      return `${ABBREV_MAP[type]}. ${num}—${bookTitle}`;
    },
  );
}

const ABBREV_MAP: Record<string, string> = {
  Part: `Pt`,
  Parte: `Pt`,
  Chapter: `Ch`,
  Section: `Sect`,
  Sección: `Pt`,
  Capítulo: `Cp`,
};

export function totalDuration(audio: AudioResource): number {
  return audio.parts.reduce((acc, part) => acc + part.duration, 0);
}
