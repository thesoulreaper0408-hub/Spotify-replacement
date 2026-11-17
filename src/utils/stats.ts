import type { Track } from '../types/music';

export interface TrackPlayStat {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  playCount: number;
  listeningSeconds: number;
  sharePercent: number;
  track: Track;
}

export interface LibraryStatsSummary {
  totalPlays: number;
  totalListeningSeconds: number;
  playedTrackCount: number;
  totalTracks: number;
  averagePlays: number;
  topTrack: TrackPlayStat | null;
  topArtist: { name: string; plays: number } | null;
  rankedTracks: TrackPlayStat[];
}

export function getTrackListeningSeconds(track: Track): number {
  if (typeof track.listeningSeconds === 'number' && Number.isFinite(track.listeningSeconds)) {
    return Math.max(0, Math.round(track.listeningSeconds));
  }
  const plays = Number.isFinite(track.playCount) && track.playCount > 0 ? track.playCount : 0;
  const dur = Number.isFinite(track.duration) && track.duration > 0 ? track.duration : 0;
  return Math.round(plays * dur);
}

/**
 * Formats accumulated listening time concisely (e.g. "45s", "14m 20s", "2h 08m").
 */
export function formatListeningTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
  if (safe < 60) {
    return `${safe}s`;
  }
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) {
    return `${hours}h ${String(mins).padStart(2, '0')}m`;
  }
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

/**
 * Computes play-count and listening-time analytics for the Stats view.
 */
export function buildPlayCountStats(
  tracks: Track[],
  maxBars = 10
): LibraryStatsSummary {
  if (tracks.length === 0) {
    return {
      totalPlays: 0,
      totalListeningSeconds: 0,
      playedTrackCount: 0,
      totalTracks: 0,
      averagePlays: 0,
      topTrack: null,
      topArtist: null,
      rankedTracks: [],
    };
  }

  const totalPlays = tracks.reduce(
    (sum, t) => sum + (Number.isFinite(t.playCount) && t.playCount > 0 ? t.playCount : 0),
    0
  );
  const totalListeningSeconds = tracks.reduce(
    (sum, t) => sum + getTrackListeningSeconds(t),
    0
  );
  const playedTracks = tracks.filter((t) => Number.isFinite(t.playCount) && t.playCount > 0);

  const sorted = [...tracks].sort((a, b) => {
    const diff = (b.playCount || 0) - (a.playCount || 0);
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });

  const artistTotals = new Map<string, number>();
  for (const t of tracks) {
    const count = Number.isFinite(t.playCount) && t.playCount > 0 ? t.playCount : 0;
    if (count > 0) {
      artistTotals.set(t.artist, (artistTotals.get(t.artist) ?? 0) + count);
    }
  }

  let topArtist: { name: string; plays: number } | null = null;
  for (const [name, plays] of artistTotals.entries()) {
    if (!topArtist || plays > topArtist.plays) {
      topArtist = { name, plays };
    }
  }

  const rankedTracks: TrackPlayStat[] = sorted
    .slice(0, Math.max(1, maxBars))
    .map((track) => {
      const plays = Number.isFinite(track.playCount) && track.playCount > 0 ? track.playCount : 0;
      return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        playCount: plays,
        listeningSeconds: getTrackListeningSeconds(track),
        sharePercent: totalPlays > 0 ? Math.round((plays / totalPlays) * 100) : 0,
        track,
      };
    });

  return {
    totalPlays,
    totalListeningSeconds,
    playedTrackCount: playedTracks.length,
    totalTracks: tracks.length,
    averagePlays: Number((totalPlays / tracks.length).toFixed(1)),
    topTrack: rankedTracks[0] && rankedTracks[0].playCount > 0 ? rankedTracks[0] : null,
    topArtist,
    rankedTracks,
  };
}
