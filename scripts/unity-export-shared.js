import fs from 'node:fs/promises';
import path from 'node:path';

import {
  WORLD_DEFINITIONS,
  WORLD_SIZE,
  createLevelRuntime,
  directionFromAngleDeg,
  simulateShot,
} from '../src/game-core.js';

export const UNITY_LEVEL_COUNT = 10;
export const WORLD_INDEX = 0;
export const WORLD_NUMBER = WORLD_INDEX + 1;
export const WORLD_DEFINITION = WORLD_DEFINITIONS[WORLD_INDEX];
export const WORLD_FILE_PATH = 'unity/Assets/StreamingAssets/levels/world-1.json';
export const FIXTURE_DIR = 'unity/tests/fixtures';
export const FIXTURE_SAMPLE_EVERY_N_FRAMES = 15;
export const FIXTURE_DELTA = 1 / 60;
export const FIXTURE_MAX_TIME = 20;
export const SUN_COLLISION_RADIUS = 0.42;
export const DEFAULT_COVERAGE_POWER_GRID = [1.4, 2.4, 3.2];
export const WIDE_COVERAGE_POWER_GRID = [1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4, 3.6];
export const COVERAGE_ANGLE_STEPS = 48;
export const COVERAGE_WAIT_GRID = [0, 1.7, 4.6];
export const COVERAGE_SHOT_LIMIT = 10;
export const MIN_LONG_RAW_FRAME_SHOTS = 3;
export const LONG_RAW_FRAME_THRESHOLD = 100;

const LEVEL_OUT_OF_SCOPE_KEYS = [
  'binarySystem',
  'extraSuns',
  'portals',
  'dustClouds',
  'asteroids',
  'meteorImpacts',
  'pulsarJets',
  'redGiant',
];

const PLANET_OUT_OF_SCOPE_KEYS = [
  'splitSurface',
  'surfaceType',
  'flicker',
  'hidden',
  'goalUnlock',
  'orbitAnchor',
  'slideAngularSpeed',
  'orbitDecayRate',
  'orbitAround',
  'destroyedByMeteor',
  'fallIntoSunRadius',
];

export function createUnityLevels() {
  return Array.from({ length: UNITY_LEVEL_COUNT }, (_, index) => {
    return createUnityLevel(index);
  });
}

export function createUnityLevel(index) {
  const level = createLevelRuntime(index);
  validateRuntimeLevel(level, index);
  return level;
}

export function buildWorldExport(levels) {
  return {
    schemaVersion: 1,
    generatedFrom: 'game-core.js',
    worldId: WORLD_DEFINITION.id,
    worldName: WORLD_DEFINITION.name,
    worldNumber: WORLD_NUMBER,
    worldSize: WORLD_SIZE,
    levels: levels.map((level, index) => serializeLevel(level, index)),
  };
}

export function serializeLevel(level, index) {
  return {
    index,
    id: level.id,
    name: level.name,
    worldLevelNumber: level.worldLevelNumber,
    sun: serializeVec2(level.sun),
    sunGravityStrength: level.sunGravityStrength,
    sunCollisionRadius: SUN_COLLISION_RADIUS,
    startPlanetIndex: level.startPlanetIndex,
    startAngleDeg: level.startAngleDeg,
    startAnchor: serializeVec2(level.startAnchor),
    startTimeSeconds: level.startTimeSeconds,
    goalCenter: serializeVec2(level.goalCenter),
    goalRadius: level.goalRadius,
    goalPullRadius: level.goalPullRadius,
    goalPullStrength: level.goalPullStrength,
    goalOpenSeconds: level.goalOpenSeconds,
    goalUnlockRequired: level.goalUnlockRequired,
    planets: level.planets.map(serializePlanet),
    launchPresets: level.launchPresets.map(serializeLaunchPreset),
  };
}

