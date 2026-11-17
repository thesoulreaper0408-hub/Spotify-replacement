import type { EqPreset, MoodTag } from '../types/music';

export const EQ_BAND_FREQUENCIES = [60, 230, 910, 3600, 12000] as const;

export const EQ_BAND_LABELS = ['60 Hz', '230 Hz', '910 Hz', '3.6 kHz', '12 kHz'] as const;

export const EQ_PRESETS: EqPreset[] = [
  {
    id: 'flat',
    name: 'Flat',
    description: 'Neutral studio reference curve with 0 dB across all bands',
    gains: [0, 0, 0, 0, 0],
  },
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    description: 'Deep sub-bass punch and warm low-end presence',
    gains: [7.5, 5.0, 0.5, -1.0, 1.5],
  },
  {
    id: 'vocal-enhance',
    name: 'Vocal Enhance',
    description: 'Crisp midrange clarity that brings lyrics forward',
    gains: [-2.0, -1.0, 4.5, 5.5, 2.0],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Warm upright bass and silky brass upper harmonics',
    gains: [3.5, 2.0, -1.5, 2.5, 4.0],
  },
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'Tight V-curve kick and shimmering synth highs',
    gains: [6.0, 3.0, -2.5, 3.5, 5.5],
  },
  {
    id: 'acoustic',
    name: 'Acoustic',
    description: 'Natural string resonance and airy upper detail',
    gains: [2.5, 1.5, 1.0, 3.5, 3.0],
  },
  {
    id: 'late-night',
    name: 'Late Night',
    description: 'Gentle low-volume warmth with softened harsh peaks',
    gains: [3.0, 2.0, 1.5, -2.5, -4.0],
  },
];

export const SILENCE_THRESHOLD_DB = -50;
// 10^(-50 / 20) ≈ 0.00316228
export const SILENCE_THRESHOLD_AMP = Math.pow(10, SILENCE_THRESHOLD_DB / 20);
export const TARGET_RMS_LEVEL = 0.14;

export interface AudioBufferAnalysis {
  rmsLoudness: number;
  replayGain: number;
  trimStart: number;
  trimEnd: number;
  waveformPeaks: number[];
  bpm: number;
  mood: MoodTag;
}

export function clampEqGainDb(db: number): number {
  if (!Number.isFinite(db)) return 0;
  return Math.max(-12, Math.min(12, Number(db.toFixed(1))));
}

/**
 * Computes average RMS amplitude and recommended ReplayGain compensation multiplier
 * so quiet local files are boosted and overly hot tracks are smoothly leveled.
 */
export function computeReplayGainFromRms(rms: number): number {
  if (!Number.isFinite(rms) || rms <= 0.001) {
    return 1.0;
  }
  const rawGain = TARGET_RMS_LEVEL / rms;
  return Number(Math.max(0.4, Math.min(2.4, rawGain)).toFixed(3));
}

/**
 * Detects leading and trailing silence below -50 dB in mono PCM samples.
 */
export function detectSilenceBounds(
  samples: Float32Array,
  sampleRate: number,
  thresholdAmp = SILENCE_THRESHOLD_AMP
): { trimStart: number; trimEnd: number } {
  if (!samples || samples.length === 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    return { trimStart: 0, trimEnd: 0 };
  }

  const totalDuration = samples.length / sampleRate;
  let firstActive = -1;
  for (let i = 0; i < samples.length; i += 1) {
    if (Math.abs(samples[i]) >= thresholdAmp) {
      firstActive = i;
      break;
    }
  }

  if (firstActive === -1) {
    return { trimStart: 0, trimEnd: Number(totalDuration.toFixed(2)) };
  }

  let lastActive = firstActive;
  for (let i = samples.length - 1; i >= firstActive; i -= 1) {
    if (Math.abs(samples[i]) >= thresholdAmp) {
      lastActive = i;
      break;
    }
  }

  const trimStart = Math.max(0, Number((firstActive / sampleRate).toFixed(2)));
  const trimEnd = Math.min(totalDuration, Number(((lastActive + 1) / sampleRate).toFixed(2)));

  // Leave minimum 0.25s playable window if file is valid
  if (trimEnd <= trimStart + 0.1) {
    return { trimStart: 0, trimEnd: Number(totalDuration.toFixed(2)) };
  }

  return { trimStart, trimEnd };
}

/**
 * Extracts normalized [0.08..1] waveform peaks for crisp timeline scrubbing.
 */
export function extractWaveformPeaks(samples: Float32Array, barCount = 72): number[] {
  const safeCount = Math.max(12, Math.min(160, Math.floor(barCount)));
  if (!samples || samples.length === 0) {
    return Array.from({ length: safeCount }, () => 0.25);
  }

  const step = Math.max(1, Math.floor(samples.length / safeCount));
  const rawPeaks: number[] = [];
  let maxPeak = 0.0001;

  for (let i = 0; i < safeCount; i += 1) {
    const start = i * step;
    const end = Math.min(samples.length, start + step);
    let peak = 0;
    const stride = Math.max(1, Math.floor((end - start) / 48));
    for (let j = start; j < end; j += stride) {
      const amp = Math.abs(samples[j]);
      if (amp > peak) peak = amp;
    }
    rawPeaks.push(peak);
    if (peak > maxPeak) maxPeak = peak;
  }

  return rawPeaks.map((p) => Number(Math.max(0.08, Math.min(1, p / maxPeak)).toFixed(3)));
}

