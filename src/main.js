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
  length,
  lengthSq,
  launchVelocity,
  normalize,
  samplePlanetGravity,
  setVec,
  stepBall,
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
        <span>Land and relaunch</span>
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
        <button id="launchButton" type="button">Go</button>
      </div>
      <div class="status-card hud-status">
        <p class="status-label">Flight Call</p>
        <h2 id="statusLine">Plot the first slingshot.</h2>
        <div class="meter">
          <span id="powerFill"></span>
        </div>
        <p id="statusHint">Use the planets to curve into the event horizon.</p>
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
const powerFill = document.querySelector('#powerFill');
const levelChip = document.querySelector('#levelChip');
const shotControlPanels = [...document.querySelectorAll('[data-shot-panel]')];
const shotControlStates = [0, 1].map((index) => document.querySelector(`#shotState${index}`));
const angleSliders = [0, 1].map((index) => document.querySelector(`#angleSlider${index}`));
const powerSliders = [0, 1].map((index) => document.querySelector(`#powerSlider${index}`));
const angleValues = [0, 1].map((index) => document.querySelector(`#angleValue${index}`));
const powerValues = [0, 1].map((index) => document.querySelector(`#powerValue${index}`));
const launchButton = document.querySelector('#launchButton');
const sceneHost = document.querySelector('#scene');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040812);
scene.fog = new THREE.Fog(0x040812, 14, 30);

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
  columns: 30,
  rows: 18,
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

const laneArc = new THREE.Mesh(
  new THREE.RingGeometry(2.9, 3.05, 80),
  new THREE.MeshBasicMaterial({
    color: 0x74aaff,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  }),
);
laneArc.rotation.x = -Math.PI / 2;
laneArc.position.set(0.9, 0.05, 0.2);
laneArc.scale.set(1.95, 1.15, 1);
world.add(laneArc);

const laneArc2 = new THREE.Mesh(
  new THREE.RingGeometry(1.8, 1.92, 72),
  new THREE.MeshBasicMaterial({
    color: 0xffaf6d,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
  }),
);
laneArc2.rotation.x = -Math.PI / 2;
laneArc2.position.set(4.55, 0.05, 0.25);
laneArc2.scale.set(1.45, 1.85, 1);
world.add(laneArc2);

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

const blackHoleHalo = new THREE.Mesh(
  new THREE.RingGeometry(COURSE.goalRadius + 0.75, COURSE.goalPullRadius, 96),
  new THREE.MeshBasicMaterial({
    color: 0x6e53ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  }),
);
blackHoleHalo.rotation.x = -Math.PI / 2;
goalGroup.add(blackHoleHalo);

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
    roughness: 0.22,
    metalness: 0.03,
  }),
);
ballMesh.position.y = ballRestY;
ballGroup.add(ballMesh);

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

const lastAimLine = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.02, 0.1),
  new THREE.MeshBasicMaterial({
    color: 0xffc3b2,
    transparent: true,
    opacity: 0.28,
    depthTest: false,
    depthWrite: false,
  }),
);
lastAimLine.position.y = 0.12;
lastAimLine.renderOrder = 9;
world.add(lastAimLine);

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

const lastDragHandle = new THREE.Mesh(
  new THREE.RingGeometry(0.13, 0.21, 40),
  new THREE.MeshBasicMaterial({
    color: 0xffdfb3,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
  }),
);
lastDragHandle.rotation.x = -Math.PI / 2;
lastDragHandle.position.y = 0.14;
lastDragHandle.renderOrder = 9;
world.add(lastDragHandle);

const state = {
  score: 0,
  shots: 0,
  resets: 0,
  levelIndex: 0,
  level: createLevelRuntime(0),
  ball: {
    ...createBallState(createLevelRuntime(0)),
    goaling: false,
    crashed: false,
    transition: 0,
    crashReason: '',
    landingCount: 0,
    landedPlanetIndex: null,
    landedPlanetName: '',
  },
  aimDirection: normalize({ x: 1, y: 0 }),
  dragAnchor: { x: 0, y: 0 },
  lastDragAnchor: { x: 0, y: 0 },
  hasLastDrag: false,
  controlShots: [],
  dragActive: false,
  dragPower: 0,
  roundSettled: true,
  message: 'Plot the first slingshot.',
  hint: 'Use the planets to curve into the event horizon.',
};

let planetVisuals = [];
let gravityFieldVisuals = null;
let physicsAccumulator = 0;
const planetTextureCache = new Map();

