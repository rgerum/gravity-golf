import './style.css';
import { ConvexHttpClient } from 'convex/browser';
import * as THREE from 'three';
import {
  BALL_HIT_RADIUS,
  COURSE,
  FIXED_SOLAR_GRAVITY_STRENGTH,
  LEVELS,
  MAX_DRAG_DISTANCE,
  PLANET_GRAVITY_MULTIPLIER,
  SOLAR_GRAVITY_MULTIPLIER,
  SOLAR_GRAVITY_SOFTENING,
  WORLD_DEFINITIONS,
  WORLD_SIZE,
  addScaledVec,
  cloneVec,
  createBallState,
  createLevelRuntime,
  distanceBetween,
  advanceBallAnchor,
  getBallHeatRatio,
  getBallSurfaceRadius,
  getGoalRemainingFraction,
  getGoalRemainingTime,
  getLavaOverheatRemaining,
  getPrimarySunVisualRadius,
  getRedGiantProgress,
  getPlanetSplitAxis,
  getPulsarJetState,
  getPlanetSlideAngularSpeed,
  getPlanetVelocity,
  getPlanetSurfaceVelocity,
  isPointInPulsarJets,
  isGoalLocked,
  isGoalOpen,
  getTurretLineState,
  length,
  lengthSq,
  launchVelocity,
  normalize,
  reverseStepBall,
  setLevelTime,
  setVec,
  stepBall,
  syncBallToAnchor,
} from './game-core.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-shell">
    <main class="stage-panel">
      <div class="table-frame">
        <div id="scene"></div>
        <div class="stage-overlay">
          <div class="hud-top">
            <div class="level-block">
              <div class="level-header">
                <div class="level-copy">
                  <p class="level-kicker" id="levelKicker">Orbital Course</p>
                  <h1 id="levelLabel">Level 1 / 1</h1>
                  <p class="level-name" id="levelName">Launch Window</p>
                  <div class="hud-pills">
                    <span class="status-pill" id="runStatusPill">Shot 1 · Launch Pad</span>
                    <span class="status-pill" id="windowStatusPill">Window live</span>
                  </div>
                </div>
                <button id="worldMapButton" class="map-button" type="button" aria-label="Open world map" title="Open world map">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
                    <path d="M9 3v15" />
                    <path d="M15 6v15" />
                  </svg>
                </button>
              </div>
              <div class="time-control">
                <label class="time-control-label" for="timeSpeedSlider">
                  Time <strong id="timeSpeedValue">1x</strong>
                </label>
                <input id="timeSpeedSlider" type="range" min="0" max="3" step="1" value="2" />
                <div class="time-speed-marks" aria-hidden="true">
                  <span>-1</span>
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                </div>
              </div>
            </div>
            <div class="action-row">
              <button id="retryButton" class="hud-button" type="button"><span>Retry</span><kbd>R</kbd></button>
              <button id="undoButton" class="hud-button hud-button-primary" type="button"><span>Undo</span><kbd>Z</kbd></button>
            </div>
          </div>
          <div class="hud-bottom">
            <div class="status-card">
              <p class="status-label">Flight Call</p>
              <h2 id="statusLine">Plot the first slingshot.</h2>
              <div class="meter">
                <span id="powerFill"></span>
              </div>
              <p id="statusHint">Drag from the ball, then release to launch.</p>
              <div class="status-pills">
                <span class="status-pill" id="heatStatusPill">Heat stable</span>
              </div>
            </div>
            <div class="debug-tuning-panel" id="debugTuningPanel" aria-label="Visual debug tuning" hidden>
              <div class="debug-tuning-header">
                <span>Visual Debug</span>
              </div>
              <label class="debug-slider" for="gridGlowOpacitySlider">
                <span>Grid glow <strong data-debug-value="gridGlowOpacity">0.22</strong></span>
                <input id="gridGlowOpacitySlider" data-debug-tuning="gridGlowOpacity" type="range" min="0" max="0.5" step="0.01" value="0.22" />
              </label>
              <label class="debug-slider" for="gridCoreOpacitySlider">
                <span>Grid line <strong data-debug-value="gridCoreOpacity">0.00</strong></span>
                <input id="gridCoreOpacitySlider" data-debug-tuning="gridCoreOpacity" type="range" min="0" max="0.8" step="0.01" value="0" />
              </label>
              <label class="debug-slider" for="starCountSlider">
                <span>Stars <strong data-debug-value="starCount">900</strong></span>
                <input id="starCountSlider" data-debug-tuning="starCount" type="range" min="0" max="900" step="10" value="900" />
              </label>
              <label class="debug-slider" for="starOpacitySlider">
                <span>Star opacity <strong data-debug-value="starOpacity">0.88</strong></span>
                <input id="starOpacitySlider" data-debug-tuning="starOpacity" type="range" min="0" max="1" step="0.01" value="0.88" />
              </label>
              <label class="debug-slider" for="starSizeSlider">
                <span>Star size <strong data-debug-value="starSize">0.72</strong></span>
                <input id="starSizeSlider" data-debug-tuning="starSize" type="range" min="0.05" max="1.2" step="0.025" value="0.72" />
              </label>
              <label class="debug-slider" for="starSpreadSlider">
                <span>Star spread <strong data-debug-value="starSpread">0.80</strong></span>
                <input id="starSpreadSlider" data-debug-tuning="starSpread" type="range" min="0.8" max="2.4" step="0.05" value="0.8" />
              </label>
            </div>
            <div class="perf-panel" id="fpsPanel" hidden>
              <span class="perf-label">FPS</span>
              <strong id="fpsValue">--</strong>
            </div>
          </div>
        </div>
        <div class="tutorial-overlay" aria-live="polite">
          <div class="tutorial-card" id="tutorialCard" hidden>
            <div class="tutorial-kicker">How To</div>
            <div class="tutorial-gesture" aria-hidden="true">
              <span class="tutorial-gesture-guide"></span>
              <span class="tutorial-gesture-handle"></span>
              <span class="tutorial-gesture-ball"></span>
              <span class="tutorial-gesture-start"></span>
              <span class="tutorial-gesture-release"></span>
            </div>
            <p class="tutorial-copy" id="tutorialCopy">Drag from the ball. Release to launch.</p>
          </div>
        </div>
        <div class="game-over-modal" id="gameOverModal" hidden>
          <div class="game-over-backdrop"></div>
          <div class="game-over-panel" role="dialog" aria-modal="true" aria-labelledby="gameOverTitle">
            <div class="game-over-copy">
              <p class="game-over-kicker">Mission failed</p>
              <h2 id="gameOverTitle">Lost in space.</h2>
              <p class="game-over-hint" id="gameOverHint" hidden>Retry the route or rewind to the previous boundary.</p>
            </div>
            <div class="game-over-actions">
              <button id="gameOverRetryButton" class="hud-button" type="button"><span>Retry</span><kbd>R</kbd></button>
              <button id="gameOverUndoButton" class="hud-button hud-button-primary" type="button"><span>Undo</span><kbd>Z</kbd></button>
            </div>
          </div>
        </div>
        <div class="world-map-modal" id="worldMapModal" hidden>
          <div class="world-map-backdrop"></div>
          <div class="world-map-panel" role="dialog" aria-modal="true" aria-labelledby="worldMapTitle">
            <div class="world-map-copy">
              <h2 id="worldMapTitle">Finished Starter Belt</h2>
              <p class="world-map-progress" id="worldMapProgress">10 levels cleared</p>
            </div>
            <div class="world-map-stats" id="worldMapStats" aria-label="Completed world stats"></div>
            <div class="world-map-stage">
              <div class="galaxy-dust"></div>
              <div class="galaxy-core"></div>
              <div class="galaxy-ring galaxy-ring-outer"></div>
              <div class="galaxy-ring galaxy-ring-mid"></div>
              <div class="galaxy-ring galaxy-ring-inner"></div>
              <svg class="world-map-path" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <polyline id="worldMapTrailBase" points="" />
                <polyline id="worldMapTrailProgress" points="" />
                <g id="worldMapDotLayer"></g>
              </svg>
              <div class="world-map-nodes" id="worldMapNodes"></div>
            </div>
            <div class="world-map-actions">
              <button id="worldMapContinueButton" class="hud-button hud-button-primary" type="button">Enter Relay Reach</button>
              <button id="worldMapReplayButton" class="hud-button" type="button" hidden>Replay World</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
`;

const levelLabel = document.querySelector('#levelLabel');
const levelName = document.querySelector('#levelName');
const levelKicker = document.querySelector('#levelKicker');
const statusLine = document.querySelector('#statusLine');
const statusHint = document.querySelector('#statusHint');
const statusCard = document.querySelector('.status-card');
const heatStatusPill = document.querySelector('#heatStatusPill');
const runStatusPill = document.querySelector('#runStatusPill');
const windowStatusPill = document.querySelector('#windowStatusPill');
const timeSpeedSlider = document.querySelector('#timeSpeedSlider');
const timeSpeedValue = document.querySelector('#timeSpeedValue');
const powerFill = document.querySelector('#powerFill');
const fpsPanel = document.querySelector('#fpsPanel');
const fpsValue = document.querySelector('#fpsValue');
const debugTuningInputs = [...document.querySelectorAll('[data-debug-tuning]')];
const debugTuningValueNodes = [...document.querySelectorAll('[data-debug-value]')];
const actionRow = document.querySelector('.action-row');
const retryButton = document.querySelector('#retryButton');
const undoButton = document.querySelector('#undoButton');
const tutorialCard = document.querySelector('#tutorialCard');
const tutorialCopy = document.querySelector('#tutorialCopy');
const gameOverModal = document.querySelector('#gameOverModal');
const gameOverCopy = document.querySelector('.game-over-copy');
const gameOverTitle = document.querySelector('#gameOverTitle');
const gameOverHint = document.querySelector('#gameOverHint');
const gameOverRetryButton = document.querySelector('#gameOverRetryButton');
const gameOverUndoButton = document.querySelector('#gameOverUndoButton');
const worldMapModal = document.querySelector('#worldMapModal');
const worldMapTitle = document.querySelector('#worldMapTitle');
const worldMapProgress = document.querySelector('#worldMapProgress');
const worldMapNodes = document.querySelector('#worldMapNodes');
const worldMapTrailBase = document.querySelector('#worldMapTrailBase');
const worldMapTrailProgress = document.querySelector('#worldMapTrailProgress');
const worldMapDotLayer = document.querySelector('#worldMapDotLayer');
const worldMapContinueButton = document.querySelector('#worldMapContinueButton');
const worldMapReplayButton = document.querySelector('#worldMapReplayButton');
const worldMapStats = document.querySelector('#worldMapStats');
const worldMapButton = document.querySelector('#worldMapButton');
const sceneHost = document.querySelector('#scene');
let gameOverVisibilityFrame = 0;

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
  smoothingStrength: 0.34,
  curveSubdivisions: 3,
};

const visualDebugDefaults = {
  gridGlowOpacity: 0.22,
  gridCoreOpacity: 0,
  starCount: 900,
  starOpacity: 0.88,
  starSize: 0.72,
  starSpread: 0.8,
};

const VISUAL_FIELD_PADDING_X = 2.4;
const VISUAL_FIELD_PADDING_Y = 1.8;
const LANDSCAPE_CAMERA_ZOOM_MIN = 0.74;
const LANDSCAPE_CAMERA_ZOOM_START_ASPECT = 1.45;
const LANDSCAPE_CAMERA_ZOOM_END_ASPECT = 2.35;
const PORTRAIT_ROTATED_PLAYFIELD_MAX_WIDTH = 820;

const gravityFieldPalette = {
  low: new THREE.Color(0x24507d),
  mid: new THREE.Color(0x78bdff),
  high: new THREE.Color(0xffdd97),
};

const PHYSICS_STEP = 1 / 120;
const UNDO_REWIND_SPEED = -8;
const GOAL_CLOSE_ANIMATION_DURATION = 0.46;
const GOAL_CLOSE_MODAL_DELAY = 0.12;
const GOAL_UNLOCK_REVEAL_DURATION = 0.52;
const METEOR_PLANET_EXPLOSION_SECONDS = 1.15;
const METEOR_PLANET_BREAK_DELAY_SECONDS = 0.12;
const MAX_PHYSICS_STEPS_PER_FRAME = 4;
const VIBE_JAM_PORTAL_URL = 'https://vibej.am/portal/2026';
const VIBE_JAM_PORTAL_RADIUS = 0.92;
const VIBE_JAM_PORTAL_ACTIVATION_DELAY = 1.2;
const VIBE_JAM_PORTAL_ENTRY_SECONDS = 0.58;
const VIBE_JAM_EXIT_PORTAL_ANGLE_DEG = 140;
const VIBE_JAM_RETURN_PORTAL_ANGLE_DEG = 126;
const ballRestY = COURSE.ballRadius - 0.01;
const BALL_STRETCH_SPEED_THRESHOLD = 1.6;
const BALL_STRETCH_MAX = 0.18;
const BALL_STRETCH_EASE = 0.18;
const CONTROL_MIN_ANGLE = -180;
const CONTROL_MAX_ANGLE = 180;
const CONTROL_MIN_POWER = 0.2;
const ADMIN_STORAGE_KEY = 'gravityBilliardAdminMode';
const ADMIN_CHEAT_CODE = 'orbitadmin';
const FPS_OVERLAY_STORAGE_KEY = 'gravityBilliardFpsOverlay';
const LAST_LEVEL_STORAGE_KEY = 'gravityBilliardLastLevel';
const COMMUNITY_RUN_STORAGE_KEY = 'gravityGolfCommunityRunId';
const WORLD_RUN_STATS_STORAGE_KEY = 'gravityGolfWorldRunStats';
const WORLD_STATS_HISTORY_STORAGE_KEY = 'gravityGolfWorldStatsHistory';
const COMMUNITY_STATS_MIN_SAMPLE_COUNT = 5;
const DEFAULT_CONTROL_SHOT = { angleDeg: 0, power: 1.8 };
const TIME_SPEED_VALUES = [-1, 0, 1, 2];
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

const pulsarJetsRoot = new THREE.Group();
world.add(pulsarJetsRoot);

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

function createPulsarCone(widthScale, opacity, color) {
  const cone = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape()),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  cone.rotation.x = -Math.PI / 2;
  cone.position.y = 0.13;
  cone.renderOrder = 9;
  cone.userData.widthScale = widthScale;
  cone.userData.baseOpacity = opacity;
  return cone;
}

const pulsarConePreviewA = createPulsarCone(2.1, 0.16, 0x54cfff);
const pulsarConePreviewB = createPulsarCone(2.1, 0.16, 0x54cfff);
const pulsarConeGlowA = createPulsarCone(3.2, 0.18, 0x67dfff);
const pulsarConeGlowB = createPulsarCone(3.2, 0.18, 0x67dfff);
const pulsarConeCoreA = createPulsarCone(0.86, 0.78, 0xf3fbff);
const pulsarConeCoreB = createPulsarCone(0.86, 0.78, 0xf3fbff);
pulsarJetsRoot.add(
  pulsarConePreviewA,
  pulsarConePreviewB,
  pulsarConeGlowA,
  pulsarConeGlowB,
  pulsarConeCoreA,
  pulsarConeCoreB,
);

const pulsarTimerTrack = new THREE.Mesh(
  new THREE.RingGeometry(1.24, 1.38, 96),
  new THREE.MeshBasicMaterial({
    color: 0x1d5168,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
);
pulsarTimerTrack.rotation.x = -Math.PI / 2;
pulsarTimerTrack.position.y = 0.12;
pulsarTimerTrack.renderOrder = 8;
pulsarJetsRoot.add(pulsarTimerTrack);

const pulsarTimerArc = new THREE.Mesh(
  new THREE.RingGeometry(1.24, 1.38, 96, 1, Math.PI / 2, 0.0001),
  new THREE.MeshBasicMaterial({
    color: 0xaaf8ff,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
pulsarTimerArc.rotation.x = -Math.PI / 2;
pulsarTimerArc.position.y = 0.135;
pulsarTimerArc.renderOrder = 9;
pulsarJetsRoot.add(pulsarTimerArc);

const pulsarWarningRing = new THREE.Mesh(
  new THREE.RingGeometry(0.82, 1.12, 72),
  new THREE.MeshBasicMaterial({
    color: 0x77e6ff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
pulsarWarningRing.rotation.x = -Math.PI / 2;
pulsarWarningRing.position.y = 0.115;
pulsarWarningRing.renderOrder = 8;
pulsarJetsRoot.add(pulsarWarningRing);

const sunShockwaveRoot = new THREE.Group();
world.add(sunShockwaveRoot);

const planetExplosionRoot = new THREE.Group();
world.add(planetExplosionRoot);

const extraSunsRoot = new THREE.Group();
world.add(extraSunsRoot);

const portalsRoot = new THREE.Group();
world.add(portalsRoot);

const vibeJamPortalsRoot = new THREE.Group();
world.add(vibeJamPortalsRoot);

const dustCloudsRoot = new THREE.Group();
world.add(dustCloudsRoot);

const asteroidsRoot = new THREE.Group();
world.add(asteroidsRoot);

const meteorsRoot = new THREE.Group();
world.add(meteorsRoot);

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
let starFieldSignature = '';

function rebuildStarField(count, spread) {
  const normalizedCount = clamp(Math.round(count), 0, 1200);
  const normalizedSpread = clamp(spread, 0.5, 3);
  const signature = `${normalizedCount}:${normalizedSpread.toFixed(3)}`;
  if (signature === starFieldSignature) {
    return;
  }

  const random = createSeededRandom(0x5eed51a7);
  const starPositions = [];
  for (let i = 0; i < normalizedCount; i += 1) {
    starPositions.push(
      (random() - 0.5) * COURSE.width * 1.55 * normalizedSpread,
      THREE.MathUtils.lerp(0.45, 1.8, random()),
      (random() - 0.5) * COURSE.height * 1.6 * normalizedSpread,
    );
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  starsGeometry.computeBoundingSphere();
  starFieldSignature = signature;
}

rebuildStarField(visualDebugDefaults.starCount, visualDebugDefaults.starSpread);

const starsMaterial = new THREE.PointsMaterial({
  color: 0xd7e6ff,
  size: visualDebugDefaults.starSize,
  transparent: true,
  opacity: visualDebugDefaults.starOpacity,
  sizeAttenuation: false,
});
const stars = new THREE.Points(
  starsGeometry,
  starsMaterial,
);
stars.renderOrder = 0;
world.add(stars);

const orbitPathsRoot = new THREE.Group();
world.add(orbitPathsRoot);

const planetsRoot = new THREE.Group();
world.add(planetsRoot);

const turretShotRoot = new THREE.Group();
turretShotRoot.visible = false;
world.add(turretShotRoot);

const turretShotBeam = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.28, 0),
    new THREE.Vector3(0, 0.28, 0),
  ]),
  new THREE.LineBasicMaterial({
    color: 0xfff0a8,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  }),
);
turretShotBeam.renderOrder = 24;
turretShotRoot.add(turretShotBeam);

const turretShotProjectile = new THREE.Mesh(
  new THREE.SphereGeometry(0.085, 18, 18),
  new THREE.MeshBasicMaterial({
    color: 0xfff3bf,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  }),
);
turretShotProjectile.position.y = 0.32;
turretShotProjectile.renderOrder = 25;
turretShotRoot.add(turretShotProjectile);

const turretShotImpact = new THREE.Mesh(
  new THREE.RingGeometry(0.12, 0.24, 32),
  new THREE.MeshBasicMaterial({
    color: 0xff5665,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  }),
);
turretShotImpact.rotation.x = -Math.PI / 2;
turretShotImpact.position.y = 0.34;
turretShotImpact.renderOrder = 25;
turretShotRoot.add(turretShotImpact);

const ballGroup = new THREE.Group();
world.add(ballGroup);
ballGroup.renderOrder = 20;

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
ballShadow.renderOrder = 20;
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
ballMesh.renderOrder = 21;
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
    crashPlanetIndex: null,
    crashStartPosition: cloneVec(initialBall.position),
    crashTargetPosition: cloneVec(initialBall.position),
    landingCount: 0,
    landedPlanetIndex: initialBall.anchorPlanetIndex ?? null,
    landedPlanetName: initialLevel.planets[initialBall.anchorPlanetIndex ?? 0]?.name ?? 'launch world',
  },
  aimDirection: normalize({ x: 1, y: 0 }),
  dragAnchor: { x: 0, y: 0 },
  dragStartWorld: { x: 0, y: 0 },
  dragPointerWorld: { x: 0, y: 0 },
  controlShots: [],
  timeSpeedIndex: 2,
  resumeTimeSpeedIndex: 2,
  dragActive: false,
  dragPower: 0,
  roundSettled: true,
  relayPulse: 0,
  currentAttemptTrail: [],
  currentAttemptMinGoalDistance: Number.POSITIVE_INFINITY,
  currentFlightHistory: [],
  currentFlightEvents: [],
  currentFlightStartCheckpoint: null,
  currentFlightLaunchState: null,
  rewindHistory: [],
  rewindPlayback: {
    active: false,
    phase: 'before-launch',
    flightPrimed: false,
    consumeHistory: true,
    checkpoint: null,
    landingCheckpoint: null,
    endCheckpoint: null,
    launchState: null,
    eventState: null,
    displayEventState: null,
    launchPlanetIndex: null,
    portalEvents: [],
    portalEventIndex: -1,
  },
  lastAttemptTrail: [],
  lastAttemptOutcome: '',
  bestApproach: null,
  turretShot: null,
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
  gameOver: {
    open: false,
    reason: '',
    title: '',
    hint: '',
    countReset: false,
  },
  worldMap: {
    open: false,
    nextLevelIndex: 0,
    completedLevelCount: 0,
    selectedWorldIndex: 0,
    openedFromHud: false,
    renderKey: '',
    animateStatsOnNextRender: false,
    communityKey: '',
    communityStatus: 'idle',
    communityPercentile: null,
    communitySampleCount: 0,
    communityMinSampleCount: COMMUNITY_STATS_MIN_SAMPLE_COUNT,
  },
  worldRunStats: {
    worldIndex: initialLevel.worldIndex,
    worldId: initialLevel.worldId,
    levelsCleared: 0,
    shots: 0,
    retries: 0,
    relays: 0,
    flightTime: 0,
  },
  levelStartStats: {
    shots: 0,
    resets: 0,
  },
  worldStatsHistory: readWorldStatsHistory(),
  goalCloseAnimation: {
    active: false,
    elapsed: 0,
    hint: '',
    countReset: true,
  },
  vibeJam: {
    incoming: readIncomingVibeJamPortal(),
    redirecting: false,
    loadedAt: 0,
    entry: null,
  },
  ballTraceParticles: Array.from({ length: BALL_TRACE_PARTICLE_COUNT }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    trailX: 0,
    trailY: 0,
    trailSpeed: 0,
    age: 0,
    life: BALL_TRACE_PARTICLE_LIFETIME,
  })),
  ballTraceCursor: 0,
  ballTraceCarry: 0,
  sunShockwaves: [],
  planetExplosions: [],
  message: 'Plot the first slingshot.',
  hint: 'Use the planets to curve into the event horizon.',
  debug: {
    fpsVisible: readFpsOverlayPreference(),
    fpsValue: 0,
    fpsFrameCount: 0,
    fpsElapsed: 0,
    tuning: { ...visualDebugDefaults },
  },
};

let planetVisuals = [];
let extraSunVisuals = [];
let portalVisuals = [];
let vibeJamPortalVisuals = [];
let dustCloudVisuals = [];
let asteroidVisuals = [];
let meteorVisuals = [];
let gravityFieldVisuals = null;
let gravityFieldSamples = [];
let physicsAccumulator = 0;
const planetTextureCache = new Map();
const dustCloudTextureCache = new Map();
let lastGravityFieldRefreshTime = Number.NEGATIVE_INFINITY;
let lastGoalTimerFraction = Number.NaN;
const gravityFieldTintColor = new THREE.Color();
let lastSceneWidth = 0;
let lastSceneHeight = 0;
let lastPlayfieldRotated = null;
let lastViewportHeight = 0;
let pendingResizeFrame = 0;
let communityStatsClient = null;

function shouldRotatePlayfieldForViewport(width = sceneHost.clientWidth, height = sceneHost.clientHeight) {
  return width <= PORTRAIT_ROTATED_PLAYFIELD_MAX_WIDTH && height > width;
}

function getViewportMetrics() {
  const width = sceneHost.clientWidth;
  const height = sceneHost.clientHeight;
  const aspect = width / Math.max(1, height);
  const playfieldRotated = shouldRotatePlayfieldForViewport(width, height);
  const referenceAspect = playfieldRotated ? height / Math.max(1, width) : aspect;
  const landscapeT = clamp(
    (referenceAspect - LANDSCAPE_CAMERA_ZOOM_START_ASPECT)
      / (LANDSCAPE_CAMERA_ZOOM_END_ASPECT - LANDSCAPE_CAMERA_ZOOM_START_ASPECT),
    0,
    1,
  );
  const cameraScale = THREE.MathUtils.lerp(1, LANDSCAPE_CAMERA_ZOOM_MIN, landscapeT);
  const worldViewHeight = CAMERA_VIEW_SIZE * cameraScale;
  const worldViewWidth = worldViewHeight * referenceAspect;
  const viewWidth = playfieldRotated ? worldViewHeight : worldViewWidth;
  const viewHeight = playfieldRotated ? worldViewWidth : worldViewHeight;

  return {
    aspect,
    referenceAspect,
    playfieldRotated,
    landscapeT,
    cameraScale,
    viewWidth,
    viewHeight,
    worldViewWidth,
    worldViewHeight,
    halfWidth: viewWidth / 2,
    halfHeight: viewHeight / 2,
  };
}

function getVisualFieldSize() {
  const viewport = getViewportMetrics();
  return {
    width: Math.max(COURSE.width + VISUAL_FIELD_PADDING_X, viewport.worldViewWidth + VISUAL_FIELD_PADDING_X),
    height: Math.max(COURSE.height + VISUAL_FIELD_PADDING_Y, viewport.worldViewHeight + VISUAL_FIELD_PADDING_Y),
  };
}

function replaceMeshGeometry(mesh, geometry) {
  mesh.geometry.dispose();
  mesh.geometry = geometry;
}

function updateCourseSurfaceVisuals() {
  const visualField = getVisualFieldSize();
  replaceMeshGeometry(field, new THREE.BoxGeometry(visualField.width, 0.14, visualField.height));
  replaceMeshGeometry(
    courseHalo,
    new THREE.PlaneGeometry(
      Math.max(0.1, visualField.width - 0.5),
      Math.max(0.1, visualField.height - 0.5),
    ),
  );
}

function readFpsOverlayPreference() {
  const url = new URL(window.location.href);
  const fpsQuery = url.searchParams.get('fps');
  if (fpsQuery === '1') {
    return true;
  }
  if (fpsQuery === '0') {
    return false;
  }

  try {
    return window.localStorage.getItem(FPS_OVERLAY_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistFpsOverlayPreference(visible) {
  try {
    window.localStorage.setItem(FPS_OVERLAY_STORAGE_KEY, visible ? '1' : '0');
  } catch {
    // Ignore persistence errors in restricted contexts.
  }
}

function readLastLevelIndex() {
  try {
    const rawLevel = window.localStorage.getItem(LAST_LEVEL_STORAGE_KEY);
    if (!rawLevel) {
      return 0;
    }

    const parsedLevel = Number.parseInt(rawLevel, 10);
    if (!Number.isFinite(parsedLevel)) {
      return 0;
    }

    return clamp(parsedLevel, 0, LEVELS.length - 1);
  } catch {
    return 0;
  }
}

function persistLastLevelIndex(levelIndex) {
  try {
    window.localStorage.setItem(LAST_LEVEL_STORAGE_KEY, String(levelIndex));
  } catch {
    // Ignore persistence errors in restricted contexts.
  }
}

function createRandomId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getCommunityRunId() {
  try {
    const existing = window.localStorage.getItem(COMMUNITY_RUN_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const next = createRandomId('run');
    window.localStorage.setItem(COMMUNITY_RUN_STORAGE_KEY, next);
    return next;
  } catch {
    return createRandomId('run');
  }
}

function getCommunityStatsClient() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    return null;
  }
  if (!communityStatsClient) {
    communityStatsClient = new ConvexHttpClient(convexUrl);
  }
  return communityStatsClient;
}

function getCurrentGameRef() {
  return `${window.location.origin}${window.location.pathname}`;
}

function readIncomingVibeJamPortal() {
  const params = new URLSearchParams(window.location.search);
  return {
    fromPortal: params.get('portal') === 'true',
    ref: params.get('ref') || '',
    username: params.get('username') || '',
    color: params.get('color') || '',
    team: params.get('team') || '',
    avatarUrl: params.get('avatar_url') || '',
    hp: params.get('hp') || '',
    rawParams: params.toString(),
  };
}

function normalizeVibeJamRef(rawRef) {
  if (!rawRef) {
    return null;
  }

  try {
    return new URL(rawRef.includes('://') ? rawRef : `https://${rawRef}`);
  } catch {
    return null;
  }
}

function appendVibeJamPlayerParams(url, params = new URLSearchParams(window.location.search)) {
  const preservedKeys = [
    'username',
    'color',
    'avatar_url',
    'team',
    'hp',
    'rotation_x',
    'rotation_y',
    'rotation_z',
  ];

  preservedKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const speed = length(state.ball.velocity);
  url.searchParams.set('color', params.get('color') || 'faf7ef');
  url.searchParams.set('speed', speed.toFixed(2));
  url.searchParams.set('speed_x', state.ball.velocity.x.toFixed(2));
  url.searchParams.set('speed_y', state.ball.velocity.y.toFixed(2));
  url.searchParams.set('speed_z', '0');
  url.searchParams.set('ref', getCurrentGameRef());
}

