import type {
  ListeningSessionEvent,
  MoodTag,
  RecapCapsule,
  Track,
} from '../types/music';

export interface CalendarDayCell {
  dateKey: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
  totalMinutes: number;
  playCount: number;
  dominantMood: MoodTag | null;
  topTrackTitle?: string;
}

export interface ListeningCalendarData {
  monthLabel: string;
  year: number;
  monthIndex: number;
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
  days: CalendarDayCell[];
}

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks whether the current calendar date qualifies for an automatic recap popup:
 * - November 6th (monthIndex === 10 && date === 6) -> 'yearly'
 * - 6th of any other month (date === 6) -> 'monthly'
 * Honors lastShownDateKey so the user is greeted once per day on the 6th.
 */
export function checkScheduledRecapTrigger(
  now: Date,
  lastShownDateKey: string | null
): 'monthly' | 'yearly' | null {
  const todayKey = toLocalDateKey(now);
  if (lastShownDateKey === todayKey) {
    return null;
  }
  if (now.getDate() !== 6) {
    return null;
  }
  if (now.getMonth() === 10) {
    return 'yearly';
  }
  return 'monthly';
}

function getTimeOfDayBucket(
  hour: number
): 'Morning' | 'Afternoon' | 'Evening' | 'Late Night' {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 22) return 'Evening';
  return 'Late Night';
}

function deriveListenerArchetype(
  mood: MoodTag,
  peakTime: 'Morning' | 'Afternoon' | 'Evening' | 'Late Night',
  avgBpm: number
): { archetype: string; tagline: string } {
  if (peakTime === 'Late Night' && mood === 'Chill') {
    return {
      archetype: 'Midnight Analog Dreamer',
      tagline: 'You gravitate toward warm late-night textures and unhurried grooves.',
    };
  }
  if (avgBpm >= 124 || mood === 'Hype') {
    return {
      archetype: 'High-Voltage Pulse Chaser',
      tagline: 'Fast tempos, kinetic basslines, and zero-skip adrenaline fuel your deck.',
    };
  }
  if (peakTime === 'Morning') {
    return {
      archetype: 'Sunrise Crate Digger',
      tagline: 'You set the tone early with crisp melodies and balanced morning flow.',
    };
  }
  return {
    archetype: 'Precision Groove Architect',
    tagline: 'You curate cohesive mid-tempo journeys with sharp ear for rhythm.',
  };
}

