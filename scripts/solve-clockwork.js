// Scans launch time × angle × power on a clockwork visit-all level and reports
// the best single-shot chain moments. Used to tune orbit phases so a full
// graze chain ("golden moment") exists comfortably inside timeWindowSeconds,
// and to lint that nothing dramatically better sits just past the window end.
//
// Usage: node scripts/solve-clockwork.js [levelId] [tStep] [angleStep] [tMin] [tMax]

import {
  LEVELS,
  createLevelRuntime,
  simulateShot,
  setLevelTime,
  syncBallToAnchor,
  advanceBallAnchor,
  launchVelocity,
  getPlanetVelocity,
  getPlanetSurfaceVelocity,
  directionFromAngleDeg,
  cloneVec,
  vec,
} from '../src/game-core.js';

const levelId = process.argv[2] ?? 'proto-clockwork-orrery';
const T_STEP = Number.parseFloat(process.argv[3] ?? '1');
const ANGLE_STEP = Number.parseFloat(process.argv[4] ?? '3');
const POWERS = [1.1, 1.5, 1.9, 2.3, 2.7];
const FLIGHT_MAX_SECONDS = 14;
const MAX_INWARD_SIN = Math.sin((15 * Math.PI) / 180);

const levelIndex = LEVELS.findIndex((level) => level.id === levelId);
if (levelIndex < 0) {
  console.error(`Unknown level id: ${levelId}`);
  process.exit(1);
}

const level = createLevelRuntime(levelIndex);
const windowSeconds = level.timeWindowSeconds ?? 60;
const scanMaxSeconds = windowSeconds * 1.25;
const startIndex = level.startPlanetIndex ?? 0;
const requiredIndices = level.requiredVisitIndices ?? [];
if (requiredIndices.length === 0) {
  console.error(`Level ${levelId} has no visit checkpoints to chain.`);
  process.exit(1);
}

function resetVisitState() {
  for (const index of requiredIndices) {
    const planet = level.planets[index];
    planet.visited = false;
    planet.visitedTime = null;
  }
  level.goalUnlocked = !level.goalUnlockRequired;
  level.goalUnlockTime = level.goalUnlocked ? 0 : null;
  level.pendingVisitEvents = [];
}

// Replays the pre-launch wait exactly like the in-game scrubber: sync to the
// start anchor at t=0, then ride the spinning planet forward to the scrub time.
function anchorStateAt(waitTime) {
  resetVisitState();
  const startTime = level.startTimeSeconds ?? 0;
  setLevelTime(level, startTime);
  const ball = {
    position: cloneVec(level.startAnchor),
    velocity: vec(0, 0),
    time: startTime,
    landingCount: 0,
    launchGracePlanetIndex: startIndex,
    anchorPlanetIndex: startIndex,
    anchorNormal: directionFromAngleDeg(level.startAngleDeg ?? 0),
    heat: 0,
  };
  syncBallToAnchor(level, ball);
  if (waitTime > 0) {
    setLevelTime(level, startTime + waitTime);
    ball.time = startTime + waitTime;
    const result = advanceBallAnchor(level, ball, waitTime);
    if (result?.type === 'crash') {
      return null;
    }
  }
  return {
    position: cloneVec(ball.position),
    anchorNormal: cloneVec(ball.anchorNormal),
    time: ball.time,
  };
}

// Mirrors main.js constrainLaunchDirection: shots aimed more than ~15° inward
// (after inheriting the planet's velocity) get clamped in-game, so a solver
// hit outside this cone would not reproduce for the player.
function isLaunchAllowed(anchor, angleRad, power) {
  const rel = launchVelocity(vec(Math.cos(angleRad), Math.sin(angleRad)), power);
  const relSpeed = Math.max(0.0001, Math.hypot(rel.x, rel.y));
  const bodyVelocity = getPlanetVelocity(level, startIndex, anchor.time);
  const surfaceVelocity = getPlanetSurfaceVelocity(level, startIndex, anchor.anchorNormal);
  const normalComponent =
    (rel.x + bodyVelocity.x + surfaceVelocity.x) * anchor.anchorNormal.x +
    (rel.y + bodyVelocity.y + surfaceVelocity.y) * anchor.anchorNormal.y;
  return normalComponent >= -relSpeed * MAX_INWARD_SIN - 0.0001;
}