function buildVibeJamExitUrl() {
  const url = new URL(VIBE_JAM_PORTAL_URL);
  appendVibeJamPlayerParams(url);
  return url.toString();
}

function buildVibeJamReturnUrl() {
  const target = normalizeVibeJamRef(state.vibeJam.incoming.ref);
  if (!target) {
    return '';
  }

  const params = new URLSearchParams(state.vibeJam.incoming.rawParams);
  params.forEach((value, key) => {
    if (key !== 'portal') {
      target.searchParams.set(key, value);
    }
  });
  appendVibeJamPlayerParams(target, params);
  target.searchParams.set('portal', 'true');
  return target.toString();
}

const WORLD_MAP_POINTS = WORLD_DEFINITIONS.map((_, index) => {
  const count = Math.max(1, WORLD_DEFINITIONS.length);
  const inwardT = count <= 1 ? 0 : index / (count - 1);
  const radius = THREE.MathUtils.lerp(44, 8, inwardT);
  const angle = -2.45 + index * 1.05;
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius * 0.78,
  };
});

function getWorldMapCompletedWorldCount(completedLevelCount) {
  return clamp(
    Math.floor(completedLevelCount / WORLD_SIZE),
    0,
    WORLD_DEFINITIONS.length,
  );
}

function getWorldMapPointString(points) {
  return points
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');
}

function createEmptyWorldRunStats(worldIndex) {
  const worldDefinition = WORLD_DEFINITIONS[worldIndex] ?? null;
  return {
    worldIndex,
    worldId: worldDefinition?.id ?? `world-${worldIndex + 1}`,
    levelsCleared: 0,
    shots: 0,
    retries: 0,
    relays: 0,
    flightTime: 0,
  };
}

function normalizeWorldRunStats(stats, worldIndex) {
  return {
    ...createEmptyWorldRunStats(worldIndex),
    levelsCleared: clamp(Number(stats?.levelsCleared) || 0, 0, WORLD_SIZE),
    shots: Math.max(0, Number(stats?.shots) || 0),
    retries: Math.max(0, Number(stats?.retries) || 0),
    relays: Math.max(0, Number(stats?.relays) || 0),
    flightTime: Math.max(0, Number(stats?.flightTime) || 0),
  };
}

function readWorldStatsHistory() {
  try {
    const rawHistory = window.localStorage.getItem(WORLD_STATS_HISTORY_STORAGE_KEY);
    if (!rawHistory) {
      return {};
    }

    const parsedHistory = JSON.parse(rawHistory);
    const nextHistory = {};
    WORLD_DEFINITIONS.forEach((worldDefinition, worldIndex) => {
      const savedStats = parsedHistory?.[worldDefinition.id];
      if (savedStats) {
        nextHistory[worldDefinition.id] = normalizeWorldRunStats(savedStats, worldIndex);
      }
    });
    return nextHistory;
  } catch {
    return {};
  }
}

function persistWorldStatsHistory() {
  try {
    window.localStorage.setItem(WORLD_STATS_HISTORY_STORAGE_KEY, JSON.stringify(state.worldStatsHistory));
  } catch {
    // Ignore persistence errors in restricted contexts.
  }
}

function getWorldHistoryStats(worldIndex) {
  const worldId = WORLD_DEFINITIONS[worldIndex]?.id;
  return worldId ? state.worldStatsHistory[worldId] ?? null : null;
}

function saveCompletedWorldStats(worldIndex) {
  const worldId = WORLD_DEFINITIONS[worldIndex]?.id;
  if (!worldId || state.worldRunStats.levelsCleared < WORLD_SIZE) {
    return;
  }
  state.worldStatsHistory[worldId] = normalizeWorldRunStats(state.worldRunStats, worldIndex);
  persistWorldStatsHistory();
}

function readPersistedWorldRunStats(worldIndex) {
  try {
    const rawStats = window.localStorage.getItem(WORLD_RUN_STATS_STORAGE_KEY);
    if (!rawStats) {
      return null;
    }

    const parsedStats = JSON.parse(rawStats);
    const expectedWorldId = WORLD_DEFINITIONS[worldIndex]?.id ?? `world-${worldIndex + 1}`;
    if (
      parsedStats?.worldIndex !== worldIndex
      || parsedStats?.worldId !== expectedWorldId
    ) {
      return null;
    }

    return {
      ...normalizeWorldRunStats(parsedStats, worldIndex),
    };
  } catch {
    return null;
  }
}

function persistWorldRunStats() {
  try {
    window.localStorage.setItem(WORLD_RUN_STATS_STORAGE_KEY, JSON.stringify(state.worldRunStats));
  } catch {
    // Ignore persistence errors in restricted contexts.
  }
}

function clearPersistedWorldRunStats() {
  try {
    window.localStorage.removeItem(WORLD_RUN_STATS_STORAGE_KEY);
  } catch {
    // Ignore persistence errors in restricted contexts.
  }
}

function syncWorldRunForLevel(level) {
  const expectedWorldId = WORLD_DEFINITIONS[level.worldIndex]?.id ?? `world-${level.worldIndex + 1}`;
  if (
    state.worldRunStats.worldIndex !== level.worldIndex
    || state.worldRunStats.worldId !== expectedWorldId
  ) {
    const startFresh = level.worldLevelNumber === 1;
    state.worldRunStats = startFresh
      ? createEmptyWorldRunStats(level.worldIndex)
      : (readPersistedWorldRunStats(level.worldIndex) ?? createEmptyWorldRunStats(level.worldIndex));
    if (startFresh) {
      clearPersistedWorldRunStats();
    }
  }
  state.levelStartStats.shots = state.shots;
  state.levelStartStats.resets = state.resets;
}

function recordCompletedWorldLevelStats(completedLevelIndex) {
  const completedLevel = LEVELS[completedLevelIndex];
  const worldIndex = Math.floor(completedLevelIndex / WORLD_SIZE);
  if (state.worldRunStats.worldIndex !== worldIndex) {
    state.worldRunStats = createEmptyWorldRunStats(worldIndex);
  }

  state.worldRunStats.levelsCleared += 1;
  state.worldRunStats.shots += Math.max(0, state.shots - state.levelStartStats.shots);
  state.worldRunStats.retries += Math.max(0, state.resets - state.levelStartStats.resets);
  state.worldRunStats.relays += Math.max(0, state.ball.landingCount ?? 0);
  state.worldRunStats.flightTime += Math.max(
    0,
    (state.ball.time ?? state.level.time ?? 0) - (completedLevel.startTimeSeconds ?? 0),
  );
  persistWorldRunStats();
  saveCompletedWorldStats(worldIndex);
}

function formatStatValue(value, format) {
  if (format === 'time') {
    return `${value.toFixed(1)}s`;
  }
  return String(Math.round(value));
}

function getWorldMapStats(stats = state.worldRunStats) {
  const levelsCleared = Math.max(1, stats.levelsCleared);
  return [
    {
      label: 'Launches',
      value: stats.shots,
      max: Math.max(WORLD_SIZE * 3, stats.shots),
      format: 'integer',
    },
    {
      label: 'Flight Time',
      value: stats.flightTime,
      max: Math.max(levelsCleared * 16, stats.flightTime),
      format: 'time',
    },
  ];
}

function getSelectedWorldStats() {
  const selectedWorldIndex = clamp(state.worldMap.selectedWorldIndex, 0, WORLD_DEFINITIONS.length - 1);
  if (selectedWorldIndex === state.worldRunStats.worldIndex) {
    return state.worldRunStats;
  }
  return getWorldHistoryStats(selectedWorldIndex) ?? createEmptyWorldRunStats(selectedWorldIndex);
}

function selectedWorldHasStats() {
  return getSelectedWorldStats().levelsCleared > 0;
}

let worldMapStatsAnimationFrame = 0;

function cancelWorldMapStatsAnimation() {
  if (!worldMapStatsAnimationFrame) {
    return;
  }
  cancelAnimationFrame(worldMapStatsAnimationFrame);
  worldMapStatsAnimationFrame = 0;
}

function renderWorldMapStats({ animate = false } = {}) {
  if (!animate) {
    cancelWorldMapStatsAnimation();
  }

  const selectedStats = getSelectedWorldStats();
  const stats = getWorldMapStats(selectedStats);
  worldMapStats.innerHTML = stats.map((stat, index) => {
    const ratio = clamp(stat.value / Math.max(1, stat.max), 0.04, 1);
    const displayValue = animate ? '0' : formatStatValue(stat.value, stat.format);
    return `
      <div class="world-map-stat" style="--stat-ratio: ${ratio}; --stat-delay: ${index * 90}ms;">
        <div class="world-map-stat-head">
          <span>${stat.label}</span>
          <strong data-final-value="${stat.value}" data-format="${stat.format}">${displayValue}</strong>
        </div>
        <div class="world-map-stat-track">
          <span></span>
        </div>
      </div>
    `;
  }).join('') + getWorldMapCommunityStatsMarkup(stats.length);
  syncWorldMapCommunityStats();
}

function getWorldMapCommunityStatsMarkup(index) {
  return `
    <div class="world-map-stat world-map-community-stat" style="--stat-ratio: 0; --stat-delay: ${index * 90}ms;" data-community-stat hidden>
      <div class="world-map-stat-head">
        <span>Community</span>
        <strong data-community-value>Syncing</strong>
      </div>
      <p data-community-copy>Comparing your run.</p>
    </div>
  `;
}

function syncWorldMapCommunityStats() {
  const communityNode = worldMapStats.querySelector('[data-community-stat]');
  if (!communityNode) {
    return;
  }

  if (state.worldMap.communityStatus === 'idle') {
    communityNode.hidden = true;
    return;
  }

  const valueNode = communityNode.querySelector('[data-community-value]');
  const copyNode = communityNode.querySelector('[data-community-copy]');
  communityNode.hidden = false;
  communityNode.classList.toggle('is-loading', state.worldMap.communityStatus === 'loading');
  communityNode.classList.toggle('has-percentile', state.worldMap.communityStatus === 'ready' && state.worldMap.communityPercentile !== null);

  if (state.worldMap.communityStatus === 'loading') {
    valueNode.textContent = 'Syncing';
    copyNode.textContent = 'Comparing your run.';
    return;
  }

  if (state.worldMap.communityStatus === 'ready' && state.worldMap.communityPercentile !== null) {
    valueNode.textContent = `Better than ${state.worldMap.communityPercentile}%`;
    copyNode.textContent = `Compared with ${state.worldMap.communitySampleCount} world runs.`;
    return;
  }

  if (state.worldMap.communityStatus === 'pending') {
    valueNode.textContent = 'Setting pace';
    copyNode.textContent = `${state.worldMap.communitySampleCount}/${state.worldMap.communityMinSampleCount} runs recorded.`;
    return;
  }

  communityNode.hidden = true;
}

function animateWorldMapStats() {
  cancelWorldMapStatsAnimation();
  const values = [...worldMapStats.querySelectorAll('[data-final-value]')];
  const startedAt = performance.now();
  const duration = 1050;

  function tick(now) {
    const t = clamp((now - startedAt) / duration, 0, 1);
    const eased = 1 - ((1 - t) ** 3);
    values.forEach((node) => {
      const finalValue = Number.parseFloat(node.dataset.finalValue ?? '0');
      const format = node.dataset.format ?? 'integer';
      node.textContent = formatStatValue(finalValue * eased, format);
    });
    if (t < 1 && state.worldMap.open) {
      worldMapStatsAnimationFrame = requestAnimationFrame(tick);
    } else {
      worldMapStatsAnimationFrame = 0;
    }
  }

  worldMapStatsAnimationFrame = requestAnimationFrame(tick);
}

function resetWorldMapCommunityStats(status = 'idle') {
  state.worldMap.communityStatus = status;
  state.worldMap.communityPercentile = null;
  state.worldMap.communitySampleCount = 0;
  state.worldMap.communityMinSampleCount = COMMUNITY_STATS_MIN_SAMPLE_COUNT;
  syncWorldMapCommunityStats();
}

async function submitWorldMapCommunityStats(finishedWorldIndex, completedLevelCount) {
  const client = getCommunityStatsClient();
  if (!client) {
    resetWorldMapCommunityStats('idle');
    return;
  }

  if (state.worldRunStats.levelsCleared < WORLD_SIZE) {
    resetWorldMapCommunityStats('idle');
    return;
  }

  const finishedWorld = WORLD_DEFINITIONS[finishedWorldIndex];
  if (!finishedWorld) {
    resetWorldMapCommunityStats('idle');
    return;
  }

  const submissionKey = `${finishedWorld.id}:${completedLevelCount}:${state.worldRunStats.shots}:${state.worldRunStats.retries}:${state.worldRunStats.flightTime.toFixed(2)}`;
  state.worldMap.communityKey = submissionKey;
  resetWorldMapCommunityStats('loading');

  try {
    const result = await client.mutation('worldStats:submitWorldResult', {
      worldId: finishedWorld.id,
      clientRunId: getCommunityRunId(),
      completedLevelCount,
      levelsCleared: state.worldRunStats.levelsCleared,
      launches: state.worldRunStats.shots,
      retries: state.worldRunStats.retries,
      relays: state.worldRunStats.relays,
      flightTime: Number(state.worldRunStats.flightTime.toFixed(2)),
    });

    if (state.worldMap.communityKey !== submissionKey || !state.worldMap.open) {
      return;
    }

    state.worldMap.communitySampleCount = result?.sampleCount ?? 0;
    state.worldMap.communityMinSampleCount = result?.minSampleCount ?? COMMUNITY_STATS_MIN_SAMPLE_COUNT;
    state.worldMap.communityPercentile = Number.isFinite(result?.percentile) ? result.percentile : null;
    state.worldMap.communityStatus = state.worldMap.communityPercentile === null ? 'pending' : 'ready';
    syncWorldMapCommunityStats();
  } catch {
    if (state.worldMap.communityKey === submissionKey) {
      resetWorldMapCommunityStats('idle');
    }
  }
}

function syncWorldMap() {
  worldMapModal.hidden = !state.worldMap.open;
  worldMapModal.classList.toggle('is-open', state.worldMap.open);
  worldMapModal.classList.toggle('is-visible', state.worldMap.open);
  if (!state.worldMap.open) {
    cancelWorldMapStatsAnimation();
    resetWorldMapCommunityStats('idle');
    return;
  }

  const completedWorldCount = getWorldMapCompletedWorldCount(state.worldMap.completedLevelCount);
  const activeWorldIndex = clamp(completedWorldCount, 0, WORLD_DEFINITIONS.length - 1);
  const finishedWorldIndex = clamp(Math.max(0, completedWorldCount - 1), 0, WORLD_DEFINITIONS.length - 1);
  const enteringWorld = WORLD_DEFINITIONS[activeWorldIndex];
  const selectedWorldIndex = clamp(state.worldMap.selectedWorldIndex, 0, WORLD_DEFINITIONS.length - 1);
  const selectedWorld = WORLD_DEFINITIONS[selectedWorldIndex];
  const selectedStats = getSelectedWorldStats();
  const selectedCompleted = selectedStats.levelsCleared >= WORLD_SIZE;
  const selectedVisited = selectedWorldIndex <= activeWorldIndex || Boolean(getWorldHistoryStats(selectedWorldIndex));
  const renderKey = `${state.worldMap.openedFromHud}:${state.worldMap.completedLevelCount}:${state.worldMap.selectedWorldIndex}:${selectedStats.worldId}:${selectedStats.levelsCleared}:${selectedStats.shots}:${selectedStats.retries}:${selectedStats.relays}:${selectedStats.flightTime.toFixed(1)}`;
  worldMapTitle.innerHTML = `
    <span class="world-map-title-prefix">${selectedCompleted ? 'Cleared' : selectedVisited ? 'Visited' : 'Locked'}</span>
    <strong class="world-map-title-name">${selectedWorld.name}</strong>
  `;
  worldMapProgress.textContent = selectedVisited
    ? `${selectedStats.levelsCleared}/${WORLD_SIZE} levels cleared · World ${selectedWorldIndex + 1} of ${WORLD_DEFINITIONS.length}`
    : `Reach this sector to unlock it.`;
  worldMapContinueButton.textContent = state.worldMap.openedFromHud
    ? `Resume Level ${state.levelIndex + 1}`
    : `Enter ${enteringWorld.name}`;
  worldMapReplayButton.hidden = !selectedVisited;
  worldMapReplayButton.disabled = !selectedVisited;
  worldMapReplayButton.textContent = `Play ${selectedWorld.name} Again`;
  worldMapTrailBase.setAttribute('points', getWorldMapPointString(WORLD_MAP_POINTS));
  worldMapTrailProgress.setAttribute(
    'points',
    getWorldMapPointString(WORLD_MAP_POINTS.slice(0, activeWorldIndex + 1)),
  );
  worldMapDotLayer.innerHTML = WORLD_MAP_POINTS.map((point, index) => {
    const completed = index < completedWorldCount;
    const active = index === activeWorldIndex;
    const selected = index === selectedWorldIndex;
    const className = [
      'world-map-dot',
      completed ? 'is-complete' : '',
      active ? 'is-active' : '',
      selected ? 'is-selected' : '',
    ].filter(Boolean).join(' ');
    return `<circle class="${className}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="1.45"></circle>`;
  }).join('');
  worldMapNodes.innerHTML = WORLD_DEFINITIONS.map((worldDefinition, index) => {
    const point = WORLD_MAP_POINTS[index];
    const completed = index < completedWorldCount;
    const active = index === activeWorldIndex;
    const selected = index === selectedWorldIndex;
    const visited = index <= activeWorldIndex || Boolean(getWorldHistoryStats(index));
    const visibleLabel = active || selected;
    const className = [
      'world-map-node',
      completed ? 'is-complete' : '',
      active ? 'is-active' : '',
      selected ? 'is-selected' : '',
      visited ? 'is-visited' : '',
      point.x > 62 ? 'is-label-left' : '',
    ].filter(Boolean).join(' ');
    return `
      <button class="${className}" style="--map-x: ${point.x}%; --map-y: ${point.y}%;" type="button" data-world-index="${index}" ${visited ? '' : 'disabled'}>
        ${visibleLabel ? `
          <span class="world-map-label">
            <strong>${worldDefinition.name}</strong>
          </span>
        ` : ''}
      </button>
    `;
  }).join('');

  if (state.worldMap.renderKey !== renderKey) {
    state.worldMap.renderKey = renderKey;
    const animateStats = state.worldMap.animateStatsOnNextRender;
    state.worldMap.animateStatsOnNextRender = false;
    renderWorldMapStats({ animate: animateStats });
    if (animateStats) {
      animateWorldMapStats();
    }
    if (!state.worldMap.openedFromHud && selectedWorldIndex === finishedWorldIndex && selectedCompleted) {
      submitWorldMapCommunityStats(finishedWorldIndex, state.worldMap.completedLevelCount);
    } else {
      resetWorldMapCommunityStats('idle');
    }
  }
}

function showWorldMap(nextLevelIndex, completedLevelCount, options = {}) {
  const completedWorldCount = getWorldMapCompletedWorldCount(completedLevelCount);
  const activeWorldIndex = clamp(completedWorldCount, 0, WORLD_DEFINITIONS.length - 1);
  const defaultSelectedWorldIndex = options.openedFromHud
    ? activeWorldIndex
    : clamp(Math.max(0, completedWorldCount - 1), 0, WORLD_DEFINITIONS.length - 1);
  state.worldMap.open = true;
  state.worldMap.nextLevelIndex = nextLevelIndex;
  state.worldMap.completedLevelCount = completedLevelCount;
  state.worldMap.selectedWorldIndex = clamp(options.selectedWorldIndex ?? defaultSelectedWorldIndex, 0, WORLD_DEFINITIONS.length - 1);
  state.worldMap.openedFromHud = Boolean(options.openedFromHud);
  state.worldMap.renderKey = '';
  state.worldMap.animateStatsOnNextRender = true;
  syncWorldMap();
}

function hideWorldMap() {
  state.worldMap.open = false;
  syncWorldMap();
}

function continueFromWorldMap() {
  if (!state.worldMap.open) {
    return;
  }

  const nextLevelIndex = state.worldMap.nextLevelIndex;
  const openedFromHud = state.worldMap.openedFromHud;
  if (!openedFromHud) {
    clearPersistedWorldRunStats();
  }
  hideWorldMap();
  if (!openedFromHud) {
    applyLevel(nextLevelIndex);
    resetBall(`Level ${state.levelIndex + 1}: ${state.level.name}.`, state.level.summary);
  }
}

function openWorldMapFromHud() {
  if (state.gameOver.open || state.goalCloseAnimation.active || state.vibeJam.entry || state.vibeJam.redirecting) {
    return;
  }
  showWorldMap(state.levelIndex, state.levelIndex, {
    openedFromHud: true,
    selectedWorldIndex: state.level.worldIndex,
  });
}

worldMapButton.addEventListener('click', openWorldMapFromHud);

function playSelectedWorldAgain() {
  if (!state.worldMap.open) {
    return;
  }

  const selectedWorldIndex = clamp(state.worldMap.selectedWorldIndex, 0, WORLD_DEFINITIONS.length - 1);
  const targetLevelIndex = clamp(selectedWorldIndex * WORLD_SIZE, 0, LEVELS.length - 1);
  clearPersistedWorldRunStats();
  hideWorldMap();
  state.score = 0;
  state.shots = 0;
  state.resets = 0;
  applyLevel(targetLevelIndex);
  resetBall(`Level ${state.levelIndex + 1}: ${state.level.name}.`, state.level.summary);
}

function shouldShowWorldMapAfterLevel(completedLevelIndex, nextLevelIndex) {
  const completedLevelCount = completedLevelIndex + 1;
  return (
    completedLevelCount > 0
    && completedLevelCount % WORLD_SIZE === 0
    && completedLevelCount < LEVELS.length
    && nextLevelIndex !== 0
  );
}

function setGoalTimerArc(fraction) {
  if (!Number.isFinite(fraction)) {
    lastGoalTimerFraction = Number.NaN;
    goalTimerArc.visible = false;
    return;
  }

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
  const visualRadius = getPrimarySunVisualRadius(state.level, state.level.time ?? 0);
  const redGiantProgress = getRedGiantProgress(state.level, state.level.time ?? 0);
  const sunScale = state.level.redGiant ? visualRadius / 0.42 : 1;
  const coreScale = sunScale;
  sunCore.scale.setScalar(coreScale);
  sunCore.position.y = state.level.redGiant ? visualRadius : 0.42;
  sunGlow.scale.setScalar(state.level.redGiant ? sunScale * (1 + redGiantProgress * 0.18) : 1);
  sunCorona.scale.setScalar(state.level.redGiant ? sunScale * (1.05 + redGiantProgress * 0.12) : 1);

  if (state.level.pulsarJets) {
    sunGlow.material.color.setHex(0x67dfff);
    sunCorona.material.color.setHex(0xd8f7ff);
    sunCore.material.color.setHex(0xf4fbff);
    sunCore.material.emissive.setHex(0x83dfff);
    sunCore.material.emissiveIntensity = 1.7;
    return;
  }

  if (state.level.redGiant) {
    sunGlow.material.color.setHex(0xff5c32);
    sunCorona.material.color.setHex(0xff2f1f);
    sunCore.material.color.setHex(0xff8a4a);
    sunCore.material.emissive.setHex(0xff321c);
    sunCore.material.emissiveIntensity = 1.45 + redGiantProgress * 0.75;
    return;
  }

  sunGlow.material.color.setHex(0xffcf70);
  sunCorona.material.color.setHex(0xffa54f);
  sunCore.material.color.setHex(0xffdd8f);
  sunCore.material.emissive.setHex(0xffb347);
  sunCore.material.emissiveIntensity = 1.2;
}

function createPulsarConeGeometry(sign, jetState, widthScale = 1) {
  const length = Math.max(jetState.innerRadius + 0.1, jetState.length);
  const innerHalfWidth = jetState.width * 0.45 * widthScale;
  const outerHalfWidth = jetState.width * 1.65 * widthScale;
  const shape = new THREE.Shape();
  shape.moveTo(sign * jetState.innerRadius, -innerHalfWidth);
  shape.lineTo(sign * length, -outerHalfWidth);
  shape.lineTo(sign * length, outerHalfWidth);
  shape.lineTo(sign * jetState.innerRadius, innerHalfWidth);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

function layoutPulsarCone(cone, sign, jetState) {
  replaceMeshGeometry(cone, createPulsarConeGeometry(sign, jetState, cone.userData.widthScale));
}

function updatePulsarJets(time) {
  const jetState = getPulsarJetState(state.level, state.level.time ?? 0);
  pulsarJetsRoot.visible = Boolean(jetState);
  if (!jetState) {
    return;
  }

  const angle = Math.atan2(jetState.direction.y, jetState.direction.x);
  const pulse = jetState.active ? (0.42 + jetState.activity * 0.58) : 0;
  const timerProgress = jetState.active
    ? 1
    : clamp(
      (jetState.phaseTime - jetState.activeSeconds) / Math.max(0.001, jetState.periodSeconds - jetState.activeSeconds),
      0,
      1,
    );
  const warning = jetState.active ? 1 : timerProgress;

  pulsarJetsRoot.position.set(state.level.sun.x, 0, state.level.sun.y);
  pulsarJetsRoot.rotation.y = -angle;
  layoutPulsarCone(pulsarConePreviewA, 1, jetState);
  layoutPulsarCone(pulsarConePreviewB, -1, jetState);
  layoutPulsarCone(pulsarConeGlowA, 1, jetState);
  layoutPulsarCone(pulsarConeGlowB, -1, jetState);
  layoutPulsarCone(pulsarConeCoreA, 1, jetState);
  layoutPulsarCone(pulsarConeCoreB, -1, jetState);

  for (const cone of [pulsarConePreviewA, pulsarConePreviewB]) {
    cone.visible = true;
    cone.material.opacity = cone.userData.baseOpacity * (0.55 + warning * 0.45);
  }

  for (const cone of [pulsarConeGlowA, pulsarConeGlowB, pulsarConeCoreA, pulsarConeCoreB]) {
    cone.visible = jetState.active;
    cone.material.opacity = cone.userData.baseOpacity * pulse;
  }

  replaceMeshGeometry(
    pulsarTimerArc,
    new THREE.RingGeometry(1.24, 1.38, 96, 1, Math.PI / 2, Math.max(0.0001, Math.PI * 2 * timerProgress)),
  );
  pulsarTimerArc.visible = timerProgress > 0.001;
  pulsarTimerArc.material.color.setHex(jetState.active ? 0xffffff : 0xaaf8ff);
  pulsarTimerArc.material.opacity = jetState.active ? 1 : 0.72 + timerProgress * 0.24;
  pulsarTimerTrack.material.opacity = 0.28 + warning * 0.24;
  pulsarWarningRing.material.opacity = 0.1 + warning * 0.38;
  pulsarWarningRing.scale.setScalar(0.94 + warning * 0.18 + Math.sin(time * 6.4) * 0.025);
  pulsarWarningRing.rotation.z = time * 1.8;
}

function setTurretShotBeam(start, end, opacity) {
  const beamPositions = turretShotBeam.geometry.attributes.position;
  beamPositions.setXYZ(0, start.x, 0.28, start.y);
  beamPositions.setXYZ(1, end.x, 0.28, end.y);
  beamPositions.needsUpdate = true;
  turretShotBeam.material.opacity = opacity;
}

function updateTurretShotVisual(delta) {
  const shot = state.turretShot;
  if (!shot) {
    turretShotRoot.visible = false;
    turretShotBeam.material.opacity = 0;
    turretShotProjectile.material.opacity = 0;
    turretShotImpact.material.opacity = 0;
    return;
  }

  shot.elapsed += delta;
  const duration = shot.turretType === 'missile' ? 0.46 : 0.3;
  const progress = clamp(shot.elapsed / duration, 0, 1);
  const ease = THREE.MathUtils.smootherstep(progress, 0, 1);
  const projectile = {
    x: THREE.MathUtils.lerp(shot.start.x, shot.end.x, ease),
    y: THREE.MathUtils.lerp(shot.start.y, shot.end.y, ease),
  };
  const flash = Math.max(0, 1 - progress);
  const impact = clamp((progress - 0.58) / 0.42, 0, 1);

  turretShotRoot.visible = true;
  setTurretShotBeam(shot.start, projectile, 0.18 + flash * 0.72);
  turretShotBeam.material.color.setHex(shot.turretType === 'missile' ? 0xffe38f : 0xff626a);
  turretShotProjectile.position.set(projectile.x, 0.32, projectile.y);
  turretShotProjectile.scale.setScalar(shot.turretType === 'missile' ? 1.35 - impact * 0.25 : 1 + flash * 0.65);
  turretShotProjectile.material.opacity = 0.95 * (1 - impact * 0.85);
  turretShotProjectile.material.color.setHex(shot.turretType === 'missile' ? 0xfff0b0 : 0xff6a72);
  turretShotImpact.position.set(shot.end.x, 0.34, shot.end.y);
  turretShotImpact.scale.setScalar(0.7 + impact * 2.6);
  turretShotImpact.material.opacity = impact > 0 ? 0.72 * (1 - impact) : 0;
}

function syncPlanetCollapseEffects() {
  planetVisuals.forEach((visual) => {
    const collapseState = visual.planet.collapseState ?? 'stable';
    if (visual.lastCollapseState !== 'plunging' && collapseState === 'plunging') {
      spawnSunShockwave(0.85 + (visual.planet.radius ?? 0.4) * 0.75);
    } else if (visual.lastCollapseState !== 'meteor-destroyed' && collapseState === 'meteor-destroyed') {
      spawnPlanetExplosion(visual.planet);
    }
    visual.lastCollapseState = collapseState;
  });
}

function maybeCrashAnchoredBallOnConsumedPlanet() {
  const planetIndex = state.ball.anchorPlanetIndex;
  if (planetIndex === null || planetIndex === undefined) {
    return false;
  }

  const planet = state.level.planets[planetIndex];
  if (!planet || planet.collapseState !== 'consumed') {
    return false;
  }

  beginCrash(
    'Consumed by the sun.',
    'The launch world fell into the sun before the next shot.',
    'sun',
    null,
    null,
    planetIndex,
  );
  return true;
}

function formatDistance(value) {
  return value < 1 ? value.toFixed(2) : value.toFixed(1);
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
    .slice(0, Math.max(1, state.controlShots.length))
    .map((shot) => clampControlShot({ angleDeg: shot.angleDeg, power: shot.power }));
  syncActionButtons();
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
  if (
    state.adminReplay.active
    || state.undo.active
    || state.rewindPlayback.active
    || state.ball.goaling
  ) {
    return false;
  }

  if (state.currentFlightLaunchState && state.currentFlightStartCheckpoint) {
    return true;
  }

  if (state.currentFlightStartCheckpoint && !checkpointMatchesCurrent(state.currentFlightStartCheckpoint)) {
    return true;
  }

  const rewind = state.rewindHistory[state.rewindHistory.length - 1] ?? null;
  if (rewind && (matchesLandingPlaybackAnchor(rewind) || matchesLaunchPlaybackAnchor(rewind))) {
    return true;
  }

  const checkpoint = getLatestUndoCheckpoint();
  return Boolean(checkpoint) && !checkpointMatchesCurrent(checkpoint);
}

function cloneCheckpoint(checkpoint) {
  if (!checkpoint) {
    return null;
  }

  return {
    ...checkpoint,
    position: cloneVec(checkpoint.position),
    anchorNormal: cloneVec(checkpoint.anchorNormal),
    anchorSinceTime: checkpoint.anchorSinceTime ?? checkpoint.levelTime,
    goalUnlocked: checkpoint.goalUnlocked ?? false,
    goalUnlockTime: checkpoint.goalUnlockTime ?? null,
    controlShots: Array.isArray(checkpoint.controlShots)
      ? checkpoint.controlShots.map((shot) => ({ angleDeg: shot.angleDeg, power: shot.power }))
      : [],
    heat: checkpoint.heat ?? 0,
  };
}

function cloneBallPlaybackState(ball) {
  if (!ball) {
    return null;
  }

  return {
    position: cloneVec(ball.position),
    velocity: cloneVec(ball.velocity),
    time: ball.time ?? state.level.time ?? 0,
    landingCount: ball.landingCount ?? 0,
    launchGracePlanetIndex: ball.launchGracePlanetIndex ?? null,
    anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
    anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
    anchorSinceTime: ball.anchorSinceTime ?? 0,
    portalCooldown: ball.portalCooldown ?? 0,
    heat: ball.heat ?? 0,
  };
}

function createCurrentCheckpoint() {
  return {
    levelIndex: state.levelIndex,
    levelTime: state.level.time ?? state.ball.time ?? 0,
    position: cloneVec(state.ball.position),
    anchorNormal: cloneVec(state.ball.anchorNormal ?? { x: 1, y: 0 }),
    anchorPlanetIndex: state.ball.anchorPlanetIndex,
    landedPlanetIndex: state.ball.landedPlanetIndex ?? state.ball.anchorPlanetIndex,
    landedPlanetName: state.ball.landedPlanetName || state.level.planets[state.ball.anchorPlanetIndex]?.name || 'launch world',
    landingCount: state.ball.landingCount ?? 0,
    anchorSinceTime: state.ball.anchorSinceTime ?? (state.level.time ?? state.ball.time ?? 0),
    goalUnlocked: state.level.goalUnlocked ?? false,
    goalUnlockTime: state.level.goalUnlockTime ?? null,
    heat: state.ball.heat ?? 0,
    shots: state.shots,
    resets: state.resets,
    score: state.score,
    controlShots: state.controlShots.map((shot) => ({ angleDeg: shot.angleDeg, power: shot.power })),
  };
}

function saveUndoCheckpoint() {
  if (state.ball.anchorPlanetIndex === null || state.ball.anchorPlanetIndex === undefined) {
    return null;
  }

  const checkpoint = createCurrentCheckpoint();

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
    return checkpoint;
  }

  state.undo.checkpoints.push(checkpoint);
  if (state.undo.checkpoints.length > 8) {
    state.undo.checkpoints.shift();
  }
  return checkpoint;
}

