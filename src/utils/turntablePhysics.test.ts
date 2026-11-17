import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TURNTABLE_COAST_DOWN_MS,
  TURNTABLE_SPIN_UP_MS,
  advanceTurntableAngle,
  computeTurntablePlaybackRate,
  easeInMotorTorque,
  easeOutPlatterFriction,
} from './turntablePhysics';

test('easeInMotorTorque starts slow and accelerates monotonically from 0 to 1', () => {
  assert.equal(easeInMotorTorque(-0.5), 0);
  assert.equal(easeInMotorTorque(0), 0);
  assert.equal(easeInMotorTorque(1), 1);
  assert.equal(easeInMotorTorque(1.5), 1);

  const q1 = easeInMotorTorque(0.25);
  const q2 = easeInMotorTorque(0.5);
  const q3 = easeInMotorTorque(0.75);

  assert.ok(q1 < 0.1, 'early spin-up rate should start gently below linear');
  assert.ok(q1 < q2 && q2 < q3 && q3 < 1);
  // First-quarter delta is smaller than last-quarter delta (true ease-in)
  assert.ok(q1 - 0 < 1 - q3);
});

test('easeOutPlatterFriction starts at 1 and decelerates gracefully to 0', () => {
  assert.equal(easeOutPlatterFriction(-0.2), 1);
  assert.equal(easeOutPlatterFriction(0), 1);
  assert.equal(easeOutPlatterFriction(1), 0);
  assert.equal(easeOutPlatterFriction(2), 0);

  const q1 = easeOutPlatterFriction(0.25);
  const q2 = easeOutPlatterFriction(0.5);
  const q3 = easeOutPlatterFriction(0.75);

  assert.ok(q1 > q2 && q2 > q3 && q3 > 0);
  // Tail near t=1 slows down smoothly (smaller drop in last quarter than first quarter)
  assert.ok(1 - q1 > q3 - 0);
});

test('computeTurntablePlaybackRate ramps spin-up smoothly from standstill and mid-coast', () => {
  const startStep = computeTurntablePlaybackRate('spin-up', 0, 0, 1, TURNTABLE_SPIN_UP_MS);
  assert.equal(startStep.rate, 0);
  assert.equal(startStep.done, false);

  const midStep = computeTurntablePlaybackRate(
    'spin-up',
    TURNTABLE_SPIN_UP_MS * 0.5,
    0,
    1,
    TURNTABLE_SPIN_UP_MS
  );
  assert.ok(midStep.rate > 0.1 && midStep.rate < 0.35);
  assert.equal(midStep.done, false);

  const endStep = computeTurntablePlaybackRate(
    'spin-up',
    TURNTABLE_SPIN_UP_MS,
    0,
    1,
    TURNTABLE_SPIN_UP_MS
  );
  assert.equal(endStep.rate, 1);
  assert.equal(endStep.done, true);

  // Resuming mid-coast preserves current momentum
  const resumeStep = computeTurntablePlaybackRate('spin-up', 0, 0.42, 1, TURNTABLE_SPIN_UP_MS);
  assert.equal(resumeStep.rate, 0.42);
});

test('computeTurntablePlaybackRate coasts down cleanly on pause without snapping to 0', () => {
  const beginPause = computeTurntablePlaybackRate(
    'coast-down',
    0,
    1,
    0,
    TURNTABLE_COAST_DOWN_MS
  );
  assert.equal(beginPause.rate, 1);
  assert.equal(beginPause.done, false);

  const midPause = computeTurntablePlaybackRate(
    'coast-down',
    TURNTABLE_COAST_DOWN_MS * 0.5,
    1,
    0,
    TURNTABLE_COAST_DOWN_MS
  );
  assert.equal(midPause.rate, 0.25);
  assert.equal(midPause.done, false);

  const stopped = computeTurntablePlaybackRate(
    'coast-down',
    TURNTABLE_COAST_DOWN_MS,
    1,
    0,
    TURNTABLE_COAST_DOWN_MS
  );
  assert.equal(stopped.rate, 0);
  assert.equal(stopped.done, true);

  // Handles invalid/zero duration cleanly
  const instant = computeTurntablePlaybackRate('coast-down', 10, 0.8, 0, 0);
  assert.equal(instant.rate, 0);
  assert.equal(instant.done, true);
});

test('advanceTurntableAngle integrates degrees continuously and wraps [0, 360)', () => {
  // 150 deg/sec * 1.0 * 0.1s (max capped frame delta) = 15 deg
  const stepped = advanceTurntableAngle(350, 1, 100);
  assert.equal(stepped, 5);

  // At rate 0, angle holds steady
  assert.equal(advanceTurntableAngle(142.5, 0, 16), 142.5);
});
