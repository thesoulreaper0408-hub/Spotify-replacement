import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeMonoAudioData,
  computeAutoMixTransition,
  computeReplayGainFromRms,
  detectSilenceBounds,
  EQ_BAND_FREQUENCIES,
  EQ_PRESETS,
  extractWaveformPeaks,
} from './audioEngine';

test('EQ_PRESETS define 5-band curves matching EQ_BAND_FREQUENCIES', () => {
  assert.equal(EQ_BAND_FREQUENCIES.length, 5);
  const ids = new Set(EQ_PRESETS.map((p) => p.id));
  assert.ok(ids.has('flat'));
  assert.ok(ids.has('bass-boost'));
  assert.ok(ids.has('vocal-enhance'));
  assert.ok(ids.has('jazz'));

  for (const preset of EQ_PRESETS) {
    assert.equal(preset.gains.length, 5);
  }
});

test('computeReplayGainFromRms boosts quiet tracks and attenuates overly loud tracks', () => {
  const quietGain = computeReplayGainFromRms(0.05);
  const loudGain = computeReplayGainFromRms(0.45);
  assert.ok(quietGain > 1.8, 'quiet track should receive positive boost');
  assert.ok(loudGain < 0.6, 'loud track should be attenuated');
  assert.equal(computeReplayGainFromRms(0), 1.0);
});

test('detectSilenceBounds trims leading and trailing audio below -50dB', () => {
  const sampleRate = 1000;
  const buf = new Float32Array(4000); // 4 seconds total
  // Leading silence: 0..1.0s (0.0005 < 0.00316 threshold)
  buf.fill(0.0005, 0, 1000);
  // Active audio: 1.0..2.8s
  buf.fill(0.25, 1000, 2800);
  // Trailing silence: 2.8..4.0s
  buf.fill(0.0001, 2800, 4000);

  const bounds = detectSilenceBounds(buf, sampleRate);
  assert.equal(bounds.trimStart, 1);
  assert.equal(bounds.trimEnd, 2.8);
});

test('extractWaveformPeaks and analyzeMonoAudioData produce normalized peaks and valid mood', () => {
  const sampleRate = 8000;
  const pcm = new Float32Array(sampleRate * 3);
  for (let i = 0; i < pcm.length; i += 1) {
    pcm[i] = 0.2 * Math.sin((2 * Math.PI * 220 * i) / sampleRate);
  }
  const analysis = analyzeMonoAudioData(pcm, sampleRate);
  assert.equal(analysis.waveformPeaks.length, 72);
  assert.ok(analysis.waveformPeaks.every((p) => p >= 0.08 && p <= 1));
  assert.ok(analysis.rmsLoudness > 0.1);
  assert.ok(['Chill', 'Groove', 'Hype'].includes(analysis.mood));

  const fallback = extractWaveformPeaks(new Float32Array(0), 32);
  assert.equal(fallback.length, 32);
});

test('computeAutoMixTransition ramps playbackRate toward next BPM in final 8 seconds', () => {
  const before = computeAutoMixTransition(12, 100, 115, true);
  assert.equal(before.active, false);
  assert.equal(before.playbackRate, 1);

  const mid = computeAutoMixTransition(4, 100, 115, true);
  assert.equal(mid.active, true);
  assert.ok(mid.playbackRate > 1.05 && mid.playbackRate < 1.15);
  assert.ok(mid.outgoingGain < 0.9 && mid.outgoingGain > 0.3);
  assert.equal(mid.shouldAdvanceNow, false);

  const handoff = computeAutoMixTransition(0.2, 100, 115, true);
  assert.equal(handoff.shouldAdvanceNow, true);
});