function applyCheckpointState(checkpoint) {
  state.level.goalUnlocked = checkpoint.goalUnlocked ?? !state.level.goalUnlockRequired;
  state.level.goalUnlockTime = checkpoint.goalUnlockTime ?? (state.level.goalUnlocked ? checkpoint.levelTime : null);
  setLevelTime(state.level, checkpoint.levelTime);
  rebuildGravityField();
  lastGravityFieldRefreshTime = state.level.time ?? 0;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.time = checkpoint.levelTime;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.turretShot = null;
  state.ball.crashReason = '';
  state.ball.crashKind = '';
  state.ball.crashPlanetIndex = null;
  state.ball.landingCount = checkpoint.landingCount;
  state.ball.launchGracePlanetIndex = null;
  state.ball.anchorPlanetIndex = checkpoint.anchorPlanetIndex;
  state.ball.anchorNormal = cloneVec(checkpoint.anchorNormal);
  state.ball.anchorSinceTime = checkpoint.anchorSinceTime ?? checkpoint.levelTime;
  state.ball.portalCooldown = 0;
  state.ball.heat = checkpoint.heat ?? 0;
  state.ball.landedPlanetIndex = checkpoint.landedPlanetIndex;
  state.ball.landedPlanetName = checkpoint.landedPlanetName;
  syncBallToAnchor(state.level, state.ball);
  setVec(state.ball.crashStartPosition, state.ball.position);
  setVec(state.ball.crashTargetPosition, state.ball.position);
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragStartWorld, state.ball.position);
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
  clearSunShockwaves();
  resetBallRenderState();
  lastGoalTimerFraction = Number.NaN;
  state.currentFlightStartCheckpoint = cloneCheckpoint(checkpoint);
  seedFlightHistoryFromCurrentState();
}

function rewindPastLandingCheckpoint(checkpoint) {
  applyCheckpointState(checkpoint);
  if (shouldClampRewindAtCheckpoint(checkpoint)) {
    clampTimeSpeedToNonNegative();
  }
  state.message = `Time rewound to ${checkpoint.landedPlanetName}.`;
  state.hint = `Shot ${Math.min(checkpoint.landingCount + 1, state.controlShots.length)} is live again.`;
  syncHud();
}

function clearFlightHistoryState() {
  state.currentFlightHistory = [];
  state.currentFlightEvents = [];
  state.currentFlightStartCheckpoint = null;
  state.currentFlightLaunchState = null;
  state.rewindHistory = [];
  state.rewindPlayback.active = false;
  state.rewindPlayback.phase = 'before-launch';
  state.rewindPlayback.flightPrimed = false;
  state.rewindPlayback.consumeHistory = true;
  state.rewindPlayback.checkpoint = null;
  state.rewindPlayback.landingCheckpoint = null;
  state.rewindPlayback.endCheckpoint = null;
  state.rewindPlayback.launchState = null;
  state.rewindPlayback.eventState = null;
  state.rewindPlayback.displayEventState = null;
  state.rewindPlayback.launchPlanetIndex = null;
  state.rewindPlayback.portalEvents = [];
  state.rewindPlayback.portalEventIndex = -1;
}

function captureFlightHistorySample() {
  return {
    position: cloneVec(state.ball.position),
    velocity: cloneVec(state.ball.velocity),
    time: state.ball.time ?? state.level.time ?? 0,
  };
}

function seedFlightHistoryFromCurrentState() {
  state.currentFlightHistory = [captureFlightHistorySample()];
  state.currentFlightEvents = [];
  if (!state.currentFlightStartCheckpoint && state.ball.anchorPlanetIndex !== null && state.ball.anchorPlanetIndex !== undefined) {
    state.currentFlightStartCheckpoint = cloneCheckpoint(createCurrentCheckpoint());
  }
}

function recordPortalFlightEvent(portalEvent) {
  if (!portalEvent) {
    return;
  }

  state.currentFlightEvents.push({
    time: portalEvent.time,
    fromPortalId: portalEvent.fromPortalId,
    toPortalId: portalEvent.toPortalId,
    preState: cloneBallPlaybackState(portalEvent.preState),
    postState: cloneBallPlaybackState(portalEvent.postState),
  });
}

function recordFlightHistorySample() {
  if (state.currentFlightHistory.length === 0) {
    return;
  }

  const sample = captureFlightHistorySample();
  const lastSample = state.currentFlightHistory[state.currentFlightHistory.length - 1];
  if (
    lastSample
    && Math.abs(lastSample.time - sample.time) <= 0.000001
    && pointsMatch(lastSample.position, sample.position, 0.0001)
  ) {
    state.currentFlightHistory[state.currentFlightHistory.length - 1] = sample;
    return;
  }

  state.currentFlightHistory.push(sample);
}

function finalizeFlightHistory(outcome, eventState = null, displayEventState = null) {
  if (state.currentFlightHistory.length === 0) {
    state.currentFlightStartCheckpoint = null;
    state.currentFlightLaunchState = null;
    return;
  }

  recordFlightHistorySample();

  if (outcome === 'landed') {
    const checkpoint = cloneCheckpoint(state.currentFlightStartCheckpoint);
    const landingCheckpoint = cloneCheckpoint(createCurrentCheckpoint());
    const launchState = cloneBallPlaybackState(state.currentFlightLaunchState);
    const eventPlaybackState = cloneBallPlaybackState(eventState);
    const displayPlaybackState = cloneBallPlaybackState(displayEventState ?? eventState);
    if (checkpoint && landingCheckpoint && launchState && eventPlaybackState && displayPlaybackState) {
      state.rewindHistory.push({
        checkpoint,
        landingCheckpoint,
        launchState,
        eventState: eventPlaybackState,
        displayEventState: displayPlaybackState,
        portalEvents: state.currentFlightEvents.map((event) => ({
          ...event,
          preState: cloneBallPlaybackState(event.preState),
          postState: cloneBallPlaybackState(event.postState),
        })),
        launchPlanetIndex: checkpoint.anchorPlanetIndex ?? null,
        landingCount: state.ball.landingCount ?? 0,
        anchorPlanetIndex: state.ball.anchorPlanetIndex,
      });
      if (state.rewindHistory.length > 8) {
        state.rewindHistory.shift();
      }
    }
  }

  state.currentFlightHistory = [];
  state.currentFlightEvents = [];
  state.currentFlightStartCheckpoint = null;
  state.currentFlightLaunchState = null;
}

function canStartLandingRewindPlayback() {
  const rewind = state.rewindHistory[state.rewindHistory.length - 1] ?? null;
  return Boolean(
    rewind
    && rewind.checkpoint
    && rewind.landingCheckpoint
    && rewind.launchState
    && rewind.eventState
    && (
      matchesLandingPlaybackAnchor(rewind)
      || matchesLaunchPlaybackAnchor(rewind)
    ),
  );
}

function applyPlaybackBallState(ballState) {
  setLevelTime(state.level, ballState.time);
  state.ball.time = ballState.time;
  setVec(state.ball.position, ballState.position);
  state.ball.velocity.x = ballState.velocity.x;
  state.ball.velocity.y = ballState.velocity.y;
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.crashReason = '';
  state.ball.crashKind = '';
  state.ball.crashPlanetIndex = null;
  state.ball.landingCount = ballState.landingCount ?? state.ball.landingCount;
  state.ball.anchorPlanetIndex = ballState.anchorPlanetIndex ?? null;
  state.ball.anchorNormal = ballState.anchorNormal ? cloneVec(ballState.anchorNormal) : null;
  state.ball.launchGracePlanetIndex = ballState.launchGracePlanetIndex ?? null;
  state.ball.anchorSinceTime = ballState.anchorSinceTime ?? state.ball.time;
  state.ball.portalCooldown = ballState.portalCooldown ?? 0;
  state.ball.heat = ballState.heat ?? 0;
  state.ball.landedPlanetIndex = null;
  state.ball.landedPlanetName = '';
  if (state.ball.anchorPlanetIndex !== null) {
    syncBallToAnchor(state.level, state.ball);
  }
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragStartWorld, state.ball.position);
  setVec(state.dragPointerWorld, state.ball.position);
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = false;
  state.relayPulse = 0;
  resetBallRenderState();
}

function clearRewindPlaybackState() {
  state.rewindPlayback.active = false;
  state.rewindPlayback.phase = 'before-launch';
  state.rewindPlayback.flightPrimed = false;
  state.rewindPlayback.consumeHistory = true;
  state.rewindPlayback.checkpoint = null;
  state.rewindPlayback.landingCheckpoint = null;
  state.rewindPlayback.endCheckpoint = null;
  state.rewindPlayback.launchState = null;
  state.rewindPlayback.eventState = null;
  state.rewindPlayback.displayEventState = null;
  state.rewindPlayback.launchPlanetIndex = null;
  state.rewindPlayback.portalEvents = [];
  state.rewindPlayback.portalEventIndex = -1;
}

function matchesLandingPlaybackAnchor(rewind) {
  const checkpoint = rewind?.landingCheckpoint;
  if (!checkpoint) {
    return false;
  }

  return (
    checkpoint.anchorPlanetIndex === (state.ball.anchorPlanetIndex ?? null)
    && checkpoint.landingCount === (state.ball.landingCount ?? 0)
    && (state.ball.time ?? 0) >= (checkpoint.levelTime ?? 0) - 0.0001
  );
}

function matchesLaunchPlaybackAnchor(rewind) {
  const checkpoint = rewind?.checkpoint;
  const launchTime = rewind?.launchState?.time ?? checkpoint?.levelTime ?? 0;
  if (!checkpoint) {
    return false;
  }

  return (
    checkpoint.anchorPlanetIndex === (state.ball.anchorPlanetIndex ?? null)
    && checkpoint.landingCount === (state.ball.landingCount ?? 0)
    && (state.ball.time ?? 0) >= (checkpoint.levelTime ?? 0) - 0.0001
    && (state.ball.time ?? 0) <= launchTime + 0.0001
  );
}

function createAnchoredPlaybackState(checkpoint, targetTime) {
  if (!checkpoint) {
    return null;
  }

  const anchoredState = {
    position: cloneVec(checkpoint.position),
    velocity: { x: 0, y: 0 },
    time: checkpoint.levelTime,
    landingCount: checkpoint.landingCount,
    launchGracePlanetIndex: null,
    anchorPlanetIndex: checkpoint.anchorPlanetIndex,
    anchorNormal: cloneVec(checkpoint.anchorNormal),
    anchorSinceTime: checkpoint.anchorSinceTime ?? checkpoint.levelTime,
  };

  setLevelTime(state.level, checkpoint.levelTime);
  syncBallToAnchor(state.level, anchoredState);
  const delta = targetTime - (checkpoint.levelTime ?? 0);
  if (Math.abs(delta) > 0.000001) {
    setLevelTime(state.level, targetTime);
    anchoredState.time = targetTime;
    advanceBallAnchor(state.level, anchoredState, delta);
  }

  return cloneBallPlaybackState(anchoredState);
}

function configureRewindPlayback({
  phase = 'before-launch',
  consumeHistory = true,
  checkpoint = null,
  landingCheckpoint = null,
  endCheckpoint = null,
  launchState = null,
  eventState = null,
  displayEventState = null,
  launchPlanetIndex = null,
  portalEvents = [],
  message = 'Rewinding flight path.',
  hint = 'Rolling back to the prior anchor.',
}) {
  state.currentFlightHistory = [];
  state.currentFlightEvents = [];
  state.currentFlightStartCheckpoint = null;
  state.currentFlightLaunchState = null;
  state.rewindPlayback.active = true;
  state.rewindPlayback.phase = phase;
  state.rewindPlayback.flightPrimed = false;
  state.rewindPlayback.consumeHistory = consumeHistory;
  state.rewindPlayback.checkpoint = cloneCheckpoint(checkpoint);
  state.rewindPlayback.landingCheckpoint = cloneCheckpoint(landingCheckpoint);
  state.rewindPlayback.endCheckpoint = cloneCheckpoint(endCheckpoint);
  state.rewindPlayback.launchState = cloneBallPlaybackState(launchState);
  state.rewindPlayback.eventState = cloneBallPlaybackState(eventState);
  state.rewindPlayback.displayEventState = cloneBallPlaybackState(displayEventState ?? eventState);
  state.rewindPlayback.launchPlanetIndex = launchPlanetIndex ?? null;
  state.rewindPlayback.portalEvents = portalEvents.map((event) => ({
    ...event,
    preState: cloneBallPlaybackState(event.preState),
    postState: cloneBallPlaybackState(event.postState),
  }));
  state.rewindPlayback.portalEventIndex = portalEvents.length - 1;
  state.message = message;
  state.hint = hint;
  syncHud();
  return true;
}

function startLandingRewindPlayback() {
  if (!canStartLandingRewindPlayback()) {
    return false;
  }

  const rewind = state.rewindHistory[state.rewindHistory.length - 1];
  const currentCheckpoint = cloneCheckpoint(createCurrentCheckpoint());
  return configureRewindPlayback({
    phase: matchesLandingPlaybackAnchor(rewind) ? 'after-landing' : 'before-launch',
    consumeHistory: true,
    checkpoint: rewind.checkpoint,
    landingCheckpoint: rewind.landingCheckpoint,
    endCheckpoint: currentCheckpoint,
    launchState: rewind.launchState,
    eventState: rewind.eventState,
    displayEventState: rewind.displayEventState ?? rewind.eventState,
    launchPlanetIndex: rewind.launchPlanetIndex ?? null,
    portalEvents: rewind.portalEvents ?? [],
    message: 'Rewinding flight path.',
    hint: `Rolling back from ${state.level.planets[rewind.anchorPlanetIndex]?.name ?? 'relay world'} to the prior anchor.`,
  });
}

function completeCheckpointRewind(checkpoint) {
  if (state.undo.active) {
    finishUndo(checkpoint);
    return;
  }

  rewindPastLandingCheckpoint(checkpoint);
}

function updateLandingRewindPlayback(speedOverride = null) {
  if (!state.rewindPlayback.active) {
    return false;
  }

  const timeSpeed = speedOverride ?? getTimeSpeedValue();
  if (timeSpeed === 0) {
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    return true;
  }

  const stepCount = Math.max(1, Math.round(Math.abs(timeSpeed)));
  if (timeSpeed < 0) {
    for (let step = 0; step < stepCount; step += 1) {
      if (state.rewindPlayback.phase === 'after-landing') {
        const landingTime = state.rewindPlayback.landingCheckpoint?.levelTime ?? 0;
        const currentTime = state.ball.time ?? 0;
        if (currentTime - PHYSICS_STEP <= landingTime + 0.0001) {
          applyPlaybackBallState(state.rewindPlayback.displayEventState ?? state.rewindPlayback.eventState);
          state.rewindPlayback.phase = 'flight';
          state.rewindPlayback.flightPrimed = true;
          continue;
        }

        const nextTime = Math.max(landingTime, currentTime - PHYSICS_STEP);
        const appliedDelta = nextTime - currentTime;
        setLevelTime(state.level, nextTime);
        state.ball.time = nextTime;
        advanceBallAnchor(state.level, state.ball, appliedDelta);
        state.ball.velocity.x = 0;
        state.ball.velocity.y = 0;
        continue;
      }

      if (state.rewindPlayback.phase === 'flight') {
        if (state.rewindPlayback.flightPrimed) {
          applyPlaybackBallState(state.rewindPlayback.eventState);
          state.rewindPlayback.flightPrimed = false;
        }
        const reversePortalEvent = [...(state.rewindPlayback.portalEvents ?? [])]
          .reverse()
          .find((event) => (state.ball.time ?? 0) - PHYSICS_STEP <= event.time + 0.0001 && (state.ball.time ?? 0) > event.time + 0.0001);
        if (reversePortalEvent) {
          applyPlaybackBallState(reversePortalEvent.preState);
          continue;
        }
        const launchTime = state.rewindPlayback.launchState?.time ?? 0;
        if ((state.ball.time ?? 0) - PHYSICS_STEP <= launchTime + 0.0001) {
          const launchCheckpoint = createAnchoredPlaybackState(
            state.rewindPlayback.checkpoint,
            launchTime,
          );
          if (launchCheckpoint) {
            applyPlaybackBallState(launchCheckpoint);
          }
          state.rewindPlayback.phase = 'before-launch';
          continue;
        }

        reverseStepBall(state.level, state.ball, PHYSICS_STEP, {
          launchPlanetIndex: state.rewindPlayback.launchPlanetIndex,
        });
        continue;
      }

      const checkpoint = state.rewindPlayback.checkpoint;
      const checkpointTime = checkpoint?.levelTime ?? 0;
      const currentTime = state.ball.time ?? 0;
      if (currentTime - PHYSICS_STEP <= checkpointTime + 0.0001) {
        const consumeHistory = state.rewindPlayback.consumeHistory;
        state.currentFlightHistory = [];
        state.currentFlightStartCheckpoint = null;
        state.currentFlightLaunchState = null;
        clearRewindPlaybackState();
        if (consumeHistory) {
          state.rewindHistory.pop();
        }
        if (checkpoint) {
          completeCheckpointRewind(checkpoint);
        }
        return true;
      }

      const nextTime = Math.max(checkpointTime, currentTime - PHYSICS_STEP);
      const appliedDelta = nextTime - currentTime;
      setLevelTime(state.level, nextTime);
      state.ball.time = nextTime;
      advanceBallAnchor(state.level, state.ball, appliedDelta);
      state.ball.velocity.x = 0;
      state.ball.velocity.y = 0;
    }
    return true;
  }

  for (let step = 0; step < stepCount; step += 1) {
    if (state.rewindPlayback.phase === 'before-launch') {
      const launchTime = state.rewindPlayback.launchState?.time ?? 0;
      const currentTime = state.ball.time ?? 0;
      if (currentTime + PHYSICS_STEP >= launchTime - 0.0001) {
        applyPlaybackBallState(state.rewindPlayback.launchState);
        state.rewindPlayback.phase = 'flight';
        continue;
      }

      const nextTime = Math.min(launchTime, currentTime + PHYSICS_STEP);
      const appliedDelta = nextTime - currentTime;
      setLevelTime(state.level, nextTime);
      state.ball.time = nextTime;
      advanceBallAnchor(state.level, state.ball, appliedDelta);
      state.ball.velocity.x = 0;
      state.ball.velocity.y = 0;
      continue;
    }

    if (state.rewindPlayback.phase === 'flight') {
      if (state.rewindPlayback.flightPrimed) {
        if (state.rewindPlayback.landingCheckpoint) {
          applyCheckpointState(state.rewindPlayback.landingCheckpoint);
        }
        state.rewindPlayback.flightPrimed = false;
        state.rewindPlayback.phase = 'after-landing';
        continue;
      }
      const forwardPortalEvent = (state.rewindPlayback.portalEvents ?? [])
        .find((event) => (state.ball.time ?? 0) + PHYSICS_STEP >= event.time - 0.0001 && (state.ball.time ?? 0) < event.time - 0.0001);
      if (forwardPortalEvent) {
        applyPlaybackBallState(forwardPortalEvent.postState);
        continue;
      }
      const eventTime = state.rewindPlayback.eventState?.time ?? 0;
      if ((state.ball.time ?? 0) + PHYSICS_STEP >= eventTime - 0.0001) {
        if (state.rewindPlayback.landingCheckpoint) {
          applyCheckpointState(state.rewindPlayback.landingCheckpoint);
        }
        state.rewindPlayback.flightPrimed = false;
        state.rewindPlayback.phase = 'after-landing';
        continue;
      }

      const result = stepBall(state.level, state.ball, PHYSICS_STEP);
      if (result.type !== 'flying') {
        if (state.rewindPlayback.landingCheckpoint) {
          applyCheckpointState(state.rewindPlayback.landingCheckpoint);
        }
        state.rewindPlayback.flightPrimed = false;
        state.rewindPlayback.phase = 'after-landing';
        continue;
      }
      continue;
    }

    const endCheckpoint = state.rewindPlayback.endCheckpoint ?? state.rewindPlayback.landingCheckpoint;
    const endTime = endCheckpoint?.levelTime ?? (state.ball.time ?? 0);
    const currentTime = state.ball.time ?? 0;
    if (currentTime + PHYSICS_STEP >= endTime - 0.0001) {
      state.currentFlightHistory = [];
      state.currentFlightStartCheckpoint = null;
      state.currentFlightLaunchState = null;
      clearRewindPlaybackState();
      if (endCheckpoint) {
        applyCheckpointState(endCheckpoint);
        state.message = `Returned to ${endCheckpoint.landedPlanetName}.`;
        state.hint = `Shot ${Math.min(endCheckpoint.landingCount + 1, state.controlShots.length)} is live again.`;
        syncHud();
      }
      return true;
    }

    const nextTime = Math.min(endTime, currentTime + PHYSICS_STEP);
    const appliedDelta = nextTime - currentTime;
    setLevelTime(state.level, nextTime);
    state.ball.time = nextTime;
    advanceBallAnchor(state.level, state.ball, appliedDelta);
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
  }
  return true;
}

function finishUndo(checkpoint = state.undo.checkpoint) {
  if (!checkpoint) {
    state.undo.active = false;
    return;
  }

  applyCheckpointState(checkpoint);
  state.undo.active = false;
  state.undo.checkpoint = null;
  state.undo.fromPosition = null;
  state.undo.toPosition = null;
  state.undo.duration = 0;
  state.undo.elapsed = 0;
  state.message = `Undo restored ${checkpoint.landedPlanetName}.`;
  state.hint = `Shot ${Math.min(checkpoint.landingCount + 1, state.controlShots.length)} is live again.`;
  syncHud();
}

