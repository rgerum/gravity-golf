import {
  LEVELS,
  MAX_DRAG_DISTANCE,
  createLevelRuntime,
  directionFromAngleDeg,
  simulateShot,
} from '../src/game-core.js';

function parseArgs(argv) {
  const options = {
    level: 'all',
    angles: 180,
    powers: 24,
    top: 5,
    maxTime: 18,
    maxShots: 2,
    waits: 8,
    maxWait: 5,
    maxLandingsPerPlanet: 4,
    minPower: 0.2,
    robustAngleDeg: 4,
    robustPower: 0.18,
    robustSteps: 2,
    minRobustRate: 0.35,
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
    } else if (arg === '--top' && value) {
      options.top = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--max-time' && value) {
      options.maxTime = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--max-shots' && value) {
      options.maxShots = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--waits' && value) {
      options.waits = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--max-wait' && value) {
      options.maxWait = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--max-landings-per-planet' && value) {
      options.maxLandingsPerPlanet = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--min-power' && value) {
      options.minPower = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--robust-angle-deg' && value) {
      options.robustAngleDeg = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--robust-power' && value) {
      options.robustPower = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--robust-steps' && value) {
      options.robustSteps = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === '--min-robust-rate' && value) {
      options.minRobustRate = Number.parseFloat(value);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: npm run test:levels -- [options]

Options:
  --level all|1|1,3     Test all levels or one/many 1-based level indexes
  --angles N            Number of launch angles to sample (default: 180)
  --powers N            Number of pull strengths to sample (default: 24)
  --top N               Number of best scoring shots to print (default: 5)
  --max-time SECONDS    Max simulated flight time per shot (default: 18)
  --max-shots N         Maximum shots to chain together (default: 2)
  --waits N             Number of launch wait samples from 0 to max-wait (default: 8)
  --max-wait SECONDS    Maximum pre-launch wait to test (default: 5)
  --max-landings-per-planet N
                        Landing candidates to keep per relay world (default: 4)
  --min-power VALUE     Minimum pull strength to test (default: 0.2)
  --robust-angle-deg N  Angle neighborhood in degrees for robustness checks (default: 4)
  --robust-power VALUE  Power neighborhood for robustness checks (default: 0.18)
  --robust-steps N      Neighborhood radius in samples; 2 => 5x5 grid (default: 2)
  --min-robust-rate N   Minimum neighborhood success rate to accept a shot (default: 0.35)
`);
}

function getLevelIndexes(selection) {
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createMisses() {
  return {
    planet: 0,
    bounds: 0,
    settled: 0,
    timeout: 0,
    landed: 0,
  };
}

function mergeMisses(target, source) {
  for (const key of Object.keys(target)) {
    target[key] += source[key] ?? 0;
  }
}

function simulateSequence(level, shots, options) {
  let startPosition = level.start;
  let startTime = 0;
  let anchorPlanetIndex = level.startPlanetIndex ?? null;
  let anchorNormal = directionFromAngleDeg(level.startAngleDeg ?? 180);
  let landingCount = 0;
  let totalTime = 0;
  let totalSteps = 0;
  let minGoalDistance = Number.POSITIVE_INFINITY;
  let minPlanetClearance = Number.POSITIVE_INFINITY;
  let lastOutcome = 'timeout';
  let lastReason = '';
  let landedPlanets = [];

  for (let index = 0; index < shots.length; index += 1) {
    const result = simulateShot(level, shots[index], {
      maxTime: options.maxTime,
      startPosition,
      startTime,
      anchorPlanetIndex,
      anchorNormal,
      landingCount,
    });

    totalTime += result.time + result.waitTime;
    totalSteps += result.steps;
    minGoalDistance = Math.min(minGoalDistance, result.minGoalDistance);
    minPlanetClearance = Math.min(minPlanetClearance, result.minPlanetClearance);
    lastOutcome = result.outcome;
    lastReason = result.reason;

    if (result.outcome === 'goal') {
      return {
        outcome: 'goal',
        reason: '',
        time: totalTime,
        steps: totalSteps,
        minGoalDistance,
        minPlanetClearance,
        finalPosition: result.finalPosition,
        landedPlanets,
      };
    }

    if (result.outcome !== 'landed') {
      return {
        outcome: result.outcome,
        reason: result.reason,
        time: totalTime,
        steps: totalSteps,
        minGoalDistance,
        minPlanetClearance,
        finalPosition: result.finalPosition,
        landedPlanets,
      };
    }

    landedPlanets = [...landedPlanets, result.planetName];
    startPosition = result.finalPosition;
    startTime = result.finalTime;
    anchorPlanetIndex = result.anchorPlanetIndex;
    anchorNormal = result.anchorNormal;
    landingCount = result.landingCount;
  }

  return {
    outcome: lastOutcome,
    reason: lastReason,
    time: totalTime,
    steps: totalSteps,
    minGoalDistance,
    minPlanetClearance,
    finalPosition: startPosition,
    landedPlanets,
  };
}

function evaluateRobustness(level, solution, options) {
  const angleTolerance = options.robustAngleDeg * Math.PI / 180;
  const powerTolerance = options.robustPower;
  const radius = Math.max(0, options.robustSteps);
  let neighborhoodGoals = 0;
  let neighborhoodSamples = 0;

  for (let shotIndex = 0; shotIndex < solution.shots.length; shotIndex += 1) {
    for (let angleStep = -radius; angleStep <= radius; angleStep += 1) {
      for (let powerStep = -radius; powerStep <= radius; powerStep += 1) {
        const angleOffset = radius === 0 ? 0 : (angleStep / radius) * angleTolerance;
        const powerOffset = radius === 0 ? 0 : (powerStep / radius) * powerTolerance;
        const perturbedShots = solution.shots.map((shot, index) => (
          index === shotIndex
            ? {
                angle: shot.angle + angleOffset,
                dragPower: clamp(
                  shot.dragPower + powerOffset,
                  options.minPower,
                  MAX_DRAG_DISTANCE,
                ),
                waitTime: shot.waitTime,
              }
            : shot
        ));
        const result = simulateSequence(level, perturbedShots, options);
        neighborhoodSamples += 1;
        if (result.outcome === 'goal') {
          neighborhoodGoals += 1;
        }
      }
    }
  }

  return {
    neighborhoodGoals,
    neighborhoodSamples,
    robustRate: neighborhoodGoals / neighborhoodSamples,
  };
}

function buildShot(angle, dragPower, waitTime) {
  return { angle, dragPower, waitTime };
}

function chooseLandingCandidates(candidates, options) {
  const byPlanet = new Map();

  for (const candidate of candidates) {
    const key = candidate.result.planetIndex;
    if (!byPlanet.has(key)) {
      byPlanet.set(key, []);
    }
    byPlanet.get(key).push(candidate);
  }

  const selected = [];
  for (const group of byPlanet.values()) {
    group.sort((left, right) => (
      left.result.minGoalDistance - right.result.minGoalDistance ||
      left.result.time - right.result.time ||
      right.result.minPlanetClearance - left.result.minPlanetClearance
    ));
    selected.push(...group.slice(0, options.maxLandingsPerPlanet));
  }

  return selected;
}

function searchSolutions(
  level,
  startPosition,
  startTime,
  anchorPlanetIndex,
  anchorNormal,
  landingCount,
  options,
  remainingShots,
  pathShots = [],
  visitedPlanets = new Set(),
) {
  const misses = createMisses();
  const directSolutions = [];
  const landingCandidates = [];

  for (let angleIndex = 0; angleIndex < options.angles; angleIndex += 1) {
    const angle = sampleValue(angleIndex, options.angles, 0, Math.PI * 2);

    for (let powerIndex = 0; powerIndex < options.powers; powerIndex += 1) {
      const dragPower = sampleValue(
        powerIndex,
        options.powers,
        options.minPower,
        MAX_DRAG_DISTANCE,
      );

      for (let waitIndex = 0; waitIndex < options.waits; waitIndex += 1) {
        const waitTime = sampleValue(waitIndex, options.waits, 0, options.maxWait);
        const shot = buildShot(angle, dragPower, waitTime);
        const result = simulateShot(level, shot, {
          maxTime: options.maxTime,
          startPosition,
          startTime,
          anchorPlanetIndex,
          anchorNormal,
          landingCount,
        });

        if (result.outcome === 'goal') {
          directSolutions.push({ shots: [...pathShots, shot] });
        } else if (result.outcome === 'landed') {
          misses.landed += 1;
          if (
            remainingShots > 1 &&
            result.planetIndex !== null &&
            !visitedPlanets.has(result.planetIndex)
          ) {
            landingCandidates.push({ shot, result });
          }
        } else if (result.outcome === 'crash') {
          misses[result.reason] += 1;
        } else if (result.outcome === 'settled') {
          misses.settled += 1;
        } else {
          misses.timeout += 1;
        }
      }
    }
  }

  const chainedSolutions = [];
  for (const candidate of chooseLandingCandidates(landingCandidates, options)) {
    const nextVisitedPlanets = new Set(visitedPlanets);
    nextVisitedPlanets.add(candidate.result.planetIndex);
    const nested = searchSolutions(
      level,
      candidate.result.finalPosition,
      candidate.result.finalTime,
      candidate.result.anchorPlanetIndex,
      candidate.result.anchorNormal,
      candidate.result.landingCount,
      options,
      remainingShots - 1,
      [...pathShots, candidate.shot],
      nextVisitedPlanets,
    );
    mergeMisses(misses, nested.misses);
    chainedSolutions.push(...nested.solutions);
  }

  return {
    misses,
    solutions: [...directSolutions, ...chainedSolutions],
  };
}

function dedupeSolutions(solutions) {
  const seen = new Set();
  const deduped = [];

  for (const solution of solutions) {
    const key = solution.shots
      .map((shot) => `${shot.angle.toFixed(4)}:${shot.dragPower.toFixed(3)}:${shot.waitTime.toFixed(3)}`)
      .join('|');

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(solution);
    }
  }

  return deduped;
}

function testLevel(levelIndex, options) {
  const level = createLevelRuntime(levelIndex);
  const search = searchSolutions(
    level,
    level.start,
    0,
    level.startPlanetIndex ?? null,
    directionFromAngleDeg(level.startAngleDeg ?? 180),
    0,
    options,
    options.maxShots,
  );
  const solutions = [];
  const robustSolutions = [];
  const misses = search.misses;

  for (const solution of dedupeSolutions(search.solutions)) {
    const sequenceResult = simulateSequence(level, solution.shots, options);
    if (sequenceResult.outcome !== 'goal') {
      continue;
    }

    const enriched = {
      ...solution,
      ...sequenceResult,
      ...evaluateRobustness(level, solution, options),
    };
    solutions.push(enriched);
    if (enriched.robustRate >= options.minRobustRate) {
      robustSolutions.push(enriched);
    }
  }

  const sortShots = (left, right) => (
    right.robustRate - left.robustRate ||
    right.neighborhoodGoals - left.neighborhoodGoals ||
    left.shots.length - right.shots.length ||
    left.time - right.time ||
    right.minPlanetClearance - left.minPlanetClearance
  );

  solutions.sort(sortShots);
  robustSolutions.sort(sortShots);

  return { level, solutions, robustSolutions, misses };
}

function formatAngle(angle) {
  return `${(angle * 180 / Math.PI).toFixed(1)} deg`;
}

function formatShotSequence(solution) {
  return solution.shots
    .map((shot, index) => `S${index + 1} wait ${shot.waitTime.toFixed(2)}s, ${formatAngle(shot.angle)} @ ${shot.dragPower.toFixed(2)}`)
    .join(' -> ');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const levelIndexes = getLevelIndexes(options.level);

  if (levelIndexes.length === 0) {
    console.error('No valid levels selected.');
    process.exit(1);
  }

  let allPassed = true;

  for (const levelIndex of levelIndexes) {
    const { level, solutions, robustSolutions, misses } = testLevel(levelIndex, options);
    const sampleCount = options.angles * options.powers * options.waits;

    console.log(`Level ${levelIndex + 1}/${LEVELS.length}: ${level.name}`);
    console.log(`  ${level.summary}`);
    console.log(`  Samples: ${sampleCount}`);
    console.log(`  Raw solutions found: ${solutions.length}`);
    console.log(`  Robust solutions found: ${robustSolutions.length} (threshold ${options.minRobustRate.toFixed(2)})`);
    console.log(
      `  Misses: planet=${misses.planet}, bounds=${misses.bounds}, settled=${misses.settled}, timeout=${misses.timeout}, landed=${misses.landed}`,
    );

    if (robustSolutions.length === 0) {
      if (solutions.length === 0) {
        console.log('  No scoring shots found in this sample grid.');
      } else {
        console.log('  Only fragile one-off shots found; no robust solutions passed the threshold.');
      }
      allPassed = false;
    } else {
      const limit = Math.min(options.top, robustSolutions.length);
      console.log(`  Best ${limit} robust shots:`);
      for (let index = 0; index < limit; index += 1) {
        const solution = robustSolutions[index];
        console.log(
          `    ${index + 1}. ${formatShotSequence(solution)}, robust=${solution.robustRate.toFixed(2)} (${solution.neighborhoodGoals}/${solution.neighborhoodSamples}), time=${solution.time.toFixed(2)}s, clearance=${solution.minPlanetClearance.toFixed(2)}, landings=${solution.landedPlanets.length === 0 ? 'none' : solution.landedPlanets.join(', ')}`,
        );
      }
    }

    console.log('');
  }

  if (!allPassed) {
    process.exit(1);
  }
}

main();
