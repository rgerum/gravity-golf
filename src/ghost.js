// Best-run ghost recording, storage, and playback for Gravity Golf.
// Pure data/logic + localStorage; no rendering concerns.

const STORAGE_KEY = 'gravityGolfGhosts:v1';
const ENCODING_VERSION = 1;
const MAX_SAMPLES = 4000;
const BASE_MIN_DT = 1 / 20;
const TIME_TICK = 0.02;
const POSITION_TICK = 0.005;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
const EPSILON = 1e-9;

// Module-level cache: mirrors localStorage when available, otherwise acts as
// the in-memory fallback so the current session keeps working.
let storeCache = null;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function readRawStore() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage.getItem(STORAGE_KEY);
    }
  } catch (error) {
    // Privacy mode / blocked storage: fall through to in-memory store.
  }
  return null;
}

function loadStore() {
  if (storeCache) {
    return storeCache;
  }
  let parsed = null;
  const raw = readRawStore();
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      parsed = null;
    }
  }
  storeCache =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  return storeCache;
}

function persistStore(store) {
  storeCache = store;
  let json;
  try {
    json = JSON.stringify(store);
  } catch (error) {
    return;
  }
  while (json.length > MAX_TOTAL_BYTES) {
    const evicted = evictOldestRun(store);
    if (!evicted) {
      break;
    }
    json = JSON.stringify(store);
  }
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(STORAGE_KEY, json);
    }
  } catch (error) {
    // Quota exceeded / privacy mode: keep the in-memory copy and move on.
  }
}

function evictOldestRun(store) {
  let oldestKey = null;
  let oldestTime = Infinity;
  for (const key of Object.keys(store)) {
    const recordedAt = store[key] && store[key].recordedAt;
    const time = isFiniteNumber(recordedAt) ? recordedAt : 0;
    if (time < oldestTime) {
      oldestTime = time;
      oldestKey = key;
    }
  }
  if (oldestKey === null) {
    return false;
  }
  delete store[oldestKey];
  return true;
}

function decimateKeepingEnds(samples) {
  if (samples.length <= 2) {
    return samples.slice();
  }
  const kept = [];
  const lastIndex = samples.length - 1;
  for (let i = 0; i < samples.length; i += 1) {
    if (i === 0 || i === lastIndex || i % 2 === 0) {
      kept.push(samples[i]);
    }
  }
  return kept;
}

export function createRunRecorder(levelId) {
  let samples = [];
  let minDt = BASE_MIN_DT;

  return {
    get levelId() {
      return levelId;
    },
    get sampleCount() {
      return samples.length;
    },
    get minDt() {
      return minDt;
    },
    addSample(t, x, y) {
      if (!isFiniteNumber(t) || !isFiniteNumber(x) || !isFiniteNumber(y)) {
        return false;
      }
      const last = samples[samples.length - 1];
      if (last) {
        if (t <= last.t + EPSILON) {
          return false;
        }
        if (t - last.t < minDt - EPSILON) {
          return false;
        }
      }
      if (samples.length >= MAX_SAMPLES) {
        samples = decimateKeepingEnds(samples);
        minDt *= 2;
      }
      samples.push({ t, x, y });
      return true;
    },
    finalize(meta = {}) {
      const launches = isFiniteNumber(meta.launches) ? meta.launches : 0;
      const flightTime = isFiniteNumber(meta.flightTime) ? meta.flightTime : 0;
      return {
        levelId,
        launches,
        flightTime,
        recordedAt: Date.now(),
        samples: samples.map((sample) => ({
          t: sample.t,
          x: sample.x,
          y: sample.y,
        })),
      };
    },
  };
}

function encodeRun(run) {
  const samples = run.samples;
  const dt = [];
  const dx = [];
  const dy = [];
  let t0 = 0;
  let x0 = 0;
  let y0 = 0;
  let prevT = 0;
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const qt = Math.round(samples[i].t / TIME_TICK);
    const qx = Math.round(samples[i].x / POSITION_TICK);
    const qy = Math.round(samples[i].y / POSITION_TICK);
    if (i === 0) {
      t0 = qt;
      x0 = qx;
      y0 = qy;
    } else {
      dt.push(qt - prevT);
      dx.push(qx - prevX);
      dy.push(qy - prevY);
    }
    prevT = qt;
    prevX = qx;
    prevY = qy;
  }
  return {
    v: ENCODING_VERSION,
    launches: run.launches,
    flightTime: run.flightTime,
    recordedAt: run.recordedAt,
    n: samples.length,
    t0,
    x0,
    y0,
    dt,
    dx,
    dy,
  };
}

function isIntArray(value, length) {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every((item) => Number.isInteger(item))
  );
}

