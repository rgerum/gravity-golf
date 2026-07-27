// For a clockwork level, find where max-graze trajectories cross the goal
// radius band AFTER their final graze — candidate goal angles, weighted by
// how often they occur inside the scrub window.
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
} from '/home/richard/WebstormProjects/gravity-golf/src/game-core.js';

const levelId = process.argv[2];
const goalRadiusTarget = Number.parseFloat(process.argv[3] ?? '8.8');
const levelIndex = LEVELS.findIndex((l) => l.id === levelId);
const level = createLevelRuntime(levelIndex);
const windowSeconds = level.timeWindowSeconds ?? 60;
const startIndex = level.startPlanetIndex ?? 0;
const required = level.requiredVisitIndices ?? [];
const MAX_INWARD_SIN = Math.sin((15 * Math.PI) / 180);

function resetVisits() {
  for (const i of required) {
    level.planets[i].visited = false;
    level.planets[i].visitedTime = null;
  }
  level.goalUnlocked = !level.goalUnlockRequired;
  level.goalUnlockTime = level.goalUnlocked ? 0 : null;
  level.pendingVisitEvents = [];
}

function anchorAt(t) {
  resetVisits();
  setLevelTime(level, 0);
  const ball = {
    position: cloneVec(level.startAnchor),
    velocity: vec(0, 0),
    time: 0,
    landingCount: 0,
    launchGracePlanetIndex: startIndex,
    anchorPlanetIndex: startIndex,
    anchorNormal: directionFromAngleDeg(level.startAngleDeg ?? 0),
    heat: 0,
  };
  syncBallToAnchor(level, ball);
  if (t > 0) {
    setLevelTime(level, t);
    ball.time = t;
    if (advanceBallAnchor(level, ball, t)?.type === 'crash') return null;
  }
  return { position: cloneVec(ball.position), anchorNormal: cloneVec(ball.anchorNormal), time: t };
}

function allowed(anchor, angleRad, power) {
  const rel = launchVelocity(vec(Math.cos(angleRad), Math.sin(angleRad)), power);
  const relSpeed = Math.max(0.0001, Math.hypot(rel.x, rel.y));
  const bv = getPlanetVelocity(level, startIndex, anchor.time);
  const sv = getPlanetSurfaceVelocity(level, startIndex, anchor.anchorNormal);
  const n = anchor.anchorNormal;
  return (rel.x + bv.x + sv.x) * n.x + (rel.y + bv.y + sv.y) * n.y >= -relSpeed * MAX_INWARD_SIN - 0.0001;
}

const bins = new Array(72).fill(0); // 5° bins of goal-band crossings
const radiusBins = new Map(); // 0.5-unit bins of max radius after last graze
let maxGrazeSeen = 0;
for (let t = 0; t <= windowSeconds; t += 1) {
  const anchor = anchorAt(t);
  if (!anchor) continue;
  for (let angleDeg = 0; angleDeg < 360; angleDeg += 4) {
    const angleRad = (angleDeg * Math.PI) / 180;
    for (const power of [1.9, 2.3, 2.7]) {
      if (!allowed(anchor, angleRad, power)) continue;
      resetVisits();
      const result = simulateShot(level, { angle: angleRad, dragPower: power }, {
        startTime: anchor.time,
        anchorPlanetIndex: startIndex,
        anchorNormal: anchor.anchorNormal,
        startPosition: anchor.position,
        maxTime: 14,
        captureFrames: true,
      });
      const grazes = required.filter((i) => level.planets[i].visited).length;
      maxGrazeSeen = Math.max(maxGrazeSeen, grazes);
      if (grazes < required.length) continue;
      const lastGrazeTime = Math.max(...required.map((i) => level.planets[i].visitedTime ?? 0));
      let maxR = 0;
      let maxRDeg = null;
      for (const frame of result.frames ?? []) {
        if (frame.time <= lastGrazeTime) continue;
        const r = Math.hypot(frame.position.x, frame.position.y);
        if (r > maxR) {
          maxR = r;
          maxRDeg = ((Math.atan2(frame.position.y, frame.position.x) * 180) / Math.PI + 360) % 360;
        }
        if (Math.abs(r - goalRadiusTarget) < 0.45) {
          const deg = ((Math.atan2(frame.position.y, frame.position.x) * 180) / Math.PI + 360) % 360;
          bins[Math.floor(deg / 5)] += 1;
        }
      }
      if (maxR > 0) {
        const key = `${(Math.floor(maxR * 2) / 2).toFixed(1)} @ ${maxRDeg === null ? '?' : Math.round(maxRDeg / 15) * 15}°`;
        radiusBins.set(key, (radiusBins.get(key) ?? 0) + 1);
      }
    }
  }
}
console.log(`max grazes seen: ${maxGrazeSeen} / ${required.length}`);
const ranked = bins
  .map((count, i) => ({ deg: i * 5, count }))
  .filter((b) => b.count > 0)
  .sort((a, b) => b.count - a.count);
console.log('goal-band crossings after full graze chain (angle°: hits):');
for (const b of ranked.slice(0, 12)) console.log(`  ${b.deg}–${b.deg + 5}°: ${b.count}`);
console.log('max radius reached after last graze (radius @ angle: shots):');
const rRanked = [...radiusBins.entries()].sort((a, b) => b[1] - a[1]);
for (const [key, count] of rRanked.slice(0, 15)) console.log(`  ${key}: ${count}`);
