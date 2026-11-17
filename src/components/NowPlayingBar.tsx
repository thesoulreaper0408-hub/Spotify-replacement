import {
  BookmarkPlus,
  Check,
  Disc3,
  ListMusic,
  Maximize2,
  Mic,
  Minimize2,
  Moon,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Scissors,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { RepeatMode, SleepTimerMode, ThemeId, Track } from '../types/music';
import { formatCountdown, SLEEP_TIMER_PRESETS } from '../utils/sleepTimer';
import { ThemeArtwork } from './ThemeArtwork';
import { ThemeHeartIcon } from './ThemeIcons';
import { WaveformScrubber } from './WaveformScrubber';

interface NowPlayingBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  autoMixEnabled: boolean;
  autoMixActive: boolean;
  highlightsOnly: boolean;
  eqActive: boolean;
  vinylNoiseEnabled: boolean;
  abLoopActive: boolean;
  abStart: number;
  abEnd: number;
  theme: ThemeId;
  rightPanelOpen: boolean;
  songViewOpen: boolean;
  sleepRemainingSeconds: number | null;
  sleepMode: SleepTimerMode | null;
  onStartSleepTimer: (minutes: number) => void;
  onStartSleepAfterTrack: () => void;
  onCancelSleepTimer: () => void;
  onTogglePlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleAutoMix: () => void;
  onToggleHighlightsOnly: () => void;
  onToggleVinylNoise: () => void;
  onOpenEqualizer: () => void;
  onAddPinnedMoment: (trackId: string, time: number, label: string) => void;
  onSetAbLoopActive: (active: boolean) => void;
  onSetAbRange: (start: number, end: number) => void;
  onToggleLikeCurrent: () => void;
  onToggleSongView: () => void;
  onToggleRightPanel: () => void;
}

