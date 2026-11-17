import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeChannelsSliceToWav } from './wavExporter';

test('encodeChannelsSliceToWav writes valid RIFF/WAVE header and exact sliced duration', () => {
  const sampleRate = 8000;
  const full = new Float32Array(sampleRate * 4);
  full.fill(0.5);

  const wavBuffer = encodeChannelsSliceToWav([full], sampleRate, 1, 2.5, {
    fadeInSec: 0.5,
    fadeOutSec: 0.5,
  });

  const view = new DataView(wavBuffer);
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  const wave = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );
  assert.equal(riff, 'RIFF');
  assert.equal(wave, 'WAVE');

  const expectedSamples = Math.floor(1.5 * sampleRate);
  assert.equal(view.getUint32(40, true), expectedSamples * 2);
  assert.equal(wavBuffer.byteLength, 44 + expectedSamples * 2);

  // Fade-in starts near zero, midpoint near 0.5 amplitude, fade-out ends near zero
  const firstSample = view.getInt16(44, true);
  const midSample = view.getInt16(44 + Math.floor(expectedSamples / 2) * 2, true);
  const lastSample = view.getInt16(44 + (expectedSamples - 1) * 2, true);
  assert.equal(firstSample, 0);
  assert.ok(midSample > 12000, 'midpoint sample should remain loud');
  assert.equal(lastSample, 0);
});
