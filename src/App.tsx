/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Moon, RotateCcw } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { CleanupWizardModal } from './components/CleanupWizardModal';
import { CoverDesignerModal } from './components/CoverDesignerModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { EqualizerModal } from './components/EqualizerModal';
import { HeaderBanner } from './components/HeaderBanner';
import { HomeDashboard } from './components/HomeDashboard';
import { LyricCardModal } from './components/LyricCardModal';
import { LyricsView } from './components/LyricsView';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingBar } from './components/NowPlayingBar';
import { PlaylistsGrid } from './components/PlaylistsGrid';
import { RecordShelfView } from './components/RecordShelfView';
import { RightQueuePanel } from './components/RightQueuePanel';
import { Sidebar } from './components/Sidebar';
import { StatsView } from './components/StatsView';
import { ThemeBackdrop } from './components/ThemeBackdrop';
import { TopHeader } from './components/TopHeader';
import { TrackJournalModal } from './components/TrackJournalModal';
import { TrackTable } from './components/TrackTable';
import { WrappedExperience } from './components/WrappedExperience';
import type {
  ActiveView,
  EnergyArcType,
  EqPresetId,
  LibraryLayoutMode,
  ListeningSessionEvent,
  PinnedMoment,
  Playlist,
  RecapCapsule,
  RepeatMode,
  SceneryDensity,
  SleepTimerMode,
  SortDirection,
  SortField,
  ThemeId,
  Track,
} from './types/music';
import {
  EQ_BAND_FREQUENCIES,
  EQ_PRESETS,
  analyzeMonoAudioData,
  clampEqGainDb,
  computeAutoMixTransition,
} from './utils/audioEngine';
import {
  computeCoverSeed,
  filterTracks,
  getNextTrackIndex,
  getPreviousTrackIndex,
  parseAudioFilename,
  removeFromQueue,
  reorderQueue,
  sortTracks,
} from './utils/audioParser';
import { findDuplicateTrackGroups } from './utils/libraryCleanup';
import { parseLrc } from './utils/lrcParser';
import { arrangePlaylistByEnergyArc } from './utils/playlistArc';
import {
  createInitialDemoTracks,
  createInitialPlaylists,
  createSeedListeningHistory,
  createSeedRecapVault,
} from './utils/sampleAudio';
import {
  getNightDimOpacity,
  getSleepFadeFactor,
  minutesToSeconds,
  tickCountdown,
} from './utils/sleepTimer';
import { getTrackListeningSeconds } from './utils/stats';
import {
  computeVinylNoiseGain,
  createVinylCrackleController,
  type VinylNoiseController,
} from './utils/vinylNoise';
import type { TrackDetailsDraft } from './utils/coverArt';
import {
  buildAnnualWrappedSummary,
  buildMonthlySoundCapsule,
  checkScheduledRecapTrigger,
  toLocalDateKey,
} from './utils/wrappedRecap';

const THEME_STORAGE_KEY = 'chorddeck-theme';
const SCENERY_STORAGE_KEY = 'chorddeck-scenery-density';
const EQ_PRESET_KEY = 'chorddeck-eq-preset';
const EQ_GAINS_KEY = 'chorddeck-eq-gains';
const AUTO_LEVEL_KEY = 'chorddeck-auto-level';
const DEAD_AIR_KEY = 'chorddeck-dead-air-skip';
const VINYL_NOISE_KEY = 'chorddeck-vinyl-noise';
const TRACK_EDITS_KEY = 'chorddeck-track-edits';
const HISTORY_KEY = 'chorddeck-listening-history';
const RECAP_VAULT_KEY = 'chorddeck-recap-vault';
const LAST_RECAP_DATE_KEY = 'chorddeck-last-recap-date';

const VALID_THEMES: ThemeId[] = [
  'classic-dark',
  'pixel-retro',
  'comic-book',
  'cyberpunk-neon',
  'cozy-paper',
  'frutiger-aero',
  'vaporwave',
  'blueprint',
  'claymorphism',
  'terminal',
];

const VALID_SCENERY_DENSITIES: SceneryDensity[] = ['off', 'cozy', 'packed'];

interface SavedTrackEdits {
  title?: string;
  artist?: string;
  album?: string;
  pinnedMoments?: PinnedMoment[];
  customCoverUrl?: string;
  note?: string;
  noteDate?: string;
  playCount?: number;
  listeningSeconds?: number;
}

