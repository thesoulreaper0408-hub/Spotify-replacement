import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCountdown,
  getNightDimOpacity,
  getSleepFadeFactor,
  minutesToSeconds,
  tickCountdown,
} from './sleepTimer';

test('minutesToSeconds converts valid minutes and clamps invalid values', () => {
  assert.equal(minutesToSeconds(15), 900);
  assert.equal(minutesToSeconds(30), 1800);
  assert.equal(minutesToSeconds(60), 3600);
  assert.equal(minutesToSeconds(0), 0);
  assert.equal(minutesToSeconds(-5), 0);
  assert.equal(minutesToSeconds(NaN), 0);
});

test('formatCountdown formats seconds cleanly into MM:SS and H:MM:SS', () => {
  assert.equal(formatCountdown(0), '0:00');
  assert.equal(formatCountdown(59), '0:59');
  assert.equal(formatCountdown(900), '15:00');
  assert.equal(formatCountdown(3665), '1:01:05');
});

test('tickCountdown decrements and signals expiration cleanly', () => {
  assert.deepEqual(tickCountdown(null), { nextRemaining: null, expired: false });
  assert.deepEqual(tickCountdown(10), { nextRemaining: 9, expired: false });
  assert.deepEqual(tickCountdown(1), { nextRemaining: null, expired: true });
  assert.deepEqual(tickCountdown(0), { nextRemaining: null, expired: true });
});

test('getSleepFadeFactor and getNightDimOpacity smoothly ramp during final 60 seconds', () => {
  assert.equal(getSleepFadeFactor(null), 1);
  assert.equal(getSleepFadeFactor(120), 1);
  assert.equal(getSleepFadeFactor(30), 0.5);
  assert.equal(getSleepFadeFactor(0), 0);

  assert.equal(getNightDimOpacity(null), 0);
  assert.equal(getNightDimOpacity(120), 0);
  assert.ok(getNightDimOpacity(30) > 0.15 && getNightDimOpacity(30) < 0.3);
  assert.ok(getNightDimOpacity(0) > 0.4);
});
