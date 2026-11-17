import type {
  ListeningSessionEvent,
  LyricLine,
  Playlist,
  RecapCapsule,
  Track,
} from '../types/music';
import { analyzeMonoAudioData } from './audioEngine';
import { computeCoverSeed } from './audioParser';
import { parseLrc } from './lrcParser';

type WaveKind = 'warm-pad' | 'chiptune' | 'synth-bass' | 'pluck' | 'electric-piano';

interface DemoTrackSeed {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  liked: boolean;
  wave: WaveKind;
  notes: number[];
  bpm: number;
  playCount: number;
  addedAt: number;
  daysSinceLastPlayed?: number;
  pin?: { time: number; label: string };
  note?: { text: string; date: string };
  lrc?: string;
}

const DEMO_TRACK_SEEDS: DemoTrackSeed[] = [
  {
    id: 'demo-1',
    title: 'Velvet Evening',
    artist: 'Mira & The Tape Loop',
    album: 'Late Night Sessions',
    duration: 24,
    liked: true,
    wave: 'warm-pad',
    notes: [220, 261.63, 329.63, 392.0, 293.66, 349.23, 440.0, 329.63],
    bpm: 92,
    playCount: 12,
    addedAt: 1731700000000,
    daysSinceLastPlayed: 1,
    pin: { time: 8.0, label: 'Velvet Chorus' },
    note: { text: 'Late-night coding anthem', date: '2026-11-02' },
    lrc: `
[00:00.50]Soft analog hum warms up the evening room
[00:04.20]Streetlights drift across the studio window
[00:08.00]Tape reels turning slow beneath the velvet haze
[00:12.00]Hold the chord and let the night unwind
[00:16.40]Echoes settle gently in the cedar dust
[00:20.20]Fade out softly till the morning glow
`,
  },
  {
    id: 'demo-2',
    title: 'Starlight Cartridge',
    artist: 'Bitshift Arcade',
    album: '8-Bit Dreams',
    duration: 20,
    liked: true,
    wave: 'chiptune',
    notes: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23],
    bpm: 132,
    playCount: 19,
    addedAt: 1731701000000,
    daysSinceLastPlayed: 0,
    pin: { time: 6.5, label: 'Arp Solo' },
    lrc: `
[00:00.30]Insert cartridge, power light turns cyan
[00:03.80]Jumping pixel clouds above the harbor stage
[00:07.60]Arpeggios climbing to the final boss sky
[00:11.50]Collect every star before the timer hits zero
[00:15.50]High score flashing on the CRT screen
`,
  },
  {
    id: 'demo-3',
    title: 'Saturday Panel Beat',
    artist: 'Ink & Halftone',
    album: 'Sunday Funnies EP',
    duration: 22,
    liked: false,
    wave: 'pluck',
    notes: [196.0, 246.94, 293.66, 392.0, 329.63, 293.66, 246.94, 220.0],
    bpm: 112,
    playCount: 7,
    addedAt: 1731702000000,
    daysSinceLastPlayed: 4,
    pin: { time: 10.0, label: 'Groove Pocket' },
  },
  {
    id: 'demo-4',
    title: 'Chrome Raindrive',
    artist: 'Kuroda Pulse',
    album: 'Sector 09',
    duration: 26,
    liked: false,
    wave: 'synth-bass',
    notes: [110.0, 110.0, 130.81, 146.83, 164.81, 146.83, 130.81, 98.0],
    bpm: 124,
    playCount: 15,
    addedAt: 1731703000000,
    daysSinceLastPlayed: 0,
    pin: { time: 8.5, label: 'Beat Drop' },
    note: { text: 'Midnight highway drive mix', date: '2026-10-28' },
    lrc: `
[00:00.40]Raindrops streak the neon overpass
[00:04.80]Sub-bass vibrating through Sector 09
[00:09.60]Headlights slicing through violet mist
[00:14.40]Telemetry locked on the midnight expressway
[00:19.50]Signal clears past the outer skyline grid
`,
  },
  {
    id: 'demo-5',
    title: 'Tea on Graph Paper',
    artist: 'Julian Morrow',
    album: 'Desk Sketches',
    duration: 24,
    liked: true,
    wave: 'electric-piano',
    notes: [293.66, 369.99, 440.0, 587.33, 493.88, 440.0, 369.99, 329.63],
    bpm: 84,
    playCount: 9,
    addedAt: 1731704000000,
    daysSinceLastPlayed: 11,
    pin: { time: 11.0, label: 'Bridge Chords' },
  },
  {
    id: 'demo-6',
    title: 'Dusty Attic Reel',
    artist: 'Mira & The Tape Loop',
    album: 'Late Night Sessions',
    duration: 21,
    liked: false,
    wave: 'warm-pad',
    notes: [174.61, 220.0, 261.63, 329.63, 293.66, 261.63, 220.0, 196.0],
    bpm: 88,
    playCount: 0,
    addedAt: 1730900000000,
  },
];

