import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ListMusic,
  Mic,
  MoreHorizontal,
  Pencil,
  Play,
  Quote,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ThemeId, Track } from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { getActiveLyricIndex } from '../utils/lrcParser';
import { ThemeArtwork } from './ThemeArtwork';
import { ThemeHeartIcon } from './ThemeIcons';

interface RightQueuePanelProps {
  open: boolean;
  onClose: () => void;
  contextLabel: string;
  currentTrack: Track | null;
  currentTime: number;
  queueTracks: Track[];
  isPlaying: boolean;
  theme: ThemeId;
  onPlayTrack: (track: Track) => void;
  onReorderQueue: (fromIndex: number, toIndex: number) => void;
  onRemoveFromQueue: (index: number) => void;
  onToggleLikeCurrent: () => void;
  onOpenLyrics: () => void;
  onTriggerUploadLrc: (trackId: string) => void;
  onOpenLyricCard: (track: Track) => void;
  onOpenTrackJournal: (track: Track) => void;
  onOpenCoverDesigner: (track: Track) => void;
}

export function RightQueuePanel({
  open,
  onClose,
  contextLabel,
  currentTrack,
  currentTime,
  queueTracks,
  isPlaying,
  theme,
  onPlayTrack,
  onReorderQueue,
  onRemoveFromQueue,
  onToggleLikeCurrent,
  onOpenLyrics,
  onTriggerUploadLrc,
  onOpenLyricCard,
  onOpenTrackJournal,
  onOpenCoverDesigner,
}: RightQueuePanelProps) {
  const [studioOpen, setStudioOpen] = useState(false);
  const studioRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!studioOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (studioRef.current && !studioRef.current.contains(e.target as Node)) {
        setStudioOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStudioOpen(false);
    };
    window.addEventListener('mousedown', onOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [studioOpen]);

  const lyrics = currentTrack?.lyrics ?? [];
  const activeLyricIdx = useMemo(
    () => getActiveLyricIndex(lyrics, currentTime),
    [lyrics, currentTime]
  );

  if (!open) return null;

  const currentIdx = currentTrack
    ? queueTracks.findIndex((t) => t.id === currentTrack.id)
    : -1;

  const upcomingEntries = queueTracks
    .map((track, queueIndex) => ({ track, queueIndex }))
    .filter(({ queueIndex }) => (currentIdx >= 0 ? queueIndex > currentIdx : true));

  const previewLines =
    lyrics.length > 0
      ? lyrics.slice(
          Math.max(0, activeLyricIdx >= 0 ? activeLyricIdx : 0),
          Math.max(0, activeLyricIdx >= 0 ? activeLyricIdx : 0) + 3
        )
      : [];

  return (
    <aside
      aria-label="Now Playing and Queue Panel"
      className="w-80 shrink-0 h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderLeft: 'var(--border-width) var(--border-style) var(--border-color)',
      }}
    >
      {/* Clean Spotify-Style Panel Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          borderBottom: 'var(--border-width) var(--border-style) var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ListMusic className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
          <h2
            className="font-theme-display text-sm font-bold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {contextLabel}
          </h2>
        </div>

        <div className="flex items-center gap-1 shrink-0 relative" ref={studioRef}>
          {currentTrack && (
            <button
              type="button"
              onClick={() => setStudioOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={studioOpen}
              aria-label="Track Studio options"
              title="Track Studio options"
              data-testid="panel-track-studio-menu"
              className="p-1.5 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Collapse Now Playing panel"
            className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </button>

          {studioOpen && currentTrack && (
            <div
              role="menu"
              aria-label="Track Studio Menu"
              className="absolute right-0 top-9 z-50 w-52 p-1.5 space-y-0.5"
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                border: 'var(--border-width) var(--border-style) var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setStudioOpen(false);
                  onOpenLyrics();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
              >
                <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Open Song &amp; Lyrics</span>
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="panel-create-lyric-card"
                onClick={() => {
                  setStudioOpen(false);
                  onOpenLyricCard(currentTrack);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
              >
                <Quote className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Create Lyric Card</span>
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="panel-design-cover"
                onClick={() => {
                  setStudioOpen(false);
                  onOpenCoverDesigner(currentTrack);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Edit Song &amp; Picture</span>
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="panel-track-journal"
                onClick={() => {
                  setStudioOpen(false);
                  onOpenTrackJournal(currentTrack);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{currentTrack.note ? 'Edit Memory Note' : 'Add Memory Journal'}</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setStudioOpen(false);
                  onTriggerUploadLrc(currentTrack.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{lyrics.length > 0 ? 'Replace .lrc File' : 'Upload .lrc Lyrics'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {currentTrack ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={onOpenLyrics}
              aria-label={`Open Song and Lyrics view for ${currentTrack.title}`}
              className="flex justify-center w-full cursor-pointer group"
            >
              <div className="theme-artwork-framed w-full max-w-[260px] transition-transform duration-200 group-hover:scale-[1.02]">
                <ThemeArtwork
                  theme={theme}
                  seed={currentTrack.coverSeed}
                  customCoverUrl={currentTrack.customCoverUrl}
                  title={`${currentTrack.title} large artwork`}
                  size="xl"
                />
              </div>
            </button>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-0.5">
                <button
                  type="button"
                  onClick={onOpenLyrics}
                  className="font-theme-display text-base font-bold leading-snug break-words text-left cursor-pointer hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {currentTrack.title}
                  {theme === 'terminal' && isPlaying && (
                    <span className="terminal-cursor" aria-hidden="true" />
                  )}
                </button>
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                  {currentTrack.artist}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenCoverDesigner(currentTrack)}
                  aria-label={`Edit ${currentTrack.title} name and picture`}
                  title="Edit song name & picture"
                  className="p-1.5 cursor-pointer transition-colors hover:text-[var(--accent-primary)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onToggleLikeCurrent}
                  aria-label={currentTrack.liked ? 'Unlike current track' : 'Like current track'}
                  className="p-1.5 cursor-pointer transition-transform hover:scale-110"
                  style={{
                    color: currentTrack.liked ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                >
                  <ThemeHeartIcon theme={theme} filled={currentTrack.liked} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentTrack.note && (
              <button
                type="button"
                onClick={() => onOpenTrackJournal(currentTrack)}
                className="w-full text-left px-3 py-2 text-[11px] flex items-start gap-2 cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                <span className="leading-snug line-clamp-2">
                  {currentTrack.note}
                  {currentTrack.noteDate ? ` (${currentTrack.noteDate})` : ''}
                </span>
              </button>
            )}

            {/* Spotify-Style Embedded Lyrics Preview Card */}
            <div
              className="theme-panel p-3.5 space-y-2.5"
              style={{
                background: `linear-gradient(155deg, color-mix(in srgb, var(--accent-primary) 18%, var(--bg-surface-elevated)) 0%, var(--bg-surface) 100%)`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-xs font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Lyrics preview
                </span>
                <button
                  type="button"
                  onClick={onOpenLyrics}
                  className="theme-btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                >
                  <Mic className="w-3 h-3" aria-hidden="true" />
                  <span>Show lyrics</span>
                </button>
              </div>

              {previewLines.length > 0 ? (
                <div className="space-y-1">
                  {previewLines.map((line, i) => (
                    <p
                      key={`${line.time}-${i}`}
                      className={`font-theme-display text-sm leading-snug ${
                        i === 0 ? 'font-bold' : 'font-semibold opacity-70'
                      }`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
                    No synced .lrc file attached to this track yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => onTriggerUploadLrc(currentTrack.id)}
                    className="text-xs font-semibold underline cursor-pointer"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Upload .lrc lyrics
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="theme-panel p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Select a track to view details and queue.
          </div>
        )}

        {/* Up Next / Interactive Queue */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Up Next ({upcomingEntries.length})
            </h3>
          </div>

          {upcomingEntries.length === 0 ? (
            <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>
              Queue ends after the current track.
            </p>
          ) : (
            <ul className="space-y-1.5" aria-label="Play Queue">
              {upcomingEntries.map(({ track, queueIndex }, pos) => (
                <li
                  key={`${track.id}-${queueIndex}`}
                  className="theme-panel p-2 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => onPlayTrack(track)}
                    aria-label={`Play ${track.title} from queue`}
                    className="relative shrink-0 cursor-pointer group"
                  >
                    <ThemeArtwork
                      theme={theme}
                      seed={track.coverSeed}
                      customCoverUrl={track.customCoverUrl}
                      title={`${track.title} cover`}
                      size="xs"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3.5 h-3.5 fill-current text-white" aria-hidden="true" />
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {track.title}
                    </p>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {track.artist} · {formatDuration(track.duration)}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={pos === 0}
                      onClick={() =>
                        onReorderQueue(queueIndex, upcomingEntries[pos - 1].queueIndex)
                      }
                      aria-label={`Move ${track.title} up in queue`}
                      className="p-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={pos === upcomingEntries.length - 1}
                      onClick={() =>
                        onReorderQueue(queueIndex, upcomingEntries[pos + 1].queueIndex)
                      }
                      aria-label={`Move ${track.title} down in queue`}
                      className="p-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFromQueue(queueIndex)}
                      aria-label={`Remove ${track.title} from queue`}
                      className="p-1 cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
