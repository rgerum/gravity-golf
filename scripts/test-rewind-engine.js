import {
  LEVELS,
  MAX_DRAG_DISTANCE,
  advanceBallAnchor,
  createLevelRuntime,
  directionFromAngleDeg,
  reverseStepBall,
  setLevelTime,
  stepBall,
  syncBallToAnchor,
  simulateShot,
} from '../src/game-core.js';

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const options = {
    level: '6,9',
    angles: 24,
    powers: 14,
    waits: 6,
    maxWait: 4,
    delta: 1 / 120,
    maxFirstStage: 4,
    extraWait: 0.75,
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
    } else if (arg === '--extra-wait' && value) {
      options.extraWait = Number.parseFloat(value);
      index += 1;
    }
  }

  return options;
}

function parseLevelSelection(selection) {
  return selection
    .split(',')
    .map((entry) => Number.parseInt(entry, 10) - 1)
    .filter((index) => Number.isInteger(index) && index >= 0 && index < LEVELS.length);
}

function nearlyEqual(left, right, tolerance = 0.001) {
  return Math.abs(left - right) <= tolerance;
}

function pointsMatch(left, right, tolerance = 0.001) {
  return nearlyEqual(left.x, right.x, tolerance) && nearlyEqual(left.y, right.y, tolerance);
}

function assertStateMatches(actual, expected, label, tolerance = 0.01) {
  if (!pointsMatch(actual.position, expected.position, tolerance)) {
    fail(`${label} position mismatch.`);
  }
  if (!nearlyEqual(actual.time, expected.time, tolerance)) {
    fail(`${label} time mismatch.`);
  }
  if ((actual.anchorPlanetIndex ?? null) !== (expected.anchorPlanetIndex ?? null)) {
    fail(`${label} anchor mismatch.`);
  }
}

function createInitialState(level) {
  const state = {
    position: { ...level.startAnchor },
    velocity: { x: 0, y: 0 },
    time: level.startTimeSeconds ?? 0,
    landingCount: 0,
    launchGracePlanetIndex: level.startPlanetIndex ?? null,
    anchorPlanetIndex: level.startPlanetIndex ?? null,
    anchorNormal: directionFromAngleDeg(level.startAngleDeg ?? 180),
  };
  setLevelTime(level, state.time);
  syncBallToAnchor(level, state);
  return state;
}

function cloneBallState(ball) {
  return {
    position: { ...ball.position },
    velocity: { ...ball.velocity },
    time: ball.time ?? 0,
    landingCount: ball.landingCount ?? 0,
    launchGracePlanetIndex: ball.launchGracePlanetIndex ?? null,
    anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
    anchorNormal: ball.anchorNormal ? { ...ball.anchorNormal } : null,
  };
}

function createAnchoredStateFromResult(result) {
  return {
    position: { ...result.finalPosition },
    velocity: { x: 0, y: 0 },
    time: result.finalTime,
    landingCount: result.landingCount,
    launchGracePlanetIndex: null,
    anchorPlanetIndex: result.anchorPlanetIndex,
    anchorNormal: result.anchorNormal ? { ...result.anchorNormal } : null,
  };
}

function createAnchoredStateAt(level, checkpoint, targetTime) {
  const ball = cloneBallState(checkpoint);
  setLevelTime(level, checkpoint.time ?? 0);
  syncBallToAnchor(level, ball);
  const delta = targetTime - (checkpoint.time ?? 0);
  if (Math.abs(delta) > 0.000001) {
    setLevelTime(level, targetTime);
    ball.time = targetTime;
    advanceBallAnchor(level, ball, delta);
  }
  return ball;
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

function sampleValue(step, totalSteps, min, max) {
  if (totalSteps <= 1) {
    return min;
  }

  return min + (step / (totalSteps - 1)) * (max - min);
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
        if (result.outcome !== 'landed' || !Array.isArray(result.frames) || result.frames.length < 3) {
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
        branchB: branches[1],
      };
    }
  }

  return null;
}

function findLaunchFrameIndex(frames) {
  return frames.findIndex((frame) => frame.anchorPlanetIndex === null);
}

function validateAnchoredReverse(levelIndex, checkpoint, targetTime, delta, expectedFrames, label) {
  const level = createLevelRuntime(levelIndex);
  const ball = createAnchoredStateAt(level, checkpoint, targetTime);
  let frameIndex = expectedFrames ? expectedFrames.length - 1 : -1;

  if (frameIndex >= 0) {
    assertStateMatches(ball, expectedFrames[frameIndex], `${label} frame ${frameIndex}`);
  }

  while ((ball.time ?? 0) > (checkpoint.time ?? 0) + 0.000001) {
    const previousTime = Math.max(checkpoint.time ?? 0, (ball.time ?? 0) - delta);
    const stepDelta = previousTime - (ball.time ?? 0);
    setLevelTime(level, previousTime);
    ball.time = previousTime;
    advanceBallAnchor(level, ball, stepDelta);
    if (frameIndex > 0) {
      frameIndex -= 1;
      assertStateMatches(ball, expectedFrames[frameIndex], `${label} frame ${frameIndex}`);
    }
  }

  return ball;
}