function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function synthesizeDemoWav(seed: DemoTrackSeed): {
  url: string;
  samples: Float32Array;
  sampleRate: number;
  byteLength: number;
} {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * seed.duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const floatSamples = new Float32Array(numSamples);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const beatDuration = 60 / seed.bpm;
  const noteCount = seed.notes.length;

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const step = Math.floor(t / beatDuration);
    const localT = t - step * beatDuration;
    const freq = seed.notes[step % noteCount];
    const fifthFreq = freq * 1.498;
    const subFreq = freq * 0.5;

    const attack = Math.min(1, localT / 0.025);
    const decay = Math.exp(-localT * (seed.wave === 'pluck' ? 6.5 : 2.6));
    const env = attack * decay;

    const trackFade =
      Math.min(1, t / 0.35) * Math.min(1, (seed.duration - t) / 0.6);

    let sample = 0;
    if (seed.wave === 'chiptune') {
      const sq = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.55 : -0.55;
      const arp = Math.sin(2 * Math.PI * fifthFreq * t) >= 0 ? 0.25 : -0.25;
      sample = (sq + arp) * env * 0.28;
    } else if (seed.wave === 'synth-bass') {
      const saw = 2 * ((t * freq) % 1) - 1;
      const sub = Math.sin(2 * Math.PI * subFreq * t);
      const lead = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.25;
      sample = (saw * 0.38 + sub * 0.45 + lead) * env * 0.34;
    } else if (seed.wave === 'pluck') {
      const tri = 2 * Math.abs(2 * ((t * freq) % 1) - 1) - 1;
      const harm = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.3;
      sample = (tri * 0.65 + harm) * env * 0.35;
    } else if (seed.wave === 'electric-piano') {
      const fundamental = Math.sin(2 * Math.PI * freq * t);
      const bell = Math.sin(2 * Math.PI * (freq * 3) * t) * Math.exp(-localT * 11) * 0.28;
      const pad = Math.sin(2 * Math.PI * fifthFreq * t) * 0.22;
      sample = (fundamental * 0.65 + bell + pad) * env * 0.36;
    } else {
      const osc1 = Math.sin(2 * Math.PI * freq * t);
      const osc2 = Math.sin(2 * Math.PI * (freq * 1.003) * t);
      const fifth = Math.sin(2 * Math.PI * fifthFreq * t) * 0.3;
      sample = ((osc1 + osc2) * 0.4 + fifth) * (0.35 + 0.65 * env) * 0.32;
    }

    const clamped = Math.max(-0.95, Math.min(0.95, sample * trackFade));
    floatSamples[i] = clamped;
    view.setInt16(44 + i * 2, Math.floor(clamped * 32767), true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return {
    url: URL.createObjectURL(blob),
    samples: floatSamples,
    sampleRate,
    byteLength: buffer.byteLength,
  };
}

export function createInitialDemoTracks(): Track[] {
  const now = Date.now();
  return DEMO_TRACK_SEEDS.map((seed) => {
    const lyrics: LyricLine[] | undefined = seed.lrc ? parseLrc(seed.lrc) : undefined;
    const synth = synthesizeDemoWav(seed);
    const analysis = analyzeMonoAudioData(synth.samples, synth.sampleRate);
    const mood = seed.bpm >= 122 ? 'Hype' : seed.bpm <= 96 ? 'Chill' : 'Groove';

    return {
      id: seed.id,
      title: seed.title,
      artist: seed.artist,
      album: seed.album,
      duration: seed.duration,
      src: synth.url,
      isLocal: false,
      liked: seed.liked,
      coverSeed: computeCoverSeed(`${seed.title}-${seed.artist}`),
      playCount: seed.playCount,
      addedAt: seed.addedAt,
      lyrics,
      bpm: seed.bpm,
      mood,
      rmsLoudness: analysis.rmsLoudness,
      replayGain: analysis.replayGain,
      trimStart: analysis.trimStart,
      trimEnd: analysis.trimEnd,
      waveformPeaks: analysis.waveformPeaks,
      fileSizeBytes: synth.byteLength,
      sampleRate: synth.sampleRate,
      lastPlayedAt:
        seed.daysSinceLastPlayed !== undefined
          ? now - seed.daysSinceLastPlayed * 24 * 60 * 60 * 1000
          : undefined,
      pinnedMoments: seed.pin
        ? [
            {
              id: `pin-${seed.id}`,
              time: seed.pin.time,
              label: seed.pin.label,
              createdAt: seed.addedAt + 1000,
            },
          ]
        : [],
      note: seed.note?.text,
      noteDate: seed.note?.date,
    };
  });
}

export function createInitialPlaylists(): Playlist[] {
  return [
    {
      id: 'pl-focus',
      name: 'Late Night Focus',
      description: 'Warm analog pads and electric piano sketches for deep work.',
      trackIds: ['demo-1', 'demo-3', 'demo-4', 'demo-5', 'demo-6'],
      createdAt: 1730000000000,
    },
    {
      id: 'pl-arcade',
      name: 'Arcade & Neon',
      description: 'Upbeat chiptune arpeggios and synthwave basslines.',
      trackIds: ['demo-2', 'demo-4'],
      createdAt: 1730000060000,
    },
  ];
}

export function createSeedListeningHistory(now = new Date()): ListeningSessionEvent[] {
  const events: ListeningSessionEvent[] = [];
  const samplePool: Array<{
    id: string;
    title: string;
    artist: string;
    mood: 'Chill' | 'Groove' | 'Hype';
    bpm: number;
    dur: number;
  }> = [
    { id: 'demo-2', title: 'Starlight Cartridge', artist: 'Bitshift Arcade', mood: 'Hype', bpm: 132, dur: 195 },
    { id: 'demo-4', title: 'Chrome Raindrive', artist: 'Kuroda Pulse', mood: 'Hype', bpm: 124, dur: 220 },
    { id: 'demo-1', title: 'Velvet Evening', artist: 'Mira & The Tape Loop', mood: 'Chill', bpm: 92, dur: 240 },
    { id: 'demo-3', title: 'Saturday Panel Beat', artist: 'Ink & Halftone', mood: 'Groove', bpm: 112, dur: 185 },
    { id: 'demo-5', title: 'Tea on Graph Paper', artist: 'Julian Morrow', mood: 'Chill', bpm: 84, dur: 210 },
  ];

  // Populate active days across current month & trailing streak
  const dayOffsets = [0, 1, 2, 3, 5, 7, 9, 10, 12, 14];
  dayOffsets.forEach((offset, idx) => {
    const dayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      Math.max(1, now.getDate() - offset),
      21 - (idx % 4),
      15
    );
    const sessions = 2 + (idx % 3);
    for (let s = 0; s < sessions; s += 1) {
      const pick = samplePool[(idx + s) % samplePool.length];
      events.push({
        id: `seed-ev-${offset}-${s}`,
        trackId: pick.id,
        trackTitle: pick.title,
        artistName: pick.artist,
        timestamp: dayDate.getTime() + s * 240000,
        durationSeconds: pick.dur,
        mood: pick.mood,
        bpm: pick.bpm,
      });
    }
  });

  return events;
}