function startUndo() {
  if (state.gameOver.open) {
    state.timeSpeedIndex = state.resumeTimeSpeedIndex;
  }
  hideGameOverModal();
  let started = false;
  const rewind = state.rewindHistory[state.rewindHistory.length - 1] ?? null;

  if (rewind && (matchesLandingPlaybackAnchor(rewind) || matchesLaunchPlaybackAnchor(rewind))) {
    started = configureRewindPlayback({
      phase: matchesLandingPlaybackAnchor(rewind) ? 'after-landing' : 'before-launch',
      consumeHistory: true,
      checkpoint: rewind.checkpoint,
      landingCheckpoint: rewind.landingCheckpoint,
      endCheckpoint: createCurrentCheckpoint(),
      launchState: rewind.launchState,
      eventState: rewind.eventState,
      displayEventState: rewind.displayEventState ?? rewind.eventState,
      launchPlanetIndex: rewind.launchPlanetIndex ?? null,
      portalEvents: rewind.portalEvents ?? [],
      message: 'Undo rewinding.',
      hint: `Rolling back to ${rewind.checkpoint?.landedPlanetName ?? 'the prior anchor'}.`,
    });
    state.undo.checkpoint = cloneCheckpoint(rewind.checkpoint);
  } else if (state.currentFlightLaunchState && state.currentFlightStartCheckpoint) {
    started = configureRewindPlayback({
      phase: 'flight',
      consumeHistory: false,
      checkpoint: state.currentFlightStartCheckpoint,
      landingCheckpoint: null,
      endCheckpoint: null,
      launchState: state.currentFlightLaunchState,
      eventState: state.ball,
      displayEventState: state.ball,
      launchPlanetIndex: state.currentFlightStartCheckpoint.anchorPlanetIndex ?? null,
      portalEvents: state.currentFlightEvents,
      message: 'Undo rewinding.',
      hint: `Rolling back to ${state.currentFlightStartCheckpoint.landedPlanetName}.`,
    });
    state.undo.checkpoint = cloneCheckpoint(state.currentFlightStartCheckpoint);
  } else if (state.currentFlightStartCheckpoint && !checkpointMatchesCurrent(state.currentFlightStartCheckpoint)) {
    started = configureRewindPlayback({
      phase: 'before-launch',
      consumeHistory: false,
      checkpoint: state.currentFlightStartCheckpoint,
      landingCheckpoint: null,
      endCheckpoint: null,
      launchState: cloneBallPlaybackState(state.ball),
      eventState: cloneBallPlaybackState(state.ball),
      displayEventState: cloneBallPlaybackState(state.ball),
      launchPlanetIndex: state.currentFlightStartCheckpoint.anchorPlanetIndex ?? null,
      message: 'Undo rewinding.',
      hint: `Rolling back to ${state.currentFlightStartCheckpoint.landedPlanetName}.`,
    });
    state.undo.checkpoint = cloneCheckpoint(state.currentFlightStartCheckpoint);
  } else {
    const checkpoint = getLatestUndoCheckpoint();
    if (!checkpoint || checkpointMatchesCurrent(checkpoint)) {
      return;
    }
    started = configureRewindPlayback({
      phase: 'before-launch',
      consumeHistory: false,
      checkpoint,
      landingCheckpoint: null,
      endCheckpoint: null,
      launchState: cloneBallPlaybackState(state.ball),
      eventState: cloneBallPlaybackState(state.ball),
      displayEventState: cloneBallPlaybackState(state.ball),
      launchPlanetIndex: checkpoint.anchorPlanetIndex ?? null,
      message: 'Undo rewinding.',
      hint: `Rolling back to ${checkpoint.landedPlanetName}.`,
    });
    state.undo.checkpoint = cloneCheckpoint(checkpoint);
  }

  if (!started) {
    return;
  }

  state.undo.active = true;
  state.undo.fromPosition = null;
  state.undo.toPosition = null;
  state.undo.duration = 0;
  state.undo.elapsed = 0;

  stopAdminReplay();
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = false;
  state.relayPulse = 0;
  resetBallTrace();
  state.turretShot = null;
  clearSunShockwaves();
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

function projectBallTraceReverseAnchor(anticipation) {
  if (anticipation <= 0.000001) {
    return cloneVec(state.ball.position);
  }

  const tempLevel = createLevelRuntime(state.levelIndex);
  const tempBall = cloneBallPlaybackState(state.ball);
  if (!tempBall) {
    return cloneVec(state.ball.position);
  }

  setLevelTime(tempLevel, tempBall.time);
  let remaining = anticipation;
  const launchPlanetIndex = state.rewindPlayback.launchPlanetIndex
    ?? state.currentFlightStartCheckpoint?.anchorPlanetIndex
    ?? null;

  while (remaining > 0.000001) {
    const step = Math.min(PHYSICS_STEP, remaining);
    reverseStepBall(tempLevel, tempBall, step, { launchPlanetIndex });
    remaining -= step;
  }

  return cloneVec(tempBall.position);
}

function spawnBallTraceParticle(speed, trailDirection, lateral, reverse = false) {
  const particle = state.ballTraceParticles[state.ballTraceCursor];
  state.ballTraceCursor = (state.ballTraceCursor + 1) % state.ballTraceParticles.length;

  const spread = (Math.random() - 0.5) * 0.22;
  const retreat = 0.1 + Math.random() * 0.26;
  const life = BALL_TRACE_PARTICLE_LIFETIME * (0.8 + Math.min(0.5, speed * 0.03));
  const virtualDriftSpeed = 0.22 + speed * 0.026;
  const anticipation = reverse
    ? Math.max(PHYSICS_STEP * 2, Math.random() * life)
    : 0;
  const anchor = reverse
    ? projectBallTraceReverseAnchor(anticipation)
    : state.ball.position;
  particle.active = true;
  particle.vx = 0;
  particle.vy = 0;
  particle.trailX = trailDirection.x;
  particle.trailY = trailDirection.y;
  particle.trailSpeed = virtualDriftSpeed;
  particle.life = life;
  particle.x = anchor.x + trailDirection.x * retreat + lateral.x * spread;
  particle.y = anchor.y + trailDirection.y * retreat + lateral.y * spread;
  particle.age = reverse ? anticipation : 0;
}

function updateBallTrace(delta) {
  const rewinding = state.undo.active || (state.rewindPlayback.active && getTimeSpeedValue() < 0);
  const traceDelta = rewinding ? -delta : delta;
  const speed = length(state.ball.velocity);
  const freeFlight = (
    state.ball.anchorPlanetIndex === null
    && !state.ball.goaling
    && !state.ball.crashed
    && speed > 0.4
  );

  if (freeFlight) {
    const velocityDirection = normalize(state.ball.velocity);
    const trailDirection = { x: -velocityDirection.x, y: -velocityDirection.y };
    const lateral = { x: -trailDirection.y, y: trailDirection.x };
    const emitRate = 42 + Math.min(88, speed * 11.5);
    state.ballTraceCarry += Math.abs(traceDelta) * emitRate;
    while (state.ballTraceCarry >= 1) {
      spawnBallTraceParticle(speed, trailDirection, lateral, rewinding);
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

    particle.age += traceDelta;
    if (particle.age >= particle.life || particle.age <= 0) {
      particle.active = false;
      ballTraceColors[colorOffset] = 0;
      ballTraceColors[colorOffset + 1] = 0;
      ballTraceColors[colorOffset + 2] = 0;
      ballTracePositions[positionOffset] = particle.x;
      ballTracePositions[positionOffset + 1] = -10;
      ballTracePositions[positionOffset + 2] = particle.y;
      ballTraceStreakColors[streakOffset] = 0;
      ballTraceStreakColors[streakOffset + 1] = 0;
      ballTraceStreakColors[streakOffset + 2] = 0;
      ballTraceStreakColors[streakOffset + 3] = 0;
      ballTraceStreakColors[streakOffset + 4] = 0;
      ballTraceStreakColors[streakOffset + 5] = 0;
      ballTraceStreakPositions[streakOffset] = particle.x;
      ballTraceStreakPositions[streakOffset + 1] = -10;
      ballTraceStreakPositions[streakOffset + 2] = particle.y;
      ballTraceStreakPositions[streakOffset + 3] = particle.x;
      ballTraceStreakPositions[streakOffset + 4] = -10;
      ballTraceStreakPositions[streakOffset + 5] = particle.y;
      continue;
    }

    const lifeT = 1 - particle.age / particle.life;
    ballTracePositions[positionOffset] = particle.x;
    ballTracePositions[positionOffset + 1] = 0.08 + (1 - lifeT) * 0.06;
    ballTracePositions[positionOffset + 2] = particle.y;
    const directionX = particle.trailX;
    const directionY = particle.trailY;
    const streakLength = (0.18 + particle.trailSpeed * 0.32) * (0.35 + lifeT * 0.65);
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
    power: clamp(shot.power, CONTROL_MIN_POWER, MAX_DRAG_DISTANCE),
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

function getIceSlideVisualSpeed(planet, ball = state.ball) {
  return getPlanetSlideAngularSpeed(planet, ball);
}

function getAnchoredLavaPlanet(ball = state.ball) {
  if (ball.anchorPlanetIndex === null || ball.anchorPlanetIndex === undefined) {
    return null;
  }
  const planet = state.level.planets[ball.anchorPlanetIndex];
  if (!planet || planet.surfaceType !== 'lava') {
    return null;
  }
  return planet;
}

function getLavaOverheatRemainingText(planet, ball = state.ball) {
  return getLavaOverheatRemaining(planet, ball).toFixed(1);
}

function getIceSlideElapsed(planet, ball = state.ball) {
  if (!planet || planet.surfaceType !== 'ice' || !planet.slideAngularSpeed) {
    return 0;
  }
  const anchorSinceTime = ball?.anchorSinceTime ?? ball?.time ?? 0;
  const currentTime = ball?.time ?? anchorSinceTime;
  return Math.max(0, currentTime - anchorSinceTime);
}

function getIceLaunchLockRemaining(planet, ball = state.ball) {
  if (!planet || planet.surfaceType !== 'ice' || !planet.slideAngularSpeed) {
    return 0;
  }
  if ((ball?.landingCount ?? 0) <= 0) {
    return 0;
  }
  const settleSeconds = Math.max(0.25, planet.slideSettleSeconds ?? 4);
  const lockSeconds = Math.min(settleSeconds * 0.3, Math.max(0.45, planet.slideLaunchLockSeconds ?? 1));
  return Math.max(0, lockSeconds - getIceSlideElapsed(planet, ball));
}

function getAnchoredIcePlanet(ball = state.ball) {
  if (ball.anchorPlanetIndex === null || ball.anchorPlanetIndex === undefined) {
    return null;
  }
  const planet = state.level.planets[ball.anchorPlanetIndex];
  if (!planet || planet.surfaceType !== 'ice' || !planet.slideAngularSpeed) {
    return null;
  }
  return planet;
}

function isLaunchLockedByIce(ball = state.ball) {
  const planet = getAnchoredIcePlanet(ball);
  return Boolean(planet) && getIceLaunchLockRemaining(planet, ball) > 0.0001;
}

function getHeatStatusText() {
  const lavaPlanet = getAnchoredLavaPlanet();
  if (lavaPlanet) {
    return `Lava ${getLavaOverheatRemainingText(lavaPlanet)}s`;
  }

  const heatRatio = getBallHeatRatio(state.ball);
  if (heatRatio > 0.08) {
    return `Heat ${Math.round(heatRatio * 100)}%`;
  }

  return 'Heat stable';
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

function rgbaFromColor(color, alpha) {
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`;
}

function createDustCloudSeed(cloud, index = 0, salt = 0) {
  const x = Math.round((cloud.position.x + 20) * 1000);
  const y = Math.round((cloud.position.y + 20) * 1000);
  const radius = Math.round((cloud.radius ?? 1) * 1000);
  return ((x * 73856093) ^ (y * 19349663) ^ (radius * 83492791) ^ (index * 2654435761) ^ salt) >>> 0;
}

function drawDustGradientEllipse(ctx, x, y, rx, ry, rotation, innerColor, outerColor, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(rx, ry);
  const gradient = ctx.createRadialGradient(0, 0, 0.02, 0, 0, 1);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.42, innerColor);
  gradient.addColorStop(1, outerColor);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function createDustCloudTexture(cloud, index = 0, variant = 'body') {
  const key = [
    cloud.id ?? index,
    cloud.position.x.toFixed(3),
    cloud.position.y.toFixed(3),
    (cloud.radius ?? 1).toFixed(3),
    (cloud.drag ?? 0).toFixed(3),
    variant,
  ].join(':');

  if (dustCloudTextureCache.has(key)) {
    return dustCloudTextureCache.get(key);
  }

  const texture = createCanvasTexture(512, 512, (ctx, width, height) => {
    const random = createSeededRandom(createDustCloudSeed(cloud, index, variant === 'filament' ? 71 : 37));
    const centerX = width * (0.48 + (random() - 0.5) * 0.06);
    const centerY = height * (0.52 + (random() - 0.5) * 0.06);
    const warm = new THREE.Color(0xd6a06d).lerp(new THREE.Color(0xffd3a3), random() * 0.35);
    const cool = new THREE.Color(0x65c7ff).lerp(new THREE.Color(0xd7f2ff), random() * 0.24);
    const rose = new THREE.Color(0xff7f9f).lerp(new THREE.Color(0xc28aff), random() * 0.32);
    const deep = new THREE.Color(0x1a2240).lerp(new THREE.Color(0x4b2f62), random() * 0.35);
    const accents = [warm, cool, rose];

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    drawDustGradientEllipse(
      ctx,
      centerX,
      centerY,
      width * 0.42,
      height * 0.26,
      -0.35 + random() * 0.7,
      rgbaFromColor(deep, variant === 'filament' ? 0.24 : 0.36),
      rgbaFromColor(deep, 0),
      1,
    );

    for (let i = 0; i < 30; i += 1) {
      const angle = random() * Math.PI * 2;
      const distance = Math.pow(random(), 0.68) * width * 0.26;
      const color = accents[i % accents.length].clone().lerp(deep, random() * 0.32);
      const alpha = variant === 'filament'
        ? 0.06 + random() * 0.12
        : 0.09 + random() * 0.15;
      drawDustGradientEllipse(
        ctx,
        centerX + Math.cos(angle) * distance,
        centerY + Math.sin(angle) * distance * 0.78,
        width * (0.14 + random() * 0.22),
        height * (0.045 + random() * 0.11),
        angle + (random() - 0.5) * 1.8,
        rgbaFromColor(color, alpha),
        rgbaFromColor(color, 0),
        1,
      );
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 34; i += 1) {
      const angle = -0.55 + random() * 1.1 + (i % 2 === 0 ? Math.PI : 0);
      const startDistance = width * (0.06 + random() * 0.18);
      const endDistance = width * (0.24 + random() * 0.18);
      const startX = centerX + Math.cos(angle) * startDistance;
      const startY = centerY + Math.sin(angle) * startDistance * 0.54;
      const endX = centerX + Math.cos(angle + (random() - 0.5) * 0.5) * endDistance;
      const endY = centerY + Math.sin(angle + (random() - 0.5) * 0.7) * endDistance * 0.58;
      const color = accents[Math.floor(random() * accents.length)];
      ctx.strokeStyle = rgbaFromColor(color, variant === 'filament' ? 0.2 : 0.11);
      ctx.lineWidth = width * (0.006 + random() * 0.016);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        centerX + (random() - 0.5) * width * 0.48,
        centerY + (random() - 0.5) * height * 0.24,
        centerX + (random() - 0.5) * width * 0.48,
        centerY + (random() - 0.5) * height * 0.24,
        endX,
        endY,
      );
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 52; i += 1) {
      const angle = random() * Math.PI * 2;
      const distance = Math.pow(random(), 0.8) * width * 0.38;
      const cutRadius = width * (0.012 + random() * 0.035);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, cutRadius);
      ctx.save();
      ctx.translate(centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance * 0.72);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, cutRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 90; i += 1) {
      const angle = random() * Math.PI * 2;
      const distance = Math.pow(random(), 0.55) * width * 0.42;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance * 0.7;
      ctx.fillStyle = random() > 0.65
        ? rgbaFromColor(cool, 0.25 + random() * 0.35)
        : rgbaFromColor(warm, 0.16 + random() * 0.28);
      ctx.beginPath();
      ctx.arc(x, y, 0.45 + random() * 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  dustCloudTextureCache.set(key, texture);
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
  if (planet.surfaceType === 'ice') {
    return 'ice';
  }
  if (planet.surfaceType === 'lava') {
    return 'lava';
  }
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

    if (biome === 'ice') {
      deepColor = new THREE.Color(0x89c9ee);
      midColor = new THREE.Color(0xb9ebff);
      accentColor = new THREE.Color(0xe5fbff);
      brightColor = new THREE.Color(0xf8ffff);
    } else if (biome === 'lava') {
      deepColor = new THREE.Color(0x2b0703);
      midColor = new THREE.Color(0x7a1f10);
      accentColor = new THREE.Color(0xff6a2f);
      brightColor = new THREE.Color(0xffd48a);
    } else if (biome === 'oceanic') {
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

    if (biome === 'ice') {
      const iceGlow = ctx.createRadialGradient(
        width * 0.48,
        height * 0.46,
        width * 0.04,
        width * 0.5,
        height * 0.5,
        width * 0.56,
      );
      iceGlow.addColorStop(0, 'rgba(255, 255, 255, 0.58)');
      iceGlow.addColorStop(0.42, 'rgba(232, 248, 255, 0.2)');
      iceGlow.addColorStop(1, 'rgba(232, 248, 255, 0)');
      ctx.save();
      ctx.fillStyle = iceGlow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      for (let index = 0; index < 28; index += 1) {
        const bandY = random() * height;
        const bandHeight = height * (0.01 + random() * 0.03);
        const frostBand = ctx.createLinearGradient(0, bandY, width, bandY + bandHeight);
        frostBand.addColorStop(0, colorHex(mixColors(midColor, deepColor, 0.18 + random() * 0.22)));
        frostBand.addColorStop(0.52, colorHex(mixColors(accentColor, brightColor, 0.58 + random() * 0.25)));
        frostBand.addColorStop(1, colorHex(mixColors(midColor, deepColor, 0.18 + random() * 0.22)));
        ctx.save();
        ctx.globalAlpha = 0.18 + random() * 0.16;
        ctx.fillStyle = frostBand;
        ctx.fillRect(0, bandY, width, bandHeight);
        ctx.restore();
      }

      const crackNodes = Array.from({ length: 12 }, () => ({
        x: width * (0.16 + random() * 0.68),
        y: height * (0.16 + random() * 0.68),
      }));
      crackNodes.forEach((node, index) => {
        const next = crackNodes[(index + 1 + Math.floor(random() * 3)) % crackNodes.length];
        ctx.save();
        ctx.strokeStyle = colorHex(mixColors(new THREE.Color(0xf4fdff), new THREE.Color(0x8fd9ff), 0.42 + random() * 0.26));
        ctx.globalAlpha = 0.34 + random() * 0.16;
        ctx.lineWidth = 2.4 + random() * 2.2;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        const controlX = (node.x + next.x) * 0.5 + (random() - 0.5) * width * 0.08;
        const controlY = (node.y + next.y) * 0.5 + (random() - 0.5) * height * 0.08;
        ctx.quadraticCurveTo(controlX, controlY, next.x, next.y);
        ctx.stroke();
        ctx.restore();
      });

      for (let index = 0; index < 16; index += 1) {
        const centerX = width * (0.22 + random() * 0.56);
        const centerY = height * (0.22 + random() * 0.56);
        ctx.save();
        ctx.globalAlpha = 0.08 + random() * 0.1;
        ctx.strokeStyle = colorHex(mixColors(new THREE.Color(0xffffff), accentColor, 0.45));
        ctx.lineWidth = 5 + random() * 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, width * (0.025 + random() * 0.055), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      for (let index = 0; index < 18; index += 1) {
        drawEllipse(
          ctx,
          random() * width,
          random() * height,
          width * (0.03 + random() * 0.075),
          height * (0.012 + random() * 0.028),
          random() * Math.PI,
          colorHex(brightColor),
          0.14 + random() * 0.16,
        );
      }
    } else if (biome === 'lava') {
      const crustColor = mixColors(deepColor, new THREE.Color(0x130807), 0.5);
      const crustHighlight = mixColors(new THREE.Color(0x7a7070), crustColor, 0.38);
      const seamCore = mixColors(accentColor, brightColor, 0.76);
      const seamGlow = mixColors(accentColor, brightColor, 0.36);
      const cols = 4;
      const rows = 3;
      const jitterX = width * 0.08;
      const jitterY = height * 0.1;
      const plates = [];

      ctx.fillStyle = colorHex(mixColors(seamGlow, brightColor, 0.18));
      ctx.fillRect(0, 0, width, height);

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const left = (col / cols) * width + (random() - 0.5) * jitterX;
          const right = ((col + 1) / cols) * width + (random() - 0.5) * jitterX;
          const top = (row / rows) * height + (random() - 0.5) * jitterY;
          const bottom = ((row + 1) / rows) * height + (random() - 0.5) * jitterY;
          const centerX = (left + right) * 0.5;
          const centerY = (top + bottom) * 0.5;
          plates.push({
            centerX,
            centerY,
            points: [
              { x: left + (random() - 0.5) * width * 0.03, y: top + height * (0.05 + random() * 0.08) },
              { x: left + width * (0.05 + random() * 0.06), y: top + (random() - 0.5) * height * 0.03 },
              { x: right - width * (0.06 + random() * 0.08), y: top + (random() - 0.5) * height * 0.03 },
              { x: right + (random() - 0.5) * width * 0.03, y: top + height * (0.08 + random() * 0.08) },
              { x: right + (random() - 0.5) * width * 0.03, y: bottom - height * (0.08 + random() * 0.08) },
              { x: right - width * (0.05 + random() * 0.08), y: bottom + (random() - 0.5) * height * 0.03 },
              { x: left + width * (0.06 + random() * 0.08), y: bottom + (random() - 0.5) * height * 0.03 },
              { x: left + (random() - 0.5) * width * 0.03, y: bottom - height * (0.05 + random() * 0.08) },
            ],
          });
        }
      }

      plates.forEach((plate) => {
        ctx.save();
        ctx.beginPath();
        plate.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        ctx.fillStyle = colorHex(seamGlow);
        ctx.globalAlpha = 0.72;
        ctx.fill();
        ctx.restore();
      });

      plates.forEach((plate) => {
        ctx.save();
        ctx.beginPath();
        plate.points.forEach((point, index) => {
          const insetX = plate.centerX + (point.x - plate.centerX) * 0.9;
          const insetY = plate.centerY + (point.y - plate.centerY) * 0.9;
          if (index === 0) {
            ctx.moveTo(insetX, insetY);
          } else {
            ctx.lineTo(insetX, insetY);
          }
        });
        ctx.closePath();
        ctx.fillStyle = colorHex(crustColor);
        ctx.globalAlpha = 0.98;
        ctx.fill();
        ctx.clip();

        const plateShade = ctx.createLinearGradient(
          plate.centerX - width * 0.08,
          plate.centerY - height * 0.1,
          plate.centerX + width * 0.1,
          plate.centerY + height * 0.12,
        );
        plateShade.addColorStop(0, colorHex(crustHighlight));
        plateShade.addColorStop(0.38, colorHex(mixColors(crustColor, new THREE.Color(0x332828), 0.12)));
        plateShade.addColorStop(1, colorHex(mixColors(deepColor, new THREE.Color(0x0e0505), 0.56)));
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = plateShade;
        ctx.fillRect(0, 0, width, height);

        for (let index = 0; index < 2; index += 1) {
          ctx.strokeStyle = colorHex(mixColors(new THREE.Color(0x8b8383), crustColor, 0.54));
          ctx.globalAlpha = 0.22;
          ctx.lineWidth = 1.3 + random() * 1.6;
          ctx.beginPath();
          const startX = plate.centerX + (random() - 0.5) * width * 0.08;
          const startY = plate.centerY + (random() - 0.5) * height * 0.08;
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(
            startX + (random() - 0.5) * width * 0.07,
            startY + (random() - 0.5) * height * 0.05,
            startX + (random() - 0.5) * width * 0.11,
            startY + (random() - 0.5) * height * 0.08,
          );
          ctx.stroke();
        }
        ctx.restore();
      });

      plates.forEach((plate) => {
        ctx.save();
        ctx.beginPath();
        plate.points.forEach((point, index) => {
          const insetX = plate.centerX + (point.x - plate.centerX) * 0.92;
          const insetY = plate.centerY + (point.y - plate.centerY) * 0.92;
          if (index === 0) {
            ctx.moveTo(insetX, insetY);
          } else {
            ctx.lineTo(insetX, insetY);
          }
        });
        ctx.closePath();
        ctx.strokeStyle = colorHex(mixColors(brightColor, new THREE.Color(0xffffff), 0.08));
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      });

      for (let index = 0; index < 10; index += 1) {
        const startX = random() * width;
        const startY = random() * height;
        const endX = startX + (random() - 0.5) * width * 0.16;
        const endY = startY + (random() - 0.5) * height * 0.12;
        ctx.save();
        ctx.strokeStyle = colorHex(seamCore);
        ctx.globalAlpha = 0.18 + random() * 0.12;
        ctx.lineWidth = 3 + random() * 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
          (startX + endX) * 0.5 + (random() - 0.5) * width * 0.03,
          (startY + endY) * 0.5 + (random() - 0.5) * height * 0.03,
          endX,
          endY,
        );
        ctx.stroke();
        ctx.restore();
      }
    } else if (biome === 'oceanic') {
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

    if (biome === 'ice') {
      const iceBloom = ctx.createRadialGradient(width * 0.28, height * 0.24, width * 0.02, width * 0.44, height * 0.34, width * 0.46);
      iceBloom.addColorStop(0, 'rgba(255, 255, 255, 0.52)');
      iceBloom.addColorStop(0.5, 'rgba(228, 250, 255, 0.16)');
      iceBloom.addColorStop(1, 'rgba(228, 250, 255, 0)');
      ctx.save();
      ctx.fillStyle = iceBloom;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else if (biome === 'lava') {
      const lavaBloom = ctx.createRadialGradient(width * 0.42, height * 0.34, width * 0.02, width * 0.5, height * 0.5, width * 0.54);
      lavaBloom.addColorStop(0, 'rgba(255, 236, 184, 0.48)');
      lavaBloom.addColorStop(0.42, 'rgba(255, 141, 66, 0.16)');
      lavaBloom.addColorStop(1, 'rgba(255, 141, 66, 0)');
      ctx.save();
      ctx.fillStyle = lavaBloom;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  });
}

function createGasGiantTexture(planet) {
  return createCanvasTexture(1024, 512, (ctx, width, height) => {
    const random = createSeededRandom(createPlanetSeed(planet, 29));
    const ember = new THREE.Color(0x8f3026);
    const rust = new THREE.Color(0xba4b35);
    const scarlet = new THREE.Color(0xd86647);
    const peach = new THREE.Color(0xf0a06e);
    const cream = new THREE.Color(0xf6d0a0);
    const slate = new THREE.Color(0x5c3750);
    const bands = 18;

    for (let index = 0; index < bands; index += 1) {
      const startY = (height / bands) * index;
      const bandHeight = height / bands + 2;
      const mixAmount = index / Math.max(1, bands - 1);
      const bandColor = mixColors(
        mixColors(ember, rust, 0.32 + random() * 0.18),
        mixColors(peach, scarlet, 0.22 + mixAmount * 0.46),
        0.18 + mixAmount * 0.62,
      );
      bandColor.offsetHSL((random() - 0.5) * 0.02, 0.04 + random() * 0.03, (random() - 0.5) * 0.1);
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
      ctx.strokeStyle = colorHex(mixColors(scarlet, slate, 0.42));
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
        colorHex(mixColors(peach, cream, 0.4 + random() * 0.2)),
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
      colorHex(mixColors(new THREE.Color(0xe5754b), scarlet, 0.24)),
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
    planet.surfaceType ?? 'standard',
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

function getWindowStatusText() {
  if (state.level.redGiant) {
    const progress = getRedGiantProgress(state.level, state.ball.time ?? state.level.time ?? 0);
    return `Red giant ${Math.round(progress * 100)}%`;
  }

  if (isGoalLocked(state.level)) {
    return 'Goal locked';
  }
  const remaining = getGoalRemainingTime(state.level, state.ball.time ?? state.level.time ?? 0);
  if (!Number.isFinite(remaining)) {
    return 'Window open';
  }
  return remaining > 0.05 ? `Window ${remaining.toFixed(1)}s` : 'Window closed';
}

function getRunStatusText() {
  if (state.ball.goaling) {
    return 'Capture sequence';
  }

  if (state.ball.crashed) {
    return 'Retry armed';
  }

  if (state.level.redGiant) {
    return `Shot ${Math.min(getActiveStageIndex() + 1, state.controlShots.length)} · Sun expanding`;
  }

  const lavaPlanet = getAnchoredLavaPlanet();
  if (lavaPlanet) {
    return `Shot ${Math.min(getActiveStageIndex() + 1, state.controlShots.length)} · Overheating ${getLavaOverheatRemainingText(lavaPlanet)}s`;
  }

  if (isLaunchLockedByIce()) {
    return `Shot ${Math.min(getActiveStageIndex() + 1, state.controlShots.length)} · Sliding`;
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

  if (reason === 'pulsar') {
    return `Retry ${state.level.name}. Time the crossing between the paired jets.`;
  }

  if (reason === 'turret') {
    const hostilePlanet = state.ball.crashPlanetIndex !== null && state.ball.crashPlanetIndex !== undefined
      ? state.level.planets[state.ball.crashPlanetIndex]
      : null;
    return `Retry ${state.level.name}. Stay out of ${hostilePlanet?.name ?? 'the hostile planet'} sight line.`;
  }

  if (reason === 'sun') {
    if (state.level.redGiant) {
      return `Retry ${state.level.name}. The red giant expands through the inner lane.`;
    }
    return `Retry ${state.level.name}. Skim the well, don't drop into it.`;
  }

  if (reason === 'asteroid') {
    return `Retry ${state.level.name}. Wait for the belt gap or aim through the open lane.`;
  }

  if (reason === 'meteor') {
    const impactPlanet = state.ball.crashPlanetIndex !== null && state.ball.crashPlanetIndex !== undefined
      ? state.level.planets[state.ball.crashPlanetIndex]
      : null;
    return `Retry ${state.level.name}. Leave ${impactPlanet?.name ?? 'the impact lane'} before the meteor arrives.`;
  }

  if (reason === 'planet-consumed') {
    if (state.level.redGiant) {
      return `Retry ${state.level.name}. Launch before the red giant reaches the planet.`;
    }
    return `Retry ${state.level.name}. Launch before the planet is consumed.`;
  }

  if (reason === 'planet-vanished') {
    const flickerPlanet = state.ball.crashPlanetIndex !== null && state.ball.crashPlanetIndex !== undefined
      ? state.level.planets[state.ball.crashPlanetIndex]
      : null;
    return `Retry ${state.level.name}. Leave ${flickerPlanet?.name ?? 'the flicker planet'} before its countdown empties.`;
  }

  if (reason === 'lava') {
    const lavaPlanet = state.ball.crashPlanetIndex !== null && state.ball.crashPlanetIndex !== undefined
      ? state.level.planets[state.ball.crashPlanetIndex]
      : null;
    return `Retry ${state.level.name}. Leave ${lavaPlanet?.name ?? 'the lava world'} before the ball overheats.`;
  }

  if (reason === 'split-side') {
    return `Retry ${state.level.name}. Touch down on the teal side of split planets.`;
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
  const maxInwardLaunchAngleDeg = 15;
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

function canRetryLevel() {
  return !state.adminReplay.active
    && !state.undo.active
    && !state.rewindPlayback.active
    && !state.ball.goaling
    && !state.goalCloseAnimation.active;
}

function syncPerfOverlay() {
  fpsPanel.hidden = !state.debug.fpsVisible;
  fpsValue.textContent = state.debug.fpsValue > 0 ? String(Math.round(state.debug.fpsValue)) : '--';
}

function formatDebugTuningValue(key, value) {
  if (key === 'starCount') {
    return String(Math.round(value));
  }
  if (key === 'starSize') {
    return value.toFixed(2);
  }
  return value.toFixed(2);
}

function syncDebugTuningPanel() {
  const tuning = state.debug.tuning;

  debugTuningInputs.forEach((input) => {
    const key = input.dataset.debugTuning;
    if (!key || !(key in tuning)) {
      return;
    }
    if (document.activeElement !== input) {
      input.value = String(tuning[key]);
    }
  });

  debugTuningValueNodes.forEach((node) => {
    const key = node.dataset.debugValue;
    if (!key || !(key in tuning)) {
      return;
    }
    node.textContent = formatDebugTuningValue(key, tuning[key]);
  });

  starsMaterial.opacity = tuning.starOpacity;
  starsMaterial.size = tuning.starSize;
  rebuildStarField(tuning.starCount, tuning.starSpread);
}

function shouldAnchorGameOverActionsToHud() {
  return window.matchMedia('(orientation: landscape) and (max-height: 560px)').matches;
}

function syncGameOverActionAnchors() {
  const useAnchors = state.gameOver.open && shouldAnchorGameOverActionsToHud();
  gameOverModal.classList.toggle('has-anchored-actions', useAnchors);

  if (!useAnchors) {
    gameOverModal.style.removeProperty('--game-over-copy-left');
    gameOverModal.style.removeProperty('--game-over-copy-top');
    gameOverModal.style.removeProperty('--game-over-copy-width');
    return;
  }

  const modalRect = gameOverModal.getBoundingClientRect();
  const railRect = actionRow.getBoundingClientRect();
  const railLeft = railRect.left - modalRect.left;
  const railTop = railRect.top - modalRect.top;
  const railBottom = railRect.bottom - modalRect.top;
  const gap = 14;
  const minLeft = 22;
  const availableWidth = Math.max(220, railLeft - minLeft - gap);
  const copyWidth = clamp(availableWidth, 220, 320);
  const copyLeft = Math.max(minLeft, railLeft - gap - copyWidth);
  const copyHeight = gameOverCopy.getBoundingClientRect().height || 140;
  const copyTop = clamp(
    ((railTop + railBottom) * 0.5) - (copyHeight * 0.5),
    18,
    Math.max(18, modalRect.height - copyHeight - 18),
  );

  gameOverModal.style.setProperty('--game-over-copy-left', `${copyLeft}px`);
  gameOverModal.style.setProperty('--game-over-copy-top', `${copyTop}px`);
  gameOverModal.style.setProperty('--game-over-copy-width', `${copyWidth}px`);
}

function syncGameOverModal() {
  const open = state.gameOver.open;
  gameOverTitle.textContent = state.gameOver.title;
  gameOverHint.hidden = true;
  gameOverRetryButton.disabled = !canRetryLevel();
  gameOverUndoButton.disabled = !canRedo();

  if (!open) {
    if (gameOverVisibilityFrame) {
      cancelAnimationFrame(gameOverVisibilityFrame);
      gameOverVisibilityFrame = 0;
    }
    gameOverModal.classList.remove('is-open', 'is-visible');
    gameOverModal.hidden = true;
    syncGameOverActionAnchors();
    return;
  }

  gameOverModal.hidden = false;
  gameOverModal.classList.add('is-open');
  syncGameOverActionAnchors();

  if (gameOverVisibilityFrame) {
    cancelAnimationFrame(gameOverVisibilityFrame);
  }
  gameOverVisibilityFrame = requestAnimationFrame(() => {
    gameOverModal.classList.add('is-visible');
    gameOverVisibilityFrame = 0;
  });
}

function hideGoalCloseAnimation() {
  state.goalCloseAnimation.active = false;
  state.goalCloseAnimation.elapsed = 0;
  state.goalCloseAnimation.hint = '';
  state.goalCloseAnimation.countReset = true;
}

function hideGameOverModal() {
  state.gameOver.open = false;
  state.gameOver.reason = '';
  state.gameOver.title = '';
  state.gameOver.hint = '';
  state.gameOver.countReset = false;
}

function getFailureTitle(reason) {
  if (reason === 'sun') {
    if (state.level.redGiant) {
      return 'Caught by the red giant.';
    }
    return 'Burned in the sun.';
  }

  if (reason === 'pulsar') {
    return 'Caught in the pulsar jet.';
  }

  if (reason === 'turret') {
    return 'Shot down by a turret.';
  }

  if (reason === 'planet-consumed') {
    return 'Consumed by the sun.';
  }

  if (reason === 'planet-vanished') {
    return 'Planet vanished.';
  }

  if (reason === 'asteroid') {
    return 'Shattered on the belt.';
  }

  if (reason === 'meteor') {
    return 'Meteor impact.';
  }

  if (reason === 'goal-closed') {
    return 'Black hole closed.';
  }

  if (reason === 'split-side') {
    return 'Hit the dead side.';
  }

  if (reason === 'planet') {
    return 'Drowned in a gas giant.';
  }

  if (reason === 'lava') {
    return 'Burned on a lava world.';
  }

  return 'Lost in space.';
}

function beginPulsarCrash() {
  beginCrash(
    'Caught in the pulsar jet.',
    describeFailureHint('pulsar'),
    'pulsar',
    null,
    null,
    null,
  );
}

function showGameOverModal(reason, hint, options = {}) {
  state.gameOver.open = true;
  state.gameOver.reason = reason;
  state.gameOver.title = getFailureTitle(reason);
  state.gameOver.hint = hint;
  state.gameOver.countReset = options.countReset !== false;
  if (getTimeSpeedValue() > 0) {
    state.resumeTimeSpeedIndex = state.timeSpeedIndex;
  }
  state.timeSpeedIndex = 1;
  state.message = state.gameOver.title;
  state.hint = hint;
  syncHud();
}

function beginGoalClosure(hint, options = {}) {
  if (state.goalCloseAnimation.active || state.gameOver.open) {
    return;
  }

  stopAdminReplay();
  state.ball.goaling = false;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  state.relayPulse = 0;
  state.goalCloseAnimation.active = true;
  state.goalCloseAnimation.elapsed = 0;
  state.goalCloseAnimation.hint = hint;
  state.goalCloseAnimation.countReset = options.countReset !== false;
  state.message = 'Black hole closing.';
  state.hint = 'Window collapsing.';
  syncHud();
}

function toggleFpsOverlay() {
  state.debug.fpsVisible = !state.debug.fpsVisible;
  persistFpsOverlayPreference(state.debug.fpsVisible);
  if (!state.debug.fpsVisible) {
    state.debug.fpsFrameCount = 0;
    state.debug.fpsElapsed = 0;
  }
  state.message = state.debug.fpsVisible ? 'FPS counter enabled.' : 'FPS counter hidden.';
  state.hint = state.debug.fpsVisible
    ? 'Press Shift+F again to hide the performance overlay.'
    : state.level.summary;
  syncHud();
}

function syncActionButtons() {
  retryButton.disabled = !canRetryLevel();
  undoButton.disabled = !canRedo();
}

function getTimeSpeedValue() {
  return TIME_SPEED_VALUES[state.timeSpeedIndex] ?? 1;
}

function getEffectiveTimeSpeedValue() {
  const requested = getTimeSpeedValue();
  if (requested !== 0) {
    return requested;
  }
  if (!isLaunchLockedByIce()) {
    return 0;
  }
  const resumeValue = TIME_SPEED_VALUES[state.resumeTimeSpeedIndex] ?? 1;
  return resumeValue > 0 ? resumeValue : 1;
}

function formatTimeSpeedValue(value) {
  return `${value}x`;
}

function clampTimeSpeedToNonNegative() {
  if (getTimeSpeedValue() < 0) {
    state.timeSpeedIndex = 1;
  }
}

function shouldClampRewindAtCheckpoint(checkpoint) {
  const startTime = state.level.startTimeSeconds ?? 0;
  return Math.abs((checkpoint?.levelTime ?? startTime) - startTime) <= 0.0001;
}

function canAdjustTimeSpeed() {
  return !state.dragActive
    && !state.adminReplay.active
    && !state.undo.active
    && !state.gameOver.open
    && !state.goalCloseAnimation.active;
}

function syncTimeControl() {
  const value = getTimeSpeedValue();
  timeSpeedSlider.value = String(state.timeSpeedIndex);
  timeSpeedSlider.disabled = !canAdjustTimeSpeed();
  timeSpeedValue.textContent = formatTimeSpeedValue(value);
}

function setControlShot(stageIndex, angleDeg, power) {
  state.controlShots[stageIndex] = clampControlShot({ angleDeg, power });
  syncActionButtons();
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

function clearSunShockwaves() {
  state.sunShockwaves.forEach((shockwave) => {
    shockwave.mesh.geometry.dispose();
    disposeMaterial(shockwave.mesh.material);
    sunShockwaveRoot.remove(shockwave.mesh);
  });
  state.sunShockwaves = [];
}

function clearPlanetExplosions() {
  state.planetExplosions.forEach((explosion) => {
    explosion.group.traverse((node) => {
      node.geometry?.dispose?.();
      disposeMaterial(node.material);
    });
    planetExplosionRoot.remove(explosion.group);
  });
  state.planetExplosions = [];
}

function spawnSunShockwave(strength = 1) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.44, 0.5, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffd27a,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(state.level.sun.x, 0.075, state.level.sun.y);
  mesh.renderOrder = 7;
  sunShockwaveRoot.add(mesh);
  state.sunShockwaves.push({
    mesh,
    age: 0,
    life: 0.72,
    strength: clamp(strength, 0.65, 1.8),
  });
}

function updateSunShockwaves(delta) {
  for (let index = state.sunShockwaves.length - 1; index >= 0; index -= 1) {
    const shockwave = state.sunShockwaves[index];
    shockwave.age += delta;
    const t = clamp(shockwave.age / shockwave.life, 0, 1);
    const ease = t * t * (3 - 2 * t);
    const radius = THREE.MathUtils.lerp(0.5, 3.8 * shockwave.strength, ease);
    shockwave.mesh.scale.setScalar(radius);
    shockwave.mesh.material.opacity = (1 - t) * 0.76;
    shockwave.mesh.position.set(state.level.sun.x, 0.075, state.level.sun.y);

    if (t >= 1) {
      shockwave.mesh.geometry.dispose();
      disposeMaterial(shockwave.mesh.material);
      sunShockwaveRoot.remove(shockwave.mesh);
      state.sunShockwaves.splice(index, 1);
    }
  }
}

function spawnPlanetExplosion(planet) {
  const group = new THREE.Group();
  group.position.set(planet.position.x, 0, planet.position.y);
  group.renderOrder = 13;
  const coreColor = new THREE.Color(planet.core ?? 0xff9a66);
  const glowColor = new THREE.Color(planet.glow ?? 0xffd48a);
  const radius = planet.radius ?? 0.4;

  const flash = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 2.8, 36),
    new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  flash.rotation.x = -Math.PI / 2;
  flash.position.y = 0.34;
  flash.renderOrder = 16;
  group.add(flash);

  const shockwave = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.9, radius * 1.1, 72),
    new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  shockwave.rotation.x = -Math.PI / 2;
  shockwave.position.y = 0.12;
  shockwave.renderOrder = 14;
  group.add(shockwave);

  const dust = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 2.2, 40),
    new THREE.MeshBasicMaterial({
      color: mixColors(coreColor, glowColor, 0.45),
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  dust.rotation.x = -Math.PI / 2;
  dust.position.y = 0.07;
  dust.renderOrder = 12;
  group.add(dust);

  const fragments = [];
  const majorFragmentCount = 8;
  for (let index = 0; index < majorFragmentCount; index += 1) {
    const angle = (index / majorFragmentCount) * Math.PI * 2 + ((planet.index ?? 0) * 0.37);
    const startOffset = radius * (0.18 + (index % 3) * 0.035);
    const speed = radius * (1.7 + (index % 4) * 0.28);
    const size = radius * (0.34 + ((index * 5) % 4) * 0.04);
    const fragment = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({
        color: mixColors(coreColor, glowColor, (index % 3) * 0.22),
        emissive: glowColor,
        emissiveIntensity: 0.68,
        roughness: 0.78,
        metalness: 0.04,
        transparent: true,
        opacity: 0,
      }),
    );
    fragment.scale.set(
      1.2 + (index % 2) * 0.26,
      0.7 + (index % 3) * 0.1,
      0.9 + (index % 4) * 0.08,
    );
    fragment.position.set(
      Math.cos(angle) * startOffset,
      0.22 + index * 0.004,
      Math.sin(angle) * startOffset,
    );
    fragment.rotation.set(index * 0.51, index * 0.93, index * 0.29);
    group.add(fragment);
    fragments.push({
      mesh: fragment,
      direction: { x: Math.cos(angle), y: Math.sin(angle) },
      speed,
      startOffset,
      lift: 0.18 + (index % 3) * 0.05,
      spin: 1.1 + (index % 5) * 0.28,
      emissive: 0.68,
      kind: 'major',
    });
  }

  const minorFragmentCount = 18;
  for (let index = 0; index < minorFragmentCount; index += 1) {
    const angle = (index / minorFragmentCount) * Math.PI * 2 + ((planet.index ?? 0) * 0.19);
    const startOffset = radius * (0.08 + (index % 4) * 0.025);
    const speed = radius * (2.8 + (index % 6) * 0.32);
    const size = radius * (0.09 + ((index * 3) % 5) * 0.015);
    const fragment = new THREE.Mesh(
      new THREE.TetrahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({
        color: mixColors(coreColor, glowColor, 0.3 + (index % 4) * 0.12),
        emissive: glowColor,
        emissiveIntensity: 0.9,
        roughness: 0.7,
        metalness: 0.02,
        transparent: true,
        opacity: 0,
      }),
    );
    fragment.position.set(
      Math.cos(angle) * startOffset,
      0.18 + index * 0.002,
      Math.sin(angle) * startOffset,
    );
    fragment.rotation.set(index * 0.73, index * 0.41, index * 1.07);
    group.add(fragment);
    fragments.push({
      mesh: fragment,
      direction: { x: Math.cos(angle), y: Math.sin(angle) },
      speed,
      startOffset,
      lift: 0.25 + (index % 4) * 0.05,
      spin: 2.2 + (index % 7) * 0.34,
      emissive: 0.9,
      kind: 'minor',
    });
  }

  planetExplosionRoot.add(group);
  state.planetExplosions.push({
    group,
    flash,
    shockwave,
    dust,
    fragments,
    radius,
    age: 0,
    life: METEOR_PLANET_EXPLOSION_SECONDS,
  });
}

function updatePlanetExplosions(delta) {
  for (let index = state.planetExplosions.length - 1; index >= 0; index -= 1) {
    const explosion = state.planetExplosions[index];
    explosion.age += delta;
    const t = clamp(explosion.age / explosion.life, 0, 1);
    const flashT = clamp(t / 0.18, 0, 1);
    const breakStart = METEOR_PLANET_BREAK_DELAY_SECONDS / explosion.life;
    const driftT = clamp((t - breakStart) / Math.max(0.001, 1 - breakStart), 0, 1);
    const burstT = THREE.MathUtils.smootherstep(clamp(driftT / 0.22, 0, 1), 0, 1);
    const fragmentVisible = t >= breakStart;
    const fade = 1 - THREE.MathUtils.smootherstep(clamp((t - 0.62) / 0.38, 0, 1), 0, 1);

    explosion.flash.scale.setScalar(1 + flashT * 1.8);
    explosion.flash.material.opacity = Math.max(0, 0.9 * (1 - flashT));
    explosion.shockwave.scale.setScalar(1 + t * 5.2);
    explosion.shockwave.material.opacity = Math.max(0, 0.68 * (1 - t));
    explosion.dust.scale.setScalar(0.45 + t * 2.1);
    explosion.dust.material.opacity = 0.28 * fade;

    explosion.fragments.forEach((fragment, fragmentIndex) => {
      const travel = fragment.startOffset + fragment.speed * (0.18 * burstT + 0.82 * driftT);
      fragment.mesh.visible = fragmentVisible;
      fragment.mesh.position.x = fragment.direction.x * travel;
      fragment.mesh.position.z = fragment.direction.y * travel;
      fragment.mesh.position.y = (fragment.kind === 'major' ? 0.22 : 0.18) + fragment.lift * Math.sin(Math.PI * driftT);
      fragment.mesh.rotation.x += delta * fragment.spin;
      fragment.mesh.rotation.y += delta * (fragment.spin * 0.72 + fragmentIndex * 0.02);
      fragment.mesh.material.opacity = fragmentVisible ? fade : 0;
      fragment.mesh.material.emissiveIntensity = fragment.emissive * fade;
    });

    if (t >= 1) {
      explosion.group.traverse((node) => {
        node.geometry?.dispose?.();
        disposeMaterial(node.material);
      });
      planetExplosionRoot.remove(explosion.group);
      state.planetExplosions.splice(index, 1);
    }
  }
}

function mixFieldColor(target, intensity, tintWeight, tintR, tintG, tintB) {
  if (intensity < 0.55) {
    target.lerpColors(gravityFieldPalette.low, gravityFieldPalette.mid, intensity / 0.55);
  } else {
    target.lerpColors(gravityFieldPalette.mid, gravityFieldPalette.high, (intensity - 0.55) / 0.45);
  }

  if (tintWeight > 0.000001) {
    gravityFieldTintColor.setRGB(tintR / tintWeight, tintG / tintWeight, tintB / tintWeight);
    target.lerp(gravityFieldTintColor, 0.32);
  }
}

function ensureGravityFieldSamples(columns, rows) {
  if (gravityFieldSamples.length !== rows + 1) {
    gravityFieldSamples = Array.from({ length: rows + 1 }, () => []);
  }

  for (let row = 0; row <= rows; row += 1) {
    const rowSamples = gravityFieldSamples[row];
    if (rowSamples.length !== columns + 1) {
      rowSamples.length = 0;
      for (let column = 0; column <= columns; column += 1) {
        rowSamples.push({
          position: new THREE.Vector3(),
          smoothedPosition: new THREE.Vector3(),
          color: new THREE.Color(),
          baseX: 0,
          baseY: 0,
        });
      }
    }

    for (const sample of rowSamples) {
      sample.smoothedPosition ??= new THREE.Vector3();
      sample.baseX ??= 0;
      sample.baseY ??= 0;
    }
  }

  return gravityFieldSamples;
}

function createGravityFieldSample(baseX, baseY, halfWidth, halfHeight, maxDisplacement, target) {
  let gravityX = 0;
  let gravityY = 0;
  let tintWeight = 0;
  let tintR = 0;
  let tintG = 0;
  let tintB = 0;

  for (const planet of state.level.planets) {
    if (planet.active === false || planet.hidden) {
      continue;
    }

    const deltaX = planet.position.x - baseX;
    const deltaY = planet.position.y - baseY;
    const distanceSq = deltaX * deltaX + deltaY * deltaY;
    const safeDistanceSq = Math.max(distanceSq, 0.000001);
    const distance = Math.sqrt(safeDistanceSq);
    if (distance >= planet.falloff) {
      continue;
    }

    const inverseDistance = 1 / distance;
    const pull = planet.gravity * PLANET_GRAVITY_MULTIPLIER / (safeDistanceSq + 0.22);
    gravityX += deltaX * inverseDistance * pull;
    gravityY += deltaY * inverseDistance * pull;

    const influence = Math.pow(1 - distance / planet.falloff, 2) * (planet.gravity / 12);
    const glow = planet.gravityFieldGlowColor ?? (planet.gravityFieldGlowColor = new THREE.Color(planet.glow));
    tintR += glow.r * influence;
    tintG += glow.g * influence;
    tintB += glow.b * influence;
    tintWeight += influence;
  }

  const solarBodies = [
    {
      position: state.level.sun,
      gravityStrength: state.level.primarySunBody?.gravityStrength ?? state.level.sunGravityStrength ?? FIXED_SOLAR_GRAVITY_STRENGTH,
    },
    ...((state.level.extraSuns ?? []).map((solarBody) => ({
      position: solarBody.position,
      gravityStrength: solarBody.gravityStrength ?? FIXED_SOLAR_GRAVITY_STRENGTH * 0.8,
    }))),
  ];

  for (const solarBody of solarBodies) {
    if (!(solarBody.gravityStrength > 0)) {
      continue;
    }
    const deltaX = solarBody.position.x - baseX;
    const deltaY = solarBody.position.y - baseY;
    const distanceSq = deltaX * deltaX + deltaY * deltaY;
    const safeDistanceSq = Math.max(distanceSq, 0.000001);
    const distance = Math.sqrt(safeDistanceSq);
    const inverseDistance = 1 / distance;
    const pull = solarBody.gravityStrength * SOLAR_GRAVITY_MULTIPLIER / (safeDistanceSq + SOLAR_GRAVITY_SOFTENING);
    gravityX += deltaX * inverseDistance * pull;
    gravityY += deltaY * inverseDistance * pull;
  }

  const magnitudeSq = gravityX * gravityX + gravityY * gravityY;
  const magnitude = Math.sqrt(magnitudeSq);
  const edgeDistance = Math.min(
    halfWidth - Math.abs(baseX),
    halfHeight - Math.abs(baseY),
  );
  const edgeFade = THREE.MathUtils.smoothstep(edgeDistance, 0.12, 1.45);
  const displacement = Math.min(maxDisplacement, Math.log1p(magnitude) * 0.22) * edgeFade;
  const intensity = clamp(Math.log1p(magnitude) / 3.9, 0, 1);
  const inverseMagnitude = magnitude > 0.0001 ? 1 / magnitude : 0;

  target.baseX = baseX;
  target.baseY = baseY;
  target.position.set(
    baseX + gravityX * inverseMagnitude * displacement,
    0.035 + intensity * 0.05,
    baseY + gravityY * inverseMagnitude * displacement,
  );
  mixFieldColor(target.color, intensity, tintWeight, tintR, tintG, tintB);
}

function smoothGravityFieldSamples(samples, columns, rows, maxDisplacement) {
  const smoothingStrength = gravityGridConfig.smoothingStrength;
  if (!(smoothingStrength > 0)) {
    return;
  }

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      const sample = samples[row][column];
      const target = sample.smoothedPosition;

      if (row === 0 || row === rows || column === 0 || column === columns) {
        target.copy(sample.position);
        continue;
      }

      const left = samples[row][column - 1].position;
      const right = samples[row][column + 1].position;
      const up = samples[row - 1][column].position;
      const down = samples[row + 1][column].position;
      const averageX = (left.x + right.x + up.x + down.x) * 0.25;
      const averageY = (left.y + right.y + up.y + down.y) * 0.25;
      const averageZ = (left.z + right.z + up.z + down.z) * 0.25;

      target.set(
        THREE.MathUtils.lerp(sample.position.x, averageX, smoothingStrength),
        THREE.MathUtils.lerp(sample.position.y, averageY, smoothingStrength),
        THREE.MathUtils.lerp(sample.position.z, averageZ, smoothingStrength),
      );

      const offsetX = target.x - sample.baseX;
      const offsetZ = target.z - sample.baseY;
      const displacement = Math.hypot(offsetX, offsetZ);
      if (displacement > maxDisplacement) {
        const scale = maxDisplacement / displacement;
        target.x = sample.baseX + offsetX * scale;
        target.z = sample.baseY + offsetZ * scale;
      }
    }
  }

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      samples[row][column].position.copy(samples[row][column].smoothedPosition);
    }
  }
}