function serializePlanet(planet) {
  const serialized = {
    index: planet.index,
    name: planet.name,
    basePosition: serializeVec2(planet.basePosition),
    radius: planet.radius,
    landingRadius: planet.landingRadius ?? null,
    gravity: planet.gravity,
    falloff: planet.falloff,
    landable: planet.landable,
    orbitCenterIndex: planet.orbitCenterIndex ?? null,
    orbitSemiMajor: planet.orbitSemiMajor,
    orbitSemiMinor: planet.orbitSemiMinor,
    orbitEccentricity: planet.orbitEccentricity,
    orbitRotation: planet.orbitRotation,
    orbitPhase: planet.orbitPhase,
    orbitSpeed: planet.orbitSpeed,
    spinSpeed: planet.spinSpeed,
  };

  if (planet.core !== undefined) {
    serialized.core = planet.core;
  }
  if (planet.glow !== undefined) {
    serialized.glow = planet.glow;
  }

  return serialized;
}

function serializeLaunchPreset(preset) {
  return {
    angleDeg: preset.angleDeg,
    power: preset.power,
  };
}

export function buildFixtureExport(level, levelIndex) {
  let coveragePowerGrid = DEFAULT_COVERAGE_POWER_GRID;
  let shots = buildFixtureShots(level, levelIndex, coveragePowerGrid);
  let serializedShots = shots.map((shot) => serializeShotFixture(levelIndex, shot));

  if (countLongRawFrameShots(serializedShots) < MIN_LONG_RAW_FRAME_SHOTS) {
    coveragePowerGrid = WIDE_COVERAGE_POWER_GRID;
    shots = buildFixtureShots(level, levelIndex, coveragePowerGrid);
    serializedShots = shots.map((shot) => serializeShotFixture(levelIndex, shot));
  }

  return {
    schemaVersion: 1,
    levelIndex,
    levelId: level.id,
    sampleEveryNFrames: FIXTURE_SAMPLE_EVERY_N_FRAMES,
    delta: FIXTURE_DELTA,
    maxTime: FIXTURE_MAX_TIME,
    shots: serializedShots,
    sequences: buildSequenceFixtures(level, levelIndex),
  };
}

export function buildFixtureShots(level, levelIndex, coveragePowerGrid = DEFAULT_COVERAGE_POWER_GRID) {
  const presetShots = level.launchPresets.map((preset, index) => ({
    source: 'preset',
    shotKind: `preset${index}`,
    angleDeg: preset.angleDeg,
    power: preset.power,
    waitTime: 0,
  }));

  const basePreset = level.launchPresets[0];
  const extraShots = [
    { source: 'variation', shotKind: 'e1', angleDeg: basePreset.angleDeg + 7, power: basePreset.power * 1.15 },
    { source: 'variation', shotKind: 'e2', angleDeg: basePreset.angleDeg - 7, power: basePreset.power * 0.85 },
    { source: 'variation', shotKind: 'e3', angleDeg: basePreset.angleDeg + 19, power: basePreset.power * 0.85 },
    { source: 'variation', shotKind: 'e4', angleDeg: basePreset.angleDeg - 19, power: basePreset.power * 1.15 },
  ];
  const coverageShots = buildCoverageShots(levelIndex, coveragePowerGrid);

  return [...presetShots, ...extraShots, ...coverageShots];
}

