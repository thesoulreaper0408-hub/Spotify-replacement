import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveLyricIndex, parseLrc } from './lrcParser';

test('parseLrc parses timestamps, multiple tags per line, and skips metadata', () => {
  const sample = `
[ti:Velvet Evening]
[ar:Mira]
[00:00.50]Soft static hums across the dial
[00:05.25][00:12.00]Warm tape spinning in the dark
[00:08.5]Neon reflections on glass
`;

  const lines = parseLrc(sample);
  assert.equal(lines.length, 4);
  assert.deepEqual(lines[0], { time: 0.5, text: 'Soft static hums across the dial' });
  assert.deepEqual(lines[1], { time: 5.25, text: 'Warm tape spinning in the dark' });
  assert.deepEqual(lines[2], { time: 8.5, text: 'Neon reflections on glass' });
  assert.deepEqual(lines[3], { time: 12, text: 'Warm tape spinning in the dark' });
});

test('getActiveLyricIndex finds the latest line matching currentTime', () => {
  const lines = parseLrc(`
[00:02.00]Line one
[00:06.00]Line two
[00:10.00]Line three
`);

  assert.equal(getActiveLyricIndex(lines, 0.5), -1);
  assert.equal(getActiveLyricIndex(lines, 2.0), 0);
  assert.equal(getActiveLyricIndex(lines, 5.9), 0);
  assert.equal(getActiveLyricIndex(lines, 6.2), 1);
  assert.equal(getActiveLyricIndex(lines, 14.0), 2);
});
