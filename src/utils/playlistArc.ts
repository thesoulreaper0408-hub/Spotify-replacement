import type { EnergyArcType, Track } from '../types/music';

function getEnergyScore(track: Track): number {
  const bpm = track.bpm ?? (track.mood === 'Hype' ? 132 : track.mood === 'Chill' ? 86 : 110);
  const moodBonus = track.mood === 'Hype' ? 18 : track.mood === 'Groove' ? 6 : -10;
  return bpm + moodBonus;
}

/**
 * Reorders playlist tracks according to a curated Energy Arc:
 * - party-workout: Gradual warm-up -> peak high-BPM climax -> cool-down finish
 * - late-night: Descending smooth wind-down from energetic to calmest tracks
 * - rollercoaster: Alternating high-energy and chill palate-cleanser tracks
 */
export function arrangePlaylistByEnergyArc(
  tracks: Track[],
  arcType: EnergyArcType
): string[] {
  if (tracks.length <= 2) {
    return tracks.map((t) => t.id);
  }

  const asc = [...tracks].sort((a, b) => getEnergyScore(a) - getEnergyScore(b));

  if (arcType === 'late-night') {
    return [...asc].reverse().map((t) => t.id);
  }

  if (arcType === 'rollercoaster') {
    const result: Track[] = [];
    let lowIdx = 0;
    let highIdx = asc.length - 1;
    let takeHigh = true;
    while (lowIdx <= highIdx) {
      if (takeHigh) {
        result.push(asc[highIdx]);
        highIdx -= 1;
      } else {
        result.push(asc[lowIdx]);
        lowIdx += 1;
      }
      takeHigh = !takeHigh;
    }
    return result.map((t) => t.id);
  }

  // party-workout: warm-up (~65% rising) -> climax (top BPM) -> cool-down (~35% descending)
  const cooldownCount = Math.max(1, Math.floor(asc.length * 0.3));
  const peak = asc[asc.length - 1];
  const rest = asc.slice(0, asc.length - 1);

  const warmup: Track[] = [];
  const cooldown: Track[] = [];
  // Distribute remaining tracks so higher-mid tracks lead into peak & softer tracks cool down
  for (let i = 0; i < rest.length; i += 1) {
    if (i < cooldownCount) {
      cooldown.push(rest[rest.length - 1 - i]);
    }
  }
  const usedIds = new Set(cooldown.map((t) => t.id));
  for (const item of rest) {
    if (!usedIds.has(item.id)) {
      warmup.push(item);
    }
  }

  // Sort warmup ascending and cooldown descending so the arc peaks cleanly and tapers off
  warmup.sort((a, b) => getEnergyScore(a) - getEnergyScore(b));
  cooldown.sort((a, b) => getEnergyScore(b) - getEnergyScore(a));

  return [...warmup, peak, ...cooldown].map((t) => t.id);
}