function buildCoverageShots(levelIndex, powerGrid) {
  const candidates = [];
  let selectionIndex = 0;

  for (let angleIndex = 0; angleIndex < COVERAGE_ANGLE_STEPS; angleIndex += 1) {
    const angle = angleIndex * 2 * Math.PI / COVERAGE_ANGLE_STEPS;
    const angleDeg = angle * 180 / Math.PI;
    for (const power of powerGrid) {
      for (const waitTime of COVERAGE_WAIT_GRID) {
        const result = simulateShot(createUnityLevel(levelIndex), {
          angle,
          dragPower: power,
          waitTime,
        });

        candidates.push({
          source: 'coverage',
          angleDeg,
          power,
          waitTime,
          outcome: result.outcome,
          reason: result.reason,
          flightTime: result.time,
          selectionIndex,
        });
        selectionIndex += 1;
      }
    }
  }

  const kept = [];
  const keptKeys = new Set();
  const representedPairs = new Set();

  function addCandidate(candidate) {
    const key = shotInputKey(candidate);
    if (keptKeys.has(key) || kept.length >= COVERAGE_SHOT_LIMIT) {
      return false;
    }

    kept.push(candidate);
    keptKeys.add(key);
    representedPairs.add(outcomeReasonKey(candidate));
    return true;
  }

  const firstGoal = candidates.find((candidate) => candidate.outcome === 'goal');
  if (firstGoal) {
    addCandidate(firstGoal);
  }

  const bestByPair = new Map();
  for (const candidate of candidates) {
    const key = outcomeReasonKey(candidate);
    const current = bestByPair.get(key);
    if (!current || candidate.flightTime > current.flightTime) {
      bestByPair.set(key, candidate);
    }
  }

  for (const [pairKey, candidate] of bestByPair) {
    if (!representedPairs.has(pairKey)) {
      addCandidate(candidate);
    }
  }

  const longestCandidates = [...candidates].sort((left, right) => {
    if (right.flightTime !== left.flightTime) {
      return right.flightTime - left.flightTime;
    }
    return left.selectionIndex - right.selectionIndex;
  });
  for (const candidate of longestCandidates) {
    if (kept.length >= COVERAGE_SHOT_LIMIT) {
      break;
    }
    addCandidate(candidate);
  }

  return kept.map((shot, index) => ({
    source: 'coverage',
    shotKind: `coverage${index}`,
    angleDeg: shot.angleDeg,
    power: shot.power,
    waitTime: shot.waitTime,
  }));
}

function outcomeReasonKey(result) {
  return `${result.outcome}\u0000${result.reason ?? ''}`;
}

function shotInputKey(shot) {
  return `${shot.angleDeg}\u0000${shot.power}\u0000${shot.waitTime}`;
}

function serializeShotFixture(levelIndex, shot) {
  const result = simulateShot(createUnityLevel(levelIndex), toSimShot(shot), {
    captureFrames: true,
    maxTime: FIXTURE_MAX_TIME,
  });

  return {
    source: shot.source,
    shotKind: shot.shotKind,
    input: {
      angleDeg: shot.angleDeg,
      power: shot.power,
      waitTime: shot.waitTime,
    },
    outcome: result.outcome,
    reason: result.reason,
    steps: result.steps,
    finalTime: result.finalTime,
    landingCount: result.landingCount,
    sampledFrames: sampleFrames(result.frames),
  };
}

function buildSequenceFixtures(level, levelIndex) {
  if (!Array.isArray(level.adminSolutions) || level.adminSolutions.length === 0) {
    return [];
  }

  return level.adminSolutions.map((adminSolution) => {
    const runtime = createUnityLevel(levelIndex);
    const sequenceShots = [];
    let startPosition = runtime.startAnchor;
    let startTime = 0;
    let anchorPlanetIndex = runtime.startPlanetIndex ?? null;
    let anchorNormal = directionFromAngleDeg(runtime.startAngleDeg ?? 180);
    let heat = 0;
    let landingCount = 0;

    for (const shot of adminSolution.shots) {
      const input = {
        angleDeg: shot.angleDeg,
        power: shot.power,
        waitTime: shot.waitSeconds,
      };
      const result = simulateShot(runtime, toSimShot(input), {
        captureFrames: true,
        maxTime: FIXTURE_MAX_TIME,
        startPosition,
        startTime,
        anchorPlanetIndex,
        anchorNormal,
        heat,
        landingCount,
      });

      sequenceShots.push({
        input,
        outcome: result.outcome,
        reason: result.reason,
        steps: result.steps,
        finalTime: result.finalTime,
        landingCount: result.landingCount,
        frames: sampleFrames(result.frames),
      });

      if (result.outcome === 'goal' || result.outcome !== 'landed') {
        break;
      }

      startPosition = result.finalPosition;
      startTime = result.finalTime;
      anchorPlanetIndex = result.anchorPlanetIndex;
      anchorNormal = result.anchorNormal;
      heat = result.heat ?? 0;
      landingCount = result.landingCount;
    }

    return {
      label: adminSolution.label ?? 'admin solution',
      shots: sequenceShots,
    };
  });
}

