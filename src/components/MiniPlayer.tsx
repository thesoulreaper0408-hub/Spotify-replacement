import {
  Maximize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { THEME_OPTIONS } from '../themes/themes';
import type { RepeatMode, SleepTimerMode, ThemeId, Track } from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { getActiveLyricIndex } from '../utils/lrcParser';
import { AudioVisualizer } from './AudioVisualizer';
import { SleepTimerMenu } from './SleepTimerMenu';
import { ThemeArtwork } from './ThemeArtwork';

interface MiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  theme: ThemeId;
  analyser: AnalyserNode | null;
  sleepRemainingSeconds: number | null;
  sleepMode: SleepTimerMode | null;
  onStartSleepTimer: (minutes: number) => void;
  onStartSleepAfterTrack: () => void;
  onCancelSleepTimer: () => void;
  onThemeChange: (theme: ThemeId) => void;
  onTogglePlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onExpandFullPlayer: () => void;
}

export function MiniPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  shuffle,
  repeatMode,
  theme,
  analyser,
  sleepRemainingSeconds,
  sleepMode,
  onStartSleepTimer,
  onStartSleepAfterTrack,
  onCancelSleepTimer,
  onThemeChange,
  onTogglePlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onExpandFullPlayer,
}: MiniPlayerProps) {
  const safeDuration = duration > 0 ? duration : currentTrack?.duration ?? 0;
  const clampedTime = Math.min(currentTime, safeDuration || 0);
  const progressPercent = safeDuration > 0 ? (clampedTime / safeDuration) * 100 : 0;
  const effectiveVolume = muted ? 0 : volume;
  const volumePercent = Math.round(effectiveVolume * 100);

  const lyrics = currentTrack?.lyrics ?? [];
  const activeLyricIdx = getActiveLyricIndex(lyrics, clampedTime);
  const currentLyric = activeLyricIdx >= 0 ? lyrics[activeLyricIdx]?.text : null;

  return (
    <div
      data-testid="mini-player"
      className="theme-canvas-texture min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <div className="theme-panel w-full max-w-md p-5 sm:p-6 space-y-5">
        {/* Top Row: Compact Brand + Theme Select + Expand */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-theme-display text-sm font-bold whitespace-nowrap"
            style={{ color: 'var(--accent-primary)' }}
          >
            ChordDeck Mini
          </span>

          <div className="flex items-center gap-2">
            <SleepTimerMenu
              remainingSeconds={sleepRemainingSeconds}
              sleepMode={sleepMode}
              onStartTimer={onStartSleepTimer}
              onStartAfterTrack={onStartSleepAfterTrack}
              onCancelTimer={onCancelSleepTimer}
              placement="down"
              variant="header"
            />

            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as ThemeId)}
              aria-label="Mini-Player Theme Switcher"
              className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: 'var(--border-width) var(--border-style) var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {THEME_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onExpandFullPlayer}
              aria-label="Exit Mini-Player mode"
              className="theme-btn-secondary p-2 cursor-pointer"
              title="Expand Full Player"
            >
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Artwork + Info */}
        <div className="flex items-center gap-4">
          <ThemeArtwork
            theme={theme}
            seed={currentTrack?.coverSeed ?? 12}
            customCoverUrl={currentTrack?.customCoverUrl}
            title={currentTrack ? currentTrack.title : 'No track'}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <h1
              className="font-theme-display text-base sm:text-lg font-bold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {currentTrack ? currentTrack.title : 'No track loaded'}
            </h1>
            <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
              {currentTrack ? currentTrack.artist : 'Upload local audio'}
            </p>
          </div>
        </div>

        {/* Live Lyric Snippet */}
        {currentLyric && (
          <div
            className="px-3 py-2 text-xs text-center font-medium truncate"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-width) var(--border-style) var(--border-color)',
            }}
          >
            {currentLyric}
          </div>
        )}

        {/* Theme-Reactive Visualizer */}
        <div
          className="p-2"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: 'var(--border-width) var(--border-style) var(--border-color)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <AudioVisualizer
            analyser={analyser}
            isPlaying={isPlaying}
            theme={theme}
            height={44}
            compact
          />
        </div>

        {/* Seek Bar */}
        <div className="space-y-1">
          <div className="player-range-wrap">
            <div className="player-range-track">
              <div className="player-range-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="player-range-thumb" style={{ left: `${progressPercent}%` }} />
            <input
              type="range"
              min={0}
              max={safeDuration || 100}
              step={0.1}
              value={clampedTime}
              disabled={!currentTrack}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label="Seek track position"
              className="player-range-input"
            />
          </div>
          <div className="flex items-center justify-between font-theme-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{formatDuration(clampedTime)}</span>
            <span>{formatDuration(safeDuration)}</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleShuffle}
            aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
            aria-pressed={shuffle}
            className="p-2 cursor-pointer"
            style={{ color: shuffle ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            <Shuffle className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!currentTrack}
              aria-label="Previous track"
              className="p-2 cursor-pointer disabled:opacity-40"
              style={{ color: 'var(--text-primary)' }}
            >
              <SkipBack className="w-4 h-4 fill-current" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onTogglePlayPause}
              disabled={!currentTrack}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="theme-btn-primary w-11 h-11 flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!currentTrack}
              aria-label="Next track"
              className="p-2 cursor-pointer disabled:opacity-40"
              style={{ color: 'var(--text-primary)' }}
            >
              <SkipForward className="w-4 h-4 fill-current" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onCycleRepeat}
            aria-label={`Repeat mode: ${repeatMode}`}
            className="p-2 cursor-pointer"
            style={{
              color: repeatMode !== 'off' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Repeat className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted || volume === 0 ? 'Unmute volume' : 'Mute volume'}
            className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <div className="player-range-wrap flex-1">
            <div className="player-range-track">
              <div className="player-range-fill" style={{ width: `${volumePercent}%` }} />
            </div>
            <div className="player-range-thumb" style={{ left: `${volumePercent}%` }} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effectiveVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              className="player-range-input"
            />
          </div>

          <span className="font-theme-mono text-xs w-11 text-right" style={{ color: 'var(--text-muted)' }}>
            {volumePercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
