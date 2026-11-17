import { Disc3, Pause, Play } from 'lucide-react';
import { useMemo } from 'react';
import { useTurntableSpin } from '../hooks/useTurntableSpin';
import type { Playlist, ThemeId, Track } from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { ThemeArtwork } from './ThemeArtwork';

interface RecordShelfViewProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrackId: string | null;
  isPlaying: boolean;
  theme: ThemeId;
  onSelectTrack: (track: Track) => void;
  onOpenPlaylist: (playlistId: string) => void;
  onPlayPlaylist: (playlistId: string) => void;
}

interface AlbumShelfGroup {
  album: string;
  artist: string;
  tracks: Track[];
  coverTrack: Track;
}

interface AlbumSleeveCardProps {
  group: AlbumShelfGroup;
  isGroupCurrent: boolean;
  isGroupSpinning: boolean;
  targetTrack: Track;
  isCdTheme: boolean;
  theme: ThemeId;
  onSelectTrack: (track: Track) => void;
}

function AlbumSleeveCard({
  group,
  isGroupCurrent,
  isGroupSpinning,
  targetTrack,
  isCdTheme,
  theme,
  onSelectTrack,
}: AlbumSleeveCardProps) {
  const { rotorRef, rotorClassName, motorState } = useTurntableSpin<HTMLSpanElement>(isGroupSpinning);

  return (
    <div
      className={`vinyl-sleeve-slot flex flex-col items-center relative ${
        isGroupCurrent ? 'z-20' : 'z-10'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelectTrack(targetTrack)}
        data-pulled={isGroupCurrent ? 'true' : 'false'}
        data-spinning={isGroupSpinning ? 'true' : 'false'}
        aria-label={
          isGroupSpinning ? `Pause ${group.album}` : `Spin disc for ${group.album}`
        }
        className="vinyl-sleeve-card relative w-full max-w-[164px] aspect-square cursor-pointer text-left group"
      >
        {/* Slide-out Wrapper (handles horizontal slide-out cleanly) */}
        <span
          aria-hidden="true"
          className="vinyl-disc-tray block absolute top-[6%] right-0 w-[86%] h-[86%] pointer-events-none"
        >
          {/* Inner Spinning Vinyl / CD Rotor (handles continuous motor-eased rotation) */}
          <span
            ref={rotorRef}
            data-testid={`vinyl-disc-${group.coverTrack.id}`}
            data-motor-state={motorState}
            className={`${rotorClassName} relative w-full h-full rounded-full flex items-center justify-center overflow-hidden`}
            style={{
              background: isCdTheme
                ? 'conic-gradient(from 20deg, #e0f2fe 0deg, #38bdf8 55deg, #f5d0fe 115deg, #c084fc 175deg, #e0f2fe 230deg, #67e8f9 295deg, #e0f2fe 360deg)'
                : 'repeating-radial-gradient(circle at center, #101014 0px, #101014 3px, #25252e 4px, #0b0b0e 5px)',
              border: '2px solid rgba(255,255,255,0.32)',
              boxShadow: '0 8px 18px rgba(0,0,0,0.55)',
            }}
          >
            {/* Diagonal glossy specular sheen so spin is unmistakably visible */}
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(255,255,255,0.38) 0deg 28deg, transparent 56deg 176deg, rgba(255,255,255,0.28) 190deg 220deg, transparent 250deg 360deg)',
              }}
            />

            {/* Contrasting rotating outer groove tick mark + opposing counterweight tick */}
            <span
              className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-3.5 rounded-full opacity-95"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            />
            <span
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-2 rounded-full opacity-75"
              style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
            />

            {/* Asymmetric Center Vinyl Label */}
            <span
              className="relative z-10 w-[38%] h-[38%] rounded-full flex items-center justify-center overflow-hidden shadow-inner"
              style={{
                background:
                  'conic-gradient(from 0deg, var(--accent-primary) 0deg 180deg, var(--accent-secondary) 180deg 270deg, #f8fafc 270deg 360deg)',
                border: '3px solid #09090b',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-black border border-white/60" />
            </span>
          </span>
        </span>

        {/* Front Record Sleeve */}
        <span
          className="vinyl-sleeve-cover relative z-10 block w-full h-full overflow-hidden"
          style={{
            borderRadius: 'var(--radius-md)',
            border: isGroupCurrent
              ? '2px solid var(--accent-primary)'
              : 'var(--border-width) var(--border-style) var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {group.coverTrack.customCoverUrl ? (
            <img
              src={group.coverTrack.customCoverUrl}
              alt={`${group.album} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full [&>div]:!w-full [&>div]:!h-full [&>div]:!max-w-none">
              <ThemeArtwork
                theme={theme}
                seed={group.coverTrack.coverSeed}
                title={`${group.album} sleeve`}
                size="xl"
              />
            </div>
          )}

          {/* Play / Pause Hover Chip */}
          <span
            className={`absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center transition-opacity ${
              isGroupSpinning ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-on-accent)',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-btn)',
            }}
          >
            {isGroupSpinning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </span>
        </span>
      </button>

      <div className="w-full max-w-[164px] pt-2.5 text-center space-y-0.5">
        <p
          className="text-xs sm:text-sm font-bold truncate"
          style={{
            color: isGroupCurrent ? 'var(--accent-primary)' : 'var(--text-primary)',
          }}
        >
          {group.album}
        </p>
        <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
          {group.artist} · {group.tracks.length}{' '}
          {group.tracks.length === 1 ? 'track' : 'tracks'}
        </p>
      </div>
    </div>
  );
}

interface PlaylistCrateCardProps {
  playlist: Playlist;
  plTracks: Track[];
  totalDur: number;
  isPlPlaying: boolean;
  theme: ThemeId;
  onPlayPlaylist: (playlistId: string) => void;
  onOpenPlaylist: (playlistId: string) => void;
}

function PlaylistCrateCard({
  playlist,
  plTracks,
  totalDur,
  isPlPlaying,
  theme,
  onPlayPlaylist,
  onOpenPlaylist,
}: PlaylistCrateCardProps) {
  const { rotorRef, rotorClassName, motorState } = useTurntableSpin<HTMLSpanElement>(isPlPlaying);
  const firstTrack = plTracks[0];

  return (
    <div className="theme-panel vinyl-playlist-card p-3.5 flex items-center gap-3.5 transition-transform hover:-translate-y-1">
      <button
        type="button"
        onClick={() => onPlayPlaylist(playlist.id)}
        disabled={plTracks.length === 0}
        aria-label={`Play playlist ${playlist.name}`}
        className="relative shrink-0 cursor-pointer disabled:opacity-40 group"
      >
        <ThemeArtwork
          theme={theme}
          seed={firstTrack?.coverSeed ?? 303}
          customCoverUrl={firstTrack?.customCoverUrl}
          title={playlist.name}
          size="md"
          variant="playlist"
        />
        <span
          className={`absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity ${
            isPlPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          <span
            ref={rotorRef}
            data-motor-state={motorState}
            className={`${rotorClassName} inline-flex items-center justify-center`}
          >
            <Disc3 className="w-6 h-6 text-white" />
          </span>
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpenPlaylist(playlist.id)}
          className="font-theme-display text-sm font-bold truncate block w-full text-left cursor-pointer hover:underline"
          style={{ color: 'var(--text-primary)' }}
        >
          {playlist.name}
        </button>
        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
          {playlist.description || 'Curated crate'}
        </p>
        <p className="font-theme-mono text-[11px] pt-1 tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {plTracks.length} tracks · {formatDuration(totalDur)}
        </p>
      </div>
    </div>
  );
}

