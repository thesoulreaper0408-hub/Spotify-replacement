import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_VINYL_NOISE_GAIN,
  computeVinylNoiseGain,
  synthesizeVinylCrackleSamples,
} from './vinylNoise';

test('computeVinylNoiseGain ties crackle level strictly to isPlaying, enabled, mute, volume, and fade', () => {
  assert.equal(
    computeVinylNoiseGain({ isPlaying: false, enabled: true, volume: 0.8, muted: false }),
    0
  );
  assert.equal(
    computeVinylNoiseGain({ isPlaying: true, enabled: false, volume: 0.8, muted: false }),
    0
  );
  assert.equal(
    computeVinylNoiseGain({ isPlaying: true, enabled: true, volume: 0.8, muted: true }),
    0
  );
  assert.equal(
    computeVinylNoiseGain({ isPlaying: true, enabled: true, volume: 0, muted: false }),
    0
  );

  const activeGain = computeVinylNoiseGain({
    isPlaying: true,
    enabled: true,
    volume: 1,
    muted: false,
    sleepFadeFactor: 1,
  });
  assert.equal(activeGain, BASE_VINYL_NOISE_GAIN);

  const halfGain = computeVinylNoiseGain({
    isPlaying: true,
    enabled: true,
    volume: 0.5,
    muted: false,
    sleepFadeFactor: 0.5,
  });
  assert.ok(halfGain > 0 && halfGain < activeGain);
});

test('synthesizeVinylCrackleSamples produces bounded non-silent crackle & surface noise', () => {
  const samples = synthesizeVinylCrackleSamples(22050, 2, 42);
  assert.equal(samples.length, 44100);

  let maxAbs = 0;
  let cracklePeakCount = 0;
  let sumSq = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const s = samples[i];
    const abs = Math.abs(s);
    if (abs > maxAbs) maxAbs = abs;
    if (abs > 0.14) cracklePeakCount += 1;
    sumSq += s * s;
  }

  const rms = Math.sqrt(sumSq / samples.length);
  assert.ok(maxAbs <= 0.85, `peak ${maxAbs} must stay safely clamped`);
  assert.ok(rms > 0.005 && rms < 0.25, `rms ${rms} should represent subtle audible groove texture`);
  assert.ok(cracklePeakCount >= 10, `expected audible dust crackle impulses, saw ${cracklePeakCount}`);
});
