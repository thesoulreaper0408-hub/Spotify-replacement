import type { SceneryDensity, ThemeId } from '../types/music';

export type ParallaxDepth = 'far' | 'mid' | 'near';

export type AudioFrequencyBand = 'subBass' | 'bass' | 'mid' | 'high';
export type AudioMotionStyle = 'bounce' | 'kick-tilt' | 'pulsate' | 'shimmer';

export interface PropAudioMapping {
  band: AudioFrequencyBand;
  motion: AudioMotionStyle;
  sensitivity: number;
}

export interface FrequencyBandEnergies {
  subBass: number;
  bass: number;
  mid: number;
  high: number;
}

export interface PropAudioTransformVars {
  scale: number;
  scaleX: number;
  scaleY: number;
  bounceY: number;
  tiltDeg: number;
  glowPx: number;
  brightness: number;
}

export interface SceneryPropConfig {
  id: string;
  kind: string;
  depth: ParallaxDepth;
  xPercent: number;
  yPercent: number;
  scale: number;
  driftVariant: 'float' | 'drift' | 'spin' | 'sway' | 'orbit' | 'glide';
  durationSec: number;
  delaySec: number;
  bassReactive: boolean;
  minDensity: 'cozy' | 'packed';
  label?: string;
}

export const ZERO_BAND_ENERGIES: FrequencyBandEnergies = {
  subBass: 0,
  bass: 0,
  mid: 0,
  high: 0,
};

const PROP_AUDIO_MAPPINGS: Record<string, PropAudioMapping> = {
  // Sub-bass heavy bounce (physical Y kick + squash & stretch)
  'vinyl-record': { band: 'subBass', motion: 'bounce', sensitivity: 1.25 },
  'soundwave-ring': { band: 'subBass', motion: 'pulsate', sensitivity: 1.35 },
  'bokeh-orb': { band: 'subBass', motion: 'pulsate', sensitivity: 1.2 },
  'mystery-block': { band: 'subBass', motion: 'bounce', sensitivity: 1.3 },
  'comic-boombox': { band: 'subBass', motion: 'bounce', sensitivity: 1.35 },
  'comic-bubble': { band: 'subBass', motion: 'bounce', sensitivity: 1.25 },
  'vapor-sun': { band: 'subBass', motion: 'pulsate', sensitivity: 1.25 },
  'clay-sphere': { band: 'subBass', motion: 'bounce', sensitivity: 1.25 },
  'clay-blob-shape': { band: 'subBass', motion: 'pulsate', sensitivity: 1.2 },
  'terminal-radar': { band: 'subBass', motion: 'pulsate', sensitivity: 1.3 },
  'glass-orb': { band: 'subBass', motion: 'bounce', sensitivity: 1.2 },
  'cyber-skull': { band: 'subBass', motion: 'bounce', sensitivity: 1.3 },
  'coffee-mug': { band: 'subBass', motion: 'bounce', sensitivity: 1.2 },

  // Bass punch & rhythmic kick-tilt
  'studio-headphones': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.25 },
  'space-invader': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.25 },
  'pixel-mushroom': { band: 'bass', motion: 'bounce', sensitivity: 1.25 },
  'hover-car': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.2 },
  'clownfish': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.2 },
  'angelfish': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.15 },
  'marble-bust': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.15 },
  'pink-flamingo': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.2 },
  'vhs-tape': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.2 },
  'wireframe-cube': { band: 'bass', motion: 'bounce', sensitivity: 1.25 },
  'wireframe-pyramid': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.2 },
  'clay-cube': { band: 'bass', motion: 'bounce', sensitivity: 1.25 },
  'clay-torus': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.25 },
  'comic-skateboard': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.25 },
  'ascii-floppy': { band: 'bass', motion: 'kick-tilt', sensitivity: 1.2 },

  // Mid-range melodic pulsate
  'treble-clef': { band: 'mid', motion: 'pulsate', sensitivity: 1.3 },
  'eighth-note': { band: 'mid', motion: 'pulsate', sensitivity: 1.25 },
  'pixel-ghost': { band: 'mid', motion: 'pulsate', sensitivity: 1.2 },
  'comic-lightning': { band: 'mid', motion: 'pulsate', sensitivity: 1.35 },
  'holo-triangle': { band: 'mid', motion: 'pulsate', sensitivity: 1.3 },
  'cyber-visor': { band: 'mid', motion: 'pulsate', sensitivity: 1.25 },
  'sketch-cassette': { band: 'mid', motion: 'pulsate', sensitivity: 1.25 },
  'aero-leaf': { band: 'mid', motion: 'pulsate', sensitivity: 1.2 },
  'vapor-dolphin': { band: 'mid', motion: 'pulsate', sensitivity: 1.25 },
  'wireframe-sphere': { band: 'mid', motion: 'pulsate', sensitivity: 1.25 },
  'ascii-skull': { band: 'mid', motion: 'pulsate', sensitivity: 1.25 },
  'network-graph': { band: 'mid', motion: 'pulsate', sensitivity: 1.2 },
  'crumpled-paper': { band: 'mid', motion: 'pulsate', sensitivity: 1.15 },
  'water-ripple': { band: 'mid', motion: 'pulsate', sensitivity: 1.25 },

  // High-frequency shimmer & bright accents
  'pixel-coin': { band: 'high', motion: 'shimmer', sensitivity: 1.35 },
  'pixel-heart': { band: 'high', motion: 'shimmer', sensitivity: 1.35 },
  'pixel-rocket': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'pixel-potion': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'comic-star': { band: 'high', motion: 'shimmer', sensitivity: 1.35 },
  'katakana-sign': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'paper-airplane': { band: 'high', motion: 'shimmer', sensitivity: 1.25 },
  'doodle-star': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'doodle-heart': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'soap-bubble': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'water-droplet': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'cad-callout': { band: 'high', motion: 'shimmer', sensitivity: 1.25 },
  'clay-star': { band: 'high', motion: 'shimmer', sensitivity: 1.3 },
  'binary-burst': { band: 'high', motion: 'shimmer', sensitivity: 1.35 },
  'ascii-key': { band: 'high', motion: 'shimmer', sensitivity: 1.25 },
};

