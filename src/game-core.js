export const COURSE = {
  width: 24,
  height: 14,
  ballRadius: 0.28,
  goalRadius: 0.56,
  goalPullRadius: 4.6,
  goalStrength: 6.2,
  outBoundsX: 13.8,
  outBoundsY: 8.2,
};

export const MAX_DRAG_DISTANCE = 2.75;
export const BALL_HIT_RADIUS = 0.82;

const PLANET_GRAVITY_MULTIPLIER = 2.35;
const BALL_STOP_SPEED = 0.055;
const BALL_FRICTION_BASE = 0.992;
const GOAL_CAPTURE_RATIO = 0.95;
const PLANET_COLLISION_PADDING = 0.92;
const PLANET_LANDING_PADDING = 0.2;
const PLANET_RADIUS_SCALE = 0.5;
const SUN_COLLISION_RADIUS = 0.42;
const SOLAR_GRAVITY_MULTIPLIER = 5;
const SOLAR_GRAVITY_SOFTENING = 3.4;
const ORBITAL_GRAVITY_PARAMETER = 0.08;
const MOON_ORBITAL_GRAVITY_PARAMETER = 0.03;
const DEFAULT_PLANET_LANDING_SPEED = 3.2;
const LAUNCH_BASE_SPEED = 1.9;
const LAUNCH_DRAG_SPEED = 3.4;
const LAUNCH_MAX_SPEED = 11.8;
const DEFAULT_LAUNCH_PRESET = { angleDeg: 0, power: 1.8 };
const DEFAULT_START_ANGLE_DEG = 180;
const SYSTEM_LAYOUT_SCALE = 1;
let solarGravityStrength = 20;

