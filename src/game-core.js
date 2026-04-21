export const COURSE = {
  width: 18,
  height: 10.6,
  ballRadius: 0.28,
  goalRadius: 0.56,
  goalPullRadius: 4.6,
  goalStrength: 6.2,
  outBoundsX: 10.4,
  outBoundsY: 6.4,
};

export const MAX_DRAG_DISTANCE = 2.75;
export const BALL_HIT_RADIUS = 0.82;

const PLANET_GRAVITY_MULTIPLIER = 2.35;
const BALL_STOP_SPEED = 0.055;
const BALL_FRICTION_BASE = 0.992;
const GOAL_CAPTURE_RATIO = 0.95;
const PLANET_COLLISION_PADDING = 0.92;
const PLANET_LANDING_PADDING = 0.2;
const DEFAULT_PLANET_LANDING_SPEED = 3.2;
const LAUNCH_BASE_SPEED = 1.9;
const LAUNCH_DRAG_SPEED = 3.4;
const LAUNCH_MAX_SPEED = 11.8;
const DEFAULT_LAUNCH_PRESET = { angleDeg: 0, power: 1.8 };

export const LEVELS = [
  {
    id: 'warm-orbit',
    name: 'Warm Orbit',
    summary: 'A wide first bend introduces the black-hole route.',
    launchPreset: { angleDeg: 40.2, power: 2.53 },
    start: [-6.65, 0],
    goal: [6.95, 0.2],
    planets: [
      { position: [-4.95, -1.95], radius: 0.68, gravity: 7.0, falloff: 5.0, core: 0x6da8ff, glow: 0x78c2ff },
      { position: [-1.65, 1.95], radius: 0.84, gravity: 8.4, falloff: 5.7, core: 0xec8d64, glow: 0xffcf78 },
      { position: [1.6, -1.2], radius: 0.62, gravity: 7.0, falloff: 4.7, core: 0x8f7dff, glow: 0xbeb2ff },
      { position: [4.45, 1.55], radius: 0.92, gravity: 10.9, falloff: 6.3, core: 0xff7d9c, glow: 0xffb1c5 },
    ],
  },
  {
    id: 'double-bend',
    name: 'Double Bend',
    summary: 'A broad opening arc feeds a forgiving two-planet S-curve.',
    launchPreset: { angleDeg: 28.2, power: 2.31 },
    start: [-6.45, 1.7],
    goal: [6.9, -1.2],
    planets: [
      { position: [-4.95, 0.45], radius: 0.66, gravity: 7.4, falloff: 5.2, core: 0x69baff, glow: 0x7ed6ff },
      { position: [-1.75, -1.15], radius: 0.8, gravity: 8.9, falloff: 6.1, core: 0xf39a66, glow: 0xffcf86 },
      { position: [1.55, 1.15], radius: 0.62, gravity: 7.4, falloff: 4.9, core: 0x8b85ff, glow: 0xc6beff },
      { position: [4.5, -0.45], radius: 0.88, gravity: 10.6, falloff: 6.5, core: 0xff7fa2, glow: 0xffb8c9 },
    ],
  },
  {
    id: 'tidal-ladder',
    name: 'Tidal Ladder',
    summary: 'Climb the wells in stages and arrive high at the goal.',
    launchPreset: { angleDeg: 341.9, power: 2.42 },
    start: [-6.6, -2.35],
    goal: [7.05, 2.25],
    planets: [
      { position: [-5.0, -0.25], radius: 0.66, gravity: 7.0, falloff: 4.8, core: 0x78beff, glow: 0x8dd9ff },
      { position: [-2.65, 2.0], radius: 0.84, gravity: 9.4, falloff: 6.0, core: 0xf1a067, glow: 0xffd286 },
      { position: [0.65, -1.55], radius: 0.7, gravity: 8.4, falloff: 5.2, core: 0x8d7eff, glow: 0xcabfff },
      { position: [3.65, 0.95], radius: 0.9, gravity: 10.6, falloff: 6.2, core: 0xff86a8, glow: 0xffbdd0 },
    ],
  },
  {
    id: 'quiet-needle',
    name: 'Quiet Needle',
    summary: 'The safe path is wide, but the fast path threads the middle.',
    launchPreset: { angleDeg: 40.2, power: 2.42 },
    start: [-6.7, 0.35],
    goal: [6.95, 0.15],
    planets: [
      { position: [-4.9, -1.9], radius: 0.7, gravity: 7.8, falloff: 5.1, core: 0x69b6ff, glow: 0x83d7ff },
      { position: [-2.0, 1.7], radius: 0.86, gravity: 9.8, falloff: 6.0, core: 0xf7a96b, glow: 0xffd18f },
      { position: [1.2, -1.65], radius: 0.64, gravity: 8.1, falloff: 5.0, core: 0x8e7eff, glow: 0xc1b9ff },
      { position: [4.05, 1.25], radius: 0.9, gravity: 11.8, falloff: 6.8, core: 0xff81a6, glow: 0xffc0cf },
    ],
  },
  {
    id: 'event-maze',
    name: 'Event Maze',
    summary: 'A crowded endgame asks for one final heavy assist.',
    launchPreset: { angleDeg: 28.2, power: 2.42 },
    start: [-6.45, 2.65],
    goal: [6.9, 1.25],
    planets: [
      { position: [-5.15, 0.65], radius: 0.66, gravity: 7.6, falloff: 5.0, core: 0x70bbff, glow: 0x86d8ff },
      { position: [-2.75, -1.85], radius: 0.82, gravity: 9.5, falloff: 6.0, core: 0xf4a467, glow: 0xffd38d },
      { position: [0.1, 2.05], radius: 0.72, gravity: 8.6, falloff: 5.4, core: 0x8e81ff, glow: 0xc7c0ff },
      { position: [2.95, -0.15], radius: 0.82, gravity: 10.0, falloff: 6.0, core: 0xd98aff, glow: 0xf1c2ff },
      { position: [5.15, 2.75], radius: 0.88, gravity: 11.9, falloff: 6.7, core: 0xff87aa, glow: 0xffc4d2 },
    ],
  },
  {
    id: 'orbital-relay',
    name: 'Orbital Relay',
    summary: 'Skim into the relay world to wake the hole, then fire the finishing burn.',
    requiredLandings: 1,
    launchPresets: [
      { angleDeg: 94.5, power: 0.64 },
      { angleDeg: -28.2, power: 2.22 },
    ],
    start: [-6.8, -2.15],
    goal: [6.85, 2.05],
    planets: [
      {
        name: 'Relay One',
        position: [-2.7, -0.7],
        radius: 0.82,
        gravity: 9.6,
        falloff: 5.8,
        core: 0x76c7ff,
        glow: 0x9bddff,
        landable: true,
        landingSpeed: 4.25,
        landingRadius: 1.3,
      },
      { position: [0.55, 1.7], radius: 0.68, gravity: 8.1, falloff: 5.0, core: 0xf3a66e, glow: 0xffd59a },
      { position: [3.4, -0.45], radius: 0.84, gravity: 10.8, falloff: 6.2, core: 0x9382ff, glow: 0xcabfff },
      { position: [5.2, 1.45], radius: 0.9, gravity: 11.9, falloff: 6.8, core: 0xff85a9, glow: 0xffc1d2 },
    ],
  },
  {
    id: 'periapsis-hop',
    name: 'Periapsis Hop',
    summary: 'Touch down on the inner moon to wake the hole, then ride the last arc.',
    requiredLandings: 1,
    launchPresets: [
      { angleDeg: -78.4, power: 1.26 },
      { angleDeg: -66.4, power: 2.05 },
    ],
    start: [-6.95, 2.45],
    goal: [6.95, -2.05],
    planets: [
      { position: [-4.9, 0.8], radius: 0.66, gravity: 7.6, falloff: 5.0, core: 0x74bbff, glow: 0x8de1ff },
      {
        name: 'Inner Moon',
        position: [-1.1, 0.2],
        radius: 0.76,
        gravity: 9.3,
        falloff: 5.7,
        core: 0xf4a66f,
        glow: 0xffd493,
        landable: true,
        landingSpeed: 4.15,
        landingRadius: 1.22,
      },
      { position: [2.15, -1.6], radius: 0.74, gravity: 9.2, falloff: 5.6, core: 0x8e82ff, glow: 0xc9c0ff },
      { position: [4.9, 0.45], radius: 0.88, gravity: 11.4, falloff: 6.7, core: 0xff87aa, glow: 0xffc3d3 },
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

export function createLevelRuntime(index) {
  const source = LEVELS[index];
  const launchPresets = (source.launchPresets?.length ? source.launchPresets : [source.launchPreset ?? DEFAULT_LAUNCH_PRESET])
    .map((preset) => ({
      angleDeg: preset.angleDeg,
      power: preset.power,
    }));

  return {
    ...source,
    start: vec(source.start[0], source.start[1]),
    goal: vec(source.goal[0], source.goal[1]),
    launchPreset: { ...launchPresets[0] },
    launchPresets,
    goalRadius: source.goalRadius ?? COURSE.goalRadius,
    goalPullRadius: source.goalPullRadius ?? COURSE.goalPullRadius,
    goalStrength: source.goalStrength ?? COURSE.goalStrength,
    planets: source.planets.map((planet) => ({
      ...planet,
      position: vec(planet.position[0], planet.position[1]),
    })),
  };
}

export function createBallState(level) {
  return {
    position: cloneVec(level.start),
    velocity: vec(0, 0),
    landingCount: 0,
    launchGracePlanetIndex: null,
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

function landBallOnPlanet(ball, planet) {
  const landingDirection = getLandingDirection(ball, planet);
  const surfaceRadius = planet.radius + COURSE.ballRadius + PLANET_LANDING_PADDING;
  ball.position.x = planet.position.x + landingDirection.x * surfaceRadius;
  ball.position.y = planet.position.y + landingDirection.y * surfaceRadius;
  ball.velocity.x = 0;
  ball.velocity.y = 0;
  ball.landingCount = (ball.landingCount ?? 0) + 1;
  ball.launchGracePlanetIndex = null;
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
      distance <= landingRadius
    ) {
      landBallOnPlanet(ball, planet);
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

  return netGravity;
}

export function stepBall(level, ball, delta) {
  if (lengthSq(ball.velocity) < 0.000001) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'settled' };
  }

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
  const startPosition = options.startPosition ?? level.start;
  const ball = {
    position: cloneVec(startPosition),
    velocity: vec(0, 0),
    landingCount: options.landingCount ?? 0,
    launchGracePlanetIndex: findContainingLandingPlanetIndex(level, startPosition),
  };
  ball.velocity = launchVelocity(
    vec(Math.cos(shot.angle), Math.sin(shot.angle)),
    shot.dragPower,
  );

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
        landingCount: ball.landingCount ?? 0,
        time,
        steps,
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
    landingCount: ball.landingCount ?? 0,
    time,
    steps,
    minGoalDistance,
    minPlanetClearance,
    finalPosition: cloneVec(ball.position),
  };
}
