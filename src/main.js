import './style.css';
import * as THREE from 'three';
import {
  BALL_HIT_RADIUS,
  COURSE,
  LEVELS,
  MAX_DRAG_DISTANCE,
  addScaledVec,
  cloneVec,
  createBallState,
  createLevelRuntime,
  distanceBetween,
  advanceBallAnchor,
  getBallSurfaceRadius,
  getGoalRemainingFraction,
  getGoalRemainingTime,
  getPlanetVelocity,
  getPlanetSurfaceVelocity,
  isGoalOpen,
  length,
  lengthSq,
  launchVelocity,
  normalize,
  samplePlanetGravity,
  setLevelTime,
  setVec,
  stepBall,
  syncBallToAnchor,
} from './game-core.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-shell">
    <header class="info-panel">
      <div class="brand-block">
        <p class="eyebrow">Orbital Course</p>
        <h1>Gravity Billiard</h1>
        <p class="lede">
          Slingshot from the launch pad, surf the gravity wells, and drop into the black hole.
        </p>
      </div>
      <div class="stats">
        <div class="stat-card compact">
          <span class="label">Score</span>
          <strong id="scoreValue">0</strong>
        </div>
        <div class="stat-card compact">
          <span class="label">Shots</span>
          <strong id="shotsValue">0</strong>
        </div>
        <div class="stat-card compact">
          <span class="label">Resets</span>
          <strong id="resetValue">0</strong>
        </div>
      </div>
      <div class="mini-guide">
        <span>Grab ball</span>
        <span>Pull line</span>
        <span>Wait to align</span>
      </div>
      <div class="launch-controls">
        <div class="shot-control" data-shot-panel="0">
          <div class="shot-control-header">
            <span class="shot-control-title">Shot 1</span>
            <span class="shot-control-state" id="shotState0">Start</span>
          </div>
          <div class="slider-field">
            <label for="angleSlider0">Angle <strong id="angleValue0">0.0 deg</strong></label>
            <input id="angleSlider0" data-shot-index="0" data-shot-axis="angle" type="range" min="-180" max="180" step="0.1" value="0" />
          </div>
          <div class="slider-field">
            <label for="powerSlider0">Power <strong id="powerValue0">0.20</strong></label>
            <input id="powerSlider0" data-shot-index="0" data-shot-axis="power" type="range" min="0.2" max="2.75" step="0.01" value="0.2" />
          </div>
        </div>
        <div class="shot-control" data-shot-panel="1">
          <div class="shot-control-header">
            <span class="shot-control-title">Shot 2</span>
            <span class="shot-control-state" id="shotState1">Relay</span>
          </div>
          <div class="slider-field">
            <label for="angleSlider1">Angle <strong id="angleValue1">0.0 deg</strong></label>
            <input id="angleSlider1" data-shot-index="1" data-shot-axis="angle" type="range" min="-180" max="180" step="0.1" value="0" />
          </div>
          <div class="slider-field">
            <label for="powerSlider1">Power <strong id="powerValue1">0.20</strong></label>
            <input id="powerSlider1" data-shot-index="1" data-shot-axis="power" type="range" min="0.2" max="2.75" step="0.01" value="0.2" />
          </div>
        </div>
        <button id="undoButton" type="button">Undo</button>
        <button id="launchButton" type="button">Go</button>
      </div>
      <div class="status-card hud-status">
        <p class="status-label">Flight Call</p>
        <h2 id="statusLine">Plot the first slingshot.</h2>
        <div class="run-strip">
          <span class="status-pill" id="runStatusPill">Shot 1 · Launch Pad</span>
          <span class="status-pill" id="windowStatusPill">Window live</span>
        </div>
        <div class="meter">
          <span id="powerFill"></span>
        </div>
        <p id="statusHint">Use the planets to curve into the event horizon.</p>
        <p id="approachLine" class="status-note">Best approach this level: no close calls yet.</p>
      </div>
    </header>
    <main class="stage-panel">
      <div class="table-frame">
        <div id="scene"></div>
        <div class="stage-overlay">
          <div class="stage-topline">
            <span class="chip">Top View</span>
            <span class="chip" id="levelChip">Level 1</span>
            <span class="chip chip-live">Black Hole Goal</span>
          </div>
        </div>
      </div>
    </main>
  </div>
`;

const scoreValue = document.querySelector('#scoreValue');
const shotsValue = document.querySelector('#shotsValue');
const resetValue = document.querySelector('#resetValue');
const statusLine = document.querySelector('#statusLine');
const statusHint = document.querySelector('#statusHint');
const approachLine = document.querySelector('#approachLine');
const runStatusPill = document.querySelector('#runStatusPill');
const windowStatusPill = document.querySelector('#windowStatusPill');
const powerFill = document.querySelector('#powerFill');
const levelChip = document.querySelector('#levelChip');
const shotControlPanels = [...document.querySelectorAll('[data-shot-panel]')];
const shotControlStates = [0, 1].map((index) => document.querySelector(`#shotState${index}`));
const angleSliders = [0, 1].map((index) => document.querySelector(`#angleSlider${index}`));
const powerSliders = [0, 1].map((index) => document.querySelector(`#powerSlider${index}`));
const angleValues = [0, 1].map((index) => document.querySelector(`#angleValue${index}`));
const powerValues = [0, 1].map((index) => document.querySelector(`#powerValue${index}`));
const undoButton = document.querySelector('#undoButton');
const launchButton = document.querySelector('#launchButton');
const sceneHost = document.querySelector('#scene');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040812);
scene.fog = new THREE.Fog(0x040812, 14, 30);
const CAMERA_VIEW_SIZE = 19.4;

const camera = new THREE.OrthographicCamera();
camera.position.set(0, 18, 0);
camera.up.set(0, 0, -1);
camera.lookAt(0, 0, 0);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const coursePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const pointerNdc = new THREE.Vector2();
const pointerWorld = new THREE.Vector3();

const palette = {
  field: new THREE.Color(0x071423),
  lane: new THREE.Color(0x153451),
  start: new THREE.Color(0x75f3d9),
  blackHole: new THREE.Color(0x060109),
  blackHoleGlow: new THREE.Color(0x8a62ff),
  band: new THREE.Color(0xff7d58),
  handle: new THREE.Color(0xffc85c),
  ball: new THREE.Color(0xfaf7ef),
};

const gravityGridConfig = {
  columns: 38,
  rows: 22,
  insetX: 0.9,
  insetY: 0.75,
};

const gravityFieldPalette = {
  low: new THREE.Color(0x24507d),
  mid: new THREE.Color(0x78bdff),
  high: new THREE.Color(0xffdd97),
};

const PHYSICS_STEP = 1 / 120;
const MAX_PHYSICS_STEPS_PER_FRAME = 4;
const ballRestY = COURSE.ballRadius + 0.04;
const CONTROL_MIN_ANGLE = -180;
const CONTROL_MAX_ANGLE = 180;
const ADMIN_STORAGE_KEY = 'gravityBilliardAdminMode';
const ADMIN_CHEAT_CODE = 'orbitadmin';
const DEFAULT_CONTROL_SHOT = { angleDeg: 0, power: 1.8 };

const ambientLight = new THREE.HemisphereLight(0x8bd5ff, 0x03070c, 1.18);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xf7f0d0, 1.45);
keyLight.position.set(4, 12, 3);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x5b93ff, 10, 28, 2);
fillLight.position.set(-3, 4.5, 2);
scene.add(fillLight);

const world = new THREE.Group();
scene.add(world);

const field = new THREE.Mesh(
  new THREE.BoxGeometry(COURSE.width, 0.14, COURSE.height),
  new THREE.MeshStandardMaterial({
    color: palette.field,
    roughness: 0.95,
    metalness: 0.08,
  }),
);
field.position.y = -0.12;
world.add(field);

const courseHalo = new THREE.Mesh(
  new THREE.PlaneGeometry(COURSE.width - 0.5, COURSE.height - 0.5),
  new THREE.MeshBasicMaterial({
    color: palette.lane,
    transparent: true,
    opacity: 0.18,
  }),
);
courseHalo.rotation.x = -Math.PI / 2;
courseHalo.position.y = 0.02;
world.add(courseHalo);

const gravityFieldRoot = new THREE.Group();
world.add(gravityFieldRoot);

const sunGroup = new THREE.Group();
world.add(sunGroup);

const sunGlow = new THREE.Mesh(
  new THREE.CircleGeometry(1.35, 56),
  new THREE.MeshBasicMaterial({
    color: 0xffcf70,
    transparent: true,
    opacity: 0.18,
  }),
);
sunGlow.rotation.x = -Math.PI / 2;
sunGlow.position.y = 0.03;
sunGroup.add(sunGlow);

const sunCorona = new THREE.Mesh(
  new THREE.RingGeometry(0.62, 1.05, 72),
  new THREE.MeshBasicMaterial({
    color: 0xffa54f,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
  }),
);
sunCorona.rotation.x = -Math.PI / 2;
sunCorona.position.y = 0.04;
sunGroup.add(sunCorona);

const sunCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.42, 36, 36),
  new THREE.MeshStandardMaterial({
    color: 0xffdd8f,
    emissive: 0xffb347,
    emissiveIntensity: 1.2,
    roughness: 0.55,
    metalness: 0.02,
  }),
);
sunCore.position.y = 0.42;
sunGroup.add(sunCore);

const startPad = new THREE.Mesh(
  new THREE.RingGeometry(0.62, 0.98, 48),
  new THREE.MeshBasicMaterial({
    color: palette.start,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
  }),
);
startPad.rotation.x = -Math.PI / 2;
world.add(startPad);

const startCore = new THREE.Mesh(
  new THREE.CircleGeometry(0.36, 32),
  new THREE.MeshBasicMaterial({
    color: 0xb8fff2,
    transparent: true,
    opacity: 0.72,
  }),
);
startCore.rotation.x = -Math.PI / 2;
world.add(startCore);

const goalGroup = new THREE.Group();
world.add(goalGroup);

const blackHoleDisc = new THREE.Mesh(
  new THREE.CircleGeometry(COURSE.goalRadius, 48),
  new THREE.MeshBasicMaterial({
    color: palette.blackHole,
  }),
);
blackHoleDisc.rotation.x = -Math.PI / 2;
goalGroup.add(blackHoleDisc);

const blackHoleRing = new THREE.Mesh(
  new THREE.RingGeometry(COURSE.goalRadius + 0.14, COURSE.goalRadius + 0.35, 64),
  new THREE.MeshBasicMaterial({
    color: palette.blackHoleGlow,
    transparent: true,
    opacity: 0.54,
    side: THREE.DoubleSide,
  }),
);
blackHoleRing.rotation.x = -Math.PI / 2;
goalGroup.add(blackHoleRing);

const goalTimerTrack = new THREE.Mesh(
  new THREE.RingGeometry(COURSE.goalRadius + 0.42, COURSE.goalRadius + 0.58, 96),
  new THREE.MeshBasicMaterial({
    color: 0x274149,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide,
  }),
);
goalTimerTrack.rotation.x = -Math.PI / 2;
goalTimerTrack.position.y = 0.01;
goalGroup.add(goalTimerTrack);

const goalTimerArcMaterial = new THREE.MeshBasicMaterial({
  color: 0x8fffe3,
  transparent: true,
  opacity: 0.94,
  side: THREE.DoubleSide,
});
const goalTimerArc = new THREE.Mesh(
  new THREE.RingGeometry(COURSE.goalRadius + 0.42, COURSE.goalRadius + 0.58, 96, 1, Math.PI / 2, Math.PI * 2),
  goalTimerArcMaterial,
);
goalTimerArc.rotation.x = -Math.PI / 2;
goalTimerArc.position.y = 0.02;
goalGroup.add(goalTimerArc);

