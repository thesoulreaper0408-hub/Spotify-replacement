import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Disc3,
  Download,
  Flame,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { THEME_OPTIONS } from '../themes/themes';
import type { RecapCapsule, ThemeId, Track } from '../types/music';

interface WrappedExperienceProps {
  capsule: RecapCapsule | null;
  theme: ThemeId;
  tracks: Track[];
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
}

const SLIDE_COUNT = 6;

export function WrappedExperience({
  capsule,
  theme,
  tracks,
  onClose,
  onPlayTrack,
}: WrappedExperienceProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [capsule?.id, capsule?.kind]);

  useEffect(() => {
    if (!capsule) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (capsule.kind === 'yearly') {
        if (e.key === 'ArrowRight') setSlideIndex((i) => Math.min(SLIDE_COUNT - 1, i + 1));
        if (e.key === 'ArrowLeft') setSlideIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [capsule, onClose]);

  if (!capsule) return null;

  const themeMeta = THEME_OPTIONS.find((t) => t.id === theme) ?? THEME_OPTIONS[0];
  const topTrackEntry = capsule.topTracks[0] ?? null;
  const matchedTopTrack = topTrackEntry
    ? tracks.find((t) => t.id === topTrackEntry.id) ?? null
    : null;

  const handleDownloadPoster = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 900, 1200);
    grad.addColorStop(0, themeMeta.swatches[0]);
    grad.addColorStop(0.55, '#19142b');
    grad.addColorStop(1, themeMeta.swatches[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 1200);

    ctx.strokeStyle = themeMeta.swatches[1];
    ctx.lineWidth = 4;
    ctx.strokeRect(44, 44, 812, 1112);

    ctx.fillStyle = themeMeta.swatches[1];
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText(`CHORDDECK · ${capsule.label.toUpperCase()}`, 84, 126);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(capsule.archetype ?? 'Precision Groove Architect', 84, 210);

    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '600 28px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(
      `${capsule.totalMinutes} Minutes · ${capsule.totalPlays} Plays · ${capsule.averageBpm} Avg BPM`,
      84,
      268
    );

    ctx.fillStyle = themeMeta.swatches[1];
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('TOP TRACKS', 84, 360);

    capsule.topTracks.slice(0, 5).forEach((item, idx) => {
      const y = 420 + idx * 96;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(84, y - 44, 732, 74);
      ctx.fillStyle = themeMeta.swatches[1];
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillText(`#${idx + 1}`, 108, y + 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(`${item.title} — ${item.artist}`.slice(0, 38), 178, y + 4);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '600 22px "JetBrains Mono", monospace';
      ctx.fillText(`${item.plays}x`, 745, y + 4);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText(
      `TOP ARTIST: ${capsule.topArtist?.name ?? 'Local Library'} · PEAK: ${capsule.peakTimeOfDay.toUpperCase()}`,
      84,
      1020
    );
    ctx.fillText(`DOMINANT MOOD: ${capsule.dominantMood.toUpperCase()}`, 84, 1068);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `chorddeck_${capsule.dateKey}_wrapped_poster.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Monthly Sound Capsule Modal (6th of any non-Nov month)
  if (capsule.kind === 'monthly') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Monthly Sound Capsule"
          data-testid="monthly-recap-modal"
          onClick={(e) => e.stopPropagation()}
          className="theme-panel w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5"
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-width) var(--border-style) var(--border-strong)',
          }}
        >
          <div className="win95-titlebar" aria-hidden="true">
            <span>MONTHLY_SOUND_CAPSULE_06.DAT</span>
            <span>_ □ ×</span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--accent-primary)' }}
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>6th of the Month Capsule</span>
              </span>
              <h2
                className="font-theme-display text-xl sm:text-2xl font-extrabold"
                style={{ color: 'var(--text-primary)' }}
              >
                {capsule.label}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Monthly Sound Capsule"
              className="p-1.5 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="theme-panel p-3">
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Minutes
              </p>
              <p className="font-theme-mono text-lg font-bold tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                {capsule.totalMinutes}
              </p>
            </div>
            <div className="theme-panel p-3">
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Top Artist
              </p>
              <p className="text-xs font-bold truncate pt-1" style={{ color: 'var(--text-primary)' }}>
                {capsule.topArtist?.name ?? 'Various'}
              </p>
            </div>
            <div className="theme-panel p-3">
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Peak Time
              </p>
              <p className="text-xs font-bold pt-1" style={{ color: 'var(--text-primary)' }}>
                {capsule.peakTimeOfDay}
              </p>
            </div>
            <div className="theme-panel p-3">
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Mood &amp; BPM
              </p>
              <p className="font-theme-mono text-xs font-bold pt-1 tabular-nums" style={{ color: 'var(--accent-secondary)' }}>
                {capsule.dominantMood} · {capsule.averageBpm}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Top 5 Tracks
            </h3>
            <ul className="space-y-1.5">
              {capsule.topTracks.map((t, idx) => (
                <li
                  key={`${t.id}-${idx}`}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-theme-mono text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {t.title}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                        {t.artist}
                      </p>
                    </div>
                  </div>
                  <span className="font-theme-mono text-xs font-bold tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {t.plays} plays
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]">
            {matchedTopTrack && (
              <button
                type="button"
                onClick={() => onPlayTrack(matchedTopTrack)}
                className="theme-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Play #1 Track</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadPoster}
              className="theme-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer ml-auto"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Save Capsule PNG</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grand Annual Wrapped (November 6th Edition — 6-Slide Interactive Story)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Annual Wrapped November 6th Edition"
      data-testid="yearly-wrapped-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        background: `radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 26%, #090910), #06060b 75%)`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="theme-panel w-full max-w-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--border-width) var(--border-style) var(--accent-primary)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
        }}
      >
        {/* Top Story Progress Bars */}
        <div className="flex items-center gap-2">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlideIndex(i)}
              aria-label={`Go to Wrapped slide ${i + 1}`}
              className="flex-1 h-1.5 rounded-full overflow-hidden cursor-pointer"
              style={{ backgroundColor: 'var(--track-rail)' }}
            >
              <span
                className="block h-full transition-all duration-300"
                style={{
                  width: i <= slideIndex ? '100%' : '0%',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Annual Wrapped"
            className="p-1 ml-2 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="min-h-[320px] flex flex-col justify-center space-y-5 py-2">
          {slideIndex === 0 && (
            <div className="space-y-4 text-center">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>November 6th Annual Edition</span>
              </span>
              <h2
                className="font-theme-display text-3xl sm:text-5xl font-extrabold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Your {capsule.year} Wrapped
              </h2>
              <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Six chapters capturing every groove, late-night session, and standout track in your deck.
              </p>
              {matchedTopTrack && (
                <button
                  type="button"
                  onClick={() => onPlayTrack(matchedTopTrack)}
                  className="theme-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  <Disc3 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Play #1 Soundtrack: {matchedTopTrack.title}</span>
                </button>
              )}
            </div>
          )}

          {slideIndex === 1 && (
            <div className="space-y-4 text-center">
              <Clock className="w-10 h-10 mx-auto" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Total Time In Rotation
              </p>
              <p
                className="font-theme-mono text-5xl sm:text-6xl font-extrabold tabular-nums"
                style={{ color: 'var(--accent-primary)' }}
              >
                {capsule.totalMinutes.toLocaleString()}
              </p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Minutes of Pure Audio ({capsule.totalPlays} plays)
              </p>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                Longest Streak: <strong className="font-theme-mono">{capsule.streakDays ?? 1} days</strong> · Peak Hour: <strong>{capsule.peakTimeOfDay}</strong>
              </p>
            </div>
          )}

          {slideIndex === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                <h3 className="font-theme-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Your Top 5 Songs of {capsule.year}
                </h3>
              </div>
              <ul className="space-y-2">
                {capsule.topTracks.map((item, idx) => (
                  <li
                    key={`${item.id}-${idx}`}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      backgroundColor: idx === 0 ? 'var(--accent-subtle)' : 'var(--bg-input)',
                      border: idx === 0 ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-theme-mono mr-2.5" style={{ color: 'var(--accent-primary)' }}>
                        #{idx + 1}
                      </span>
                      {item.title} <span className="font-normal opacity-75">· {item.artist}</span>
                    </span>
                    <span className="font-theme-mono text-xs font-bold tabular-nums shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
                      {item.plays} plays
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {slideIndex === 3 && (
            <div className="space-y-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-secondary)' }}>
                #1 Signature Sound
              </p>
              <h3 className="font-theme-display text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {capsule.topArtist?.name ?? 'Local Studio Sessions'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Led your library with <strong className="font-theme-mono">{capsule.topArtist?.plays ?? capsule.totalPlays}</strong> total spins, anchored by an average tempo of{' '}
                <strong className="font-theme-mono">{capsule.averageBpm} BPM</strong>.
              </p>
            </div>
          )}

          {slideIndex === 4 && (
            <div className="space-y-4 text-center">
              <Award className="w-12 h-12 mx-auto" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Listener Archetype Unlocked
              </p>
              <h3 className="font-theme-display text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--accent-primary)' }}>
                {capsule.archetype ?? 'Precision Groove Architect'}
              </h3>
              <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {capsule.archetypeTagline ?? 'You curate cohesive journeys across moods and tempos.'}
              </p>
              <p className="font-theme-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                Dominant Mood: {capsule.dominantMood} · Peak Time: {capsule.peakTimeOfDay}
              </p>
            </div>
          )}

          {slideIndex === 5 && (
            <div className="space-y-4 text-center">
              <Sparkles className="w-10 h-10 mx-auto" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <h3 className="font-theme-display text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Share Your Nov 6 Wrapped Poster
              </h3>
              <p className="text-xs sm:text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Export a crisp 900×1200 summary poster featuring your Top 5 tracks, Listener Archetype, and {capsule.totalMinutes} minutes listened.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  data-testid="download-wrapped-poster"
                  className="theme-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Wrapped Summary Poster (.png)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            disabled={slideIndex === 0}
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            className="theme-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-35"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </button>

          <span className="font-theme-mono text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Slide {slideIndex + 1} / {SLIDE_COUNT}
          </span>

          {slideIndex < SLIDE_COUNT - 1 ? (
            <button
              type="button"
              onClick={() => setSlideIndex((i) => Math.min(SLIDE_COUNT - 1, i + 1))}
              data-testid="wrapped-next-slide"
              className="theme-btn-primary inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="theme-btn-secondary px-4 py-1.5 text-xs font-bold cursor-pointer"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
