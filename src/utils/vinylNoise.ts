export interface VinylNoiseGainInput {
  isPlaying: boolean;
  enabled: boolean;
  volume: number;
  muted: boolean;
  sleepFadeFactor?: number;
}

export const BASE_VINYL_NOISE_GAIN = 0.048;

/**
 * Computes the target GainNode value for subtle vinyl surface noise & dust crackle,
 * smoothly coupled to playback state, user volume, mute, and sleep fade.
 */
export function computeVinylNoiseGain({
  isPlaying,
  enabled,
  volume,
  muted,
  sleepFadeFactor = 1,
}: VinylNoiseGainInput): number {
  if (!isPlaying || !enabled || muted) return 0;
  const safeVol = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
  const safeFade = Number.isFinite(sleepFadeFactor)
    ? Math.max(0, Math.min(1, sleepFadeFactor))
    : 1;
  const level = BASE_VINYL_NOISE_GAIN * safeVol * safeFade;
  return Number(level.toFixed(5));
}

function createMulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Synthesizes a seamless looping mono buffer of warm analog vinyl groove hiss
 * plus sporadic exponential-decay dust pops and micro-crackle.
 */
export function synthesizeVinylCrackleSamples(
  sampleRate: number,
  durationSeconds = 4,
  seed = 1977
): Float32Array {
  const safeRate = Number.isFinite(sampleRate) && sampleRate >= 8000 ? Math.round(sampleRate) : 44100;
  const length = Math.max(1024, Math.round(safeRate * durationSeconds));
  const out = new Float32Array(length);
  const rand = createMulberry32(seed);

  // 1. Warm pink/brown-weighted vinyl groove floor + subtle 33.3 RPM (0.555 Hz) platter wow
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  const wowFreq = 0.555;
  for (let i = 0; i < length; i += 1) {
    const white = rand() * 2 - 1;
    b0 = 0.996 * b0 + white * 0.055;
    b1 = 0.975 * b1 + white * 0.085;
    b2 = 0.88 * b2 + white * 0.065;
    const wow = 0.82 + 0.18 * Math.sin((2 * Math.PI * wowFreq * i) / safeRate);
    out[i] = (b0 * 0.72 + b1 * 0.45 + b2 * 0.25) * 0.24 * wow;
  }

  // 2. Sporadic vinyl dust ticks & warm crackles
  const totalCrackles = Math.max(24, Math.round(durationSeconds * 24));
  for (let c = 0; c < totalCrackles; c += 1) {
    const startIdx = Math.floor(rand() * (length - 128));
    const isWarmPop = rand() < 0.22;
    const amp = isWarmPop ? 0.34 + rand() * 0.36 : 0.14 + rand() * 0.2;
    const polarity = rand() < 0.5 ? 1 : -1;
    const decaySamples = isWarmPop
      ? Math.round(safeRate * (0.0022 + rand() * 0.0025))
      : Math.round(safeRate * (0.0005 + rand() * 0.001));

    for (let k = 0; k < decaySamples && startIdx + k < length; k += 1) {
      const env = Math.exp((-k * 5.2) / Math.max(1, decaySamples));
      const ring = isWarmPop ? Math.cos((k / safeRate) * 2 * Math.PI * 1600) : 1 - (k / decaySamples) * 0.6;
      out[startIdx + k] += polarity * amp * env * ring;
    }
  }

  // 3. Crossfade loop edges slightly (12ms) to guarantee seamless looping
  const fadeSamples = Math.min(Math.floor(length / 8), Math.round(safeRate * 0.012));
  for (let i = 0; i < fadeSamples; i += 1) {
    const t = i / fadeSamples;
    const endIdx = length - fadeSamples + i;
    const blended = out[i] * t + out[endIdx] * (1 - t);
    out[i] = blended;
    out[endIdx] = out[endIdx] * t + out[i] * (1 - t);
  }

  // 4. Soft clamp
  for (let i = 0; i < length; i += 1) {
    if (out[i] > 0.85) out[i] = 0.85;
    if (out[i] < -0.85) out[i] = -0.85;
  }

  return out;
}

export interface VinylNoiseController {
  gainNode: GainNode;
  source: AudioBufferSourceNode;
  setTargetGain: (gain: number) => void;
  dispose: () => void;
}

/**
 * Creates a continuous Web Audio vinyl surface noise + dust crackle loop
 * connected through a warm low-pass analog filter directly to ctx.destination.
 */
export function createVinylCrackleController(ctx: AudioContext): VinylNoiseController {
  const durationSeconds = 4;
  const samples = synthesizeVinylCrackleSamples(ctx.sampleRate, durationSeconds);
  const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
  buffer.getChannelData(0).set(samples);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 180;
  highpass.Q.value = 0.6;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 2850;
  lowpass.Q.value = 0.7;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  source.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start(0);

  return {
    gainNode,
    source,
    setTargetGain: (targetGain: number) => {
      const clamped = Number.isFinite(targetGain) ? Math.max(0, Math.min(0.25, targetGain)) : 0;
      const tau = clamped > 0 ? 0.14 : 0.22;
      try {
        gainNode.gain.setTargetAtTime(clamped, ctx.currentTime, tau);
      } catch {
        gainNode.gain.value = clamped;
      }
    },
    dispose: () => {
      try {
        source.stop();
      } catch {
        // Ignore already-stopped source errors
      }
      try {
        source.disconnect();
        highpass.disconnect();
        lowpass.disconnect();
        gainNode.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    },
  };
}