function aggregateEvents(
  events: ListeningSessionEvent[],
  tracks: Track[]
): {
  totalMinutes: number;
  totalPlays: number;
  topTracks: Array<{ id: string; title: string; artist: string; plays: number }>;
  topArtist: { name: string; plays: number } | null;
  peakTimeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Late Night';
  dominantMood: MoodTag;
  averageBpm: number;
} {
  if (events.length === 0) {
    // Fallback cleanly to track library playCounts if no session events fall in window
    const sortedTracks = [...tracks].sort((a, b) => b.playCount - a.playCount);
    const totalPlays = sortedTracks.reduce((sum, t) => sum + Math.max(0, t.playCount), 0);
    const totalMinutes = Math.max(
      1,
      Math.round(
        sortedTracks.reduce(
          (sum, t) => sum + Math.max(0, t.playCount) * Math.max(20, t.duration),
          0
        ) / 60
      )
    );
    const artistMap = new Map<string, number>();
    const moodCounts = new Map<MoodTag, number>();
    let bpmSum = 0;
    let bpmWeight = 0;

    for (const t of sortedTracks) {
      const p = Math.max(1, t.playCount);
      artistMap.set(t.artist, (artistMap.get(t.artist) ?? 0) + t.playCount);
      const m = t.mood ?? 'Groove';
      moodCounts.set(m, (moodCounts.get(m) ?? 0) + p);
      bpmSum += (t.bpm ?? 112) * p;
      bpmWeight += p;
    }

    let topArtist: { name: string; plays: number } | null = null;
    for (const [name, plays] of artistMap.entries()) {
      if (!topArtist || plays > topArtist.plays) topArtist = { name, plays };
    }

    let dominantMood: MoodTag = 'Groove';
    let maxMood = -1;
    for (const [m, c] of moodCounts.entries()) {
      if (c > maxMood) {
        maxMood = c;
        dominantMood = m;
      }
    }

    return {
      totalMinutes,
      totalPlays,
      topTracks: sortedTracks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        plays: t.playCount,
      })),
      topArtist,
      peakTimeOfDay: 'Evening',
      dominantMood,
      averageBpm: bpmWeight > 0 ? Math.round(bpmSum / bpmWeight) : 112,
    };
  }

  let totalSec = 0;
  let bpmSum = 0;
  const trackCounts = new Map<string, { title: string; artist: string; plays: number }>();
  const artistCounts = new Map<string, number>();
  const timeBuckets = new Map<'Morning' | 'Afternoon' | 'Evening' | 'Late Night', number>();
  const moodCounts = new Map<MoodTag, number>();

  for (const ev of events) {
    totalSec += Math.max(15, ev.durationSeconds);
    bpmSum += ev.bpm || 112;
    const prevT = trackCounts.get(ev.trackId);
    trackCounts.set(ev.trackId, {
      title: ev.trackTitle,
      artist: ev.artistName,
      plays: (prevT?.plays ?? 0) + 1,
    });
    artistCounts.set(ev.artistName, (artistCounts.get(ev.artistName) ?? 0) + 1);
    const bucket = getTimeOfDayBucket(new Date(ev.timestamp).getHours());
    timeBuckets.set(bucket, (timeBuckets.get(bucket) ?? 0) + 1);
    moodCounts.set(ev.mood, (moodCounts.get(ev.mood) ?? 0) + 1);
  }

  const topTracks = Array.from(trackCounts.entries())
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 5);

  let topArtist: { name: string; plays: number } | null = null;
  for (const [name, plays] of artistCounts.entries()) {
    if (!topArtist || plays > topArtist.plays) topArtist = { name, plays };
  }

  let peakTimeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Late Night' = 'Evening';
  let bestBucket = -1;
  for (const [b, c] of timeBuckets.entries()) {
    if (c > bestBucket) {
      bestBucket = c;
      peakTimeOfDay = b;
    }
  }

  let dominantMood: MoodTag = 'Groove';
  let bestMood = -1;
  for (const [m, c] of moodCounts.entries()) {
    if (c > bestMood) {
      bestMood = c;
      dominantMood = m;
    }
  }

  return {
    totalMinutes: Math.max(1, Math.round(totalSec / 60)),
    totalPlays: events.length,
    topTracks,
    topArtist,
    peakTimeOfDay,
    dominantMood,
    averageBpm: Math.round(bpmSum / events.length),
  };
}

export function buildMonthlySoundCapsule(
  tracks: Track[],
  history: ListeningSessionEvent[],
  referenceDate = new Date()
): RecapCapsule {
  const cutoff = referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000;
  const recentEvents = history.filter((e) => e.timestamp >= cutoff);
  const stats = aggregateEvents(recentEvents, tracks);
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
  const monthName = monthNames[referenceDate.getMonth()];
  const dateKey = toLocalDateKey(referenceDate);

  return {
    id: `monthly-${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}-06`,
    kind: 'monthly',
    dateKey,
    label: `${monthName} ${referenceDate.getFullYear()} Sound Capsule`,
    year: referenceDate.getFullYear(),
    monthIndex: referenceDate.getMonth(),
    ...stats,
  };
}

export function buildAnnualWrappedSummary(
  tracks: Track[],
  history: ListeningSessionEvent[],
  year = new Date().getFullYear()
): RecapCapsule {
  const yearEvents = history.filter(
    (e) => new Date(e.timestamp).getFullYear() === year
  );
  const stats = aggregateEvents(yearEvents.length > 0 ? yearEvents : history, tracks);
  const { archetype, tagline } = deriveListenerArchetype(
    stats.dominantMood,
    stats.peakTimeOfDay,
    stats.averageBpm
  );
  const cal = buildListeningCalendar(history, new Date(year, 10, 6));

  return {
    id: `yearly-${year}-11-06`,
    kind: 'yearly',
    dateKey: `${year}-11-06`,
    label: `Annual Wrapped: Nov 6, ${year}`,
    year,
    monthIndex: 10,
    ...stats,
    archetype,
    archetypeTagline: tagline,
    streakDays: cal.longestStreak,
  };
}