export const LEVELS = [
  {
    id: 'inner-step',
    name: 'Inner Step',
    summary: 'You start deep in the system, and the easiest route is a clean handoff to the outer relay.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 78.3, power: 2.02 },
      { angleDeg: 0, power: 2.75 },
    ],
    start: [-1.95, -0.35],
    goal: [9.1, 1.8],
    planets: [
      { name: 'Launch One', position: [-1.45, -0.25], radius: 0.64, gravity: 7.0, falloff: 4.9, core: 0x6da8ff, glow: 0x78c2ff, landable: true, orbitSpeed: 0.14, spinSpeed: 0.12 },
      { name: 'Blue Lift', position: [1.95, 2.75], radius: 0.78, gravity: 8.4, falloff: 5.6, core: 0x74bbff, glow: 0x94dbff, landable: true, landingRadius: 1.26, orbitSpeed: 0.96, orbitEccentricity: 0.18, spinSpeed: -0.52 },
      { name: 'Outer Relay', position: [4.55, 0.8], radius: 0.88, gravity: 9.8, falloff: 6.1, core: 0xec8d64, glow: 0xffcf78, landable: true, landingRadius: 1.4, orbitSpeed: 0.06, orbitEccentricity: 0.12, spinSpeed: 0.82 },
      { name: 'Goal Ward', position: [7.15, -1.1], radius: 0.96, gravity: 11.2, falloff: 6.8, core: 0xff7d9c, glow: 0xffb1c5, landable: false, orbitSpeed: -0.03, spinSpeed: -0.04 },
    ],
  },
  {
    id: 'forked-harbor',
    name: 'Forked Harbor',
    summary: 'Two mid-system harbors are reachable, but only one gives a comfortable line to the rim.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 266.1, power: 1.29 },
      { angleDeg: 344.3, power: 2.39 },
    ],
    start: [-1.7, 1.2],
    goal: [9.2, -0.5],
    planets: [
      { name: 'Launch Two', position: [-1.35, 1.05], radius: 0.64, gravity: 7.1, falloff: 4.8, core: 0x69baff, glow: 0x7ed6ff, landable: true, orbitSpeed: -0.18, spinSpeed: 0.14 },
      { name: 'Upper Harbor', position: [1.8, 3.15], radius: 0.82, gravity: 9.0, falloff: 5.9, core: 0xf39a66, glow: 0xffcf86, landable: true, landingRadius: 1.34, orbitSpeed: 1.08, orbitEccentricity: 0.18, spinSpeed: 0.58 },
      { name: 'Lower Harbor', position: [1.8, -2.35], radius: 0.8, gravity: 9.1, falloff: 5.8, core: 0x8b85ff, glow: 0xc6beff, landable: true, landingRadius: 1.3, orbitSpeed: 0.08, orbitEccentricity: 0, spinSpeed: -0.76 },
      { name: 'Outer Gate', position: [5.05, 0.35], radius: 0.92, gravity: 10.8, falloff: 6.5, core: 0xff7fa2, glow: 0xffb8c9, landable: true, landingRadius: 1.38, orbitSpeed: 0.46, orbitEccentricity: 0.14, spinSpeed: 0.05 },
      { name: 'Rim Giant', position: [7.25, -1.55], radius: 1.0, gravity: 12.1, falloff: 7.0, core: 0xff8f74, glow: 0xffcfad, landable: false, orbitSpeed: -0.05, spinSpeed: -0.02 },
    ],
  },
  {
    id: 'counterspin-gate',
    name: 'Counterspin Gate',
    summary: 'The launch world throws you off-angle, so the puzzle is stabilizing on a relay before the outward burn.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 266.1, power: 1.29 },
      { angleDeg: 313, power: 2.39 },
    ],
    start: [-1.45, 1.55],
    goal: [9.05, -2.65],
    planets: [
      { name: 'Launch Three', position: [-1.15, 1.45], radius: 0.64, gravity: 7.4, falloff: 4.9, core: 0x78beff, glow: 0x8dd9ff, landable: true, orbitSpeed: 0.52, spinSpeed: -0.48 },
      { name: 'Brake Moon', position: [1.85, -2.15], radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0xf1a067, glow: 0xffd286, landable: true, landingRadius: 1.28, orbitSpeed: -0.06, orbitEccentricity: 0.22, spinSpeed: 0.92 },
      { name: 'Outer Runway', position: [4.55, 2.35], radius: 0.88, gravity: 9.8, falloff: 6.2, core: 0x8d7eff, glow: 0xcabfff, landable: true, landingRadius: 1.42, orbitSpeed: 0.34, orbitEccentricity: 0.12, spinSpeed: -0.1 },
      { name: 'South Giant', position: [4.15, -2.65], radius: 0.94, gravity: 11.3, falloff: 6.8, core: 0xff86a8, glow: 0xffbdd0, landable: false, orbitSpeed: -0.18, orbitEccentricity: 0.18, spinSpeed: 0.24 },
      { name: 'Goal Sentinel', position: [7.15, -0.25], radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff9a79, glow: 0xffd2b5, landable: false, orbitSpeed: 0.03, spinSpeed: -0.03 },
    ],
  },
  {
    id: 'false-periapsis',
    name: 'False Periapsis',
    summary: 'The tempting close pass is only step one; the real puzzle is turning that touch into a rim transfer.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 313, power: 0.93 },
      { angleDeg: 0, power: 2.75 },
    ],
    start: [-1.85, -1.35],
    goal: [9.3, 2.8],
    planets: [
      { name: 'Launch Four', position: [-1.55, -1.15], radius: 0.64, gravity: 7.3, falloff: 4.9, core: 0x69b6ff, glow: 0x83d7ff, landable: true, orbitSpeed: 0.1, spinSpeed: 0.08 },
      { name: 'Periapsis Core', position: [3.45, -0.4], radius: 0.82, gravity: 10.2, falloff: 5.9, core: 0xf7a96b, glow: 0xffd18f, landable: true, landingRadius: 1.34, orbitSpeed: 1.18, orbitEccentricity: 0.28, spinSpeed: -0.62 },
      { name: 'Wide Relay', position: [5.05, 2.45], radius: 0.9, gravity: 9.8, falloff: 6.3, core: 0x8e7eff, glow: 0xc1b9ff, landable: true, landingRadius: 1.44, orbitSpeed: -0.14, orbitEccentricity: 0.12, spinSpeed: 0.72 },
      { name: 'Goal Rim', position: [7.35, 0.95], radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff81a6, glow: 0xffc0cf, landable: false, orbitSpeed: 0.02, spinSpeed: -0.03 },
    ],
  },
  {
    id: 'long-transfer',
    name: 'Long Transfer',
    summary: 'The target sits far out on the rim, so one short hop is not enough unless you use the outer station.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 15.7, power: 1.66 },
      { angleDeg: 344.3, power: 2.02 },
    ],
    start: [-1.15, 1.95],
    goal: [9.55, -3.1],
    goalPullRadius: 5.2,
    goalStrength: 6.9,
    planets: [
      { name: 'Launch Moon', position: [-0.95, 1.7], radius: 0.64, gravity: 7.2, falloff: 4.8, core: 0x70bbff, glow: 0x86d8ff, landable: true, orbitSpeed: -0.24, spinSpeed: 0.18 },
      { name: 'Mid Moon', position: [3.25, 0.55], radius: 0.74, gravity: 8.8, falloff: 5.5, core: 0xf4a467, glow: 0xffd38d, landable: true, landingRadius: 1.22, orbitSpeed: 0.82, orbitEccentricity: 0.08, spinSpeed: -0.56 },
      { name: 'Outer Station', position: [5.15, -2.25], radius: 0.92, gravity: 10.1, falloff: 6.4, core: 0x8e81ff, glow: 0xc7c0ff, landable: true, landingRadius: 1.48, orbitSpeed: 0.04, orbitEccentricity: 0.15, spinSpeed: 0.68 },
      { name: 'North Giant', position: [4.95, 3.45], radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff87aa, glow: 0xffc4d2, landable: false, orbitSpeed: 0.37, orbitEccentricity: 0.1, spinSpeed: -0.18 },
      { name: 'Rim Giant', position: [7.55, 0.85], radius: 1.02, gravity: 12.2, falloff: 7.2, core: 0xff9a79, glow: 0xffd2b2, landable: false, orbitSpeed: -0.01, spinSpeed: 0.02 },
    ],
  },
  {
    id: 'halo-run',
    name: 'Halo Run',
    summary: 'A wide final system mixes short inner assists with a much longer outer relay on the rim.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 93.9, power: 2.75 },
      { angleDeg: 0, power: 2.39 },
    ],
    start: [-2.05, -2],
    goal: [9.65, 3.15],
    goalPullRadius: 5.5,
    goalStrength: 7.1,
    planets: [
      { name: 'Launch Halo', position: [-1.55, -1.8], radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x6fbfff, glow: 0x8ddfff, landable: true, orbitSpeed: 0.08, spinSpeed: 0.06 },
      { name: 'North Relay', position: [1.25, 5.05], radius: 0.84, gravity: 9.1, falloff: 5.9, core: 0xf6a76a, glow: 0xffd38d, landable: true, landingRadius: 1.36, orbitSpeed: 1.34, orbitEccentricity: 0.22, spinSpeed: -0.42 },
      { name: 'West Brake', position: [-3.25, 1.25], radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0x8e81ff, glow: 0xc8c1ff, landable: true, landingRadius: 1.24, orbitSpeed: -0.52, orbitEccentricity: 0.05, spinSpeed: 1.04 },
      { name: 'South Giant', position: [2.85, -3.15], radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff84aa, glow: 0xffc2d3, landable: false, orbitSpeed: 0.05, spinSpeed: -0.08 },
      { name: 'Outer Halo', position: [5.65, 3.35], radius: 0.92, gravity: 10.2, falloff: 6.4, core: 0x9f8dff, glow: 0xd3cbff, landable: true, landingRadius: 1.46, orbitSpeed: 0.18, orbitEccentricity: 0.14, spinSpeed: 0.44 },
      { name: 'Goal Keeper', position: [7.75, 1.15], radius: 1.04, gravity: 12.5, falloff: 7.3, core: 0xff9a74, glow: 0xffd2a8, landable: false, orbitSpeed: -0.02, spinSpeed: 0.03 },
    ],
  },
  {
    id: 'periapsis-moon',
    name: 'Periapsis Moon',
    summary: 'The outer relay now carries a moon, so the transfer window shifts while the rim shot stays familiar.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 337.0, power: 2.36 },
      { angleDeg: 0, power: 2.75 },
    ],
    start: [-1.85, -1.35],
    goal: [9.3, 2.8],
    planets: [
      { name: 'Launch Four', position: [-1.55, -1.15], radius: 0.64, gravity: 7.3, falloff: 4.9, core: 0x69b6ff, glow: 0x83d7ff, landable: true, orbitSpeed: 0.09, spinSpeed: 0.07 },
      { name: 'Periapsis Core', position: [3.45, -0.4], radius: 0.82, gravity: 10.2, falloff: 5.9, core: 0xf7a96b, glow: 0xffd18f, landable: true, landingRadius: 1.34, orbitSpeed: 1.02, orbitEccentricity: 0.24, spinSpeed: -0.58 },
      { name: 'Wide Relay', position: [5.05, 2.45], radius: 0.9, gravity: 9.8, falloff: 6.3, core: 0x8e7eff, glow: 0xc1b9ff, landable: true, landingRadius: 1.44, orbitSpeed: -0.18, orbitEccentricity: 0.12, spinSpeed: 0.84 },
      { name: 'Relay Moon', position: [5.95, 2.45], radius: 0.52, gravity: 6.5, falloff: 4.4, core: 0xb9c2cf, glow: 0xf0f4ff, landable: true, landingRadius: 0.98, orbitAround: 2, orbitSpeed: 3.4, orbitEccentricity: 0.05, spinSpeed: -1.1 },
      { name: 'Goal Rim', position: [7.35, 0.95], radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff81a6, glow: 0xffc0cf, landable: false, orbitSpeed: 0.02, spinSpeed: -0.03 },
    ],
  },
];

