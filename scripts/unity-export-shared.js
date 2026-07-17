import fs from 'node:fs/promises';
import path from 'node:path';

import {
  COURSE,
  WORLD_DEFINITIONS,
  WORLD_SIZE,
  createLevelRuntime,
  directionFromAngleDeg,
  reverseStepBall,
  setLevelTime,
  simulateShot,
} from '../src/game-core.js';

export const UNITY_LEVEL_COUNT = WORLD_SIZE;
export const UNITY_WORLD_INDICES = [0, 1];
export const FIXTURE_DIR = 'unity/tests/fixtures';
export const REVERSE_FIXTURE_DIR = 'unity/tests/fixtures/reverse';
export const FIXTURE_SAMPLE_EVERY_N_FRAMES = 15;
export const FIXTURE_DELTA = 1 / 60;
export const REVERSE_FIXTURE_DELTA = 1 / 120;
export const REVERSE_FIXTURE_STEPS = 30;
export const REVERSE_FIXTURE_MIN_FLYING_STEPS = 40;
export const REVERSE_FIXTURE_SHOT_LIMIT = 3;
export const FIXTURE_MAX_TIME = 20;
export const SUN_COLLISION_RADIUS = 0.42;
export const UNITY_EXPORT_ROTATION_DEGREES = parseExportRotationDegrees();
export const OUT_BOUNDS = rotateOutBounds(UNITY_EXPORT_ROTATION_DEGREES);
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

export function worldFilePath(worldIndex) {
  return `unity/Assets/StreamingAssets/levels/world-${worldIndex + 1}.json`;
}

export function globalLevelIndex(worldIndex, levelInWorld) {
  return worldIndex * WORLD_SIZE + levelInWorld;
}

export function createUnityLevels(worldIndex = 0) {
  return Array.from({ length: UNITY_LEVEL_COUNT }, (_, levelInWorld) => {
    return createUnityLevel(globalLevelIndex(worldIndex, levelInWorld));
  });
}

export function createUnityLevel(index) {
  const level = createLevelRuntime(index);
  rotateRuntimeAboutSun(level, UNITY_EXPORT_ROTATION_DEGREES);
  validateRuntimeLevel(level, index);
  return level;
}

export function rotateRuntimeAboutSun(runtime, degrees = UNITY_EXPORT_ROTATION_DEGREES) {
  if (!runtime || degrees === 0) {
    return runtime;
  }

  assertFiniteNumber(degrees, 'UNITY_EXPORT_ROTATION_DEGREES');
  const radians = degrees * Math.PI / 180;
  const rotatedBodies = new Set();

  rotateVec2InPlace(runtime.sun, radians);
  rotateVec2InPlace(runtime.systemCenter, radians);
  rotateOrbitalBody(runtime.primarySunBody, radians, rotatedBodies);
  rotateOrbitalBody(runtime.secondarySunBody, radians, rotatedBodies);
  rotateOrbitalBodies(runtime.extraSuns, radians, rotatedBodies);

  rotateVec2InPlace(runtime.startAnchor, radians);
  rotateVec2InPlace(runtime.goalCenter, radians);
  runtime.startAngleDeg = rotateAngleDeg(runtime.startAngleDeg, degrees);
  runtime.launchPreset = rotateLaunchPreset(runtime.launchPreset, degrees);
  runtime.launchPresets = rotateLaunchPresets(runtime.launchPresets, degrees);
  runtime.adminSolutions = rotateAdminSolutions(runtime.adminSolutions, degrees);

  for (const planet of runtime.planets ?? []) {
    rotateVec2InPlace(planet.basePosition, radians);
    rotateVec2InPlace(planet.position, radians);
    rotateVec2InPlace(planet.orbitCenter, radians);
    rotateVec2InPlace(planet.velocity, radians);
    planet.orbitRotation = rotateAngleRad(planet.orbitRotation, radians);
  }

  rotateOrbitalBodies(runtime.portals, radians, rotatedBodies);
  rotateOrbitalBodies(runtime.dustClouds, radians, rotatedBodies);
  rotateAsteroids(runtime.asteroids, radians, degrees);
  rotateMeteorImpacts(runtime.meteorImpacts, radians, degrees);

  return runtime;
}

