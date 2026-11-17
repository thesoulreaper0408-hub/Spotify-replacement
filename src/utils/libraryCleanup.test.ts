import test from 'node:test';
import assert from 'node:assert/strict';
import type { Track } from '../types/music';
import { findDuplicateTrackGroups, normalizeTrackTitleKey } from './libraryCleanup';

function makeTrack(overrides: Partial<Track> & { id: string; title: string }): Track {
  return {
    artist: 'Artist',
    album: 'Album',
    duration: 180,
    src: 'blob:1',
    isLocal: true,
    liked: false,
    coverSeed: 1,
    playCount: 0,
    addedAt: 1000,
    ...overrides,
  };
}

test('normalizeTrackTitleKey strips copy tags and remaster labels', () => {
  assert.equal(normalizeTrackTitleKey('Midnight City (Copy)'), 'midnight city');
  assert.equal(normalizeTrackTitleKey('Midnight City [Remastered]'), 'midnight city');
});

test('findDuplicateTrackGroups detects matching titles/sizes and recommends highest quality', () => {
  const tracks = [
    makeTrack({
      id: 'low',
      title: 'Neon Highway (Copy)',
      duration: 210.2,
      sampleRate: 22050,
      fileSizeBytes: 1_800_000,
    }),
    makeTrack({
      id: 'high',
      title: 'Neon Highway',
      duration: 210.0,
      sampleRate: 48000,
      fileSizeBytes: 5_400_000,
      liked: true,
    }),
    makeTrack({
      id: 'unique',
      title: 'Paper Airplane',
      duration: 145,
      sampleRate: 44100,
    }),
  ];

  const groups = findDuplicateTrackGroups(tracks);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].tracks.length, 2);
  assert.equal(groups[0].recommendedKeepId, 'high');
});