export function vec(x = 0, y = 0) {
  return { x, y };
}

export function cloneVec(point) {
  return { x: point.x, y: point.y };
}

export function setVec(target, source) {
  target.x = source.x;
  target.y = source.y;
  return target;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function addScaledVec(target, direction, scale) {
  target.x += direction.x * scale;
  target.y += direction.y * scale;
  return target;
}

export function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function lengthSq(vector) {
  return vector.x * vector.x + vector.y * vector.y;
}

export function length(vector) {
  return Math.hypot(vector.x, vector.y);
}

export function normalize(vector) {
  const magnitude = length(vector);
  if (magnitude < 0.000001) {
    return vec(0, 0);
  }
  return vec(vector.x / magnitude, vector.y / magnitude);
}

export function directionFromAngleDeg(angleDeg) {
  const angleRad = angleDeg * Math.PI / 180;
  return vec(Math.cos(angleRad), Math.sin(angleRad));
}

export function getSolarGravityStrength() {
  return solarGravityStrength;
}

export function setSolarGravityStrength(value) {
  solarGravityStrength = Math.max(0, Number.isFinite(value) ? value : 0);
  return solarGravityStrength;
}

function scalePointFromSun(point, sun, scale = SYSTEM_LAYOUT_SCALE) {
  return vec(
    sun.x + (point.x - sun.x) * scale,
    sun.y + (point.y - sun.y) * scale,
  );
}

function angleDegBetween(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
}

function wrapAngleRad(angle) {
  const turn = Math.PI * 2;
  return ((angle % turn) + turn) % turn;
}

function rotateVector(vector, angle) {
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  return vec(
    vector.x * cosAngle - vector.y * sinAngle,
    vector.x * sinAngle + vector.y * cosAngle,
  );
}

function solveKeplerEquation(meanAnomaly, eccentricity) {
  if (eccentricity < 0.000001) {
    return meanAnomaly;
  }

  let eccentricAnomaly = meanAnomaly;
  for (let iteration = 0; iteration < 8; iteration += 1) {
    const delta =
      (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly)
      / Math.max(0.000001, 1 - eccentricity * Math.cos(eccentricAnomaly));
    eccentricAnomaly -= delta;
    if (Math.abs(delta) < 0.000001) {
      break;
    }
  }

  return eccentricAnomaly;
}

function createOrbitDefaults(source, basePosition, orbitCenterPosition, index) {
  const radialVector = vec(
    basePosition.x - orbitCenterPosition.x,
    basePosition.y - orbitCenterPosition.y,
  );
  const radialDistance = Math.max(0.001, length(radialVector));
  const orbitEccentricity = clamp(source.orbitEccentricity ?? 0, 0, 0.72);
  const orbitRotation = source.orbitRotationDeg !== undefined
    ? source.orbitRotationDeg * Math.PI / 180
    : (
      source.orbitMeanAnomaly !== undefined
        ? Math.atan2(radialVector.y, radialVector.x) - source.orbitMeanAnomaly
        : Math.atan2(radialVector.y, radialVector.x) - (orbitEccentricity > 0 ? Math.PI : 0)
    );
  const orbitSemiMajor = source.orbitSemiMajor
    ?? source.orbitRadius
    ?? (orbitEccentricity > 0 ? radialDistance / (1 + orbitEccentricity) : radialDistance);
  const orbitSemiMinor = orbitSemiMajor * Math.sqrt(Math.max(0.000001, 1 - orbitEccentricity ** 2));
  const orbitDirection = source.orbitDirection
    ?? (source.orbitSpeed !== undefined && source.orbitSpeed < 0 ? -1 : 1);
  const authoredOrbitRate = source.orbitRate
    ?? (source.orbitSpeed !== undefined
      ? (
        source.orbitAround !== undefined
          ? 0.5 + Math.abs(source.orbitSpeed) * 0.25
          : 0.55 + Math.abs(source.orbitSpeed) * 0.55
      )
      : 1);
  const orbitalParameter = source.orbitMu
    ?? (source.orbitAround !== undefined ? MOON_ORBITAL_GRAVITY_PARAMETER : ORBITAL_GRAVITY_PARAMETER);
  const baseOrbitSpeed = source.orbitAngularSpeed
    ?? (Math.sqrt(orbitalParameter / Math.max(orbitSemiMajor ** 3, 0.001)) * authoredOrbitRate * orbitDirection);
  const orbitMeanAnomaly = source.orbitMeanAnomaly
    ?? (orbitEccentricity > 0 ? Math.PI : 0);
  return {
    orbitRadius: orbitSemiMajor,
    orbitSemiMajor,
    orbitSemiMinor,
    orbitEccentricity,
    orbitRotation,
    orbitSpeed: baseOrbitSpeed,
    orbitPhase: orbitMeanAnomaly,
  };
}

function createSpinDefaults(source, scaledRadius, index) {
  const spinDirection = source.spinDirection
    ?? (source.spinSpeed !== undefined
      ? Math.sign(source.spinSpeed) || 1
      : (index % 2 === 0 ? 1 : -1));
  const authoredSpinRate = source.spinRate
    ?? (source.spinSpeed !== undefined ? 0.45 + Math.abs(source.spinSpeed) * 0.7 : 1);
  const baseSpinSpeed = source.spinAngularSpeed
    ?? ((0.02 + 0.12 / Math.max(scaledRadius, 0.22)) * authoredSpinRate * spinDirection);
  return {
    spinSpeed: baseSpinSpeed,
  };
}

function resolveOrbitCenterIndex(source, planetsLength, planetIndex) {
  if (
    !Number.isInteger(source.orbitAround) ||
    source.orbitAround < 0 ||
    source.orbitAround >= planetsLength ||
    source.orbitAround === planetIndex
  ) {
    return null;
  }

  return source.orbitAround;
}

function getOrbitOffset(planet, anomaly) {
  if (!planet.orbitSemiMajor || !planet.orbitSpeed) {
    return vec(0, 0);
  }

  if (planet.orbitEccentricity < 0.000001) {
    return rotateVector(
      vec(
        Math.cos(anomaly) * planet.orbitSemiMajor,
        Math.sin(anomaly) * planet.orbitSemiMajor,
      ),
      planet.orbitRotation ?? 0,
    );
  }

  const eccentricAnomaly = solveKeplerEquation(anomaly, planet.orbitEccentricity);
  return rotateVector(
    vec(
      planet.orbitSemiMajor * (Math.cos(eccentricAnomaly) - planet.orbitEccentricity),
      planet.orbitSemiMinor * Math.sin(eccentricAnomaly),
    ),
    planet.orbitRotation ?? 0,
  );
}

// Moons inherit their parent's motion and add a local orbit on top.
function getOrbitState(level, planetIndex, time, cache = new Map()) {
  if (cache.has(planetIndex)) {
    return cache.get(planetIndex);
  }

  const planet = level.planets[planetIndex];
  let orbitCenter = cloneVec(level.sun);
  let centerVelocity = vec(0, 0);

  if (planet.orbitCenterIndex !== null && planet.orbitCenterIndex !== undefined) {
    const parentState = getOrbitState(level, planet.orbitCenterIndex, time, cache);
    orbitCenter = cloneVec(parentState.position);
    centerVelocity = cloneVec(parentState.velocity);
  }

  if (!planet.orbitRadius || !planet.orbitSpeed) {
    const state = {
      position: planet.orbitCenterIndex !== null && planet.orbitCenterIndex !== undefined
        ? cloneVec(orbitCenter)
        : cloneVec(planet.basePosition),
      velocity: centerVelocity,
      orbitCenter,
    };
    cache.set(planetIndex, state);
    return state;
  }

  const meanAnomaly = wrapAngleRad(planet.orbitPhase + time * planet.orbitSpeed);
  const offset = getOrbitOffset(planet, meanAnomaly);
  const nextOffset = getOrbitOffset(planet, meanAnomaly + 0.0005);
  const velocityOffset = vec(
    (nextOffset.x - offset.x) / 0.0005,
    (nextOffset.y - offset.y) / 0.0005,
  );
  const state = {
    position: vec(
      orbitCenter.x + offset.x,
      orbitCenter.y + offset.y,
    ),
    velocity: vec(
      centerVelocity.x + velocityOffset.x * planet.orbitSpeed,
      centerVelocity.y + velocityOffset.y * planet.orbitSpeed,
    ),
    orbitCenter,
  };
  cache.set(planetIndex, state);
  return state;
}

export function setLevelTime(level, time) {
  level.time = time;
  const orbitStateCache = new Map();
  level.planets.forEach((planet) => {
    const orbitState = getOrbitState(level, planet.index, time, orbitStateCache);
    planet.position.x = orbitState.position.x;
    planet.position.y = orbitState.position.y;
    planet.orbitCenter.x = orbitState.orbitCenter.x;
    planet.orbitCenter.y = orbitState.orbitCenter.y;
  });
  return level;
}

export function getBallSurfaceRadius(planet) {
  return planet.radius + COURSE.ballRadius + PLANET_LANDING_PADDING;
}

export function getPlanetVelocity(level, planetIndex, time = level.time ?? 0) {
  const planet = level.planets[planetIndex];
  if (!planet) {
    return vec(0, 0);
  }

  return cloneVec(getOrbitState(level, planetIndex, time).velocity);
}

export function advanceBallAnchor(level, ball, delta) {
  if (ball.anchorPlanetIndex === null || ball.anchorPlanetIndex === undefined) {
    return;
  }

  const planet = level.planets[ball.anchorPlanetIndex];
  if (!planet) {
    ball.anchorPlanetIndex = null;
    return;
  }

  if (planet.spinSpeed) {
    ball.anchorNormal = normalize(rotateVector(ball.anchorNormal ?? vec(1, 0), planet.spinSpeed * delta));
  }

  syncBallToAnchor(level, ball);
}

export function getPlanetSurfaceVelocity(level, planetIndex, anchorNormal) {
  const planet = level.planets[planetIndex];
  if (!planet || !planet.spinSpeed) {
    return vec(0, 0);
  }

  const normal = normalize(anchorNormal ?? vec(1, 0));
  const tangent = vec(-normal.y, normal.x);
  const speed = getBallSurfaceRadius(planet) * planet.spinSpeed;
  return vec(tangent.x * speed, tangent.y * speed);
}

function inferStartPlanetIndex(source, planets) {
  if (Number.isInteger(source.startPlanetIndex) && source.startPlanetIndex >= 0 && source.startPlanetIndex < planets.length) {
    return source.startPlanetIndex;
  }

  if (!source.start || planets.length === 0) {
    return 0;
  }

  const startPoint = vec(source.start[0], source.start[1]);
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  planets.forEach((planet, index) => {
    const distance = distanceBetween(startPoint, planet.basePosition);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function createLevelRuntime(index) {
  const source = LEVELS[index];
  const launchPresets = (source.launchPresets?.length ? source.launchPresets : [source.launchPreset ?? DEFAULT_LAUNCH_PRESET])
    .map((preset) => ({
      angleDeg: preset.angleDeg,
      power: preset.power,
    }));
  const sun = vec(source.sun?.[0] ?? 0, source.sun?.[1] ?? 0);
  const scaledStart = scalePointFromSun(vec(source.start[0], source.start[1]), sun);
  const scaledGoal = scalePointFromSun(vec(source.goal[0], source.goal[1]), sun);
  const basePositions = source.planets.map((planet) => (
    scalePointFromSun(vec(planet.position[0], planet.position[1]), sun)
  ));
  const planets = source.planets.map((planet, planetIndex) => {
    const orbitCenterIndex = resolveOrbitCenterIndex(planet, source.planets.length, planetIndex);
    const basePosition = basePositions[planetIndex];
    const orbitCenterPosition = orbitCenterIndex !== null ? basePositions[orbitCenterIndex] : sun;
    const scaledRadius = planet.radius * PLANET_RADIUS_SCALE;
    return {
      ...planet,
      index: planetIndex,
      radius: scaledRadius,
      landingRadius: planet.landingRadius ? planet.landingRadius * PLANET_RADIUS_SCALE : planet.landingRadius,
      ...createOrbitDefaults(planet, basePosition, orbitCenterPosition, planetIndex),
      ...createSpinDefaults(planet, scaledRadius, planetIndex),
      orbitCenterIndex,
      basePosition,
      orbitCenter: cloneVec(orbitCenterPosition),
      position: cloneVec(basePosition),
    };
  });
  const startPlanetIndex = inferStartPlanetIndex(source, planets);
  const startPlanet = planets[startPlanetIndex];
  const startAngleDeg = source.startAngleDeg
    ?? (source.start
      ? angleDegBetween(startPlanet.basePosition, vec(source.start[0], source.start[1]))
      : DEFAULT_START_ANGLE_DEG);

  const level = {
    ...source,
    start: scaledStart,
    goal: scaledGoal,
    launchPreset: { ...launchPresets[0] },
    launchPresets,
    sun,
    startPlanetIndex,
    startAngleDeg,
    time: source.startTime ?? 0,
    goalRadius: source.goalRadius ?? COURSE.goalRadius,
    goalPullRadius: source.goalPullRadius ?? COURSE.goalPullRadius,
    goalStrength: source.goalStrength ?? COURSE.goalStrength,
    planets,
  };

  if (!level.planets[level.startPlanetIndex].landable) {
    level.planets[level.startPlanetIndex].landable = true;
  }

  setLevelTime(level, level.time);
  return level;
}

export function createBallState(level) {
  const startPlanet = level.planets[level.startPlanetIndex];
  const anchorNormal = directionFromAngleDeg(level.startAngleDeg ?? DEFAULT_START_ANGLE_DEG);
  const surfaceRadius = getBallSurfaceRadius(startPlanet);
  return {
    position: vec(
      startPlanet.position.x + anchorNormal.x * surfaceRadius,
      startPlanet.position.y + anchorNormal.y * surfaceRadius,
    ),
    velocity: vec(0, 0),
    time: level.time ?? 0,
    landingCount: 0,
    launchGracePlanetIndex: level.startPlanetIndex,
    anchorPlanetIndex: level.startPlanetIndex,
    anchorNormal,
  };
}

function getLandingDirection(ball, planet) {
  const fromPlanet = vec(ball.position.x - planet.position.x, ball.position.y - planet.position.y);
  if (lengthSq(fromPlanet) > 0.000001) {
    return normalize(fromPlanet);
  }

  if (lengthSq(ball.velocity) > 0.000001) {
    return normalize(vec(-ball.velocity.x, -ball.velocity.y));
  }

  return vec(1, 0);
}

export function syncBallToAnchor(level, ball) {
  if (ball.anchorPlanetIndex === null || ball.anchorPlanetIndex === undefined) {
    return;
  }

  const planet = level.planets[ball.anchorPlanetIndex];
  if (!planet) {
    ball.anchorPlanetIndex = null;
    return;
  }

  const anchorNormal = normalize(ball.anchorNormal ?? vec(1, 0));
  const surfaceRadius = getBallSurfaceRadius(planet);
  ball.position.x = planet.position.x + anchorNormal.x * surfaceRadius;
  ball.position.y = planet.position.y + anchorNormal.y * surfaceRadius;
}

function landBallOnPlanet(ball, planet, planetIndex) {
  const landingDirection = getLandingDirection(ball, planet);
  const surfaceRadius = getBallSurfaceRadius(planet);
  ball.position.x = planet.position.x + landingDirection.x * surfaceRadius;
  ball.position.y = planet.position.y + landingDirection.y * surfaceRadius;
  ball.velocity.x = 0;
  ball.velocity.y = 0;
  ball.landingCount = (ball.landingCount ?? 0) + 1;
  ball.launchGracePlanetIndex = null;
  ball.anchorPlanetIndex = planetIndex;
  ball.anchorNormal = landingDirection;
}

function findContainingLandingPlanetIndex(level, position) {
  for (let index = 0; index < level.planets.length; index += 1) {
    const planet = level.planets[index];
    if (!planet.landable) {
      continue;
    }

    const landingRadius = planet.landingRadius ?? planet.radius + COURSE.ballRadius + PLANET_LANDING_PADDING;
    if (distanceBetween(position, planet.position) <= landingRadius) {
      return index;
    }
  }

  return null;
}

function resolvePlanetContact(level, ball) {
  for (let index = 0; index < level.planets.length; index += 1) {
    const planet = level.planets[index];
    const toPlanet = vec(
      planet.position.x - ball.position.x,
      planet.position.y - ball.position.y,
    );
    const distance = Math.max(length(toPlanet), 0.001);
    const touchRadius = planet.radius + COURSE.ballRadius * PLANET_COLLISION_PADDING;
    const landingRadius = planet.landingRadius ?? planet.radius + COURSE.ballRadius + PLANET_LANDING_PADDING;

    if (
      ball.launchGracePlanetIndex === index &&
      distance > landingRadius + PLANET_LANDING_PADDING
    ) {
      ball.launchGracePlanetIndex = null;
    }

    if (
      planet.landable &&
      ball.launchGracePlanetIndex !== index &&
      distance <= touchRadius
    ) {
      landBallOnPlanet(ball, planet, index);
      return {
        type: 'landed',
        planetIndex: index,
        planetName: planet.name ?? 'relay world',
      };
    }

    if (distance <= touchRadius) {
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      return { type: 'crash', reason: 'planet' };
    }
  }

  return null;
}

function resolveSunContact(level, ball) {
  const touchRadius = SUN_COLLISION_RADIUS + COURSE.ballRadius * PLANET_COLLISION_PADDING;
  if (distanceBetween(ball.position, level.sun) <= touchRadius) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'crash', reason: 'planet' };
  }

  return null;
}

export function launchSpeedForDrag(dragPower) {
  return Math.min(LAUNCH_MAX_SPEED, LAUNCH_BASE_SPEED + dragPower * LAUNCH_DRAG_SPEED);
}

export function launchVelocity(direction, dragPower) {
  const normalizedDirection = normalize(direction);
  const speed = launchSpeedForDrag(dragPower);
  return vec(normalizedDirection.x * speed, normalizedDirection.y * speed);
}

export function samplePlanetGravity(level, point) {
  const netGravity = vec(0, 0);

  for (const planet of level.planets) {
    const toPlanet = vec(
      planet.position.x - point.x,
      planet.position.y - point.y,
    );
    const distance = Math.max(length(toPlanet), 0.001);

    if (distance >= planet.falloff) {
      continue;
    }

    const pull = planet.gravity * PLANET_GRAVITY_MULTIPLIER / (distance * distance + 0.22);
    const direction = normalize(toPlanet);
    netGravity.x += direction.x * pull;
    netGravity.y += direction.y * pull;
  }

  if (solarGravityStrength > 0) {
    const toSun = vec(
      level.sun.x - point.x,
      level.sun.y - point.y,
    );
    const distance = Math.max(length(toSun), 0.001);
    const pull = solarGravityStrength * SOLAR_GRAVITY_MULTIPLIER / (distance * distance + SOLAR_GRAVITY_SOFTENING);
    const direction = normalize(toSun);
    netGravity.x += direction.x * pull;
    netGravity.y += direction.y * pull;
  }

  return netGravity;
}

export function stepBall(level, ball, delta) {
  if (lengthSq(ball.velocity) < 0.000001) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'settled' };
  }

  const nextTime = (ball.time ?? level.time ?? 0) + delta;
  setLevelTime(level, nextTime);
  ball.time = nextTime;

  const planetGravity = samplePlanetGravity(level, ball.position);
  ball.velocity.x += planetGravity.x * delta;
  ball.velocity.y += planetGravity.y * delta;

  const goalUnlocked = (ball.landingCount ?? 0) >= (level.requiredLandings ?? 0);
  if (goalUnlocked) {
    const toGoal = vec(level.goal.x - ball.position.x, level.goal.y - ball.position.y);
    const goalDistance = Math.max(length(toGoal), 0.001);

    if (goalDistance < level.goalRadius * GOAL_CAPTURE_RATIO) {
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      return { type: 'goal' };
    }

    if (goalDistance < level.goalPullRadius) {
      const pull = (level.goalStrength / (goalDistance * goalDistance + 0.38)) * delta;
      const direction = normalize(toGoal);
      ball.velocity.x += direction.x * pull;
      ball.velocity.y += direction.y * pull;
    }
  }

  addScaledVec(ball.position, ball.velocity, delta);

  const sunContactResult = resolveSunContact(level, ball);
  if (sunContactResult) {
    return sunContactResult;
  }

  const contactResult = resolvePlanetContact(level, ball);
  if (contactResult) {
    return contactResult;
  }

  const friction = Math.pow(BALL_FRICTION_BASE, delta * 60);
  ball.velocity.x *= friction;
  ball.velocity.y *= friction;

  if (
    Math.abs(ball.position.x) > COURSE.outBoundsX ||
    Math.abs(ball.position.y) > COURSE.outBoundsY
  ) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'crash', reason: 'bounds' };
  }

  if (length(ball.velocity) < BALL_STOP_SPEED) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'settled' };
  }

  return { type: 'flying' };
}

