import {
  ArrowUpDown,
  Check,
  Disc3,
  List,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Radio,
  Shuffle,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
  ActiveView,
  EnergyArcType,
  LibraryLayoutMode,
  Playlist,
  ThemeId,
  Track,
} from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { PlaylistCoverGrid, ThemeArtwork } from './ThemeArtwork';

interface HeaderBannerProps {
  activeView: ActiveView;
  activePlaylist: Playlist | null;
  tracks: Track[];
  theme: ThemeId;
  isPlaying: boolean;
  isCurrentViewPlaying: boolean;
  highlightsOnly: boolean;
  layoutMode: LibraryLayoutMode;
  onToggleHighlightsOnly: () => void;
  onChangeLayoutMode: (mode: LibraryLayoutMode) => void;
  onArrangeEnergyArc: (playlistId: string, arc: EnergyArcType) => void;
  onPlayAll: () => void;
  onShuffleAll: () => void;
  onTriggerAddMusic: () => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
}

export function HeaderBanner({
  activeView,
  activePlaylist,
  tracks,
  theme,
  isPlaying,
  isCurrentViewPlaying,
  highlightsOnly,
  layoutMode,
  onToggleHighlightsOnly,
  onChangeLayoutMode,
  onArrangeEnergyArc,
  onPlayAll,
  onShuffleAll,
  onTriggerAddMusic,
  onRenamePlaylist,
  onDeletePlaylist,
}: HeaderBannerProps) {
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreMenuOpen(false);
    };
    window.addEventListener('mousedown', onOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [moreMenuOpen]);

  const totalSeconds = tracks.reduce(
    (acc, item) => acc + (Number.isFinite(item.duration) ? item.duration : 0),
    0
  );

  let kicker = 'Music Library';
  let title = 'All Local Tracks';
  let subtitle = 'Upload audio files from your device or listen to the built-in studio sketches.';
  let artworkVariant: 'track' | 'liked' | 'library' | 'playlist' = 'library';
  let seed = 101;

  if (activeView.type === 'liked') {
    kicker = 'Collection';
    title = 'Liked Songs';
    subtitle = 'Tracks you hearted across your library and uploaded folders.';
    artworkVariant = 'liked';
    seed = 202;
  } else if (activeView.type === 'playlists') {
    kicker = 'Collections';
    title = 'Your Playlists';
    subtitle = 'Organize your local audio files into custom listening sessions.';
    artworkVariant = 'playlist';
    seed = 303;
  } else if (activeView.type === 'stats') {
    kicker = 'Analytics';
    title = 'Listening Stats';
    subtitle = 'Most played tracks, top artists, and live session play counts.';
    artworkVariant = 'library';
    seed = 606;
  } else if (activeView.type === 'playlist' && activePlaylist) {
    kicker = 'Playlist';
    title = activePlaylist.name;
    subtitle = activePlaylist.description || 'Custom local audio playlist';
    artworkVariant = 'playlist';
    seed = tracks[0]?.coverSeed ?? 404;
  }

  const showPlayableControls =
    activeView.type === 'home' ||
    activeView.type === 'liked' ||
    activeView.type === 'playlist';

  return (
    <section
      aria-label={`${title} Overview`}
      className="theme-banner-surface pointer-events-auto p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6"
      style={{
        background: `linear-gradient(155deg, color-mix(in srgb, var(--bg-banner-start) 82%, transparent) 0%, color-mix(in srgb, var(--bg-banner-end) 56%, transparent) 100%)`,
        backdropFilter: 'blur(6px)',
        borderBottom: 'var(--border-width) var(--border-style) var(--border-color)',
      }}
    >
      <div className="theme-artwork-framed shrink-0">
        {activeView.type === 'playlist' && activePlaylist ? (
          <PlaylistCoverGrid
            tracks={tracks}
            theme={theme}
            title={activePlaylist.name}
            size="lg"
          />
        ) : (
          <ThemeArtwork
            theme={theme}
            seed={seed}
            title={`${title} artwork`}
            size="lg"
            variant={artworkVariant}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2.5">
        <p
          className="text-xs font-bold tracking-wider uppercase"
          style={{ color: 'var(--accent-primary)' }}
        >
          {kicker}
        </p>

        {activeView.type === 'playlist' && activePlaylist && renaming ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={draftTitle}
              autoFocus
              aria-label="New playlist title"
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draftTitle.trim()) {
                  onRenamePlaylist(activePlaylist.id, draftTitle.trim());
                  setRenaming(false);
                }
                if (e.key === 'Escape') setRenaming(false);
              }}
              className="px-3 py-1.5 text-lg font-bold outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '2px solid var(--accent-primary)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (draftTitle.trim()) {
                  onRenamePlaylist(activePlaylist.id, draftTitle.trim());
                }
                setRenaming(false);
              }}
              aria-label="Confirm playlist rename"
              className="theme-btn-primary p-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRenaming(false)}
              aria-label="Cancel playlist rename"
              className="theme-btn-secondary p-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <h1
            className={`font-theme-display font-extrabold tracking-tight leading-tight text-balance break-words ${
              theme === 'pixel-retro' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'
            }`}
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
        )}

        <p
          className="text-xs sm:text-sm max-w-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {subtitle}
        </p>

        <div
          className="flex flex-wrap items-center gap-2 text-xs font-theme-mono pt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatDuration(totalSeconds)} total</span>
          {highlightsOnly && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-sans font-semibold" style={{ color: 'var(--accent-primary)' }}>
                Highlights Radio On
              </span>
            </>
          )}
        </div>

        {/* Minimalist Spotify-Style Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onPlayAll}
            disabled={tracks.length === 0}
            className="theme-btn-primary theme-angled flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isCurrentViewPlaying && isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onShuffleAll}
            disabled={tracks.length === 0}
            aria-label="Shuffle play"
            title="Shuffle play"
            className="theme-btn-secondary flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Shuffle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Shuffle</span>
          </button>

          {activeView.type === 'home' && (
            <div
              role="group"
              aria-label="Library View Mode"
              className="inline-flex items-center p-0.5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: 'var(--border-width) var(--border-style) var(--border-color)',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              <button
                type="button"
                onClick={() => onChangeLayoutMode('list')}
                aria-pressed={layoutMode === 'list'}
                data-testid="layout-mode-list"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: layoutMode === 'list' ? 'var(--accent-primary)' : 'transparent',
                  color: layoutMode === 'list' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                <List className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Track List</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLayoutMode('shelf')}
                aria-pressed={layoutMode === 'shelf'}
                data-testid="layout-mode-shelf"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: layoutMode === 'shelf' ? 'var(--accent-primary)' : 'transparent',
                  color: layoutMode === 'shelf' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                <Disc3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Record Shelf</span>
              </button>
            </div>
          )}

          {showPlayableControls && (
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={moreMenuOpen}
                aria-label="More view options"
                title="More options"
                data-testid="banner-more-menu"
                className="theme-btn-secondary p-2.5 cursor-pointer flex items-center justify-center"
                style={{
                  color: highlightsOnly ? 'var(--accent-primary)' : 'var(--text-primary)',
                }}
              >
                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>

              {moreMenuOpen && (
                <div
                  role="menu"
                  aria-label="View and playlist options"
                  className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 p-1.5 z-50 space-y-0.5"
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: 'var(--border-width) var(--border-style) var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {activeView.type === 'home' && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onTriggerAddMusic();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                      style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Upload Audio Files</span>
                    </button>
                  )}

                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={highlightsOnly}
                    data-testid="toggle-highlights-radio"
                    onClick={() => {
                      onToggleHighlightsOnly();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                    style={{
                      color: highlightsOnly ? 'var(--accent-primary)' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span className="flex items-center gap-2.5">
                      <Radio className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Play Highlights Only (20s)</span>
                    </span>
                    {highlightsOnly && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  </button>

                  {activeView.type === 'playlist' && activePlaylist && (
                    <>
                      <div className="my-1 border-t border-[var(--border-color)]" />
                      <p
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                        <span>Smart Sort Energy Arc</span>
                      </p>
                      {(
                        [
                          { id: 'party-workout', label: 'Party / Workout Arc' },
                          { id: 'late-night', label: 'Late-Night Wind-Down' },
                          { id: 'rollercoaster', label: 'Rollercoaster Vibe' },
                        ] as Array<{ id: EnergyArcType; label: string }>
                      ).map((arc) => (
                        <button
                          key={arc.id}
                          type="button"
                          role="menuitem"
                          data-testid={`sort-arc-${arc.id}`}
                          onClick={() => {
                            onArrangeEnergyArc(activePlaylist.id, arc.id);
                            setMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
                          style={{ color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)' }}
                        >
                          <span>{arc.label}</span>
                        </button>
                      ))}

                      <div className="my-1 border-t border-[var(--border-color)]" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setDraftTitle(activePlaylist.name);
                          setRenaming(true);
                          setMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-[var(--table-row-hover)]"
                        style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Pencil className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Rename Playlist</span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onDeletePlaylist(activePlaylist.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 cursor-pointer hover:bg-[var(--table-row-hover)]"
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      >
                        <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Delete Playlist</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
