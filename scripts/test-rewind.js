import {
  LEVELS,
  createLevelRuntime,
  directionFromAngleDeg,
  simulateShot,
} from '../src/game-core.js';

function parseArgs(argv) {
  const options = {
    level: 6,
    first: 1,
    second: 2,
    delta: 1 / 120,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === '--level' && value) {
      options.level = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--first' && value) {
      options.first = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--second' && value) {
      options.second = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--delta' && value) {
      options.delta = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: npm run test:rewind -- [options]

Options:
  --level N    1-based level index with at least two admin solutions (default: 6)
  --first N    1-based admin solution index for the first branch (default: 1)
  --second N   1-based admin solution index for the alternate branch (default: 2)
  --delta N    Simulation delta for captured frames (default: 0.008333...)
`);
}

function fail(message) {
  throw new Error(message);
}

function nearlyEqual(left, right, tolerance = 0.0001) {
  return Math.abs(left - right) <= tolerance;
}

function pointsMatch(left, right, tolerance = 0.0001) {
  return nearlyEqual(left.x, right.x, tolerance) && nearlyEqual(left.y, right.y, tolerance);
}

function createAdminShots(adminSolution) {
  return adminSolution.shots.map((shot) => ({
    angle: shot.angleDeg * Math.PI / 180,
    dragPower: shot.power,
    waitTime: shot.waitSeconds,
  }));
}

function simulateSegment(level, startState, shot, delta) {
  return simulateShot(level, shot, {
    delta,
    maxTime: 20,
    startPosition: startState.position,
    startTime: startState.time,
    anchorPlanetIndex: startState.anchorPlanetIndex,
    anchorNormal: startState.anchorNormal,
    landingCount: startState.landingCount,
    captureFrames: true,
  });
}

function sampleValue(step, totalSteps, min, max) {
  if (totalSteps <= 1) {
    return min;
  }

  return min + (step / (totalSteps - 1)) * (max - min);
}

function createInitialState(level) {
  return {
    position: level.startAnchor,
    time: 0,
    anchorPlanetIndex: level.startPlanetIndex ?? null,
    anchorNormal: directionFromAngleDeg(level.startAngleDeg ?? 180),
    landingCount: 0,
  };
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

function assertLanded(result, label) {
  if (result.outcome !== 'landed') {
    fail(`${label} did not land. Outcome: ${result.outcome}${result.reason ? ` (${result.reason})` : ''}`);
  }
}

function assertFramesCaptured(result, label) {
  if (!Array.isArray(result.frames) || result.frames.length < 2) {
    fail(`${label} did not capture enough rewind frames.`);
  }
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

function findLandingBranches(level, startState, delta, desiredCount = 2) {
  const found = [];

  for (let angleIndex = 0; angleIndex < 72 && found.length < desiredCount; angleIndex += 1) {
    const angle = sampleValue(angleIndex, 72, 0, Math.PI * 2);

    for (let powerIndex = 0; powerIndex < 18 && found.length < desiredCount; powerIndex += 1) {
      const dragPower = sampleValue(powerIndex, 18, 0.5, 2.75);

      for (let waitIndex = 0; waitIndex < 8 && found.length < desiredCount; waitIndex += 1) {
        const waitTime = sampleValue(waitIndex, 8, 0, 4);
        const shot = { angle, dragPower, waitTime };
        const result = simulateSegment(level, startState, shot, delta);
        if (result.outcome !== 'landed') {
          continue;
        }

        found.push({ shot, result });
      }
    }
  }

  if (found.length < desiredCount) {
    fail('Could not find enough landing branches for rewind testing.');
  }

  return found;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const levelIndex = options.level - 1;
  const levelSource = LEVELS[levelIndex];
  if (!levelSource) {
    fail(`Invalid level index: ${options.level}`);
  }

  const adminSolutions = Array.isArray(levelSource.adminSolutions) ? levelSource.adminSolutions : [];
  const firstSolution = adminSolutions[options.first - 1];
  const secondSolution = adminSolutions[options.second - 1];
  if (!firstSolution || !secondSolution) {
    fail(`Level ${options.level} does not have admin solutions ${options.first} and ${options.second}.`);
  }

  const firstShots = createAdminShots(firstSolution);
  const secondShots = createAdminShots(secondSolution);
  if (firstShots.length < 2 || secondShots.length < 2) {
    fail('Both solutions must have at least two shots for rewind branching.');
  }

  const sharedPrefixLength = Math.min(firstShots.length, secondShots.length) - 1;
  for (let index = 0; index < sharedPrefixLength; index += 1) {
    const left = firstShots[index];
    const right = secondShots[index];
    if (
      !nearlyEqual(left.angle, right.angle, 0.0001)
      || !nearlyEqual(left.dragPower, right.dragPower, 0.0001)
      || !nearlyEqual(left.waitTime, right.waitTime, 0.0001)
    ) {
      fail('The chosen admin solutions do not share a common prefix before the branch.');
    }
  }

  const level = createLevelRuntime(levelIndex);
  let state = createInitialState(level);
  const rewindHistory = [];

  for (let index = 0; index < sharedPrefixLength; index += 1) {
    const result = simulateSegment(level, state, firstShots[index], options.delta);
    assertLanded(result, `Shared segment ${index + 1}`);
    assertFramesCaptured(result, `Shared segment ${index + 1}`);
    rewindHistory.push(result.frames);
    state = createAnchoredStateFromResult(result);
  }

  const branchStartState = state;
  let branchAShot = firstShots[sharedPrefixLength];
  let branchBShot = secondShots[sharedPrefixLength];
  let branchAResult = simulateSegment(level, branchStartState, branchAShot, options.delta);
  let branchBResult = simulateSegment(level, branchStartState, branchBShot, options.delta);

  if (branchAResult.outcome !== 'landed' || branchBResult.outcome !== 'landed') {
    const landingBranches = findLandingBranches(level, branchStartState, options.delta, 2);
    branchAShot = landingBranches[0].shot;
    branchBShot = landingBranches[1].shot;
    branchAResult = landingBranches[0].result;
    branchBResult = landingBranches[1].result;
  }

  assertLanded(branchAResult, 'Branch A');
  assertFramesCaptured(branchAResult, 'Branch A');
  rewindHistory.push(branchAResult.frames);

  // Rewind the latest branch and take the alternate shot from the same restored anchor.
  rewindHistory.pop();
  assertLanded(branchBResult, 'Branch B');
  assertFramesCaptured(branchBResult, 'Branch B');
  rewindHistory.push(branchBResult.frames);

  const latestBranchFirstFrame = branchBResult.frames[0];
  assertFrameMatchesState(latestBranchFirstFrame, branchStartState, 'Branch B first frame');

  const previousSegment = rewindHistory[rewindHistory.length - 2];
  const previousSegmentLandingFrame = previousSegment[previousSegment.length - 1];
  if (!pointsMatch(latestBranchFirstFrame.position, previousSegmentLandingFrame.position, 0.005)) {
    fail('Branch boundary is discontinuous: branch rewind does not reconnect to the previous landing.');
  }
  if (!nearlyEqual(latestBranchFirstFrame.time, previousSegmentLandingFrame.time, 0.005)) {
    fail('Branch boundary time is discontinuous.');
  }

  const branchWaitFrames = branchBResult.frames.length - branchBResult.steps - 2;
  console.log(`Level ${options.level}: ${level.name}`);
  console.log(`Shared segments kept: ${rewindHistory.length - 1}`);
  console.log(`Branch A frames discarded after rewind: ${branchAResult.frames.length}`);
  console.log(`Branch B frames captured: ${branchBResult.frames.length}`);
  console.log(`Branch B anchored wait frames captured: ${Math.max(0, branchWaitFrames)}`);
  console.log(`Branch A shot: wait ${branchAShot.waitTime.toFixed(2)}s, angle ${(branchAShot.angle * 180 / Math.PI).toFixed(1)} deg, power ${branchAShot.dragPower.toFixed(2)}`);
  console.log(`Branch B shot: wait ${branchBShot.waitTime.toFixed(2)}s, angle ${(branchBShot.angle * 180 / Math.PI).toFixed(1)} deg, power ${branchBShot.dragPower.toFixed(2)}`);
  console.log('Rewind branch continuity check passed.');
}

main();
