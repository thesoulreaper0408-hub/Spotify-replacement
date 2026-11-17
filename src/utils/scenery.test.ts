import test from 'node:test';
import assert from 'node:assert/strict';
import { THEME_OPTIONS } from '../themes/themes';
import {
  computeBandEnergies,
  computePropAudioTransformVars,
  getPropAudioMapping,
  getVisibleSceneryProps,
  smoothBandEnergies,
  THEME_SCENERY_PROPS,
  ZERO_BAND_ENERGIES,
} from './scenery';

test('getVisibleSceneryProps respects off, cozy, and packed density across all 10 themes', () => {
  for (const themeMeta of THEME_OPTIONS) {
    const offProps = getVisibleSceneryProps(themeMeta.id, 'off');
    const cozyProps = getVisibleSceneryProps(themeMeta.id, 'cozy');
    const packedProps = getVisibleSceneryProps(themeMeta.id, 'packed');

    assert.equal(offProps.length, 0, `${themeMeta.id} off density should have 0 props`);
    assert.ok(cozyProps.length >= 5, `${themeMeta.id} cozy density should have at least 5 props`);
    assert.ok(
      packedProps.length > cozyProps.length,
      `${themeMeta.id} packed density should have more props than cozy`
    );
    assert.equal(packedProps.length, THEME_SCENERY_PROPS[themeMeta.id].length);
  }
});

test('every theme includes multi-depth parallax props and multiple audio-reactive motion styles', () => {
  for (const themeMeta of THEME_OPTIONS) {
    const props = getVisibleSceneryProps(themeMeta.id, 'packed');
    const depths = new Set(props.map((p) => p.depth));
    assert.ok(depths.has('far'), `${themeMeta.id} missing far parallax layer`);
    assert.ok(depths.has('mid'), `${themeMeta.id} missing mid parallax layer`);
    assert.ok(depths.has('near'), `${themeMeta.id} missing near parallax layer`);

    const reactiveProps = props.filter((p) => p.bassReactive);
    assert.ok(
      reactiveProps.length >= 4,
      `${themeMeta.id} should have at least 4 audio-reactive props`
    );

    const bands = new Set(reactiveProps.map((p) => getPropAudioMapping(p.kind).band));
    assert.ok(
      bands.size >= 2,
      `${themeMeta.id} should map reactive props across at least 2 frequency bands`
    );
  }
});

test('computeBandEnergies isolates subBass, bass, mid, and high frequency bins', () => {
  assert.deepEqual(computeBandEnergies(new Uint8Array(0)), ZERO_BAND_ENERGIES);

  const subBassBins = new Uint8Array(64);
  subBassBins[0] = 255;
  subBassBins[1] = 200;
  const subEnergies = computeBandEnergies(subBassBins);
  assert.ok(subEnergies.subBass > 0.85, 'subBass energy should be high when bin 0-1 spike');
  assert.equal(subEnergies.mid, 0, 'mid energy should stay 0 when only sub-bass bins are active');
  assert.equal(subEnergies.high, 0, 'high energy should stay 0 when only sub-bass bins are active');

  const highBins = new Uint8Array(64);
  highBins.fill(220, 15, 34);
  const highEnergies = computeBandEnergies(highBins);
  assert.equal(highEnergies.subBass, 0);
  assert.equal(highEnergies.bass, 0);
  assert.ok(highEnergies.high > 0.75, 'high energy should respond to upper bins');
});

test('smoothBandEnergies snaps up fast on attack and decays smoothly', () => {
  const attacked = smoothBandEnergies(ZERO_BAND_ENERGIES, {
    subBass: 1,
    bass: 0.5,
    mid: 0,
    high: 0,
  });
  assert.ok(attacked.subBass > 0.5, 'attack should jump >50% toward peak');

  const decayed = smoothBandEnergies(attacked, ZERO_BAND_ENERGIES);
  assert.ok(decayed.subBass < attacked.subBass && decayed.subBass > 0.3);
});

test('computePropAudioTransformVars produces distinct bounce vs pulsate kinematics per prop mapping', () => {
  const vinylMapping = getPropAudioMapping('vinyl-record'); // subBass + bounce
  const clefMapping = getPropAudioMapping('treble-clef'); // mid + pulsate

  assert.equal(vinylMapping.band, 'subBass');
  assert.equal(vinylMapping.motion, 'bounce');
  assert.equal(clefMapping.band, 'mid');
  assert.equal(clefMapping.motion, 'pulsate');

  const neutral = computePropAudioTransformVars(vinylMapping, { subBass: 1, bass: 1, mid: 1, high: 1 }, false);
  assert.equal(neutral.scale, 1);
  assert.equal(neutral.bounceY, 0);

  const bassOnly = { subBass: 0.9, bass: 0.7, mid: 0, high: 0 };
  const vinylTransform = computePropAudioTransformVars(vinylMapping, bassOnly, true);
  const clefTransform = computePropAudioTransformVars(clefMapping, bassOnly, true);

  assert.ok(vinylTransform.bounceY < -10, 'sub-bass bounce prop should lift strongly on bass hit');
  assert.ok(vinylTransform.scaleY > vinylTransform.scaleX, 'bounce prop should squash & stretch vertically');
  assert.equal(clefTransform.scale, 1, 'mid-mapped prop should remain steady when only bass bins fire');
  assert.equal(clefTransform.bounceY, 0);

  const midOnly = { subBass: 0, bass: 0, mid: 0.9, high: 0 };
  const clefMidTransform = computePropAudioTransformVars(clefMapping, midOnly, true);
  assert.ok(clefMidTransform.scale > 1.2, 'mid-mapped prop should pulsate symmetrically on mid energy');
  assert.equal(clefMidTransform.scaleX, clefMidTransform.scaleY);
});