function toSimShot(shot) {
  return {
    angle: shot.angleDeg * Math.PI / 180,
    dragPower: shot.power,
    waitTime: shot.waitTime,
  };
}

function sampleFrames(frames) {
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new Error('simulateShot returned no captured frames');
  }

  const indexes = [];
  for (let index = 0; index < frames.length; index += FIXTURE_SAMPLE_EVERY_N_FRAMES) {
    indexes.push(index);
  }

  const finalIndex = frames.length - 1;
  if (indexes[indexes.length - 1] !== finalIndex) {
    indexes.push(finalIndex);
  }

  return indexes.map((index) => {
    const frame = frames[index];
    return {
      index,
      time: frame.time,
      position: serializeVec2(frame.position),
      velocity: serializeVec2(frame.velocity),
    };
  });
}

export function summarizeFixture(fixture) {
  const outcomes = {};
  const sources = {};
  for (const shot of fixture.shots) {
    outcomes[shot.outcome] = (outcomes[shot.outcome] ?? 0) + 1;
    sources[shot.source] = (sources[shot.source] ?? 0) + 1;
  }

  return {
    levelIndex: fixture.levelIndex,
    levelId: fixture.levelId,
    shots: fixture.shots.length,
    sources,
    outcomes,
  };
}

export function formatOutcomeDistribution(outcomes) {
  return Object.keys(outcomes)
    .sort()
    .map((key) => `${key}:${outcomes[key]}`)
    .join(', ');
}

export function getRawFrameCount(shot) {
  return shot.sampledFrames.at(-1).index + 1;
}

export function getFrameCountStats(fixture) {
  const counts = fixture.shots.map(getRawFrameCount).sort((left, right) => left - right);
  return {
    min: counts[0],
    median: counts[Math.floor(counts.length / 2)],
    max: counts[counts.length - 1],
    overThreshold: counts.filter((count) => count > LONG_RAW_FRAME_THRESHOLD).length,
  };
}

function countLongRawFrameShots(shots) {
  return shots.filter((shot) => getRawFrameCount(shot) > LONG_RAW_FRAME_THRESHOLD).length;
}

