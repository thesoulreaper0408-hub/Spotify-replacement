export type ThemeId =
  | 'classic-dark'
  | 'pixel-retro'
  | 'comic-book'
  | 'cyberpunk-neon'
  | 'cozy-paper'
  | 'frutiger-aero'
  | 'vaporwave'
  | 'blueprint'
  | 'claymorphism'
  | 'terminal';

export type RepeatMode = 'off' | 'all' | 'one';

export type SceneryDensity = 'off' | 'cozy' | 'packed';

export type SortField = 'default' | 'title' | 'artist' | 'duration';
export type SortDirection = 'asc' | 'desc';

export type LibraryLayoutMode = 'list' | 'shelf';

export type MoodTag = 'Chill' | 'Groove' | 'Hype';

export type EqPresetId =
  | 'flat'
  | 'bass-boost'
  | 'vocal-enhance'
  | 'jazz'
  | 'electronic'
  | 'acoustic'
  | 'late-night'
  | 'custom';

export interface EqPreset {
  id: Exclude<EqPresetId, 'custom'>;
  name: string;
  description: string;
  gains: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 12kHz in dB
}

export interface PinnedMoment {
  id: string;
  time: number;
  label: string;
  createdAt: number;
}

export type EnergyArcType = 'party-workout' | 'late-night' | 'rollercoaster';

export type SleepTimerMode = 'countdown' | 'after-track';

export type ActiveView =
  | { type: 'home' }
  | { type: 'liked' }
  | { type: 'playlists' }
  | { type: 'lyrics' }
  | { type: 'stats' }
  | { type: 'playlist'; playlistId: string };

export interface LyricLine {
  time: number;
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  isLocal: boolean;
  liked: boolean;
  coverSeed: number;
  playCount: number;
  listeningSeconds?: number;
  addedAt: number;
  fileName?: string;
  lyrics?: LyricLine[];
  // Extended Smart Library & Audio FX metadata
  bpm?: number;
  mood?: MoodTag;
  rmsLoudness?: number;
  replayGain?: number;
  trimStart?: number;
  trimEnd?: number;
  waveformPeaks?: number[];
  fileSizeBytes?: number;
  sampleRate?: number;
  lastPlayedAt?: number;
  pinnedMoments?: PinnedMoment[];
  customCoverUrl?: string;
  note?: string;
  noteDate?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: number;
}

export interface ListeningSessionEvent {
  id: string;
  trackId: string;
  trackTitle: string;
  artistName: string;
  timestamp: number; // epoch ms
  durationSeconds: number;
  mood: MoodTag;
  bpm: number;
}

export interface RecapCapsule {
  id: string;
  kind: 'monthly' | 'yearly';
  dateKey: string; // YYYY-MM-DD
  label: string;
  year: number;
  monthIndex: number; // 0..11
  totalMinutes: number;
  totalPlays: number;
  topTracks: Array<{ id: string; title: string; artist: string; plays: number }>;
  topArtist: { name: string; plays: number } | null;
  peakTimeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Late Night';
  dominantMood: MoodTag;
  averageBpm: number;
  archetype?: string;
  archetypeTagline?: string;
  streakDays?: number;
}