const DEFAULT_PROP_AUDIO_MAPPING: PropAudioMapping = {
  band: 'bass',
  motion: 'pulsate',
  sensitivity: 1.15,
};

export function getPropAudioMapping(kind: string): PropAudioMapping {
  return PROP_AUDIO_MAPPINGS[kind] ?? DEFAULT_PROP_AUDIO_MAPPING;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function sampleBandRange(
  bins: Uint8Array,
  startRatio: number,
  endRatio: number
): number {
  const len = bins.length;
  if (len === 0) return 0;
  const start = Math.max(0, Math.min(len - 1, Math.floor(startRatio * len)));
  const end = Math.max(start + 1, Math.min(len, Math.ceil(endRatio * len)));

  let sum = 0;
  let peak = 0;
  let count = 0;
  for (let i = start; i < end; i += 1) {
    const norm = bins[i] / 255;
    sum += norm;
    if (norm > peak) peak = norm;
    count += 1;
  }

  if (count === 0) return 0;
  const avg = sum / count;
  return clamp01(avg * 0.62 + peak * 0.38);
}

/**
 * Extracts normalized [0..1] energy across 4 musical frequency bands
 * from a Web Audio AnalyserNode frequency buffer (works with any fftSize).
 */
export function computeBandEnergies(bins: Uint8Array): FrequencyBandEnergies {
  if (!bins || bins.length === 0) {
    return ZERO_BAND_ENERGIES;
  }
  return {
    subBass: sampleBandRange(bins, 0, 2 / 64),
    bass: sampleBandRange(bins, 1 / 64, 6 / 64),
    mid: sampleBandRange(bins, 6 / 64, 15 / 64),
    high: sampleBandRange(bins, 15 / 64, 34 / 64),
  };
}

function smoothScalar(prev: number, next: number): number {
  const factor = next >= prev ? 0.58 : 0.2;
  return clamp01(prev + (next - prev) * factor);
}

/**
 * Applies fast attack + smooth exponential release per frequency band
 * so bass hits punch upward quickly and settle gracefully.
 */
export function smoothBandEnergies(
  prev: FrequencyBandEnergies,
  next: FrequencyBandEnergies
): FrequencyBandEnergies {
  return {
    subBass: smoothScalar(prev.subBass, next.subBass),
    bass: smoothScalar(prev.bass, next.bass),
    mid: smoothScalar(prev.mid, next.mid),
    high: smoothScalar(prev.high, next.high),
  };
}

/**
 * Maps a prop's assigned frequency band + motion style to concrete CSS transform variables.
 */
export function computePropAudioTransformVars(
  mapping: PropAudioMapping,
  energies: FrequencyBandEnergies,
  reactive: boolean
): PropAudioTransformVars {
  if (!reactive) {
    return {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      bounceY: 0,
      tiltDeg: 0,
      glowPx: 0,
      brightness: 1,
    };
  }

  const raw = clamp01(energies[mapping.band] * mapping.sensitivity);
  const punch = raw === 0 ? 0 : Math.pow(raw, 0.85);
  const lift = (px: number) => (punch === 0 ? 0 : -punch * px);

  switch (mapping.motion) {
    case 'bounce':
      return {
        scale: 1 + punch * 0.26,
        scaleX: 1 + punch * 0.22,
        scaleY: 1 + punch * 0.3,
        bounceY: lift(18),
        tiltDeg: 0,
        glowPx: punch * 14,
        brightness: 1 + punch * 0.24,
      };
    case 'kick-tilt':
      return {
        scale: 1 + punch * 0.18,
        scaleX: 1 + punch * 0.16,
        scaleY: 1 + punch * 0.2,
        bounceY: lift(13),
        tiltDeg: punch * 7,
        glowPx: punch * 11,
        brightness: 1 + punch * 0.2,
      };
    case 'pulsate':
      return {
        scale: 1 + punch * 0.28,
        scaleX: 1 + punch * 0.28,
        scaleY: 1 + punch * 0.28,
        bounceY: lift(4),
        tiltDeg: 0,
        glowPx: punch * 16,
        brightness: 1 + punch * 0.3,
      };
    case 'shimmer':
      return {
        scale: 1 + punch * 0.2,
        scaleX: 1 + punch * 0.2,
        scaleY: 1 + punch * 0.2,
        bounceY: lift(6),
        tiltDeg: punch === 0 ? 0 : -punch * 5,
        glowPx: punch * 14,
        brightness: 1 + punch * 0.35,
      };
  }
}

export const SCENERY_DENSITY_OPTIONS: Array<{
  id: SceneryDensity;
  label: string;
  description: string;
}> = [
  { id: 'off', label: 'Off', description: 'Clean background without floating scenery' },
  { id: 'cozy', label: 'Cozy', description: 'Balanced signature props and gentle depth' },
  { id: 'packed', label: 'Packed', description: 'Full layered world with maximum interactive props' },
];

export const THEME_SCENERY_PROPS: Record<ThemeId, SceneryPropConfig[]> = {
  'classic-dark': [
    { id: 'cd-spotlight-1', kind: 'spotlight-beam', depth: 'far', xPercent: 18, yPercent: 0, scale: 1.2, driftVariant: 'sway', durationSec: 16, delaySec: 0, bassReactive: false, minDensity: 'cozy' },
    { id: 'cd-bokeh-1', kind: 'bokeh-orb', depth: 'far', xPercent: 78, yPercent: 22, scale: 1.35, driftVariant: 'float', durationSec: 12, delaySec: 1, bassReactive: true, minDensity: 'cozy' },
    { id: 'cd-vinyl-1', kind: 'vinyl-record', depth: 'mid', xPercent: 86, yPercent: 62, scale: 1.05, driftVariant: 'spin', durationSec: 14, delaySec: 0.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'cd-soundwave-1', kind: 'soundwave-ring', depth: 'mid', xPercent: 14, yPercent: 72, scale: 1.0, driftVariant: 'float', durationSec: 9, delaySec: 1.2, bassReactive: true, minDensity: 'cozy' },
    { id: 'cd-clef-1', kind: 'treble-clef', depth: 'near', xPercent: 92, yPercent: 16, scale: 1.0, driftVariant: 'float', durationSec: 7, delaySec: 0.4, bassReactive: true, minDensity: 'cozy' },
    { id: 'cd-headphones-1', kind: 'studio-headphones', depth: 'mid', xPercent: 52, yPercent: 84, scale: 1.0, driftVariant: 'sway', durationSec: 11, delaySec: 2, bassReactive: true, minDensity: 'cozy' },
    { id: 'cd-note-1', kind: 'eighth-note', depth: 'near', xPercent: 83, yPercent: 24, scale: 0.95, driftVariant: 'drift', durationSec: 8, delaySec: 0.8, bassReactive: true, minDensity: 'packed' },
    { id: 'cd-vinyl-2', kind: 'vinyl-record', depth: 'far', xPercent: 34, yPercent: 14, scale: 0.78, driftVariant: 'spin', durationSec: 18, delaySec: 2.5, bassReactive: false, minDensity: 'packed' },
    { id: 'cd-bokeh-2', kind: 'bokeh-orb', depth: 'far', xPercent: 66, yPercent: 80, scale: 1.15, driftVariant: 'float', durationSec: 14, delaySec: 3, bassReactive: true, minDensity: 'packed' },
    { id: 'cd-soundwave-2', kind: 'soundwave-ring', depth: 'near', xPercent: 95, yPercent: 86, scale: 0.85, driftVariant: 'float', durationSec: 8, delaySec: 1.8, bassReactive: true, minDensity: 'packed' },
    { id: 'cd-spotlight-2', kind: 'spotlight-beam', depth: 'far', xPercent: 74, yPercent: 0, scale: 1.1, driftVariant: 'sway', durationSec: 19, delaySec: 3.5, bassReactive: false, minDensity: 'packed' },
  ],
  'pixel-retro': [
    { id: 'px-cloud-1', kind: 'pixel-cloud', depth: 'far', xPercent: 16, yPercent: 14, scale: 1.2, driftVariant: 'drift', durationSec: 22, delaySec: 0, bassReactive: false, minDensity: 'cozy' },
    { id: 'px-invader-1', kind: 'space-invader', depth: 'mid', xPercent: 84, yPercent: 22, scale: 1.05, driftVariant: 'float', durationSec: 8, delaySec: 0.4, bassReactive: true, minDensity: 'cozy' },
    { id: 'px-coin-1', kind: 'pixel-coin', depth: 'near', xPercent: 93, yPercent: 16, scale: 1.0, driftVariant: 'float', durationSec: 5, delaySec: 0.8, bassReactive: true, minDensity: 'cozy' },
    { id: 'px-mystery-1', kind: 'mystery-block', depth: 'mid', xPercent: 12, yPercent: 68, scale: 1.0, driftVariant: 'float', durationSec: 7, delaySec: 1.1, bassReactive: true, minDensity: 'cozy' },
    { id: 'px-ghost-1', kind: 'pixel-ghost', depth: 'mid', xPercent: 74, yPercent: 78, scale: 0.95, driftVariant: 'drift', durationSec: 13, delaySec: 1.6, bassReactive: true, minDensity: 'cozy' },
    { id: 'px-heart-1', kind: 'pixel-heart', depth: 'near', xPercent: 86, yPercent: 25, scale: 0.95, driftVariant: 'float', durationSec: 6, delaySec: 0.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'px-rocket-1', kind: 'pixel-rocket', depth: 'near', xPercent: 81, yPercent: 14, scale: 1.0, driftVariant: 'glide', durationSec: 11, delaySec: 2, bassReactive: true, minDensity: 'packed' },
    { id: 'px-mushroom-1', kind: 'pixel-mushroom', depth: 'mid', xPercent: 60, yPercent: 20, scale: 0.95, driftVariant: 'float', durationSec: 7.5, delaySec: 1.3, bassReactive: true, minDensity: 'packed' },
    { id: 'px-potion-1', kind: 'pixel-potion', depth: 'near', xPercent: 95, yPercent: 85, scale: 0.9, driftVariant: 'sway', durationSec: 8.5, delaySec: 2.2, bassReactive: true, minDensity: 'packed' },
    { id: 'px-invader-2', kind: 'space-invader', depth: 'far', xPercent: 48, yPercent: 12, scale: 0.82, driftVariant: 'drift', durationSec: 15, delaySec: 3, bassReactive: false, minDensity: 'packed' },
    { id: 'px-cloud-2', kind: 'pixel-cloud', depth: 'far', xPercent: 72, yPercent: 44, scale: 0.95, driftVariant: 'drift', durationSec: 26, delaySec: 4, bassReactive: false, minDensity: 'packed' },
  ],
  'comic-book': [
    { id: 'cm-boom-1', kind: 'comic-bubble', depth: 'mid', xPercent: 84, yPercent: 18, scale: 1.05, driftVariant: 'float', durationSec: 8, delaySec: 0, bassReactive: true, minDensity: 'cozy', label: 'BOOM!' },
    { id: 'cm-vibe-1', kind: 'comic-bubble', depth: 'near', xPercent: 92, yPercent: 17, scale: 0.95, driftVariant: 'sway', durationSec: 9, delaySec: 0.7, bassReactive: true, minDensity: 'cozy', label: 'VIBE!' },
    { id: 'cm-bolt-1', kind: 'comic-lightning', depth: 'mid', xPercent: 89, yPercent: 62, scale: 1.05, driftVariant: 'float', durationSec: 6.5, delaySec: 0.3, bassReactive: true, minDensity: 'cozy' },
    { id: 'cm-star-1', kind: 'comic-star', depth: 'near', xPercent: 84, yPercent: 25, scale: 0.95, driftVariant: 'spin', durationSec: 12, delaySec: 0.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'cm-boombox-1', kind: 'comic-boombox', depth: 'mid', xPercent: 70, yPercent: 82, scale: 1.0, driftVariant: 'sway', durationSec: 10, delaySec: 1.4, bassReactive: true, minDensity: 'cozy' },
    { id: 'cm-swirl-1', kind: 'halftone-swirl', depth: 'far', xPercent: 46, yPercent: 16, scale: 1.25, driftVariant: 'spin', durationSec: 20, delaySec: 1, bassReactive: false, minDensity: 'cozy' },
    { id: 'cm-bass-1', kind: 'comic-bubble', depth: 'near', xPercent: 81, yPercent: 12, scale: 0.9, driftVariant: 'float', durationSec: 7.5, delaySec: 1.9, bassReactive: true, minDensity: 'packed', label: 'BASS!' },
    { id: 'cm-note-1', kind: 'comic-bubble', depth: 'near', xPercent: 95, yPercent: 85, scale: 0.85, driftVariant: 'float', durationSec: 6.8, delaySec: 2.3, bassReactive: true, minDensity: 'packed', label: '♫' },
    { id: 'cm-skate-1', kind: 'comic-skateboard', depth: 'mid', xPercent: 32, yPercent: 82, scale: 0.95, driftVariant: 'glide', durationSec: 14, delaySec: 0.9, bassReactive: true, minDensity: 'packed' },
    { id: 'cm-splat-1', kind: 'ink-splatter', depth: 'far', xPercent: 64, yPercent: 46, scale: 1.1, driftVariant: 'float', durationSec: 15, delaySec: 2.6, bassReactive: false, minDensity: 'packed' },
    { id: 'cm-star-2', kind: 'comic-star', depth: 'near', xPercent: 95, yPercent: 27, scale: 0.85, driftVariant: 'spin', durationSec: 9, delaySec: 1.5, bassReactive: true, minDensity: 'packed' },
  ],
  'cyberpunk-neon': [
    { id: 'cp-skyline-1', kind: 'cyber-skyline', depth: 'far', xPercent: 16, yPercent: 84, scale: 1.2, driftVariant: 'float', durationSec: 18, delaySec: 0, bassReactive: false, minDensity: 'cozy' },
    { id: 'cp-skyline-2', kind: 'cyber-skyline', depth: 'far', xPercent: 82, yPercent: 84, scale: 1.15, driftVariant: 'float', durationSec: 20, delaySec: 1, bassReactive: false, minDensity: 'cozy' },
    { id: 'cp-hovercar-1', kind: 'hover-car', depth: 'mid', xPercent: 28, yPercent: 26, scale: 1.0, driftVariant: 'drift', durationSec: 13, delaySec: 0.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'cp-katakana-1', kind: 'katakana-sign', depth: 'near', xPercent: 91, yPercent: 17, scale: 1.0, driftVariant: 'float', durationSec: 8, delaySec: 0.2, bassReactive: true, minDensity: 'cozy', label: 'サウンド' },
    { id: 'cp-warn-1', kind: 'holo-triangle', depth: 'mid', xPercent: 12, yPercent: 64, scale: 0.95, driftVariant: 'sway', durationSec: 9, delaySec: 1.1, bassReactive: true, minDensity: 'cozy' },
    { id: 'cp-visor-1', kind: 'cyber-visor', depth: 'near', xPercent: 84, yPercent: 26, scale: 0.95, driftVariant: 'float', durationSec: 7.5, delaySec: 1.6, bassReactive: true, minDensity: 'cozy' },
    { id: 'cp-circuit-1', kind: 'circuit-trace', depth: 'far', xPercent: 52, yPercent: 14, scale: 1.15, driftVariant: 'float', durationSec: 16, delaySec: 2, bassReactive: false, minDensity: 'packed' },
    { id: 'cp-rain-1', kind: 'neon-rain', depth: 'mid', xPercent: 68, yPercent: 38, scale: 1.05, driftVariant: 'glide', durationSec: 6, delaySec: 0.6, bassReactive: false, minDensity: 'packed' },
    { id: 'cp-katakana-2', kind: 'katakana-sign', depth: 'near', xPercent: 81, yPercent: 12, scale: 0.9, driftVariant: 'float', durationSec: 9.5, delaySec: 2.3, bassReactive: true, minDensity: 'packed', label: 'ネオン' },
    { id: 'cp-hovercar-2', kind: 'hover-car', depth: 'mid', xPercent: 62, yPercent: 78, scale: 0.85, driftVariant: 'drift', durationSec: 15, delaySec: 3.1, bassReactive: true, minDensity: 'packed' },
    { id: 'cp-skull-1', kind: 'cyber-skull', depth: 'near', xPercent: 95, yPercent: 85, scale: 0.9, driftVariant: 'sway', durationSec: 10, delaySec: 1.4, bassReactive: true, minDensity: 'packed' },
  ],
  'cozy-paper': [
    { id: 'pz-plane-1', kind: 'paper-airplane', depth: 'near', xPercent: 92, yPercent: 17, scale: 1.05, driftVariant: 'glide', durationSec: 12, delaySec: 0, bassReactive: true, minDensity: 'cozy' },
    { id: 'pz-mug-1', kind: 'coffee-mug', depth: 'mid', xPercent: 14, yPercent: 74, scale: 1.0, driftVariant: 'sway', durationSec: 9, delaySec: 0.6, bassReactive: true, minDensity: 'cozy' },
    { id: 'pz-stain-1', kind: 'coffee-stain', depth: 'far', xPercent: 78, yPercent: 78, scale: 1.25, driftVariant: 'float', durationSec: 18, delaySec: 1, bassReactive: false, minDensity: 'cozy' },
    { id: 'pz-cassette-1', kind: 'sketch-cassette', depth: 'mid', xPercent: 88, yPercent: 56, scale: 1.0, driftVariant: 'float', durationSec: 10, delaySec: 0.9, bassReactive: true, minDensity: 'cozy' },
    { id: 'pz-star-1', kind: 'doodle-star', depth: 'near', xPercent: 84, yPercent: 25, scale: 0.95, driftVariant: 'spin', durationSec: 15, delaySec: 0.4, bassReactive: true, minDensity: 'cozy' },
    { id: 'pz-polaroid-1', kind: 'taped-polaroid', depth: 'mid', xPercent: 48, yPercent: 84, scale: 0.95, driftVariant: 'sway', durationSec: 13, delaySec: 1.5, bassReactive: false, minDensity: 'cozy' },
    { id: 'pz-pen-1', kind: 'fountain-pen', depth: 'near', xPercent: 81, yPercent: 13, scale: 0.95, driftVariant: 'sway', durationSec: 11, delaySec: 2, bassReactive: false, minDensity: 'packed' },
    { id: 'pz-crumple-1', kind: 'crumpled-paper', depth: 'mid', xPercent: 64, yPercent: 22, scale: 0.9, driftVariant: 'spin', durationSec: 17, delaySec: 1.8, bassReactive: true, minDensity: 'packed' },
    { id: 'pz-heart-1', kind: 'doodle-heart', depth: 'near', xPercent: 95, yPercent: 85, scale: 0.85, driftVariant: 'float', durationSec: 8, delaySec: 2.4, bassReactive: true, minDensity: 'packed' },
    { id: 'pz-tape-1', kind: 'tape-strip', depth: 'far', xPercent: 36, yPercent: 14, scale: 1.0, driftVariant: 'float', durationSec: 16, delaySec: 2.8, bassReactive: false, minDensity: 'packed' },
    { id: 'pz-plane-2', kind: 'paper-airplane', depth: 'far', xPercent: 30, yPercent: 82, scale: 0.8, driftVariant: 'glide', durationSec: 16, delaySec: 3.4, bassReactive: false, minDensity: 'packed' },
  ],
  'frutiger-aero': [
    { id: 'fa-cloud-1', kind: 'aero-cloud', depth: 'far', xPercent: 80, yPercent: 10, scale: 1.25, driftVariant: 'drift', durationSec: 22, delaySec: 0, bassReactive: false, minDensity: 'cozy' },
    { id: 'fa-bubble-1', kind: 'soap-bubble', depth: 'near', xPercent: 92, yPercent: 17, scale: 1.05, driftVariant: 'float', durationSec: 8, delaySec: 0.3, bassReactive: true, minDensity: 'cozy' },
    { id: 'fa-fish-1', kind: 'clownfish', depth: 'mid', xPercent: 16, yPercent: 72, scale: 1.0, driftVariant: 'drift', durationSec: 14, delaySec: 0.8, bassReactive: true, minDensity: 'cozy' },
    { id: 'fa-orb-1', kind: 'glass-orb', depth: 'mid', xPercent: 88, yPercent: 68, scale: 1.05, driftVariant: 'float', durationSec: 10, delaySec: 1.2, bassReactive: true, minDensity: 'cozy' },
    { id: 'fa-flare-1', kind: 'sun-flare', depth: 'far', xPercent: 14, yPercent: 14, scale: 1.35, driftVariant: 'spin', durationSec: 24, delaySec: 0, bassReactive: false, minDensity: 'cozy' },
    { id: 'fa-leaf-1', kind: 'aero-leaf', depth: 'near', xPercent: 84, yPercent: 25, scale: 0.95, driftVariant: 'sway', durationSec: 9, delaySec: 1.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'fa-fish-2', kind: 'angelfish', depth: 'mid', xPercent: 72, yPercent: 80, scale: 0.95, driftVariant: 'drift', durationSec: 16, delaySec: 2, bassReactive: true, minDensity: 'packed' },
    { id: 'fa-bubble-2', kind: 'soap-bubble', depth: 'mid', xPercent: 10, yPercent: 38, scale: 0.85, driftVariant: 'float', durationSec: 9.5, delaySec: 2.3, bassReactive: true, minDensity: 'packed' },
    { id: 'fa-droplet-1', kind: 'water-droplet', depth: 'near', xPercent: 95, yPercent: 85, scale: 0.9, driftVariant: 'float', durationSec: 7.5, delaySec: 1.7, bassReactive: true, minDensity: 'packed' },
    { id: 'fa-ripple-1', kind: 'water-ripple', depth: 'far', xPercent: 36, yPercent: 82, scale: 1.15, driftVariant: 'float', durationSec: 12, delaySec: 2.9, bassReactive: true, minDensity: 'packed' },
    { id: 'fa-cloud-2', kind: 'aero-cloud', depth: 'far', xPercent: 44, yPercent: 14, scale: 0.95, driftVariant: 'drift', durationSec: 26, delaySec: 4, bassReactive: false, minDensity: 'packed' },
  ],
  'vaporwave': [
    { id: 'vw-sun-1', kind: 'vapor-sun', depth: 'far', xPercent: 52, yPercent: 66, scale: 1.35, driftVariant: 'float', durationSec: 16, delaySec: 0, bassReactive: true, minDensity: 'cozy' },
    { id: 'vw-palm-1', kind: 'palm-tree', depth: 'mid', xPercent: 88, yPercent: 72, scale: 1.1, driftVariant: 'sway', durationSec: 10, delaySec: 0.5, bassReactive: false, minDensity: 'cozy' },
    { id: 'vw-bust-1', kind: 'marble-bust', depth: 'mid', xPercent: 12, yPercent: 74, scale: 1.05, driftVariant: 'float', durationSec: 12, delaySec: 0.8, bassReactive: true, minDensity: 'cozy' },
    { id: 'vw-dolphin-1', kind: 'vapor-dolphin', depth: 'near', xPercent: 93, yPercent: 16, scale: 1.0, driftVariant: 'glide', durationSec: 11, delaySec: 0.4, bassReactive: true, minDensity: 'cozy' },
    { id: 'vw-win95-1', kind: 'win95-popup', depth: 'near', xPercent: 85, yPercent: 25, scale: 0.92, driftVariant: 'float', durationSec: 9, delaySec: 1.1, bassReactive: false, minDensity: 'cozy', label: 'AESTHETIC.EXE' },
    { id: 'vw-pillar-1', kind: 'marble-pillar', depth: 'far', xPercent: 30, yPercent: 78, scale: 0.95, driftVariant: 'float', durationSec: 18, delaySec: 1.6, bassReactive: false, minDensity: 'packed' },
    { id: 'vw-vhs-1', kind: 'vhs-tape', depth: 'near', xPercent: 95, yPercent: 85, scale: 0.95, driftVariant: 'sway', durationSec: 10.5, delaySec: 1.9, bassReactive: true, minDensity: 'packed' },
    { id: 'vw-flamingo-1', kind: 'pink-flamingo', depth: 'mid', xPercent: 92, yPercent: 44, scale: 0.95, driftVariant: 'sway', durationSec: 11, delaySec: 2.2, bassReactive: true, minDensity: 'packed' },
    { id: 'vw-checker-1', kind: 'checker-tile', depth: 'far', xPercent: 68, yPercent: 24, scale: 1.05, driftVariant: 'spin', durationSec: 20, delaySec: 2.5, bassReactive: false, minDensity: 'packed' },
    { id: 'vw-win95-2', kind: 'win95-popup', depth: 'near', xPercent: 81, yPercent: 12, scale: 0.85, driftVariant: 'float', durationSec: 12, delaySec: 3, bassReactive: false, minDensity: 'packed', label: 'SYNTH_95.WAV' },
  ],
  'blueprint': [
    { id: 'bp-cube-1', kind: 'wireframe-cube', depth: 'mid', xPercent: 86, yPercent: 22, scale: 1.1, driftVariant: 'spin', durationSec: 18, delaySec: 0, bassReactive: true, minDensity: 'cozy' },
    { id: 'bp-compass-1', kind: 'cad-compass', depth: 'near', xPercent: 92, yPercent: 18, scale: 1.0, driftVariant: 'sway', durationSec: 11, delaySec: 0.6, bassReactive: false, minDensity: 'cozy' },
    { id: 'bp-protractor-1', kind: 'cad-protractor', depth: 'far', xPercent: 84, yPercent: 72, scale: 1.15, driftVariant: 'spin', durationSec: 24, delaySec: 1, bassReactive: false, minDensity: 'cozy' },
    { id: 'bp-label-1', kind: 'cad-callout', depth: 'near', xPercent: 82, yPercent: 13, scale: 0.95, driftVariant: 'float', durationSec: 9, delaySec: 0.4, bassReactive: true, minDensity: 'cozy', label: '45° // R=24mm' },
    { id: 'bp-sphere-1', kind: 'wireframe-sphere', depth: 'mid', xPercent: 52, yPercent: 82, scale: 1.0, driftVariant: 'spin', durationSec: 20, delaySec: 1.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'bp-crosshair-1', kind: 'cad-crosshair', depth: 'far', xPercent: 68, yPercent: 42, scale: 1.1, driftVariant: 'float', durationSec: 14, delaySec: 1.8, bassReactive: false, minDensity: 'cozy' },
    { id: 'bp-pyramid-1', kind: 'wireframe-pyramid', depth: 'mid', xPercent: 10, yPercent: 38, scale: 0.95, driftVariant: 'spin', durationSec: 16, delaySec: 2.2, bassReactive: true, minDensity: 'packed' },
    { id: 'bp-label-2', kind: 'cad-callout', depth: 'near', xPercent: 85, yPercent: 27, scale: 0.92, driftVariant: 'float', durationSec: 10, delaySec: 2.6, bassReactive: false, minDensity: 'packed', label: 'SCALE 1:25' },
    { id: 'bp-flow-1', kind: 'cad-flow', depth: 'far', xPercent: 38, yPercent: 14, scale: 1.1, driftVariant: 'drift', durationSec: 17, delaySec: 2.9, bassReactive: false, minDensity: 'packed' },
    { id: 'bp-cube-2', kind: 'wireframe-cube', depth: 'far', xPercent: 32, yPercent: 84, scale: 0.8, driftVariant: 'spin', durationSec: 22, delaySec: 3.3, bassReactive: false, minDensity: 'packed' },
  ],
  'claymorphism': [
    { id: 'cl-sphere-1', kind: 'clay-sphere', depth: 'far', xPercent: 86, yPercent: 20, scale: 1.25, driftVariant: 'float', durationSec: 11, delaySec: 0, bassReactive: true, minDensity: 'cozy' },
    { id: 'cl-torus-1', kind: 'clay-torus', depth: 'mid', xPercent: 14, yPercent: 72, scale: 1.05, driftVariant: 'spin', durationSec: 15, delaySec: 0.6, bassReactive: true, minDensity: 'cozy' },
    { id: 'cl-cloud-1', kind: 'clay-cloud', depth: 'far', xPercent: 24, yPercent: 16, scale: 1.15, driftVariant: 'drift', durationSec: 20, delaySec: 1, bassReactive: false, minDensity: 'cozy' },
    { id: 'cl-star-1', kind: 'clay-star', depth: 'near', xPercent: 92, yPercent: 17, scale: 1.0, driftVariant: 'sway', durationSec: 8, delaySec: 0.4, bassReactive: true, minDensity: 'cozy' },
    { id: 'cl-cube-1', kind: 'clay-cube', depth: 'mid', xPercent: 52, yPercent: 84, scale: 1.0, driftVariant: 'float', durationSec: 10, delaySec: 1.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'cl-blob-1', kind: 'clay-blob-shape', depth: 'far', xPercent: 72, yPercent: 78, scale: 1.15, driftVariant: 'float', durationSec: 13, delaySec: 2, bassReactive: true, minDensity: 'cozy' },
    { id: 'cl-torus-2', kind: 'clay-torus', depth: 'near', xPercent: 84, yPercent: 25, scale: 0.9, driftVariant: 'spin', durationSec: 12, delaySec: 2.3, bassReactive: true, minDensity: 'packed' },
    { id: 'cl-sphere-2', kind: 'clay-sphere', depth: 'near', xPercent: 81, yPercent: 13, scale: 0.85, driftVariant: 'float', durationSec: 9, delaySec: 1.7, bassReactive: true, minDensity: 'packed' },
    { id: 'cl-star-2', kind: 'clay-star', depth: 'near', xPercent: 95, yPercent: 85, scale: 0.85, driftVariant: 'sway', durationSec: 7.5, delaySec: 2.7, bassReactive: true, minDensity: 'packed' },
    { id: 'cl-cube-2', kind: 'clay-cube', depth: 'far', xPercent: 92, yPercent: 42, scale: 0.82, driftVariant: 'float', durationSec: 14, delaySec: 3.1, bassReactive: false, minDensity: 'packed' },
  ],
  'terminal': [
    { id: 'tm-radar-1', kind: 'terminal-radar', depth: 'far', xPercent: 84, yPercent: 22, scale: 1.15, driftVariant: 'spin', durationSec: 12, delaySec: 0, bassReactive: true, minDensity: 'cozy' },
    { id: 'tm-skull-1', kind: 'ascii-skull', depth: 'mid', xPercent: 14, yPercent: 72, scale: 1.0, driftVariant: 'float', durationSec: 10, delaySec: 0.5, bassReactive: true, minDensity: 'cozy' },
    { id: 'tm-floppy-1', kind: 'ascii-floppy', depth: 'mid', xPercent: 88, yPercent: 64, scale: 1.0, driftVariant: 'sway', durationSec: 11, delaySec: 0.9, bassReactive: true, minDensity: 'cozy' },
    { id: 'tm-hex-1', kind: 'hex-snippet', depth: 'near', xPercent: 90, yPercent: 17, scale: 0.95, driftVariant: 'float', durationSec: 8, delaySec: 0.4, bassReactive: false, minDensity: 'cozy', label: '0x7F4A_AUDIO' },
    { id: 'tm-graph-1', kind: 'network-graph', depth: 'far', xPercent: 54, yPercent: 82, scale: 1.15, driftVariant: 'float', durationSec: 15, delaySec: 1.4, bassReactive: true, minDensity: 'cozy' },
    { id: 'tm-key-1', kind: 'ascii-key', depth: 'near', xPercent: 84, yPercent: 25, scale: 0.95, driftVariant: 'sway', durationSec: 9, delaySec: 1.8, bassReactive: true, minDensity: 'packed' },
    { id: 'tm-hex-2', kind: 'hex-snippet', depth: 'near', xPercent: 81, yPercent: 12, scale: 0.9, driftVariant: 'float', durationSec: 9.5, delaySec: 2.2, bassReactive: false, minDensity: 'packed', label: '0xDEADBEEF' },
    { id: 'tm-radar-2', kind: 'terminal-radar', depth: 'far', xPercent: 32, yPercent: 84, scale: 0.8, driftVariant: 'spin', durationSec: 16, delaySec: 2.6, bassReactive: false, minDensity: 'packed' },
    { id: 'tm-binary-1', kind: 'binary-burst', depth: 'mid', xPercent: 64, yPercent: 22, scale: 1.0, driftVariant: 'float', durationSec: 7.5, delaySec: 1.2, bassReactive: true, minDensity: 'packed', label: '10110011' },
    { id: 'tm-floppy-2', kind: 'ascii-floppy', depth: 'far', xPercent: 92, yPercent: 44, scale: 0.85, driftVariant: 'float', durationSec: 13, delaySec: 3, bassReactive: false, minDensity: 'packed' },
  ],
};

/**
 * Returns the props visible for a given theme and scenery density level.
 */
export function getVisibleSceneryProps(
  theme: ThemeId,
  density: SceneryDensity
): SceneryPropConfig[] {
  if (density === 'off') {
    return [];
  }
  const allProps = THEME_SCENERY_PROPS[theme] ?? [];
  if (density === 'cozy') {
    return allProps.filter((prop) => prop.minDensity === 'cozy');
  }
  return allProps;
}