function goalUnlocked() {
  return state.ball.landingCount >= (state.level.requiredLandings ?? 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
  return directionFromAngleDeg(getControlShot().angleDeg);
}

function getPreviewAnchor() {
  const anchor = cloneVec(state.ball.position);
  addScaledVec(anchor, getPreviewDirection(), getControlShot().power);
  return anchor;
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
    angleValues[index].textContent = `${shot.angleDeg.toFixed(1)} deg`;
    powerValues[index].textContent = shot.power.toFixed(2);
    shotControlStates[index].textContent = getShotControlStateLabel(index, activeStageIndex);
  });

  launchButton.textContent = `Go${state.controlShots.length > 1 ? ` · Shot ${activeStageIndex + 1}` : ''}`;
  launchButton.disabled = ballIsMoving() || state.dragActive;
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
  clearGroup(planetsRoot);

  planetVisuals = state.level.planets.map((planet) => {
    const group = new THREE.Group();
    const coreColor = new THREE.Color(planet.core);
    const glowColor = new THREE.Color(planet.glow);
    const surfaceTexture = getPlanetTexture(planet);

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
  state.levelIndex = index % LEVELS.length;
  state.level = createLevelRuntime(state.levelIndex);
  state.controlShots = createControlShots(state.level);
  state.hasLastDrag = false;
  setVec(state.lastDragAnchor, state.level.start);

  startPad.position.set(state.level.start.x, 0.08, state.level.start.y);
  startCore.position.set(state.level.start.x, 0.06, state.level.start.y);
  goalGroup.position.set(state.level.goal.x, 0.06, state.level.goal.y);

  syncLevelQueryParam(state.levelIndex);
  syncLaunchControls();

  levelChip.textContent = `Level ${state.levelIndex + 1}/${LEVELS.length} · ${state.level.name}`;
  rebuildGravityField();
  rebuildPlanets();
}

function syncHud() {
  scoreValue.textContent = String(state.score);
  shotsValue.textContent = String(state.shots);
  resetValue.textContent = String(state.resets);
  statusLine.textContent = state.message;
  statusHint.textContent = state.hint;
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

  setVec(state.ball.position, state.level.start);
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.crashReason = '';
  state.ball.landingCount = 0;
  state.ball.launchGracePlanetIndex = null;
  state.ball.landedPlanetIndex = null;
  state.ball.landedPlanetName = '';
  setVec(state.dragAnchor, state.level.start);
  setVec(state.lastDragAnchor, state.level.start);
  state.hasLastDrag = false;
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  ballGroup.visible = true;
  ballGroup.scale.setScalar(1);
  ballMesh.position.y = ballRestY;
  ballShadow.material.opacity = 0.28;
  state.message = message;
  state.hint = hint;
  syncHud();
}

function beginGoal() {
  state.ball.goaling = true;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.message = 'Event horizon captured.';
  state.hint = 'Course clear. Loading the next route.';
  syncHud();
}

function beginCrash(reason, hint) {
  state.ball.crashed = true;
  state.ball.goaling = false;
  state.ball.transition = 0;
  state.ball.crashReason = reason;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.message = reason;
  state.hint = hint;
  syncHud();
}

function beginLanding(result) {
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.launchGracePlanetIndex = null;
  state.ball.landedPlanetIndex = result.planetIndex ?? null;
  state.ball.landedPlanetName = result.planetName ?? 'relay world';
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.lastDragAnchor, state.ball.position);
  state.hasLastDrag = false;
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  ballGroup.visible = true;
  ballGroup.scale.setScalar(1);
  ballMesh.position.y = ballRestY;
  ballShadow.material.opacity = 0.28;
  state.message = `Touchdown on ${state.ball.landedPlanetName}.`;
  state.hint = goalUnlocked()
    ? 'The black hole is awake. Launch again from the relay world.'
    : 'Use the planet as an intermediate launch point.';
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
  return lengthSq(state.ball.velocity) > 0.002 || state.ball.goaling || state.ball.crashed;
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

  const direction = normalize(pullVector);
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
  const idlePreview = !state.dragActive && !ballIsMoving();
  aimLine.visible = !ballIsMoving();
  dragHandle.visible = !ballIsMoving();
  lastAimLine.visible = state.hasLastDrag && idlePreview;
  lastDragHandle.visible = state.hasLastDrag && idlePreview;

  if (!aimLine.visible) {
    lastAimLine.visible = false;
    lastDragHandle.visible = false;
    return;
  }

  let bandVector;
  let guideLength;
  let bandDirection;
  let anchor;

  if (state.dragActive) {
    bandVector = {
      x: state.dragAnchor.x - state.ball.position.x,
      y: state.dragAnchor.y - state.ball.position.y,
    };
    guideLength = Math.max(0.001, length(bandVector));
    bandDirection = normalize(bandVector);
    anchor = state.dragAnchor;
    aimLine.material.opacity = 0.9;
    dragHandle.material.opacity = 0.95;
  } else {
    anchor = getPreviewAnchor();
    bandVector = {
      x: anchor.x - state.ball.position.x,
      y: anchor.y - state.ball.position.y,
    };
    guideLength = Math.max(0.001, length(bandVector));
    bandDirection = normalize(bandVector);
    aimLine.material.opacity = 0.48;
    dragHandle.material.opacity = 0.58;
  }

  aimLine.position.set(
    state.ball.position.x + bandDirection.x * guideLength * 0.5,
    0.14,
    state.ball.position.y + bandDirection.y * guideLength * 0.5,
  );
  aimLine.rotation.y = Math.atan2(-bandDirection.y, bandDirection.x);
  aimLine.scale.set(guideLength, 1, 1);

  dragHandle.position.set(anchor.x, 0.16, anchor.y);

  if (!state.dragActive && lastAimLine.visible) {
    if (lastAimLine.visible) {
      const lastBandVector = {
        x: state.lastDragAnchor.x - state.ball.position.x,
        y: state.lastDragAnchor.y - state.ball.position.y,
      };
      const lastGuideLength = Math.max(0.001, length(lastBandVector));
      const lastBandDirection = normalize(lastBandVector);

      lastAimLine.position.set(
        state.ball.position.x + lastBandDirection.x * lastGuideLength * 0.5,
        0.12,
        state.ball.position.y + lastBandDirection.y * lastGuideLength * 0.5,
      );
      lastAimLine.rotation.y = Math.atan2(-lastBandDirection.y, lastBandDirection.x);
      lastAimLine.scale.set(lastGuideLength, 1, 1);
      lastDragHandle.position.set(state.lastDragAnchor.x, 0.14, state.lastDragAnchor.y);
    }
  }
}