function decodeRun(encoded, levelId) {
  if (!encoded || typeof encoded !== 'object' || encoded.v !== ENCODING_VERSION) {
    return null;
  }
  const n = encoded.n;
  if (!Number.isInteger(n) || n < 0) {
    return null;
  }
  const deltaCount = Math.max(0, n - 1);
  if (
    !isIntArray(encoded.dt, deltaCount) ||
    !isIntArray(encoded.dx, deltaCount) ||
    !isIntArray(encoded.dy, deltaCount)
  ) {
    return null;
  }
  if (
    n > 0 &&
    (!Number.isInteger(encoded.t0) ||
      !Number.isInteger(encoded.x0) ||
      !Number.isInteger(encoded.y0))
  ) {
    return null;
  }
  const samples = [];
  let qt = encoded.t0;
  let qx = encoded.x0;
  let qy = encoded.y0;
  for (let i = 0; i < n; i += 1) {
    if (i > 0) {
      qt += encoded.dt[i - 1];
      qx += encoded.dx[i - 1];
      qy += encoded.dy[i - 1];
    }
    samples.push({
      t: qt * TIME_TICK,
      x: qx * POSITION_TICK,
      y: qy * POSITION_TICK,
    });
  }
  return {
    levelId,
    launches: isFiniteNumber(encoded.launches) ? encoded.launches : 0,
    flightTime: isFiniteNumber(encoded.flightTime) ? encoded.flightTime : 0,
    recordedAt: isFiniteNumber(encoded.recordedAt) ? encoded.recordedAt : 0,
    samples,
  };
}

function isValidRun(run) {
  return (
    run &&
    typeof run === 'object' &&
    Array.isArray(run.samples) &&
    run.samples.length > 0 &&
    run.samples.every(
      (sample) =>
        sample &&
        isFiniteNumber(sample.t) &&
        isFiniteNumber(sample.x) &&
        isFiniteNumber(sample.y)
    )
  );
}

function isImprovement(candidate, best) {
  if (!best) {
    return true;
  }
  if (candidate.launches !== best.launches) {
    return candidate.launches < best.launches;
  }
  return candidate.flightTime < best.flightTime;
}

export function getBestRun(levelId) {
  const store = loadStore();
  const encoded = store[String(levelId)];
  if (!encoded) {
    return null;
  }
  const decoded = decodeRun(encoded, levelId);
  if (!decoded) {
    // Corrupted entry: drop it so it cannot break future reads.
    delete store[String(levelId)];
    persistStore(store);
    return null;
  }
  return decoded;
}

export function considerRun(levelId, run) {
  const best = getBestRun(levelId);
  if (!isValidRun(run)) {
    return { improved: false, best };
  }
  const candidate = {
    launches: isFiniteNumber(run.launches) ? run.launches : 0,
    flightTime: isFiniteNumber(run.flightTime) ? run.flightTime : 0,
    recordedAt: isFiniteNumber(run.recordedAt) ? run.recordedAt : Date.now(),
    samples: run.samples,
  };
  if (!isImprovement(candidate, best)) {
    return { improved: false, best };
  }
  const store = loadStore();
  store[String(levelId)] = encodeRun(candidate);
  persistStore(store);
  return { improved: true, best: getBestRun(levelId) };
}

export function clearBestRun(levelId) {
  const store = loadStore();
  if (Object.prototype.hasOwnProperty.call(store, String(levelId))) {
    delete store[String(levelId)];
    persistStore(store);
  }
}

export function createGhostPlayer(run) {
  const source = run && Array.isArray(run.samples) ? run.samples : [];
  const ts = [];
  const xs = [];
  const ys = [];
  for (const sample of source) {
    if (
      sample &&
      isFiniteNumber(sample.t) &&
      isFiniteNumber(sample.x) &&
      isFiniteNumber(sample.y)
    ) {
      ts.push(sample.t);
      xs.push(sample.x);
      ys.push(sample.y);
    }
  }
  const count = ts.length;
  const duration = count > 0 ? ts[count - 1] : 0;

  return {
    duration,
    positionAt(t) {
      if (count === 0 || !isFiniteNumber(t)) {
        return count === 0 ? null : { x: xs[0], y: ys[0] };
      }
      if (t <= ts[0]) {
        return { x: xs[0], y: ys[0] };
      }
      if (t >= ts[count - 1]) {
        return { x: xs[count - 1], y: ys[count - 1] };
      }
      // Binary search: rightmost index with ts[lo] <= t.
      let lo = 0;
      let hi = count - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (ts[mid] <= t) {
          lo = mid;
        } else {
          hi = mid - 1;
        }
      }
      const span = ts[lo + 1] - ts[lo];
      const f = span > 0 ? (t - ts[lo]) / span : 0;
      return {
        x: xs[lo] + (xs[lo + 1] - xs[lo]) * f,
        y: ys[lo] + (ys[lo + 1] - ys[lo]) * f,
      };
    },
  };
}

export function getGhostStorageInfo() {
  const store = loadStore();
  let approxBytes = 0;
  try {
    approxBytes = JSON.stringify(store).length;
  } catch (error) {
    approxBytes = 0;
  }
  return {
    levels: Object.keys(store).length,
    approxBytes,
  };
}