function validateFlightReverse(levelIndex, result, launchPlanetIndex, delta, label) {
  const level = createLevelRuntime(levelIndex);
  const ball = cloneBallState(result.eventState);
  setLevelTime(level, ball.time);
  const frames = result.frames;
  const launchFrameIndex = findLaunchFrameIndex(frames);
  if (launchFrameIndex <= 0) {
    fail(`${label} did not capture a launch frame.`);
  }

  assertStateMatches(ball, result.eventState, `${label} event frame`);
  for (let index = frames.length - 2; index >= launchFrameIndex; index -= 1) {
    reverseStepBall(level, ball, delta, { launchPlanetIndex });
    assertStateMatches(ball, frames[index], `${label} reverse flight ${index}`);
  }

  return {
    ball,
    launchFrameIndex,
  };
}

function validateFlightForward(levelIndex, result, delta, label) {
  const level = createLevelRuntime(levelIndex);
  const ball = cloneBallState(result.launchState);
  setLevelTime(level, ball.time);
  const frames = result.frames;
  const launchFrameIndex = findLaunchFrameIndex(frames);
  if (launchFrameIndex <= 0) {
    fail(`${label} did not capture a launch frame.`);
  }

  assertStateMatches(ball, frames[launchFrameIndex], `${label} launch frame`);
  let frameIndex = launchFrameIndex + 1;
  while (frameIndex < frames.length) {
    const stepResult = stepBall(level, ball, delta);
    if (stepResult.type === 'flying') {
      if (frameIndex >= frames.length - 1) {
        fail(`${label} overshot the captured flight frames.`);
      }
      assertStateMatches(ball, frames[frameIndex], `${label} forward flight ${frameIndex}`);
      frameIndex += 1;
      continue;
    }

    if (stepResult.type !== 'landed') {
      fail(`${label} ended with ${stepResult.type} while replaying forward.`);
    }
    return stepResult;
  }

  fail(`${label} forward replay never reached its landing event.`);
}

function validateSegment(levelIndex, startState, shot, result, options, label) {
  if (result.outcome !== 'landed' || !result.launchState || !result.eventState) {
    fail(`${label} does not have reversible launch/landing data.`);
  }

  const launchFrameIndex = findLaunchFrameIndex(result.frames);
  if (launchFrameIndex <= 0) {
    fail(`${label} did not capture enough anchored wait frames.`);
  }

  const landingState = createAnchoredStateFromResult(result);
  const preLaunchFrames = result.frames.slice(0, launchFrameIndex);
  const launchAnchorState = createAnchoredStateAt(
    createLevelRuntime(levelIndex),
    startState,
    result.launchState.time,
  );
  assertStateMatches(launchAnchorState, preLaunchFrames[preLaunchFrames.length - 1], `${label} launch anchor`);

  const landedEndState = createAnchoredStateAt(
    createLevelRuntime(levelIndex),
    landingState,
    landingState.time + options.extraWait,
  );

  const reverseLandingBall = validateAnchoredReverse(
    levelIndex,
    landingState,
    landedEndState.time,
    options.delta,
    null,
    `${label} landing anchor`,
  );
  assertStateMatches(reverseLandingBall, landingState, `${label} landed checkpoint`);

  const reverseFlight = validateFlightReverse(
    levelIndex,
    result,
    startState.anchorPlanetIndex,
    options.delta,
    label,
  );
  assertStateMatches(reverseFlight.ball, result.launchState, `${label} reverse launch state`);

  const reverseAnchorBall = validateAnchoredReverse(
    levelIndex,
    startState,
    result.launchState.time,
    options.delta,
    preLaunchFrames,
    `${label} pre-launch anchor`,
  );
  assertStateMatches(reverseAnchorBall, startState, `${label} rewind start state`);

  const forwardFlightResult = validateFlightForward(levelIndex, result, options.delta, label);
  assertStateMatches(forwardFlightResult.eventState, result.eventState, `${label} forward event state`);

  return {
    finalLandingState: landingState,
  };
}

function runLevel(levelIndex, options) {
  const level = createLevelRuntime(levelIndex);
  const scenario = findBranchScenario(level, options);
  if (!scenario) {
    return { skipped: true, level, levelIndex };
  }

  let startState = scenario.initialState;
  const segments = [...scenario.shared, scenario.branchB];
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    validateSegment(levelIndex, startState, segment.shot, segment.result, options, `Level ${levelIndex + 1} segment ${index + 1}`);
    startState = createAnchoredStateFromResult(segment.result);
  }

  return {
    skipped: false,
    level,
    levelIndex,
    scenario,
  };
}

function describeShot(shot) {
  return `wait ${shot.waitTime.toFixed(2)}s, angle ${(shot.angle * 180 / Math.PI).toFixed(1)} deg, power ${shot.dragPower.toFixed(2)}`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const levelIndexes = parseLevelSelection(options.level);
  if (levelIndexes.length === 0) {
    fail('No valid levels selected.');
  }

  const results = levelIndexes.map((levelIndex) => runLevel(levelIndex, options));
  const exercised = results.filter((result) => !result.skipped);
  if (exercised.length === 0) {
    fail('No branching rewind scenarios were found for the selected levels.');
  }

  for (const result of exercised) {
    console.log(`Level ${result.levelIndex + 1}: ${result.level.name}`);
    console.log(`  Shared: ${describeShot(result.scenario.shared[0].shot)}`);
    console.log(`  Branch B: ${describeShot(result.scenario.branchB.shot)}`);
    console.log('  Reversible segment playback passed.');
  }

  const skipped = results.filter((result) => result.skipped);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} level(s) with no discovered 2-stage branch scenario.`);
  }

  console.log(`Validated ${exercised.length} reversible branching scenario(s).`);
}

main();