export function createSeedRecapVault(now = new Date()): RecapCapsule[] {
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 6);
  const twoMonthsDate = new Date(now.getFullYear(), now.getMonth() - 2, 6);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return [
    {
      id: `monthly-${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-06`,
      kind: 'monthly',
      dateKey: `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-06`,
      label: `${monthNames[prevMonthDate.getMonth()]} ${prevMonthDate.getFullYear()} Sound Capsule`,
      year: prevMonthDate.getFullYear(),
      monthIndex: prevMonthDate.getMonth(),
      totalMinutes: 318,
      totalPlays: 47,
      topTracks: [
        { id: 'demo-2', title: 'Starlight Cartridge', artist: 'Bitshift Arcade', plays: 16 },
        { id: 'demo-4', title: 'Chrome Raindrive', artist: 'Kuroda Pulse', plays: 13 },
        { id: 'demo-1', title: 'Velvet Evening', artist: 'Mira & The Tape Loop', plays: 10 },
      ],
      topArtist: { name: 'Mira & The Tape Loop', plays: 18 },
      peakTimeOfDay: 'Evening',
      dominantMood: 'Hype',
      averageBpm: 118,
    },
    {
      id: `monthly-${twoMonthsDate.getFullYear()}-${String(twoMonthsDate.getMonth() + 1).padStart(2, '0')}-06`,
      kind: 'monthly',
      dateKey: `${twoMonthsDate.getFullYear()}-${String(twoMonthsDate.getMonth() + 1).padStart(2, '0')}-06`,
      label: `${monthNames[twoMonthsDate.getMonth()]} ${twoMonthsDate.getFullYear()} Sound Capsule`,
      year: twoMonthsDate.getFullYear(),
      monthIndex: twoMonthsDate.getMonth(),
      totalMinutes: 246,
      totalPlays: 34,
      topTracks: [
        { id: 'demo-1', title: 'Velvet Evening', artist: 'Mira & The Tape Loop', plays: 14 },
        { id: 'demo-5', title: 'Tea on Graph Paper', artist: 'Julian Morrow', plays: 11 },
        { id: 'demo-3', title: 'Saturday Panel Beat', artist: 'Ink & Halftone', plays: 9 },
      ],
      topArtist: { name: 'Julian Morrow', plays: 14 },
      peakTimeOfDay: 'Late Night',
      dominantMood: 'Chill',
      averageBpm: 94,
    },
  ];
}

