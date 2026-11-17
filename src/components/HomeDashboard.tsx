import { Flame, Gem, History, Pause, Play } from 'lucide-react';
import type { ActiveView, Playlist, ThemeId, Track } from '../types/music';
import { selectForgottenGems } from '../utils/wrappedRecap';
import { PlaylistCoverGrid, ThemeArtwork } from './ThemeArtwork';
import { ThemeHeartIcon } from './ThemeIcons';

interface HomeDashboardProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrackId: string | null;
  isPlaying: boolean;
  theme: ThemeId;
  onPlayTrack: (track: Track) => void;
  onNavigate: (view: ActiveView) => void;
  onPlayPlaylist: (playlistId: string) => void;
}

export function HomeDashboard({
  tracks,
  playlists,
  currentTrackId,
  isPlaying,
  theme,
  onPlayTrack,
  onNavigate,
  onPlayPlaylist,
}: HomeDashboardProps) {
  if (tracks.length === 0) return null;

  const trackMap = new Map(tracks.map((t) => [t.id, t]));
  const recentlyAdded = [...tracks]
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 4);
  const mostPlayed = [...tracks]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 4);
  const forgottenGems = selectForgottenGems(tracks, Date.now(), 4);

  return (
    <section
      aria-label="Home Dashboard Highlights"
      className="pointer-events-none px-4 sm:px-6 pt-5 pb-2 space-y-6"
    >
      {/* Quick-Play Cards */}
      <div>
        <h2
          className="font-theme-display text-base sm:text-lg font-bold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Quick Play
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {/* Liked Songs Quick Tile */}
          <div className="theme-panel pointer-events-auto p-2.5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigate({ type: 'liked' })}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
            >
              <ThemeArtwork
                theme={theme}
                seed={202}
                title="Liked Songs quick card"
                size="sm"
                variant="liked"
              />
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-bold truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Liked Songs
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {tracks.filter((t) => t.liked).length} favorites
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                const liked = tracks.filter((t) => t.liked);
                if (liked[0]) onPlayTrack(liked[0]);
              }}
              aria-label="Play Liked Songs"
              className="theme-btn-primary w-9 h-9 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ThemeHeartIcon theme={theme} filled className="w-4 h-4" />
            </button>
          </div>

          {/* Playlist Quick Tiles */}
          {playlists.slice(0, 2).map((pl) => {
            const plTracks = pl.trackIds
              .map((id) => trackMap.get(id))
              .filter((t): t is Track => Boolean(t));
            return (
              <div key={pl.id} className="theme-panel pointer-events-auto p-2.5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'playlist', playlistId: pl.id })}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                >
                  <PlaylistCoverGrid
                    tracks={plTracks}
                    theme={theme}
                    title={pl.name}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {pl.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {plTracks.length} {plTracks.length === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onPlayPlaylist(pl.id)}
                  disabled={plTracks.length === 0}
                  aria-label={`Play playlist ${pl.name}`}
                  className="theme-btn-primary w-9 h-9 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Added & Most Played Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recently Added */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <h2
              className="font-theme-display text-sm sm:text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Recently Added
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2.5">
            {recentlyAdded.map((track) => {
              const active = track.id === currentTrackId;
              return (
                <button
                  key={`recent-${track.id}`}
                  type="button"
                  onClick={() => onPlayTrack(track)}
                  className="theme-panel pointer-events-auto p-2.5 flex items-center gap-3 text-left cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <ThemeArtwork
                    theme={theme}
                    seed={track.coverSeed}
                    customCoverUrl={track.customCoverUrl}
                    title={`${track.title} cover`}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: active ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {track.artist}
                    </p>
                  </div>
                  <span
                    className="w-7 h-7 flex items-center justify-center shrink-0"
                    style={{ color: 'var(--accent-primary)' }}
                    aria-hidden="true"
                  >
                    {active && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Most Played */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
            <h2
              className="font-theme-display text-sm sm:text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Most Played
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2.5">
            {mostPlayed.map((track) => {
              const active = track.id === currentTrackId;
              return (
                <button
                  key={`top-${track.id}`}
                  type="button"
                  onClick={() => onPlayTrack(track)}
                  className="theme-panel pointer-events-auto p-2.5 flex items-center gap-3 text-left cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <ThemeArtwork
                    theme={theme}
                    seed={track.coverSeed}
                    customCoverUrl={track.customCoverUrl}
                    title={`${track.title} cover`}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: active ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs font-theme-mono truncate" style={{ color: 'var(--text-muted)' }}>
                      {track.playCount} plays · {track.artist}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Forgotten Gems Shelf */}
      {forgottenGems.length > 0 && (
        <div className="space-y-2.5" data-testid="forgotten-gems-shelf">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <h2
                className="font-theme-display text-sm sm:text-base font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Forgotten Gems
              </h2>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Rediscover unplayed &amp; quiet classics
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {forgottenGems.map((track) => {
              const active = track.id === currentTrackId;
              return (
                <button
                  key={`gem-${track.id}`}
                  type="button"
                  onClick={() => onPlayTrack(track)}
                  className="theme-panel pointer-events-auto p-2.5 flex items-center gap-3 text-left cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <ThemeArtwork
                    theme={theme}
                    seed={track.coverSeed}
                    customCoverUrl={track.customCoverUrl}
                    title={`${track.title} cover`}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: active ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                    >
                      {track.title}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                      {track.playCount === 0 ? 'Never played yet' : 'Quiet for 7+ days'} · {track.artist}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
