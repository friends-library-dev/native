import filesize from 'filesize';

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
