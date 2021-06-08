import filesize from 'filesize';
import { EbookColorScheme } from '../types';

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

export function colorSchemeSubtleDropshadowStyle(
  dir: 'above' | 'below',
  colorScheme: EbookColorScheme,
): Record<string, any> {
  return {
    elevation: 1,
    shadowColor: colorScheme === `black` ? `#fff` : `#000`,
    shadowOpacity: colorScheme === `black` ? 0.1625 : 0.0375,
    shadowRadius: 1,
    shadowOffset: {
      width: 1,
      height: dir === `above` ? -1 : 1,
    },
  };
}
