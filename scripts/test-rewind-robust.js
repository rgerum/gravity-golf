import {
  LEVELS,
  MAX_DRAG_DISTANCE,
  createLevelRuntime,
  directionFromAngleDeg,
  simulateShot,
  syncBallToAnchor,
} from '../src/game-core.js';

function parseArgs(argv) {
  const options = {
    level: 'all',
    angles: 24,
    powers: 14,
    waits: 6,
    maxWait: 4,
    delta: 1 / 120,
    maxFirstStage: 4,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === '--level' && value) {
      options.level = value;
      index += 1;
    } else if (arg === '--angles' && value) {
      options.angles = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--powers' && value) {
      options.powers = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--waits' && value) {
      options.waits = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--max-wait' && value) {
      options.maxWait = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--delta' && value) {
      options.delta = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--max-first-stage' && value) {
      options.maxFirstStage = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: npm run test:rewind:robust -- [options]

Options:
  --level all|N|N,M   Levels to scan for branching rewind scenarios (default: all)
  --angles N          Angle samples per search stage (default: 24)
  --powers N          Power samples per search stage (default: 14)
  --waits N           Wait samples per search stage (default: 6)
  --max-wait N        Max wait seconds sampled (default: 4)
  --delta N           Simulation delta for captured frames (default: 1/120)
  --max-first-stage N Max first-stage landing candidates to explore (default: 4)
`);
}

function fail(message) {
  throw new Error(message);
}

function parseLevelSelection(selection) {
  if (selection === 'all') {
    return LEVELS.map((_, index) => index);
  }

  return selection
    .split(',')
    .map((entry) => Number.parseInt(entry, 10) - 1)
    .filter((index) => Number.isInteger(index) && index >= 0 && index < LEVELS.length);
}

function sampleValue(step, totalSteps, min, max) {
  if (totalSteps <= 1) {
    return min;
  }

  return min + (step / (totalSteps - 1)) * (max - min);
}

function nearlyEqual(left, right, tolerance = 0.0001) {
  return Math.abs(left - right) <= tolerance;
}

function pointsMatch(left, right, tolerance = 0.0001) {
  return nearlyEqual(left.x, right.x, tolerance) && nearlyEqual(left.y, right.y, tolerance);
}

function createInitialState(level) {
  const state = {
    position: level.startAnchor,
    time: 0,
    anchorPlanetIndex: level.startPlanetIndex ?? null,
    anchorNormal: directionFromAngleDeg(level.startAngleDeg ?? 180),
    landingCount: 0,
  };
  syncBallToAnchor(level, state);
  return state;
}

function createAnchoredStateFromResult(result) {
  return {
    position: result.finalPosition,
    time: result.finalTime,
    anchorPlanetIndex: result.anchorPlanetIndex,
    anchorNormal: result.anchorNormal,
    landingCount: result.landingCount,
  };
}

function simulateSegment(level, startState, shot, options) {
  return simulateShot(level, shot, {
    delta: options.delta,
    maxTime: 20,
    startPosition: startState.position,
    startTime: startState.time,
    anchorPlanetIndex: startState.anchorPlanetIndex,
    anchorNormal: startState.anchorNormal,
    landingCount: startState.landingCount,
    captureFrames: true,
  });
}

function shotKey(shot) {
  return `${shot.angle.toFixed(4)}:${shot.dragPower.toFixed(3)}:${shot.waitTime.toFixed(3)}`;
}

function candidateKey(candidate) {
  const result = candidate.result;
  return [
    result.planetIndex ?? -1,
    result.finalTime.toFixed(2),
    result.finalPosition.x.toFixed(2),
    result.finalPosition.y.toFixed(2),
  ].join(':');
}

function findLandingShots(level, startState, options, desiredCount = 2) {
  const found = [];
  const seenCandidates = new Set();

  for (let angleIndex = 0; angleIndex < options.angles && found.length < desiredCount; angleIndex += 1) {
    const angle = sampleValue(angleIndex, options.angles, 0, Math.PI * 2);

    for (let powerIndex = 0; powerIndex < options.powers && found.length < desiredCount; powerIndex += 1) {
      const dragPower = sampleValue(powerIndex, options.powers, 0.45, MAX_DRAG_DISTANCE);

      for (let waitIndex = 0; waitIndex < options.waits && found.length < desiredCount; waitIndex += 1) {
        const waitTime = sampleValue(waitIndex, options.waits, 0, options.maxWait);
        const shot = { angle, dragPower, waitTime };
        const result = simulateSegment(level, startState, shot, options);
        if (result.outcome !== 'landed' || !Array.isArray(result.frames) || result.frames.length < 2) {
          continue;
        }

        const candidate = { shot, result };
        const key = candidateKey(candidate);
        if (seenCandidates.has(key)) {
          continue;
        }

        seenCandidates.add(key);
        found.push(candidate);
      }
    }
  }

  return found;
}

function findBranchScenario(level, options) {
  const initialState = createInitialState(level);
  const firstStageCandidates = findLandingShots(level, initialState, options, options.maxFirstStage);

  for (const firstStage of firstStageCandidates) {
    const branchStart = createAnchoredStateFromResult(firstStage.result);
    const branches = findLandingShots(level, branchStart, options, 3)
      .filter((candidate) => shotKey(candidate.shot) !== shotKey(firstStage.shot));

    if (branches.length >= 2) {
      return {
        initialState,
        shared: [firstStage],
        branchA: branches[0],
        branchB: branches[1],
      };
    }
  }

  return null;
}

function assertFrameMatchesState(frame, state, label) {
  if (!pointsMatch(frame.position, state.position, 0.005)) {
    fail(`${label} position mismatch.`);
  }
  if (!nearlyEqual(frame.time, state.time, 0.005)) {
    fail(`${label} time mismatch.`);
  }
  if ((frame.anchorPlanetIndex ?? null) !== (state.anchorPlanetIndex ?? null)) {
    fail(`${label} anchor mismatch.`);
  }
}

function validateReversePath(level, scenario) {
  const forwardSegments = [...scenario.shared, scenario.branchB];
  let expectedAnchor = createAnchoredStateFromResult(scenario.branchB.result);
  let maxBoundaryJump = 0;

  for (let index = forwardSegments.length - 1; index >= 0; index -= 1) {
    const segment = forwardSegments[index];
    const frames = segment.result.frames;
    const firstFrame = frames[0];
    const lastFrame = frames[frames.length - 1];
    assertFrameMatchesState(lastFrame, expectedAnchor, `Segment ${index + 1} landing`);

    const restoreState = index > 0
      ? createAnchoredStateFromResult(forwardSegments[index - 1].result)
      : scenario.initialState;
    assertFrameMatchesState(firstFrame, restoreState, `Segment ${index + 1} launch checkpoint`);

    maxBoundaryJump = Math.max(
      maxBoundaryJump,
      Math.hypot(lastFrame.position.x - expectedAnchor.position.x, lastFrame.position.y - expectedAnchor.position.y),
      Math.hypot(firstFrame.position.x - restoreState.position.x, firstFrame.position.y - restoreState.position.y),
    );

    expectedAnchor = restoreState;
  }

  assertFrameMatchesState(
    forwardSegments[0].result.frames[0],
    scenario.initialState,
    'Final rewind start state',
  );

  return { maxBoundaryJump };
}

function describeShot(shot) {
  return `wait ${shot.waitTime.toFixed(2)}s, angle ${(shot.angle * 180 / Math.PI).toFixed(1)} deg, power ${shot.dragPower.toFixed(2)}`;
}

function runLevel(levelIndex, options) {
  const level = createLevelRuntime(levelIndex);
  const scenario = findBranchScenario(level, options);
  if (!scenario) {
    return { skipped: true, level, levelIndex };
  }

  const branchStart = createAnchoredStateFromResult(scenario.shared[scenario.shared.length - 1].result);
  assertFrameMatchesState(
    scenario.branchA.result.frames[0],
    branchStart,
    `${level.name} branch A start`,
  );
  assertFrameMatchesState(
    scenario.branchB.result.frames[0],
    branchStart,
    `${level.name} branch B start`,
  );

  const validation = validateReversePath(level, scenario);
  return {
    skipped: false,
    level,
    levelIndex,
    scenario,
    validation,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const levelIndexes = parseLevelSelection(options.level);
  if (levelIndexes.length === 0) {
    fail('No valid levels selected.');
  }

  const results = [];
  for (const levelIndex of levelIndexes) {
    results.push(runLevel(levelIndex, options));
  }

  const exercised = results.filter((result) => !result.skipped);
  if (exercised.length === 0) {
    fail('No branching rewind scenarios were found for the selected levels.');
  }

  for (const result of exercised) {
    console.log(`Level ${result.levelIndex + 1}: ${result.level.name}`);
    console.log(`  Shared: ${describeShot(result.scenario.shared[0].shot)}`);
    console.log(`  Branch A: ${describeShot(result.scenario.branchA.shot)}`);
    console.log(`  Branch B: ${describeShot(result.scenario.branchB.shot)}`);
    console.log(`  Max boundary jump: ${result.validation.maxBoundaryJump.toFixed(5)}`);
  }

  const skipped = results.filter((result) => result.skipped);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} level(s) with no discovered 2-stage branch scenario.`);
  }

  console.log(`Validated ${exercised.length} branching rewind scenario(s).`);
}

main();