export function NowPlayingBar({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  shuffle,
  repeatMode,
  autoMixEnabled,
  autoMixActive,
  highlightsOnly,
  eqActive,
  vinylNoiseEnabled,
  abLoopActive,
  abStart,
  abEnd,
  theme,
  rightPanelOpen,
  songViewOpen,
  sleepRemainingSeconds,
  sleepMode,
  onStartSleepTimer,
  onStartSleepAfterTrack,
  onCancelSleepTimer,
  onTogglePlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onToggleAutoMix,
  onToggleHighlightsOnly,
  onToggleVinylNoise,
  onOpenEqualizer,
  onAddPinnedMoment,
  onSetAbLoopActive,
  onSetAbRange,
  onToggleLikeCurrent,
  onToggleSongView,
  onToggleRightPanel,
}: NowPlayingBarProps) {
  const [studioMenuOpen, setStudioMenuOpen] = useState(false);
  const [pinPopoverOpen, setPinPopoverOpen] = useState(false);
  const [cutterOpen, setCutterOpen] = useState(false);
  const studioMenuRef = useRef<HTMLDivElement | null>(null);

  const effectiveVolume = muted ? 0 : volume;
  const volumePercent = Math.round(effectiveVolume * 100);
  const sleepActive = sleepRemainingSeconds !== null || sleepMode === 'after-track';
  const anyStudioFxActive = eqActive || sleepActive || autoMixEnabled || highlightsOnly || abLoopActive;

  useEffect(() => {
    if (!studioMenuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (studioMenuRef.current && !studioMenuRef.current.contains(e.target as Node)) {
        setStudioMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStudioMenuOpen(false);
    };
    window.addEventListener('mousedown', onOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [studioMenuOpen]);

  return (
    <footer
      ref={studioMenuRef}
      aria-label="Now Playing Controls"
      className="shrink-0 z-40 px-3 sm:px-5 py-2.5 relative"
      style={{
        backgroundColor: 'var(--bg-player)',
        borderTop: 'var(--border-width) var(--border-style) var(--border-color)',
      }}
    >
      <div className="max-w-full grid grid-cols-1 md:grid-cols-[minmax(220px,1.05fr)_minmax(310px,1.4fr)_minmax(210px,1fr)] items-center gap-2.5 md:gap-4">
        {/* Section 1 (Left): Clickable Song Card (opens Song + Lyrics UI like Spotify) + Like */}
        <div className="flex items-center gap-2 min-w-0 justify-between md:justify-start">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={onToggleSongView}
              disabled={!currentTrack}
              data-testid="nowplaying-song-trigger"
              aria-label={
                songViewOpen
                  ? 'Return to library from Song View'
                  : 'Open Song and Lyrics view'
              }
              aria-pressed={songViewOpen}
              title={songViewOpen ? 'Back to Library' : 'Open Song & Lyrics View'}
              className="flex items-center gap-3 min-w-0 text-left group cursor-pointer disabled:cursor-default p-1 -m-1 transition-colors hover:bg-[var(--table-row-hover)]"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="relative shrink-0">
                <ThemeArtwork
                  theme={theme}
                  seed={currentTrack?.coverSeed ?? 12}
                  customCoverUrl={currentTrack?.customCoverUrl}
                  title={currentTrack ? `${currentTrack.title} cover` : 'No track loaded'}
                  size="sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs sm:text-sm font-bold truncate group-hover:underline"
                  style={{
                    color: songViewOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
                  }}
                >
                  {currentTrack ? currentTrack.title : 'Select a track'}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {currentTrack ? currentTrack.artist : 'Ready to play local audio'}
                </p>
              </div>
            </button>

            {currentTrack && (
              <button
                type="button"
                onClick={onToggleLikeCurrent}
                aria-label={
                  currentTrack.liked
                    ? `Unlike ${currentTrack.title}`
                    : `Like ${currentTrack.title}`
                }
                aria-pressed={currentTrack.liked}
                className="p-2 shrink-0 cursor-pointer transition-transform hover:scale-110"
                style={{
                  color: currentTrack.liked ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                <ThemeHeartIcon
                  theme={theme}
                  filled={currentTrack.liked}
                  className="w-4 h-4"
                />
              </button>
            )}
          </div>

          {/* Mobile compact actions */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleSongView}
              aria-label="Toggle Lyrics view"
              aria-pressed={songViewOpen}
              className="p-2 cursor-pointer"
              style={{ color: songViewOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setStudioMenuOpen((v) => !v)}
              aria-label="Audio & Studio Tools"
              className="p-2 cursor-pointer"
              style={{ color: anyStudioFxActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onToggleRightPanel}
              aria-label="Toggle Queue panel"
              className="p-2 cursor-pointer"
              style={{ color: rightPanelOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              <ListMusic className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Section 2 (Center): Clean 5-Button Spotify Transport + Waveform Scrubber */}
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onToggleShuffle}
              aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
              aria-pressed={shuffle}
              className="p-1.5 cursor-pointer transition-colors"
              style={{
                color: shuffle ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              <Shuffle className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onPrevious}
              disabled={!currentTrack}
              aria-label="Previous track"
              className="p-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              <SkipBack className="w-4 h-4 fill-current" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onTogglePlayPause}
              disabled={!currentTrack}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="theme-btn-primary w-9 h-9 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!currentTrack}
              aria-label="Next track"
              className="p-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              <SkipForward className="w-4 h-4 fill-current" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onCycleRepeat}
              aria-label={`Repeat mode: ${repeatMode}`}
              className="p-1.5 cursor-pointer transition-colors relative"
              style={{
                color:
                  repeatMode !== 'off' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Repeat className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <WaveformScrubber
            currentTrack={currentTrack}
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
            onAddPinnedMoment={onAddPinnedMoment}
            highlightsOnly={highlightsOnly}
            abLoopActive={abLoopActive}
            abStart={abStart}
            abEnd={abEnd}
            onSetAbLoopActive={onSetAbLoopActive}
            onSetAbRange={onSetAbRange}
            pinPopoverOpen={pinPopoverOpen}
            onSetPinPopoverOpen={setPinPopoverOpen}
            cutterOpen={cutterOpen}
            onSetCutterOpen={setCutterOpen}
          />
        </div>

        {/* Section 3 (Right): Minimalist Spotify Strip (Mic Lyrics, Queue, Studio Tools, Volume, Expand) */}
        <div className="hidden md:flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onToggleSongView}
            aria-label={songViewOpen ? 'Close Lyrics view' : 'Open Song and Lyrics view'}
            aria-pressed={songViewOpen}
            title="Lyrics"
            data-testid="player-lyrics-button"
            className="p-2 cursor-pointer transition-colors"
            style={{ color: songViewOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToggleRightPanel}
            aria-label={rightPanelOpen ? 'Hide queue panel' : 'Show queue panel'}
            aria-pressed={rightPanelOpen}
            title="Play Queue"
            className="p-2 cursor-pointer transition-colors"
            style={{
              color: rightPanelOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <ListMusic className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setStudioMenuOpen((prev) => !prev)}
            aria-haspopup="dialog"
            aria-expanded={studioMenuOpen}
            aria-label="Audio FX & Studio Tools"
            title="Audio FX & Studio Tools"
            data-testid="player-studio-menu-button"
            className="p-2 inline-flex items-center gap-1 cursor-pointer transition-colors"
            style={{
              color: anyStudioFxActive || studioMenuOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            {sleepRemainingSeconds !== null && (
              <span className="font-theme-mono text-[10px] font-bold tabular-nums">
                {formatCountdown(sleepRemainingSeconds)}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted || volume === 0 ? 'Unmute volume' : 'Mute volume'}
              className="p-1.5 cursor-pointer transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <div className="player-range-wrap w-20">
              <div className="player-range-track">
                <div
                  className="player-range-fill"
                  style={{ width: `${volumePercent}%` }}
                />
              </div>
              <div
                className="player-range-thumb"
                style={{ left: `${volumePercent}%` }}
              />
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
          </div>

          <button
            type="button"
            onClick={onToggleSongView}
            disabled={!currentTrack}
            aria-label={songViewOpen ? 'Collapse Song View' : 'Expand Song View'}
            title={songViewOpen ? 'Exit Song View' : 'Expand Song View'}
            className="p-2 cursor-pointer disabled:opacity-40 transition-colors"
            style={{ color: songViewOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            {songViewOpen ? (
              <Minimize2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Consolidated Audio & Studio Tools Popover (works on both desktop and mobile) */}
      {studioMenuOpen && (
        <div
          role="dialog"
          aria-label="Audio FX and Studio Tools"
          data-testid="player-studio-menu"
          className="absolute right-4 sm:right-6 bottom-full mb-2 z-50 w-72 p-2.5 space-y-1.5"
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-width) var(--border-style) var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between px-2 py-1 border-b border-[var(--border-color)]">
            <span
              className="font-theme-display text-[11px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Audio &amp; Studio Tools
            </span>
            <button
              type="button"
              onClick={() => setStudioMenuOpen(false)}
              aria-label="Close Audio Tools"
              className="p-0.5 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            data-testid="player-eq-button"
            onClick={() => {
              setStudioMenuOpen(false);
              onOpenEqualizer();
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{
              color: eqActive ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>Equalizer &amp; Auto-Level</span>
            </span>
            {eqActive && <span className="text-[10px] font-theme-mono">ON</span>}
          </button>

          <button
            type="button"
            data-testid="player-toggle-vinyl-noise"
            aria-pressed={vinylNoiseEnabled}
            onClick={() => onToggleVinylNoise()}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{
              color: vinylNoiseEnabled ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span className="flex items-center gap-2.5">
              <Disc3 className="w-4 h-4" aria-hidden="true" />
              <span>Vinyl Surface Crackle</span>
            </span>
            {vinylNoiseEnabled && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>

          <button
            type="button"
            data-testid="toggle-automix-button"
            aria-pressed={autoMixEnabled}
            onClick={() => onToggleAutoMix()}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{
              color: autoMixEnabled ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span className="flex items-center gap-2.5">
              <Waves className="w-4 h-4" aria-hidden="true" />
              <span>{autoMixActive ? 'DJ Auto-Mix (Mixing...)' : 'DJ Smart Auto-Mix'}</span>
            </span>
            {autoMixEnabled && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>

          <button
            type="button"
            aria-pressed={highlightsOnly}
            onClick={() => onToggleHighlightsOnly()}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{
              color: highlightsOnly ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span className="flex items-center gap-2.5">
              <Radio className="w-4 h-4" aria-hidden="true" />
              <span>Highlights-Only Radio</span>
            </span>
            {highlightsOnly && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>

          <button
            type="button"
            disabled={!currentTrack}
            data-testid="pin-moment-button"
            onClick={() => {
              setStudioMenuOpen(false);
              setCutterOpen(false);
              setPinPopoverOpen(true);
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40 hover:bg-[var(--table-row-hover)]"
            style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            <span className="flex items-center gap-2.5">
              <BookmarkPlus className="w-4 h-4" aria-hidden="true" />
              <span>Pin Current Moment</span>
            </span>
            {currentTrack?.pinnedMoments?.length ? (
              <span className="text-[10px] font-theme-mono opacity-75">
                {currentTrack.pinnedMoments.length}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            disabled={!currentTrack}
            data-testid="clip-cutter-toggle"
            onClick={() => {
              setStudioMenuOpen(false);
              setPinPopoverOpen(false);
              setCutterOpen(true);
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40 hover:bg-[var(--table-row-hover)]"
            style={{
              color: abLoopActive ? 'var(--accent-secondary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span className="flex items-center gap-2.5">
              <Scissors className="w-4 h-4" aria-hidden="true" />
              <span>A-B Loop &amp; .wav Cutter</span>
            </span>
            {abLoopActive && <span className="text-[10px] font-theme-mono">LOOP</span>}
          </button>

          <div className="my-1 border-t border-[var(--border-color)]" />

          {/* Compact Inline Sleep Timer Section */}
          <div className="px-2.5 py-1.5 space-y-2" data-testid="sleep-timer-section">
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-2 text-xs font-semibold"
                style={{ color: sleepActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sleep Timer</span>
              </span>
              {sleepRemainingSeconds !== null ? (
                <span className="font-theme-mono text-[11px] font-bold" style={{ color: 'var(--accent-primary)' }}>
                  {formatCountdown(sleepRemainingSeconds)}
                </span>
              ) : sleepMode === 'after-track' ? (
                <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  End of track
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1">
              {SLEEP_TIMER_PRESETS.slice(0, 3).map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => {
                    onStartSleepTimer(preset.minutes);
                    setStudioMenuOpen(false);
                  }}
                  className="px-2 py-1 text-[11px] font-semibold cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  onStartSleepAfterTrack();
                  setStudioMenuOpen(false);
                }}
                data-testid="sleep-after-track-btn"
                className="px-2 py-1 text-[11px] font-semibold cursor-pointer"
                style={{
                  backgroundColor:
                    sleepMode === 'after-track' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                  color:
                    sleepMode === 'after-track' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                End of song
              </button>
              {sleepActive && (
                <button
                  type="button"
                  onClick={() => onCancelSleepTimer()}
                  className="px-2 py-1 text-[11px] font-semibold text-red-400 cursor-pointer"
                >
                  Off
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