function readJsonStorage<T>(
  key: string,
  fallback: T,
  validate?: (val: unknown) => val is T
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function isPlainRecord(val: unknown): val is Record<string, SavedTrackEdits> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isEqGainsTuple(val: unknown): val is [number, number, number, number, number] {
  return Array.isArray(val) && val.length === 5 && val.every((n) => typeof n === 'number' && Number.isFinite(n));
}

function getInitialTheme(): ThemeId {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && VALID_THEMES.includes(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'classic-dark';
}

function getInitialSceneryDensity(): SceneryDensity {
  try {
    const saved = window.localStorage.getItem(SCENERY_STORAGE_KEY) as SceneryDensity | null;
    if (saved && VALID_SCENERY_DENSITIES.includes(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'cozy';
}

function getInitialTracksWithEdits(): Track[] {
  const base = createInitialDemoTracks();
  const editsMap = readJsonStorage<Record<string, SavedTrackEdits>>(
    TRACK_EDITS_KEY,
    {},
    isPlainRecord
  );
  return base.map((t) => {
    const edit = editsMap[t.id];
    const baseListening = getTrackListeningSeconds(t);
    if (!edit || typeof edit !== 'object') {
      return { ...t, listeningSeconds: baseListening };
    }
    return {
      ...t,
      title: typeof edit.title === 'string' && edit.title.trim() ? edit.title : t.title,
      artist: typeof edit.artist === 'string' && edit.artist.trim() ? edit.artist : t.artist,
      album: typeof edit.album === 'string' && edit.album.trim() ? edit.album : t.album,
      pinnedMoments: Array.isArray(edit.pinnedMoments) ? edit.pinnedMoments : t.pinnedMoments,
      customCoverUrl: typeof edit.customCoverUrl === 'string' ? edit.customCoverUrl : t.customCoverUrl,
      note: typeof edit.note === 'string' ? edit.note : t.note,
      noteDate: typeof edit.noteDate === 'string' ? edit.noteDate : t.noteDate,
      playCount: typeof edit.playCount === 'number' && Number.isFinite(edit.playCount) ? edit.playCount : t.playCount,
      listeningSeconds:
        typeof edit.listeningSeconds === 'number' && Number.isFinite(edit.listeningSeconds)
          ? Math.max(0, Math.round(edit.listeningSeconds))
          : baseListening,
    };
  });
}

export default function App() {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);
  const [sceneryDensity, setSceneryDensity] = useState<SceneryDensity>(getInitialSceneryDensity);
  const [tracks, setTracks] = useState<Track[]>(() => getInitialTracksWithEdits());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => createInitialPlaylists());
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'home' });
  const previousViewRef = useRef<ActiveView>({ type: 'home' });
  const [searchQuery, setSearchQuery] = useState('');
  const [memoriesOnly, setMemoriesOnly] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LibraryLayoutMode>('list');
  const [sortField, setSortField] = useState<SortField>('default');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [currentTrackId, setCurrentTrackId] = useState<string | null>('demo-1');
  const [playbackQueueIds, setPlaybackQueueIds] = useState<string[]>(() =>
    createInitialDemoTracks().map((t) => t.id)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Audio FX, Equalizer, Auto-Mix & Highlights Radio State
  const [eqModalOpen, setEqModalOpen] = useState(false);
  const [eqPresetId, setEqPresetId] = useState<EqPresetId>(() =>
    readJsonStorage<EqPresetId>(EQ_PRESET_KEY, 'flat', (v): v is EqPresetId => typeof v === 'string')
  );
  const [eqGains, setEqGains] = useState<[number, number, number, number, number]>(() =>
    readJsonStorage<[number, number, number, number, number]>(
      EQ_GAINS_KEY,
      [0, 0, 0, 0, 0],
      isEqGainsTuple
    )
  );
  const [autoLevelEnabled, setAutoLevelEnabled] = useState<boolean>(() =>
    readJsonStorage<boolean>(AUTO_LEVEL_KEY, true, (v): v is boolean => typeof v === 'boolean')
  );
  const [deadAirSkipEnabled, setDeadAirSkipEnabled] = useState<boolean>(() =>
    readJsonStorage<boolean>(DEAD_AIR_KEY, true, (v): v is boolean => typeof v === 'boolean')
  );
  const [vinylNoiseEnabled, setVinylNoiseEnabled] = useState<boolean>(() =>
    readJsonStorage<boolean>(VINYL_NOISE_KEY, true, (v): v is boolean => typeof v === 'boolean')
  );
  const [autoMixEnabled, setAutoMixEnabled] = useState(false);
  const [autoMixActive, setAutoMixActive] = useState(false);
  const [highlightsOnly, setHighlightsOnly] = useState(false);
  const highlightWindowStartRef = useRef<number | null>(null);

  // A-B Loop & .wav Clip Cutter State
  const [abLoopActive, setAbLoopActive] = useState(false);
  const [abStart, setAbStart] = useState(0);
  const [abEnd, setAbEnd] = useState(10);

  // Modals & Studio Tools State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [lyricCardTrack, setLyricCardTrack] = useState<Track | null>(null);
  const [coverDesignerTrack, setCoverDesignerTrack] = useState<Track | null>(null);
  const [journalTrack, setJournalTrack] = useState<Track | null>(null);

  // Listening History & Recap Vault / Wrapped
  const [listeningHistory, setListeningHistory] = useState<ListeningSessionEvent[]>(() =>
    readJsonStorage<ListeningSessionEvent[]>(
      HISTORY_KEY,
      createSeedListeningHistory(),
      (v): v is ListeningSessionEvent[] => Array.isArray(v)
    )
  );
  const [recapVault, setRecapVault] = useState<RecapCapsule[]>(() =>
    readJsonStorage<RecapCapsule[]>(
      RECAP_VAULT_KEY,
      createSeedRecapVault(),
      (v): v is RecapCapsule[] => Array.isArray(v)
    )
  );
  const [activeCapsule, setActiveCapsule] = useState<RecapCapsule | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [miniPlayerMode, setMiniPlayerMode] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);
  const [sleepMode, setSleepMode] = useState<SleepTimerMode | null>(null);
  const [sleepClosed, setSleepClosed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const replayGainNodeRef = useRef<GainNode | null>(null);
  const eqFilterNodesRef = useRef<BiquadFilterNode[]>([]);
  const fxFadeGainNodeRef = useRef<GainNode | null>(null);
  const vinylNoiseControllerRef = useRef<VinylNoiseController | null>(null);
  const latestVinylParamsRef = useRef({
    vinylNoiseEnabled: true,
    volume: 0.8,
    muted: false,
    sleepFadeFactor: 1,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lrcInputRef = useRef<HTMLInputElement | null>(null);
  const lrcTargetTrackIdRef = useRef<string | null>(null);
  const createdObjectUrlsRef = useRef<string[]>([]);
  const autoMixHandoffLockRef = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SCENERY_STORAGE_KEY, sceneryDensity);
    } catch {
      // Ignore storage errors
    }
  }, [sceneryDensity]);

  useEffect(() => {
    try {
      window.localStorage.setItem(EQ_PRESET_KEY, JSON.stringify(eqPresetId));
      window.localStorage.setItem(EQ_GAINS_KEY, JSON.stringify(eqGains));
      window.localStorage.setItem(AUTO_LEVEL_KEY, JSON.stringify(autoLevelEnabled));
      window.localStorage.setItem(DEAD_AIR_KEY, JSON.stringify(deadAirSkipEnabled));
      window.localStorage.setItem(VINYL_NOISE_KEY, JSON.stringify(vinylNoiseEnabled));
    } catch {
      // Ignore storage errors
    }
  }, [eqPresetId, eqGains, autoLevelEnabled, deadAirSkipEnabled, vinylNoiseEnabled]);

  useEffect(() => {
    try {
      const edits: Record<string, SavedTrackEdits> = {};
      for (const t of tracks) {
        edits[t.id] = {
          title: t.title,
          artist: t.artist,
          album: t.album,
          pinnedMoments: t.pinnedMoments,
          customCoverUrl: t.customCoverUrl,
          note: t.note,
          noteDate: t.noteDate,
          playCount: t.playCount,
          listeningSeconds: t.listeningSeconds,
        };
      }
      window.localStorage.setItem(TRACK_EDITS_KEY, JSON.stringify(edits));
    } catch {
      // Ignore storage errors
    }
  }, [tracks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(listeningHistory.slice(-400)));
    } catch {
      // Ignore storage errors
    }
  }, [listeningHistory]);

  useEffect(() => {
    try {
      window.localStorage.setItem(RECAP_VAULT_KEY, JSON.stringify(recapVault));
    } catch {
      // Ignore storage errors
    }
  }, [recapVault]);

  // Scheduled Monthly (6th of month) & Grand Annual Wrapped (Nov 6th) check on launch
  useEffect(() => {
    const now = new Date();
    let lastShown: string | null = null;
    try {
      lastShown = window.localStorage.getItem(LAST_RECAP_DATE_KEY);
    } catch {
      lastShown = null;
    }
    const trigger = checkScheduledRecapTrigger(now, lastShown);
    if (!trigger) return;

    const capsule =
      trigger === 'yearly'
        ? buildAnnualWrappedSummary(tracks, listeningHistory, now.getFullYear())
        : buildMonthlySoundCapsule(tracks, listeningHistory, now);

    setRecapVault((prev) =>
      prev.some((c) => c.id === capsule.id) ? prev : [capsule, ...prev]
    );
    setActiveCapsule(capsule);
    try {
      window.localStorage.setItem(LAST_RECAP_DATE_KEY, toLocalDateKey(now));
    } catch {
      // Ignore storage errors
    }
    // Run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      vinylNoiseControllerRef.current?.dispose();
      vinylNoiseControllerRef.current = null;
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  // Sleep Timer countdown with 60s gradual fade & pause
  useEffect(() => {
    if (sleepRemainingSeconds === null || sleepMode !== 'countdown') return;
    const timeoutId = window.setTimeout(() => {
      const { nextRemaining, expired } = tickCountdown(sleepRemainingSeconds);
      setSleepRemainingSeconds(nextRemaining);
      if (expired) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setSleepMode(null);
        setSleepClosed(true);
        try {
          window.close();
        } catch {
          // Browsers block script close on non-popup tabs; sleepClosed state handles exit cleanly
        }
      }
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [sleepRemainingSeconds, sleepMode]);

  const handleStartSleepTimer = useCallback((minutes: number) => {
    const secs = minutesToSeconds(minutes);
    if (secs > 0) {
      setSleepClosed(false);
      setSleepMode('countdown');
      setSleepRemainingSeconds(secs);
    }
  }, []);

  const handleStartSleepAfterTrack = useCallback(() => {
    setSleepClosed(false);
    setSleepRemainingSeconds(null);
    setSleepMode('after-track');
  }, []);

  const handleCancelSleepTimer = useCallback(() => {
    setSleepRemainingSeconds(null);
    setSleepMode(null);
  }, []);

  // Lazily connect HTML5 <audio> -> ReplayGain -> 5-Band EQ -> FadeGain -> Analyser -> Destination
  const ensureAudioAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        const ctx = new AudioCtx();
        const source = ctx.createMediaElementSource(audio);

        const replayGainNode = ctx.createGain();
        replayGainNode.gain.value = 1;

        const eqFilters = EQ_BAND_FREQUENCIES.map((freq, idx) => {
          const filter = ctx.createBiquadFilter();
          filter.type =
            idx === 0
              ? 'lowshelf'
              : idx === EQ_BAND_FREQUENCIES.length - 1
                ? 'highshelf'
                : 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1.1;
          filter.gain.value = eqGains[idx] ?? 0;
          return filter;
        });

        const fadeGainNode = ctx.createGain();
        fadeGainNode.gain.value = 1;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.78;

        // Connect DSP chain
        let tail: AudioNode = source;
        tail.connect(replayGainNode);
        tail = replayGainNode;
        for (const filter of eqFilters) {
          tail.connect(filter);
          tail = filter;
        }
        tail.connect(fadeGainNode);
        fadeGainNode.connect(analyser);
        analyser.connect(ctx.destination);

        audioCtxRef.current = ctx;
        sourceNodeRef.current = source;
        replayGainNodeRef.current = replayGainNode;
        eqFilterNodesRef.current = eqFilters;
        fxFadeGainNodeRef.current = fadeGainNode;
        const noiseCtrl = createVinylCrackleController(ctx);
        const vp = latestVinylParamsRef.current;
        noiseCtrl.setTargetGain(
          computeVinylNoiseGain({
            isPlaying: true,
            enabled: vp.vinylNoiseEnabled,
            volume: vp.volume,
            muted: vp.muted,
            sleepFadeFactor: vp.sleepFadeFactor,
          })
        );
        vinylNoiseControllerRef.current = noiseCtrl;
        setAnalyserNode(analyser);
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => undefined);
      }
    } catch {
      // Fallback safely if Web Audio API cannot attach
    }
  }, [eqGains]);

  // Apply real-time EQ band gain updates smoothly to BiquadFilterNodes
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const filters = eqFilterNodesRef.current;
    if (!ctx || filters.length === 0) return;

    const now = ctx.currentTime;
    filters.forEach((filter, idx) => {
      const targetDb = clampEqGainDb(eqGains[idx] ?? 0);
      try {
        filter.gain.setTargetAtTime(targetDb, now, 0.04);
      } catch {
        filter.gain.value = targetDb;
      }
    });
  }, [eqGains]);

  const currentTrack = useMemo(
    () => tracks.find((t) => t.id === currentTrackId) ?? null,
    [tracks, currentTrackId]
  );

  // Sync ReplayGain node whenever Auto-Level setting or active track changes
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const gainNode = replayGainNodeRef.current;
    if (!ctx || !gainNode) return;
    const targetGain = autoLevelEnabled ? currentTrack?.replayGain ?? 1 : 1;
    try {
      gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
    } catch {
      gainNode.gain.value = targetGain;
    }
  }, [autoLevelEnabled, currentTrack]);

  const activePlaylist = useMemo(() => {
    if (activeView.type !== 'playlist') return null;
    return playlists.find((p) => p.id === activeView.playlistId) ?? null;
  }, [activeView, playlists]);

  const viewTracks = useMemo(() => {
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    if (activeView.type === 'liked') {
      return tracks.filter((t) => t.liked);
    }
    if (activeView.type === 'playlist' && activePlaylist) {
      return activePlaylist.trackIds
        .map((id) => trackMap.get(id))
        .filter((t): t is Track => Boolean(t));
    }
    return tracks;
  }, [tracks, activeView, activePlaylist]);

  const visibleTracks = useMemo(() => {
    const base = memoriesOnly
      ? viewTracks.filter((t) => Boolean(t.note && t.note.trim().length > 0))
      : viewTracks;
    const filtered = filterTracks(base, searchQuery);
    return sortTracks(filtered, sortField, sortDirection);
  }, [viewTracks, memoriesOnly, searchQuery, sortField, sortDirection]);

  const memoriesCount = useMemo(
    () => viewTracks.filter((t) => Boolean(t.note && t.note.trim().length > 0)).length,
    [viewTracks]
  );

  const duplicateCount = useMemo(
    () => findDuplicateTrackGroups(tracks).length,
    [tracks]
  );

  const likedCount = useMemo(
    () => tracks.filter((t) => t.liked).length,
    [tracks]
  );

  const activeQueue = useMemo(() => {
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    const resolved = playbackQueueIds
      .map((id) => trackMap.get(id))
      .filter((t): t is Track => Boolean(t));
    return resolved.length > 0 ? resolved : tracks;
  }, [tracks, playbackQueueIds]);

  const nextTrackInQueue = useMemo(() => {
    if (activeQueue.length === 0) return null;
    const idx = activeQueue.findIndex((t) => t.id === currentTrackId);
    const nextIdx = getNextTrackIndex({
      currentIndex: idx,
      queueLength: activeQueue.length,
      shuffle,
      repeatMode,
      autoAdvance: true,
    });
    return nextIdx >= 0 ? activeQueue[nextIdx] ?? null : null;
  }, [activeQueue, currentTrackId, repeatMode, shuffle]);

  const getHighlightAnchorForTrack = useCallback((track: Track): number => {
    const firstPin = track.pinnedMoments?.[0];
    if (firstPin && Number.isFinite(firstPin.time)) {
      return Math.max(0, firstPin.time);
    }
    const dur = track.duration || 20;
    return Math.max(0, Math.min(dur - 4, Number((dur * 0.35).toFixed(1))));
  }, []);

  const playTrackFromQueue = useCallback(
    (track: Track, queueIds?: string[]) => {
      ensureAudioAnalyser();
      autoMixHandoffLockRef.current = false;
      setAutoMixActive(false);

      if (queueIds && queueIds.length > 0) {
        setPlaybackQueueIds(queueIds);
      }
      const startPos = highlightsOnly
        ? getHighlightAnchorForTrack(track)
        : deadAirSkipEnabled && track.trimStart
          ? track.trimStart
          : 0;
      highlightWindowStartRef.current = highlightsOnly ? startPos : null;

      setCurrentTrackId(track.id);
      setCurrentTime(startPos);
      setDuration(track.duration);
      setIsPlaying(true);

      const nowMs = Date.now();
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? { ...t, playCount: t.playCount + 1, lastPlayedAt: nowMs }
            : t
        )
      );
      setListeningHistory((prev) => [
        ...prev,
        {
          id: `ev-${nowMs}-${Math.random().toString(36).slice(2, 6)}`,
          trackId: track.id,
          trackTitle: track.title,
          artistName: track.artist,
          timestamp: nowMs,
          durationSeconds: Math.max(20, Math.round(track.duration || 30)),
          mood: track.mood ?? 'Groove',
          bpm: track.bpm ?? 112,
        },
      ]);
    },
    [deadAirSkipEnabled, ensureAudioAnalyser, getHighlightAnchorForTrack, highlightsOnly]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    if (audio.dataset.trackId !== currentTrack.id) {
      audio.src = currentTrack.src;
      audio.dataset.trackId = currentTrack.id;
      const startAt = highlightsOnly
        ? getHighlightAnchorForTrack(currentTrack)
        : deadAirSkipEnabled && currentTrack.trimStart
          ? currentTrack.trimStart
          : 0;
      audio.currentTime = startAt;
      highlightWindowStartRef.current = highlightsOnly ? startAt : null;

      // Smooth fade-in and playbackRate reset if entering from DJ Auto-Mix
      if (fxFadeGainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const g = fxFadeGainNodeRef.current.gain;
        try {
          g.cancelScheduledValues(ctx.currentTime);
          g.setValueAtTime(autoMixEnabled ? 0.35 : 1, ctx.currentTime);
          g.linearRampToValueAtTime(1, ctx.currentTime + 0.9);
        } catch {
          g.value = 1;
        }
      }
      audio.playbackRate = 1;
    }

    if (isPlaying) {
      ensureAudioAnalyser();
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [
    autoMixEnabled,
    currentTrack,
    deadAirSkipEnabled,
    ensureAudioAnalyser,
    getHighlightAnchorForTrack,
    highlightsOnly,
    isPlaying,
  ]);

  // Apply user volume * gentle 60-second Sleep Timer fade factor
  const sleepFadeFactor =
    sleepMode === 'countdown' ? getSleepFadeFactor(sleepRemainingSeconds) : 1;
  const nightDimOpacity =
    sleepMode === 'countdown' ? getNightDimOpacity(sleepRemainingSeconds) : 0;

  latestVinylParamsRef.current = {
    vinylNoiseEnabled,
    volume,
    muted,
    sleepFadeFactor,
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume * sleepFadeFactor));
    audio.muted = muted;

    const targetNoiseGain = computeVinylNoiseGain({
      isPlaying,
      enabled: vinylNoiseEnabled,
      volume,
      muted,
      sleepFadeFactor,
    });
    vinylNoiseControllerRef.current?.setTargetGain(targetNoiseGain);
    audio.dataset.vinylNoiseGain = String(targetNoiseGain);
    audio.dataset.vinylNoiseEnabled = vinylNoiseEnabled ? 'true' : 'false';
  }, [isPlaying, vinylNoiseEnabled, volume, muted, sleepFadeFactor]);

  // Accumulate real listening time every second while audio is actively playing
  useEffect(() => {
    if (!isPlaying || !currentTrackId) return;
    const intervalId = window.setInterval(() => {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === currentTrackId
            ? { ...t, listeningSeconds: getTrackListeningSeconds(t) + 1 }
            : t
        )
      );
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isPlaying, currentTrackId]);

  const advanceTrack = useCallback(
    (direction: 'next' | 'prev', autoAdvance = false) => {
      if (activeQueue.length === 0) return;

      if (autoAdvance && sleepMode === 'after-track') {
        audioRef.current?.pause();
        setIsPlaying(false);
        setSleepMode(null);
        setSleepClosed(true);
        return;
      }

      const currentIndex = activeQueue.findIndex((t) => t.id === currentTrackId);

      if (direction === 'prev') {
        const audio = audioRef.current;
        if (audio && audio.currentTime > 3) {
          audio.currentTime = 0;
          setCurrentTime(0);
          return;
        }
        const prevIndex = getPreviousTrackIndex({
          currentIndex,
          queueLength: activeQueue.length,
          repeatMode,
        });
        if (prevIndex >= 0 && activeQueue[prevIndex]) {
          if (prevIndex === currentIndex && audio) {
            audio.currentTime = 0;
            setCurrentTime(0);
            if (isPlaying) {
              audio.play().catch(() => undefined);
            }
          } else {
            playTrackFromQueue(activeQueue[prevIndex]);
          }
        }
        return;
      }

      const nextIndex = getNextTrackIndex({
        currentIndex,
        queueLength: activeQueue.length,
        shuffle,
        repeatMode,
        autoAdvance,
      });

      if (nextIndex === -1) {
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }

      const target = activeQueue[nextIndex];
      if (!target) return;

      if (target.id === currentTrackId && audioRef.current) {
        const restartAt = highlightsOnly ? getHighlightAnchorForTrack(target) : 0;
        audioRef.current.currentTime = restartAt;
        setCurrentTime(restartAt);
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        playTrackFromQueue(target);
      }
    },
    [
      activeQueue,
      currentTrackId,
      getHighlightAnchorForTrack,
      highlightsOnly,
      isPlaying,
      playTrackFromQueue,
      repeatMode,
      shuffle,
      sleepMode,
    ]
  );

  const handleSeek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      const maxD =
        audio && Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : currentTrack?.duration ?? 0;
      const clamped = Math.max(0, maxD > 0 ? Math.min(maxD, time) : time);
      setCurrentTime(clamped);
      if (audio && Number.isFinite(clamped)) {
        audio.currentTime = clamped;
      }
    },
    [currentTrack]
  );

  // Keyboard Shortcuts: Space (Play/Pause), ArrowLeft (-5s), ArrowRight (+5s), M (Mute)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (isEditable) return;

      if (e.code === 'Space') {
        if (target && target.tagName === 'BUTTON') return;
        if (!currentTrack) return;
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        if (!currentTrack) return;
        e.preventDefault();
        const cur = audioRef.current ? audioRef.current.currentTime : currentTime;
        handleSeek(cur - 5);
      } else if (e.code === 'ArrowRight') {
        if (!currentTrack) return;
        e.preventDefault();
        const cur = audioRef.current ? audioRef.current.currentTime : currentTime;
        handleSeek(cur + 5);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentTime, currentTrack, handleSeek]);

  const handleSortChange = (field: Exclude<SortField, 'default'>) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortField('default');
      setSortDirection('asc');
    }
  };

  const handleSelectTrack = (track: Track) => {
    if (track.id === currentTrackId) {
      setIsPlaying((prev) => !prev);
      return;
    }
    const queueIds = visibleTracks.map((t) => t.id);
    playTrackFromQueue(track, queueIds);
  };

  const handlePlayAllInView = () => {
    if (visibleTracks.length === 0) return;
    const currentInView = visibleTracks.some((t) => t.id === currentTrackId);
    if (currentInView) {
      setIsPlaying((prev) => !prev);
      return;
    }
    const queueIds = visibleTracks.map((t) => t.id);
    playTrackFromQueue(visibleTracks[0], queueIds);
  };

  const handleShuffleAllInView = () => {
    if (visibleTracks.length === 0) return;
    setShuffle(true);
    const randomIdx = Math.floor(Math.random() * visibleTracks.length);
    const queueIds = visibleTracks.map((t) => t.id);
    playTrackFromQueue(visibleTracks[randomIdx], queueIds);
  };

  const handleToggleHighlightsOnly = () => {
    setHighlightsOnly((prev) => {
      const next = !prev;
      if (next && currentTrack) {
        const anchor = getHighlightAnchorForTrack(currentTrack);
        highlightWindowStartRef.current = anchor;
        handleSeek(anchor);
        if (!isPlaying) setIsPlaying(true);
      } else {
        highlightWindowStartRef.current = null;
      }
      return next;
    });
  };

  const handleToggleLike = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, liked: !track.liked } : track))
    );
  };

  const handleCreatePlaylist = (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setActiveView({ type: 'playlist', playlistId: newPlaylist.id });
  };

  const handleRenamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => (pl.id === playlistId ? { ...pl, name: newName } : pl))
    );
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    if (activeView.type === 'playlist' && activeView.playlistId === playlistId) {
      setActiveView({ type: 'home' });
    }
  };

  const handleArrangeEnergyArc = (playlistId: string, arc: EnergyArcType) => {
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const plTracks = pl.trackIds
          .map((id) => trackMap.get(id))
          .filter((t): t is Track => Boolean(t));
        const orderedIds = arrangePlaylistByEnergyArc(plTracks, arc);
        return { ...pl, trackIds: orderedIds };
      })
    );
  };

  const handleAddTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.trackIds.includes(trackId)) return pl;
        return { ...pl, trackIds: [...pl.trackIds, trackId] };
      })
    );
  };

  const handleRemoveTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) };
      })
    );
  };

  const handleRemoveTrackFromLibrary = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setPlaylists((prev) =>
      prev.map((pl) => ({ ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) }))
    );
    setPlaybackQueueIds((prev) => prev.filter((id) => id !== trackId));
    if (currentTrackId === trackId) {
      setIsPlaying(false);
      setCurrentTrackId(null);
    }
  };

  const handleAddToQueue = (trackId: string) => {
    setPlaybackQueueIds((prev) => {
      const base = prev.length > 0 ? prev : tracks.map((t) => t.id);
      return [...base, trackId];
    });
    setRightPanelOpen(true);
  };

  const handleReorderQueue = (fromIndex: number, toIndex: number) => {
    setPlaybackQueueIds((prev) => {
      const base = prev.length > 0 ? prev : tracks.map((t) => t.id);
      return reorderQueue(base, fromIndex, toIndex);
    });
  };

  const handleRemoveFromQueue = (index: number) => {
    setPlaybackQueueIds((prev) => {
      const base = prev.length > 0 ? prev : tracks.map((t) => t.id);
      return removeFromQueue(base, index);
    });
  };

  const handleAddPinnedMoment = (trackId: string, time: number, label: string) => {
    const newPin: PinnedMoment = {
      id: `pin-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      time: Number(time.toFixed(1)),
      label,
      createdAt: Date.now(),
    };
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              pinnedMoments: [...(t.pinnedMoments ?? []), newPin].sort((a, b) => a.time - b.time),
            }
          : t
      )
    );
  };

  const handleRemovePinnedMoment = (trackId: string, momentId: string) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              pinnedMoments: (t.pinnedMoments ?? []).filter((p) => p.id !== momentId),
            }
          : t
      )
    );
  };

  const handleSaveTrackDetails = (trackId: string, details: TrackDetailsDraft) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              title: details.title,
              artist: details.artist,
              album: details.album,
              customCoverUrl: details.customCoverUrl,
            }
          : t
      )
    );
  };

  const handleSaveTrackNote = (trackId: string, note: string, noteDate: string) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? { ...t, note: note || undefined, noteDate: note ? noteDate || undefined : undefined }
          : t
      )
    );
  };

  const handleSelectEqPreset = (presetId: Exclude<EqPresetId, 'custom'>) => {
    const found = EQ_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setEqPresetId(presetId);
    setEqGains([...found.gains] as [number, number, number, number, number]);
  };

  const handleChangeEqBandGain = (bandIndex: number, dbValue: number) => {
    setEqPresetId('custom');
    setEqGains((prev) => {
      const next = [...prev] as [number, number, number, number, number];
      next[bandIndex] = clampEqGainDb(dbValue);
      return next;
    });
  };

  const handleTriggerUploadLrc = (trackId: string) => {
    lrcTargetTrackIdRef.current = trackId;
    lrcInputRef.current?.click();
  };

  const handleLrcFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = lrcTargetTrackIdRef.current ?? currentTrackId;
    e.target.value = '';
    if (!file || !targetId) return;

    const text = await file.text();
    const parsedLines = parseLrc(text);
    setTracks((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, lyrics: parsedLines } : t))
    );
    setActiveView({ type: 'lyrics' });
  };

  const processLocalFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const addedTracks: Track[] = [];
      const now = Date.now();
      Array.from(fileList).forEach((file, idx) => {
        const isAudio =
          file.type.startsWith('audio/') ||
          /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(file.name);
        if (!isAudio) return;

        const objectUrl = URL.createObjectURL(file);
        createdObjectUrlsRef.current.push(objectUrl);

        const parsed = parseAudioFilename(file.name);
        const trackId = `local-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
        addedTracks.push({
          id: trackId,
          title: parsed.title,
          artist: parsed.artist,
          album: parsed.album,
          duration: 0,
          src: objectUrl,
          isLocal: true,
          liked: false,
          coverSeed: computeCoverSeed(file.name + idx),
          playCount: 0,
          listeningSeconds: 0,
          addedAt: now + idx,
          fileName: file.name,
          fileSizeBytes: file.size,
        });

        const probe = new Audio();
        probe.preload = 'metadata';
        probe.src = objectUrl;
        probe.onloadedmetadata = () => {
          if (Number.isFinite(probe.duration) && probe.duration > 0) {
            setTracks((prev) =>
              prev.map((t) => (t.id === trackId ? { ...t, duration: probe.duration } : t))
            );
          }
          probe.src = '';
        };

        // Decode PCM asynchronously for ReplayGain RMS loudness, -50dB dead-air bounds, BPM, mood & waveform peaks
        file
          .arrayBuffer()
          .then(async (arr) => {
            const AudioCtx =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            try {
              const decoded = await ctx.decodeAudioData(arr.slice(0));
              const mono = decoded.getChannelData(0);
              const analysis = analyzeMonoAudioData(mono, decoded.sampleRate);
              setTracks((prev) =>
                prev.map((t) =>
                  t.id === trackId
                    ? {
                        ...t,
                        duration: t.duration > 0 ? t.duration : decoded.duration,
                        sampleRate: decoded.sampleRate,
                        rmsLoudness: analysis.rmsLoudness,
                        replayGain: analysis.replayGain,
                        trimStart: analysis.trimStart,
                        trimEnd: analysis.trimEnd,
                        waveformPeaks: analysis.waveformPeaks,
                        bpm: analysis.bpm,
                        mood: analysis.mood,
                      }
                    : t
                )
              );
            } finally {
              await ctx.close().catch(() => undefined);
            }
          })
          .catch(() => undefined);
      });

      if (addedTracks.length > 0) {
        setTracks((prev) => [...addedTracks, ...prev]);
        setPlaybackQueueIds((prev) => [...addedTracks.map((t) => t.id), ...prev]);
        setActiveView({ type: 'home' });
        if (!currentTrackId) {
          setCurrentTrackId(addedTracks[0].id);
        }
      }
    },
    [currentTrackId]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    processLocalFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    processLocalFiles(e.dataTransfer.files);
  };

  const handlePreviewMonthlyRecap = () => {
    const capsule = buildMonthlySoundCapsule(tracks, listeningHistory, new Date());
    setRecapVault((prev) =>
      prev.some((c) => c.id === capsule.id) ? prev : [capsule, ...prev]
    );
    setActiveCapsule(capsule);
  };

  const handlePreviewYearlyWrapped = () => {
    const capsule = buildAnnualWrappedSummary(tracks, listeningHistory, new Date().getFullYear());
    setRecapVault((prev) =>
      prev.some((c) => c.id === capsule.id) ? prev : [capsule, ...prev]
    );
    setActiveCapsule(capsule);
  };

  const isCurrentViewPlaying = useMemo(
    () => Boolean(currentTrackId && visibleTracks.some((t) => t.id === currentTrackId)),
    [currentTrackId, visibleTracks]
  );

  const songContextLabel = useMemo(() => {
    const prevView = previousViewRef.current;
    if (prevView.type === 'playlist') {
      const pl = playlists.find((p) => p.id === prevView.playlistId);
      if (pl) return pl.name;
    }
    if (activeView.type === 'playlist' && activePlaylist) return activePlaylist.name;
    if (prevView.type === 'liked' || activeView.type === 'liked') return 'Liked Songs';
    return 'All Local Tracks';
  }, [activePlaylist, activeView.type, playlists]);

  useEffect(() => {
    if (activeView.type !== 'lyrics') {
      previousViewRef.current = activeView;
    }
  }, [activeView]);

  const handleToggleSongView = useCallback(() => {
    setActiveView((prev) =>
      prev.type === 'lyrics' ? previousViewRef.current : { type: 'lyrics' }
    );
  }, []);

  const eqActive = eqPresetId !== 'flat' || eqGains.some((g) => Math.abs(g) > 0.05);

  const handleAudioTimeUpdate = (audioEl: HTMLAudioElement) => {
    const t = audioEl.currentTime;
    setCurrentTime(t);

    if (!currentTrack || !isPlaying) return;
    const totalDur =
      Number.isFinite(audioEl.duration) && audioEl.duration > 0
        ? audioEl.duration
        : currentTrack.duration;

    // 1) A-B Loop Audition
    if (abLoopActive && abEnd > abStart + 0.3 && t >= abEnd) {
      audioEl.currentTime = abStart;
      setCurrentTime(abStart);
      return;
    }

    // 2) Highlights-Only Radio (20-second snippet per track starting at pinned moment)
    if (highlightsOnly && totalDur > 0) {
      const anchor = highlightWindowStartRef.current ?? getHighlightAnchorForTrack(currentTrack);
      if (t >= Math.min(totalDur - 0.15, anchor + 20)) {
        advanceTrack('next', true);
        return;
      }
    }

    // 3) Dead-Air Skipper (trim trailing silence below -50dB)
    if (
      deadAirSkipEnabled &&
      !abLoopActive &&
      currentTrack.trimEnd &&
      currentTrack.trimEnd > 1 &&
      totalDur > currentTrack.trimEnd + 0.25 &&
      t >= currentTrack.trimEnd
    ) {
      advanceTrack('next', true);
      return;
    }

    // 4) DJ Smart Beat-Matched Auto-Mix in final 8 seconds
    if (
      autoMixEnabled &&
      !abLoopActive &&
      !highlightsOnly &&
      nextTrackInQueue &&
      nextTrackInQueue.id !== currentTrack.id &&
      totalDur > 9
    ) {
      const remaining = totalDur - t;
      const transition = computeAutoMixTransition(
        remaining,
        currentTrack.bpm ?? 112,
        nextTrackInQueue.bpm ?? 112,
        true
      );
      setAutoMixActive(transition.active);
      if (transition.active) {
        audioEl.playbackRate = transition.playbackRate;
        if (fxFadeGainNodeRef.current && audioCtxRef.current) {
          fxFadeGainNodeRef.current.gain.setTargetAtTime(
            transition.outgoingGain,
            audioCtxRef.current.currentTime,
            0.05
          );
        }
        if (transition.shouldAdvanceNow && !autoMixHandoffLockRef.current) {
          autoMixHandoffLockRef.current = true;
          advanceTrack('next', true);
        }
      } else if (audioEl.playbackRate !== 1) {
        audioEl.playbackRate = 1;
      }
    } else if (autoMixActive) {
      setAutoMixActive(false);
      if (audioEl.playbackRate !== 1) {
        audioEl.playbackRate = 1;
      }
    }
  };

  const sharedAudioElement = (
    <audio
      ref={audioRef}
      onTimeUpdate={(e) => handleAudioTimeUpdate(e.currentTarget)}
      onLoadedMetadata={(e) => {
        const d = e.currentTarget.duration;
        if (Number.isFinite(d) && d > 0) {
          setDuration(d);
          if (currentTrackId) {
            setTracks((prev) =>
              prev.map((t) => (t.id === currentTrackId ? { ...t, duration: d } : t))
            );
          }
        }
      }}
      onEnded={() => advanceTrack('next', true)}
    />
  );

  // Warm amber night-dimming overlay during final 60s of countdown Sleep Timer
  const nightDimOverlay =
    nightDimOpacity > 0 ? (
      <div
        aria-hidden="true"
        data-testid="sleep-night-dim-overlay"
        className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle at center, rgba(217, 119, 6, 0.28) 0%, rgba(12, 8, 4, 0.85) 100%)',
          opacity: nightDimOpacity,
        }}
      />
    ) : null;

  if (sleepClosed) {
    return (
      <div
        data-testid="sleep-closed-screen"
        className="theme-canvas-texture min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
      >
        <ThemeBackdrop
          theme={theme}
          isPlaying={false}
          density={sceneryDensity}
          analyser={null}
        />
        <div className="theme-panel relative z-10 max-w-md w-full p-7 text-center space-y-4">
          <div
            className="w-14 h-14 mx-auto flex items-center justify-center"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              border: 'var(--border-width) var(--border-style) var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Moon className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="font-theme-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Sleep Timer Complete
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Audio faded gently out and your listening session has been paused.
          </p>
          <button
            type="button"
            onClick={() => setSleepClosed(false)}
            className="theme-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Reopen ChordDeck</span>
          </button>
        </div>
      </div>
    );
  }

  if (miniPlayerMode) {
    return (
      <>
        {sharedAudioElement}
        {nightDimOverlay}
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          muted={muted}
          shuffle={shuffle}
          repeatMode={repeatMode}
          theme={theme}
          analyser={analyserNode}
          sleepRemainingSeconds={sleepRemainingSeconds}
          sleepMode={sleepMode}
          onStartSleepTimer={handleStartSleepTimer}
          onStartSleepAfterTrack={handleStartSleepAfterTrack}
          onCancelSleepTimer={handleCancelSleepTimer}
          onThemeChange={setTheme}
          onTogglePlayPause={() => {
            if (!currentTrack) return;
            setIsPlaying((prev) => !prev);
          }}
          onPrevious={() => advanceTrack('prev')}
          onNext={() => advanceTrack('next')}
          onSeek={handleSeek}
          onVolumeChange={(nextVolume) => {
            setVolume(nextVolume);
            if (nextVolume > 0 && muted) setMuted(false);
          }}
          onToggleMute={() => setMuted((prev) => !prev)}
          onToggleShuffle={() => setShuffle((prev) => !prev)}
          onCycleRepeat={() =>
            setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
          }
          onExpandFullPlayer={() => setMiniPlayerMode(false)}
        />
      </>
    );
  }

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      {sharedAudioElement}
      {nightDimOverlay}

      {/* Hidden local audio picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.ogg,.m4a,audio/*"
        multiple
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload local audio files"
      />

      {/* Hidden .lrc lyrics picker */}
      <input
        ref={lrcInputRef}
        type="file"
        accept=".lrc,text/plain"
        onChange={handleLrcFileChange}
        className="sr-only"
        aria-label="Upload synced LRC lyrics file"
      />

      {/* Main Split Workspace: Left Sidebar + Center Content + Right Queue Panel */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          playlists={playlists}
          likedCount={likedCount}
          totalTracksCount={tracks.length}
          duplicateCount={duplicateCount}
          onOpenCreatePlaylist={() => setCreateModalOpen(true)}
          onTriggerAddMusic={() => fileInputRef.current?.click()}
          onOpenCleanup={() => setCleanupModalOpen(true)}
          onRenamePlaylist={handleRenamePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          theme={theme}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main
          className="theme-canvas-texture flex-1 min-w-0 flex flex-col overflow-y-auto relative"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFiles(true);
          }}
          onDragLeave={() => setIsDraggingFiles(false)}
          onDrop={handleDrop}
        >
          <div className="sticky top-0 h-0 w-full z-0 pointer-events-none overflow-visible">
            <div className="relative w-full h-[calc(100vh-88px)] overflow-hidden pointer-events-none">
              <ThemeBackdrop
                theme={theme}
                isPlaying={isPlaying}
                density={sceneryDensity}
                analyser={analyserNode}
                layer="background"
              />
            </div>
          </div>

          <div className="hidden md:block sticky top-0 h-0 w-full z-20 pointer-events-none overflow-visible">
            <div className="relative w-full h-[calc(100vh-88px)] overflow-hidden pointer-events-none">
              <ThemeBackdrop
                theme={theme}
                isPlaying={isPlaying}
                density={sceneryDensity}
                analyser={analyserNode}
                layer="foreground"
              />
            </div>
          </div>

          <TopHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTheme={theme}
            onThemeChange={setTheme}
            sceneryDensity={sceneryDensity}
            onSceneryDensityChange={setSceneryDensity}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            rightPanelOpen={rightPanelOpen}
            onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
            onEnterMiniPlayer={() => setMiniPlayerMode(true)}
          />

          <div className="relative z-10 flex-1 flex flex-col pointer-events-none">
            {activeView.type !== 'lyrics' && (
              <HeaderBanner
                activeView={activeView}
                activePlaylist={activePlaylist}
                tracks={visibleTracks}
                theme={theme}
                isPlaying={isPlaying}
                isCurrentViewPlaying={isCurrentViewPlaying}
                highlightsOnly={highlightsOnly}
                layoutMode={layoutMode}
                onToggleHighlightsOnly={handleToggleHighlightsOnly}
                onChangeLayoutMode={setLayoutMode}
                onArrangeEnergyArc={handleArrangeEnergyArc}
                onPlayAll={handlePlayAllInView}
                onShuffleAll={handleShuffleAllInView}
                onTriggerAddMusic={() => fileInputRef.current?.click()}
                onRenamePlaylist={handleRenamePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
              />
            )}

            {activeView.type === 'playlists' ? (
              <PlaylistsGrid
                playlists={playlists}
                allTracks={tracks}
                theme={theme}
                onOpenPlaylist={(playlistId) => setActiveView({ type: 'playlist', playlistId })}
                onPlayPlaylist={(playlistId) => {
                  const pl = playlists.find((p) => p.id === playlistId);
                  if (!pl || pl.trackIds.length === 0) return;
                  const firstTrack = tracks.find((t) => t.id === pl.trackIds[0]);
                  if (firstTrack) {
                    playTrackFromQueue(firstTrack, pl.trackIds);
                  }
                }}
                onRenamePlaylist={handleRenamePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onOpenCreatePlaylist={() => setCreateModalOpen(true)}
              />
            ) : activeView.type === 'lyrics' ? (
              <LyricsView
                currentTrack={currentTrack}
                currentTime={currentTime}
                isPlaying={isPlaying}
                contextLabel={songContextLabel}
                theme={theme}
                onSeek={handleSeek}
                onToggleLikeCurrent={() => {
                  if (currentTrack) handleToggleLike(currentTrack.id);
                }}
                onTriggerUploadLrc={handleTriggerUploadLrc}
                onOpenLyricCard={(t) => setLyricCardTrack(t)}
                onOpenCoverDesigner={(t) => setCoverDesignerTrack(t)}
                onOpenTrackJournal={(t) => setJournalTrack(t)}
                onAddPinnedMoment={handleAddPinnedMoment}
                onRemovePinnedMoment={handleRemovePinnedMoment}
                onCloseSongView={() => setActiveView(previousViewRef.current)}
              />
            ) : activeView.type === 'stats' ? (
              <StatsView
                tracks={tracks}
                listeningHistory={listeningHistory}
                recapVault={recapVault}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
                theme={theme}
                onSelectTrack={handleSelectTrack}
                onOpenCapsule={(cap) => setActiveCapsule(cap)}
                onPreviewMonthlyRecap={handlePreviewMonthlyRecap}
                onPreviewYearlyWrapped={handlePreviewYearlyWrapped}
                onGoHome={() => setActiveView({ type: 'home' })}
              />
            ) : activeView.type === 'home' && layoutMode === 'shelf' ? (
              <RecordShelfView
                tracks={visibleTracks}
                playlists={playlists}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
                theme={theme}
                onSelectTrack={handleSelectTrack}
                onOpenPlaylist={(playlistId) => setActiveView({ type: 'playlist', playlistId })}
                onPlayPlaylist={(playlistId) => {
                  const pl = playlists.find((p) => p.id === playlistId);
                  if (!pl || pl.trackIds.length === 0) return;
                  const firstTrack = tracks.find((t) => t.id === pl.trackIds[0]);
                  if (firstTrack) {
                    playTrackFromQueue(firstTrack, pl.trackIds);
                  }
                }}
              />
            ) : (
              <>
                {activeView.type === 'home' && !searchQuery && !memoriesOnly && (
                  <HomeDashboard
                    tracks={tracks}
                    playlists={playlists}
                    currentTrackId={currentTrackId}
                    isPlaying={isPlaying}
                    theme={theme}
                    onPlayTrack={(track) => handleSelectTrack(track)}
                    onNavigate={setActiveView}
                    onPlayPlaylist={(playlistId) => {
                      const pl = playlists.find((p) => p.id === playlistId);
                      if (!pl || pl.trackIds.length === 0) return;
                      const firstTrack = tracks.find((t) => t.id === pl.trackIds[0]);
                      if (firstTrack) {
                        playTrackFromQueue(firstTrack, pl.trackIds);
                      }
                    }}
                  />
                )}

                <TrackTable
                  tracks={visibleTracks}
                  currentTrackId={currentTrackId}
                  isPlaying={isPlaying}
                  theme={theme}
                  activeView={activeView}
                  playlists={playlists}
                  searchQuery={searchQuery}
                  memoriesOnly={memoriesOnly}
                  memoriesCount={memoriesCount}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onToggleMemoriesOnly={() => setMemoriesOnly((v) => !v)}
                  onSortChange={handleSortChange}
                  onSelectTrack={handleSelectTrack}
                  onToggleLike={handleToggleLike}
                  onAddToQueue={handleAddToQueue}
                  onAddTrackToPlaylist={handleAddTrackToPlaylist}
                  onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
                  onTriggerUploadLrc={handleTriggerUploadLrc}
                  onOpenCoverDesigner={(t) => setCoverDesignerTrack(t)}
                  onOpenTrackJournal={(t) => setJournalTrack(t)}
                  onOpenCreatePlaylist={() => setCreateModalOpen(true)}
                  onTriggerAddMusic={() => fileInputRef.current?.click()}
                  onClearSearch={() => setSearchQuery('')}
                />
              </>
            )}
          </div>

          {isDraggingFiles && (
            <div
              className="fixed inset-0 z-40 flex items-center justify-center p-6 pointer-events-none"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
            >
              <div className="theme-panel px-8 py-6 text-center">
                <p
                  className="font-theme-display text-lg font-bold"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Drop Audio Files Here
                </p>
                <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Supports .mp3, .wav, .ogg, and .m4a
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Collapsible Right-Side Now Playing & Queue Panel */}
        <div className="hidden lg:flex h-full shrink-0">
          <RightQueuePanel
            open={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
            contextLabel={songContextLabel}
            currentTrack={currentTrack}
            currentTime={currentTime}
            queueTracks={activeQueue}
            isPlaying={isPlaying}
            theme={theme}
            onPlayTrack={(track) => playTrackFromQueue(track)}
            onReorderQueue={handleReorderQueue}
            onRemoveFromQueue={handleRemoveFromQueue}
            onToggleLikeCurrent={() => {
              if (currentTrack) handleToggleLike(currentTrack.id);
            }}
            onOpenLyrics={() => setActiveView({ type: 'lyrics' })}
            onTriggerUploadLrc={handleTriggerUploadLrc}
            onOpenLyricCard={(t) => setLyricCardTrack(t)}
            onOpenTrackJournal={(t) => setJournalTrack(t)}
            onOpenCoverDesigner={(t) => setCoverDesignerTrack(t)}
          />
        </div>
      </div>

      {/* Mobile Right-Queue Drawer when toggled on < lg */}
      {rightPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setRightPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full flex">
            <RightQueuePanel
              open={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
              contextLabel={songContextLabel}
              currentTrack={currentTrack}
              currentTime={currentTime}
              queueTracks={activeQueue}
              isPlaying={isPlaying}
              theme={theme}
              onPlayTrack={(track) => playTrackFromQueue(track)}
              onReorderQueue={handleReorderQueue}
              onRemoveFromQueue={handleRemoveFromQueue}
              onToggleLikeCurrent={() => {
                if (currentTrack) handleToggleLike(currentTrack.id);
              }}
              onOpenLyrics={() => {
                setActiveView({ type: 'lyrics' });
                setRightPanelOpen(false);
              }}
              onTriggerUploadLrc={handleTriggerUploadLrc}
              onOpenLyricCard={(t) => setLyricCardTrack(t)}
              onOpenTrackJournal={(t) => setJournalTrack(t)}
              onOpenCoverDesigner={(t) => setCoverDesignerTrack(t)}
            />
          </div>
        </div>
      )}

      {/* Fixed Bottom Now-Playing Bar */}
      <NowPlayingBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        shuffle={shuffle}
        repeatMode={repeatMode}
        autoMixEnabled={autoMixEnabled}
        autoMixActive={autoMixActive}
        highlightsOnly={highlightsOnly}
        eqActive={eqActive}
        vinylNoiseEnabled={vinylNoiseEnabled}
        abLoopActive={abLoopActive}
        abStart={abStart}
        abEnd={abEnd}
        theme={theme}
        rightPanelOpen={rightPanelOpen}
        songViewOpen={activeView.type === 'lyrics'}
        sleepRemainingSeconds={sleepRemainingSeconds}
        sleepMode={sleepMode}
        onStartSleepTimer={handleStartSleepTimer}
        onStartSleepAfterTrack={handleStartSleepAfterTrack}
        onCancelSleepTimer={handleCancelSleepTimer}
        onTogglePlayPause={() => {
          if (!currentTrack) return;
          setIsPlaying((prev) => !prev);
        }}
        onPrevious={() => advanceTrack('prev')}
        onNext={() => advanceTrack('next')}
        onSeek={handleSeek}
        onVolumeChange={(nextVolume) => {
          setVolume(nextVolume);
          if (nextVolume > 0 && muted) {
            setMuted(false);
          }
        }}
        onToggleMute={() => setMuted((prev) => !prev)}
        onToggleShuffle={() => setShuffle((prev) => !prev)}
        onCycleRepeat={() =>
          setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
        }
        onToggleAutoMix={() => setAutoMixEnabled((v) => !v)}
        onToggleHighlightsOnly={handleToggleHighlightsOnly}
        onToggleVinylNoise={() => setVinylNoiseEnabled((v) => !v)}
        onOpenEqualizer={() => setEqModalOpen(true)}
        onAddPinnedMoment={handleAddPinnedMoment}
        onSetAbLoopActive={setAbLoopActive}
        onSetAbRange={(start, end) => {
          setAbStart(start);
          setAbEnd(end);
        }}
        onToggleLikeCurrent={() => {
          if (currentTrack) handleToggleLike(currentTrack.id);
        }}
        onToggleSongView={handleToggleSongView}
        onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
      />

      <CreatePlaylistModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      <EqualizerModal
        open={eqModalOpen}
        onClose={() => setEqModalOpen(false)}
        presetId={eqPresetId}
        gains={eqGains}
        autoLevelEnabled={autoLevelEnabled}
        deadAirSkipEnabled={deadAirSkipEnabled}
        vinylNoiseEnabled={vinylNoiseEnabled}
        currentTrack={currentTrack}
        onSelectPreset={handleSelectEqPreset}
        onChangeBandGain={handleChangeEqBandGain}
        onToggleAutoLevel={() => setAutoLevelEnabled((v) => !v)}
        onToggleDeadAirSkip={() => setDeadAirSkipEnabled((v) => !v)}
        onToggleVinylNoise={() => setVinylNoiseEnabled((v) => !v)}
      />

      <CleanupWizardModal
        open={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
        tracks={tracks}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        onPreviewTrack={handleSelectTrack}
        onRemoveTrack={handleRemoveTrackFromLibrary}
      />

      <LyricCardModal
        open={Boolean(lyricCardTrack)}
        onClose={() => setLyricCardTrack(null)}
        track={lyricCardTrack}
        theme={theme}
      />

      <CoverDesignerModal
        open={Boolean(coverDesignerTrack)}
        onClose={() => setCoverDesignerTrack(null)}
        track={coverDesignerTrack}
        onSaveTrackDetails={handleSaveTrackDetails}
      />

      <TrackJournalModal
        open={Boolean(journalTrack)}
        onClose={() => setJournalTrack(null)}
        track={journalTrack}
        onSaveNote={handleSaveTrackNote}
      />

      <WrappedExperience
        capsule={activeCapsule}
        theme={theme}
        tracks={tracks}
        onClose={() => setActiveCapsule(null)}
        onPlayTrack={handleSelectTrack}
      />
    </div>
  );
}