export function buildWorldExport(levels, worldIndex = 0) {
  const worldDefinition = WORLD_DEFINITIONS[worldIndex];
  if (!worldDefinition) {
    throw new Error(`World ${worldIndex}: no world definition`);
  }

  return {
    schemaVersion: 1,
    generatedFrom: 'game-core.js',
    worldId: worldDefinition.id,
    worldName: worldDefinition.name,
    worldNumber: worldIndex + 1,
    worldSize: WORLD_SIZE,
    levels: levels.map((level, levelInWorld) => serializeLevel(level, globalLevelIndex(worldIndex, levelInWorld))),
  };
}

export function serializeLevel(level, index) {
  const serialized = {
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
    outBoundsX: OUT_BOUNDS.x,
    outBoundsY: OUT_BOUNDS.y,
    planets: level.planets.map(serializePlanet),
    launchPresets: level.launchPresets.map(serializeLaunchPreset),
  };

  if (Array.isArray(level.asteroids) && level.asteroids.length > 0) {
    serialized.asteroids = level.asteroids.map(serializeAsteroid);
  }

  return serialized;
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

function serializeAsteroid(asteroid) {
  const serialized = {
    index: asteroid.index,
    position: serializeVec2(asteroid.position),
    orbitRadius: asteroid.orbitRadius,
    baseAngleDeg: asteroid.baseAngleDeg,
    orbitAngularSpeed: asteroid.orbitAngularSpeed,
    radius: asteroid.radius,
  };

  if (asteroid.spinSpeed !== undefined) {
    serialized.spinSpeed = asteroid.spinSpeed;
  }
  if (asteroid.color !== undefined) {
    serialized.color = asteroid.color;
  }

  return serialized;
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

  if ((level.asteroids?.length ?? 0) > 0 && !serializedShots.some((shot) => shot.outcome === 'crash' && shot.reason === 'asteroid')) {
    throw new Error(`Level ${levelIndex} (${level.id}): fixture selection did not keep an asteroid crash`);
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

export function buildReverseFixtureExport(level, levelIndex) {
  const sequences = buildReverseSequences(levelIndex);
  if (sequences.length === 0) {
    throw new Error(`Level ${levelIndex} (${level.id}): no reverse fixture shots found`);
  }

  return {
    schemaVersion: 1,
    levelIndex,
    levelId: level.id,
    delta: REVERSE_FIXTURE_DELTA,
    steps: REVERSE_FIXTURE_STEPS,
    minForwardFlyingSteps: REVERSE_FIXTURE_MIN_FLYING_STEPS,
    sequences,
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
    const angle = angleIndex * 2 * Math.PI / COVERAGE_ANGLE_STEPS
      + UNITY_EXPORT_ROTATION_DEGREES * Math.PI / 180;
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

function buildReverseSequences(levelIndex) {
  const candidates = [];
  let selectionIndex = 0;

  for (let angleIndex = 0; angleIndex < COVERAGE_ANGLE_STEPS; angleIndex += 1) {
    const angle = angleIndex * 2 * Math.PI / COVERAGE_ANGLE_STEPS
      + UNITY_EXPORT_ROTATION_DEGREES * Math.PI / 180;
    const angleDeg = angle * 180 / Math.PI;
    for (const power of WIDE_COVERAGE_POWER_GRID) {
      for (const waitTime of COVERAGE_WAIT_GRID) {
        const sequence = tryBuildReverseSequence(levelIndex, {
          source: 'reverse-coverage',
          shotKind: `reverse${selectionIndex}`,
          angleDeg,
          power,
          waitTime,
        });
        if (sequence) {
          candidates.push({ ...sequence, selectionIndex });
        }
        selectionIndex += 1;
      }
    }
  }

  candidates.sort((left, right) => {
    if (right.forwardFlyingSteps !== left.forwardFlyingSteps) {
      return right.forwardFlyingSteps - left.forwardFlyingSteps;
    }
    return left.selectionIndex - right.selectionIndex;
  });

  return candidates.slice(0, REVERSE_FIXTURE_SHOT_LIMIT).map((candidate, index) => ({
    source: candidate.source,
    shotKind: `reverse${index}`,
    input: candidate.input,
    launchPlanetIndex: candidate.launchPlanetIndex,
    forwardCaptureFrameIndex: candidate.forwardCaptureFrameIndex,
    forwardFlyingSteps: candidate.forwardFlyingSteps,
    startFrame: candidate.startFrame,
    frames: candidate.frames,
  }));
}

function tryBuildReverseSequence(levelIndex, shot) {
  const forwardLevel = createUnityLevel(levelIndex);
  const result = simulateShot(forwardLevel, toSimShot(shot), {
    captureFrames: true,
    delta: REVERSE_FIXTURE_DELTA,
    maxTime: FIXTURE_MAX_TIME,
  });

  const frames = result.frames ?? [];
  const launchFrameIndex = frames.findIndex((frame) => frame.anchorPlanetIndex === null);
  if (launchFrameIndex < 0) {
    return null;
  }

  let forwardFlyingSteps = 0;
  for (let index = launchFrameIndex + 1; index < frames.length; index += 1) {
    if (frames[index].anchorPlanetIndex !== null) {
      break;
    }
    forwardFlyingSteps += 1;
  }

  if (forwardFlyingSteps < REVERSE_FIXTURE_MIN_FLYING_STEPS) {
    return null;
  }

  const captureOffset = Math.max(
    REVERSE_FIXTURE_STEPS,
    Math.floor(forwardFlyingSteps / 2),
  );
  const forwardCaptureFrameIndex = launchFrameIndex + captureOffset;
  const startFrame = frames[forwardCaptureFrameIndex];
  if (!startFrame || startFrame.anchorPlanetIndex !== null) {
    return null;
  }

  const reverseLevel = createUnityLevel(levelIndex);
  setLevelTime(reverseLevel, startFrame.time);
  const reverseBall = {
    position: { ...startFrame.position },
    velocity: { ...startFrame.velocity },
    time: startFrame.time,
    landingCount: startFrame.landingCount ?? 0,
    launchGracePlanetIndex: startFrame.launchGracePlanetIndex ?? null,
    anchorPlanetIndex: null,
    anchorNormal: startFrame.anchorNormal ? { ...startFrame.anchorNormal } : null,
    anchorSinceTime: startFrame.anchorSinceTime ?? 0,
    portalCooldown: startFrame.portalCooldown ?? 0,
    heat: startFrame.heat ?? 0,
  };

  const reversedFrames = [];
  const launchPlanetIndex = reverseLevel.startPlanetIndex ?? null;
  for (let step = 1; step <= REVERSE_FIXTURE_STEPS; step += 1) {
    reverseStepBall(reverseLevel, reverseBall, REVERSE_FIXTURE_DELTA, { launchPlanetIndex });
    reversedFrames.push(serializeReverseFrame(step, reverseBall));
  }

  return {
    source: shot.source,
    input: {
      angleDeg: shot.angleDeg,
      power: shot.power,
      waitTime: shot.waitTime,
    },
    launchPlanetIndex,
    forwardCaptureFrameIndex,
    forwardFlyingSteps,
    startFrame: serializeReverseFrame(0, startFrame),
    frames: reversedFrames,
  };
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

function serializeReverseFrame(step, frame) {
  return {
    step,
    time: frame.time,
    position: serializeVec2(frame.position),
    velocity: serializeVec2(frame.velocity),
  };
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

export function getReverseFixturePath(level, levelIndex) {
  const levelNumber = String(levelIndex).padStart(2, '0');
  return path.join(REVERSE_FIXTURE_DIR, `level-${levelNumber}-${level.id}.reverse.json`);
}

function parseExportRotationDegrees() {
  const value = process.env.UNITY_EXPORT_ROTATION_DEGREES ?? '90';
  const degrees = Number.parseFloat(value);
  if (!Number.isFinite(degrees)) {
    throw new Error(`UNITY_EXPORT_ROTATION_DEGREES must be a finite number, got "${value}"`);
  }
  return degrees;
}

// The mobile build replaces the web's tight landscape kill rectangle (13.8x10 —
// an invisible wall that punished slingshot orbits) with a far "escaped the
// system" backstop: the camera zooms out to follow distant flights, flight
// friction guarantees the ball settles or returns, and only a truly gone ball
// is lost. Symmetric, so layout rotation can't strand a goal inside the dead
// zone again. Mutating COURSE makes the JS engine (fixture ground truth) use
// the same backstop, and the values are exported per level for the C# runtime.
function rotateOutBounds(degrees) {
  // Runs during module init (before top-level consts below), so keep the value local.
  const MOBILE_OUT_BOUNDS = 20;
  const quarterTurns = degrees / 90;
  if (!Number.isInteger(quarterTurns)) {
    throw new Error(`UNITY_EXPORT_ROTATION_DEGREES must be a multiple of 90 (out-of-bounds rectangle), got ${degrees}`);
  }

  COURSE.outBoundsX = MOBILE_OUT_BOUNDS;
  COURSE.outBoundsY = MOBILE_OUT_BOUNDS;
  return { x: COURSE.outBoundsX, y: COURSE.outBoundsY };
}

function rotateVec2InPlace(point, radians) {
  if (!point) {
    return point;
  }
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const x = point.x * cos - point.y * sin;
  const y = point.x * sin + point.y * cos;
  point.x = x;
  point.y = y;
  return point;
}

function rotateAngleDeg(angleDeg, degrees) {
  return angleDeg === undefined || angleDeg === null ? angleDeg : angleDeg + degrees;
}

function rotateAngleRad(angleRad, radians) {
  return angleRad === undefined || angleRad === null ? angleRad : angleRad + radians;
}

function rotateLaunchPreset(preset, degrees) {
  if (!preset) {
    return preset;
  }
  return {
    ...preset,
    angleDeg: rotateAngleDeg(preset.angleDeg, degrees),
  };
}

function rotateLaunchPresets(presets, degrees) {
  return Array.isArray(presets)
    ? presets.map((preset) => rotateLaunchPreset(preset, degrees))
    : presets;
}

function rotateAdminSolutions(adminSolutions, degrees) {
  return Array.isArray(adminSolutions)
    ? adminSolutions.map((solution) => ({
      ...solution,
      shots: Array.isArray(solution.shots)
        ? solution.shots.map((shot) => rotateLaunchPreset(shot, degrees))
        : solution.shots,
    }))
    : adminSolutions;
}

function rotateOrbitalBody(body, radians, seen = new Set()) {
  if (!body) {
    return;
  }
  if (seen.has(body)) {
    return;
  }
  seen.add(body);
  rotateVec2InPlace(body.basePosition, radians);
  rotateVec2InPlace(body.position, radians);
  rotateVec2InPlace(body.orbitCenter, radians);
  rotateVec2InPlace(body.velocity, radians);
  body.orbitRotation = rotateAngleRad(body.orbitRotation, radians);
}

function rotateOrbitalBodies(bodies, radians, seen = new Set()) {
  for (const body of bodies ?? []) {
    rotateOrbitalBody(body, radians, seen);
  }
}

function rotateAsteroids(asteroids, radians, degrees) {
  for (const asteroid of asteroids ?? []) {
    rotateVec2InPlace(asteroid.position, radians);
    asteroid.baseAngleDeg = rotateAngleDeg(asteroid.baseAngleDeg, degrees);
  }
}

function rotateMeteorImpacts(meteorImpacts, radians, degrees) {
  for (const meteor of meteorImpacts ?? []) {
    rotateVec2InPlace(meteor.start, radians);
    rotateVec2InPlace(meteor.target, radians);
    rotateVec2InPlace(meteor.position, radians);
    rotateVec2InPlace(meteor.targetPosition, radians);
    meteor.approachAngleDeg = rotateAngleDeg(meteor.approachAngleDeg, degrees);
  }
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

  if (!Array.isArray(level.asteroids)) {
    throw new Error(`Level ${index} (${level.id}): asteroids must be an array`);
  }
  level.asteroids.forEach((asteroid, asteroidIndex) => validateRuntimeAsteroid(asteroid, index, asteroidIndex));

  if (!Array.isArray(level.launchPresets) || level.launchPresets.length === 0) {
    throw new Error(`Level ${index} (${level.id}): launchPresets must be a non-empty array`);
  }
  level.launchPresets.forEach((preset, presetIndex) => {
    assertFiniteNumber(preset.angleDeg, `level ${index}.launchPresets[${presetIndex}].angleDeg`);
    assertFiniteNumber(preset.power, `level ${index}.launchPresets[${presetIndex}].power`);
  });
}

function validateRuntimeAsteroid(asteroid, levelIndex, asteroidIndex) {
  const prefix = `level ${levelIndex}.asteroids[${asteroidIndex}]`;

  assertInteger(asteroid.index, `${prefix}.index`);
  if (asteroid.index !== asteroidIndex) {
    throw new Error(`${prefix}.index must equal its array index`);
  }
  assertVec2(asteroid.position, `${prefix}.position`);
  assertFiniteNumber(asteroid.orbitRadius, `${prefix}.orbitRadius`);
  assertFiniteNumber(asteroid.baseAngleDeg, `${prefix}.baseAngleDeg`);
  assertFiniteNumber(asteroid.orbitAngularSpeed, `${prefix}.orbitAngularSpeed`);
  assertFiniteNumber(asteroid.radius, `${prefix}.radius`);
  assertOptionalFiniteNumber(asteroid.spinSpeed, `${prefix}.spinSpeed`);
  assertOptionalInteger(asteroid.color, `${prefix}.color`);
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
