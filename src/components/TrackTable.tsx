import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Clock,
  ListEnd,
  Mic,
  MinusCircle,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Upload,
} from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import type {
  ActiveView,
  Playlist,
  SortDirection,
  SortField,
  ThemeId,
  Track,
} from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { ThemeArtwork } from './ThemeArtwork';
import { ThemeHeartIcon } from './ThemeIcons';

interface TrackTableProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  theme: ThemeId;
  activeView: ActiveView;
  playlists: Playlist[];
  searchQuery: string;
  memoriesOnly: boolean;
  memoriesCount: number;
  sortField: SortField;
  sortDirection: SortDirection;
  onToggleMemoriesOnly: () => void;
  onSortChange: (field: Exclude<SortField, 'default'>) => void;
  onSelectTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (trackId: string) => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  onTriggerUploadLrc: (trackId: string) => void;
  onOpenCoverDesigner: (track: Track) => void;
  onOpenTrackJournal: (track: Track) => void;
  onOpenCreatePlaylist: () => void;
  onTriggerAddMusic: () => void;
  onClearSearch: () => void;
}

export function TrackTable({
  tracks,
  currentTrackId,
  isPlaying,
  theme,
  activeView,
  playlists,
  searchQuery,
  memoriesOnly,
  memoriesCount,
  sortField,
  sortDirection,
  onToggleMemoriesOnly,
  onSortChange,
  onSelectTrack,
  onToggleLike,
  onAddToQueue,
  onAddTrackToPlaylist,
  onRemoveTrackFromPlaylist,
  onTriggerUploadLrc,
  onOpenCoverDesigner,
  onOpenTrackJournal,
  onOpenCreatePlaylist,
  onTriggerAddMusic,
  onClearSearch,
}: TrackTableProps) {
  const [menuState, setMenuState] = useState<{
    trackId: string;
    x?: number;
    y?: number;
  } | null>(null);

  useEffect(() => {
    if (!menuState) return;
    const close = () => setMenuState(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuState]);

  const renderSortIcon = (field: Exclude<SortField, 'default'>) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
    );
  };

  const getAriaSort = (field: Exclude<SortField, 'default'>) => {
    if (sortField !== field) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  if (tracks.length === 0) {
    return (
      <div className="pointer-events-none px-4 sm:px-6 py-12">
        <div className="theme-panel pointer-events-auto p-8 text-center max-w-lg mx-auto space-y-4">
          <p className="font-theme-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {memoriesOnly
              ? 'No songs with memory notes yet'
              : searchQuery
                ? `No tracks match "${searchQuery}"`
                : activeView.type === 'liked'
                  ? 'No liked songs yet'
                  : activeView.type === 'playlist'
                    ? 'This playlist is empty'
                    : 'Your library has no tracks'}
          </p>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            {memoriesOnly
              ? 'Attach a personal journal note to any song via the ... menu to collect memories here.'
              : searchQuery
                ? 'Try another keyword or clear your search filter.'
                : activeView.type === 'liked'
                  ? 'Click the heart icon on any track in your library to save it here.'
                  : activeView.type === 'playlist'
                    ? 'Use the ... menu or right-click any track in Home to add songs here.'
                    : 'Select .mp3, .wav, .ogg, or .m4a audio files from your device.'}
          </p>
          <div className="pt-1 flex justify-center">
            {memoriesOnly ? (
              <button
                type="button"
                onClick={onToggleMemoriesOnly}
                className="theme-btn-primary px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
              >
                Show All Tracks
              </button>
            ) : searchQuery ? (
              <button
                type="button"
                onClick={onClearSearch}
                className="theme-btn-primary px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={onTriggerAddMusic}
                className="theme-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>Add Local Music</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const menuTrack = menuState
    ? tracks.find((t) => t.id === menuState.trackId) ?? null
    : null;

  return (
    <div className="pointer-events-none px-3 sm:px-6 py-4 relative space-y-3">
      {/* Inline Track Filter Bar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMemoriesOnly}
            aria-pressed={memoriesOnly}
            data-testid="filter-songs-with-memories"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
            style={{
              backgroundColor: memoriesOnly ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: memoriesOnly ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              border: 'var(--border-width) var(--border-style) var(--border-color)',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Songs with Memories</span>
            <span className="font-theme-mono text-[11px] opacity-80 tabular-nums">
              ({memoriesCount})
            </span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="pointer-events-auto w-full border-collapse text-left" aria-label="Tracklist">
          <thead>
            <tr
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: 'var(--text-muted)',
                borderBottom: 'var(--border-width) var(--border-style) var(--border-color)',
              }}
            >
              <th scope="col" className="py-2.5 pl-3 pr-2 w-12 text-center font-theme-mono">
                #
              </th>
              <th scope="col" aria-sort={getAriaSort('title')} className="py-2.5 px-2">
                <button
                  type="button"
                  onClick={() => onSortChange('title')}
                  className="inline-flex items-center gap-1.5 uppercase tracking-wider cursor-pointer hover:underline"
                  style={{ color: sortField === 'title' ? 'var(--accent-primary)' : 'inherit' }}
                >
                  <span>Title</span>
                  {renderSortIcon('title')}
                </button>
              </th>
              <th scope="col" aria-sort={getAriaSort('artist')} className="py-2.5 px-2 hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => onSortChange('artist')}
                  className="inline-flex items-center gap-1.5 uppercase tracking-wider cursor-pointer hover:underline"
                  style={{ color: sortField === 'artist' ? 'var(--accent-primary)' : 'inherit' }}
                >
                  <span>Artist</span>
                  {renderSortIcon('artist')}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-2 hidden md:table-cell">
                Album
              </th>
              <th scope="col" aria-sort={getAriaSort('duration')} className="py-2.5 px-2 w-24 text-right font-theme-mono">
                <button
                  type="button"
                  onClick={() => onSortChange('duration')}
                  aria-label="Sort by duration"
                  className="inline-flex items-center justify-end gap-1.5 cursor-pointer"
                  style={{ color: sortField === 'duration' ? 'var(--accent-primary)' : 'inherit' }}
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {renderSortIcon('duration')}
                </button>
              </th>
              <th scope="col" className="py-2.5 pl-2 pr-3 w-32 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, idx) => {
              const isCurrent = track.id === currentTrackId;
              const isCurrentPlaying = isCurrent && isPlaying;
              const menuOpen = menuState?.trackId === track.id;

              return (
                <tr
                  key={track.id}
                  data-track-id={track.id}
                  data-active={isCurrent ? 'true' : 'false'}
                  onContextMenu={(e: MouseEvent<HTMLTableRowElement>) => {
                    e.preventDefault();
                    setMenuState({ trackId: track.id, x: e.clientX, y: e.clientY });
                  }}
                  className="track-row group transition-colors"
                  style={{
                    backgroundColor: isCurrent ? 'var(--table-row-active)' : undefined,
                    borderBottom: '1px var(--border-style) var(--border-color)',
                  }}
                >
                  <td className="py-2.5 pl-3 pr-2 text-center align-middle w-12">
                    <button
                      type="button"
                      onClick={() => onSelectTrack(track)}
                      aria-label={
                        isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`
                      }
                      className="w-8 h-8 inline-flex items-center justify-center cursor-pointer transition-colors"
                      style={{
                        color: isCurrent ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {isCurrentPlaying ? (
                        <span className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                          <span
                            className="eq-bar w-1 h-full"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                          />
                          <span
                            className="eq-bar w-1 h-full"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                          />
                          <span
                            className="eq-bar w-1 h-full"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                          />
                        </span>
                      ) : isCurrent ? (
                        <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                      ) : (
                        <>
                          <span className="font-theme-mono text-xs group-hover:hidden">
                            {idx + 1}
                          </span>
                          <Play
                            className="w-4 h-4 fill-current hidden group-hover:block"
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-2.5 px-2 align-middle max-w-[200px] sm:max-w-[300px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <ThemeArtwork
                        theme={theme}
                        seed={track.coverSeed}
                        customCoverUrl={track.customCoverUrl}
                        title={`${track.title} cover`}
                        size="xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectTrack(track)}
                            className="track-title-prompt text-left truncate text-sm font-semibold cursor-pointer hover:underline"
                            style={{
                              color: isCurrent ? 'var(--accent-primary)' : 'var(--text-primary)',
                            }}
                          >
                            {track.title}
                            {theme === 'terminal' && isCurrentPlaying && (
                              <span className="terminal-cursor" aria-hidden="true" />
                            )}
                          </button>
                          {track.note && (
                            <button
                              type="button"
                              onClick={() => onOpenTrackJournal(track)}
                              title={`Memory: ${track.note}`}
                              aria-label={`Memory note for ${track.title}: ${track.note}`}
                              className="shrink-0 p-0.5 cursor-pointer"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                        <p
                          className="text-xs truncate sm:hidden"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td
                    className="py-2.5 px-2 align-middle text-xs sm:text-sm hidden sm:table-cell max-w-[180px] truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {track.artist}
                  </td>

                  <td
                    className="py-2.5 px-2 align-middle text-xs sm:text-sm hidden md:table-cell max-w-[180px] truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {track.album}
                  </td>

                  <td
                    className="py-2.5 px-2 align-middle text-right font-theme-mono text-xs whitespace-nowrap"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {formatDuration(track.duration)}
                  </td>

                  <td className="py-2.5 pl-2 pr-3 align-middle text-right relative">
                    <div className="inline-flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        onClick={() => onToggleLike(track.id)}
                        aria-label={
                          track.liked
                            ? `Unlike ${track.title}`
                            : `Like ${track.title}`
                        }
                        aria-pressed={track.liked}
                        className="p-1.5 transition-transform hover:scale-110 cursor-pointer"
                        style={{
                          color: track.liked ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}
                      >
                        <ThemeHeartIcon
                          theme={theme}
                          filled={track.liked}
                          className="w-4 h-4"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCoverDesigner(track)}
                        aria-label={`Edit ${track.title} name and picture`}
                        title="Edit song name & picture"
                        data-testid={`edit-track-${track.id}`}
                        className="p-1.5 transition-colors hover:text-[var(--accent-primary)] cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuState(menuOpen ? null : { trackId: track.id });
                        }}
                        aria-label={`More options for ${track.title}`}
                        aria-expanded={menuOpen}
                        className="p-1.5 transition-colors cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {menuOpen && menuState?.x === undefined && (
                      <div
                        role="menu"
                        aria-label={`Actions for ${track.title}`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 top-11 z-40 w-56 p-2 text-left"
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
                            onAddToQueue(track.id);
                            setMenuState(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
                          style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                        >
                          <ListEnd className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Add to Up Next Queue</span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onTriggerUploadLrc(track.id);
                            setMenuState(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
                          style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{track.lyrics?.length ? 'Replace .lrc Lyrics' : 'Upload .lrc Lyrics'}</span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onOpenTrackJournal(track);
                            setMenuState(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
                          style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                        >
                          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{track.note ? 'Edit Memory Journal' : 'Memory Journal'}</span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onOpenCoverDesigner(track);
                            setMenuState(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
                          style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit Song &amp; Picture</span>
                        </button>

                        {activeView.type === 'playlist' && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              onRemoveTrackFromPlaylist(activeView.playlistId, track.id);
                              setMenuState(null);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer text-red-400 hover:bg-[var(--table-row-hover)]"
                            style={{ borderRadius: 'var(--radius-sm)' }}
                          >
                            <MinusCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Remove from Playlist</span>
                          </button>
                        )}

                        <div className="my-1 border-t border-[var(--border-color)]" />

                        <p
                          className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Add to Playlist
                        </p>
                        <div className="space-y-1 max-h-40 overflow-y-auto my-1">
                          {playlists.map((pl) => {
                            const alreadyIn = pl.trackIds.includes(track.id);
                            return (
                              <button
                                key={pl.id}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  if (alreadyIn) {
                                    onRemoveTrackFromPlaylist(pl.id, track.id);
                                  } else {
                                    onAddTrackToPlaylist(pl.id, track.id);
                                  }
                                  setMenuState(null);
                                }}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium cursor-pointer transition-colors"
                                style={{
                                  color: alreadyIn ? 'var(--accent-primary)' : 'var(--text-primary)',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: alreadyIn ? 'var(--accent-subtle)' : 'transparent',
                                }}
                              >
                                <span className="truncate">{pl.name}</span>
                                <span className="ml-2 shrink-0">{alreadyIn ? 'Remove' : '+'}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuState(null);
                            onOpenCreatePlaylist();
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold cursor-pointer mt-1"
                          style={{
                            color: 'var(--accent-primary)',
                            borderTop: '1px solid var(--border-color)',
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>New Playlist</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Right-click Floating Context Menu */}
      {menuState && menuState.x !== undefined && menuState.y !== undefined && menuTrack && (
        <div
          role="menu"
          aria-label={`Context menu for ${menuTrack.title}`}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-56 p-2 text-left"
          style={{
            left: `${Math.min(menuState.x, window.innerWidth - 240)}px`,
            top: `${Math.min(menuState.y, window.innerHeight - 280)}px`,
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-width) var(--border-style) var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <p className="px-2 py-1 text-xs font-bold truncate" style={{ color: 'var(--accent-primary)' }}>
            {menuTrack.title}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onAddToQueue(menuTrack.id);
              setMenuState(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            <ListEnd className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add to Up Next Queue</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onTriggerUploadLrc(menuTrack.id);
              setMenuState(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Upload .lrc Lyrics</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenTrackJournal(menuTrack);
              setMenuState(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Memory Journal</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenCoverDesigner(menuTrack);
              setMenuState(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-[var(--table-row-hover)]"
            style={{ color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit Song &amp; Picture</span>
          </button>

          {activeView.type === 'playlist' && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onRemoveTrackFromPlaylist(activeView.playlistId, menuTrack.id);
                setMenuState(null);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer text-red-400 hover:bg-[var(--table-row-hover)]"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <MinusCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Remove from Playlist</span>
            </button>
          )}

          <div className="my-1 border-t border-[var(--border-color)]" />
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {playlists.map((pl) => {
              const alreadyIn = pl.trackIds.includes(menuTrack.id);
              return (
                <button
                  key={pl.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (alreadyIn) {
                      onRemoveTrackFromPlaylist(pl.id, menuTrack.id);
                    } else {
                      onAddTrackToPlaylist(pl.id, menuTrack.id);
                    }
                    setMenuState(null);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    color: alreadyIn ? 'var(--accent-primary)' : 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: alreadyIn ? 'var(--accent-subtle)' : 'transparent',
                  }}
                >
                  <span className="truncate">{pl.name}</span>
                  <span className="ml-2 shrink-0">{alreadyIn ? 'Remove' : '+'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
