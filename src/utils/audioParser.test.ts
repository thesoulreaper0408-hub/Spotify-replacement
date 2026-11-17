import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCoverSeed,
  filterTracks,
  formatDuration,
  getNextTrackIndex,
  getPreviousTrackIndex,
  parseAudioFilename,
  removeFromQueue,
  reorderQueue,
  sortTracks,
} from './audioParser';
import type { Track } from '../types/music';

const SAMPLE_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Horizon',
    artist: 'Vespera',
    album: 'Night Tapes',
    duration: 24,
    src: 'blob:1',
    isLocal: false,
    liked: false,
    coverSeed: 1,
    playCount: 3,
    addedAt: 1000,
  },
  {
    id: '2',
    title: 'Rain on Linen',
    artist: 'Klara Vance',
    album: 'Warm Sketchbook',
    duration: 18,
    src: 'blob:2',
    isLocal: false,
    liked: true,
    coverSeed: 2,
    playCount: 1,
    addedAt: 2000,
  },
  {
    id: '3',
    title: 'Amber Clock',
    artist: 'Atlas Mono',
    album: 'Analog Hours',
    duration: 32,
    src: 'blob:3',
    isLocal: false,
    liked: false,
    coverSeed: 3,
    playCount: 5,
    addedAt: 3000,
  },
];

test('parseAudioFilename strips audio extensions and extracts artist/title', () => {
  assert.deepEqual(parseAudioFilename('Midnight_City.mp3'), {
    title: 'Midnight City',
    artist: 'Local Artist',
    album: 'Local Uploads',
  });

  assert.deepEqual(parseAudioFilename('02 - Daft Punk - Digital Love.flac'), {
    title: 'Digital Love',
    artist: 'Daft Punk',
    album: 'Local Uploads',
  });

  assert.deepEqual(parseAudioFilename('Boards of Canada - Roygbiv.ogg'), {
    title: 'Roygbiv',
    artist: 'Boards of Canada',
    album: 'Local Uploads',
  });
});

test('formatDuration handles seconds, minutes, hours, and invalid inputs', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(7), '0:07');
  assert.equal(formatDuration(125), '2:05');
  assert.equal(formatDuration(3665), '1:01:05');
  assert.equal(formatDuration(NaN), '0:00');
  assert.equal(formatDuration(-10), '0:00');
});

test('filterTracks matches title, artist, and album case-insensitively', () => {
  assert.equal(filterTracks(SAMPLE_TRACKS, '').length, 3);
  assert.equal(filterTracks(SAMPLE_TRACKS, 'vesp').map((t) => t.id).join(','), '1');
  assert.equal(filterTracks(SAMPLE_TRACKS, 'sketchbook').map((t) => t.id).join(','), '2');
  assert.equal(filterTracks(SAMPLE_TRACKS, 'nonexistent').length, 0);
});

test('sortTracks sorts by title, artist, and duration ascending and descending', () => {
  assert.deepEqual(
    sortTracks(SAMPLE_TRACKS, 'title', 'asc').map((t) => t.id),
    ['3', '1', '2']
  );
  assert.deepEqual(
    sortTracks(SAMPLE_TRACKS, 'title', 'desc').map((t) => t.id),
    ['2', '1', '3']
  );
  assert.deepEqual(
    sortTracks(SAMPLE_TRACKS, 'artist', 'asc').map((t) => t.id),
    ['3', '2', '1']
  );
  assert.deepEqual(
    sortTracks(SAMPLE_TRACKS, 'duration', 'asc').map((t) => t.id),
    ['2', '1', '3']
  );
  assert.deepEqual(
    sortTracks(SAMPLE_TRACKS, 'duration', 'desc').map((t) => t.id),
    ['3', '1', '2']
  );
});

test('reorderQueue and removeFromQueue update order immutably', () => {
  const initial = ['a', 'b', 'c', 'd'];
  assert.deepEqual(reorderQueue(initial, 1, 3), ['a', 'c', 'd', 'b']);
  assert.deepEqual(reorderQueue(initial, 2, 0), ['c', 'a', 'b', 'd']);
  assert.deepEqual(removeFromQueue(initial, 1), ['a', 'c', 'd']);
  assert.deepEqual(initial, ['a', 'b', 'c', 'd']);
});

test('getNextTrackIndex and getPreviousTrackIndex respect repeat and shuffle modes', () => {
  assert.equal(
    getNextTrackIndex({ currentIndex: 2, queueLength: 3, shuffle: false, repeatMode: 'off', autoAdvance: true }),
    -1
  );
  assert.equal(
    getNextTrackIndex({ currentIndex: 2, queueLength: 3, shuffle: false, repeatMode: 'all', autoAdvance: true }),
    0
  );
  assert.equal(
    getNextTrackIndex({ currentIndex: 1, queueLength: 3, shuffle: false, repeatMode: 'one', autoAdvance: true }),
    1
  );
  assert.equal(
    getNextTrackIndex({ currentIndex: 1, queueLength: 3, shuffle: false, repeatMode: 'one', autoAdvance: false }),
    2
  );

  for (let r = 0; r < 1; r += 0.2) {
    const picked = getNextTrackIndex({
      currentIndex: 1,
      queueLength: 4,
      shuffle: true,
      repeatMode: 'off',
      autoAdvance: true,
      randomValue: r,
    });
    assert.notEqual(picked, 1);
    assert.ok(picked >= 0 && picked < 4);
  }

  assert.equal(getPreviousTrackIndex({ currentIndex: 0, queueLength: 3, repeatMode: 'off' }), 0);
  assert.equal(getPreviousTrackIndex({ currentIndex: 0, queueLength: 3, repeatMode: 'all' }), 2);
  assert.equal(getPreviousTrackIndex({ currentIndex: 2, queueLength: 3, repeatMode: 'off' }), 1);
});

test('computeCoverSeed is deterministic', () => {
  assert.equal(computeCoverSeed('Track A'), computeCoverSeed('Track A'));
  assert.notEqual(computeCoverSeed('Track A'), computeCoverSeed('Track B'));
});