const starsGeometry = new THREE.BufferGeometry();
const starPositions = [];
for (let i = 0; i < 240; i += 1) {
  starPositions.push(
    THREE.MathUtils.randFloatSpread(COURSE.width * 1.55),
    THREE.MathUtils.randFloat(0.45, 1.8),
    THREE.MathUtils.randFloatSpread(COURSE.height * 1.6),
  );
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

const stars = new THREE.Points(
  starsGeometry,
  new THREE.PointsMaterial({
    color: 0xd7e6ff,
    size: 0.06,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: false,
  }),
);
world.add(stars);

const orbitPathsRoot = new THREE.Group();
world.add(orbitPathsRoot);

const planetsRoot = new THREE.Group();
world.add(planetsRoot);

const ballGroup = new THREE.Group();
world.add(ballGroup);

const ballShadow = new THREE.Mesh(
  new THREE.CircleGeometry(COURSE.ballRadius * 1.08, 36),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.28,
  }),
);
ballShadow.rotation.x = -Math.PI / 2;
ballShadow.position.y = 0.02;
ballGroup.add(ballShadow);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(COURSE.ballRadius, 48, 48),
  new THREE.MeshStandardMaterial({
    color: palette.ball,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.22,
    metalness: 0.03,
  }),
);
ballMesh.position.y = ballRestY;
ballGroup.add(ballMesh);

const BALL_TRACE_PARTICLE_COUNT = 160;
const BALL_TRACE_PARTICLE_LIFETIME = 0.5;
const ballTraceSprite = createCanvasTexture(64, 64, (ctx, width, height) => {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    width * 0.06,
    width * 0.5,
    height * 0.5,
    width * 0.5,
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.78, 'rgba(255, 255, 255, 0.45)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
});
const ballTracePositions = new Float32Array(BALL_TRACE_PARTICLE_COUNT * 3);
const ballTraceColors = new Float32Array(BALL_TRACE_PARTICLE_COUNT * 3);
const ballTraceStreakPositions = new Float32Array(BALL_TRACE_PARTICLE_COUNT * 2 * 3);
const ballTraceStreakColors = new Float32Array(BALL_TRACE_PARTICLE_COUNT * 2 * 3);
const ballTraceGeometry = new THREE.BufferGeometry();
ballTraceGeometry.setAttribute('position', new THREE.BufferAttribute(ballTracePositions, 3));
ballTraceGeometry.setAttribute('color', new THREE.BufferAttribute(ballTraceColors, 3));
const ballTrace = new THREE.Points(
  ballTraceGeometry,
  new THREE.PointsMaterial({
    size: 3,
    transparent: true,
    opacity: 0.72,
    vertexColors: true,
    map: ballTraceSprite,
    alphaMap: ballTraceSprite,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: false,
  }),
);
ballTrace.renderOrder = 6;
world.add(ballTrace);

const ballTraceStreakGeometry = new THREE.BufferGeometry();
ballTraceStreakGeometry.setAttribute('position', new THREE.BufferAttribute(ballTraceStreakPositions, 3));
ballTraceStreakGeometry.setAttribute('color', new THREE.BufferAttribute(ballTraceStreakColors, 3));
const ballTraceStreaks = new THREE.LineSegments(
  ballTraceStreakGeometry,
  new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0.75,
    vertexColors: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  }),
);
ballTraceStreaks.renderOrder = 5;
world.add(ballTraceStreaks);

const aimLine = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.03, 0.12),
  new THREE.MeshBasicMaterial({
    color: palette.band,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
    depthWrite: false,
  }),
);
aimLine.position.y = 0.14;
aimLine.renderOrder = 10;
world.add(aimLine);

const dragHandle = new THREE.Mesh(
  new THREE.RingGeometry(0.15, 0.24, 40),
  new THREE.MeshBasicMaterial({
    color: palette.handle,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
  }),
);
dragHandle.rotation.x = -Math.PI / 2;
dragHandle.position.y = 0.16;
dragHandle.renderOrder = 11;
world.add(dragHandle);

const lastAttemptTrailGlow = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({
    color: 0xffc58a,
    transparent: true,
    opacity: 0.16,
    linewidth: 2,
    depthTest: false,
    depthWrite: false,
  }),
);
lastAttemptTrailGlow.renderOrder = 7;
world.add(lastAttemptTrailGlow);

const lastAttemptTrail = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({
    color: 0xffe0bd,
    transparent: true,
    opacity: 0.56,
    depthTest: false,
    depthWrite: false,
  }),
);
lastAttemptTrail.renderOrder = 8;
world.add(lastAttemptTrail);

const initialLevel = createLevelRuntime(0);
const initialBall = createBallState(initialLevel);

const state = {
  score: 0,
  shots: 0,
  resets: 0,
  levelIndex: 0,
  level: initialLevel,
  ball: {
    ...initialBall,
    goaling: false,
    crashed: false,
    transition: 0,
    crashReason: '',
    crashKind: '',
    crashStartPosition: cloneVec(initialBall.position),
    crashTargetPosition: cloneVec(initialBall.position),
    landingCount: 0,
    landedPlanetIndex: initialBall.anchorPlanetIndex ?? null,
    landedPlanetName: initialLevel.planets[initialBall.anchorPlanetIndex ?? 0]?.name ?? 'launch world',
  },
  aimDirection: normalize({ x: 1, y: 0 }),
  dragAnchor: { x: 0, y: 0 },
  dragPointerWorld: { x: 0, y: 0 },
  controlShots: [],
  dragActive: false,
  dragPower: 0,
  roundSettled: true,
  relayPulse: 0,
  currentAttemptTrail: [],
  currentAttemptMinGoalDistance: Number.POSITIVE_INFINITY,
  lastAttemptTrail: [],
  lastAttemptOutcome: '',
  bestApproach: null,
  adminMode: (() => {
    try {
      return window.localStorage.getItem(ADMIN_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  })(),
  adminCodeBuffer: '',
  adminSolutionIndex: 0,
  adminReplay: {
    active: false,
    solutionIndex: 0,
    shotIndex: 0,
    nextLaunchTime: null,
  },
  undo: {
    checkpoints: [],
    active: false,
    checkpoint: null,
    fromPosition: null,
    toPosition: null,
    duration: 0,
    elapsed: 0,
  },
  ballTraceParticles: Array.from({ length: BALL_TRACE_PARTICLE_COUNT }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    age: 0,
    life: BALL_TRACE_PARTICLE_LIFETIME,
  })),
  ballTraceCursor: 0,
  ballTraceCarry: 0,
  message: 'Plot the first slingshot.',
  hint: 'Use the planets to curve into the event horizon.',
};

let planetVisuals = [];
let gravityFieldVisuals = null;
let physicsAccumulator = 0;
const planetTextureCache = new Map();
let lastGravityFieldRefreshTime = Number.NEGATIVE_INFINITY;
let lastGoalTimerFraction = Number.NaN;

function setGoalTimerArc(fraction) {
  const normalizedFraction = clamp(fraction, 0, 1);
  if (
    Number.isFinite(lastGoalTimerFraction)
    && Math.abs(lastGoalTimerFraction - normalizedFraction) < 0.004
  ) {
    return;
  }

  lastGoalTimerFraction = normalizedFraction;
  goalTimerArc.geometry.dispose();
  goalTimerArc.geometry = new THREE.RingGeometry(
    COURSE.goalRadius + 0.42,
    COURSE.goalRadius + 0.58,
    96,
    1,
    Math.PI / 2,
    Math.max(0.0001, Math.PI * 2 * normalizedFraction),
  );
  goalTimerArc.visible = normalizedFraction > 0.001;
}

function getAnchoredPlanet() {
  if (state.ball.anchorPlanetIndex === null || state.ball.anchorPlanetIndex === undefined) {
    return null;
  }

  return state.level.planets[state.ball.anchorPlanetIndex] ?? null;
}

function updateLaunchMarker() {
  const anchoredPlanet = getAnchoredPlanet();
  const visible = Boolean(anchoredPlanet);
  startPad.visible = visible;
  startCore.visible = visible;

  if (!visible) {
    return;
  }

  startPad.position.set(anchoredPlanet.position.x, 0.08, anchoredPlanet.position.y);
  startCore.position.set(anchoredPlanet.position.x, 0.06, anchoredPlanet.position.y);
}

function updateSunVisual() {
  sunGroup.position.set(state.level.sun.x, 0, state.level.sun.y);
}

function formatDistance(value) {
  return value < 1 ? value.toFixed(2) : value.toFixed(1);
}

function getBestApproachText() {
  if (!state.bestApproach) {
    return 'Best approach this level: no close calls yet.';
  }

  const routeLabel = state.bestApproach.usedRelay ? 'after relay' : 'direct';
  return `Best approach this level: ${formatDistance(state.bestApproach.minGoalDistance)} from goal, ${routeLabel}.`;
}

function getAdminSolutions() {
  return Array.isArray(state.level.adminSolutions) ? state.level.adminSolutions : [];
}

function getSelectedAdminSolution() {
  const solutions = getAdminSolutions();
  if (solutions.length === 0) {
    return null;
  }

  const normalizedIndex = ((state.adminSolutionIndex % solutions.length) + solutions.length) % solutions.length;
  return { solution: solutions[normalizedIndex], solutionIndex: normalizedIndex, total: solutions.length };
}

function stopAdminReplay() {
  state.adminReplay.active = false;
  state.adminReplay.shotIndex = 0;
  state.adminReplay.nextLaunchTime = null;
}

function persistAdminMode() {
  try {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, state.adminMode ? '1' : '0');
  } catch {
    // Ignore persistence errors in restricted contexts.
  }
}

function applyAdminSolutionToControls(solution) {
  state.controlShots = solution.shots
    .slice(0, angleSliders.length)
    .map((shot) => clampControlShot({ angleDeg: shot.angleDeg, power: shot.power }));
  syncLaunchControls();
}

function getAdminSolutionSummary(solution, solutionIndex, total) {
  const label = solution.label ?? `Solution ${solutionIndex + 1}`;
  const robustSummary = Number.isFinite(solution.robustRate)
    ? `robust ${solution.robustRate.toFixed(2)}`
    : `${solution.shots.length} shots`;
  return `${label} · ${solutionIndex + 1}/${total} · ${robustSummary}`;
}

function previewAdminSolution(delta = 0) {
  stopAdminReplay();
  const selected = getSelectedAdminSolution();
  if (!selected) {
    state.message = 'No admin solution stored.';
    state.hint = `Level ${state.levelIndex + 1} has no authored admin replay yet.`;
    syncHud();
    return;
  }

  state.adminSolutionIndex = ((selected.solutionIndex + delta) % selected.total + selected.total) % selected.total;
  const nextSelected = getSelectedAdminSolution();
  applyAdminSolutionToControls(nextSelected.solution);
  state.message = 'Admin solution loaded.';
  state.hint = getAdminSolutionSummary(nextSelected.solution, nextSelected.solutionIndex, nextSelected.total);
  syncHud();
}

function startAdminReplay() {
  if (!state.adminMode) {
    return;
  }

  const selected = getSelectedAdminSolution();
  if (!selected) {
    state.message = 'No admin solution stored.';
    state.hint = `Level ${state.levelIndex + 1} has no authored admin replay yet.`;
    syncHud();
    return;
  }

  stopAdminReplay();
  state.adminReplay.active = true;
  state.adminReplay.solutionIndex = selected.solutionIndex;
  state.adminReplay.shotIndex = 0;
  state.adminReplay.nextLaunchTime = null;
  applyAdminSolutionToControls(selected.solution);
  resetBall(
    'Admin replay ready.',
    getAdminSolutionSummary(selected.solution, selected.solutionIndex, selected.total),
    { keepAdminReplay: true },
  );
  state.adminReplay.active = true;
  state.adminReplay.solutionIndex = selected.solutionIndex;
  state.adminReplay.shotIndex = 0;
  state.adminReplay.nextLaunchTime = (state.level.time ?? 0) + selected.solution.shots[0].waitSeconds;
  state.message = 'Admin replay armed.';
  state.hint = getAdminSolutionSummary(selected.solution, selected.solutionIndex, selected.total);
  syncHud();
}

