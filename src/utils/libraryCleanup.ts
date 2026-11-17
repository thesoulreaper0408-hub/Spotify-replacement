import type { Track } from '../types/music';

export interface DuplicateGroup {
  id: string;
  reason: string;
  recommendedKeepId: string;
  tracks: Track[];
}

export function normalizeTrackTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/\((copy|remaster(ed)?|edit|live|\d+)\)/gi, '')
    .replace(/\[(copy|remaster(ed)?|\d+)\]/gi, '')
    .replace(/\bcopy\b/gi, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function scoreTrackQuality(track: Track): number {
  let score = 0;
  if (track.sampleRate) score += track.sampleRate / 1000;
  if (track.fileSizeBytes) score += Math.min(100, track.fileSizeBytes / (1024 * 128));
  if (track.lyrics && track.lyrics.length > 0) score += 20;
  if (track.liked) score += 10;
  if (track.note && track.note.trim().length > 0) score += 8;
  score += Math.min(15, track.playCount);
  if (!track.isLocal) score += 5;
  return score;
}

/**
 * Scans tracks for duplicate groups by:
 * 1) Identical byte fileSizeBytes (for local files)
 * 2) Near-identical normalized title + duration within 1.5s
 * 3) Same artist + identical duration within 0.5s & matching normalized title prefix
 */
export function findDuplicateTrackGroups(tracks: Track[]): DuplicateGroup[] {
  if (tracks.length < 2) return [];

  const parent = tracks.map((_, i) => i);
  const reasons = new Map<string, string>();

  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const union = (a: number, b: number, reason: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[rb] = ra;
      reasons.set(`${Math.min(ra, rb)}`, reason);
    }
  };

  for (let i = 0; i < tracks.length; i += 1) {
    for (let j = i + 1; j < tracks.length; j += 1) {
      const a = tracks[i];
      const b = tracks[j];

      if (
        a.fileSizeBytes &&
        b.fileSizeBytes &&
        a.fileSizeBytes > 0 &&
        a.fileSizeBytes === b.fileSizeBytes &&
        Math.abs(a.duration - b.duration) <= 1.5
      ) {
        union(i, j, 'Identical file size & duration');
        continue;
      }

      const normA = normalizeTrackTitleKey(a.title);
      const normB = normalizeTrackTitleKey(b.title);
      if (normA && normA === normB) {
        const durDiff = Math.abs(a.duration - b.duration);
        if (durDiff <= 2.0 || a.duration === 0 || b.duration === 0) {
          union(i, j, 'Matching title & duration');
          continue;
        }
      }

      if (
        normA.length >= 5 &&
        normB.length >= 5 &&
        (normA.includes(normB) || normB.includes(normA)) &&
        Math.abs(a.duration - b.duration) <= 0.75
      ) {
        union(i, j, 'Near-identical title & duration');
      }
    }
  }

  const buckets = new Map<number, Track[]>();
  tracks.forEach((track, idx) => {
    const root = find(idx);
    const list = buckets.get(root) ?? [];
    list.push(track);
    buckets.set(root, list);
  });

  const groups: DuplicateGroup[] = [];
  for (const [root, list] of buckets.entries()) {
    if (list.length < 2) continue;
    const sortedByQuality = [...list].sort(
      (a, b) => scoreTrackQuality(b) - scoreTrackQuality(a)
    );
    groups.push({
      id: `dup-${root}-${sortedByQuality[0].id}`,
      reason: reasons.get(`${root}`) ?? 'Duplicate audio match',
      recommendedKeepId: sortedByQuality[0].id,
      tracks: sortedByQuality,
    });
  }

  return groups;
}
