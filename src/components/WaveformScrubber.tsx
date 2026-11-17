import { Download, Repeat, Scissors, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { PinnedMoment, Track } from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { exportTrackClipAsWav } from '../utils/wavExporter';

interface WaveformScrubberProps {
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onAddPinnedMoment: (trackId: string, time: number, label: string) => void;
  highlightsOnly: boolean;
  abLoopActive: boolean;
  abStart: number;
  abEnd: number;
  onSetAbLoopActive: (active: boolean) => void;
  onSetAbRange: (start: number, end: number) => void;
  pinPopoverOpen: boolean;
  onSetPinPopoverOpen: (open: boolean) => void;
  cutterOpen: boolean;
  onSetCutterOpen: (open: boolean) => void;
}

const PIN_LABEL_SUGGESTIONS = ['Beat Drop', 'Guitar Solo', 'Best Verse', 'Hook'];

export function WaveformScrubber({
  currentTrack,
  currentTime,
  duration,
  onSeek,
  onAddPinnedMoment,
  highlightsOnly,
  abLoopActive,
  abStart,
  abEnd,
  onSetAbLoopActive,
  onSetAbRange,
  pinPopoverOpen,
  onSetPinPopoverOpen,
  cutterOpen,
  onSetCutterOpen,
}: WaveformScrubberProps) {
  const [pinLabel, setPinLabel] = useState('Beat Drop');
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeOut, setFadeOut] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const safeDuration = duration > 0 ? duration : currentTrack?.duration ?? 0;
  const clampedTime = Math.min(currentTime, safeDuration || 0);
  const progressPercent = safeDuration > 0 ? (clampedTime / safeDuration) * 100 : 0;

  const peaks = useMemo(() => {
    if (currentTrack?.waveformPeaks && currentTrack.waveformPeaks.length > 0) {
      return currentTrack.waveformPeaks;
    }
    const seed = currentTrack?.coverSeed ?? 19;
    return Array.from({ length: 64 }, (_, i) => {
      const wave = Math.abs(Math.sin((i + seed) * 0.42) * 0.55 + Math.cos(i * 0.85) * 0.3);
      return Math.max(0.14, Math.min(0.96, wave));
    });
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack || safeDuration <= 0) return;
    if (abEnd <= abStart || abEnd > safeDuration) {
      onSetAbRange(0, Number(Math.min(safeDuration, Math.max(4, safeDuration * 0.45)).toFixed(1)));
    }
  }, [currentTrack?.id, safeDuration, abStart, abEnd, onSetAbRange, currentTrack]);

  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentTrack) return;
    const trimmed = pinLabel.trim() || 'Pinned Moment';
    onAddPinnedMoment(currentTrack.id, clampedTime, trimmed);
    onSetPinPopoverOpen(false);
  };

  const handleDownloadWav = async () => {
    if (!currentTrack || safeDuration <= 0) return;
    const start = Math.max(0, Math.min(abStart, abEnd - 0.3));
    const end = Math.min(safeDuration, Math.max(start + 0.5, abEnd));
    setExporting(true);
    setExportStatus(null);
    try {
      const blob = await exportTrackClipAsWav(currentTrack.src, start, end, {
        fadeInSec: fadeIn ? 1 : 0,
        fadeOutSec: fadeOut ? 1 : 0,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const safeTitle = currentTrack.title.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();
      anchor.href = url;
      anchor.download = `${safeTitle}_clip_${Math.round(start)}s-${Math.round(end)}s.wav`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      setExportStatus(`Saved ${Math.round(end - start)}s .wav clip`);
    } catch {
      setExportStatus('Unable to slice audio clip');
    } finally {
      setExporting(false);
    }
  };

  const pins: PinnedMoment[] = currentTrack?.pinnedMoments ?? [];
  const abLeftPct = safeDuration > 0 ? Math.max(0, Math.min(100, (abStart / safeDuration) * 100)) : 0;
  const abRightPct = safeDuration > 0 ? Math.max(0, Math.min(100, (abEnd / safeDuration) * 100)) : 100;

  return (
    <div className="w-full relative">
      {/* Clean Single-Line Interactive Waveform + Seek Row */}
      <div className="w-full flex items-center gap-2 sm:gap-2.5">
        <span
          className="font-theme-mono text-[11px] w-10 text-right shrink-0 tabular-nums"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatDuration(clampedTime)}
        </span>

        {/* Waveform Scrubber + Pinned Moments Overlay */}
        <div className="relative flex-1 h-6 flex items-center group">
          {(cutterOpen || abLoopActive) && safeDuration > 0 && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: `${abLeftPct}%`,
                width: `${Math.max(2, abRightPct - abLeftPct)}%`,
                backgroundColor: 'var(--accent-subtle)',
                borderLeft: '2px solid var(--accent-secondary)',
                borderRight: '2px solid var(--accent-secondary)',
              }}
            />
          )}

          <div className="w-full h-4 flex items-center gap-[2px] px-0.5 pointer-events-none">
            {peaks.map((peak, i) => {
              const barPct = ((i + 0.5) / peaks.length) * 100;
              const passed = barPct <= progressPercent;
              return (
                <span
                  key={i}
                  className="flex-1 rounded-full transition-colors duration-100"
                  style={{
                    height: `${Math.round(peak * 100)}%`,
                    minHeight: '3px',
                    backgroundColor: passed ? 'var(--accent-primary)' : 'var(--track-rail)',
                    opacity: passed ? 0.95 : 0.6,
                  }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={safeDuration || 100}
            step={0.1}
            value={clampedTime}
            disabled={!currentTrack}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek track position"
            className="player-range-input z-10"
          />

          {/* Glowing Pinned Moment Markers on the Waveform Rail */}
          {safeDuration > 0 &&
            pins.map((pin) => {
              const pinPct = Math.max(1, Math.min(99, (pin.time / safeDuration) * 100));
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => onSeek(pin.time)}
                  title={`${pin.label} (${formatDuration(pin.time)}) — click to jump`}
                  aria-label={`Jump to pinned moment ${pin.label} at ${formatDuration(pin.time)}`}
                  data-testid={`pinned-marker-${pin.id}`}
                  className="absolute -top-0.5 z-20 -translate-x-1/2 w-2.5 h-2.5 cursor-pointer transition-transform hover:scale-125"
                  style={{
                    left: `${pinPct}%`,
                    backgroundColor: highlightsOnly
                      ? 'var(--accent-secondary)'
                      : 'var(--accent-primary)',
                    border: '1.5px solid var(--text-primary)',
                    borderRadius: '9999px',
                    boxShadow: '0 0 8px var(--accent-primary)',
                  }}
                />
              );
            })}
        </div>

        <span
          className="font-theme-mono text-[11px] w-10 shrink-0 tabular-nums"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatDuration(safeDuration)}
        </span>
      </div>

      {/* Pin Moment Popover */}
      {pinPopoverOpen && currentTrack && (
        <div
          role="dialog"
          aria-label="Pin Moment"
          data-testid="pin-moment-popover"
          className="absolute left-1/2 -translate-x-1/2 bottom-10 z-50 w-72 p-3 space-y-2.5"
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-width) var(--border-style) var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Pin Moment at {formatDuration(clampedTime)}
            </span>
            <button
              type="button"
              onClick={() => onSetPinPopoverOpen(false)}
              aria-label="Close pin menu"
              className="p-0.5 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {PIN_LABEL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPinLabel(s)}
                className="px-2 py-0.5 text-[11px] font-medium cursor-pointer"
                style={{
                  backgroundColor: pinLabel === s ? 'var(--accent-subtle)' : 'var(--bg-input)',
                  color: pinLabel === s ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handlePinSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={pinLabel}
              onChange={(e) => setPinLabel(e.target.value)}
              placeholder="Moment label..."
              aria-label="Pinned moment label"
              className="flex-1 min-w-0 px-2.5 py-1 text-xs outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <button
              type="submit"
              className="theme-btn-primary px-3 py-1 text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              Drop Pin
            </button>
          </form>
        </div>
      )}

      {/* Ringtone & Audio Snippet Cutter (.wav Export) Panel */}
      {cutterOpen && currentTrack && (
        <div
          role="dialog"
          aria-label="Ringtone and Audio Snippet Cutter"
          data-testid="clip-cutter-panel"
          className="absolute left-1/2 -translate-x-1/2 bottom-10 z-50 w-[330px] sm:w-[400px] p-3.5 space-y-3"
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-width) var(--border-style) var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <span className="font-theme-display text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                A-B Snippet &amp; Ringtone Cutter (.wav)
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSetCutterOpen(false)}
              aria-label="Close clip cutter"
              className="p-0.5 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="ab-start-range" className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Pin A (Start)
                </label>
                <span className="font-theme-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                  {formatDuration(abStart)}
                </span>
              </div>
              <input
                id="ab-start-range"
                type="range"
                min={0}
                max={Math.max(0.5, safeDuration - 0.5)}
                step={0.2}
                value={abStart}
                onChange={(e) => {
                  const nextA = Number(e.target.value);
                  onSetAbRange(nextA, Math.max(nextA + 0.5, abEnd));
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="ab-end-range" className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Pin B (End)
                </label>
                <span className="font-theme-mono tabular-nums" style={{ color: 'var(--accent-secondary)' }}>
                  {formatDuration(abEnd)}
                </span>
              </div>
              <input
                id="ab-end-range"
                type="range"
                min={Math.min(safeDuration, abStart + 0.5)}
                max={Math.max(1, safeDuration)}
                step={0.2}
                value={abEnd}
                onChange={(e) => {
                  const nextB = Number(e.target.value);
                  onSetAbRange(Math.min(abStart, nextB - 0.5), nextB);
                }}
                className="w-full accent-[var(--accent-secondary)] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSetAbLoopActive(!abLoopActive)}
              aria-pressed={abLoopActive}
              className="px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              style={{
                backgroundColor: abLoopActive ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: abLoopActive ? 'var(--text-on-accent)' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Repeat className="w-3 h-3" aria-hidden="true" />
              <span>{abLoopActive ? 'Looping A–B' : 'Audition Loop'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFadeIn((v) => !v)}
              aria-pressed={fadeIn}
              className="px-2 py-1 text-[11px] font-medium cursor-pointer"
              style={{
                backgroundColor: fadeIn ? 'var(--accent-subtle)' : 'var(--bg-input)',
                color: fadeIn ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              1s Fade-In
            </button>

            <button
              type="button"
              onClick={() => setFadeOut((v) => !v)}
              aria-pressed={fadeOut}
              className="px-2 py-1 text-[11px] font-medium cursor-pointer"
              style={{
                backgroundColor: fadeOut ? 'var(--accent-subtle)' : 'var(--bg-input)',
                color: fadeOut ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              1s Fade-Out
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)]">
            <span className="font-theme-mono text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {exportStatus ?? `Clip: ${(abEnd - abStart).toFixed(1)}s`}
            </span>
            <button
              type="button"
              disabled={exporting}
              onClick={handleDownloadWav}
              data-testid="download-wav-clip"
              className="theme-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{exporting ? 'Slicing...' : 'Download Clip (.wav)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