function maybeLaunchAdminReplayShot() {
  if (!state.adminReplay.active || state.ball.anchorPlanetIndex === null || state.ball.anchorPlanetIndex === undefined) {
    return false;
  }

  const selected = getAdminSolutions()[state.adminReplay.solutionIndex];
  if (!selected) {
    stopAdminReplay();
    return false;
  }

  if (state.adminReplay.shotIndex >= selected.shots.length) {
    stopAdminReplay();
    return false;
  }

  const launchTime = state.adminReplay.nextLaunchTime;
  if (launchTime === null || (state.level.time ?? 0) + 0.000001 < launchTime) {
    return false;
  }

  const shot = selected.shots[state.adminReplay.shotIndex];
  applyAdminSolutionToControls(selected);
  setControlShot(getActiveStageIndex(), shot.angleDeg, shot.power);
  const direction = directionFromAngleDeg(shot.angleDeg);
  const anchor = cloneVec(state.ball.position);
  addScaledVec(anchor, constrainLaunchDirection(direction, shot.power), shot.power);
  launchShot(direction, shot.power, anchor);
  state.adminReplay.shotIndex += 1;
  state.adminReplay.nextLaunchTime = null;
  state.message = `Admin replay shot ${state.adminReplay.shotIndex}/${selected.shots.length}.`;
  state.hint = getAdminSolutionSummary(selected, state.adminReplay.solutionIndex, getAdminSolutions().length);
  syncHud();
  return true;
}

function setLineGeometry(line, points, height) {
  const geometry = line.geometry;
  if (geometry) {
    geometry.dispose();
  }

  const sourcePoints = points.length > 1 ? points : [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  line.geometry = new THREE.BufferGeometry().setFromPoints(
    sourcePoints.map((point) => new THREE.Vector3(point.x, height, point.y)),
  );
}

function syncLastAttemptTrailVisual() {
  const visible = !ballIsMoving() && state.lastAttemptTrail.length > 1;
  lastAttemptTrail.visible = visible;
  lastAttemptTrailGlow.visible = visible;

  if (!visible) {
    return;
  }

  const colorsByOutcome = {
    landed: { core: 0x9fffe8, glow: 0x49d9bf },
    goal: { core: 0xf8f2da, glow: 0xf2b86f },
    settled: { core: 0xffd9a8, glow: 0xff9e64 },
    crash: { core: 0xffd2b8, glow: 0xff845a },
  };
  const paletteForOutcome = colorsByOutcome[state.lastAttemptOutcome] ?? colorsByOutcome.crash;

  lastAttemptTrail.material.color.setHex(paletteForOutcome.core);
  lastAttemptTrailGlow.material.color.setHex(paletteForOutcome.glow);
  setLineGeometry(lastAttemptTrail, state.lastAttemptTrail, 0.11);
  setLineGeometry(lastAttemptTrailGlow, state.lastAttemptTrail, 0.09);
}

function clearAttemptMemory() {
  state.currentAttemptTrail = [];
  state.currentAttemptMinGoalDistance = Number.POSITIVE_INFINITY;
  state.lastAttemptTrail = [];
  state.lastAttemptOutcome = '';
  state.bestApproach = null;
  setLineGeometry(lastAttemptTrail, [], 0.11);
  setLineGeometry(lastAttemptTrailGlow, [], 0.09);
  lastAttemptTrail.visible = false;
  lastAttemptTrailGlow.visible = false;
}

function clearUndoCheckpoints() {
  state.undo.checkpoints = [];
  state.undo.checkpoint = null;
  state.undo.fromPosition = null;
  state.undo.toPosition = null;
  state.undo.duration = 0;
  state.undo.elapsed = 0;
}

function pointsMatch(left, right, tolerance = 0.0001) {
  return Math.abs(left.x - right.x) <= tolerance && Math.abs(left.y - right.y) <= tolerance;
}

function getLatestUndoCheckpoint() {
  return state.undo.checkpoints[state.undo.checkpoints.length - 1] ?? null;
}

function checkpointMatchesCurrent(checkpoint) {
  if (!checkpoint) {
    return false;
  }

  return (
    checkpoint.levelIndex === state.levelIndex
    && checkpoint.anchorPlanetIndex === state.ball.anchorPlanetIndex
    && checkpoint.landingCount === state.ball.landingCount
    && Math.abs(checkpoint.levelTime - (state.level.time ?? 0)) <= 0.0001
    && pointsMatch(checkpoint.position, state.ball.position)
  );
}

function canRedo() {
  if (state.adminReplay.active || state.undo.active || state.ball.goaling || state.ball.crashed) {
    return false;
  }

  const checkpoint = getLatestUndoCheckpoint();
  return Boolean(checkpoint) && !checkpointMatchesCurrent(checkpoint);
}

function saveUndoCheckpoint() {
  if (state.ball.anchorPlanetIndex === null || state.ball.anchorPlanetIndex === undefined) {
    return;
  }

  const checkpoint = {
    levelIndex: state.levelIndex,
    levelTime: state.level.time ?? state.ball.time ?? 0,
    position: cloneVec(state.ball.position),
    anchorNormal: cloneVec(state.ball.anchorNormal ?? { x: 1, y: 0 }),
    anchorPlanetIndex: state.ball.anchorPlanetIndex,
    landedPlanetIndex: state.ball.landedPlanetIndex ?? state.ball.anchorPlanetIndex,
    landedPlanetName: state.ball.landedPlanetName || state.level.planets[state.ball.anchorPlanetIndex]?.name || 'launch world',
    landingCount: state.ball.landingCount ?? 0,
    shots: state.shots,
    resets: state.resets,
    score: state.score,
    controlShots: state.controlShots.map((shot) => ({ angleDeg: shot.angleDeg, power: shot.power })),
  };

  const latest = getLatestUndoCheckpoint();
  if (
    latest
    && latest.levelIndex === checkpoint.levelIndex
    && latest.anchorPlanetIndex === checkpoint.anchorPlanetIndex
    && latest.landingCount === checkpoint.landingCount
    && Math.abs(latest.levelTime - checkpoint.levelTime) <= 0.0001
    && pointsMatch(latest.position, checkpoint.position)
  ) {
    state.undo.checkpoints[state.undo.checkpoints.length - 1] = checkpoint;
    return;
  }

  state.undo.checkpoints.push(checkpoint);
  if (state.undo.checkpoints.length > 8) {
    state.undo.checkpoints.shift();
  }
}

function finishUndo() {
  const checkpoint = state.undo.checkpoint;
  if (!checkpoint) {
    state.undo.active = false;
    return;
  }

  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.time = checkpoint.levelTime;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.crashReason = '';
  state.ball.crashKind = '';
  state.ball.landingCount = checkpoint.landingCount;
  state.ball.launchGracePlanetIndex = null;
  state.ball.anchorPlanetIndex = checkpoint.anchorPlanetIndex;
  state.ball.anchorNormal = cloneVec(checkpoint.anchorNormal);
  state.ball.landedPlanetIndex = checkpoint.landedPlanetIndex;
  state.ball.landedPlanetName = checkpoint.landedPlanetName;
  syncBallToAnchor(state.level, state.ball);
  setVec(state.ball.crashStartPosition, state.ball.position);
  setVec(state.ball.crashTargetPosition, state.ball.position);
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragPointerWorld, state.ball.position);
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  state.relayPulse = 0.8;
  state.shots = checkpoint.shots;
  state.resets = checkpoint.resets;
  state.score = checkpoint.score;
  if (Array.isArray(checkpoint.controlShots) && checkpoint.controlShots.length > 0) {
    state.controlShots = checkpoint.controlShots.map((shot) => clampControlShot(shot));
  }
  state.currentAttemptTrail = [];
  state.currentAttemptMinGoalDistance = Number.POSITIVE_INFINITY;
  resetBallTrace();
  ballGroup.visible = true;
  ballGroup.scale.setScalar(1);
  ballMesh.position.y = ballRestY;
  ballMesh.material.color.copy(palette.ball);
  ballMesh.material.emissive.setHex(0x000000);
  ballMesh.material.emissiveIntensity = 0;
  ballShadow.material.opacity = 0.28;
  state.undo.active = false;
  state.undo.checkpoint = null;
  state.undo.fromPosition = null;
  state.undo.toPosition = null;
  state.undo.duration = 0;
  state.undo.elapsed = 0;
  state.message = `Undo restored ${checkpoint.landedPlanetName}.`;
  state.hint = `Shot ${Math.min(checkpoint.landingCount + 1, state.controlShots.length)} is live again.`;
  lastGoalTimerFraction = Number.NaN;
  syncHud();
}

function startUndo() {
  const checkpoint = getLatestUndoCheckpoint();
  if (!checkpoint || checkpointMatchesCurrent(checkpoint)) {
    return;
  }

  setLevelTime(state.level, checkpoint.levelTime);
  rebuildGravityField();
  lastGravityFieldRefreshTime = state.level.time ?? 0;

  const fromPosition = cloneVec(state.ball.position);
  const targetBall = {
    position: cloneVec(checkpoint.position),
    anchorPlanetIndex: checkpoint.anchorPlanetIndex,
    anchorNormal: cloneVec(checkpoint.anchorNormal),
  };
  syncBallToAnchor(state.level, targetBall);
  const toPosition = cloneVec(targetBall.position);
  const rewindDistance = distanceBetween(fromPosition, toPosition);

  state.undo.checkpoints.pop();
  state.undo.active = true;
  state.undo.checkpoint = checkpoint;
  state.undo.fromPosition = fromPosition;
  state.undo.toPosition = toPosition;
  state.undo.duration = clamp(0.12 + rewindDistance * 0.03, 0.12, 0.22);
  state.undo.elapsed = 0;

  stopAdminReplay();
  state.ball.time = checkpoint.levelTime;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.crashReason = '';
  state.ball.crashKind = '';
  state.ball.anchorPlanetIndex = null;
  state.ball.landedPlanetIndex = null;
  state.ball.landedPlanetName = '';
  state.ball.launchGracePlanetIndex = null;
  if (Array.isArray(checkpoint.controlShots) && checkpoint.controlShots.length > 0) {
    state.controlShots = checkpoint.controlShots.map((shot) => clampControlShot(shot));
  }
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = false;
  state.relayPulse = 0;
  resetBallTrace();
  state.message = 'Undo rewinding.';
  state.hint = `Rolling back to ${checkpoint.landedPlanetName}.`;
  lastGoalTimerFraction = Number.NaN;
  syncHud();
}

function resetBallTrace() {
  state.ballTraceCarry = 0;
  state.ballTraceCursor = 0;

  state.ballTraceParticles.forEach((particle, index) => {
    particle.active = false;
    particle.age = 0;
    particle.life = BALL_TRACE_PARTICLE_LIFETIME;
    ballTracePositions[index * 3] = 0;
    ballTracePositions[index * 3 + 1] = -10;
    ballTracePositions[index * 3 + 2] = 0;
    const streakOffset = index * 6;
    ballTraceStreakPositions[streakOffset] = 0;
    ballTraceStreakPositions[streakOffset + 1] = -10;
    ballTraceStreakPositions[streakOffset + 2] = 0;
    ballTraceStreakPositions[streakOffset + 3] = 0;
    ballTraceStreakPositions[streakOffset + 4] = -10;
    ballTraceStreakPositions[streakOffset + 5] = 0;
    ballTraceColors[index * 3] = 0;
    ballTraceColors[index * 3 + 1] = 0;
    ballTraceColors[index * 3 + 2] = 0;
    ballTraceStreakColors[streakOffset] = 0;
    ballTraceStreakColors[streakOffset + 1] = 0;
    ballTraceStreakColors[streakOffset + 2] = 0;
    ballTraceStreakColors[streakOffset + 3] = 0;
    ballTraceStreakColors[streakOffset + 4] = 0;
    ballTraceStreakColors[streakOffset + 5] = 0;
  });

  ballTraceGeometry.attributes.position.needsUpdate = true;
  ballTraceGeometry.attributes.color.needsUpdate = true;
  ballTraceStreakGeometry.attributes.position.needsUpdate = true;
  ballTraceStreakGeometry.attributes.color.needsUpdate = true;
  ballTrace.visible = false;
  ballTraceStreaks.visible = false;
}

