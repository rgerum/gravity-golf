const DAILY_STORAGE_KEY = 'gravityGolfDaily:v1';
export const DAILY_HOLE_COUNT = 3;

export function getDailyDateKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One hole from the early worlds, one from the mid worlds, one from the late
// worlds, so every daily round ramps in difficulty.
export function pickDailyLevelIndices(dateKey, totalLevels, worldSize) {
  const random = createSeededRandom(hashString(`gravity-golf-daily:${dateKey}`));
  const worldCount = Math.max(1, Math.floor(totalLevels / worldSize));
  const bandSize = worldCount / DAILY_HOLE_COUNT;
  const indices = [];
  for (let holeIndex = 0; holeIndex < DAILY_HOLE_COUNT; holeIndex += 1) {
    const worldStart = Math.floor(holeIndex * bandSize);
    const worldEnd = Math.max(worldStart + 1, Math.floor((holeIndex + 1) * bandSize));
    const worldIndex = worldStart + Math.floor(random() * (worldEnd - worldStart));
    const levelInWorld = Math.floor(random() * worldSize);
    indices.push(Math.min(totalLevels - 1, worldIndex * worldSize + levelInWorld));
  }
  return indices;
}

export function calculateDailyScore({ launches, retries, flightTime }) {
  return Math.round(
    Math.max(0, launches) * 100
    + Math.max(0, retries) * 45
    + Math.max(0, flightTime) * 2,
  );
}

export function readDailyProgress(dateKey) {
  try {
    const raw = window.localStorage.getItem(DAILY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object' && parsed.dateKey === dateKey) {
      return parsed;
    }
  } catch {
    // Corrupt or unavailable storage counts as no progress.
  }
  return null;
}

export function persistDailyProgress(progress) {
  try {
    window.localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable; daily progress only lives for this session.
  }
}
