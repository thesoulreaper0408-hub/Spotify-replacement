import {
  BarChart3,
  Check,
  Disc3,
  FolderCheck,
  Home,
  ListMusic,
  Mic,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { ActiveView, Playlist, ThemeId } from '../types/music';
import { ThemeHeartIcon } from './ThemeIcons';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  playlists: Playlist[];
  likedCount: number;
  totalTracksCount: number;
  duplicateCount: number;
  onOpenCreatePlaylist: () => void;
  onTriggerAddMusic: () => void;
  onOpenCleanup: () => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  theme: ThemeId;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeView,
  onNavigate,
  playlists,
  likedCount,
  totalTracksCount,
  duplicateCount,
  onOpenCreatePlaylist,
  onTriggerAddMusic,
  onOpenCleanup,
  onRenamePlaylist,
  onDeletePlaylist,
  theme,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const isNavActive = (type: ActiveView['type'], playlistId?: string) => {
    if (activeView.type !== type) return false;
    if (type === 'playlist') {
      return activeView.type === 'playlist' && activeView.playlistId === playlistId;
    }
    return true;
  };

  const handleNav = (view: ActiveView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const startRename = (pl: Playlist) => {
    setEditingId(pl.id);
    setDraftName(pl.name);
  };

  const commitRename = (playlistId: string) => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onRenamePlaylist(playlistId, trimmed);
    }
    setEditingId(null);
  };

  const sidebarContent = (
    <aside
      aria-label="Primary Library Navigation"
      className="flex flex-col h-full w-[272px] shrink-0 select-none"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: 'var(--border-width) var(--border-style) var(--border-color)',
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <button
          type="button"
          onClick={() => handleNav({ type: 'home' })}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <span
            className="w-9 h-9 flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-on-accent)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-width) var(--border-style) var(--border-strong)',
              boxShadow: 'var(--shadow-btn)',
            }}
          >
            <Disc3 className="w-5 h-5" aria-hidden="true" />
          </span>
          <span
            className={`font-theme-display font-bold tracking-tight whitespace-nowrap ${
              theme === 'pixel-retro' ? 'text-sm' : 'text-xl'
            }`}
            style={{ color: 'var(--text-primary)' }}
          >
            ChordDeck
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation drawer"
          className="lg:hidden p-2 cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav aria-label="Main sections" className="px-3 space-y-1">
        <button
          type="button"
          onClick={() => handleNav({ type: 'home' })}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: isNavActive('home') ? 'var(--bg-surface-elevated)' : 'transparent',
            color: isNavActive('home') ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: isNavActive('home')
              ? 'var(--border-width) var(--border-style) var(--border-color)'
              : 'var(--border-width) var(--border-style) transparent',
          }}
        >
          <span className="flex items-center gap-3 min-w-0">
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Home</span>
          </span>
          <span className="font-theme-mono text-xs opacity-75">{totalTracksCount}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNav({ type: 'liked' })}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: isNavActive('liked') ? 'var(--bg-surface-elevated)' : 'transparent',
            color: isNavActive('liked') ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: isNavActive('liked')
              ? 'var(--border-width) var(--border-style) var(--border-color)'
              : 'var(--border-width) var(--border-style) transparent',
          }}
        >
          <span className="flex items-center gap-3 min-w-0">
            <ThemeHeartIcon theme={theme} filled={isNavActive('liked')} className="w-4 h-4 shrink-0" />
            <span className="truncate">Liked Songs</span>
          </span>
          <span className="font-theme-mono text-xs opacity-75">{likedCount}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNav({ type: 'playlists' })}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: isNavActive('playlists') ? 'var(--bg-surface-elevated)' : 'transparent',
            color: isNavActive('playlists') ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: isNavActive('playlists')
              ? 'var(--border-width) var(--border-style) var(--border-color)'
              : 'var(--border-width) var(--border-style) transparent',
          }}
        >
          <span className="flex items-center gap-3 min-w-0">
            <ListMusic className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Playlists</span>
          </span>
          <span className="font-theme-mono text-xs opacity-75">{playlists.length}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNav({ type: 'lyrics' })}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: isNavActive('lyrics') ? 'var(--bg-surface-elevated)' : 'transparent',
            color: isNavActive('lyrics') ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: isNavActive('lyrics')
              ? 'var(--border-width) var(--border-style) var(--border-color)'
              : 'var(--border-width) var(--border-style) transparent',
          }}
        >
          <span className="flex items-center gap-3 min-w-0">
            <Mic className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Lyrics</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleNav({ type: 'stats' })}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: isNavActive('stats') ? 'var(--bg-surface-elevated)' : 'transparent',
            color: isNavActive('stats') ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: isNavActive('stats')
              ? 'var(--border-width) var(--border-style) var(--border-color)'
              : 'var(--border-width) var(--border-style) transparent',
          }}
        >
          <span className="flex items-center gap-3 min-w-0">
            <BarChart3 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Stats</span>
          </span>
        </button>
      </nav>

      {/* Library Actions */}
      <div className="px-3 pt-4 pb-3 space-y-2">
        <button
          type="button"
          onClick={() => {
            onTriggerAddMusic();
            onCloseMobile();
          }}
          className="theme-btn-primary theme-angled w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Add Local Music</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenCreatePlaylist();
            onCloseMobile();
          }}
          className="theme-btn-secondary w-full flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Create Playlist</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenCleanup();
            onCloseMobile();
          }}
          data-testid="sidebar-cleanup-button"
          className="theme-btn-secondary w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer whitespace-nowrap"
        >
          <FolderCheck className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
          <span>Library Cleanup</span>
          {duplicateCount > 0 && (
            <span
              className="px-1.5 py-0.5 text-[10px] font-theme-mono font-bold tabular-nums"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {duplicateCount}
            </span>
          )}
        </button>
      </div>

      <div
        className="mx-3 my-1"
        style={{
          borderTop: 'var(--border-width) var(--border-style) var(--border-color)',
        }}
      />

      {/* User Playlists List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p
          className="px-3 pb-2 text-xs font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          Your Playlists
        </p>
        {playlists.length === 0 ? (
          <p className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            No playlists yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {playlists.map((playlist) => {
              const active = isNavActive('playlist', playlist.id);
              const isEditing = editingId === playlist.id;
              return (
                <li key={playlist.id} className="group flex items-center gap-1">
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-1 px-1 py-1">
                      <input
                        type="text"
                        value={draftName}
                        autoFocus
                        aria-label={`Rename playlist ${playlist.name}`}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(playlist.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 min-w-0 px-2 py-1 text-xs outline-none"
                        style={{
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--accent-primary)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => commitRename(playlist.id)}
                        aria-label={`Save name for ${playlist.name}`}
                        className="p-1 cursor-pointer"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleNav({ type: 'playlist', playlistId: playlist.id })}
                        className="flex-1 min-w-0 flex items-center justify-between px-3 py-2 text-left text-sm transition-colors cursor-pointer"
                        style={{
                          backgroundColor: active ? 'var(--bg-surface-elevated)' : 'transparent',
                          color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <ListMusic className="w-3.5 h-3.5 shrink-0 opacity-75" aria-hidden="true" />
                          <span className="truncate font-medium">{playlist.name}</span>
                        </span>
                        <span className="font-theme-mono text-xs opacity-70 ml-2 shrink-0">
                          {playlist.trackIds.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startRename(playlist)}
                        aria-label={`Rename playlist ${playlist.name}`}
                        className="p-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePlaylist(playlist.id)}
                        aria-label={`Delete playlist ${playlist.name}`}
                        className="p-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex h-full shrink-0">{sidebarContent}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