/**
 * Estimates tempo in BPM using energy onset autocorrelation across 20ms frames.
 */
export function estimateBpmFromSamples(samples: Float32Array, sampleRate: number): number {
  if (!samples || samples.length < sampleRate * 2 || sampleRate <= 0) {
    return 112;
  }

  const frameSize = Math.max(256, Math.floor(sampleRate * 0.02));
  const maxFrames = Math.min(1500, Math.floor(samples.length / frameSize));
  if (maxFrames < 40) return 112;

  const energies = new Float32Array(maxFrames);
  for (let f = 0; f < maxFrames; f += 1) {
    let sum = 0;
    const base = f * frameSize;
    for (let j = 0; j < frameSize; j += 4) {
      const v = samples[base + j];
      sum += v * v;
    }
    energies[f] = sum / (frameSize / 4);
  }

  // Onset novelty signal
  const novelty = new Float32Array(maxFrames);
  for (let f = 1; f < maxFrames; f += 1) {
    novelty[f] = Math.max(0, energies[f] - energies[f - 1]);
  }

  // Search 72..170 BPM => period in frames at 50fps
  const fps = sampleRate / frameSize;
  let bestBpm = 112;
  let bestScore = -1;

  for (let bpm = 72; bpm <= 170; bpm += 2) {
    const lag = Math.round((60 / bpm) * fps);
    if (lag <= 1 || lag >= maxFrames) continue;
    let score = 0;
    for (let f = lag; f < maxFrames; f += 1) {
      score += novelty[f] * novelty[f - lag];
    }
    if (score > bestScore) {
      bestScore = score;
      bestBpm = bpm;
    }
  }

  return bestScore > 0 ? bestBpm : 112;
}

export function deriveMoodFromBpm(bpm: number): MoodTag {
  if (bpm >= 122) return 'Hype';
  if (bpm <= 96) return 'Chill';
  return 'Groove';
}

export function analyzeMonoAudioData(
  samples: Float32Array,
  sampleRate: number
): AudioBufferAnalysis {
  if (!samples || samples.length === 0) {
    return {
      rmsLoudness: TARGET_RMS_LEVEL,
      replayGain: 1,
      trimStart: 0,
      trimEnd: 0,
      waveformPeaks: extractWaveformPeaks(new Float32Array(0), 72),
      bpm: 112,
      mood: 'Groove',
    };
  }

  let sqSum = 0;
  const stride = samples.length > 200000 ? 4 : 1;
  let count = 0;
  for (let i = 0; i < samples.length; i += stride) {
    const v = samples[i];
    sqSum += v * v;
    count += 1;
  }

  const rmsLoudness = Number(Math.sqrt(sqSum / Math.max(1, count)).toFixed(4));
  const replayGain = computeReplayGainFromRms(rmsLoudness);
  const { trimStart, trimEnd } = detectSilenceBounds(samples, sampleRate);
  const waveformPeaks = extractWaveformPeaks(samples, 72);
  const bpm = estimateBpmFromSamples(samples, sampleRate);
  const mood = deriveMoodFromBpm(bpm);

  return {
    rmsLoudness,
    replayGain,
    trimStart,
    trimEnd,
    waveformPeaks,
    bpm,
    mood,
  };
}

export const AUTO_MIX_WINDOW_SEC = 8;

export interface AutoMixTransitionState {
  active: boolean;
  progress: number; // 0..1 inside final 8 seconds
  playbackRate: number;
  outgoingGain: number;
  shouldAdvanceNow: boolean;
}

/**
 * Computes real-time BPM beat-matched playbackRate ramp and equal-power crossfade
 * during the final 8 seconds of an outgoing track.
 */
export function computeAutoMixTransition(
  remainingSeconds: number,
  currentBpm = 112,
  nextBpm = 112,
  enabled = true
): AutoMixTransitionState {
  if (!enabled || !Number.isFinite(remainingSeconds) || remainingSeconds > AUTO_MIX_WINDOW_SEC) {
    return {
      active: false,
      progress: 0,
      playbackRate: 1,
      outgoingGain: 1,
      shouldAdvanceNow: false,
    };
  }

  const clampedRemaining = Math.max(0, remainingSeconds);
  const progress = Math.max(
    0,
    Math.min(1, (AUTO_MIX_WINDOW_SEC - clampedRemaining) / AUTO_MIX_WINDOW_SEC)
  );

  const safeCurBpm = currentBpm > 40 ? currentBpm : 112;
  const safeNextBpm = nextBpm > 40 ? nextBpm : safeCurBpm;
  const targetRatio = Math.max(0.85, Math.min(1.18, safeNextBpm / safeCurBpm));
  const playbackRate = Number((1 + (targetRatio - 1) * progress).toFixed(3));

  // Smooth equal-power fade down over the 8s transition (triggers track handoff at <= 0.35s)
  const outgoingGain = Number(Math.cos(progress * Math.PI * 0.45).toFixed(3));

  return {
    active: true,
    progress,
    playbackRate,
    outgoingGain: Math.max(0.12, outgoingGain),
    shouldAdvanceNow: clampedRemaining <= 0.35,
  };
}