export function simulateShot(level, shot, options = {}) {
  const delta = options.delta ?? 1 / 60;
  const maxTime = options.maxTime ?? 20;
  const startTime = options.startTime ?? 0;
  const waitTime = shot.waitTime ?? options.waitTime ?? 0;
  const anchorPlanetIndex = options.anchorPlanetIndex ?? level.startPlanetIndex ?? null;
  const anchorNormal = options.anchorNormal ?? directionFromAngleDeg(level.startAngleDeg ?? DEFAULT_START_ANGLE_DEG);
  const startPosition = options.startPosition ?? level.start;

  setLevelTime(level, startTime);
  const ball = {
    position: cloneVec(startPosition),
    velocity: vec(0, 0),
    time: startTime,
    landingCount: options.landingCount ?? 0,
    launchGracePlanetIndex: anchorPlanetIndex ?? findContainingLandingPlanetIndex(level, startPosition),
    anchorPlanetIndex,
    anchorNormal: cloneVec(anchorNormal),
  };

  if (ball.anchorPlanetIndex !== null) {
    syncBallToAnchor(level, ball);
  }

  if (waitTime > 0) {
    const launchTime = startTime + waitTime;
    setLevelTime(level, launchTime);
    ball.time = launchTime;
    if (ball.anchorPlanetIndex !== null) {
      advanceBallAnchor(level, ball, waitTime);
    }
  }

  const relativeLaunchVelocity = launchVelocity(
    vec(Math.cos(shot.angle), Math.sin(shot.angle)),
    shot.dragPower,
  );
  const launchBodyVelocity = anchorPlanetIndex !== null
    ? getPlanetVelocity(level, anchorPlanetIndex, ball.time ?? startTime + waitTime)
    : vec(0, 0);
  const launchSurfaceVelocity = anchorPlanetIndex !== null
    ? getPlanetSurfaceVelocity(level, anchorPlanetIndex, ball.anchorNormal)
    : vec(0, 0);
  ball.velocity = vec(
    relativeLaunchVelocity.x + launchBodyVelocity.x + launchSurfaceVelocity.x,
    relativeLaunchVelocity.y + launchBodyVelocity.y + launchSurfaceVelocity.y,
  );
  ball.launchGracePlanetIndex = ball.anchorPlanetIndex;
  ball.anchorPlanetIndex = null;

  let time = 0;
  let steps = 0;
  let minGoalDistance = distanceBetween(ball.position, level.goal);
  let minPlanetClearance = Number.POSITIVE_INFINITY;

  while (time < maxTime) {
    minGoalDistance = Math.min(minGoalDistance, distanceBetween(ball.position, level.goal));

    for (const planet of level.planets) {
      const clearance =
        distanceBetween(ball.position, planet.position) -
        (planet.radius + COURSE.ballRadius * PLANET_COLLISION_PADDING);
      minPlanetClearance = Math.min(minPlanetClearance, clearance);
    }

    const result = stepBall(level, ball, delta);
    time += delta;
    steps += 1;

    if (result.type !== 'flying') {
      return {
        outcome: result.type,
        reason: result.reason ?? '',
        planetIndex: result.planetIndex ?? null,
        planetName: result.planetName ?? '',
        waitTime,
        landingCount: ball.landingCount ?? 0,
        time,
        steps,
        finalTime: ball.time ?? startTime + time,
        anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
        anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
        minGoalDistance,
        minPlanetClearance,
        finalPosition: cloneVec(ball.position),
      };
    }
  }

  return {
    outcome: 'timeout',
    reason: '',
    planetIndex: null,
    planetName: '',
    waitTime,
    landingCount: ball.landingCount ?? 0,
    time,
    steps,
    finalTime: ball.time ?? startTime + time,
    anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
    anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
    minGoalDistance,
    minPlanetClearance,
    finalPosition: cloneVec(ball.position),
  };
}
