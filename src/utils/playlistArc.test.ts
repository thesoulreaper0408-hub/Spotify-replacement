import test from 'node:test';
import assert from 'node:assert/strict';
import type { Track } from '../types/music';
import { arrangePlaylistByEnergyArc } from './playlistArc';

function makeTrack(id: string, bpm: number): Track {
  return {
    id,
    title: `Track ${id}`,
    artist: 'Artist',
    album: 'Album',
    duration: 180,
    src: 'blob:x',
    isLocal: false,
    liked: false,
    coverSeed: 1,
    playCount: 1,
    addedAt: 1000,
    bpm,
    mood: bpm >= 122 ? 'Hype' : bpm <= 96 ? 'Chill' : 'Groove',
  };
}

test('arrangePlaylistByEnergyArc orders tracks cleanly for all three arc presets', () => {
  const tracks = [
    makeTrack('t80', 80),
    makeTrack('t95', 95),
    makeTrack('t115', 115),
    makeTrack('t130', 130),
    makeTrack('t142', 142),
  ];

  const lateNight = arrangePlaylistByEnergyArc(tracks, 'late-night');
  assert.deepEqual(lateNight, ['t142', 't130', 't115', 't95', 't80']);

  const rollercoaster = arrangePlaylistByEnergyArc(tracks, 'rollercoaster');
  assert.equal(rollercoaster[0], 't142');
  assert.equal(rollercoaster[1], 't80');
  assert.equal(rollercoaster[2], 't130');

  const party = arrangePlaylistByEnergyArc(tracks, 'party-workout');
  const peakIdx = party.indexOf('t142');
  assert.ok(peakIdx > 0 && peakIdx < party.length - 1, 'party arc should climax mid-late playlist');
  assert.equal(party.length, 5);
});
