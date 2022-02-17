import { Lang } from '@friends-library/types';

// NOTE: This was ported over from @friends-library/friends -> Audio.ts
// during the great graphql API refactor. This functionality was moved
// into the API, exposed as a computed prop on the Audio entity.
// When the app is converted to talk to the API using graphql instead of
// the legacy REST endpoints, this file can be removed.
export function audioHumanDuration(
  partDurations: number[],
  style: 'clock' | 'abbrev' = `clock`,
  lang: Lang = `en`,
): string {
  const units = durationUnits(partDurations);
  if (style === `abbrev`) {
    const [hours, minutes] = units;
    let duration = minutes === 0 ? `` : ` ${minutes} min`;
    if (hours > 0) {
      duration = `${hours} ${lang === `en` ? `hr` : `h`}${duration}`;
    }
    return duration.trim();
  }

  return units
    .filter((num, idx, parts) =>
      num !== 0 ? true : parts.slice(idx + 1).every((part) => part === 0),
    )
    .map(String)
    .map((part) => part.padStart(2, `0`))
    .join(`:`)
    .replace(/^0/, ``);
}

function durationUnits(
  partDurations: number[],
): [hours: number, minutes: number, seconds: number] {
  const totalSeconds = Math.floor(partDurations.reduce((x, y) => x + y));
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds];
}