function launchShot(direction, power, anchor) {
  const activeStageIndex = getActiveStageIndex();
  const velocity = launchVelocity(direction, power);
  setVec(state.lastDragAnchor, anchor);
  state.hasLastDrag = true;
  state.ball.velocity.x = velocity.x;
  state.ball.velocity.y = velocity.y;
  state.ball.launchGracePlanetIndex = state.ball.landedPlanetIndex;
  state.ball.landedPlanetIndex = null;
  state.ball.landedPlanetName = '';
  state.shots += 1;
  state.dragActive = false;
  state.dragPower = 0;
  setControlShot(activeStageIndex, angleDegFromDirection(direction), power);
  setVec(state.dragAnchor, state.ball.position);
  state.roundSettled = false;
  state.message = `Flight underway. ${state.level.name}.`;
  state.hint = state.level.summary;
  syncHud();
}

function onPointerDown(event) {
  if (ballIsMoving()) {
    return;
  }

  const point = getWorldPointFromEvent(event);
  if (distanceBetween(point, state.ball.position) > BALL_HIT_RADIUS) {
    return;
  }

  state.dragActive = true;
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
  if (ballIsMoving() || state.dragActive) {
    return;
  }

  const activeShot = getControlShot();
  const direction = getPreviewDirection();
  const anchor = getPreviewAnchor();
  launchShot(direction, activeShot.power, anchor);
}

angleSliders.forEach((slider, index) => {
  slider.addEventListener('input', (event) => {
    const nextAngle = Number.parseFloat(event.target.value);
    const shot = getControlShot(index);
    setControlShot(index, nextAngle, shot.power);
    syncHud();
  });
});

powerSliders.forEach((slider, index) => {
  slider.addEventListener('input', (event) => {
    const nextPower = Number.parseFloat(event.target.value);
    const shot = getControlShot(index);
    setControlShot(index, shot.angleDeg, nextPower);
    syncHud();
  });
});

launchButton.addEventListener('click', launchFromControls);