function scanMoment(waitTime) {
  const anchor = anchorStateAt(waitTime);
  if (!anchor) {
    return null;
  }
  let best = null;
  for (let angleDeg = 0; angleDeg < 360; angleDeg += ANGLE_STEP) {
    const angleRad = (angleDeg * Math.PI) / 180;
    for (const power of POWERS) {
      if (!isLaunchAllowed(anchor, angleRad, power)) {
        continue;
      }
      resetVisitState();
      const result = simulateShot(level, { angle: angleRad, dragPower: power }, {
        startTime: anchor.time,
        anchorPlanetIndex: startIndex,
        anchorNormal: anchor.anchorNormal,
        startPosition: anchor.position,
        maxTime: FLIGHT_MAX_SECONDS,
      });
      const grazes = requiredIndices.filter((index) => level.planets[index].visited).length;
      const goal = result.outcome === 'goal';
      const candidate = {
        t: waitTime,
        angleDeg,
        power,
        grazes,
        goal,
        flightTime: result.time,
        minGoalDistance: result.minGoalDistance,
      };
      const rank = (entry) => entry.grazes * 100 + (entry.goal ? 50 : 0) - entry.minGoalDistance;
      if (!best || rank(candidate) > rank(best)) {
        best = candidate;
      }
    }
  }
  return best;
}

const scanMinArg = Number.parseFloat(process.argv[5] ?? '0');
const scanMaxArg = Number.parseFloat(process.argv[6] ?? String(scanMaxSeconds));
const inWindow = [];
const pastWindow = [];
for (let t = scanMinArg; t <= scanMaxArg + 1e-9; t += T_STEP) {
  const best = scanMoment(t);
  if (!best) {
    continue;
  }
  (t <= windowSeconds + 1e-9 ? inWindow : pastWindow).push(best);
  const marker = best.goal ? ' FULL RUN' : '';
  const bar = '#'.repeat(best.grazes) + '.'.repeat(requiredIndices.length - best.grazes);
  console.log(
    `t=${t.toFixed(1).padStart(5)}s  [${bar}] grazes=${best.grazes}` +
      ` angle=${String(best.angleDeg).padStart(3)}° power=${best.power.toFixed(1)}` +
      ` goalDist=${best.minGoalDistance.toFixed(2)}${marker}`,
  );
}

const quality = (entry) => entry.grazes * 100 + (entry.goal ? 50 : 0);
const fullRuns = inWindow.filter((entry) => entry.grazes === requiredIndices.length && entry.goal);
console.log(`\n=== ${levelId} · window ${windowSeconds}s ===`);
console.log(`Full-chain single shots inside window: ${fullRuns.length}`);
for (const run of fullRuns.slice(0, 12)) {
  console.log(
    `  t=${run.t.toFixed(1)}s angle=${run.angleDeg}° power=${run.power.toFixed(1)}` +
      ` flight=${run.flightTime.toFixed(1)}s`,
  );
}
const bestInWindow = inWindow.reduce((a, b) => (quality(b) > quality(a) ? b : a), inWindow[0]);
const bestPastWindow = pastWindow.reduce((a, b) => (quality(b) > quality(a) ? b : a), pastWindow[0]);
if (bestInWindow) {
  console.log(`Best inside window: t=${bestInWindow.t.toFixed(1)}s grazes=${bestInWindow.grazes} goal=${bestInWindow.goal}`);
}
if (bestPastWindow) {
  console.log(`Best past window:   t=${bestPastWindow.t.toFixed(1)}s grazes=${bestPastWindow.grazes} goal=${bestPastWindow.goal}`);
  if (quality(bestPastWindow) > quality(bestInWindow ?? { grazes: 0, goal: false })) {
    console.log('WARNING: a better moment exists just past the window end — retune phases.');
  }
}
