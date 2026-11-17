import type { RepeatMode, SortDirection, SortField, Track } from '../types/music';

const AUDIO_EXT_REGEX = /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i;

export interface ParsedTrackMeta {
  title: string;
  artist: string;
  album: string;
}

/**
 * Parses a local audio filename into clean track metadata.
 * Strips file extensions and recognizes common "Artist - Title" naming.
 */
export function parseAudioFilename(filename: string): ParsedTrackMeta {
  const withoutExt = filename.trim().replace(AUDIO_EXT_REGEX, '');
  const normalized = withoutExt
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return {
      title: 'Untitled Track',
      artist: 'Local Artist',
      album: 'Local Uploads',
    };
  }

  // Strip leading track numbers like "01 - " or "01. "
  const withoutTrackNum = normalized.replace(/^\d{1,3}[\s.-]+(?=[A-Za-z0-9])/, '').trim();
  const working = withoutTrackNum || normalized;

  const dashSplit = working.split(/\s+-\s+/);
  if (dashSplit.length >= 2) {
    const artist = dashSplit[0].trim();
    const title = dashSplit.slice(1).join(' - ').trim();
    if (artist && title) {
      return {
        title,
        artist,
        album: 'Local Uploads',
      };
    }
  }

  return {
    title: working,
    artist: 'Local Artist',
    album: 'Local Uploads',
  };
}

/**
 * Formats seconds into M:SS or H:MM:SS with safe handling of invalid inputs.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Computes a deterministic integer seed from a string for album art styling.
 */
export function computeCoverSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 10000;
}

/**
 * Case-insensitive track filter across title, artist, and album.
 */
export function filterTracks(tracks: Track[], query: string): Track[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return tracks;
  }
  return tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.album.toLowerCase().includes(q)
  );
}

/**
 * Sorts tracks cleanly by title, artist, or duration without mutating input.
 */
export function sortTracks(
  tracks: Track[],
  field: SortField,
  direction: SortDirection
): Track[] {
  if (field === 'default') {
    return tracks;
  }
  const factor = direction === 'asc' ? 1 : -1;
  return [...tracks].sort((a, b) => {
    if (field === 'duration') {
      return (a.duration - b.duration) * factor;
    }
    const valA = field === 'title' ? a.title : a.artist;
    const valB = field === 'title' ? b.title : b.artist;
    return valA.localeCompare(valB, undefined, { sensitivity: 'base' }) * factor;
  });
}

/**
 * Reorders an item in an array immutably.
 */
export function reorderQueue<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

/**
 * Removes an item at index immutably.
 */
export function removeFromQueue<T>(items: T[], index: number): T[] {
  if (index < 0 || index >= items.length) {
    return items;
  }
  return items.filter((_, i) => i !== index);
}

/**
 * Resolves the next track index given shuffle, repeat mode, and queue length.
 * Returns -1 when playback should stop at the end of the queue.
 */
export function getNextTrackIndex(params: {
  currentIndex: number;
  queueLength: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  autoAdvance: boolean;
  randomValue?: number;
}): number {
  const { currentIndex, queueLength, shuffle, repeatMode, autoAdvance, randomValue = Math.random() } = params;
  if (queueLength <= 0) {
    return -1;
  }
  if (autoAdvance && repeatMode === 'one' && currentIndex >= 0 && currentIndex < queueLength) {
    return currentIndex;
  }
  if (shuffle) {
    if (queueLength === 1) {
      return repeatMode === 'off' && autoAdvance ? -1 : 0;
    }
    const offset = Math.floor(Math.min(0.999999, Math.max(0, randomValue)) * (queueLength - 1)) + 1;
    const base = currentIndex >= 0 ? currentIndex : 0;
    return (base + offset) % queueLength;
  }
  if (currentIndex < 0) {
    return 0;
  }
  const next = currentIndex + 1;
  if (next < queueLength) {
    return next;
  }
  return repeatMode === 'all' || !autoAdvance ? 0 : -1;
}

/**
 * Resolves the previous track index given queue length and repeat mode.
 */
export function getPreviousTrackIndex(params: {
  currentIndex: number;
  queueLength: number;
  repeatMode: RepeatMode;
}): number {
  const { currentIndex, queueLength, repeatMode } = params;
  if (queueLength <= 0) {
    return -1;
  }
  if (currentIndex <= 0) {
    return repeatMode === 'all' ? queueLength - 1 : 0;
  }
  return currentIndex - 1;
}