export function RecordShelfView({
  tracks,
  playlists,
  currentTrackId,
  isPlaying,
  theme,
  onSelectTrack,
  onOpenPlaylist,
  onPlayPlaylist,
}: RecordShelfViewProps) {
  const albumGroups = useMemo<AlbumShelfGroup[]>(() => {
    const map = new Map<string, Track[]>();
    for (const t of tracks) {
      const key = t.album || 'Local Recordings';
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return Array.from(map.entries()).map(([album, list]) => {
      const coverTrack = list.find((t) => Boolean(t.customCoverUrl)) ?? list[0];
      return {
        album,
        artist: coverTrack.artist,
        tracks: list,
        coverTrack,
      };
    });
  }, [tracks]);

  const trackMap = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);
  const isCdTheme = theme === 'frutiger-aero' || theme === 'vaporwave';

  return (
    <section
      aria-label="Physical Record and CD Shelf"
      data-testid="record-shelf-view"
      className="pointer-events-none px-4 sm:px-6 py-5 space-y-8"
    >
      {/* Albums & Releases Vinyl Crate Shelf */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            className="font-theme-display text-base sm:text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Album &amp; Single Sleeves
          </h2>
          <span className="font-theme-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Click a sleeve to slide out and spin
          </span>
        </div>

        <div className="record-shelf-row pointer-events-auto overflow-visible">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-7 px-3 pr-12 pb-4">
            {albumGroups.map((group) => {
              const activeTrack = group.tracks.find((t) => t.id === currentTrackId);
              const isGroupCurrent = Boolean(activeTrack);
              const isGroupSpinning = isGroupCurrent && isPlaying;
              const targetTrack = activeTrack ?? group.coverTrack;

              return (
                <AlbumSleeveCard
                  key={group.album}
                  group={group}
                  isGroupCurrent={isGroupCurrent}
                  isGroupSpinning={isGroupSpinning}
                  targetTrack={targetTrack}
                  isCdTheme={isCdTheme}
                  theme={theme}
                  onSelectTrack={onSelectTrack}
                />
              );
            })}
          </div>
          <div className="record-shelf-plank" aria-hidden="true" />
        </div>
      </div>

      {/* Playlists Shelf */}
      {playlists.length > 0 && (
        <div className="space-y-4">
          <h2
            className="font-theme-display text-base sm:text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Playlist Crate
          </h2>

          <div className="record-shelf-row pointer-events-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-2 pb-4">
              {playlists.map((pl) => {
                const plTracks = pl.trackIds
                  .map((id) => trackMap.get(id))
                  .filter((t): t is Track => Boolean(t));
                const totalDur = plTracks.reduce((acc, t) => acc + t.duration, 0);
                const isPlPlaying = Boolean(
                  isPlaying && currentTrackId && pl.trackIds.includes(currentTrackId)
                );

                return (
                  <PlaylistCrateCard
                    key={pl.id}
                    playlist={pl}
                    plTracks={plTracks}
                    totalDur={totalDur}
                    isPlPlaying={isPlPlaying}
                    theme={theme}
                    onPlayPlaylist={onPlayPlaylist}
                    onOpenPlaylist={onOpenPlaylist}
                  />
                );
              })}
            </div>
            <div className="record-shelf-plank" aria-hidden="true" />
          </div>
        </div>
      )}
    </section>
  );
}