function spawnBallTraceParticle(speed, direction, lateral) {
  const particle = state.ballTraceParticles[state.ballTraceCursor];
  state.ballTraceCursor = (state.ballTraceCursor + 1) % state.ballTraceParticles.length;

  const spread = (Math.random() - 0.5) * 0.22;
  const retreat = 0.1 + Math.random() * 0.26;
  particle.active = true;
  particle.x = state.ball.position.x - direction.x * retreat + lateral.x * spread;
  particle.y = state.ball.position.y - direction.y * retreat + lateral.y * spread;
  particle.vx = -direction.x * (0.22 + speed * 0.026) + lateral.x * spread * 0.9;
  particle.vy = -direction.y * (0.22 + speed * 0.026) + lateral.y * spread * 0.9;
  particle.age = 0;
  particle.life = BALL_TRACE_PARTICLE_LIFETIME * (0.8 + Math.min(0.5, speed * 0.03));
}

function updateBallTrace(delta) {
  const speed = length(state.ball.velocity);
  const freeFlight = (
    state.ball.anchorPlanetIndex === null
    && !state.ball.goaling
    && !state.ball.crashed
    && speed > 0.4
  );

  if (freeFlight) {
    const direction = normalize(state.ball.velocity);
    const lateral = { x: -direction.y, y: direction.x };
    const emitRate = 42 + Math.min(88, speed * 11.5);
    state.ballTraceCarry += delta * emitRate;
    while (state.ballTraceCarry >= 1) {
      spawnBallTraceParticle(speed, direction, lateral);
      state.ballTraceCarry -= 1;
    }
  } else {
    state.ballTraceCarry = 0;
  }

  let anyActive = false;
  for (let index = 0; index < state.ballTraceParticles.length; index += 1) {
    const particle = state.ballTraceParticles[index];
    const positionOffset = index * 3;
    const colorOffset = index * 3;
    const streakOffset = index * 6;

    if (!particle.active) {
      ballTraceColors[colorOffset] = 0;
      ballTraceColors[colorOffset + 1] = 0;
      ballTraceColors[colorOffset + 2] = 0;
      ballTraceStreakColors[streakOffset] = 0;
      ballTraceStreakColors[streakOffset + 1] = 0;
      ballTraceStreakColors[streakOffset + 2] = 0;
      ballTraceStreakColors[streakOffset + 3] = 0;
      ballTraceStreakColors[streakOffset + 4] = 0;
      ballTraceStreakColors[streakOffset + 5] = 0;
      continue;
    }

    particle.age += delta;
    if (particle.age >= particle.life) {
      particle.active = false;
      ballTraceColors[colorOffset] = 0;
      ballTraceColors[colorOffset + 1] = 0;
      ballTraceColors[colorOffset + 2] = 0;
      ballTracePositions[positionOffset + 1] = -10;
      ballTraceStreakColors[streakOffset] = 0;
      ballTraceStreakColors[streakOffset + 1] = 0;
      ballTraceStreakColors[streakOffset + 2] = 0;
      ballTraceStreakColors[streakOffset + 3] = 0;
      ballTraceStreakColors[streakOffset + 4] = 0;
      ballTraceStreakColors[streakOffset + 5] = 0;
      ballTraceStreakPositions[streakOffset + 1] = -10;
      ballTraceStreakPositions[streakOffset + 4] = -10;
      continue;
    }

    const lifeT = 1 - particle.age / particle.life;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    ballTracePositions[positionOffset] = particle.x;
    ballTracePositions[positionOffset + 1] = 0.08 + (1 - lifeT) * 0.06;
    ballTracePositions[positionOffset + 2] = particle.y;
    const speed = Math.max(0.001, Math.hypot(particle.vx, particle.vy));
    const directionX = particle.vx / speed;
    const directionY = particle.vy / speed;
    const streakLength = (0.18 + speed * 0.32) * (0.35 + lifeT * 0.65);
    ballTraceStreakPositions[streakOffset] = particle.x;
    ballTraceStreakPositions[streakOffset + 1] = 0.08 + (1 - lifeT) * 0.04;
    ballTraceStreakPositions[streakOffset + 2] = particle.y;
    ballTraceStreakPositions[streakOffset + 3] = particle.x + directionX * streakLength;
    ballTraceStreakPositions[streakOffset + 4] = 0.08 + (1 - lifeT) * 0.04;
    ballTraceStreakPositions[streakOffset + 5] = particle.y + directionY * streakLength;
    const brightness = 0.72 + lifeT * 0.28;
    ballTraceColors[colorOffset] = 1.0 * brightness;
    ballTraceColors[colorOffset + 1] = 0.9 * brightness;
    ballTraceColors[colorOffset + 2] = 0.66 * brightness;
    ballTraceStreakColors[streakOffset] = 1.0 * brightness;
    ballTraceStreakColors[streakOffset + 1] = 0.88 * brightness;
    ballTraceStreakColors[streakOffset + 2] = 0.64 * brightness;
    ballTraceStreakColors[streakOffset + 3] = 0.45 * brightness;
    ballTraceStreakColors[streakOffset + 4] = 0.36 * brightness;
    ballTraceStreakColors[streakOffset + 5] = 0.2 * brightness;
    anyActive = true;
  }

  ballTrace.visible = anyActive;
  ballTraceStreaks.visible = anyActive;
  ballTraceGeometry.attributes.position.needsUpdate = true;
  ballTraceGeometry.attributes.color.needsUpdate = true;
  ballTraceStreakGeometry.attributes.position.needsUpdate = true;
  ballTraceStreakGeometry.attributes.color.needsUpdate = true;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function clampControlShot(shot) {
  return {
    angleDeg: clamp(wrapSignedAngleDeg(shot.angleDeg), CONTROL_MIN_ANGLE, CONTROL_MAX_ANGLE),
    power: clamp(shot.power, Number.parseFloat(powerSliders[0].min), MAX_DRAG_DISTANCE),
  };
}

function createControlShots(level) {
  const presets = level.launchPresets?.length ? level.launchPresets : [DEFAULT_CONTROL_SHOT];
  return presets.map((preset) => clampControlShot(preset));
}

function getActiveStageIndex() {
  return Math.min(state.ball.landingCount, Math.max(0, state.controlShots.length - 1));
}

function getControlShot(stageIndex = getActiveStageIndex()) {
  return state.controlShots[Math.min(Math.max(0, stageIndex), Math.max(0, state.controlShots.length - 1))]
    ?? clampControlShot(DEFAULT_CONTROL_SHOT);
}

function normalizeAngleDeg(angleDeg) {
  return ((angleDeg % 360) + 360) % 360;
}

function wrapSignedAngleDeg(angleDeg) {
  const wrapped = normalizeAngleDeg(angleDeg);
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

function directionFromAngleDeg(angleDeg) {
  const angleRad = angleDeg * Math.PI / 180;
  return {
    x: Math.cos(angleRad),
    y: Math.sin(angleRad),
  };
}

function angleDegFromDirection(direction) {
  return wrapSignedAngleDeg(Math.atan2(direction.y, direction.x) * 180 / Math.PI);
}

function colorHex(color) {
  return `#${color.getHexString()}`;
}

function mixColors(from, to, amount) {
  return from.clone().lerp(to, amount);
}

function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createPlanetSeed(planet, salt = 0) {
  const x = Math.round((planet.position.x + 20) * 1000);
  const y = Math.round((planet.position.y + 20) * 1000);
  const radius = Math.round(planet.radius * 1000);
  return ((x * 73856093) ^ (y * 19349663) ^ (radius * 83492791) ^ salt) >>> 0;
}

function createCanvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function drawEllipse(ctx, x, y, rx, ry, rotation, fillStyle, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getRockyBiome(planet) {
  const hsl = {};
  new THREE.Color(planet.core).getHSL(hsl);
  if (hsl.h >= 0.48 && hsl.h <= 0.7) {
    return 'oceanic';
  }
  if (hsl.h <= 0.12 || hsl.h >= 0.92) {
    return 'desert';
  }
  return 'moon';
}

function createRockyPlanetTexture(planet) {
  return createCanvasTexture(1024, 512, (ctx, width, height) => {
    const random = createSeededRandom(createPlanetSeed(planet, 17));
    const biome = getRockyBiome(planet);

    let deepColor;
    let midColor;
    let accentColor;
    let brightColor;

    if (biome === 'oceanic') {
      deepColor = new THREE.Color(0x163b69);
      midColor = new THREE.Color(0x2d6da3);
      accentColor = new THREE.Color(0x6db06b);
      brightColor = new THREE.Color(0xe9f5f2);
    } else if (biome === 'desert') {
      deepColor = new THREE.Color(0x7d4027);
      midColor = new THREE.Color(0xb86937);
      accentColor = new THREE.Color(0xd7a15e);
      brightColor = new THREE.Color(0xf0dcc4);
    } else {
      deepColor = new THREE.Color(0x656870);
      midColor = new THREE.Color(0x8a8f98);
      accentColor = new THREE.Color(0xb7bcc4);
      brightColor = new THREE.Color(0xe4e7eb);
    }

    deepColor.lerp(new THREE.Color(planet.core), 0.28);
    midColor.lerp(new THREE.Color(planet.core), 0.34);
    accentColor.lerp(new THREE.Color(planet.glow), 0.2);

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, colorHex(mixColors(brightColor, midColor, 0.3)));
    background.addColorStop(0.45, colorHex(midColor));
    background.addColorStop(1, colorHex(deepColor));
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    for (let index = 0; index < 7; index += 1) {
      const haze = ctx.createLinearGradient(0, height * random(), width, height * random());
      haze.addColorStop(0, colorHex(mixColors(brightColor, accentColor, random() * 0.3)));
      haze.addColorStop(1, colorHex(mixColors(deepColor, midColor, random() * 0.45)));
      ctx.save();
      ctx.globalAlpha = 0.08 + random() * 0.08;
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    if (biome === 'oceanic') {
      for (let index = 0; index < 12; index += 1) {
        drawEllipse(
          ctx,
          random() * width,
          random() * height,
          width * (0.05 + random() * 0.08),
          height * (0.03 + random() * 0.06),
          random() * Math.PI,
          colorHex(mixColors(accentColor, brightColor, random() * 0.2)),
          0.8,
        );
      }
      for (let index = 0; index < 10; index += 1) {
        drawEllipse(
          ctx,
          random() * width,
          random() * height,
          width * (0.06 + random() * 0.12),
          height * (0.012 + random() * 0.025),
          random() * Math.PI,
          colorHex(brightColor),
          0.16 + random() * 0.14,
        );
      }
    } else if (biome === 'desert') {
      for (let index = 0; index < 16; index += 1) {
        drawEllipse(
          ctx,
          random() * width,
          random() * height,
          width * (0.04 + random() * 0.09),
          height * (0.02 + random() * 0.05),
          random() * Math.PI,
          colorHex(mixColors(accentColor, brightColor, random() * 0.4)),
          0.4 + random() * 0.25,
        );
      }
      for (let index = 0; index < 10; index += 1) {
        drawEllipse(
          ctx,
          random() * width,
          random() * height,
          width * (0.025 + random() * 0.05),
          height * (0.015 + random() * 0.03),
          random() * Math.PI,
          colorHex(mixColors(deepColor, new THREE.Color(0x1f1614), 0.35)),
          0.16 + random() * 0.14,
        );
      }
    } else {
      for (let index = 0; index < 22; index += 1) {
        const craterX = random() * width;
        const craterY = random() * height;
        const craterRx = width * (0.015 + random() * 0.045);
        const craterRy = height * (0.015 + random() * 0.04);
        drawEllipse(
          ctx,
          craterX,
          craterY,
          craterRx * 1.08,
          craterRy * 1.08,
          random() * Math.PI,
          colorHex(mixColors(deepColor, new THREE.Color(0x22242a), 0.45)),
          0.18 + random() * 0.14,
        );
        drawEllipse(
          ctx,
          craterX,
          craterY,
          craterRx,
          craterRy,
          random() * Math.PI,
          colorHex(mixColors(accentColor, brightColor, 0.25)),
          0.22 + random() * 0.18,
        );
      }
    }

    const shade = ctx.createLinearGradient(0, 0, width, 0);
    shade.addColorStop(0, '#000000');
    shade.addColorStop(0.22, 'rgba(0, 0, 0, 0)');
    shade.addColorStop(0.78, 'rgba(255, 255, 255, 0)');
    shade.addColorStop(1, '#ffffff');
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  });
}

function createGasGiantTexture(planet) {
  return createCanvasTexture(1024, 512, (ctx, width, height) => {
    const random = createSeededRandom(createPlanetSeed(planet, 29));
    const core = new THREE.Color(planet.core);
    const glow = new THREE.Color(planet.glow);
    const cream = new THREE.Color(0xf3dfb6);
    const rose = new THREE.Color(0xc88e63);
    const slate = new THREE.Color(0x6e7497);
    const bands = 18;

    for (let index = 0; index < bands; index += 1) {
      const startY = (height / bands) * index;
      const bandHeight = height / bands + 2;
      const mixAmount = index / Math.max(1, bands - 1);
      const bandColor = mixColors(
        mixColors(cream, core, 0.28 + random() * 0.14),
        mixColors(rose, glow, 0.24 + random() * 0.2),
        0.2 + mixAmount * 0.55,
      );
      bandColor.offsetHSL((random() - 0.5) * 0.04, 0, (random() - 0.5) * 0.08);
      ctx.fillStyle = colorHex(bandColor);
      ctx.fillRect(0, startY, width, bandHeight);
    }

    for (let index = 0; index < bands - 1; index += 1) {
      const y = (height / bands) * (index + 1);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 18) {
        const wave = Math.sin(x * 0.02 + index * 0.85) * (4 + random() * 7);
        ctx.lineTo(x, y + wave);
      }
      ctx.strokeStyle = colorHex(mixColors(core, slate, 0.42));
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 4 + random() * 3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (let index = 0; index < 28; index += 1) {
      drawEllipse(
        ctx,
        random() * width,
        random() * height,
        width * (0.04 + random() * 0.1),
        height * (0.006 + random() * 0.016),
        (random() - 0.5) * 0.2,
        colorHex(mixColors(glow, cream, 0.4 + random() * 0.2)),
        0.08 + random() * 0.08,
      );
    }

    drawEllipse(
      ctx,
      width * (0.62 + random() * 0.12),
      height * (0.54 + random() * 0.12),
      width * 0.12,
      height * 0.055,
      -0.18,
      colorHex(mixColors(new THREE.Color(0xd88a59), glow, 0.18)),
      0.58,
    );
    drawEllipse(
      ctx,
      width * 0.66,
      height * 0.59,
      width * 0.06,
      height * 0.022,
      -0.18,
      colorHex(mixColors(cream, new THREE.Color(0xffffff), 0.35)),
      0.28,
    );

    const vignette = ctx.createLinearGradient(0, 0, width, 0);
    vignette.addColorStop(0, '#000000');
    vignette.addColorStop(0.14, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.86, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, '#000000');
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  });
}

function getPlanetTexture(planet) {
  const key = [
    planet.landable ? 'landable' : 'hazard',
    planet.position.x,
    planet.position.y,
    planet.radius,
    planet.core,
    planet.glow,
  ].join(':');

  if (!planetTextureCache.has(key)) {
    planetTextureCache.set(
      key,
      planet.landable ? createRockyPlanetTexture(planet) : createGasGiantTexture(planet),
    );
  }

  return planetTextureCache.get(key);
}

state.controlShots = createControlShots(state.level);

function getPreviewDirection() {
  const shot = getControlShot();
  return constrainLaunchDirection(directionFromAngleDeg(shot.angleDeg), shot.power);
}

function getPreviewAnchor() {
  const shot = getControlShot();
  const anchor = cloneVec(state.ball.position);
  addScaledVec(anchor, getPreviewDirection(), shot.power);
  return anchor;
}

function getWindowStatusText() {
  const remaining = getGoalRemainingTime(state.level, state.ball.time ?? state.level.time ?? 0);
  return remaining > 0.05 ? `Window ${remaining.toFixed(1)}s` : 'Window closed';
}

function getRunStatusText() {
  if (state.ball.goaling) {
    return 'Capture sequence';
  }

  if (state.ball.crashed) {
    return 'Retry armed';
  }

  if (state.ball.anchorPlanetIndex !== null && state.ball.landingCount > 0) {
    return `Shot ${Math.min(state.ball.landingCount + 1, state.controlShots.length)} · Relay locked`;
  }

  if (state.ball.anchorPlanetIndex !== null) {
    return `Shot ${Math.min(getActiveStageIndex() + 1, state.controlShots.length)} · Launch Pad`;
  }

  return `Shot ${Math.min(getActiveStageIndex() + 1, state.controlShots.length)} · In flight`;
}

function describeClosestLandingMiss() {
  let bestPlanet = null;
  let bestClearance = Number.POSITIVE_INFINITY;

  for (const planet of state.level.planets) {
    if (!planet.landable) {
      continue;
    }

    const landingRadius = planet.landingRadius ?? getBallSurfaceRadius(planet);
    const clearance = distanceBetween(state.ball.position, planet.position) - landingRadius;
    if (clearance < bestClearance) {
      bestClearance = clearance;
      bestPlanet = planet;
    }
  }

  if (!bestPlanet || bestClearance > 0.85) {
    return '';
  }

  return `Missed ${bestPlanet.name} by ${formatDistance(Math.max(0, bestClearance))}.`;
}

function describeFailureHint(reason) {
  if (reason === 'goal-closed') {
    const closeTime = (state.level.startTimeSeconds ?? 0) + (state.level.goalOpenSeconds ?? 0);
    const lateBy = Math.max(0, (state.ball.time ?? state.level.time ?? closeTime) - closeTime);
    const goalClearance = Math.max(
      0,
      distanceBetween(state.ball.position, state.level.goalCenter) - state.level.goalRadius,
    );
    return `Retry ${state.level.name}. Late by ${lateBy.toFixed(1)}s with ${formatDistance(goalClearance)} to spare.`;
  }

  if (reason === 'sun') {
    return `Retry ${state.level.name}. Skim the well, don't drop into it.`;
  }

  const closestLandingMiss = describeClosestLandingMiss();
  if (closestLandingMiss) {
    return `Retry ${state.level.name}. ${closestLandingMiss}`;
  }

  const goalDistance = Math.max(
    0,
    distanceBetween(state.ball.position, state.level.goalCenter) - state.level.goalRadius,
  );
  if (goalDistance < state.level.goalPullRadius) {
    return `Retry ${state.level.name}. You reached the event well but missed capture by ${formatDistance(goalDistance)}.`;
  }

  if (reason === 'planet') {
    return `Retry ${state.level.name}. Slingshot wider around the wells.`;
  }

  if (reason === 'settled') {
    return `Retry ${state.level.name}. Carry more speed or catch a relay sooner.`;
  }

  return `Retry ${state.level.name}. The route drifted off the course.`;
}

function beginAttemptTrail() {
  state.currentAttemptTrail = [cloneVec(state.ball.position)];
  state.currentAttemptMinGoalDistance = Math.max(
    0,
    distanceBetween(state.ball.position, state.level.goalCenter) - state.level.goalRadius,
  );
}

function recordAttemptTrailPoint(force = false) {
  if (state.currentAttemptTrail.length === 0) {
    return;
  }

  const currentPoint = cloneVec(state.ball.position);
  const lastPoint = state.currentAttemptTrail[state.currentAttemptTrail.length - 1];
  if (force || distanceBetween(lastPoint, currentPoint) >= 0.14) {
    state.currentAttemptTrail.push(currentPoint);
  }

  state.currentAttemptMinGoalDistance = Math.min(
    state.currentAttemptMinGoalDistance,
    Math.max(0, distanceBetween(state.ball.position, state.level.goalCenter) - state.level.goalRadius),
  );
}

function finalizeAttemptTrail(outcome) {
  if (state.currentAttemptTrail.length === 0) {
    return;
  }

  recordAttemptTrailPoint(true);
  state.lastAttemptTrail = state.currentAttemptTrail.map((point) => cloneVec(point));
  state.lastAttemptOutcome = outcome;

  if (
    Number.isFinite(state.currentAttemptMinGoalDistance)
    && (
      !state.bestApproach
      || state.currentAttemptMinGoalDistance < state.bestApproach.minGoalDistance - 0.01
    )
  ) {
    state.bestApproach = {
      minGoalDistance: state.currentAttemptMinGoalDistance,
      usedRelay: (state.ball.landingCount ?? 0) > 0 || outcome === 'landed',
      outcome,
    };
  }

  state.currentAttemptTrail = [];
  state.currentAttemptMinGoalDistance = Number.POSITIVE_INFINITY;
  syncLastAttemptTrailVisual();
}

function constrainLaunchDirection(direction, power) {
  const normalizedDirection = normalize(direction);
  if (state.ball.anchorPlanetIndex === null || state.ball.anchorPlanetIndex === undefined) {
    return normalizedDirection;
  }

  const anchorNormal = normalize(state.ball.anchorNormal ?? { x: 1, y: 0 });
  const tangent = { x: -anchorNormal.y, y: anchorNormal.x };
  const relativeVelocity = launchVelocity(normalizedDirection, power);
  const relativeSpeed = Math.max(0.0001, length(relativeVelocity));
  const inheritedVelocity = {
    x:
      getPlanetVelocity(state.level, state.ball.anchorPlanetIndex, state.ball.time ?? state.level.time ?? 0).x
      + getPlanetSurfaceVelocity(state.level, state.ball.anchorPlanetIndex, state.ball.anchorNormal).x,
    y:
      getPlanetVelocity(state.level, state.ball.anchorPlanetIndex, state.ball.time ?? state.level.time ?? 0).y
      + getPlanetSurfaceVelocity(state.level, state.ball.anchorPlanetIndex, state.ball.anchorNormal).y,
  };
  const maxInwardLaunchAngleDeg = 30;
  const minimumSafeNormalVelocity = -relativeSpeed * Math.sin(maxInwardLaunchAngleDeg * Math.PI / 180);
  const requiredNormalComponent = (minimumSafeNormalVelocity - dot(inheritedVelocity, anchorNormal)) / relativeSpeed;

  if (requiredNormalComponent <= -1) {
    return normalizedDirection;
  }

  if (requiredNormalComponent >= 1) {
    return anchorNormal;
  }

  const requestedRelativeAngle = Math.atan2(
    dot(normalizedDirection, tangent),
    dot(normalizedDirection, anchorNormal),
  );
  const maxRelativeAngle = Math.acos(clamp(requiredNormalComponent, -1, 1));
  const clampedRelativeAngle = clamp(requestedRelativeAngle, -maxRelativeAngle, maxRelativeAngle);
  return normalize({
    x: anchorNormal.x * Math.cos(clampedRelativeAngle) + tangent.x * Math.sin(clampedRelativeAngle),
    y: anchorNormal.y * Math.cos(clampedRelativeAngle) + tangent.y * Math.sin(clampedRelativeAngle),
  });
}

function getShotControlStateLabel(stageIndex, activeStageIndex) {
  if (stageIndex < activeStageIndex) {
    return 'Locked';
  }

  if (stageIndex === activeStageIndex) {
    return stageIndex === 0 ? 'Active' : 'Ready';
  }

  return 'Queued';
}

function syncLaunchControls() {
  const activeStageIndex = getActiveStageIndex();
  const controlsLocked = state.adminReplay.active || state.undo.active;

  shotControlPanels.forEach((panel, index) => {
    const shot = state.controlShots[index];
    const visible = Boolean(shot);
    panel.hidden = !visible;
    if (!visible) {
      return;
    }

    panel.classList.toggle('is-active', index === activeStageIndex);
    angleSliders[index].value = shot.angleDeg.toFixed(1);
    powerSliders[index].value = shot.power.toFixed(2);
    angleSliders[index].disabled = controlsLocked;
    powerSliders[index].disabled = controlsLocked;
    angleValues[index].textContent = `${shot.angleDeg.toFixed(1)} deg`;
    powerValues[index].textContent = shot.power.toFixed(2);
    shotControlStates[index].textContent = getShotControlStateLabel(index, activeStageIndex);
  });

  launchButton.textContent = controlsLocked
    ? 'Auto'
    : `Go${state.controlShots.length > 1 ? ` · Shot ${activeStageIndex + 1}` : ''}`;
  launchButton.disabled = controlsLocked || ballIsMoving() || state.dragActive;
  undoButton.disabled = !canRedo();
}

function setControlShot(stageIndex, angleDeg, power) {
  state.controlShots[stageIndex] = clampControlShot({ angleDeg, power });
  syncLaunchControls();
}

function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  material?.dispose?.();
}

function clearGroup(group) {
  const children = [...group.children];
  children.forEach((child) => {
    child.traverse((node) => {
      node.geometry?.dispose?.();
      disposeMaterial(node.material);
    });
    group.remove(child);
  });
}

function mixFieldColor(intensity, planetTint) {
  const color = new THREE.Color();
  if (intensity < 0.55) {
    color.lerpColors(gravityFieldPalette.low, gravityFieldPalette.mid, intensity / 0.55);
  } else {
    color.lerpColors(gravityFieldPalette.mid, gravityFieldPalette.high, (intensity - 0.55) / 0.45);
  }

  if (planetTint) {
    color.lerp(planetTint, 0.32);
  }

  return color;
}

function createGravityFieldSample(basePoint, halfWidth, halfHeight) {
  const gravity = samplePlanetGravity(state.level, basePoint);
  const magnitude = length(gravity);
  let tintWeight = 0;
  const tint = new THREE.Color(0x000000);

  state.level.planets.forEach((planet) => {
    const distance = distanceBetween(basePoint, planet.position);
    if (distance >= planet.falloff) {
      return;
    }

    const influence = Math.pow(1 - distance / planet.falloff, 2) * (planet.gravity / 12);
    const glow = new THREE.Color(planet.glow);
    tint.r += glow.r * influence;
    tint.g += glow.g * influence;
    tint.b += glow.b * influence;
    tintWeight += influence;
  });

  const edgeDistance = Math.min(
    halfWidth - Math.abs(basePoint.x),
    halfHeight - Math.abs(basePoint.y),
  );
  const edgeFade = THREE.MathUtils.smoothstep(edgeDistance, 0.12, 1.45);
  const displacement = Math.min(0.82, Math.log1p(magnitude) * 0.22) * edgeFade;
  const intensity = clamp(Math.log1p(magnitude) / 3.9, 0, 1);
  const direction = magnitude > 0.0001
    ? { x: gravity.x / magnitude, y: gravity.y / magnitude }
    : { x: 0, y: 0 };
  const planetTint = tintWeight > 0
    ? tint.multiplyScalar(1 / tintWeight)
    : null;

  return {
    position: new THREE.Vector3(
      basePoint.x + direction.x * displacement,
      0.035 + intensity * 0.05,
      basePoint.y + direction.y * displacement,
    ),
    color: mixFieldColor(intensity, planetTint),
  };
}

function pushGravitySegment(positions, colors, from, to) {
  positions.push(
    from.position.x, from.position.y, from.position.z,
    to.position.x, to.position.y, to.position.z,
  );
  colors.push(
    from.color.r, from.color.g, from.color.b,
    to.color.r, to.color.g, to.color.b,
  );
}

function rebuildGravityField() {
  clearGroup(gravityFieldRoot);
  gravityFieldVisuals = null;

  const columns = gravityGridConfig.columns;
  const rows = gravityGridConfig.rows;
  const width = COURSE.width - gravityGridConfig.insetX * 2;
  const height = COURSE.height - gravityGridConfig.insetY * 2;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const samples = [];
  const positions = [];
  const colors = [];

  for (let row = 0; row <= rows; row += 1) {
    const rowSamples = [];
    const yRatio = row / rows;
    const y = -halfHeight + yRatio * height;

    for (let column = 0; column <= columns; column += 1) {
      const xRatio = column / columns;
      const x = -halfWidth + xRatio * width;
      rowSamples.push(createGravityFieldSample({ x, y }, halfWidth, halfHeight));
    }

    samples.push(rowSamples);
  }

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      pushGravitySegment(positions, colors, samples[row][column], samples[row][column + 1]);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      pushGravitySegment(positions, colors, samples[row][column], samples[row + 1][column]);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const glow = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.renderOrder = 2;
  gravityFieldRoot.add(glow);

  const core = new THREE.LineSegments(
    geometry.clone(),
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  core.renderOrder = 3;
  gravityFieldRoot.add(core);

  gravityFieldVisuals = { glow, core };
}

function rebuildPlanets() {
  clearGroup(orbitPathsRoot);
  clearGroup(planetsRoot);

  planetVisuals = state.level.planets.map((planet) => {
    const group = new THREE.Group();
    const coreColor = new THREE.Color(planet.core);
    const glowColor = new THREE.Color(planet.glow);
    const surfaceTexture = getPlanetTexture(planet);
    const orbitPathColor = planet.landable
      ? mixColors(glowColor, new THREE.Color(0x9feedd), 0.35)
      : mixColors(glowColor, new THREE.Color(0xffdfa9), 0.22);

    const orbitPathPoints = [];
    for (let step = 0; step <= 128; step += 1) {
      const anomaly = (step / 128) * Math.PI * 2;
      const eccentricity = planet.orbitEccentricity ?? 0;
      const eccentricAnomaly = eccentricity < 0.000001
        ? anomaly
        : (() => {
          let estimate = anomaly;
          for (let iteration = 0; iteration < 8; iteration += 1) {
            const delta =
              (estimate - eccentricity * Math.sin(estimate) - anomaly)
              / Math.max(0.000001, 1 - eccentricity * Math.cos(estimate));
            estimate -= delta;
            if (Math.abs(delta) < 0.000001) {
              break;
            }
          }
          return estimate;
        })();
      const localX = planet.orbitSemiMajor * (Math.cos(eccentricAnomaly) - eccentricity);
      const localY = planet.orbitSemiMinor * Math.sin(eccentricAnomaly);
      const rotation = planet.orbitRotation ?? 0;
      const x = localX * Math.cos(rotation) - localY * Math.sin(rotation);
      const y = localX * Math.sin(rotation) + localY * Math.cos(rotation);
      orbitPathPoints.push(new THREE.Vector3(x, 0.028, y));
    }
    const orbitPath = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(orbitPathPoints),
      new THREE.LineBasicMaterial({
        color: orbitPathColor,
        transparent: true,
        opacity: planet.landable ? 0.24 : 0.16,
        depthWrite: false,
      }),
    );
    orbitPath.renderOrder = 1;
    orbitPath.position.set(planet.orbitCenter.x, 0, planet.orbitCenter.y);
    orbitPathsRoot.add(orbitPath);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(planet.radius + 0.52, planet.falloff, 72),
      new THREE.MeshBasicMaterial({
        color: planet.landable ? mixColors(glowColor, new THREE.Color(0x88f5e1), 0.42) : glowColor,
        transparent: true,
        opacity: planet.landable ? 0.1 : 0.08,
        side: THREE.DoubleSide,
      }),
    );
    halo.rotation.x = -Math.PI / 2;
    group.add(halo);

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(planet.radius + (planet.landable ? 0.32 : 0.48), 48),
      new THREE.MeshBasicMaterial({
        color: planet.landable ? mixColors(glowColor, new THREE.Color(0x9ce9ff), 0.16) : mixColors(glowColor, new THREE.Color(0xffe3ba), 0.12),
        transparent: true,
        opacity: planet.landable ? 0.16 : 0.18,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.04;
    group.add(glow);

    const bodyMaterial = planet.landable
      ? new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: surfaceTexture,
        emissive: mixColors(coreColor, glowColor, 0.14),
        emissiveIntensity: 0.08,
        roughness: 0.98,
        metalness: 0.02,
      })
      : new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: surfaceTexture,
        emissive: mixColors(coreColor, glowColor, 0.1),
        emissiveIntensity: 0.12,
        roughness: 0.9,
        metalness: 0,
      });

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius, 48, 48),
      bodyMaterial,
    );
    body.position.y = planet.radius * 0.74;
    if (!planet.landable) {
      body.scale.y = 0.94;
    }
    group.add(body);

    let atmosphereShell = null;
    let accentBand = null;

    if (planet.landable) {
      atmosphereShell = new THREE.Mesh(
        new THREE.SphereGeometry(planet.radius * 1.045, 48, 48),
        new THREE.MeshPhongMaterial({
          color: mixColors(glowColor, new THREE.Color(0xc7fff7), 0.38),
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
    } else {
      atmosphereShell = new THREE.Mesh(
        new THREE.SphereGeometry(planet.radius * 1.065, 48, 48),
        new THREE.MeshPhongMaterial({
          color: mixColors(glowColor, new THREE.Color(0xffe2b3), 0.24),
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      atmosphereShell.scale.y = 0.95;

      accentBand = new THREE.Mesh(
        new THREE.TorusGeometry(planet.radius * 1.16, 0.045, 12, 96),
        new THREE.MeshBasicMaterial({
          color: mixColors(glowColor, new THREE.Color(0xffd489), 0.42),
          transparent: true,
          opacity: 0.3,
        }),
      );
      accentBand.rotation.x = Math.PI / 2.7;
      accentBand.rotation.z = 0.34;
      accentBand.position.y = body.position.y;
      group.add(accentBand);
    }

    atmosphereShell.position.copy(body.position);
    group.add(atmosphereShell);

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(planet.radius + 0.16, 0.035, 12, 72),
      new THREE.MeshBasicMaterial({
        color: planet.landable ? 0x7df3d1 : 0xfef3d0,
        transparent: true,
        opacity: planet.landable ? 0.68 : 0.42,
      }),
    );
    orbitRing.rotation.x = Math.PI / 2.45;
    orbitRing.position.y = planet.radius * 0.84;
    group.add(orbitRing);

    let landingRing = null;
    if (planet.landable) {
      landingRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.2, planet.landingRadius ?? planet.radius + 0.48, 64),
        new THREE.MeshBasicMaterial({
          color: 0x75f3d9,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
        }),
      );
      landingRing.rotation.x = -Math.PI / 2;
      landingRing.position.y = 0.06;
      group.add(landingRing);
    }

    group.position.set(planet.position.x, 0, planet.position.y);
    planetsRoot.add(group);

    return {
      group,
      orbitPath,
      body,
      halo,
      glow,
      atmosphereShell,
      accentBand,
      orbitRing,
      landingRing,
      planet,
    };
  });
}

