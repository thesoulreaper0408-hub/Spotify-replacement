import { Check, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Playlist, ThemeId, Track } from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { PlaylistCoverGrid } from './ThemeArtwork';

interface PlaylistsGridProps {
  playlists: Playlist[];
  allTracks: Track[];
  theme: ThemeId;
  onOpenPlaylist: (playlistId: string) => void;
  onPlayPlaylist: (playlistId: string) => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onOpenCreatePlaylist: () => void;
}

export function PlaylistsGrid({
  playlists,
  allTracks,
  theme,
  onOpenPlaylist,
  onPlayPlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onOpenCreatePlaylist,
}: PlaylistsGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const trackMap = new Map(allTracks.map((t) => [t.id, t]));

  return (
    <section aria-label="Playlists Grid" className="pointer-events-none px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2
          className="font-theme-display text-lg sm:text-xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          All Playlists
        </h2>
        <button
          type="button"
          onClick={onOpenCreatePlaylist}
          className="theme-btn-primary pointer-events-auto flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="theme-panel pointer-events-auto p-8 text-center max-w-md mx-auto space-y-3">
          <p className="font-theme-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            No playlists created yet
          </p>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Create your first playlist to group uploaded local tracks by mood or genre.
          </p>
          <button
            type="button"
            onClick={onOpenCreatePlaylist}
            className="theme-btn-primary px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {playlists.map((playlist) => {
            const plTracks = playlist.trackIds
              .map((id) => trackMap.get(id))
              .filter((t): t is Track => Boolean(t));
            const totalDuration = plTracks.reduce((sum, t) => sum + t.duration, 0);
            const isEditing = editingId === playlist.id;

            return (
              <div
                key={playlist.id}
                className="theme-panel pointer-events-auto p-4 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="win95-titlebar" aria-hidden="true">
                  <span className="truncate">{playlist.name}.pls</span>
                  <span className="shrink-0 ml-2 tracking-widest">_ □ ×</span>
                </div>

                <div className="flex items-start gap-3.5">
                  <PlaylistCoverGrid
                    tracks={plTracks}
                    theme={theme}
                    title={playlist.name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={draftName}
                          autoFocus
                          aria-label={`Edit name for ${playlist.name}`}
                          onChange={(e) => setDraftName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && draftName.trim()) {
                              onRenamePlaylist(playlist.id, draftName.trim());
                              setEditingId(null);
                            }
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full min-w-0 px-2 py-1 text-xs outline-none"
                          style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--accent-primary)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (draftName.trim()) {
                              onRenamePlaylist(playlist.id, draftName.trim());
                            }
                            setEditingId(null);
                          }}
                          aria-label="Save playlist name"
                          className="p-1 cursor-pointer"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenPlaylist(playlist.id)}
                        className="text-left block w-full font-theme-display font-bold text-sm sm:text-base truncate cursor-pointer hover:underline"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {playlist.name}
                      </button>
                    )}
                    <p
                      className="text-xs line-clamp-2 mt-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {playlist.description || 'Custom local playlist'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]">
                  <span
                    className="font-theme-mono text-xs whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {plTracks.length} {plTracks.length === 1 ? 'track' : 'tracks'} ·{' '}
                    {formatDuration(totalDuration)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftName(playlist.name);
                        setEditingId(playlist.id);
                      }}
                      aria-label={`Rename ${playlist.name}`}
                      className="p-1.5 cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePlaylist(playlist.id)}
                      aria-label={`Delete ${playlist.name}`}
                      className="p-1.5 cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onPlayPlaylist(playlist.id)}
                      disabled={plTracks.length === 0}
                      aria-label={`Play ${playlist.name}`}
                      className="theme-btn-primary p-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ml-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
