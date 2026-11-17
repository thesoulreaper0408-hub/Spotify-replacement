import {
  BookmarkPlus,
  BookOpen,
  ChevronLeft,
  Mic,
  Pencil,
  Quote,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTurntableSpin } from '../hooks/useTurntableSpin';
import type { ThemeId, Track } from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { getActiveLyricIndex } from '../utils/lrcParser';
import { ThemeArtwork } from './ThemeArtwork';
import { ThemeHeartIcon } from './ThemeIcons';

interface LyricsViewProps {
  currentTrack: Track | null;
  currentTime: number;
  isPlaying: boolean;
  contextLabel: string;
  theme: ThemeId;
  onSeek: (time: number) => void;
  onToggleLikeCurrent: () => void;
  onTriggerUploadLrc: (trackId: string) => void;
  onOpenLyricCard: (track: Track) => void;
  onOpenCoverDesigner: (track: Track) => void;
  onOpenTrackJournal: (track: Track) => void;
  onAddPinnedMoment: (trackId: string, time: number, label: string) => void;
  onRemovePinnedMoment: (trackId: string, momentId: string) => void;
  onCloseSongView: () => void;
}

export function LyricsView({
  currentTrack,
  currentTime,
  isPlaying,
  contextLabel,
  theme,
  onSeek,
  onToggleLikeCurrent,
  onTriggerUploadLrc,
  onOpenLyricCard,
  onOpenCoverDesigner,
  onOpenTrackJournal,
  onAddPinnedMoment,
  onRemovePinnedMoment,
  onCloseSongView,
}: LyricsViewProps) {
  const activeLineRef = useRef<HTMLButtonElement | null>(null);
  const {
    rotorRef: lyricsDiscRef,
    rotorClassName: lyricsDiscClassName,
    motorState: lyricsMotorState,
  } = useTurntableSpin<HTMLDivElement>(isPlaying && Boolean(currentTrack));

  const lyrics = currentTrack?.lyrics ?? [];
  const activeIndex = useMemo(
    () => getActiveLyricIndex(lyrics, currentTime),
    [lyrics, currentTime]
  );

  useEffect(() => {
    if (activeLineRef.current && typeof activeLineRef.current.scrollIntoView === 'function') {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!currentTrack) {
    return (
      <section className="pointer-events-auto px-4 sm:px-6 py-12 flex-1 flex items-center justify-center">
        <div className="theme-panel p-8 text-center max-w-md mx-auto space-y-3">
          <Mic className="w-8 h-8 mx-auto" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
          <p className="font-theme-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            No track selected
          </p>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Play a song from your library to open the Song &amp; Lyrics view.
          </p>
          <button
            type="button"
            onClick={onCloseSongView}
            className="theme-btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Back to Library
          </button>
        </div>
      </section>
    );
  }

  const pins = currentTrack.pinnedMoments ?? [];

  return (
    <section
      aria-label="Song and Synced Lyrics Focus View"
      data-testid="song-lyrics-view"
      className="pointer-events-auto flex-1 flex flex-col min-h-full"
      style={{
        background: `linear-gradient(165deg, color-mix(in srgb, var(--accent-primary) 24%, var(--bg-banner-start)) 0%, color-mix(in srgb, var(--bg-banner-end) 88%, var(--bg-app)) 55%, color-mix(in srgb, var(--bg-app) 94%, transparent) 100%)`,
      }}
    >
      {/* Top Context + Spotify-Style Studio Action Strip */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-7 py-4"
        style={{
          borderBottom: '1px solid color-mix(in srgb, var(--border-color) 65%, transparent)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onCloseSongView}
            aria-label="Back to library"
            data-testid="song-view-back-button"
            className="theme-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back</span>
          </button>
          <span
            className="font-theme-display text-xs sm:text-sm font-bold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {contextLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenCoverDesigner(currentTrack)}
            title="Edit Song & Picture"
            aria-label="Edit Song and Picture"
            className="theme-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Edit Song</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenTrackJournal(currentTrack)}
            title="Memory Journal Note"
            aria-label="Edit Memory Journal Note"
            className="theme-btn-secondary p-2 cursor-pointer"
            style={{ color: currentTrack.note ? 'var(--accent-primary)' : undefined }}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onOpenLyricCard(currentTrack)}
            title="Create Shareable Lyric Card"
            aria-label="Create Lyric Card"
            data-testid="lyrics-create-card-button"
            className="theme-btn-secondary p-2 cursor-pointer"
          >
            <Quote className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onTriggerUploadLrc(currentTrack.id)}
            title={lyrics.length > 0 ? 'Replace .lrc Lyrics' : 'Upload .lrc Lyrics'}
            aria-label={lyrics.length > 0 ? 'Replace .lrc Lyrics' : 'Upload .lrc Lyrics'}
            className="theme-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{lyrics.length > 0 ? 'Replace .lrc' : 'Upload .lrc'}</span>
          </button>
          <button
            type="button"
            onClick={onCloseSongView}
            aria-label="Close Song View"
            title="Close Song View"
            className="theme-btn-secondary p-2 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Song Presentation + Large Synced Lyrics Stage */}
      <div className="flex-1 px-5 sm:px-9 py-6 sm:py-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-8 items-start">
        {/* Left: Song Presentation UI (Artwork, Identity, Memory Note, Pinned Moments) */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <div className="relative w-56 sm:w-64 lg:w-full max-w-[280px] mx-auto lg:mx-0">
            <div className="theme-artwork-framed relative z-10 shadow-2xl">
              <ThemeArtwork
                theme={theme}
                seed={currentTrack.coverSeed}
                customCoverUrl={currentTrack.customCoverUrl}
                title={`${currentTrack.title} cover`}
                size="xl"
              />
            </div>
            <div
              className={`hidden sm:block absolute top-3 -right-7 w-24 h-24 pointer-events-none transition-all duration-500 ${
                isPlaying ? 'translate-x-0 opacity-90' : '-translate-x-5 opacity-60'
              }`}
            >
              <div
                ref={lyricsDiscRef}
                aria-hidden="true"
                data-motor-state={lyricsMotorState}
                className={`${lyricsDiscClassName} w-full h-full rounded-full flex items-center justify-center overflow-hidden`}
                style={{
                  background:
                    'repeating-radial-gradient(circle at center, #111114 0px, #111114 3px, #24242d 4px, #0b0b0e 5px)',
                  border: '2px solid rgba(255,255,255,0.22)',
                }}
              >
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      'conic-gradient(from 0deg, rgba(255,255,255,0.3) 0deg 26deg, transparent 56deg 180deg, rgba(255,255,255,0.22) 194deg 220deg, transparent 250deg 360deg)',
                  }}
                />
                <span
                  className="relative z-10 w-6 h-6 rounded-full"
                  style={{
                    background:
                      'conic-gradient(var(--accent-primary) 0deg 180deg, var(--accent-secondary) 180deg 360deg)',
                    border: '2px solid #000',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="font-theme-display text-xl sm:text-2xl font-extrabold leading-tight break-words"
                style={{ color: 'var(--text-primary)' }}
              >
                {currentTrack.title}
              </h1>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
                {currentTrack.artist}
              </p>
              <p className="font-theme-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {currentTrack.album} · {formatDuration(currentTrack.duration)}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleLikeCurrent}
              aria-label={currentTrack.liked ? 'Unlike track' : 'Like track'}
              className="p-2 shrink-0 cursor-pointer transition-transform hover:scale-110"
              style={{
                color: currentTrack.liked ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              <ThemeHeartIcon theme={theme} filled={currentTrack.liked} className="w-5 h-5" />
            </button>
          </div>

          {currentTrack.note && (
            <button
              type="button"
              onClick={() => onOpenTrackJournal(currentTrack)}
              className="w-full text-left theme-panel p-3 flex items-start gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  Memory Note
                </p>
                <p className="text-xs leading-snug mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {currentTrack.note}
                </p>
              </div>
            </button>
          )}

          {/* Clean Pinned Moments Section inside Song View */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Pinned Moments
              </span>
              <button
                type="button"
                onClick={() =>
                  onAddPinnedMoment(
                    currentTrack.id,
                    currentTime,
                    `Moment ${formatDuration(currentTime)}`
                  )
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pin {formatDuration(currentTime)}</span>
              </button>
            </div>

            {pins.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {pins.map((pin) => (
                  <span
                    key={pin.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSeek(pin.time)}
                      className="cursor-pointer hover:underline tabular-nums"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {pin.label} · {formatDuration(pin.time)}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePinnedMoment(currentTrack.id, pin.id)}
                      aria-label={`Remove pin ${pin.label}`}
                      className="opacity-60 hover:opacity-100 cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Tap Pin to bookmark favorite sections of this song.
              </p>
            )}
          </div>
        </div>

        {/* Right: Large Spotify-Style Auto-Scrolling Synced Lyrics */}
        <div className="min-w-0">
          {lyrics.length === 0 ? (
            <div className="theme-panel p-8 sm:p-10 text-center space-y-4">
              <Mic className="w-9 h-9 mx-auto" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <div className="space-y-1.5">
                <p className="font-theme-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  No synced lyrics loaded yet
                </p>
                <p className="text-xs sm:text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Attach a timestamped .lrc lyrics file to see large auto-scrolling karaoke verses synchronized with playback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onTriggerUploadLrc(currentTrack.id)}
                className="theme-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>Upload .lrc File</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[62vh] overflow-y-auto pr-2 py-2">
              {lyrics.map((line, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;
                return (
                  <button
                    key={`${line.time}-${index}`}
                    ref={isActive ? activeLineRef : undefined}
                    type="button"
                    onClick={() => onSeek(line.time)}
                    aria-current={isActive ? 'true' : undefined}
                    className="w-full text-left px-3 py-2 transition-all cursor-pointer group block"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span
                      className={`font-theme-display block transition-all leading-snug tracking-tight ${
                        isActive
                          ? 'text-2xl sm:text-3xl xl:text-[2.15rem] font-extrabold'
                          : 'text-xl sm:text-2xl xl:text-[1.7rem] font-bold group-hover:opacity-100'
                      }`}
                      style={{
                        color: isActive
                          ? 'var(--text-primary)'
                          : isPast
                            ? 'var(--text-muted)'
                            : 'var(--text-secondary)',
                        opacity: isActive ? 1 : isPast ? 0.52 : 0.72,
                      }}
                    >
                      {line.text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