function syncLevelQueryParam(levelIndex) {
  const url = new URL(window.location.href);
  url.searchParams.set('level', String(levelIndex + 1));
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function getInitialLevelIndex() {
  const url = new URL(window.location.href);
  const rawLevel = url.searchParams.get('level');
  if (!rawLevel) {
    return 0;
  }

  const parsedLevel = Number.parseInt(rawLevel, 10);
  if (!Number.isFinite(parsedLevel)) {
    return 0;
  }

  return clamp(parsedLevel - 1, 0, LEVELS.length - 1);
}

function applyLevel(index) {
  stopAdminReplay();
  state.levelIndex = index % LEVELS.length;
  state.level = createLevelRuntime(state.levelIndex);
  state.controlShots = createControlShots(state.level);
  state.adminSolutionIndex = 0;
  clearAttemptMemory();
  clearUndoCheckpoints();
  resetBallTrace();
  lastGoalTimerFraction = Number.NaN;

  updateSunVisual();
  goalGroup.position.set(state.level.goalCenter.x, 0.06, state.level.goalCenter.y);

  syncLevelQueryParam(state.levelIndex);
  syncLaunchControls();

  levelChip.textContent = `Level ${state.levelIndex + 1}/${LEVELS.length} · ${state.level.name}`;
  rebuildGravityField();
  lastGravityFieldRefreshTime = state.level.time ?? 0;
  rebuildPlanets();
}

function syncHud() {
  scoreValue.textContent = String(state.score);
  shotsValue.textContent = String(state.shots);
  resetValue.textContent = String(state.resets);
  statusLine.textContent = state.message;
  statusHint.textContent = state.hint;
  approachLine.textContent = getBestApproachText();
  runStatusPill.textContent = getRunStatusText();
  windowStatusPill.textContent = getWindowStatusText();
  runStatusPill.classList.toggle('is-hot', state.ball.anchorPlanetIndex !== null && state.ball.landingCount > 0);
  windowStatusPill.classList.toggle(
    'is-hot',
    getGoalRemainingTime(state.level, state.ball.time ?? state.level.time ?? 0) < 2.5,
  );
  const shownPower = state.dragActive ? state.dragPower : getControlShot().power;
  powerFill.style.transform = `scaleX(${Math.max(0.04, shownPower / MAX_DRAG_DISTANCE)})`;
  syncLaunchControls();
}

function resetBall(message, hint, options = {}) {
  if (options.scored) {
    state.score += 1;
  }

  if (options.countReset) {
    state.resets += 1;
  }

  if (options.advanceLevel) {
    applyLevel((state.levelIndex + 1) % LEVELS.length);
  }

  if (!options.keepAdminReplay) {
    stopAdminReplay();
  }

  setLevelTime(state.level, state.level.startTimeSeconds ?? 0);
  rebuildGravityField();
  lastGravityFieldRefreshTime = state.level.time ?? 0;
  const freshBall = createBallState(state.level);
  setVec(state.ball.position, freshBall.position);
  state.ball.velocity.x = freshBall.velocity.x;
  state.ball.velocity.y = freshBall.velocity.y;
  state.ball.time = freshBall.time;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.crashReason = '';
  state.ball.crashKind = '';
  state.ball.landingCount = freshBall.landingCount;
  state.ball.launchGracePlanetIndex = freshBall.launchGracePlanetIndex;
  state.ball.anchorPlanetIndex = freshBall.anchorPlanetIndex;
  state.ball.anchorNormal = cloneVec(freshBall.anchorNormal);
  state.ball.landedPlanetIndex = freshBall.anchorPlanetIndex ?? null;
  state.ball.landedPlanetName = state.level.planets[freshBall.anchorPlanetIndex ?? 0]?.name ?? 'launch world';
  setVec(state.ball.crashStartPosition, freshBall.position);
  setVec(state.ball.crashTargetPosition, freshBall.position);
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragPointerWorld, state.ball.position);
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  state.relayPulse = 0;
  resetBallTrace();
  ballGroup.visible = true;
  ballGroup.scale.setScalar(1);
  ballMesh.position.y = ballRestY;
  ballMesh.material.color.copy(palette.ball);
  ballMesh.material.emissive.setHex(0x000000);
  ballMesh.material.emissiveIntensity = 0;
  ballShadow.material.opacity = 0.28;
  state.message = message;
  state.hint = hint;
  lastGoalTimerFraction = Number.NaN;
  syncHud();
}

