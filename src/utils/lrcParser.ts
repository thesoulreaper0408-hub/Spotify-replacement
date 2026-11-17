import type { LyricLine } from '../types/music';

const TIMESTAMP_REGEX = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

/**
 * Parses standard .lrc lyrics content into time-sorted LyricLine entries.
 */
export function parseLrc(raw: string): LyricLine[] {
  if (!raw || !raw.trim()) {
    return [];
  }

  const lines = raw.split(/\r?\n/);
  const parsed: LyricLine[] = [];

  for (const line of lines) {
    const matches = Array.from(line.matchAll(TIMESTAMP_REGEX));
    if (matches.length === 0) continue;

    const text = line.replace(TIMESTAMP_REGEX, '').trim();
    if (!text) continue;

    for (const match of matches) {
      const minutes = Number.parseInt(match[1], 10);
      const seconds = Number.parseInt(match[2], 10);
      const fracStr = match[3] ?? '0';
      const frac =
        fracStr.length === 3
          ? Number.parseInt(fracStr, 10) / 1000
          : fracStr.length === 2
            ? Number.parseInt(fracStr, 10) / 100
            : Number.parseInt(fracStr, 10) / 10;

      if (Number.isFinite(minutes) && Number.isFinite(seconds) && Number.isFinite(frac)) {
        parsed.push({
          time: minutes * 60 + seconds + frac,
          text,
        });
      }
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Returns the active lyric index for the given playback time, or -1 if before first line.
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (!lines || lines.length === 0 || !Number.isFinite(currentTime) || currentTime < 0) {
    return -1;
  }

  let active = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].time <= currentTime + 0.05) {
      active = i;
    } else {
      break;
    }
  }
  return active;
}
