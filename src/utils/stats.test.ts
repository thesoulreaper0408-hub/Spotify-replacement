import test from 'node:test';
import assert from 'node:assert/strict';
import type { Track } from '../types/music';
import { buildPlayCountStats, formatListeningTime } from './stats';

const makeTrack = (
  id: string,
  title: string,
  artist: string,
  playCount: number,
  listeningSeconds?: number
): Track => ({
  id,
  title,
  artist,
  album: 'Test Album',
  duration: 120,
  src: '',
  isLocal: false,
  liked: false,
  coverSeed: 1,
  playCount,
  listeningSeconds,
  addedAt: 1000,
});

test('buildPlayCountStats ranks tracks by playCount and computes totalListeningSeconds', () => {
  const tracks: Track[] = [
    makeTrack('t1', 'Alpha', 'Artist A', 10), // fallback 10 * 120 = 1200s
    makeTrack('t2', 'Beta', 'Artist B', 19, 2500),
    makeTrack('t3', 'Gamma', 'Artist A', 12, 1440),
    makeTrack('t4', 'Delta', 'Artist C', 0, 18), // partially listened
  ];

  const stats = buildPlayCountStats(tracks, 10);

  assert.equal(stats.totalPlays, 41);
  assert.equal(stats.totalListeningSeconds, 5158);
  assert.equal(stats.playedTrackCount, 3);
  assert.equal(stats.totalTracks, 4);
  assert.equal(stats.averagePlays, 10.3);
  assert.equal(stats.topTrack?.title, 'Beta');
  assert.equal(stats.topTrack?.playCount, 19);
  assert.equal(stats.topTrack?.listeningSeconds, 2500);
  assert.equal(stats.topArtist?.name, 'Artist A');
  assert.equal(stats.topArtist?.plays, 22);
  assert.deepEqual(
    stats.rankedTracks.map((r) => r.id),
    ['t2', 't3', 't1', 't4']
  );
});

test('buildPlayCountStats handles empty libraries and zero-play tracks safely', () => {
  const empty = buildPlayCountStats([]);
  assert.equal(empty.totalPlays, 0);
  assert.equal(empty.totalListeningSeconds, 0);
  assert.equal(empty.topTrack, null);
  assert.equal(empty.topArtist, null);
  assert.deepEqual(empty.rankedTracks, []);

  const zeroPlays = buildPlayCountStats([makeTrack('z1', 'Quiet', 'Nobody', 0, 0)]);
  assert.equal(zeroPlays.totalPlays, 0);
  assert.equal(zeroPlays.totalListeningSeconds, 0);
  assert.equal(zeroPlays.playedTrackCount, 0);
  assert.equal(zeroPlays.topTrack, null);
  assert.equal(zeroPlays.rankedTracks.length, 1);
  assert.equal(zeroPlays.rankedTracks[0].sharePercent, 0);
});

test('formatListeningTime formats seconds, minutes, and hours clearly', () => {
  assert.equal(formatListeningTime(0), '0s');
  assert.equal(formatListeningTime(45), '45s');
  assert.equal(formatListeningTime(125), '2m 05s');
  assert.equal(formatListeningTime(3665), '1h 01m');
});
