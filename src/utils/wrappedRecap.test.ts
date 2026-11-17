import test from 'node:test';
import assert from 'node:assert/strict';
import type { ListeningSessionEvent, Track } from '../types/music';
import {
  buildAnnualWrappedSummary,
  buildListeningCalendar,
  buildMonthlySoundCapsule,
  checkScheduledRecapTrigger,
  selectForgottenGems,
} from './wrappedRecap';

test('checkScheduledRecapTrigger fires monthly on 6th, yearly on Nov 6th, and respects seen-date', () => {
  // Regular day -> null
  assert.equal(checkScheduledRecapTrigger(new Date(2026, 10, 16), null), null);
  // 6th of March -> monthly
  assert.equal(checkScheduledRecapTrigger(new Date(2026, 2, 6), null), 'monthly');
  // Already shown on 2026-03-06 -> null
  assert.equal(checkScheduledRecapTrigger(new Date(2026, 2, 6), '2026-03-06'), null);
  // November 6th -> yearly
  assert.equal(checkScheduledRecapTrigger(new Date(2026, 10, 6), null), 'yearly');
  // Already shown on 2026-11-06 -> null
  assert.equal(checkScheduledRecapTrigger(new Date(2026, 10, 6), '2026-11-06'), null);
});

test('buildMonthlySoundCapsule, buildAnnualWrappedSummary, and buildListeningCalendar aggregate activity', () => {
  const tracks: Track[] = [
    {
      id: 't1',
      title: 'Chrome Raindrive',
      artist: 'Kuroda Pulse',
      album: 'Sector 09',
      duration: 180,
      src: 'blob:1',
      isLocal: false,
      liked: true,
      coverSeed: 1,
      playCount: 14,
      addedAt: 1000,
      bpm: 128,
      mood: 'Hype',
      lastPlayedAt: Date.now() - 86400000 * 12,
    },
    {
      id: 't2',
      title: 'Forgotten Vinyl',
      artist: 'Dusty Loop',
      album: 'Crate',
      duration: 210,
      src: 'blob:2',
      isLocal: true,
      liked: false,
      coverSeed: 2,
      playCount: 0,
      addedAt: 500,
      bpm: 88,
      mood: 'Chill',
    },
  ];

  const base = new Date(2026, 10, 6, 23, 0, 0).getTime();
  const history: ListeningSessionEvent[] = [
    {
      id: 'e1',
      trackId: 't1',
      trackTitle: 'Chrome Raindrive',
      artistName: 'Kuroda Pulse',
      timestamp: base - 2 * 86400000,
      durationSeconds: 180,
      mood: 'Hype',
      bpm: 128,
    },
    {
      id: 'e2',
      trackId: 't1',
      trackTitle: 'Chrome Raindrive',
      artistName: 'Kuroda Pulse',
      timestamp: base - 1 * 86400000,
      durationSeconds: 180,
      mood: 'Hype',
      bpm: 128,
    },
    {
      id: 'e3',
      trackId: 't1',
      trackTitle: 'Chrome Raindrive',
      artistName: 'Kuroda Pulse',
      timestamp: base,
      durationSeconds: 240,
      mood: 'Hype',
      bpm: 130,
    },
  ];

  const monthly = buildMonthlySoundCapsule(tracks, history, new Date(2026, 10, 6));
  assert.equal(monthly.kind, 'monthly');
  assert.equal(monthly.topTracks[0].id, 't1');
  assert.equal(monthly.topArtist?.name, 'Kuroda Pulse');
  assert.equal(monthly.dominantMood, 'Hype');
  assert.equal(monthly.peakTimeOfDay, 'Late Night');

  const yearly = buildAnnualWrappedSummary(tracks, history, 2026);
  assert.equal(yearly.kind, 'yearly');
  assert.ok(yearly.archetype && yearly.archetype.length > 0);
  assert.equal(yearly.streakDays, 3);

  const cal = buildListeningCalendar(history, new Date(2026, 10, 6));
  assert.equal(cal.currentStreak, 3);
  assert.equal(cal.activeDaysCount, 3);

  const gems = selectForgottenGems(tracks, base);
  assert.equal(gems[0].id, 't2');
});