function getGravityFieldValueCount(columns, rows) {
  const segmentCount = (rows + 1) * columns + rows * (columns + 1);
  return segmentCount * Math.max(1, gravityGridConfig.curveSubdivisions) * 6;
}

function ensureGravityFieldVisuals(valueCount) {
  if (!gravityFieldVisuals) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(valueCount);
    const colors = new Float32Array(valueCount);
    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    const colorAttribute = new THREE.BufferAttribute(colors, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    colorAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', colorAttribute);

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
      geometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    );
    core.renderOrder = 3;
    gravityFieldRoot.add(core);

    gravityFieldVisuals = { glow, core, geometry, positions, colors };
    return gravityFieldVisuals;
  }

  if (gravityFieldVisuals.positions.length !== valueCount) {
    const positions = new Float32Array(valueCount);
    const colors = new Float32Array(valueCount);
    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    const colorAttribute = new THREE.BufferAttribute(colors, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    colorAttribute.setUsage(THREE.DynamicDrawUsage);
    gravityFieldVisuals.geometry.setAttribute('position', positionAttribute);
    gravityFieldVisuals.geometry.setAttribute('color', colorAttribute);
    gravityFieldVisuals.positions = positions;
    gravityFieldVisuals.colors = colors;
  }

  return gravityFieldVisuals;
}

function getCatmullRomValue(previous, from, to, next, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * from
    + (-previous + to) * t
    + (2 * previous - 5 * from + 4 * to - next) * t2
    + (-previous + 3 * from - 3 * to + next) * t3
  );
}

function writeGravityCurveSegment(positions, colors, offset, previous, from, to, next) {
  const subdivisions = Math.max(1, gravityGridConfig.curveSubdivisions);
  let startX = from.position.x;
  let startY = from.position.y;
  let startZ = from.position.z;
  let startR = from.color.r;
  let startG = from.color.g;
  let startB = from.color.b;

  for (let step = 1; step <= subdivisions; step += 1) {
    const t = step / subdivisions;
    const endX = getCatmullRomValue(previous.position.x, from.position.x, to.position.x, next.position.x, t);
    const endY = getCatmullRomValue(previous.position.y, from.position.y, to.position.y, next.position.y, t);
    const endZ = getCatmullRomValue(previous.position.z, from.position.z, to.position.z, next.position.z, t);
    const endR = THREE.MathUtils.lerp(from.color.r, to.color.r, t);
    const endG = THREE.MathUtils.lerp(from.color.g, to.color.g, t);
    const endB = THREE.MathUtils.lerp(from.color.b, to.color.b, t);

    positions[offset] = startX;
    positions[offset + 1] = startY;
    positions[offset + 2] = startZ;
    colors[offset] = startR;
    colors[offset + 1] = startG;
    colors[offset + 2] = startB;

    positions[offset + 3] = endX;
    positions[offset + 4] = endY;
    positions[offset + 5] = endZ;
    colors[offset + 3] = endR;
    colors[offset + 4] = endG;
    colors[offset + 5] = endB;

    offset += 6;
    startX = endX;
    startY = endY;
    startZ = endZ;
    startR = endR;
    startG = endG;
    startB = endB;
  }

  return offset;
}

function rebuildGravityField() {
  const visualField = getVisualFieldSize();
  const width = visualField.width - gravityGridConfig.insetX * 2;
  const height = visualField.height - gravityGridConfig.insetY * 2;
  const baseWidth = COURSE.width - gravityGridConfig.insetX * 2;
  const baseHeight = COURSE.height - gravityGridConfig.insetY * 2;
  const columns = Math.max(2, Math.round(gravityGridConfig.columns * (width / baseWidth)));
  const rows = Math.max(2, Math.round(gravityGridConfig.rows * (height / baseHeight)));
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const maxDisplacement = Math.min(width / columns, height / rows) * 0.5;
  const samples = ensureGravityFieldSamples(columns, rows);
  const valueCount = getGravityFieldValueCount(columns, rows);
  const visuals = ensureGravityFieldVisuals(valueCount);
  const positions = visuals.positions;
  const colors = visuals.colors;
  let offset = 0;

  for (let row = 0; row <= rows; row += 1) {
    const rowSamples = samples[row];
    const yRatio = row / rows;
    const y = -halfHeight + yRatio * height;

    for (let column = 0; column <= columns; column += 1) {
      const xRatio = column / columns;
      const x = -halfWidth + xRatio * width;
      createGravityFieldSample(x, y, halfWidth, halfHeight, maxDisplacement, rowSamples[column]);
    }
  }
  smoothGravityFieldSamples(samples, columns, rows, maxDisplacement);

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      offset = writeGravityCurveSegment(
        positions,
        colors,
        offset,
        samples[row][Math.max(0, column - 1)],
        samples[row][column],
        samples[row][column + 1],
        samples[row][Math.min(columns, column + 2)],
      );
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      offset = writeGravityCurveSegment(
        positions,
        colors,
        offset,
        samples[Math.max(0, row - 1)][column],
        samples[row][column],
        samples[row + 1][column],
        samples[Math.min(rows, row + 2)][column],
      );
    }
  }
  visuals.geometry.setDrawRange(0, offset / 3);
  visuals.geometry.attributes.position.needsUpdate = true;
  visuals.geometry.attributes.color.needsUpdate = true;
  gravityFieldVisuals = visuals;
}

function createAuxSunVisual(solarBody) {
  const group = new THREE.Group();
  const glowColor = new THREE.Color(solarBody.glow ?? 0x89c8ff);
  const coreColor = new THREE.Color(solarBody.core ?? 0xe4f6ff);

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry((solarBody.radius ?? 0.38) * 3.2, 48),
    new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.16,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.03;
  group.add(glow);

  const corona = new THREE.Mesh(
    new THREE.RingGeometry((solarBody.radius ?? 0.38) * 1.4, (solarBody.radius ?? 0.38) * 2.35, 64),
    new THREE.MeshBasicMaterial({
      color: mixColors(glowColor, new THREE.Color(0xffffff), 0.22),
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    }),
  );
  corona.rotation.x = -Math.PI / 2;
  corona.position.y = 0.04;
  group.add(corona);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(solarBody.radius ?? 0.38, 28, 28),
    new THREE.MeshStandardMaterial({
      color: coreColor,
      emissive: glowColor,
      emissiveIntensity: 1.05,
      roughness: 0.5,
      metalness: 0.02,
    }),
  );
  core.position.y = (solarBody.radius ?? 0.38) * 0.92;
  group.add(core);

  return { group, glow, corona, core, solarBody };
}

function rebuildExtraSuns() {
  clearGroup(extraSunsRoot);
  extraSunVisuals = (state.level.extraSuns ?? []).map((solarBody) => {
    const visual = createAuxSunVisual(solarBody);
    visual.group.position.set(solarBody.position.x, 0, solarBody.position.y);
    extraSunsRoot.add(visual.group);
    return visual;
  });
}