function beginGoal() {
  finalizeAttemptTrail('goal');
  stopAdminReplay();
  state.ball.goaling = true;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.relayPulse = 0;
  state.message = 'Event horizon captured.';
  state.hint = 'Course clear. Loading the next route.';
  syncHud();
}

function beginCrash(reason, hint, crashKind = 'planet') {
  finalizeAttemptTrail('crash');
  stopAdminReplay();
  state.ball.crashed = true;
  state.ball.goaling = false;
  state.ball.transition = 0;
  state.ball.crashReason = reason;
  state.ball.crashKind = crashKind;
  setVec(state.ball.crashStartPosition, state.ball.position);
  setVec(
    state.ball.crashTargetPosition,
    state.ball.crashKind === 'sun' ? state.level.sun : state.ball.position,
  );
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.relayPulse = 0;
  state.message = reason;
  state.hint = hint;
  syncHud();
}

function beginLanding(result) {
  finalizeAttemptTrail('landed');
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.launchGracePlanetIndex = null;
  state.ball.landedPlanetIndex = result.planetIndex ?? null;
  state.ball.landedPlanetName = result.planetName ?? 'relay world';
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragPointerWorld, state.ball.position);
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  state.relayPulse = 1;
  ballGroup.visible = true;
  ballGroup.scale.setScalar(1);
  ballMesh.position.y = ballRestY;
  ballShadow.material.opacity = 0.28;
  state.message = `Relay locked on ${state.ball.landedPlanetName}.`;
  state.hint = `Chain ${state.ball.landingCount} armed. Shot ${Math.min(state.ball.landingCount + 1, state.controlShots.length)} is live.`;

  if (state.adminReplay.active) {
    const selected = getAdminSolutions()[state.adminReplay.solutionIndex];
    if (selected && state.adminReplay.shotIndex < selected.shots.length) {
      state.adminReplay.nextLaunchTime = (state.level.time ?? 0) + selected.shots[state.adminReplay.shotIndex].waitSeconds;
      state.hint = `${getAdminSolutionSummary(selected, state.adminReplay.solutionIndex, getAdminSolutions().length)} · waiting`;
    } else {
      stopAdminReplay();
    }
  }
  syncHud();
}

function getWorldPointFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNdc, camera);
  raycaster.ray.intersectPlane(coursePlane, pointerWorld);
  return { x: pointerWorld.x, y: pointerWorld.z };
}

function ballIsMoving() {
  return lengthSq(state.ball.velocity) > 0.002 || state.ball.goaling || state.ball.crashed || state.undo.active;
}

function updateDragState(worldPoint) {
  const activeStageIndex = getActiveStageIndex();
  const activeShot = getControlShot(activeStageIndex);
  const pullVector = {
    x: worldPoint.x - state.ball.position.x,
    y: worldPoint.y - state.ball.position.y,
  };
  const stretch = Math.min(length(pullVector), MAX_DRAG_DISTANCE);

  if (stretch < 0.0001) {
    setVec(state.dragAnchor, state.ball.position);
    state.dragPower = 0;
    setControlShot(activeStageIndex, activeShot.angleDeg, 0.2);
    return;
  }

  const direction = constrainLaunchDirection(pullVector, stretch);
  setVec(state.aimDirection, direction);
  setVec(state.dragAnchor, state.ball.position);
  addScaledVec(state.dragAnchor, direction, stretch);
  state.dragPower = stretch;
  setControlShot(activeStageIndex, angleDegFromDirection(direction), stretch);
}

function updateBallTransforms() {
  ballGroup.position.set(state.ball.position.x, 0, state.ball.position.y);
}

function updateCueVisual() {
  aimLine.visible = state.dragActive && !ballIsMoving();
  dragHandle.visible = state.dragActive && !ballIsMoving();
  syncLastAttemptTrailVisual();

  if (!aimLine.visible) {
    return;
  }
  const bandVector = {
    x: state.dragAnchor.x - state.ball.position.x,
    y: state.dragAnchor.y - state.ball.position.y,
  };
  const guideLength = Math.max(0.001, length(bandVector));
  const bandDirection = normalize(bandVector);
  const anchor = state.dragAnchor;
  aimLine.material.opacity = 0.9;
  dragHandle.material.opacity = 0.95;

  aimLine.position.set(
    state.ball.position.x + bandDirection.x * guideLength * 0.5,
    0.14,
    state.ball.position.y + bandDirection.y * guideLength * 0.5,
  );
  aimLine.rotation.y = Math.atan2(-bandDirection.y, bandDirection.x);
  aimLine.scale.set(guideLength, 1, 1);

  dragHandle.position.set(anchor.x, 0.16, anchor.y);
}

function launchShot(direction, power, anchor) {
  if (!state.adminReplay.active) {
    saveUndoCheckpoint();
  }
  const activeStageIndex = getActiveStageIndex();
  const launchPlanetIndex = state.ball.anchorPlanetIndex;
  const launchDirection = constrainLaunchDirection(direction, power);
  const relativeVelocity = launchVelocity(launchDirection, power);
  const launchBodyVelocity = launchPlanetIndex !== null
    ? getPlanetVelocity(state.level, launchPlanetIndex, state.ball.time ?? state.level.time ?? 0)
    : { x: 0, y: 0 };
  const launchSurfaceVelocity = launchPlanetIndex !== null
    ? getPlanetSurfaceVelocity(state.level, launchPlanetIndex, state.ball.anchorNormal)
    : { x: 0, y: 0 };
  const velocity = {
    x: relativeVelocity.x + launchBodyVelocity.x + launchSurfaceVelocity.x,
    y: relativeVelocity.y + launchBodyVelocity.y + launchSurfaceVelocity.y,
  };
  state.ball.velocity.x = velocity.x;
  state.ball.velocity.y = velocity.y;
  state.ball.launchGracePlanetIndex = launchPlanetIndex;
  state.ball.anchorPlanetIndex = null;
  state.ball.landedPlanetIndex = null;
  state.ball.landedPlanetName = '';
  state.shots += 1;
  beginAttemptTrail();
  state.dragActive = false;
  state.dragPower = 0;
  setControlShot(activeStageIndex, angleDegFromDirection(launchDirection), power);
  setVec(state.dragAnchor, state.ball.position);
  state.roundSettled = false;
  state.message = `Flight underway. ${state.level.name}.`;
  state.hint = state.level.summary;
  syncHud();
}

function onPointerDown(event) {
  if (ballIsMoving() || state.adminReplay.active || state.undo.active) {
    return;
  }

  const point = getWorldPointFromEvent(event);
  state.dragActive = true;
  setVec(state.dragPointerWorld, point);
  renderer.domElement.setPointerCapture(event.pointerId);
  updateDragState(point);
  state.message = 'Stretch and release.';
  state.hint = 'Point the pull where you want the launch to begin.';
  syncHud();
}

function onPointerMove(event) {
  if (ballIsMoving() || !state.dragActive) {
    return;
  }

  const point = getWorldPointFromEvent(event);
  setVec(state.dragPointerWorld, point);
  updateDragState(point);
  state.message = 'Release to launch.';
  state.hint = `Burn loaded: ${state.dragPower.toFixed(2)} / ${MAX_DRAG_DISTANCE.toFixed(1)}`;
  syncHud();
}