function updatePhysics(delta) {
  if (state.ball.goaling) {
    state.ball.transition += delta * 2.5;
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
    state.ball.transition += delta * 3.6;
    const wobble = 1 + Math.sin(state.ball.transition * 30) * 0.08;
    ballGroup.scale.set(wobble, 1 - state.ball.transition * 0.35, wobble);
    ballShadow.material.opacity = 0.28 * (1 - Math.min(1, state.ball.transition));

    if (state.ball.transition >= 1) {
      ballGroup.visible = false;
      resetBall(
        state.ball.crashReason,
        `Retry ${state.level.name}. ${state.level.summary}`,
        { countReset: true },
      );
    }
    return;
  }

  if (lengthSq(state.ball.velocity) < 0.000001) {
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    if (!state.roundSettled) {
      resetBall(
        'Drift expired.',
        `Retry ${state.level.name}. Use more pull or a cleaner assist.`,
        { countReset: true },
      );
    }
    return;
  }

  const result = stepBall(state.level, state.ball, delta);
  if (result.type === 'goal') {
    beginGoal();
    return;
  }

  if (result.type === 'landed') {
    beginLanding(result);
    return;
  }

  if (result.type === 'crash') {
    const message = result.reason === 'planet' ? 'Planet impact.' : 'Lost in open space.';
    const hint =
      result.reason === 'planet'
        ? `Retry ${state.level.name}. Slingshot wider around the wells.`
        : `Retry ${state.level.name}. The route drifted off the course.`;
    beginCrash(message, hint);
    return;
  }

  if (result.type === 'settled' && !state.roundSettled) {
    resetBall(
      'Drift expired.',
      `Retry ${state.level.name}. Use more pull or a cleaner assist.`,
      { countReset: true },
    );
  }
}

function updateDecor(time) {
  startPad.scale.setScalar(1 + Math.sin(time * 2.7) * 0.06);
  startCore.material.opacity = 0.58 + Math.sin(time * 3.8) * 0.12;

  if (gravityFieldVisuals) {
    gravityFieldVisuals.glow.material.opacity = 0.16 + Math.sin(time * 1.6) * 0.03;
    gravityFieldVisuals.core.material.opacity = 0.38 + Math.sin(time * 2 + 0.6) * 0.04;
  }

  blackHoleRing.rotation.z = time * 0.9;
  blackHoleRing.scale.setScalar(1 + Math.sin(time * 4.2) * 0.08);
  blackHoleRing.material.opacity = goalUnlocked()
    ? 0.5 + Math.sin(time * 4.2) * 0.04
    : 0.16 + Math.sin(time * 2.4) * 0.02;
  blackHoleHalo.material.opacity = goalUnlocked()
    ? 0.06 + Math.sin(time * 1.7) * 0.025
    : 0.018 + Math.sin(time * 1.4) * 0.008;
  blackHoleHalo.rotation.z = -time * 0.32;

  planetVisuals.forEach((visual, index) => {
    const pulse = 1 + Math.sin(time * (1.5 + index * 0.35) + index) * 0.05;
    const isLandable = Boolean(visual.planet.landable);
    visual.halo.scale.setScalar(pulse);
    visual.glow.material.opacity = isLandable
      ? 0.13 + Math.sin(time * 2 + index) * 0.03
      : 0.16 + Math.sin(time * 1.7 + index) * 0.04;
    visual.orbitRing.rotation.z = time * (0.35 + index * 0.12);
    visual.body.rotation.y = time * (isLandable ? 0.28 + index * 0.06 : 0.52 + index * 0.11);
    if (visual.atmosphereShell) {
      visual.atmosphereShell.rotation.y = time * (isLandable ? 0.16 + index * 0.04 : -0.34 - index * 0.05);
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
      visual.landingRing.material.opacity = selected
        ? 0.34 + Math.sin(time * 4.4) * 0.06
        : 0.16 + Math.sin(time * 3 + index) * 0.03;
      visual.orbitRing.material.opacity = selected ? 0.9 : 0.62 + Math.sin(time * 2.5 + index) * 0.06;
    } else {
      visual.orbitRing.material.opacity = 0.38 + Math.sin(time * 1.8 + index) * 0.04;
    }
  });
}

function resize() {
  const width = sceneHost.clientWidth;
  const height = sceneHost.clientHeight;
  const aspect = width / height;
  const viewSize = 12;
  camera.left = (-viewSize * aspect) / 2;
  camera.right = (viewSize * aspect) / 2;
  camera.top = viewSize / 2;
  camera.bottom = -viewSize / 2;
  camera.near = 0.1;
  camera.far = 60;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const time = clock.elapsedTime;

  physicsAccumulator = Math.min(
    physicsAccumulator + delta,
    PHYSICS_STEP * MAX_PHYSICS_STEPS_PER_FRAME,
  );

  while (physicsAccumulator >= PHYSICS_STEP) {
    updatePhysics(PHYSICS_STEP);
    physicsAccumulator -= PHYSICS_STEP;
  }

  updateBallTransforms();
  updateCueVisual();
  updateDecor(time);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

applyLevel(getInitialLevelIndex());
resetBall(`Level ${state.levelIndex + 1}: ${state.level.name}.`, state.level.summary);
setVec(state.lastDragAnchor, state.level.start);
resize();
animate();

window.addEventListener('resize', resize);
