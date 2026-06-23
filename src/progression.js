const LEVEL_BEST_STORAGE_KEY = 'gravityGolfLevelBests:v1';

export const MEDAL_TIERS = ['bronze', 'silver', 'gold', 'ace'];

const MEDAL_RANK = {
  bronze: 0,
  silver: 1,
  gold: 2,
  ace: 3,
};

const MEDAL_EMOJI = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  ace: '🌟',
};

const MEDAL_LABEL = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  ace: 'Ace Star',
};

let levelBestsCache = null;

export function getLevelPar(level) {
  const presetCount = Array.isArray(level?.launchPresets) ? level.launchPresets.length : 0;
  return Math.max(1, presetCount);
}

export function getGolfResultName(par, launches) {
  if (!Number.isFinite(launches) || launches <= 0) {
    return '';
  }

  if (launches === 1 && par > 1) {
    return 'Ace';
  }

  const diff = launches - par;
  if (diff <= -2) {
    return 'Eagle';
  }
  if (diff === -1) {
    return 'Birdie';
  }
  if (diff === 0) {
    return par === 1 && launches === 1 ? 'Hole in One' : 'Par';
  }
  if (diff === 1) {
    return 'Bogey';
  }
  if (diff === 2) {
    return 'Double Bogey';
  }
  return `+${diff} Over`;
}

export function formatRelativeToPar(par, launches) {
  const diff = launches - par;
  if (diff === 0) {
    return 'E';
  }
  return diff > 0 ? `+${diff}` : `${diff}`;
}

export function computeMedalTier(par, launches) {
  if (!Number.isFinite(launches) || launches <= 0) {
    return null;
  }

  if (launches < par || (launches === 1 && par > 1)) {
    return 'ace';
  }
  if (launches <= par) {
    return 'gold';
  }
  if (launches <= par + 1) {
    return 'silver';
  }
  return 'bronze';
}

export function medalEmoji(tier) {
  return MEDAL_EMOJI[tier] ?? '';
}

export function medalLabel(tier) {
  return MEDAL_LABEL[tier] ?? '';
}

export function medalRank(tier) {
  return MEDAL_RANK[tier] ?? -1;
}

function readLevelBests() {
  if (levelBestsCache) {
    return levelBestsCache;
  }

  try {
    const raw = window.localStorage.getItem(LEVEL_BEST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    levelBestsCache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    levelBestsCache = {};
  }

  return levelBestsCache;
}

function persistLevelBests() {
  try {
    window.localStorage.setItem(LEVEL_BEST_STORAGE_KEY, JSON.stringify(readLevelBests()));
  } catch {
    // Storage may be unavailable (private mode, quota); keep the in-memory copy.
  }
}

export function getLevelBest(levelId) {
  const best = readLevelBests()[levelId];
  return best && typeof best === 'object' ? best : null;
}

export function recordLevelResult(levelId, { par, launches, retries = 0, flightTime = 0 }) {
  const medal = computeMedalTier(par, launches);
  const golfName = getGolfResultName(par, launches);
  const previous = getLevelBest(levelId);
  const firstClear = !previous;
  const improved = firstClear
    || launches < previous.launches
    || (launches === previous.launches && flightTime < previous.flightTime);

  if (improved) {
    const bests = readLevelBests();
    bests[levelId] = {
      par,
      launches,
      retries,
      flightTime: Math.round(flightTime * 100) / 100,
      medal: previous && medalRank(previous.medal) > medalRank(medal) ? previous.medal : medal,
      updatedAt: Date.now(),
    };
    persistLevelBests();
  } else if (previous && medalRank(medal) > medalRank(previous.medal)) {
    const bests = readLevelBests();
    bests[levelId] = { ...previous, medal, updatedAt: Date.now() };
    persistLevelBests();
  }

  return {
    medal,
    golfName,
    diff: launches - par,
    firstClear,
    improved,
    best: getLevelBest(levelId),
  };
}

export function getMedalTally(levelIds) {
  const tally = { ace: 0, gold: 0, silver: 0, bronze: 0, cleared: 0 };
  levelIds.forEach((levelId) => {
    const best = getLevelBest(levelId);
    if (!best) {
      return;
    }
    tally.cleared += 1;
    if (tally[best.medal] !== undefined) {
      tally[best.medal] += 1;
    }
  });
  return tally;
}

const PAR_STREAK_STORAGE_KEY = 'gravityGolfParStreak:v1';

let parStreakCache = null;

function readParStreak() {
  if (!parStreakCache) {
    try {
      const raw = JSON.parse(window.localStorage.getItem(PAR_STREAK_STORAGE_KEY));
      parStreakCache = {
        current: Number.isInteger(raw?.current) && raw.current >= 0 ? raw.current : 0,
        best: Number.isInteger(raw?.best) && raw.best >= 0 ? raw.best : 0,
      };
    } catch {
      parStreakCache = { current: 0, best: 0 };
    }
  }
  return parStreakCache;
}

export function getParStreak() {
  return { ...readParStreak() };
}

export function recordParStreakResult(diff) {
  const streak = readParStreak();
  streak.current = diff <= 0 ? streak.current + 1 : 0;
  streak.best = Math.max(streak.best, streak.current);
  try {
    window.localStorage.setItem(PAR_STREAK_STORAGE_KEY, JSON.stringify(streak));
  } catch {
    // Storage unavailable; streak survives in memory for this session.
  }
  return { ...streak };
}

function holeEmoji(par, launches) {
  if (!Number.isFinite(launches) || launches <= 0) {
    return '⬛';
  }
  const diff = launches - par;
  if (diff < 0 || (launches === 1 && par > 1)) {
    return '🌟';
  }
  if (diff === 0) {
    return '🟢';
  }
  if (diff === 1) {
    return '🟡';
  }
  return '🔴';
}

export function buildDailyShareText({ dateKey, holes, totalLaunches, totalPar, percentile, rank }) {
  const grid = holes.map((hole) => holeEmoji(hole.par, hole.launches)).join('');
  const relative = formatRelativeToPar(totalPar, totalLaunches);
  const lines = [
    `Gravity Golf · Daily Orbit ${dateKey}`,
    `${grid}  ${totalLaunches} launches (${relative})`,
  ];
  if (Number.isFinite(rank) && rank !== null) {
    lines.push(`Rank #${rank}${Number.isFinite(percentile) ? ` · beat ${percentile}%` : ''}`);
  } else if (Number.isFinite(percentile)) {
    lines.push(`Beat ${percentile}% of pilots`);
  }
  lines.push('https://gravity-golf.vercel.app');
  return lines.join('\n');
}