export function buildListeningCalendar(
  history: ListeningSessionEvent[],
  referenceDate = new Date()
): ListeningCalendarData {
  const year = referenceDate.getFullYear();
  const monthIndex = referenceDate.getMonth();
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthIndex, 1));

  // Bucket all events by YYYY-MM-DD for streak + daily mood computation
  const byDay = new Map<
    string,
    {
      totalSec: number;
      plays: number;
      moods: Map<MoodTag, number>;
      tracks: Map<string, number>;
    }
  >();

  for (const ev of history) {
    const key = toLocalDateKey(new Date(ev.timestamp));
    const entry = byDay.get(key) ?? {
      totalSec: 0,
      plays: 0,
      moods: new Map<MoodTag, number>(),
      tracks: new Map<string, number>(),
    };
    entry.totalSec += Math.max(15, ev.durationSeconds);
    entry.plays += 1;
    entry.moods.set(ev.mood, (entry.moods.get(ev.mood) ?? 0) + 1);
    entry.tracks.set(ev.trackTitle, (entry.tracks.get(ev.trackTitle) ?? 0) + 1);
    byDay.set(key, entry);
  }

  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = firstDayOfMonth.getDay();

  const days: CalendarDayCell[] = [];
  for (let i = 0; i < startWeekday; i += 1) {
    const prevDate = new Date(year, monthIndex, 1 - (startWeekday - i));
    days.push({
      dateKey: toLocalDateKey(prevDate),
      dayOfMonth: prevDate.getDate(),
      inCurrentMonth: false,
      totalMinutes: 0,
      playCount: 0,
      dominantMood: null,
    });
  }

  let activeDaysCount = 0;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const cur = new Date(year, monthIndex, d);
    const key = toLocalDateKey(cur);
    const info = byDay.get(key);
    let dominantMood: MoodTag | null = null;
    let topTrackTitle: string | undefined;

    if (info && info.plays > 0) {
      activeDaysCount += 1;
      let maxM = -1;
      for (const [m, c] of info.moods.entries()) {
        if (c > maxM) {
          maxM = c;
          dominantMood = m;
        }
      }
      let maxT = -1;
      for (const [title, c] of info.tracks.entries()) {
        if (c > maxT) {
          maxT = c;
          topTrackTitle = title;
        }
      }
    }

    days.push({
      dateKey: key,
      dayOfMonth: d,
      inCurrentMonth: true,
      totalMinutes: info ? Math.max(1, Math.round(info.totalSec / 60)) : 0,
      playCount: info ? info.plays : 0,
      dominantMood,
      topTrackTitle,
    });
  }

  // Compute longest & current streaks across sorted active date keys
  const sortedKeys = Array.from(byDay.keys()).sort();
  let longestStreak = 0;
  let running = 0;
  let prevTime: number | null = null;

  for (const k of sortedKeys) {
    const [yy, mm, dd] = k.split('-').map(Number);
    const dayUtc = Date.UTC(yy, mm - 1, dd);
    if (prevTime !== null && dayUtc - prevTime === 86400000) {
      running += 1;
    } else {
      running = 1;
    }
    if (running > longestStreak) longestStreak = running;
    prevTime = dayUtc;
  }

  // Current streak ending today or yesterday
  let currentStreak = 0;
  const refKey = toLocalDateKey(referenceDate);
  const refYesterdayKey = toLocalDateKey(
    new Date(year, monthIndex, referenceDate.getDate() - 1)
  );
  let cursorDate = byDay.has(refKey)
    ? new Date(year, monthIndex, referenceDate.getDate())
    : byDay.has(refYesterdayKey)
      ? new Date(year, monthIndex, referenceDate.getDate() - 1)
      : null;

  while (cursorDate && byDay.has(toLocalDateKey(cursorDate))) {
    currentStreak += 1;
    cursorDate = new Date(
      cursorDate.getFullYear(),
      cursorDate.getMonth(),
      cursorDate.getDate() - 1
    );
  }

  return {
    monthLabel,
    year,
    monthIndex,
    currentStreak,
    longestStreak,
    activeDaysCount,
    days,
  };
}

/**
 * Finds Forgotten Gems: tracks with 0 plays or tracks not played within the last 7 days,
 * sorted with unplayed / stalest gems first.
 */
export function selectForgottenGems(
  tracks: Track[],
  nowMs = Date.now(),
  limit = 4
): Track[] {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const candidates = tracks.filter(
    (t) =>
      t.playCount === 0 ||
      !t.lastPlayedAt ||
      nowMs - t.lastPlayedAt >= sevenDaysMs
  );

  return [...candidates]
    .sort((a, b) => {
      if ((a.playCount === 0) !== (b.playCount === 0)) {
        return a.playCount === 0 ? -1 : 1;
      }
      return (a.lastPlayedAt ?? a.addedAt) - (b.lastPlayedAt ?? b.addedAt);
    })
    .slice(0, limit);
}