function onPointerUp(event) {
  if (!state.dragActive) {
    return;
  }

  renderer.domElement.releasePointerCapture(event.pointerId);

  if (state.dragPower > 0.12) {
    launchShot(state.aimDirection, state.dragPower, state.dragAnchor);
    return;
  }

  state.dragActive = false;
  state.dragPower = 0;
  setVec(state.dragAnchor, state.ball.position);
  state.message = 'Launch cancelled.';
  state.hint = 'Grab the ball and pull back to start the run.';
  syncHud();
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', onPointerUp);
renderer.domElement.addEventListener('pointercancel', onPointerUp);

function launchFromControls() {
  if (ballIsMoving() || state.dragActive || state.adminReplay.active || state.undo.active) {
    return;
  }

  const activeShot = getControlShot();
  const direction = getPreviewDirection();
  const anchor = getPreviewAnchor();
  launchShot(direction, activeShot.power, anchor);
}

angleSliders.forEach((slider, index) => {
  slider.addEventListener('input', (event) => {
    if (state.adminReplay.active) {
      return;
    }
    const nextAngle = Number.parseFloat(event.target.value);
    const shot = getControlShot(index);
    setControlShot(index, nextAngle, shot.power);
    syncHud();
  });
});

powerSliders.forEach((slider, index) => {
  slider.addEventListener('input', (event) => {
    if (state.adminReplay.active) {
      return;
    }
    const nextPower = Number.parseFloat(event.target.value);
    const shot = getControlShot(index);
    setControlShot(index, shot.angleDeg, nextPower);
    syncHud();
  });
});

launchButton.addEventListener('click', launchFromControls);
undoButton.addEventListener('click', startUndo);

window.addEventListener('keydown', (event) => {
  if (!event.metaKey && !event.ctrlKey && !event.altKey && event.key.length === 1) {
    state.adminCodeBuffer = `${state.adminCodeBuffer}${event.key.toLowerCase()}`.slice(-ADMIN_CHEAT_CODE.length);
    if (state.adminCodeBuffer === ADMIN_CHEAT_CODE) {
      state.adminMode = !state.adminMode;
      state.adminCodeBuffer = '';
      if (!state.adminMode) {
        stopAdminReplay();
      }
      persistAdminMode();
      state.message = state.adminMode ? 'Admin mode enabled.' : 'Admin mode disabled.';
      state.hint = state.adminMode
        ? 'Use [ and ] to cycle solutions, S to show one, V to replay it.'
        : `Level ${state.levelIndex + 1}: ${state.level.name}.`;
      syncHud();
      return;
    }
  }

  if (!state.adminMode) {
    return;
  }

  if (event.key === '[') {
    event.preventDefault();
    previewAdminSolution(-1);
    return;
  }

  if (event.key === ']') {
    event.preventDefault();
    previewAdminSolution(1);
    return;
  }

  if (event.code === 'KeyS') {
    event.preventDefault();
    previewAdminSolution(0);
    return;
  }

  if (event.code === 'KeyV') {
    event.preventDefault();
    startAdminReplay();
  }
});

function updatePhysics(delta) {
  if (state.undo.active) {
    state.undo.elapsed += delta;
    const t = clamp(state.undo.elapsed / Math.max(0.0001, state.undo.duration), 0, 1);
    const easedT = THREE.MathUtils.smootherstep(t, 0, 1);
    const fromPosition = state.undo.fromPosition ?? state.ball.position;
    const toPosition = state.undo.toPosition ?? state.ball.position;
    setVec(state.ball.position, {
      x: THREE.MathUtils.lerp(fromPosition.x, toPosition.x, easedT),
      y: THREE.MathUtils.lerp(fromPosition.y, toPosition.y, easedT),
    });
    ballGroup.visible = true;
    ballGroup.scale.setScalar(1 - Math.sin(easedT * Math.PI) * 0.08);
    ballMesh.position.y = ballRestY + Math.sin(easedT * Math.PI) * 0.06;
    ballMesh.material.color.copy(palette.ball).lerp(palette.start, 0.22);
    ballMesh.material.emissive.copy(palette.start);
    ballMesh.material.emissiveIntensity = 0.8 * Math.sin(easedT * Math.PI);
    ballShadow.material.opacity = 0.2 + (1 - easedT) * 0.08;

    if (t >= 1) {
      finishUndo();
    }
    return;
  }

  if (state.ball.goaling) {
    state.ball.transition += delta * 3.6;
    const t = Math.min(1, state.ball.transition);
    ballMesh.position.y = THREE.MathUtils.lerp(ballRestY, -0.34, t);
    ballGroup.scale.setScalar(1 - t * 0.9);
    ballShadow.material.opacity = 0.28 * (1 - t);

    if (t >= 1) {
      ballGroup.visible = false;
      const nextIndex = (state.levelIndex + 1) % LEVELS.length;
      const nextLevel = LEVELS[nextIndex];
      resetBall(
        `Level ${nextIndex + 1}: ${nextLevel.name}.`,
        nextLevel.summary,
        { scored: true, advanceLevel: true },
      );
    }
    return;
  }

  if (state.ball.crashed) {
    if (state.ball.crashKind === 'sun') {
      state.ball.transition += delta * 4.8;
      const t = Math.min(1, state.ball.transition);
      state.ball.position.x = THREE.MathUtils.lerp(
        state.ball.crashStartPosition.x,
        state.ball.crashTargetPosition.x,
        t,
      );
      state.ball.position.y = THREE.MathUtils.lerp(
        state.ball.crashStartPosition.y,
        state.ball.crashTargetPosition.y,
        t,
      );
      updateBallTransforms();
      ballMesh.position.y = THREE.MathUtils.lerp(ballRestY, -0.18, t);
      ballGroup.scale.setScalar(Math.max(0.04, 1 - t * 0.94));
      ballShadow.material.opacity = 0.28 * (1 - t);
      ballMesh.material.color.copy(palette.ball).lerp(palette.band, Math.min(1, t * 1.1));
      ballMesh.material.emissive.copy(palette.band);
      ballMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0, 2.4, t);

      if (t >= 1) {
        ballGroup.visible = false;
        resetBall(
          state.ball.crashReason,
          state.hint,
          { countReset: true },
        );
      }
      return;
    }

    state.ball.transition += delta * 6.2;
    const wobble = 1 + Math.sin(state.ball.transition * 30) * 0.08;
    ballGroup.scale.set(wobble, 1 - state.ball.transition * 0.35, wobble);
    ballShadow.material.opacity = 0.28 * (1 - Math.min(1, state.ball.transition));

    if (state.ball.transition >= 1) {
      ballGroup.visible = false;
      resetBall(
        state.ball.crashReason,
        state.hint,
        { countReset: true },
      );
    }
    return;
  }

  if (lengthSq(state.ball.velocity) < 0.000001) {
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    if (state.ball.anchorPlanetIndex !== null && state.ball.anchorPlanetIndex !== undefined) {
      const nextTime = (state.ball.time ?? state.level.time ?? 0) + delta;
      setLevelTime(state.level, nextTime);
      state.ball.time = nextTime;
      advanceBallAnchor(state.level, state.ball, delta);
      if (maybeLaunchAdminReplayShot()) {
        return;
      }
      if (state.dragActive) {
        updateDragState(state.dragPointerWorld);
      }
      if (!isGoalOpen(state.level, state.ball.time)) {
        resetBall(
          'Event horizon collapsed.',
          describeFailureHint('goal-closed'),
          { countReset: true },
        );
      }
      return;
    }
    if (!state.roundSettled) {
      resetBall(
        'Drift expired.',
        describeFailureHint('settled'),
        { countReset: true },
      );
    }
    return;
  }

  const result = stepBall(state.level, state.ball, delta);
  recordAttemptTrailPoint();
  if (result.type === 'goal') {
    beginGoal();
    return;
  }

  if (result.type === 'landed') {
    beginLanding(result);
    return;
  }

  if (result.type === 'crash') {
    const message =
      result.reason === 'goal-closed'
        ? 'Event horizon collapsed.'
        : result.reason === 'sun'
          ? 'Burned in the sun.'
          : result.reason === 'planet'
            ? 'Planet impact.'
            : 'Lost in open space.';
    const hint = describeFailureHint(result.reason);
    beginCrash(message, hint, result.reason === 'sun' ? 'sun' : 'planet');
    return;
  }

  if (result.type === 'settled' && !state.roundSettled) {
    finalizeAttemptTrail('settled');
    resetBall(
      'Drift expired.',
      describeFailureHint('settled'),
      { countReset: true },
    );
  }
}

function updateDecor(time) {
  const worldTime = state.level.time ?? 0;
  const goalOpen = isGoalOpen(state.level, worldTime);
  const goalTimeLeft = getGoalRemainingTime(state.level, worldTime);
  const goalTimerFraction = getGoalRemainingFraction(state.level, worldTime);
  runStatusPill.textContent = getRunStatusText();
  windowStatusPill.textContent = getWindowStatusText();
  windowStatusPill.classList.toggle('is-hot', goalTimeLeft < 2.5);
  updateSunVisual();
  updateLaunchMarker();
  startPad.scale.setScalar(1 + Math.sin(time * 2.7) * 0.06);
  startCore.material.opacity = 0.58 + Math.sin(time * 3.8) * 0.12;
  sunGlow.scale.setScalar(1 + Math.sin(time * 1.2) * 0.08);
  sunGlow.material.opacity = 0.16 + Math.sin(time * 1.6) * 0.03;
  sunCorona.rotation.z = time * 0.28;
  sunCorona.material.opacity = 0.3 + Math.sin(time * 2.1) * 0.04;
  sunCore.rotation.y = time * 0.22;

  if (worldTime < lastGravityFieldRefreshTime || worldTime - lastGravityFieldRefreshTime >= 0.16) {
    rebuildGravityField();
    lastGravityFieldRefreshTime = worldTime;
  }

  if (gravityFieldVisuals) {
    gravityFieldVisuals.glow.material.opacity = 0.16 + Math.sin(time * 1.6) * 0.03;
    gravityFieldVisuals.core.material.opacity = 0.38 + Math.sin(time * 2 + 0.6) * 0.04;
  }

  setGoalTimerArc(goalTimerFraction);

  blackHoleDisc.material.color.setHex(goalOpen ? palette.blackHole.getHex() : 0x191f26);
  blackHoleRing.rotation.z = time * (goalOpen ? 0.9 : 0.25);
  blackHoleRing.scale.setScalar(goalOpen ? 1 + Math.sin(time * 4.2) * 0.08 : 0.92);
  blackHoleRing.material.opacity = goalOpen
    ? 0.46 + goalTimerFraction * 0.12 + Math.sin(time * 4.2) * 0.04
    : 0.18;
  goalTimerTrack.material.opacity = goalOpen ? 0.22 : 0.08;
  goalTimerArc.material.opacity = goalOpen
    ? 0.56 + goalTimerFraction * 0.28 + Math.sin(time * 5.6) * 0.03
    : 0;
  goalTimerArc.material.color.setHex(goalTimeLeft < 2.5 ? 0xff9f6e : 0x8fffe3);

  planetVisuals.forEach((visual, index) => {
    const pulse = 1 + Math.sin(time * (1.5 + index * 0.35) + index) * 0.05;
    const isLandable = Boolean(visual.planet.landable);
    const relayPulse = state.ball.landedPlanetIndex === index ? state.relayPulse : 0;
    visual.group.position.set(visual.planet.position.x, 0, visual.planet.position.y);
    visual.halo.scale.setScalar(pulse + relayPulse * 0.16);
    visual.glow.material.opacity = isLandable
      ? 0.13 + Math.sin(time * 2 + index) * 0.03 + relayPulse * 0.12
      : 0.16 + Math.sin(time * 1.7 + index) * 0.04;
    visual.orbitRing.rotation.z = time * (0.35 + index * 0.12);
    visual.body.rotation.y = -worldTime * (visual.planet.spinSpeed ?? 0);
    if (visual.atmosphereShell) {
      visual.atmosphereShell.rotation.y = -worldTime * (visual.planet.spinSpeed ?? 0) * 0.85;
      visual.atmosphereShell.material.opacity = isLandable
        ? 0.13 + Math.sin(time * 2.8 + index) * 0.025
        : 0.11 + Math.sin(time * 1.9 + index) * 0.02;
    }
    if (visual.accentBand) {
      visual.accentBand.rotation.z = 0.34 + time * (0.24 + index * 0.03);
      visual.accentBand.material.opacity = 0.24 + Math.sin(time * 2.2 + index) * 0.04;
    }
    if (visual.landingRing) {
      const selected = state.ball.landedPlanetIndex === index;
      visual.landingRing.scale.setScalar(1 + relayPulse * 0.18);
      visual.landingRing.material.opacity = selected
        ? 0.34 + Math.sin(time * 4.4) * 0.06 + relayPulse * 0.28
        : 0.16 + Math.sin(time * 3 + index) * 0.03;
      visual.orbitRing.material.opacity = selected ? 0.9 : 0.62 + Math.sin(time * 2.5 + index) * 0.06;
      visual.orbitPath.material.opacity = selected ? 0.5 : 0.22 + Math.sin(time * 1.6 + index) * 0.025;
    } else {
      visual.orbitRing.material.opacity = 0.38 + Math.sin(time * 1.8 + index) * 0.04;
      visual.orbitPath.material.opacity = 0.14 + Math.sin(time * 1.4 + index) * 0.02;
    }
    visual.orbitPath.position.set(visual.planet.orbitCenter.x, 0, visual.planet.orbitCenter.y);
  });
}

function updateCameraProjection() {
  const aspect = sceneHost.clientWidth / Math.max(1, sceneHost.clientHeight);
  const halfHeight = CAMERA_VIEW_SIZE / 2;
  const halfWidth = halfHeight * aspect;
  camera.left = -halfWidth;
  camera.right = halfWidth;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.near = 0.1;
  camera.far = 60;
  camera.updateProjectionMatrix();
}

function resize() {
  const width = sceneHost.clientWidth;
  const height = sceneHost.clientHeight;
  updateCameraProjection();
  renderer.setSize(width, height);
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const time = clock.elapsedTime;

  state.relayPulse = Math.max(0, state.relayPulse - delta * 1.9);

  physicsAccumulator = Math.min(
    physicsAccumulator + delta,
    PHYSICS_STEP * MAX_PHYSICS_STEPS_PER_FRAME,
  );

  while (physicsAccumulator >= PHYSICS_STEP) {
    updatePhysics(PHYSICS_STEP);
    physicsAccumulator -= PHYSICS_STEP;
  }

  updateBallTrace(delta);
  updateBallTransforms();
  updateCueVisual();
  updateDecor(time);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

applyLevel(getInitialLevelIndex());
resetBall(`Level ${state.levelIndex + 1}: ${state.level.name}.`, state.level.summary);
resize();
animate();

window.addEventListener('resize', resize);
