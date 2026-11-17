export const TURNTABLE_SPIN_UP_MS = 750;
export const TURNTABLE_COAST_DOWN_MS = 950;
export const TURNTABLE_FULL_RPM_DEG_PER_SEC = 360 / 2.4;

export type TurntableMotorPhase = 'spin-up' | 'coast-down';

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/**
 * Physical turntable motor torque curve (ease-in):
 * Starts from zero angular acceleration slope at t=0 and smoothly ramps
 * velocity up to full steady 33 1/3 RPM platter speed at t=1.
 */
export function easeInMotorTorque(progress: number): number {
  const t = clamp01(progress);
  return t * t * (0.4 + 0.6 * t);
}

/**
 * Physical platter bearing friction curve (ease-out):
 * Decelerates rapidly at first from momentum and settles softly
 * into a standstill at t=1 without snapping.
 */
export function easeOutPlatterFriction(progress: number): number {
  const t = clamp01(progress);
  const remaining = 1 - t;
  return remaining * remaining;
}

export interface TurntableRateStep {
  rate: number;
  done: boolean;
}

/**
 * Computes the instantaneous playbackRate multiplier [0..1] for a turntable disc
 * during start (spin-up) or pause (coast-down) transitions.
 */
export function computeTurntablePlaybackRate(
  phase: TurntableMotorPhase,
  elapsedMs: number,
  startRate: number,
  targetRate: number,
  durationMs: number
): TurntableRateStep {
  const safeStart = clamp01(startRate);
  const safeTarget = clamp01(targetRate);
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return { rate: safeTarget, done: true };
  }

  const progress = clamp01(elapsedMs / durationMs);
  const done = progress >= 1;

  if (phase === 'spin-up') {
    const eased = easeInMotorTorque(progress);
    const rate = clamp01(safeStart + (safeTarget - safeStart) * eased);
    return { rate: done ? safeTarget : rate, done };
  }

  // coast-down blends smoothly from current startRate toward targetRate (typically 0)
  const decay = easeOutPlatterFriction(progress);
  const rate = clamp01(safeTarget + (safeStart - safeTarget) * decay);
  return { rate: done ? safeTarget : rate, done };
}

/**
 * Advances platter angle cleanly in degrees [0, 360) for a frame delta.
 */
export function advanceTurntableAngle(
  currentAngleDeg: number,
  playbackRate: number,
  deltaMs: number
): number {
  if (
    !Number.isFinite(currentAngleDeg) ||
    !Number.isFinite(playbackRate) ||
    !Number.isFinite(deltaMs)
  ) {
    return 0;
  }
  const safeRate = clamp01(playbackRate);
  const safeDeltaSec = Math.max(0, Math.min(0.1, deltaMs / 1000));
  const next = currentAngleDeg + TURNTABLE_FULL_RPM_DEG_PER_SEC * safeRate * safeDeltaSec;
  return ((next % 360) + 360) % 360;
}