function rebuildPortals() {
  clearGroup(portalsRoot);
  portalVisuals = (state.level.portals ?? []).map((portal) => {
    const group = new THREE.Group();
    const isWhite = portal.variant === 'white';
    const ringColor = new THREE.Color(isWhite ? 0xeaf6ff : 0x7f64ff);
    const accentColor = new THREE.Color(isWhite ? 0x93e8ff : 0x72f2da);

    const aura = new THREE.Mesh(
      new THREE.CircleGeometry((portal.radius ?? 0.62) * 1.9, 40),
      new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: isWhite ? 0.12 : 0.1,
      }),
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.02;
    group.add(aura);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry((portal.radius ?? 0.62) * 0.86, (portal.radius ?? 0.62) * 1.24, 64),
      new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.84,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    group.add(ring);

    const core = new THREE.Mesh(
      new THREE.CircleGeometry((portal.radius ?? 0.62) * 0.66, 40),
      new THREE.MeshBasicMaterial({
        color: isWhite ? 0x06131f : 0x040109,
        transparent: true,
        opacity: 0.96,
      }),
    );
    core.rotation.x = -Math.PI / 2;
    core.position.y = 0.04;
    group.add(core);

    group.position.set(portal.position.x, 0, portal.position.y);
    portalsRoot.add(group);

    return { group, aura, ring, core, portal, accentColor, ringColor };
  });
}

function createVibeJamLabelTexture(text) {
  return createCanvasTexture(512, 128, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.font = '700 42px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(2, 6, 16, 0.9)';
    ctx.fillStyle = 'rgba(238, 255, 249, 0.96)';
    ctx.strokeText(text, width / 2, height / 2);
    ctx.fillText(text, width / 2, height / 2);
  });
}

