const SETTINGS_STORAGE_KEY = 'gravityGolfSettings:v1';

export const SETTINGS_DEFAULTS = {
  masterVolume: 0.8,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  musicMood: 'drift',
  screenShake: 'subtle',
  trailStyle: 'comet',
  aimPreview: 'hint',
  ghostEnabled: true,
  slowMoEnabled: true,
  flairEnabled: true,
  reducedMotion: false,
};

const VALID_CHOICES = {
  musicMood: ['drift', 'pulse'],
  screenShake: ['off', 'subtle', 'full'],
  trailStyle: ['comet', 'plasma'],
  aimPreview: ['off', 'hint', 'full'],
};

let settings = null;
const listeners = new Set();

function sanitize(raw) {
  const next = { ...SETTINGS_DEFAULTS };
  if (!raw || typeof raw !== 'object') {
    return next;
  }

  Object.keys(SETTINGS_DEFAULTS).forEach((key) => {
    const value = raw[key];
    const fallback = SETTINGS_DEFAULTS[key];
    if (typeof fallback === 'number') {
      if (Number.isFinite(value)) {
        next[key] = Math.min(1, Math.max(0, value));
      }
    } else if (typeof fallback === 'boolean') {
      if (typeof value === 'boolean') {
        next[key] = value;
      }
    } else if (VALID_CHOICES[key]) {
      if (VALID_CHOICES[key].includes(value)) {
        next[key] = value;
      }
    }
  });
  return next;
}

export function getSettings() {
  if (!settings) {
    let raw = null;
    try {
      raw = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
    } catch {
      raw = null;
    }
    settings = sanitize(raw);
  }
  return settings;
}

export function updateSettings(patch) {
  const next = sanitize({ ...getSettings(), ...patch });
  settings = next;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable; keep the in-memory settings for this session.
  }
  listeners.forEach((listener) => listener(next));
  return next;
}

export function onSettingsChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function motionEnabled() {
  return !getSettings().reducedMotion;
}
