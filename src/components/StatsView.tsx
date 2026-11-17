import * as d3 from 'd3';
import {
  Archive,
  BarChart3,
  Calendar,
  Clock,
  Flame,
  Music,
  Pause,
  Play,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ListeningSessionEvent, RecapCapsule, ThemeId, Track } from '../types/music';
import { buildPlayCountStats, formatListeningTime } from '../utils/stats';
import { buildListeningCalendar, type CalendarDayCell } from '../utils/wrappedRecap';

interface StatsViewProps {
  tracks: Track[];
  listeningHistory: ListeningSessionEvent[];
  recapVault: RecapCapsule[];
  currentTrackId: string | null;
  isPlaying: boolean;
  theme: ThemeId;
  onSelectTrack: (track: Track) => void;
  onOpenCapsule: (capsule: RecapCapsule) => void;
  onPreviewMonthlyRecap: () => void;
  onPreviewYearlyWrapped: () => void;
  onGoHome: () => void;
}

function truncateLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1)}…`;
}

export function StatsView({
  tracks,
  listeningHistory,
  recapVault,
  currentTrackId,
  isPlaying,
  theme,
  onSelectTrack,
  onOpenCapsule,
  onPreviewMonthlyRecap,
  onPreviewYearlyWrapped,
  onGoHome,
}: StatsViewProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(760);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedDayCell, setSelectedDayCell] = useState<CalendarDayCell | null>(null);

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.max(320, Math.floor(el.clientWidth));
      if (next > 0) setContainerWidth(next);
    };

    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const summary = useMemo(() => buildPlayCountStats(tracks, 10), [tracks]);
  const ranked = summary.rankedTracks;
  const calendar = useMemo(() => buildListeningCalendar(listeningHistory), [listeningHistory]);

  const isCompact = containerWidth < 540;
  const margin = {
    top: 16,
    right: isCompact ? 52 : 68,
    bottom: 38,
    left: isCompact ? 132 : 204,
  };
  const rowHeight = theme === 'pixel-retro' ? 46 : 42;
  const chartHeight = Math.max(220, ranked.length * rowHeight + margin.top + margin.bottom);
  const innerWidth = Math.max(140, containerWidth - margin.left - margin.right);
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const maxPlays = d3.max(ranked, (d) => d.playCount) ?? 0;

  const xScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, Math.max(1, maxPlays)])
        .range([0, innerWidth])
        .nice(),
    [innerWidth, maxPlays]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(ranked.map((r) => r.id))
        .range([0, innerHeight])
        .padding(0.28),
    [innerHeight, ranked]
  );

  const xTicks = useMemo(() => {
    const raw = xScale.ticks(isCompact ? 4 : 6);
    const ints = raw.filter((v) => Number.isInteger(v));
    return ints.length >= 2 ? ints : [0, Math.max(1, Math.ceil(xScale.domain()[1]))];
  }, [isCompact, xScale]);

  if (tracks.length === 0) {
    return (
      <section aria-label="Listening Stats" className="pointer-events-none px-4 sm:px-6 py-8">
        <div className="theme-panel pointer-events-auto p-8 text-center max-w-lg mx-auto space-y-4">
          <BarChart3
            className="w-10 h-10 mx-auto"
            style={{ color: 'var(--accent-primary)' }}
            aria-hidden="true"
          />
          <h2
            className="font-theme-display text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            No listening data yet
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Add local tracks or start playing music to track your most played songs.
          </p>
          <button
            type="button"
            onClick={onGoHome}
            className="theme-btn-primary px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
          >
            Browse Library
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Listening Stats"
      className="px-4 sm:px-6 py-6 space-y-6 pointer-events-none"
    >
      {/* Top KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-5 gap-3">
        <div className="theme-panel pointer-events-auto p-4 space-y-1">
          <div className="win95-titlebar" aria-hidden="true">
            <span>TOTAL_PLAYS</span>
            <span>_ □ ×</span>
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Total Plays
          </p>
          <p
            className="font-theme-mono text-2xl font-bold tabular-nums"
            style={{ color: 'var(--text-primary)' }}
            data-testid="stats-total-plays"
          >
            {summary.totalPlays}
          </p>
        </div>

        <div className="theme-panel pointer-events-auto p-4 space-y-1">
          <div className="win95-titlebar" aria-hidden="true">
            <span>LISTEN_TIME</span>
            <span>_ □ ×</span>
          </div>
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <span>Time Listening</span>
          </p>
          <p
            className="font-theme-mono text-2xl font-bold tabular-nums"
            style={{ color: 'var(--accent-primary)' }}
            data-testid="stats-listening-time"
          >
            {formatListeningTime(summary.totalListeningSeconds)}
          </p>
          <p className="font-theme-mono text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Live tracked audio
          </p>
        </div>

        <div className="theme-panel pointer-events-auto p-4 space-y-1">
          <div className="win95-titlebar" aria-hidden="true">
            <span>TOP_TRACK</span>
            <span>_ □ ×</span>
          </div>
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Flame className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <span>Most Played</span>
          </p>
          <p
            className="text-sm sm:text-base font-bold truncate"
            style={{ color: 'var(--accent-primary)' }}
          >
            {summary.topTrack ? summary.topTrack.title : 'None yet'}
          </p>
          {summary.topTrack && (
            <p className="font-theme-mono text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {summary.topTrack.playCount} plays · {summary.topTrack.sharePercent}%
            </p>
          )}
        </div>

        <div className="theme-panel pointer-events-auto p-4 space-y-1">
          <div className="win95-titlebar" aria-hidden="true">
            <span>TOP_ARTIST</span>
            <span>_ □ ×</span>
          </div>
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <TrendingUp className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
            <span>Top Artist</span>
          </p>
          <p
            className="text-sm sm:text-base font-bold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {summary.topArtist ? summary.topArtist.name : 'None yet'}
          </p>
          {summary.topArtist && (
            <p className="font-theme-mono text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {summary.topArtist.plays} plays
            </p>
          )}
        </div>

        <div className="theme-panel pointer-events-auto p-4 space-y-1">
          <div className="win95-titlebar" aria-hidden="true">
            <span>AVG_PLAYS</span>
            <span>_ □ ×</span>
          </div>
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Music className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Tracks Played</span>
          </p>
          <p
            className="font-theme-mono text-2xl font-bold tabular-nums"
            style={{ color: 'var(--text-primary)' }}
          >
            {summary.playedTrackCount}/{summary.totalTracks}
          </p>
          <p className="font-theme-mono text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Avg {summary.averagePlays} plays
          </p>
        </div>
      </div>

      {/* Horizontal D3 Bar Chart */}
      <div className="theme-panel pointer-events-auto p-4 sm:p-6 space-y-4">
        <div className="win95-titlebar" aria-hidden="true">
          <span>MOST_PLAYED_CHART.D3</span>
          <span>_ □ ×</span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2
              className="font-theme-display text-base sm:text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Most Played Tracks
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Click any bar to play or pause that track · Ranked by live session play count
            </p>
          </div>
          <span className="font-theme-mono text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Showing top {ranked.length} {ranked.length === 1 ? 'track' : 'tracks'}
          </span>
        </div>

        <div ref={chartContainerRef} className="w-full overflow-x-auto">
          <svg
            data-testid="stats-bar-chart"
            width={containerWidth}
            height={chartHeight}
            role="img"
            aria-label="Horizontal bar chart of most played tracks"
            className="block select-none"
          >
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Vertical X-Axis Gridlines */}
              {xTicks.map((tickVal) => {
                const xPos = xScale(tickVal);
                return (
                  <g key={`grid-${tickVal}`} transform={`translate(${xPos}, 0)`}>
                    <line
                      y1={0}
                      y2={innerHeight}
                      stroke="var(--border-color)"
                      strokeDasharray={theme === 'pixel-retro' ? '2 2' : '4 4'}
                      strokeWidth={1}
                    />
                    <text
                      y={innerHeight + 22}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={theme === 'pixel-retro' ? 9 : 11}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Baseline */}
              <line
                x1={0}
                y1={innerHeight}
                x2={innerWidth}
                y2={innerHeight}
                stroke="var(--border-strong)"
                strokeWidth={1.5}
              />

              {/* X-Axis Caption */}
              <text
                x={innerWidth / 2}
                y={innerHeight + 35}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={theme === 'pixel-retro' ? 8 : 11}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Play Count
              </text>

              {/* Horizontal Bars */}
              {ranked.map((item, idx) => {
                const yPos = yScale(item.id) ?? 0;
                const bandH = yScale.bandwidth();
                const barWidth = Math.max(item.playCount > 0 ? 6 : 2, xScale(item.playCount));
                const isCurrent = item.id === currentTrackId;
                const isHovered = item.id === hoveredId;
                const isTop = idx === 0 && item.playCount > 0;
                const barRadius =
                  theme === 'pixel-retro' || theme === 'terminal' || theme === 'blueprint'
                    ? 0
                    : theme === 'comic-book'
                      ? 5
                      : 6;

                const fillColor =
                  isCurrent || isTop
                    ? 'var(--accent-primary)'
                    : idx % 2 === 1
                      ? 'var(--accent-secondary)'
                      : 'var(--accent-primary)';
                const barOpacity =
                  isCurrent || isHovered || isTop ? 1 : idx === 1 ? 0.85 : 0.72;

                return (
                  <g
                    key={item.id}
                    transform={`translate(0, ${yPos})`}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Play ${item.title} (${item.playCount} plays)`}
                    onClick={() => onSelectTrack(item.track)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTrack(item.track);
                      }
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Subtle full-row hover backdrop */}
                    <rect
                      x={-margin.left + 4}
                      y={-3}
                      width={containerWidth - 8}
                      height={bandH + 6}
                      rx={barRadius}
                      fill={
                        isHovered
                          ? 'var(--table-row-hover)'
                          : isCurrent
                            ? 'var(--table-row-active)'
                            : 'transparent'
                      }
                    />

                    {/* Y-Axis Track Title + Artist */}
                    <text
                      x={-12}
                      y={bandH / 2 - 3}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill={isCurrent ? 'var(--accent-primary)' : 'var(--text-primary)'}
                      fontSize={theme === 'pixel-retro' ? 9 : 12}
                      fontWeight={isCurrent || isTop ? 700 : 600}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {truncateLabel(item.title, isCompact ? 15 : 22)}
                    </text>
                    <text
                      x={-12}
                      y={bandH / 2 + 10}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill="var(--text-muted)"
                      fontSize={theme === 'pixel-retro' ? 7 : 10}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {truncateLabel(item.artist, isCompact ? 15 : 22)}
                    </text>

                    {/* Background rail */}
                    <rect
                      x={0}
                      y={2}
                      width={innerWidth}
                      height={Math.max(12, bandH - 4)}
                      rx={barRadius}
                      fill="var(--track-rail)"
                      fillOpacity={0.38}
                    />

                    {/* Data bar */}
                    <rect
                      data-testid={`stats-bar-${item.id}`}
                      x={0}
                      y={2}
                      width={barWidth}
                      height={Math.max(12, bandH - 4)}
                      rx={barRadius}
                      fill={fillColor}
                      fillOpacity={barOpacity}
                      stroke={theme === 'comic-book' ? '#000000' : 'none'}
                      strokeWidth={theme === 'comic-book' ? 2.5 : 0}
                      style={{
                        transition: 'width 280ms cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 150ms ease',
                        filter:
                          theme === 'cyberpunk-neon' || theme === 'terminal'
                            ? 'drop-shadow(0 0 6px var(--accent-primary))'
                            : undefined,
                      }}
                    />

                    {/* Value Label */}
                    <text
                      x={barWidth + 10}
                      y={bandH / 2 + 1}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fill="var(--text-primary)"
                      fontSize={theme === 'pixel-retro' ? 9 : 12}
                      fontWeight={700}
                      style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {item.playCount}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Ranked Details Footer List */}
        <div className="pt-2 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ranked.slice(0, 6).map((item, idx) => {
            const active = item.id === currentTrackId;
            return (
              <button
                key={`detail-${item.id}`}
                type="button"
                onClick={() => onSelectTrack(item.track)}
                className="flex items-center justify-between gap-2 px-3 py-2 text-left cursor-pointer transition-colors hover:bg-[var(--table-row-hover)]"
                style={{
                  backgroundColor: active ? 'var(--table-row-active)' : 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="font-theme-mono text-xs font-bold w-5 shrink-0"
                    style={{ color: idx === 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold truncate"
                      style={{ color: active ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] truncate tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {item.artist} · {formatListeningTime(item.listeningSeconds)}
                    </p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1 font-theme-mono text-xs font-bold shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {active && isPlaying ? (
                    <Pause className="w-3 h-3 fill-current" aria-hidden="true" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                  )}
                  <span>{item.playCount}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Listening Mood Calendar & Recap Vault */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.95fr] gap-5">
        {/* Interactive Listening Mood Calendar */}
        <div className="theme-panel pointer-events-auto p-4 sm:p-6 space-y-4" data-testid="mood-calendar-panel">
          <div className="win95-titlebar" aria-hidden="true">
            <span>MOOD_CALENDAR.LOG</span>
            <span>_ □ ×</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <div>
                <h2 className="font-theme-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Listening Mood Calendar
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {calendar.monthLabel} · {calendar.activeDaysCount} active days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-theme-mono">
              <span
                className="px-2.5 py-1"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Streak: {calendar.currentStreak}d (Best {calendar.longestStreak}d)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-theme-mono" style={{ color: 'var(--text-muted)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendar.days.map((cell) => {
              const active = cell.inCurrentMonth && cell.playCount > 0;
              const isSelected = selectedDayCell?.dateKey === cell.dateKey;
              const moodColor =
                cell.dominantMood === 'Hype'
                  ? 'var(--accent-secondary)'
                  : cell.dominantMood === 'Chill'
                    ? '#38bdf8'
                    : 'var(--accent-primary)';

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={!cell.inCurrentMonth}
                  onClick={() => setSelectedDayCell(cell)}
                  aria-label={`${cell.dateKey}: ${cell.playCount} plays`}
                  className="px-0.5 py-1.5 min-h-[46px] flex flex-col items-center justify-between text-xs cursor-pointer disabled:opacity-25 disabled:cursor-default transition-colors"
                  style={{
                    backgroundColor: active
                      ? 'color-mix(in srgb, var(--accent-primary) 18%, var(--bg-input))'
                      : 'var(--bg-input)',
                    border: isSelected
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span className="font-theme-mono text-[11px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {cell.dayOfMonth}
                  </span>
                  {active ? (
                    <span
                      className="text-[9px] font-bold leading-tight tracking-tight"
                      style={{ color: moodColor }}
                    >
                      {cell.dominantMood}
                    </span>
                  ) : (
                    <span className="h-3" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedDayCell && selectedDayCell.inCurrentMonth && (
            <div
              className="p-3 text-xs flex flex-wrap items-center justify-between gap-2"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedDayCell.dateKey}
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {selectedDayCell.playCount > 0
                    ? `${selectedDayCell.playCount} plays · ${selectedDayCell.totalMinutes} mins · Mood: ${selectedDayCell.dominantMood}`
                    : 'No listening activity logged on this date.'}
                </p>
              </div>
              {selectedDayCell.topTrackTitle && (
                <span className="font-theme-mono text-[11px]" style={{ color: 'var(--accent-primary)' }}>
                  Top: {selectedDayCell.topTrackTitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Recap Vault & Scheduled 6th / Nov 6 Wrapped Previews */}
        <div className="theme-panel pointer-events-auto p-4 sm:p-6 space-y-4" data-testid="recap-vault-panel">
          <div className="win95-titlebar" aria-hidden="true">
            <span>RECAP_VAULT.ARC</span>
            <span>_ □ ×</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
              <div>
                <h2 className="font-theme-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Recap Vault &amp; Wrapped
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Auto-triggers on the 6th of every month &amp; Grand Annual Wrapped every Nov 6th.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPreviewMonthlyRecap}
              data-testid="preview-monthly-recap"
              className="theme-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <span>Preview Monthly Recap</span>
            </button>

            <button
              type="button"
              onClick={onPreviewYearlyWrapped}
              data-testid="preview-yearly-wrapped"
              className="theme-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Preview Nov 6 Yearly Wrapped</span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {recapVault.length === 0 ? (
              <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>
                Saved Monthly &amp; Annual Wrapped capsules will appear here.
              </p>
            ) : (
              recapVault.map((cap) => (
                <button
                  key={cap.id}
                  type="button"
                  onClick={() => onOpenCapsule(cap)}
                  className="w-full p-3 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-[var(--table-row-hover)]"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {cap.label}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                      Top: {cap.topTracks[0]?.title ?? 'Mixed'} · {cap.totalMinutes} mins · {cap.dominantMood}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 text-[10px] font-theme-mono font-bold uppercase shrink-0"
                    style={{
                      backgroundColor: cap.kind === 'yearly' ? 'var(--accent-primary)' : 'var(--accent-subtle)',
                      color: cap.kind === 'yearly' ? 'var(--text-on-accent)' : 'var(--accent-primary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {cap.kind === 'yearly' ? 'Nov 6 Wrapped' : '6th Capsule'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