function createVibeJamPortalVisual(portal) {
  const group = new THREE.Group();
  const ringColor = new THREE.Color(portal.kind === 'return' ? 0x7df3d1 : 0xffd06a);
  const glowColor = new THREE.Color(portal.kind === 'return' ? 0x63d6ff : 0xff7d58);

  const aura = new THREE.Mesh(
    new THREE.CircleGeometry(portal.radius * 2.2, 56),
    new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.08;
  aura.renderOrder = 17;
  group.add(aura);

  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(portal.radius * 0.76, portal.radius * 1.1, 80),
    new THREE.MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.11;
  outerRing.renderOrder = 18;
  group.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(portal.radius * 0.32, portal.radius * 0.52, 64),
    new THREE.MeshBasicMaterial({
      color: 0xeafff8,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.12;
  innerRing.renderOrder = 19;
  group.add(innerRing);

  const core = new THREE.Mesh(
    new THREE.CircleGeometry(portal.radius * 0.48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x050813,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    }),
  );
  core.rotation.x = -Math.PI / 2;
  core.position.y = 0.1;
  core.renderOrder = 18;
  group.add(core);

  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createVibeJamLabelTexture(portal.label),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  label.position.set(0, 1.16, -1.2);
  label.scale.set(3.3, 0.82, 1);
  label.renderOrder = 30;
  group.add(label);

  group.position.set(portal.position.x, 0, portal.position.y);
  vibeJamPortalsRoot.add(group);

  return { group, aura, outerRing, innerRing, core, label, portal };
}

function getVibeJamPortalDefinitions() {
  const portals = [
    {
      id: 'vibe-jam-exit',
      kind: 'exit',
      label: 'Vibe Jam Portal',
      position: getVibeJamPortalPosition(VIBE_JAM_EXIT_PORTAL_ANGLE_DEG),
      radius: VIBE_JAM_PORTAL_RADIUS,
    },
  ];

  if (state.vibeJam.incoming.fromPortal && state.vibeJam.incoming.ref) {
    portals.push({
      id: 'vibe-jam-return',
      kind: 'return',
      label: 'Return Portal',
      position: getVibeJamPortalPosition(VIBE_JAM_RETURN_PORTAL_ANGLE_DEG),
      radius: VIBE_JAM_PORTAL_RADIUS,
    });
  }

  return portals;
}

function rebuildVibeJamPortals() {
  clearGroup(vibeJamPortalsRoot);
  vibeJamPortalVisuals = getVibeJamPortalDefinitions().map((portal) => createVibeJamPortalVisual(portal));
}

function getVibeJamPortalPosition(angleDeg) {
  const sun = state.level.sun ?? { x: 0, y: 0 };
  const goalRadius = distanceBetween(state.level.goalCenter, sun);
  const angle = angleDeg * Math.PI / 180;
  return {
    x: sun.x + Math.cos(angle) * goalRadius,
    y: sun.y + Math.sin(angle) * goalRadius,
  };
}

function redirectThroughVibeJamPortal(portal) {
  if (state.vibeJam.redirecting || state.vibeJam.entry) {
    return true;
  }

  const redirectUrl = portal.kind === 'return'
    ? buildVibeJamReturnUrl()
    : buildVibeJamExitUrl();

  if (!redirectUrl) {
    return false;
  }

  state.vibeJam.entry = {
    portal,
    redirectUrl,
    elapsed: 0,
    startPosition: cloneVec(state.ball.position),
    targetPosition: cloneVec(portal.position),
  };
  state.dragActive = false;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.anchorPlanetIndex = null;
  state.ball.anchorNormal = null;
  state.message = portal.kind === 'return' ? 'Returning through the Vibe Jam portal.' : 'Entering the Vibe Jam portal.';
  state.hint = 'Carrying your run to the next game.';
  syncHud();
  return true;
}

function updateVibeJamPortalEntry(delta) {
  const entry = state.vibeJam.entry;
  if (!entry) {
    return false;
  }

  entry.elapsed += delta;
  const rawT = clamp(entry.elapsed / VIBE_JAM_PORTAL_ENTRY_SECONDS, 0, 1);
  const easedT = THREE.MathUtils.smootherstep(rawT, 0, 1);
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.ball.position.x = THREE.MathUtils.lerp(entry.startPosition.x, entry.targetPosition.x, easedT);
  state.ball.position.y = THREE.MathUtils.lerp(entry.startPosition.y, entry.targetPosition.y, easedT);

  if (rawT >= 1 && !state.vibeJam.redirecting) {
    state.vibeJam.redirecting = true;
    window.location.assign(entry.redirectUrl);
  }

  return true;
}

function maybeEnterVibeJamPortal() {
  if (
    state.vibeJam.redirecting
    || state.vibeJam.entry
    || state.worldMap.open
    || state.gameOver.open
    || state.goalCloseAnimation.active
    || state.undo.active
    || state.rewindPlayback.active
    || state.ball.goaling
    || state.ball.crashed
  ) {
    return false;
  }

  if (clock.elapsedTime - state.vibeJam.loadedAt < VIBE_JAM_PORTAL_ACTIVATION_DELAY) {
    return false;
  }

  for (const visual of vibeJamPortalVisuals) {
    const portal = visual.portal;
    if (distanceBetween(state.ball.position, portal.position) <= portal.radius + COURSE.ballRadius * 0.9) {
      return redirectThroughVibeJamPortal(portal);
    }
  }

  return false;
}

function rebuildDustClouds() {
  clearGroup(dustCloudsRoot);
  dustCloudVisuals = (state.level.dustClouds ?? []).map((cloud, index) => {
    const group = new THREE.Group();
    const radius = cloud.radius ?? 1;
    const bodyTexture = createDustCloudTexture(cloud, index, 'body');
    const filamentTexture = createDustCloudTexture(cloud, index, 'filament');
    const stretch = 1.18 + (index % 3) * 0.11;
    const squash = 0.74 + (index % 2) * 0.08;
    const bodyGeometry = new THREE.PlaneGeometry(radius * 3.75 * stretch, radius * 3.05 * squash);
    const filamentGeometry = new THREE.PlaneGeometry(radius * 4.35 * stretch, radius * 3.55 * squash);
    const glowColor = new THREE.Color(index % 2 === 0 ? 0x9fdcff : 0xffc08c);
    const hazeRotation = (index * 47) * Math.PI / 180;
    const bodyRotation = ((index * 61) + 18) * Math.PI / 180;
    const emberRotation = ((index * 37) - 12) * Math.PI / 180;

    const haze = new THREE.Mesh(
      filamentGeometry,
      new THREE.MeshBasicMaterial({
        map: filamentTexture,
        color: glowColor,
        transparent: true,
        opacity: 0.5 * (cloud.opacity ?? 1),
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    haze.rotation.x = -Math.PI / 2;
    haze.rotation.z = hazeRotation;
    haze.position.y = 0.064;
    haze.renderOrder = 3;
    group.add(haze);

    const body = new THREE.Mesh(
      bodyGeometry,
      new THREE.MeshBasicMaterial({
        map: bodyTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0.94 * (cloud.opacity ?? 1),
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    body.rotation.x = -Math.PI / 2;
    body.rotation.z = bodyRotation;
    body.position.y = 0.078;
    body.renderOrder = 4;
    group.add(body);

    const ember = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2.05 * stretch, radius * 1.08 * squash),
      new THREE.MeshBasicMaterial({
        map: filamentTexture,
        color: new THREE.Color(0xffb56f).lerp(new THREE.Color(0x7ddcff), index % 2 === 0 ? 0.18 : 0.42),
        transparent: true,
        opacity: 0.58 * (cloud.opacity ?? 1),
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    ember.rotation.x = -Math.PI / 2;
    ember.rotation.z = emberRotation;
    ember.position.y = 0.092;
    ember.renderOrder = 5;
    group.add(ember);

    const boundary = new THREE.Mesh(
      new THREE.RingGeometry(radius, radius + 0.035, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf7d59c).lerp(new THREE.Color(0x9ddcff), index % 2 === 0 ? 0.38 : 0.58),
        transparent: true,
        opacity: 0.34 * (cloud.opacity ?? 1),
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    boundary.rotation.x = -Math.PI / 2;
    boundary.position.y = 0.105;
    boundary.renderOrder = 6;
    group.add(boundary);

    const boundaryGlow = new THREE.Mesh(
      new THREE.RingGeometry(radius - 0.055, radius + 0.09, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffc27d).lerp(new THREE.Color(0x76d8ff), index % 2 === 0 ? 0.28 : 0.5),
        transparent: true,
        opacity: 0.09 * (cloud.opacity ?? 1),
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    boundaryGlow.rotation.x = -Math.PI / 2;
    boundaryGlow.position.y = 0.101;
    boundaryGlow.renderOrder = 6;
    group.add(boundaryGlow);

    group.position.set(cloud.position.x, 0, cloud.position.y);
    dustCloudsRoot.add(group);
    return {
      group,
      haze,
      body,
      ember,
      boundary,
      boundaryGlow,
      cloud,
      radius,
      hazeRotation,
      bodyRotation,
      emberRotation,
    };
  });
}

function createSplitSurfaceDisc(radius, color, opacity, thetaStart) {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48, thetaStart, Math.PI),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.renderOrder = 7;
  return disc;
}

function rebuildAsteroids() {
  clearGroup(asteroidsRoot);
  asteroidVisuals = (state.level.asteroids ?? []).map((asteroid, index) => {
    const group = new THREE.Group();
    const color = new THREE.Color(asteroid.color ?? 0x8f949c);
    const glowColor = mixColors(color, new THREE.Color(0xd7e3ff), 0.22);
    const radius = asteroid.radius ?? 0.22;

    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 1.9, 18),
      new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.035;
    group.add(halo);

    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(radius, 0),
      new THREE.MeshStandardMaterial({
        color,
        emissive: mixColors(color, new THREE.Color(0x31445a), 0.5),
        emissiveIntensity: 0.08,
        roughness: 0.96,
        metalness: 0.04,
      }),
    );
    body.position.y = radius * 0.72;
    body.scale.set(
      1 + ((index * 13) % 7) * 0.035,
      0.72 + ((index * 11) % 5) * 0.045,
      0.86 + ((index * 17) % 6) * 0.04,
    );
    body.rotation.set(index * 0.71, index * 1.13, index * 0.43);
    group.add(body);

    group.position.set(asteroid.position.x, 0, asteroid.position.y);
    asteroidsRoot.add(group);
    return { group, body, halo, asteroid };
  });
}

function rebuildMeteors() {
  clearGroup(meteorsRoot);
  meteorVisuals = (state.level.meteorImpacts ?? []).map((meteor, index) => {
    const group = new THREE.Group();
    const color = new THREE.Color(meteor.color ?? 0xff865f);
    const trailColor = new THREE.Color(meteor.trailColor ?? 0xffd48a);
    const radius = meteor.radius ?? 0.18;

    const trail = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 1.2, 1.9),
      new THREE.MeshBasicMaterial({
        color: trailColor,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    trail.position.y = 0.16;
    group.add(trail);

    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 2.7, 24),
      new THREE.MeshBasicMaterial({
        color: trailColor,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);

    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(radius, 0),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.7,
        roughness: 0.82,
        metalness: 0.05,
      }),
    );
    body.position.y = 0.24;
    body.rotation.set(index * 0.47, index * 0.91, index * 0.63);
    group.add(body);

    meteorsRoot.add(group);
    return { group, body, halo, trail, meteor };
  });
}

function rebuildPlanets() {
  clearGroup(orbitPathsRoot);
  clearGroup(planetsRoot);

  planetVisuals = state.level.planets.filter((planet) => !planet.hidden).map((planet) => {
    const group = new THREE.Group();
    const coreColor = new THREE.Color(planet.core);
    const glowColor = new THREE.Color(planet.glow);
    const surfaceTexture = getPlanetTexture(planet);
    const isIcePlanet = planet.surfaceType === 'ice';
    const isLavaPlanet = planet.surfaceType === 'lava';
    const orbitPathColor = planet.landable
      ? (
        isIcePlanet
          ? mixColors(glowColor, new THREE.Color(0xf5ffff), 0.52)
          : isLavaPlanet
            ? mixColors(glowColor, new THREE.Color(0xffb36d), 0.46)
          : mixColors(glowColor, new THREE.Color(0x9feedd), 0.35)
      )
      : mixColors(glowColor, new THREE.Color(0xffdfa9), 0.22);

    const orbitPathPoints = [];
    const isDecayingOrbit = Boolean(planet.orbitDecayRate);
    const pathSteps = isDecayingOrbit ? 180 : 128;
    const pathDuration = Math.min(18, Math.max(8, (planet.orbitSemiMajor ?? 4) / Math.max(0.001, planet.orbitDecayRate ?? 0.2) * 0.28));
    for (let step = 0; step <= pathSteps; step += 1) {
      const pathT = step / pathSteps;
      const pathTime = isDecayingOrbit ? pathT * pathDuration : 0;
      const anomaly = isDecayingOrbit
        ? ((planet.orbitPhase ?? 0) + pathTime * (planet.orbitSpeed ?? 0))
        : (pathT * Math.PI * 2);
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
      const minOrbitRadius = Math.min(
        planet.orbitSemiMajor,
        planet.orbitMinRadius ?? planet.orbitSemiMajor * 0.35,
      );
      const decayedSemiMajor = isDecayingOrbit
        ? (() => {
          const decayDistance = planet.orbitSemiMajor - minOrbitRadius;
          const timeToMinimum = decayDistance / Math.max(0.000001, planet.orbitDecayRate);
          const fallProgress = Math.min(1, pathTime / Math.max(0.001, timeToMinimum));
          return planet.orbitSemiMajor - decayDistance * fallProgress ** 1.55;
        })()
        : planet.orbitSemiMajor;
      const decayScale = decayedSemiMajor / Math.max(0.001, planet.orbitSemiMajor);
      const localX = decayedSemiMajor * (Math.cos(eccentricAnomaly) - eccentricity);
      const localY = planet.orbitSemiMinor * decayScale * Math.sin(eccentricAnomaly);
      const rotation = planet.orbitRotation ?? 0;
      const x = localX * Math.cos(rotation) - localY * Math.sin(rotation);
      const y = localX * Math.sin(rotation) + localY * Math.cos(rotation);
      orbitPathPoints.push(new THREE.Vector3(x, 0.028, y));
    }
    const OrbitPathClass = isDecayingOrbit ? THREE.Line : THREE.LineLoop;
    const orbitPath = new OrbitPathClass(
      new THREE.BufferGeometry().setFromPoints(orbitPathPoints),
      new THREE.LineBasicMaterial({
        color: orbitPathColor,
        transparent: true,
        opacity: isDecayingOrbit ? 0.34 : (planet.landable ? 0.24 : 0.16),
        depthWrite: false,
      }),
    );
    orbitPath.renderOrder = 1;
    orbitPath.position.set(planet.orbitCenter.x, 0, planet.orbitCenter.y);
    orbitPathsRoot.add(orbitPath);

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(planet.radius + (planet.landable ? 0.32 : 0.48), 48),
      new THREE.MeshBasicMaterial({
        color: planet.landable
          ? (
            isIcePlanet
              ? mixColors(glowColor, new THREE.Color(0xffffff), 0.28)
              : isLavaPlanet
                ? mixColors(glowColor, new THREE.Color(0xffb25a), 0.42)
              : mixColors(glowColor, new THREE.Color(0x9ce9ff), 0.16)
          )
          : mixColors(new THREE.Color(0xff845d), new THREE.Color(0xffc28c), 0.28),
        transparent: true,
        opacity: planet.landable ? (isIcePlanet ? 0.24 : isLavaPlanet ? 0.28 : 0.16) : 0.18,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.04;
    group.add(glow);

    const bodyMaterial = planet.landable
      ? new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: surfaceTexture,
        emissive: isIcePlanet
          ? mixColors(coreColor, new THREE.Color(0xf1fdff), 0.42)
          : isLavaPlanet
            ? mixColors(coreColor, new THREE.Color(0xffa04e), 0.58)
          : mixColors(coreColor, glowColor, 0.14),
        emissiveIntensity: isIcePlanet ? 0.28 : isLavaPlanet ? 0.64 : 0.08,
        roughness: isIcePlanet ? 0.34 : isLavaPlanet ? 0.66 : 0.98,
        metalness: isIcePlanet ? 0.1 : isLavaPlanet ? 0.04 : 0.02,
      })
      : new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: surfaceTexture,
        emissive: mixColors(new THREE.Color(0xa33324), new THREE.Color(0xff8d57), 0.38),
        emissiveIntensity: 0.16,
        roughness: 0.86,
        metalness: 0,
      });

    const body = new THREE.Mesh(
      planet.flicker
        ? new THREE.SphereGeometry(planet.radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2)
        : new THREE.SphereGeometry(planet.radius, 48, 48),
      bodyMaterial,
    );
    body.position.y = planet.radius * 0.74;
    if (!planet.landable) {
      body.scale.y = 0.94;
    }
    group.add(body);

    let atmosphereShell = null;
    let accentBand = null;
    let monolith = null;
    let monolithRing = null;
    let monolithBeacon = null;
    let iceSkidArc = null;
    let iceHaloRing = null;
    let iceInnerRing = null;
    let lavaHaloRing = null;
    let lavaWarningRing = null;
    let splitSafeDisc = null;
    let splitHazardDisc = null;
    let flickerTimerTrack = null;
    let flickerTimerArc = null;
    let flickerGhostRing = null;
    const turretVisuals = [];

    if (planet.landable) {
      atmosphereShell = new THREE.Mesh(
        new THREE.SphereGeometry(planet.radius * 1.045, 48, 48),
        new THREE.MeshPhongMaterial({
          color: isIcePlanet
            ? mixColors(glowColor, new THREE.Color(0xf0fbff), 0.56)
            : isLavaPlanet
              ? mixColors(glowColor, new THREE.Color(0xffb66e), 0.5)
            : mixColors(glowColor, new THREE.Color(0xc7fff7), 0.38),
          transparent: true,
          opacity: isIcePlanet ? 0.24 : isLavaPlanet ? 0.22 : 0.16,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
    } else {
      atmosphereShell = new THREE.Mesh(
        new THREE.SphereGeometry(planet.radius * 1.065, 48, 48),
        new THREE.MeshPhongMaterial({
          color: mixColors(new THREE.Color(0xff8d66), new THREE.Color(0xffd2a8), 0.28),
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      atmosphereShell.scale.y = 0.95;

      accentBand = new THREE.Mesh(
        new THREE.TorusGeometry(planet.radius * 1.16, 0.045, 12, 96),
        new THREE.MeshBasicMaterial({
          color: mixColors(new THREE.Color(0xff6e4e), new THREE.Color(0xffc57f), 0.34),
          transparent: true,
          opacity: 0.38,
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
        color: planet.landable
          ? (planet.goalUnlock ? 0xffd07a : (isIcePlanet ? 0xf5ffff : isLavaPlanet ? 0xffd36a : 0x7df3d1))
          : 0xffc08a,
        transparent: true,
        opacity: planet.landable ? (isIcePlanet ? 0.78 : isLavaPlanet ? 0.8 : 0.68) : 0.42,
        depthWrite: false,
      }),
    );
    orbitRing.rotation.x = Math.PI / 2.45;
    orbitRing.position.y = planet.radius * 0.84;
    orbitRing.renderOrder = 4;
    group.add(orbitRing);

    if (planet.splitSurface) {
      splitSafeDisc = createSplitSurfaceDisc(
        planet.radius * 1.075,
        isIcePlanet ? 0xeaffff : isLavaPlanet ? 0xffdc94 : 0x62ffd7,
        0.34,
        -Math.PI / 2,
      );
      splitSafeDisc.position.y = planet.radius * 1.5;
      group.add(splitSafeDisc);

      splitHazardDisc = createSplitSurfaceDisc(
        planet.radius * 1.08,
        0xff604f,
        0.46,
        Math.PI / 2,
      );
      splitHazardDisc.position.y = planet.radius * 1.505;
      group.add(splitHazardDisc);

    }

    if (isIcePlanet) {
      iceHaloRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.28, planet.radius + 0.42, 72),
        new THREE.MeshBasicMaterial({
          color: 0xaedfff,
          transparent: true,
          opacity: 0.34,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      iceHaloRing.rotation.x = -Math.PI / 2;
      iceHaloRing.position.y = 0.048;
      iceHaloRing.renderOrder = 2;
      group.add(iceHaloRing);

      iceInnerRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius * 0.78, planet.radius * 0.94, 72),
        new THREE.MeshBasicMaterial({
          color: 0xf7ffff,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      iceInnerRing.rotation.x = -Math.PI / 2;
      iceInnerRing.position.y = planet.radius * 0.66;
      iceInnerRing.renderOrder = 6;
      group.add(iceInnerRing);
    }

    if (isLavaPlanet) {
      lavaHaloRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.3, planet.radius + 0.48, 72),
        new THREE.MeshBasicMaterial({
          color: 0xff7d39,
          transparent: true,
          opacity: 0.26,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      lavaHaloRing.rotation.x = -Math.PI / 2;
      lavaHaloRing.position.y = 0.05;
      lavaHaloRing.renderOrder = 2;
      group.add(lavaHaloRing);

      lavaWarningRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.08, planet.radius + 0.18, 72),
        new THREE.MeshBasicMaterial({
          color: 0xfff0ba,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      lavaWarningRing.rotation.x = -Math.PI / 2;
      lavaWarningRing.position.y = 0.09;
      lavaWarningRing.renderOrder = 5;
      group.add(lavaWarningRing);
    }

    if (planet.flicker) {
      flickerGhostRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.34, planet.radius + 0.54, 72),
        new THREE.MeshBasicMaterial({
          color: 0x9ee9ff,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      flickerGhostRing.rotation.x = -Math.PI / 2;
      flickerGhostRing.position.y = 0.052;
      flickerGhostRing.renderOrder = 2;
      group.add(flickerGhostRing);

      flickerTimerTrack = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.58, planet.radius + 0.68, 80),
        new THREE.MeshBasicMaterial({
          color: 0x34556f,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      flickerTimerTrack.rotation.x = -Math.PI / 2;
      flickerTimerTrack.position.y = 0.074;
      flickerTimerTrack.renderOrder = 6;
      group.add(flickerTimerTrack);

      flickerTimerArc = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.58, planet.radius + 0.7, 80, 1, Math.PI / 2, Math.PI * 2),
        new THREE.MeshBasicMaterial({
          color: 0xffe38b,
          transparent: true,
          opacity: 0.82,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      flickerTimerArc.rotation.x = -Math.PI / 2;
      flickerTimerArc.position.y = 0.09;
      flickerTimerArc.renderOrder = 7;
      group.add(flickerTimerArc);
    }

    let landingRing = null;
    if (planet.landable) {
      landingRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.2, planet.landingRadius ?? planet.radius + 0.48, 64),
        new THREE.MeshBasicMaterial({
          color: isIcePlanet ? 0xf7ffff : isLavaPlanet ? 0xffd579 : 0x75f3d9,
          transparent: true,
          opacity: isIcePlanet ? 0.34 : isLavaPlanet ? 0.28 : 0.18,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      landingRing.rotation.x = -Math.PI / 2;
      landingRing.position.y = 0.06;
      landingRing.renderOrder = 3;
      group.add(landingRing);
    }

    if (isIcePlanet) {
      iceSkidArc = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.1, planet.radius + 0.19, 48, 1, -0.34, 0.68),
        new THREE.MeshBasicMaterial({
          color: 0xf2fbff,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      iceSkidArc.rotation.x = -Math.PI / 2;
      iceSkidArc.position.y = 0.095;
      iceSkidArc.visible = false;
      iceSkidArc.renderOrder = 5;
      group.add(iceSkidArc);
    }

    if (planet.goalUnlock) {
      monolith = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, planet.radius * 1.45, 0.18),
        new THREE.MeshStandardMaterial({
          color: 0xffefc6,
          emissive: 0xffc46b,
          emissiveIntensity: 0.62,
          roughness: 0.22,
          metalness: 0.62,
        }),
      );
      monolith.position.set(0, planet.radius * 1.5, 0);
      monolith.rotation.z = 0.2;
      group.add(monolith);

      monolithRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius + 0.34, planet.radius + 0.56, 64),
        new THREE.MeshBasicMaterial({
          color: 0xffd68f,
          transparent: true,
          opacity: 0.34,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      monolithRing.rotation.x = -Math.PI / 2;
      monolithRing.position.y = 0.08;
      group.add(monolithRing);

      monolithBeacon = new THREE.Mesh(
        new THREE.CircleGeometry(planet.radius + 0.92, 64),
        new THREE.MeshBasicMaterial({
          color: 0xffc66c,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
        }),
      );
      monolithBeacon.rotation.x = -Math.PI / 2;
      monolithBeacon.position.y = 0.035;
      group.add(monolithBeacon);
    }

    for (const turret of planet.turrets ?? []) {
      const turretGroup = new THREE.Group();
      const lineLength = turret.range ?? 2.8;
      const lineStart = planet.radius + COURSE.ballRadius * 0.34;
      const sightLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(lineStart, 0.16, 0),
          new THREE.Vector3(lineStart + lineLength, 0.16, 0),
        ]),
        new THREE.LineBasicMaterial({
          color: turret.type === 'missile' ? 0xffdf7a : 0xff665f,
          transparent: true,
          opacity: 0.68,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      sightLine.renderOrder = 12;
      turretGroup.add(sightLine);

      const sightGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(lineLength, Math.max(0.04, (turret.width ?? 0.07) * 2.6)),
        new THREE.MeshBasicMaterial({
          color: turret.type === 'missile' ? 0xffbb54 : 0xff4f5e,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      sightGlow.rotation.x = -Math.PI / 2;
      sightGlow.position.set(lineStart + lineLength * 0.5, 0.11, 0);
      sightGlow.renderOrder = 11;
      turretGroup.add(sightGlow);

      const turretBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.13, 0.1, 16),
        new THREE.MeshStandardMaterial({
          color: 0x2a313a,
          emissive: turret.type === 'missile' ? 0x6f4310 : 0x5a1616,
          emissiveIntensity: 0.36,
          roughness: 0.42,
          metalness: 0.48,
        }),
      );
      turretBase.position.set(lineStart - 0.04, planet.radius * 1.52, 0);
      turretBase.rotation.z = Math.PI / 2;
      turretGroup.add(turretBase);

      const barrel = new THREE.Mesh(
        new THREE.BoxGeometry(turret.type === 'missile' ? 0.42 : 0.34, 0.07, 0.07),
        new THREE.MeshStandardMaterial({
          color: turret.type === 'missile' ? 0x3d4552 : 0x252b34,
          emissive: turret.type === 'missile' ? 0xff9d36 : 0xff4048,
          emissiveIntensity: 0.32,
          roughness: 0.36,
          metalness: 0.58,
        }),
      );
      barrel.position.set(lineStart + 0.12, planet.radius * 1.56, 0);
      turretGroup.add(barrel);

      group.add(turretGroup);
      turretVisuals.push({ group: turretGroup, sightLine, sightGlow, turret });
    }

    group.position.set(planet.position.x, 0, planet.position.y);
    planetsRoot.add(group);

    return {
      group,
      orbitPath,
      body,
      glow,
      atmosphereShell,
      accentBand,
      orbitRing,
      landingRing,
      monolith,
      monolithRing,
      monolithBeacon,
      iceSkidArc,
      iceHaloRing,
      iceInnerRing,
      lavaHaloRing,
      lavaWarningRing,
      flickerTimerTrack,
      flickerTimerArc,
      flickerGhostRing,
      splitSafeDisc,
      splitHazardDisc,
      turretVisuals,
      planet,
      lastCollapseState: planet.collapseState ?? 'stable',
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
    return readLastLevelIndex();
  }

  const parsedLevel = Number.parseInt(rawLevel, 10);
  if (!Number.isFinite(parsedLevel)) {
    return 0;
  }

  return clamp(parsedLevel - 1, 0, LEVELS.length - 1);
}

function applyLevel(index) {
  stopAdminReplay();
  hideGameOverModal();
  hideGoalCloseAnimation();
  state.levelIndex = index % LEVELS.length;
  persistLastLevelIndex(state.levelIndex);
  state.level = createLevelRuntime(state.levelIndex);
  state.controlShots = createControlShots(state.level);
  syncWorldRunForLevel(state.level);
  state.adminSolutionIndex = 0;
  clearAttemptMemory();
  clearUndoCheckpoints();
  resetBallTrace();
  clearSunShockwaves();
  clearPlanetExplosions();
  lastGoalTimerFraction = Number.NaN;

  updateSunVisual();
  goalGroup.position.set(state.level.goalCenter.x, 0.06, state.level.goalCenter.y);

  syncLevelQueryParam(state.levelIndex);
  syncActionButtons();

  levelKicker.textContent = `World ${state.level.worldNumber} · ${state.level.worldName}`;
  levelLabel.textContent = `Level ${state.levelIndex + 1} / ${LEVELS.length}`;
  levelName.textContent = state.level.name;
  rebuildGravityField();
  lastGravityFieldRefreshTime = state.level.time ?? 0;
  rebuildExtraSuns();
  rebuildPortals();
  rebuildVibeJamPortals();
  rebuildDustClouds();
  rebuildAsteroids();
  rebuildMeteors();
  rebuildPlanets();
}

function syncHud() {
  statusLine.textContent = state.message;
  statusHint.textContent = state.hint;
  statusCard.hidden = true;
  runStatusPill.textContent = getRunStatusText();
  windowStatusPill.textContent = getWindowStatusText();
  runStatusPill.classList.toggle(
    'is-hot',
    (state.ball.anchorPlanetIndex !== null && state.ball.landingCount > 0) || Boolean(getAnchoredLavaPlanet()),
  );
  windowStatusPill.classList.toggle(
    'is-hot',
    getGoalRemainingTime(state.level, state.ball.time ?? state.level.time ?? 0) < 2.5,
  );
  const shownPower = state.dragActive ? state.dragPower : getControlShot().power;
  powerFill.style.transform = `scaleX(${Math.max(0.04, shownPower / MAX_DRAG_DISTANCE)})`;
  heatStatusPill.textContent = getHeatStatusText();
  heatStatusPill.classList.toggle('is-hot', getBallHeatRatio(state.ball) > 0.18);
  heatStatusPill.classList.toggle('is-danger', Boolean(getAnchoredLavaPlanet()));
  syncActionButtons();
  syncTimeControl();
  syncPerfOverlay();
  syncTutorialOverlay();
  syncGameOverModal();
  syncWorldMap();
}

function getActiveTutorial() {
  const tutorial = state.level?.tutorial;
  if (!tutorial) {
    return null;
  }

  if (state.shots > 0 || state.gameOver.open || state.goalCloseAnimation.active) {
    return null;
  }

  return tutorial;
}

function syncTutorialOverlay() {
  const tutorial = getActiveTutorial();
  tutorialCard.hidden = !tutorial;
  tutorialCard.classList.toggle('is-relay', tutorial?.type === 'relay');
  tutorialCard.classList.toggle('is-monolith', tutorial?.type === 'monolith');
  tutorialCard.classList.toggle('is-dust', tutorial?.type === 'dust');
  if (!tutorial) {
    return;
  }

  tutorialCopy.textContent = tutorial.copy;
}

function resetBall(message, hint, options = {}) {
  hideGameOverModal();
  hideGoalCloseAnimation();
  state.vibeJam.entry = null;
  state.vibeJam.redirecting = false;
  if (options.scored) {
    state.score += 1;
  }

  if (options.countReset) {
    state.resets += 1;
  }

  if (options.advanceLevel) {
    applyLevel((state.levelIndex + 1) % LEVELS.length);
  } else {
    applyLevel(state.levelIndex);
  }

  if (!options.keepAdminReplay) {
    stopAdminReplay();
  }

  clampTimeSpeedToNonNegative();
  clearFlightHistoryState();
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
  state.ball.crashPlanetIndex = null;
  state.ball.landingCount = freshBall.landingCount;
  state.ball.launchGracePlanetIndex = freshBall.launchGracePlanetIndex;
  state.ball.anchorPlanetIndex = freshBall.anchorPlanetIndex;
  state.ball.anchorNormal = cloneVec(freshBall.anchorNormal);
  state.ball.anchorSinceTime = freshBall.anchorSinceTime;
  state.ball.portalCooldown = freshBall.portalCooldown ?? 0;
  state.ball.heat = freshBall.heat ?? 0;
  state.ball.landedPlanetIndex = freshBall.anchorPlanetIndex ?? null;
  state.ball.landedPlanetName = state.level.planets[freshBall.anchorPlanetIndex ?? 0]?.name ?? 'launch world';
  setVec(state.ball.crashStartPosition, freshBall.position);
  setVec(state.ball.crashTargetPosition, freshBall.position);
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragStartWorld, state.ball.position);
  setVec(state.dragPointerWorld, state.ball.position);
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  state.relayPulse = 0;
  state.turretShot = null;
  resetBallTrace();
  clearSunShockwaves();
  clearPlanetExplosions();
  resetBallRenderState();
  seedFlightHistoryFromCurrentState();
  state.message = message;
  state.hint = hint;
  lastGoalTimerFraction = Number.NaN;
  syncHud();
}

function beginGoal(result = null) {
  hideGameOverModal();
  hideGoalCloseAnimation();
  finalizeFlightHistory('goal', result?.eventState ?? null, result?.displayEventState ?? null);
  finalizeAttemptTrail('goal');
  stopAdminReplay();
  state.ball.goaling = true;
  state.ball.crashed = false;
  state.ball.transition = 0;
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.relayPulse = 0;
  state.turretShot = null;
  state.message = 'Event horizon captured.';
  state.hint = 'Course clear. Loading the next route.';
  syncHud();
}

function beginCrash(
  reason,
  hint,
  crashKind = 'planet',
  eventState = null,
  displayEventState = null,
  crashPlanetIndex = null,
  failureReason = reason,
  crashTargetPosition = null,
  crashDetails = null,
) {
  hideGameOverModal();
  hideGoalCloseAnimation();
  finalizeFlightHistory('crash', eventState, displayEventState);
  finalizeAttemptTrail('crash');
  stopAdminReplay();
  state.ball.crashed = true;
  state.ball.goaling = false;
  state.ball.transition = 0;
  state.ball.crashReason = failureReason;
  state.ball.crashKind = crashKind;
  state.ball.crashPlanetIndex = crashPlanetIndex;
  setVec(state.ball.crashStartPosition, state.ball.position);
  const crashPlanet = (
    crashPlanetIndex !== null
    && crashPlanetIndex !== undefined
    && state.level.planets[crashPlanetIndex]
  ) ? state.level.planets[crashPlanetIndex] : null;
  setVec(
    state.ball.crashTargetPosition,
    state.ball.crashKind === 'sun' || state.ball.crashKind === 'pulsar'
      ? (crashTargetPosition ?? state.level.sun)
      : state.ball.crashKind === 'turret'
        ? state.ball.position
      : crashPlanet
        ? crashPlanet.position
        : state.ball.position,
  );
  state.ball.velocity.x = 0;
  state.ball.velocity.y = 0;
  state.relayPulse = 0;
  if (crashKind === 'turret' && crashDetails?.turret && crashPlanet) {
    const lineState = getTurretLineState(crashPlanet, crashDetails.turret, state.ball.time ?? state.level.time ?? 0);
    state.turretShot = {
      elapsed: 0,
      start: cloneVec(lineState.start),
      end: cloneVec(state.ball.position),
      turretType: crashDetails.turret.type ?? 'tank',
    };
  } else {
    state.turretShot = null;
  }
  state.message = reason;
  state.hint = hint;
  syncHud();
}

function beginLanding(result) {
  hideGameOverModal();
  hideGoalCloseAnimation();
  finalizeFlightHistory('landed', result?.eventState ?? null, result?.displayEventState ?? null);
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
  setVec(state.dragStartWorld, state.ball.position);
  setVec(state.dragPointerWorld, state.ball.position);
  state.dragActive = false;
  state.dragPower = 0;
  state.roundSettled = true;
  state.relayPulse = 1;
  resetBallRenderState();
  const landedPlanet = result.planetIndex !== null && result.planetIndex !== undefined
    ? state.level.planets[result.planetIndex]
    : null;
  const iceLockRemaining = landedPlanet ? getIceLaunchLockRemaining(landedPlanet, state.ball) : 0;
  const lavaPlanet = landedPlanet?.surfaceType === 'lava' ? landedPlanet : null;
  if (result.goalUnlocked) {
    state.message = 'Monolith awakened.';
    state.hint = `Black hole open for ${state.level.goalOpenSeconds.toFixed(1)}s.`;
  } else if (lavaPlanet) {
    state.message = `Heating on ${state.ball.landedPlanetName}.`;
    state.hint = `Launch before ${getLavaOverheatRemainingText(lavaPlanet)}s or the ball burns through.`;
  } else if (iceLockRemaining > 0) {
    state.message = `Sliding on ${state.ball.landedPlanetName}.`;
    state.hint = `Ice drift settling. Next shot unlocks in ${iceLockRemaining.toFixed(1)}s.`;
  } else {
    state.message = `Relay locked on ${state.ball.landedPlanetName}.`;
    state.hint = `Chain ${state.ball.landingCount} armed. Shot ${Math.min(state.ball.landingCount + 1, state.controlShots.length)} is live.`;
  }

  if (state.adminReplay.active) {
    const selected = getAdminSolutions()[state.adminReplay.solutionIndex];
    if (selected && state.adminReplay.shotIndex < selected.shots.length) {
      state.adminReplay.nextLaunchTime = (state.level.time ?? 0) + selected.shots[state.adminReplay.shotIndex].waitSeconds;
      state.hint = `${getAdminSolutionSummary(selected, state.adminReplay.solutionIndex, getAdminSolutions().length)} · waiting`;
    } else {
      stopAdminReplay();
    }
  }
  seedFlightHistoryFromCurrentState();
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
  return (
    lengthSq(state.ball.velocity) > 0.002
    || state.ball.goaling
    || state.ball.crashed
    || Boolean(state.vibeJam.entry)
    || state.undo.active
    || state.rewindPlayback.active
  );
}

function updateDragState(worldPoint) {
  const activeStageIndex = getActiveStageIndex();
  const activeShot = getControlShot(activeStageIndex);
  const pullVector = {
    x: worldPoint.x - state.dragStartWorld.x,
    y: worldPoint.y - state.dragStartWorld.y,
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

  if (state.vibeJam.entry) {
    const rawT = clamp(state.vibeJam.entry.elapsed / VIBE_JAM_PORTAL_ENTRY_SECONDS, 0, 1);
    const easedT = THREE.MathUtils.smootherstep(rawT, 0, 1);
    const sinkT = THREE.MathUtils.smootherstep(rawT, 0.15, 1);
    ballGroup.visible = true;
    ballGroup.scale.setScalar(THREE.MathUtils.lerp(1, 0.08, easedT));
    ballMesh.position.y = THREE.MathUtils.lerp(ballRestY, -0.24, sinkT);
    ballMesh.rotation.y += 0.22 + rawT * 0.38;
    ballMesh.rotation.z += 0.12 + rawT * 0.24;
    ballMesh.scale.setScalar(THREE.MathUtils.lerp(1, 0.58, easedT));
    ballMesh.material.color.copy(palette.ball).lerp(new THREE.Color(0x8fffe3), easedT * 0.75);
    ballMesh.material.emissive.setHex(0x7df3d1);
    ballMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0.2, 2.6, easedT);
    ballShadow.material.opacity = 0.28 * (1 - easedT);
    return;
  }

  let targetRotationY = 0;
  let targetScaleX = 1;
  let targetScaleY = 1;
  let targetScaleZ = 1;

  if (!state.ball.goaling && !state.ball.crashed) {
    const speed = length(state.ball.velocity);
    if (speed > BALL_STRETCH_SPEED_THRESHOLD) {
      const direction = normalize(state.ball.velocity);
      const stretchMix = clamp(
        (speed - BALL_STRETCH_SPEED_THRESHOLD) / (11.8 - BALL_STRETCH_SPEED_THRESHOLD),
        0,
        1,
      );
      const stretchAmount = BALL_STRETCH_MAX * (0.35 + stretchMix * 0.65);
      targetRotationY = Math.atan2(-direction.y, direction.x);
      targetScaleX = 1 + stretchAmount;
      targetScaleY = 1 - stretchAmount * 0.54;
      targetScaleZ = 1 - stretchAmount * 0.36;
    }
  }

  const rotationDelta = Math.atan2(
    Math.sin(targetRotationY - ballMesh.rotation.y),
    Math.cos(targetRotationY - ballMesh.rotation.y),
  );
  ballMesh.rotation.y += rotationDelta * BALL_STRETCH_EASE;
  ballMesh.scale.x = THREE.MathUtils.lerp(ballMesh.scale.x, targetScaleX, BALL_STRETCH_EASE);
  ballMesh.scale.y = THREE.MathUtils.lerp(ballMesh.scale.y, targetScaleY, BALL_STRETCH_EASE);
  ballMesh.scale.z = THREE.MathUtils.lerp(ballMesh.scale.z, targetScaleZ, BALL_STRETCH_EASE);

  const heatRatio = getBallHeatRatio(state.ball);
  const heatColor = new THREE.Color(0xff7f45);
  const hotCore = new THREE.Color(0xffe4b3);
  ballMesh.material.color.copy(palette.ball).lerp(heatColor, heatRatio * 0.82);
  ballMesh.material.emissive.copy(heatColor).lerp(hotCore, heatRatio * 0.38);
  ballMesh.material.emissiveIntensity = heatRatio * 1.8;
  ballShadow.material.opacity = 0.28 + heatRatio * 0.12;
}

function resetBallRenderState() {
  ballGroup.visible = true;
  ballGroup.scale.setScalar(1);
  ballMesh.position.y = ballRestY;
  ballMesh.rotation.set(0, 0, 0);
  ballMesh.scale.set(1, 1, 1);
  ballMesh.material.color.copy(palette.ball);
  ballMesh.material.emissive.setHex(0x000000);
  ballMesh.material.emissiveIntensity = 0;
  ballShadow.material.opacity = 0.28;
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
  const previewLocked = isLaunchLockedByIce();
  aimLine.material.opacity = previewLocked ? 0.38 : 0.9;
  dragHandle.material.opacity = previewLocked ? 0.42 : 0.95;

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
  let launchCheckpoint = null;
  if (!state.adminReplay.active) {
    launchCheckpoint = saveUndoCheckpoint();
  }
  if (!launchCheckpoint) {
    launchCheckpoint = createCurrentCheckpoint();
  }
  state.currentFlightStartCheckpoint = cloneCheckpoint(launchCheckpoint);
  const activeStageIndex = getActiveStageIndex();
  const launchPlanetIndex = state.ball.anchorPlanetIndex;
  const launchDirection = constrainLaunchDirection(direction, power);
  const relativeVelocity = launchVelocity(launchDirection, power);
  const launchBodyVelocity = launchPlanetIndex !== null
    ? getPlanetVelocity(state.level, launchPlanetIndex, state.ball.time ?? state.level.time ?? 0)
    : { x: 0, y: 0 };
  const launchSurfaceVelocity = launchPlanetIndex !== null
    ? getPlanetSurfaceVelocity(state.level, launchPlanetIndex, state.ball.anchorNormal, state.ball)
    : { x: 0, y: 0 };
  const velocity = {
    x: relativeVelocity.x + launchBodyVelocity.x + launchSurfaceVelocity.x,
    y: relativeVelocity.y + launchBodyVelocity.y + launchSurfaceVelocity.y,
  };
  state.ball.velocity.x = velocity.x;
  state.ball.velocity.y = velocity.y;
  state.ball.launchGracePlanetIndex = launchPlanetIndex;
  state.ball.anchorPlanetIndex = null;
  state.ball.anchorNormal = null;
  state.ball.anchorSinceTime = state.ball.time ?? state.level.time ?? 0;
  state.ball.portalCooldown = 0;
  state.ball.landedPlanetIndex = null;
  state.ball.landedPlanetName = '';
  state.currentFlightLaunchState = cloneBallPlaybackState(state.ball);
  state.shots += 1;
  beginAttemptTrail();
  state.dragActive = false;
  state.dragPower = 0;
  setControlShot(activeStageIndex, angleDegFromDirection(launchDirection), power);
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragStartWorld, state.ball.position);
  state.roundSettled = false;
  state.message = `Flight underway. ${state.level.name}.`;
  state.hint = state.level.summary;
  syncHud();
}

function onPointerDown(event) {
  if (
    state.worldMap.open
    || state.gameOver.open
    || state.goalCloseAnimation.active
    || ballIsMoving()
    || state.adminReplay.active
    || state.undo.active
  ) {
    return;
  }

  const point = getWorldPointFromEvent(event);
  state.dragActive = true;
  setVec(state.dragStartWorld, point);
  setVec(state.dragPointerWorld, point);
  renderer.domElement.setPointerCapture(event.pointerId);
  updateDragState(point);
  const slidingIcePlanet = getAnchoredIcePlanet();
  if (slidingIcePlanet && isLaunchLockedByIce()) {
    const remaining = getIceLaunchLockRemaining(slidingIcePlanet);
    state.message = 'Aim while the ball settles.';
    state.hint = `Hold the drag. Launch unlocks in ${remaining.toFixed(1)}s.`;
  } else {
    state.message = 'Stretch and release.';
    state.hint = 'Point the pull where you want the launch to begin.';
  }
  syncHud();
}

function onPointerMove(event) {
  if (ballIsMoving() || !state.dragActive) {
    return;
  }

  const point = getWorldPointFromEvent(event);
  setVec(state.dragPointerWorld, point);
  updateDragState(point);
  if (isLaunchLockedByIce()) {
    const remaining = getIceLaunchLockRemaining(getAnchoredIcePlanet());
    state.message = 'Aim while the ball settles.';
    state.hint = `Burn loaded: ${state.dragPower.toFixed(2)} / ${MAX_DRAG_DISTANCE.toFixed(1)} · unlocks in ${remaining.toFixed(1)}s`;
  } else {
    state.message = 'Release to launch.';
    state.hint = `Burn loaded: ${state.dragPower.toFixed(2)} / ${MAX_DRAG_DISTANCE.toFixed(1)}`;
  }
  syncHud();
}

function onPointerUp(event) {
  if (!state.dragActive) {
    return;
  }

  renderer.domElement.releasePointerCapture(event.pointerId);

  if (state.dragPower > 0.12) {
    if (isLaunchLockedByIce()) {
      const remaining = getIceLaunchLockRemaining(getAnchoredIcePlanet());
      state.dragActive = false;
      state.dragPower = 0;
      setVec(state.dragAnchor, state.ball.position);
      setVec(state.dragStartWorld, state.ball.position);
      state.message = 'Ball still sliding.';
      state.hint = `Wait ${remaining.toFixed(1)}s more before releasing the shot.`;
      syncHud();
      return;
    }
    launchShot(state.aimDirection, state.dragPower, state.dragAnchor);
    return;
  }

  state.dragActive = false;
  state.dragPower = 0;
  setVec(state.dragAnchor, state.ball.position);
  setVec(state.dragStartWorld, state.ball.position);
  state.message = 'Launch cancelled.';
  state.hint = 'Grab the ball and pull back to start the run.';
  syncHud();
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', onPointerUp);
renderer.domElement.addEventListener('pointercancel', onPointerUp);

function restartLevel() {
  if (!canRetryLevel()) {
    return;
  }

  if (state.gameOver.open) {
    state.timeSpeedIndex = state.resumeTimeSpeedIndex;
  }

  resetBall(
    `Level ${state.levelIndex + 1}: ${state.level.name}.`,
    state.level.summary,
    { countReset: state.gameOver.countReset || false },
  );
}

retryButton.addEventListener('click', restartLevel);
undoButton.addEventListener('click', startUndo);
gameOverRetryButton.addEventListener('click', restartLevel);
gameOverUndoButton.addEventListener('click', startUndo);
worldMapContinueButton.addEventListener('click', continueFromWorldMap);
worldMapReplayButton.addEventListener('click', playSelectedWorldAgain);
worldMapNodes.addEventListener('click', (event) => {
  const node = event.target.closest('[data-world-index]');
  if (!node || node.disabled) {
    return;
  }

  const selectedWorldIndex = Number.parseInt(node.dataset.worldIndex, 10);
  if (!Number.isFinite(selectedWorldIndex)) {
    return;
  }

  state.worldMap.selectedWorldIndex = clamp(selectedWorldIndex, 0, WORLD_DEFINITIONS.length - 1);
  syncWorldMap();
});
timeSpeedSlider.addEventListener('input', (event) => {
  const nextIndex = clamp(Number.parseInt(event.target.value, 10), 0, TIME_SPEED_VALUES.length - 1);
  state.timeSpeedIndex = nextIndex;
  if ((TIME_SPEED_VALUES[nextIndex] ?? 0) > 0) {
    state.resumeTimeSpeedIndex = nextIndex;
  }
  syncHud();
});

debugTuningInputs.forEach((input) => {
  input.addEventListener('input', (event) => {
    const key = event.target.dataset.debugTuning;
    if (!key || !(key in state.debug.tuning)) {
      return;
    }
    const rawValue = Number.parseFloat(event.target.value);
    state.debug.tuning[key] = key === 'starCount'
      ? Math.round(rawValue)
      : rawValue;
    syncDebugTuningPanel();
  });
});

function isEditableShortcutTarget(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target?.isContentEditable;
}

window.addEventListener('keydown', (event) => {
  if (isEditableShortcutTarget(event.target)) {
    return;
  }

  if (state.worldMap.open) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      continueFromWorldMap();
    }
    return;
  }

  if (!event.altKey && !event.shiftKey && event.code === 'KeyZ') {
    event.preventDefault();
    startUndo();
    return;
  }

  if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && event.code === 'KeyR') {
    event.preventDefault();
    restartLevel();
    return;
  }

  if (!event.metaKey && !event.ctrlKey && !event.altKey && event.shiftKey && event.code === 'KeyF') {
    event.preventDefault();
    toggleFpsOverlay();
    return;
  }

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
  if (updateVibeJamPortalEntry(delta)) {
    return;
  }

  if (state.worldMap.open) {
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    return;
  }

  if (state.goalCloseAnimation.active) {
    state.goalCloseAnimation.elapsed += delta;
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    if (
      state.goalCloseAnimation.elapsed
      >= GOAL_CLOSE_ANIMATION_DURATION + GOAL_CLOSE_MODAL_DELAY
    ) {
      const hint = state.goalCloseAnimation.hint;
      const countReset = state.goalCloseAnimation.countReset;
      hideGoalCloseAnimation();
      showGameOverModal('goal-closed', hint, { countReset });
    }
    return;
  }

  if (state.gameOver.open) {
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    return;
  }

  if (state.undo.active) {
    if (!state.rewindPlayback.active) {
      finishUndo();
      return;
    }

    updateLandingRewindPlayback(UNDO_REWIND_SPEED);
    return;
  }

  if (state.rewindPlayback.active) {
    updateLandingRewindPlayback();
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
      const completedLevelIndex = state.levelIndex;
      const nextIndex = (state.levelIndex + 1) % LEVELS.length;
      const nextLevel = LEVELS[nextIndex];
      recordCompletedWorldLevelStats(completedLevelIndex);
      if (shouldShowWorldMapAfterLevel(completedLevelIndex, nextIndex)) {
        state.score += 1;
        showWorldMap(nextIndex, completedLevelIndex + 1);
        return;
      }
      resetBall(
        `Level ${nextIndex + 1}: ${nextLevel.name}.`,
        nextLevel.summary,
        { scored: true, advanceLevel: true },
      );
    }
    return;
  }

  if (state.ball.crashed) {
    if (state.ball.crashKind === 'sun' || state.ball.crashKind === 'pulsar' || state.ball.crashKind === 'turret' || state.ball.crashKind === 'planet' || state.ball.crashKind === 'lava' || state.ball.crashKind === 'asteroid') {
      const solarCrash = state.ball.crashKind === 'sun' || state.ball.crashKind === 'pulsar' || state.ball.crashKind === 'turret';
      const meteorPlanetCrash = state.ball.crashReason === 'meteor' && state.ball.crashPlanetIndex !== null && state.ball.crashPlanetIndex !== undefined;
      const crashDuration = meteorPlanetCrash
        ? METEOR_PLANET_EXPLOSION_SECONDS
        : solarCrash
          ? 1 / 4.8
          : state.ball.crashKind === 'lava'
            ? 1 / 5
            : 1 / 4.3;
      state.ball.transition += delta / crashDuration;
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
      ballMesh.position.y = THREE.MathUtils.lerp(
        ballRestY,
        solarCrash ? -0.18 : -0.12,
        t,
      );
      ballGroup.scale.setScalar(
        Math.max(0.04, 1 - t * (solarCrash ? 0.94 : 0.88)),
      );
      ballShadow.material.opacity = 0.28 * (1 - t);
      if (state.ball.crashKind === 'turret') {
        ballMesh.material.color.copy(palette.ball).lerp(new THREE.Color(0xff5058), Math.min(1, t * 1.15));
        ballMesh.material.emissive.setHex(0xff3040);
        ballMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0.2, 2.8, t);
      } else if (solarCrash) {
        ballMesh.material.color.copy(palette.ball).lerp(palette.band, Math.min(1, t * 1.1));
        ballMesh.material.emissive.copy(palette.band);
        ballMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0, 2.4, t);
      } else if (state.ball.crashKind === 'lava') {
        ballMesh.material.color.copy(new THREE.Color(0xffb16f)).lerp(new THREE.Color(0xff5f24), Math.min(1, t * 1.15));
        ballMesh.material.emissive.setHex(0xff692b);
        ballMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0.8, 2.8, t);
      } else {
        ballMesh.material.color.copy(palette.ball).lerp(new THREE.Color(0xd39c76), Math.min(1, t * 0.85));
        ballMesh.material.emissive.setHex(0x000000);
        ballMesh.material.emissiveIntensity = 0;
      }

      if (t >= 1) {
        ballGroup.visible = false;
        showGameOverModal(
          solarCrash
            ? state.ball.crashKind
            : state.ball.crashKind === 'lava'
              ? 'lava'
              : state.ball.crashKind === 'asteroid'
                ? state.ball.crashReason
              : state.ball.crashReason,
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
      showGameOverModal(state.ball.crashKind === 'planet' ? state.ball.crashReason : 'bounds', state.hint, { countReset: true });
    }
    return;
  }

    if (lengthSq(state.ball.velocity) < 0.000001) {
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    if (state.ball.anchorPlanetIndex !== null && state.ball.anchorPlanetIndex !== undefined) {
      if (getTimeSpeedValue() < 0 && startLandingRewindPlayback()) {
        return;
      }
      const currentTime = state.ball.time ?? state.level.time ?? 0;
      const timeSpeed = state.adminReplay.active ? 1 : getEffectiveTimeSpeedValue();
      const minTime = state.level.startTimeSeconds ?? 0;
      const nextTime = Math.max(minTime, currentTime + delta * timeSpeed);
      const appliedDelta = nextTime - currentTime;
      if (Math.abs(appliedDelta) > 0.000001) {
        setLevelTime(state.level, nextTime);
        state.ball.time = nextTime;
        if (maybeCrashAnchoredBallOnConsumedPlanet()) {
          return;
        }
        const anchorResult = advanceBallAnchor(state.level, state.ball, appliedDelta);
        if (anchorResult?.type === 'crash') {
          const anchoredMessage = anchorResult.reason === 'turret'
            ? 'Shot down by a turret.'
            : anchorResult.reason === 'planet-vanished'
              ? 'Planet vanished.'
              : anchorResult.reason === 'meteor'
                ? 'Meteor impact.'
              : anchorResult.reason === 'planet-consumed'
                ? 'Consumed by the sun.'
                : 'Burned on the lava world.';
          beginCrash(
            anchoredMessage,
            describeFailureHint(anchorResult.reason ?? 'lava'),
            anchorResult.reason === 'turret'
              ? 'turret'
              : anchorResult.reason === 'planet-vanished'
                ? 'planet'
                : anchorResult.reason === 'meteor'
                  ? 'asteroid'
                : anchorResult.reason === 'planet-consumed'
                  ? 'sun'
                  : 'lava',
            anchorResult.eventState ?? null,
            anchorResult.displayEventState ?? null,
            anchorResult.planetIndex ?? null,
            anchorResult.reason ?? 'lava',
            anchorResult.crashTargetPosition ?? null,
            { turret: anchorResult.turret ?? null },
          );
          return;
        }
      }
      if (isPointInPulsarJets(state.level, state.ball.position, state.ball.time ?? state.level.time ?? 0)) {
        beginPulsarCrash();
        return;
      }
      if (maybeLaunchAdminReplayShot()) {
        return;
      }
      if (state.dragActive) {
        updateDragState(state.dragPointerWorld);
      }
      if (Math.abs(appliedDelta) > 0.000001) {
        recordFlightHistorySample();
      }
      if (timeSpeed < 0 && nextTime <= minTime + 0.0001) {
        clampTimeSpeedToNonNegative();
      }
      if (maybeEnterVibeJamPortal()) {
        return;
      }
      if (!isGoalLocked(state.level) && !isGoalOpen(state.level, state.ball.time)) {
        beginGoalClosure(describeFailureHint('goal-closed'), { countReset: true });
      }
      return;
    }
    if (!state.roundSettled) {
      showGameOverModal('settled', describeFailureHint('settled'), { countReset: true });
    }
    return;
  }

  const result = stepBall(state.level, state.ball, delta);
  recordFlightHistorySample();
  recordPortalFlightEvent(result.portalEvent ?? null);
  recordAttemptTrailPoint();
  if (maybeEnterVibeJamPortal()) {
    return;
  }
  if (result.type === 'goal') {
    beginGoal(result);
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
        : result.reason === 'planet-consumed'
          ? 'Consumed by the sun.'
        : result.reason === 'planet-vanished'
          ? 'Planet vanished.'
        : result.reason === 'sun'
          ? 'Burned in the sun.'
            : result.reason === 'pulsar'
              ? 'Caught in the pulsar jet.'
            : result.reason === 'split-side'
              ? 'Wrong side.'
              : result.reason === 'lava'
                ? 'Burned on the lava world.'
                : result.reason === 'turret'
                  ? 'Shot down by a turret.'
                : result.reason === 'meteor'
                  ? 'Meteor impact.'
                : result.reason === 'asteroid'
                  ? 'Asteroid impact.'
                : result.reason === 'planet'
                  ? 'Planet impact.'
                  : 'Lost in open space.';
    const hint = describeFailureHint(result.reason);
    beginCrash(
      message,
      hint,
      result.reason === 'sun' || result.reason === 'pulsar' || result.reason === 'turret' || result.reason === 'asteroid'
        ? result.reason
        : result.reason === 'meteor'
          ? 'asteroid'
        : result.reason === 'planet-consumed'
          ? 'sun'
        : result.reason === 'planet-vanished'
          ? 'planet'
        : result.reason === 'lava'
          ? 'lava'
          : (result.reason === 'planet' || result.reason === 'split-side')
            ? 'planet'
            : 'bounds',
      result.eventState ?? null,
      result.displayEventState ?? null,
      result.planetIndex ?? null,
      result.reason ?? message,
      result.crashTargetPosition ?? null,
      { turret: result.turret ?? null },
    );
    return;
  }

  if (result.type === 'settled' && !state.roundSettled) {
    finalizeAttemptTrail('settled');
    showGameOverModal('settled', describeFailureHint('settled'), { countReset: true });
  }
}

function updateDecor(time, delta = 0) {
  const worldTime = state.level.time ?? 0;
  const goalLocked = isGoalLocked(state.level);
  const goalOpen = isGoalOpen(state.level, worldTime);
  const goalTimeLeft = getGoalRemainingTime(state.level, worldTime);
  const goalTimerFraction = getGoalRemainingFraction(state.level, worldTime);
  const showGoalTimer = Number.isFinite(goalTimeLeft) && Number.isFinite(goalTimerFraction);
  const goalRevealProgress = state.level.goalUnlockRequired && state.level.goalUnlocked
    ? clamp(
      (worldTime - (state.level.goalUnlockTime ?? worldTime)) / GOAL_UNLOCK_REVEAL_DURATION,
      0,
      1,
    )
    : 1;
  const goalRevealEase = THREE.MathUtils.smootherstep(goalRevealProgress, 0, 1);
  const goalRevealFlash = 1 - goalRevealEase;
  const goalCloseAnimationProgress = state.goalCloseAnimation.active
    ? clamp(state.goalCloseAnimation.elapsed / GOAL_CLOSE_ANIMATION_DURATION, 0, 1)
    : 0;
  const keepGoalCollapsed = state.goalCloseAnimation.active || (state.gameOver.open && state.gameOver.reason === 'goal-closed');
  const goalCloseProgress = keepGoalCollapsed
    ? (state.goalCloseAnimation.active ? goalCloseAnimationProgress : 1)
    : 0;
  runStatusPill.textContent = getRunStatusText();
  windowStatusPill.textContent = getWindowStatusText();
  windowStatusPill.classList.toggle('is-hot', goalTimeLeft < 2.5);
  heatStatusPill.textContent = getHeatStatusText();
  heatStatusPill.classList.toggle('is-hot', getBallHeatRatio(state.ball) > 0.18);
  heatStatusPill.classList.toggle('is-danger', Boolean(getAnchoredLavaPlanet()));
  const lavaPlanet = getAnchoredLavaPlanet();
  if (lavaPlanet && !state.ball.crashed && !state.ball.goaling && !state.dragActive) {
    statusHint.textContent = `Launch before ${getLavaOverheatRemainingText(lavaPlanet)}s or the ball burns through.`;
  }
  updateSunVisual();
  syncPlanetCollapseEffects();
  updatePlanetExplosions(Math.abs(delta));
  updatePulsarJets(time);
  updateLaunchMarker();
  startPad.scale.setScalar(1 + Math.sin(time * 2.7) * 0.06);
  startCore.material.opacity = 0.58 + Math.sin(time * 3.8) * 0.12;
  const sunVisualRadius = getPrimarySunVisualRadius(state.level, worldTime);
  const redGiantProgress = getRedGiantProgress(state.level, worldTime);
  const redGiantSunScale = state.level.redGiant ? sunVisualRadius / 0.42 : 1;
  sunGlow.scale.setScalar(redGiantSunScale * (state.level.redGiant ? 1 + redGiantProgress * 0.18 : 1) * (1 + Math.sin(time * 1.2) * 0.08));
  sunGlow.material.opacity = (0.16 + Math.sin(time * 1.6) * 0.03) * (state.level.redGiant ? 1.18 : 1);
  sunCorona.rotation.z = time * 0.28;
  sunCorona.scale.setScalar(redGiantSunScale * (state.level.redGiant ? 1.05 + redGiantProgress * 0.12 : 1));
  sunCorona.material.opacity = (0.3 + Math.sin(time * 2.1) * 0.04) * (state.level.redGiant ? 1.12 : 1);
  sunCore.rotation.y = time * 0.22;
  extraSunVisuals.forEach((visual, index) => {
    visual.group.position.set(visual.solarBody.position.x, 0, visual.solarBody.position.y);
    visual.glow.scale.setScalar(1 + Math.sin(time * (1.4 + index * 0.16)) * 0.08);
    visual.glow.material.opacity = 0.14 + Math.sin(time * 1.8 + index) * 0.03;
    visual.corona.rotation.z = time * (0.24 + index * 0.08);
    visual.corona.material.opacity = 0.24 + Math.sin(time * 2 + index) * 0.04;
    visual.core.rotation.y = time * (0.18 + index * 0.06);
  });
  portalVisuals.forEach((visual, index) => {
    visual.group.position.set(visual.portal.position.x, 0, visual.portal.position.y);
    visual.ring.rotation.z = time * (visual.portal.variant === 'white' ? 0.9 : -0.75);
    visual.aura.scale.setScalar(1 + Math.sin(time * (2.6 + index * 0.2) + index) * 0.08);
    visual.aura.material.opacity = 0.09 + Math.sin(time * 2.2 + index) * 0.03;
    visual.ring.material.opacity = 0.72 + Math.sin(time * 3 + index) * 0.08;
  });
  vibeJamPortalVisuals.forEach((visual, index) => {
    visual.group.position.set(visual.portal.position.x, 0, visual.portal.position.y);
    visual.outerRing.rotation.z = time * (visual.portal.kind === 'return' ? -1 : 1.05);
    visual.innerRing.rotation.z = -time * (1.6 + index * 0.18);
    visual.aura.scale.setScalar(1 + Math.sin(time * 2.8 + index) * 0.1);
    visual.aura.material.opacity = 0.12 + Math.sin(time * 2.3 + index) * 0.04;
    visual.outerRing.material.opacity = 0.78 + Math.sin(time * 3.4 + index) * 0.08;
    visual.innerRing.material.opacity = 0.5 + Math.sin(time * 4.1 + index) * 0.12;
  });
  dustCloudVisuals.forEach((visual, index) => {
    const opacity = visual.cloud.opacity ?? 1;
    visual.group.position.set(visual.cloud.position.x, 0, visual.cloud.position.y);
    visual.group.rotation.y = Math.sin(time * 0.18 + index) * 0.05;
    visual.haze.rotation.z = visual.hazeRotation + time * (0.08 + index * 0.015);
    visual.body.rotation.z = visual.bodyRotation - time * (0.045 + index * 0.007);
    visual.ember.rotation.z = visual.emberRotation + time * (0.12 + index * 0.016);
    visual.haze.material.opacity = (0.38 + Math.sin(time * 1.4 + index) * 0.06) * opacity;
    visual.body.material.opacity = (0.8 + Math.sin(time * 1.1 + index * 0.6) * 0.08) * opacity;
    visual.ember.material.opacity = (0.42 + Math.sin(time * 2.2 + index) * 0.08) * opacity;
    visual.boundary.rotation.z = -time * (0.08 + index * 0.01);
    visual.boundaryGlow.rotation.z = time * (0.12 + index * 0.012);
    visual.boundary.material.opacity = (0.28 + Math.sin(time * 2 + index) * 0.06) * opacity;
    visual.boundaryGlow.material.opacity = (0.07 + Math.sin(time * 2.5 + index) * 0.025) * opacity;
    visual.haze.scale.set(1 + Math.sin(time * 0.9 + index) * 0.035, 1 + Math.cos(time * 0.7 + index) * 0.025, 1);
    visual.body.scale.set(1 + Math.sin(time * 0.8 + index * 0.7) * 0.045, 1 + Math.cos(time * 0.95 + index) * 0.035, 1);
    visual.ember.scale.set(1 + Math.sin(time * 1.2 + index * 0.5) * 0.06, 1 + Math.cos(time * 1.1 + index) * 0.045, 1);
  });

  asteroidVisuals.forEach((visual, index) => {
    visual.group.position.set(visual.asteroid.position.x, 0, visual.asteroid.position.y);
    visual.body.rotation.y += (visual.asteroid.spinSpeed ?? 0.24) * 0.012;
    visual.body.rotation.x += (visual.asteroid.spinSpeed ?? 0.24) * 0.004;
    visual.halo.material.opacity = 0.1 + Math.sin(time * 2.1 + index) * 0.025;
  });

  meteorVisuals.forEach((visual, index) => {
    const meteor = visual.meteor;
    const target = meteor.targetPosition ?? meteor.position;
    const dx = target.x - meteor.position.x;
    const dy = target.y - meteor.position.y;
    const angle = Math.atan2(dx, dy);
    const visible = meteor.active;

    visual.group.visible = visible;
    visual.group.position.set(meteor.position.x, 0, meteor.position.y);
    visual.group.rotation.y = angle;
    visual.body.rotation.y += 0.035 + index * 0.002;
    visual.body.rotation.x += 0.018;
    visual.body.scale.setScalar(1);
    visual.halo.scale.setScalar(1);
    visual.trail.scale.y = meteor.active ? 1 + (meteor.progress ?? 0) * 0.55 : 0.2;
    visual.trail.material.opacity = meteor.active ? 0.32 + Math.sin(time * 9 + index) * 0.06 : 0;
    visual.halo.material.opacity = meteor.active ? 0.16 + Math.sin(time * 7.2 + index) * 0.04 : 0;
    visual.body.material.opacity = visible ? 1 : 0;
  });

  const gravityFieldRefreshDue =
    worldTime < lastGravityFieldRefreshTime || worldTime - lastGravityFieldRefreshTime >= 0.16;

  if (gravityFieldRefreshDue && !state.dragActive) {
    rebuildGravityField();
    lastGravityFieldRefreshTime = worldTime;
  }

  if (gravityFieldVisuals) {
    const tuning = state.debug.tuning;
    gravityFieldVisuals.glow.material.opacity = clamp(
      tuning.gridGlowOpacity + Math.sin(time * 1.6) * tuning.gridGlowOpacity * 0.18,
      0,
      1,
    );
    gravityFieldVisuals.core.material.opacity = clamp(
      tuning.gridCoreOpacity + Math.sin(time * 2 + 0.6) * tuning.gridCoreOpacity * 0.1,
      0,
      1,
    );
  }

  setGoalTimerArc(goalTimerFraction);

  if (keepGoalCollapsed) {
    const collapseEase = THREE.MathUtils.smootherstep(goalCloseProgress, 0, 1);
    blackHoleDisc.visible = true;
    blackHoleRing.visible = true;
    blackHoleDisc.material.color.setHex(0x202832);
    blackHoleDisc.scale.setScalar(1 - collapseEase * 0.92);
    blackHoleRing.rotation.z = time * 0.2 - collapseEase * 0.9;
    blackHoleRing.scale.setScalar(1 - collapseEase * 0.78);
    blackHoleRing.material.opacity = Math.max(0, 0.48 - collapseEase * 0.44);
    goalTimerTrack.material.opacity = 0;
    goalTimerArc.material.opacity = 0;
  } else if (goalLocked) {
    blackHoleDisc.visible = false;
    blackHoleRing.visible = false;
    goalTimerTrack.material.opacity = 0;
    goalTimerArc.material.opacity = 0;
  } else {
    blackHoleDisc.visible = true;
    blackHoleRing.visible = true;
    blackHoleDisc.material.color.copy(
      goalOpen
        ? mixColors(new THREE.Color(0x8d7aff), palette.blackHole, goalRevealEase)
        : mixColors(new THREE.Color(0x5f6677), new THREE.Color(0x191f26), goalRevealEase),
    );
    blackHoleDisc.scale.setScalar(THREE.MathUtils.lerp(0.62, 1, goalRevealEase));
    blackHoleRing.rotation.z = time * (goalOpen ? 0.9 : 0.25) + (1 - goalRevealEase) * 1.2;
    blackHoleRing.scale.setScalar(
      THREE.MathUtils.lerp(
        2.15,
        goalOpen ? 1 + Math.sin(time * 4.2) * 0.08 : 0.92,
        goalRevealEase,
      ),
    );
    blackHoleRing.material.opacity = Math.max(
      0.22 * goalRevealFlash,
      goalOpen
        ? 0.46 + (showGoalTimer ? goalTimerFraction * 0.12 : 0) + Math.sin(time * 4.2) * 0.04
        : 0.18
    ) * Math.max(0.35, goalRevealEase);
    goalTimerTrack.material.opacity = showGoalTimer ? (goalOpen ? 0.22 : 0.08) : 0;
    goalTimerArc.material.opacity = showGoalTimer && goalOpen
      ? 0.56 + goalTimerFraction * 0.28 + Math.sin(time * 5.6) * 0.03
      : 0;
  }
  goalTimerTrack.visible = showGoalTimer;
  goalTimerArc.visible = showGoalTimer && goalTimerArc.visible;
  goalTimerArc.material.color.setHex(goalTimeLeft < 2.5 ? 0xff9f6e : 0x8fffe3);

  planetVisuals.forEach((visual, visualIndex) => {
    const index = visual.planet.index ?? visualIndex;
    const pulse = 1 + Math.sin(time * (1.5 + visualIndex * 0.35) + visualIndex) * 0.05;
    const isLandable = Boolean(visual.planet.landable);
    const relayPulse = state.ball.landedPlanetIndex === index ? state.relayPulse : 0;
    const meteorExplosionAge = (
      visual.planet.collapseState === 'meteor-destroyed'
      && Number.isFinite(visual.planet.meteorDestroyedAt)
    ) ? worldTime - visual.planet.meteorDestroyedAt : Number.POSITIVE_INFINITY;
    const meteorExplosionProgress = clamp(meteorExplosionAge / METEOR_PLANET_EXPLOSION_SECONDS, 0, 1);
    const meteorExplosionVisible = meteorExplosionAge >= 0 && meteorExplosionAge < METEOR_PLANET_EXPLOSION_SECONDS;
    const meteorBreakProgress = clamp(meteorExplosionAge / METEOR_PLANET_BREAK_DELAY_SECONDS, 0, 1);
    const meteorExplosionEase = meteorExplosionVisible
      ? 1 - THREE.MathUtils.smootherstep(meteorBreakProgress, 0, 1)
      : 0;
    const planetVisibility = Math.max(
      visual.planet.infallFade ?? (visual.planet.active === false ? 0 : 1),
      meteorExplosionVisible ? meteorExplosionEase : 0,
    );
    const isFlickerPlanet = Boolean(visual.planet.flicker);
    const darkSideExposure = isFlickerPlanet ? clamp(1 - planetVisibility, 0, 1) : 0;
    const collisionPulse = visual.planet.collisionPulse ?? 0;
    visual.group.position.set(visual.planet.position.x, 0, visual.planet.position.y);
    visual.group.visible = planetVisibility > 0.02 || isFlickerPlanet;
    visual.body.visible = planetVisibility > 0.02 || isFlickerPlanet;
    visual.orbitPath.visible = planetVisibility > 0.02 || isFlickerPlanet;
    visual.group.scale.setScalar((isFlickerPlanet ? 1 : 0.72 + planetVisibility * 0.28) * (1 + collisionPulse * 0.08));
    visual.glow.material.opacity = isLandable
      ? ((0.13 + Math.sin(time * 2 + index) * 0.03 + relayPulse * 0.12) * planetVisibility) + (meteorExplosionVisible ? meteorExplosionEase * 0.55 : 0)
      : ((0.16 + Math.sin(time * 1.7 + index) * 0.04) * planetVisibility) + (meteorExplosionVisible ? meteorExplosionEase * 0.55 : 0);
    visual.orbitRing.rotation.z = time * (0.35 + index * 0.12);
    const textureRotationOffset = visual.planet.surfaceType === 'lava' ? Math.PI * 0.72 : 0;
    const flickerFlip = isFlickerPlanet
      ? THREE.MathUtils.smootherstep(darkSideExposure, 0, 1) * Math.PI
      : 0;
    visual.body.rotation.x = flickerFlip;
    visual.body.rotation.y = textureRotationOffset - worldTime * (visual.planet.spinSpeed ?? 0);
    visual.body.material.color.setHex(0xffffff);
    visual.body.material.emissiveIntensity = ((visual.planet.emissive ?? 0.12) + relayPulse * 0.45 + collisionPulse * 0.45) * planetVisibility;
    if (visual.atmosphereShell) {
      visual.atmosphereShell.rotation.x = flickerFlip;
      visual.atmosphereShell.rotation.y = textureRotationOffset - worldTime * (visual.planet.spinSpeed ?? 0) * 0.85;
      visual.atmosphereShell.material.opacity = isLandable
        ? (0.13 + Math.sin(time * 2.8 + index) * 0.025) * planetVisibility
        : (0.11 + Math.sin(time * 1.9 + index) * 0.02) * planetVisibility;
    }
    if (visual.accentBand) {
      visual.accentBand.rotation.z = 0.34 + time * (0.24 + index * 0.03);
      visual.accentBand.material.opacity = (0.24 + Math.sin(time * 2.2 + index) * 0.04) * planetVisibility;
    }
    if (visual.splitSafeDisc && visual.splitHazardDisc) {
      const splitAxis = getPlanetSplitAxis(visual.planet, worldTime);
      const splitAngle = Math.atan2(splitAxis.y, splitAxis.x);
      visual.splitSafeDisc.rotation.z = -splitAngle;
      visual.splitHazardDisc.rotation.z = -splitAngle;
      visual.splitSafeDisc.material.opacity = (0.31 + Math.sin(time * 2.6 + index) * 0.035) * planetVisibility;
      visual.splitHazardDisc.material.opacity = (0.42 + Math.sin(time * 2.1 + index) * 0.04) * planetVisibility;
    }
    if (visual.landingRing) {
      const selected = state.ball.landedPlanetIndex === index;
      visual.landingRing.scale.setScalar(1 + relayPulse * 0.18);
      visual.landingRing.material.opacity = (selected
        ? 0.34 + Math.sin(time * 4.4) * 0.06 + relayPulse * 0.28
        : 0.16 + Math.sin(time * 3 + index) * 0.03) * planetVisibility;
      if (visual.planet.surfaceType === 'ice') {
        visual.landingRing.material.opacity += 0.08 * planetVisibility;
      } else if (visual.planet.surfaceType === 'lava') {
        visual.landingRing.material.opacity += 0.06 * planetVisibility;
      }
      visual.orbitRing.material.opacity = (selected ? 0.9 : 0.62 + Math.sin(time * 2.5 + index) * 0.06) * planetVisibility;
      visual.orbitPath.material.opacity = (selected ? 0.5 : 0.22 + Math.sin(time * 1.6 + index) * 0.025) * planetVisibility;
    } else {
      visual.orbitRing.material.opacity = (0.38 + Math.sin(time * 1.8 + index) * 0.04) * planetVisibility;
      visual.orbitPath.material.opacity = (0.14 + Math.sin(time * 1.4 + index) * 0.02) * planetVisibility;
    }
    if (visual.iceSkidArc) {
      const selected = state.ball.anchorPlanetIndex === index;
      const slideSpeed = selected ? getIceSlideVisualSpeed(visual.planet, state.ball) : 0;
      visual.iceSkidArc.visible = selected && Math.abs(slideSpeed) > 0.02;
      if (visual.iceSkidArc.visible) {
        const anchorAngle = Math.atan2((state.ball.anchorNormal ?? { x: 1, y: 0 }).y, (state.ball.anchorNormal ?? { x: 1, y: 0 }).x);
        visual.iceSkidArc.rotation.z = -anchorAngle + (slideSpeed >= 0 ? -0.24 : 0.24);
        visual.iceSkidArc.material.opacity = Math.min(0.48, 0.18 + Math.abs(slideSpeed) * 0.22) * planetVisibility;
        visual.iceSkidArc.scale.setScalar(1 + Math.min(0.12, Math.abs(slideSpeed) * 0.05));
      }
    }
    if (visual.iceHaloRing) {
      visual.iceHaloRing.material.opacity = (0.28 + Math.sin(time * 2.6 + index) * 0.04) * planetVisibility;
      visual.iceHaloRing.scale.setScalar(1 + Math.sin(time * 2 + index) * 0.025);
    }
    if (visual.iceInnerRing) {
      visual.iceInnerRing.material.opacity = (0.18 + Math.sin(time * 3.1 + index) * 0.04) * planetVisibility;
      visual.iceInnerRing.rotation.z = time * (0.16 + index * 0.01);
    }
    if (visual.lavaHaloRing) {
      const anchoredLava = state.ball.anchorPlanetIndex === index ? getBallHeatRatio(state.ball) : 0;
      visual.lavaHaloRing.material.opacity = (0.22 + Math.sin(time * 3.1 + index) * 0.05 + anchoredLava * 0.24) * planetVisibility;
      visual.lavaHaloRing.scale.setScalar(1 + Math.sin(time * 2.8 + index) * 0.035 + anchoredLava * 0.08);
    }
    if (visual.lavaWarningRing) {
      const selected = state.ball.anchorPlanetIndex === index;
      const heatRatio = selected ? getBallHeatRatio(state.ball) : 0;
      visual.lavaWarningRing.material.opacity = (0.08 + heatRatio * 0.62) * planetVisibility;
      visual.lavaWarningRing.rotation.z = time * (0.6 + index * 0.04);
      visual.lavaWarningRing.scale.setScalar(1 + heatRatio * 0.12);
    }
    if (visual.flickerTimerTrack && visual.flickerTimerArc && visual.flickerGhostRing) {
      const flickerProgress = clamp(visual.planet.flickerProgress ?? 1, 0, 1);
      const countdownFraction = clamp(1 - flickerProgress, 0, 1);
      const isHiddenPhase = visual.planet.flickerMode === 'hidden';
      const warningPulse = isHiddenPhase ? 0 : Math.max(0, 1 - countdownFraction * 3.4);
      visual.flickerTimerTrack.visible = true;
      visual.flickerTimerArc.visible = countdownFraction > 0.004;
      visual.flickerGhostRing.visible = true;
      visual.flickerTimerTrack.material.opacity = 0.18 + (isHiddenPhase ? 0.22 : 0.12) + Math.sin(time * 3.4 + index) * 0.025;
      visual.flickerGhostRing.material.opacity = isHiddenPhase
        ? 0.26 + Math.sin(time * 4.2 + index) * 0.08
        : (0.08 + warningPulse * 0.32) * (1 - planetVisibility * 0.45);
      visual.flickerGhostRing.scale.setScalar(1 + (isHiddenPhase ? Math.sin(time * 3.2 + index) * 0.055 : warningPulse * 0.08));
      visual.flickerTimerArc.material.color.setHex(isHiddenPhase ? 0x9ee9ff : (warningPulse > 0.15 ? 0xff8f66 : 0xffe38b));
      visual.flickerTimerArc.material.opacity = (isHiddenPhase ? 0.72 : 0.82 + warningPulse * 0.16) * (0.88 + Math.sin(time * 5.1 + index) * 0.04);
      visual.flickerTimerArc.rotation.z = 0;
      visual.flickerTimerTrack.rotation.z = 0;
      visual.flickerTimerArc.geometry.dispose();
      visual.flickerTimerArc.geometry = new THREE.RingGeometry(
        visual.planet.radius + 0.58,
        visual.planet.radius + 0.7,
        80,
        1,
        Math.PI / 2,
        Math.max(0.0001, Math.PI * 2 * countdownFraction),
      );
    }
    if (visual.monolith) {
      const unlocked = state.level.goalUnlocked;
      visual.monolith.material.emissiveIntensity = unlocked ? 1.15 : 0.78 + Math.sin(time * 2.4) * 0.12;
      visual.monolithRing.material.opacity = unlocked ? 0.34 + Math.sin(time * 4.1) * 0.05 : 0.44 + Math.sin(time * 2.6) * 0.08;
      visual.monolithRing.scale.setScalar(unlocked ? 1.08 + Math.sin(time * 3.4) * 0.04 : 1.08 + Math.sin(time * 2.8) * 0.08);
      if (visual.monolithBeacon) {
        visual.monolithBeacon.material.opacity = unlocked ? 0.08 : 0.16 + Math.sin(time * 2.2 + index) * 0.04;
        visual.monolithBeacon.scale.setScalar(unlocked ? 1.02 : 1.06 + Math.sin(time * 2 + index) * 0.06);
      }
    }
    for (const turretVisual of visual.turretVisuals ?? []) {
      const lineState = getTurretLineState(visual.planet, turretVisual.turret, worldTime);
      const angle = Math.atan2(lineState.direction.y, lineState.direction.x);
      turretVisual.group.rotation.y = -angle;
      turretVisual.sightLine.material.opacity = (0.54 + Math.sin(time * 5.2 + index) * 0.12) * planetVisibility;
      turretVisual.sightGlow.material.opacity = (0.08 + Math.sin(time * 4.6 + index) * 0.035) * planetVisibility;
    }
    visual.orbitPath.position.set(visual.planet.orbitCenter.x, 0, visual.planet.orbitCenter.y);
  });
}

function updateCameraProjection() {
  const viewport = getViewportMetrics();
  camera.up.set(viewport.playfieldRotated ? 1 : 0, 0, viewport.playfieldRotated ? 0 : -1);
  camera.lookAt(0, 0, 0);
  camera.left = -viewport.halfWidth;
  camera.right = viewport.halfWidth;
  camera.top = viewport.halfHeight;
  camera.bottom = -viewport.halfHeight;
  camera.near = 0.1;
  camera.far = 60;
  camera.updateProjectionMatrix();
}

function isStandaloneDisplayMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function lockLandscapeIfSupported() {
  if (!isStandaloneDisplayMode()) {
    return;
  }

  const orientation = window.screen?.orientation;
  if (!orientation?.lock) {
    return;
  }

  orientation.lock('landscape').catch(() => {
    // Ignore unsupported or user-agent-restricted orientation locks.
  });
}

function syncViewportHeight() {
  const viewportHeight = Math.round(
    window.visualViewport
      ? Math.max(window.innerHeight, window.visualViewport.height)
      : window.innerHeight,
  );
  if (viewportHeight <= 0 || viewportHeight === lastViewportHeight) {
    return;
  }
  lastViewportHeight = viewportHeight;
  document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
}

function resize() {
  syncViewportHeight();
  const width = sceneHost.clientWidth;
  const height = sceneHost.clientHeight;
  const playfieldRotated = shouldRotatePlayfieldForViewport(width, height);
  syncGameOverActionAnchors();
  if (width <= 0 || height <= 0) {
    return;
  }
  if (
    width === lastSceneWidth
    && height === lastSceneHeight
    && playfieldRotated === lastPlayfieldRotated
  ) {
    return;
  }
  lastSceneWidth = width;
  lastSceneHeight = height;
  lastPlayfieldRotated = playfieldRotated;
  updateCameraProjection();
  updateCourseSurfaceVisuals();
  rebuildGravityField();
  lastGravityFieldRefreshTime = state.level.time ?? 0;
  renderer.setSize(width, height);
}

function scheduleResize(frames = 3) {
  if (pendingResizeFrame) {
    cancelAnimationFrame(pendingResizeFrame);
  }

  const tick = (remainingFrames) => {
    resize();
    if (remainingFrames > 0) {
      pendingResizeFrame = requestAnimationFrame(() => tick(remainingFrames - 1));
      return;
    }
    pendingResizeFrame = 0;
  };

  pendingResizeFrame = requestAnimationFrame(() => tick(frames));
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const time = clock.elapsedTime;

  resize();

  if (state.debug.fpsVisible) {
    state.debug.fpsFrameCount += 1;
    state.debug.fpsElapsed += delta;
    if (state.debug.fpsElapsed >= 0.25) {
      state.debug.fpsValue = state.debug.fpsFrameCount / state.debug.fpsElapsed;
      state.debug.fpsFrameCount = 0;
      state.debug.fpsElapsed = 0;
      syncPerfOverlay();
    }
  }

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
  updateTurretShotVisual(delta);
  updateSunShockwaves(delta);
  updateBallTransforms();
  updateCueVisual();
  updateDecor(time, delta);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

applyLevel(getInitialLevelIndex());
resetBall(`Level ${state.levelIndex + 1}: ${state.level.name}.`, state.level.summary);
lockLandscapeIfSupported();
syncViewportHeight();
syncDebugTuningPanel();
resize();
animate();

window.addEventListener('resize', () => scheduleResize());
window.addEventListener('orientationchange', () => scheduleResize(5));
window.addEventListener('orientationchange', lockLandscapeIfSupported);
window.addEventListener('pageshow', () => {
  lockLandscapeIfSupported();
  scheduleResize(5);
});
window.visualViewport?.addEventListener('resize', () => scheduleResize(5));

const sceneResizeObserver = new ResizeObserver(() => {
  scheduleResize(2);
});
sceneResizeObserver.observe(sceneHost);
