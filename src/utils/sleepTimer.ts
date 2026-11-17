export interface SleepTimerOption {
  label: string;
  minutes: number;
}

export const SLEEP_TIMER_PRESETS: SleepTimerOption[] = [
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '60 minutes', minutes: 60 },
];

export const SLEEP_FADE_WINDOW_SEC = 60;

/**
 * Converts a minute count into whole seconds, clamping invalid values to 0.
 */
export function minutesToSeconds(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 0;
  }
  return Math.round(minutes * 60);
}

/**
 * Formats remaining countdown seconds as MM:SS or H:MM:SS.
 */
export function formatCountdown(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const mins = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Advances remaining seconds by one tick and indicates whether the timer expired.
 */
export function tickCountdown(remainingSeconds: number | null): {
  nextRemaining: number | null;
  expired: boolean;
} {
  if (remainingSeconds === null) {
    return { nextRemaining: null, expired: false };
  }
  if (remainingSeconds <= 1) {
    return { nextRemaining: null, expired: true };
  }
  return { nextRemaining: remainingSeconds - 1, expired: false };
}

/**
 * Returns [0..1] master volume multiplier: stays 1.0 above 60s and smoothly
 * ramps down to 0 during the final 60 seconds.
 */
export function getSleepFadeFactor(remainingSeconds: number | null): number {
  if (remainingSeconds === null || !Number.isFinite(remainingSeconds)) {
    return 1;
  }
  if (remainingSeconds >= SLEEP_FADE_WINDOW_SEC) {
    return 1;
  }
  if (remainingSeconds <= 0) {
    return 0;
  }
  return Number((remainingSeconds / SLEEP_FADE_WINDOW_SEC).toFixed(3));
}

/**
 * Returns [0..0.46] warm amber night-dimming overlay opacity during the final 60s.
 */
export function getNightDimOpacity(remainingSeconds: number | null): number {
  const fadeFactor = getSleepFadeFactor(remainingSeconds);
  return Number(((1 - fadeFactor) * 0.46).toFixed(3));
}
