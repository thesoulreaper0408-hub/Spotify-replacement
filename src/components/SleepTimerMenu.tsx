import { Moon, Timer, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SleepTimerMode } from '../types/music';
import { formatCountdown, SLEEP_TIMER_PRESETS } from '../utils/sleepTimer';

interface SleepTimerMenuProps {
  remainingSeconds: number | null;
  sleepMode?: SleepTimerMode | null;
  onStartTimer: (minutes: number) => void;
  onStartAfterTrack?: () => void;
  onCancelTimer: () => void;
  placement?: 'up' | 'down';
  variant?: 'player' | 'header';
}

export function SleepTimerMenu({
  remainingSeconds,
  sleepMode = null,
  onStartTimer,
  onStartAfterTrack,
  onCancelTimer,
  placement = 'up',
  variant = 'player',
}: SleepTimerMenuProps) {
  const [open, setOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('20');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseFloat(customMinutes);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onStartTimer(parsed);
    setOpen(false);
  };

  const activeCountdown = remainingSeconds !== null;
  const activeAfterTrack = sleepMode === 'after-track';
  const active = activeCountdown || activeAfterTrack;
  const IconComp = variant === 'header' ? Moon : Timer;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid={variant === 'header' ? 'header-sleep-timer-button' : 'player-sleep-timer-button'}
        aria-label={
          activeCountdown
            ? `Sleep Timer active: ${formatCountdown(remainingSeconds)} remaining`
            : activeAfterTrack
              ? 'Sleep Timer active: After Current Song'
              : 'Open Sleep Timer'
        }
        title="Sleep Timer"
        className={
          variant === 'header'
            ? 'theme-btn-secondary px-2.5 py-2.5 inline-flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap'
            : 'p-1.5 inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap'
        }
        style={{
          color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
        }}
      >
        <IconComp className="w-4 h-4 shrink-0" aria-hidden="true" />
        {activeCountdown && (
          <span className="font-theme-mono text-xs font-bold whitespace-nowrap tabular-nums">
            {formatCountdown(remainingSeconds)}
          </span>
        )}
        {!activeCountdown && activeAfterTrack && (
          <span className="font-theme-mono text-[11px] font-bold whitespace-nowrap">
            End of track
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Sleep Timer Settings"
          data-testid="sleep-timer-dialog"
          className={`absolute right-0 ${placement === 'down' ? 'top-11' : 'bottom-11'} z-50 w-72 p-3.5 space-y-3`}
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-width) var(--border-style) var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <span
                className="font-theme-display text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-primary)' }}
              >
                Gentle Sleep Timer
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close sleep timer menu"
              className="p-1 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
            {activeCountdown
              ? `Soft audio fade & warm amber night-dim begins in the final 60s (${formatCountdown(remainingSeconds)} left).`
              : activeAfterTrack
                ? 'Playback will gently stop once the current song finishes.'
                : 'Gradually fades volume over the last 60s with a warm amber night dim before pausing:'}
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {SLEEP_TIMER_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => {
                  onStartTimer(preset.minutes);
                  setOpen(false);
                }}
                className="theme-btn-secondary px-2.5 py-2 text-xs font-semibold cursor-pointer text-center whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}

            {onStartAfterTrack && (
              <button
                type="button"
                onClick={() => {
                  onStartAfterTrack();
                  setOpen(false);
                }}
                data-testid="sleep-after-track-btn"
                className="theme-btn-secondary px-2.5 py-2 text-xs font-semibold cursor-pointer text-center whitespace-nowrap"
                style={{
                  color: activeAfterTrack ? 'var(--accent-primary)' : undefined,
                  borderColor: activeAfterTrack ? 'var(--accent-primary)' : undefined,
                }}
              >
                After Current Song
              </button>
            )}
          </div>

          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 pt-1">
            <label htmlFor="sleep-custom-mins" className="sr-only">
              Custom minutes
            </label>
            <input
              id="sleep-custom-mins"
              type="number"
              min="1"
              max="480"
              step="1"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="w-20 px-2.5 py-1.5 text-xs font-theme-mono outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: 'var(--border-width) var(--border-style) var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              min
            </span>
            <button
              type="submit"
              className="theme-btn-primary ml-auto px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              Start
            </button>
          </form>

          {active && (
            <button
              type="button"
              onClick={() => {
                onCancelTimer();
                setOpen(false);
              }}
              className="w-full py-1.5 text-xs font-bold text-red-400 cursor-pointer border-t border-[var(--border-color)] pt-2"
            >
              Cancel Sleep Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