export async function writeJsonFile(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function readJsonFile(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export function getFixturePath(level, levelIndex) {
  const levelNumber = String(levelIndex).padStart(2, '0');
  return path.join(FIXTURE_DIR, `level-${levelNumber}-${level.id}.json`);
}

function validateRuntimeLevel(level, index) {
  if (!level || typeof level !== 'object') {
    throw new Error(`Level ${index}: createLevelRuntime returned no level`);
  }

  assertFiniteNumber(index, 'index');
  assertRequiredString(level.id, `level ${index}.id`);
  assertRequiredString(level.name, `level ${index}.name`);
  assertFiniteNumber(level.worldLevelNumber, `level ${index}.worldLevelNumber`);
  assertVec2(level.sun, `level ${index}.sun`);
  assertFiniteNumber(level.sunGravityStrength, `level ${index}.sunGravityStrength`);
  assertInteger(level.startPlanetIndex, `level ${index}.startPlanetIndex`);
  assertFiniteNumber(level.startAngleDeg, `level ${index}.startAngleDeg`);
  assertVec2(level.startAnchor, `level ${index}.startAnchor`);
  assertFiniteNumber(level.startTimeSeconds, `level ${index}.startTimeSeconds`);
  assertVec2(level.goalCenter, `level ${index}.goalCenter`);
  assertFiniteNumber(level.goalRadius, `level ${index}.goalRadius`);
  assertFiniteNumber(level.goalPullRadius, `level ${index}.goalPullRadius`);
  assertFiniteNumber(level.goalPullStrength, `level ${index}.goalPullStrength`);
  assertFiniteNumber(level.goalOpenSeconds, `level ${index}.goalOpenSeconds`);

  if (level.goalUnlockRequired === true) {
    throw new Error(`Level ${index} (${level.id}): goalUnlockRequired is out of scope`);
  }

  for (const key of LEVEL_OUT_OF_SCOPE_KEYS) {
    if (hasOutOfScopeValue(level[key])) {
      throw new Error(`Level ${index} (${level.id}): ${key} is out of scope`);
    }
  }

  if (!Array.isArray(level.planets) || level.planets.length === 0) {
    throw new Error(`Level ${index} (${level.id}): planets must be a non-empty array`);
  }
  if (level.startPlanetIndex < 0 || level.startPlanetIndex >= level.planets.length) {
    throw new Error(`Level ${index} (${level.id}): startPlanetIndex is out of range`);
  }

  level.planets.forEach((planet, planetIndex) => validateRuntimePlanet(planet, index, planetIndex));

  if (!Array.isArray(level.launchPresets) || level.launchPresets.length === 0) {
    throw new Error(`Level ${index} (${level.id}): launchPresets must be a non-empty array`);
  }
  level.launchPresets.forEach((preset, presetIndex) => {
    assertFiniteNumber(preset.angleDeg, `level ${index}.launchPresets[${presetIndex}].angleDeg`);
    assertFiniteNumber(preset.power, `level ${index}.launchPresets[${presetIndex}].power`);
  });
}

function validateRuntimePlanet(planet, levelIndex, planetIndex) {
  const prefix = `level ${levelIndex}.planets[${planetIndex}]`;

  assertInteger(planet.index, `${prefix}.index`);
  if (planet.index !== planetIndex) {
    throw new Error(`${prefix}.index must equal its array index`);
  }
  assertRequiredString(planet.name, `${prefix}.name`);
  assertVec2(planet.basePosition, `${prefix}.basePosition`);
  assertFiniteNumber(planet.radius, `${prefix}.radius`);
  assertOptionalFiniteNumber(planet.landingRadius, `${prefix}.landingRadius`);
  assertFiniteNumber(planet.gravity, `${prefix}.gravity`);
  assertFiniteNumber(planet.falloff, `${prefix}.falloff`);
  if (typeof planet.landable !== 'boolean') {
    throw new Error(`${prefix}.landable must be boolean`);
  }
  if (planet.orbitCenterIndex !== null && planet.orbitCenterIndex !== undefined) {
    throw new Error(`${prefix}.orbitCenterIndex is out of scope`);
  }
  assertFiniteNumber(planet.orbitSemiMajor, `${prefix}.orbitSemiMajor`);
  assertFiniteNumber(planet.orbitSemiMinor, `${prefix}.orbitSemiMinor`);
  assertFiniteNumber(planet.orbitEccentricity, `${prefix}.orbitEccentricity`);
  assertFiniteNumber(planet.orbitRotation, `${prefix}.orbitRotation`);
  assertFiniteNumber(planet.orbitPhase, `${prefix}.orbitPhase`);
  assertFiniteNumber(planet.orbitSpeed, `${prefix}.orbitSpeed`);
  assertFiniteNumber(planet.spinSpeed, `${prefix}.spinSpeed`);
  assertOptionalInteger(planet.core, `${prefix}.core`);
  assertOptionalInteger(planet.glow, `${prefix}.glow`);

  if (Array.isArray(planet.turrets) && planet.turrets.length > 0) {
    throw new Error(`${prefix}.turrets is out of scope`);
  }

  for (const key of PLANET_OUT_OF_SCOPE_KEYS) {
    if (key in planet) {
      throw new Error(`${prefix}.${key} is out of scope`);
    }
  }
}

function hasOutOfScopeValue(value) {
  if (value === undefined || value === null || value === false) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

function serializeVec2(point) {
  return {
    x: point.x,
    y: point.y,
  };
}

function assertVec2(point, label) {
  if (!point || typeof point !== 'object') {
    throw new Error(`${label} must be a Vec2`);
  }
  assertFiniteNumber(point.x, `${label}.x`);
  assertFiniteNumber(point.y, `${label}.y`);
}

function assertFiniteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
}

function assertOptionalFiniteNumber(value, label) {
  if (value === undefined || value === null) {
    return;
  }
  assertFiniteNumber(value, label);
}

function assertInteger(value, label) {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }
}

function assertOptionalInteger(value, label) {
  if (value === undefined || value === null) {
    return;
  }
  assertInteger(value, label);
}

function assertRequiredString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}
