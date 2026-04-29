export const COURSE = {
  width: 24,
  height: 14,
  ballRadius: 0.28,
  goalRadius: 0.56,
  goalPullRadius: 4.6,
  goalPullStrength: 6.2,
  outBoundsX: 13.8,
  outBoundsY: 8.2,
};

export const MAX_DRAG_DISTANCE = 2.75;
export const BALL_HIT_RADIUS = 0.82;

export const PLANET_GRAVITY_MULTIPLIER = 2.35;
const BALL_STOP_SPEED = 0.055;
const BALL_FRICTION_BASE = 0.992;
const GOAL_CAPTURE_RATIO = 0.95;
const PLANET_COLLISION_PADDING = 0.92;
const PLANET_LANDING_PADDING = 0.03;
const ICE_PLANET_LANDING_PADDING = -0.01;
const PLANET_RADIUS_SCALE = 0.5;
const SUN_COLLISION_RADIUS = 0.42;
export const SOLAR_GRAVITY_MULTIPLIER = 5;
export const SOLAR_GRAVITY_SOFTENING = 3.4;
const ORBITAL_GRAVITY_PARAMETER = 0.08;
const MOON_ORBITAL_GRAVITY_PARAMETER = 0.03;
const DEFAULT_PLANET_LANDING_SPEED = 3.2;
const LAUNCH_BASE_SPEED = 1.9;
const LAUNCH_DRAG_SPEED = 3.4;
const LAUNCH_MAX_SPEED = 11.8;
const DEFAULT_START_ANGLE_DEG = 180;
const DEFAULT_GOAL_OPEN_SECONDS = 12;
const GOAL_ALWAYS_OPEN = true;
const SYSTEM_LAYOUT_SCALE = 1;
export const FIXED_SOLAR_GRAVITY_STRENGTH = 20;
const DEFAULT_EXTRA_SUN_GRAVITY_STRENGTH = 16;
const DEFAULT_EXTRA_SUN_COLLISION_RADIUS = 0.38;
const PORTAL_COOLDOWN_SECONDS = 0.22;
const BINARY_PRIMARY_RADIUS = 0.44;
const BINARY_PRIMARY_GRAVITY_STRENGTH = FIXED_SOLAR_GRAVITY_STRENGTH;
const BINARY_SECONDARY_RADIUS = 0.36;
const BINARY_SECONDARY_GRAVITY_STRENGTH = 16;

function polar(radius, angleDeg) {
  return { radius, angleDeg };
}

export const WORLD_SIZE = 10;

export const WORLD_DEFINITIONS = [
  { id: 'starter-belt', name: 'Starter Belt' },
  { id: 'relay-reach', name: 'Relay Reach' },
  { id: 'hazard-verge', name: 'Hazard Verge' },
  { id: 'moon-lattice', name: 'Moon Lattice' },
  { id: 'frostline-verge', name: 'Frostline Verge' },
  { id: 'aperture-reach', name: 'Aperture Reach' },
  { id: 'binary-crown', name: 'Binary Crown' },
  { id: 'ancient-worlds', name: 'Ancient Worlds' },
  { id: 'split-worlds', name: 'Split Worlds' },
];

const CORE_LEVEL_DEFINITIONS = [
  {
    id: 'open-lane',
    name: 'Open Lane',
    summary: 'Start on the goal side of the sun and take the simple straight lane first.',
    tutorial: {
      type: 'drag',
      copy: 'Drag and release to launch the ball.',
    },
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 0, power: 1.38 },
    ],
    startAnchor: polar(6.105, 2.3),
    goalCenter: polar(10.353, 1.4),
    goalOpenSeconds: 9999,
    goalPullRadius: 4.9,
    goalPullStrength: 6.2,
    planets: [
      {
        name: 'Start World',
        position: polar(5.356, 2.7),
        radius: 0.62,
        gravity: 5.2,
        falloff: 3.8,
        core: 0x79beff,
        glow: 0xa4e1ff,
        landable: true,
        orbitAngularSpeed: 0.01,
        spinAngularSpeed: 0.01,
      },
    ],
  },
  {
    id: 'first-arc',
    name: 'First Arc',
    summary: 'One launch world, one sun, one clean bend. Let the solar pull finish the curve.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 32, power: 2.22 },
    ],
    startAnchor: polar(3.951, -88.5),
    goalCenter: polar(6.416, -14.9),
    goalOpenSeconds: 8,
    goalPullRadius: 5.1,
    goalPullStrength: 6.8,
    planets: [
      {
        name: 'Launch World',
        position: polar(3.152, -88.2),
        radius: 0.72,
        gravity: 8.6,
        falloff: 5.4,
        core: 0x6caeff,
        glow: 0x8fd8ff,
        landable: true,
        orbitAngularSpeed: 0.18,
        spinAngularSpeed: 0.1,
      },
    ],
  },
  {
    id: 'first-relay',
    name: 'First Relay',
    preferRelay: true,
    summary: 'Start deep in the system, hop outward onto the relay world, then burn for the goal.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 187.8, power: 2.75 },
      { angleDeg: 328.7, power: 2.75 },
    ],
    startAnchor: polar(1.19, 103.2),
    goalCenter: polar(9.101, 10.4),
    goalOpenSeconds: 15,
    goalPullRadius: 4.4,
    goalPullStrength: 5.7,
    adminSolutions: [
      {
        label: 'Outer Relay',
        robustRate: 0.6,
        shots: [
          { waitSeconds: 0, angleDeg: 187.8, power: 2.75 },
          { waitSeconds: 2.5, angleDeg: 328.7, power: 2.75 },
        ],
      },
      {
        label: 'Outer Relay Hold',
        robustRate: 0.5,
        shots: [
          { waitSeconds: 0, angleDeg: 187.8, power: 2.75 },
          { waitSeconds: 3.75, angleDeg: 328.7, power: 2.75 },
        ],
      },
    ],
    planets: [
      {
        name: 'Launch World',
        position: polar(1.498, 64.3),
        radius: 0.92,
        gravity: 10.2,
        falloff: 6.4,
        core: 0xf2a266,
        glow: 0xffd18a,
        landable: true,
        landingRadius: 1.62,
        orbitAngularSpeed: 0.18,
        spinAngularSpeed: 0.1,
      },
      {
        name: 'Outer Relay',
        position: polar(4.657, 176.9),
        radius: 0.56,
        gravity: 5.9,
        falloff: 4.0,
        core: 0x71b6ff,
        glow: 0x97dcff,
        landable: true,
        orbitAngularSpeed: 0.08,
        spinAngularSpeed: 0.05,
      },
    ],
  },
  {
    id: 'hot-giant',
    name: 'Hot Giant',
    summary: 'The pink giant pulls hard, but it is not safe to touch. Bend around it and stay clear.',
    sun: [0, 0],
    startPlanetIndex: 1,
    launchPresets: [
      { angleDeg: 18, power: 2.18 },
    ],
    startAnchor: polar(4.43, -163.6),
    goalCenter: polar(8.591, 10.4),
    goalOpenSeconds: 12,
    goalPullRadius: 5.2,
    goalPullStrength: 6.9,
    planets: [
      {
        name: 'Pink Giant',
        position: polar(2.861, 5),
        radius: 1.0,
        gravity: 11.4,
        falloff: 6.9,
        core: 0xff84a8,
        glow: 0xffbfd2,
        landable: false,
        orbitAngularSpeed: -0.04,
        spinAngularSpeed: -0.04,
      },
      {
        name: 'Launch World',
        position: polar(3.764, -160.6),
        radius: 0.64,
        gravity: 7.0,
        falloff: 4.7,
        core: 0x73b9ff,
        glow: 0x9adfff,
        landable: true,
        orbitAngularSpeed: 0.12,
        spinAngularSpeed: 0.08,
      },
    ],
  },
  {
    id: 'fast-window',
    name: 'Fast Window',
    summary: 'The whole puzzle is timing. The launch world moves quickly enough that a good lane opens and closes.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: -26, power: 1.98 },
    ],
    startAnchor: polar(4.704, 177.6),
    goalCenter: polar(6.889, -21.7),
    goalOpenSeconds: 11,
    goalPullRadius: 5.2,
    goalPullStrength: 6.9,
    planets: [
      {
        name: 'Swift World',
        position: polar(3.905, 177.1),
        radius: 0.7,
        gravity: 8.8,
        falloff: 5.5,
        core: 0x7bb8ff,
        glow: 0x9fe0ff,
        landable: true,
        orbitAngularSpeed: 0.96,
        spinAngularSpeed: 0.18,
      },
    ],
  },
  {
    id: 'sunlocked-relay',
    name: 'Sunlocked Relay',
    preferRelay: true,
    summary: 'This world keeps the same face pointed at the sun, so the winning line is a short self-relay before the outward burn.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 38, power: 1.16 },
      { angleDeg: 2, power: 2.04 },
    ],
    startAnchor: polar(2.871, 7),
    goalCenter: polar(10.36, 2.5),
    goalOpenSeconds: 13,
    goalPullRadius: 4.8,
    goalPullStrength: 6.2,
    planets: [
      {
        name: 'Sunlock',
        position: polar(3.965, 5.1),
        radius: 0.86,
        gravity: 11.1,
        falloff: 6.3,
        core: 0xf3a168,
        glow: 0xffd18b,
        landable: true,
        landingRadius: 1.56,
        orbitAngularSpeed: 0.72,
        spinAngularSpeed: 0.72,
      },
    ],
  },
  {
    id: 'inner-step',
    name: 'Inner Step',
    preferRelay: true,
    summary: 'You start deep in the system, and the easiest route is a clean handoff to the outer relay.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 78.3, power: 2.02 },
      { angleDeg: 0, power: 2.75 },
    ],
    startAnchor: polar(1.981, -169.8),
    goalCenter: polar(9.276, 11.2),
    goalOpenSeconds: 12,
    planets: [
      { name: 'Launch One', position: polar(1.471, -170.2), radius: 0.64, gravity: 7.0, falloff: 4.9, core: 0x6da8ff, glow: 0x78c2ff, landable: true, orbitAngularSpeed: 0.14, spinAngularSpeed: 0.12 },
      { name: 'Blue Lift', position: polar(3.371, 54.7), radius: 0.78, gravity: 8.4, falloff: 5.6, core: 0x74bbff, glow: 0x94dbff, landable: true, landingRadius: 1.26, orbitAngularSpeed: 0.96, orbitEccentricity: 0.18, spinAngularSpeed: -0.52 },
      { name: 'Outer Relay', position: polar(4.62, 10), radius: 0.88, gravity: 9.8, falloff: 6.1, core: 0xec8d64, glow: 0xffcf78, landable: true, landingRadius: 1.4, orbitAngularSpeed: 0.06, orbitEccentricity: 0.12, spinAngularSpeed: 0.82 },
      { name: 'Goal Ward', position: polar(7.234, -8.7), radius: 0.96, gravity: 11.2, falloff: 6.8, core: 0xff7d9c, glow: 0xffb1c5, landable: false, orbitAngularSpeed: -0.03, spinAngularSpeed: -0.04 },
    ],
  },
  {
    id: 'forked-harbor',
    name: 'Forked Harbor',
    summary: 'Two mid-system harbors are reachable, but only one gives a comfortable line to the rim.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 266.1, power: 1.29 },
      { angleDeg: 344.3, power: 2.39 },
    ],
    startAnchor: polar(2.081, 144.8),
    goalCenter: polar(9.214, -3.1),
    goalOpenSeconds: 8,
    planets: [
      { name: 'Launch Two', position: polar(1.71, 142.1), radius: 0.64, gravity: 7.1, falloff: 4.8, core: 0x69baff, glow: 0x7ed6ff, landable: true, orbitAngularSpeed: -0.18, spinAngularSpeed: 0.14 },
      { name: 'Lower Harbor', position: polar(2.96, -52.5), radius: 0.8, gravity: 9.1, falloff: 5.8, core: 0x8b85ff, glow: 0xc6beff, landable: true, landingRadius: 1.3, orbitAngularSpeed: 0.08, orbitEccentricity: 0, spinAngularSpeed: -0.76 },
      { name: 'Upper Harbor', position: polar(4.428, 69.2), radius: 0.82, gravity: 9.0, falloff: 5.9, core: 0xf39a66, glow: 0xffcf86, landable: true, landingRadius: 1.34, orbitAngularSpeed: 1.08, orbitEccentricity: 0.04, spinAngularSpeed: 0.58 },
      { name: 'Outer Gate', position: polar(6.184, 3.8), radius: 0.92, gravity: 10.8, falloff: 6.5, core: 0xff7fa2, glow: 0xffb8c9, landable: true, landingRadius: 1.38, orbitAngularSpeed: 0.46, orbitEccentricity: 0.04, spinAngularSpeed: 0.05 },
      { name: 'Rim Giant', position: polar(7.414, -12.1), radius: 1.0, gravity: 12.1, falloff: 7.0, core: 0xff8f74, glow: 0xffcfad, landable: false, orbitAngularSpeed: -0.05, spinAngularSpeed: -0.02 },
    ],
  },
  {
    id: 'counterspin-gate',
    name: 'Counterspin Gate',
    preferRelay: true,
    summary: 'The launch world throws you off-angle, so the puzzle is stabilizing on a relay before the outward burn.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 266.1, power: 1.29 },
      { angleDeg: 313, power: 2.39 },
    ],
    startAnchor: polar(2.122, 133.1),
    goalCenter: polar(9.43, -16.3),
    goalOpenSeconds: 11,
    planets: [
      { name: 'Launch Three', position: polar(1.851, 128.4), radius: 0.64, gravity: 7.4, falloff: 4.9, core: 0x78beff, glow: 0x8dd9ff, landable: true, orbitAngularSpeed: 0.52, spinAngularSpeed: -0.48 },
      { name: 'Brake Moon', position: polar(3.168, -51.6), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0xf1a067, glow: 0xffd286, landable: true, landingRadius: 1.28, orbitAngularSpeed: -0.06, orbitEccentricity: 0.12, spinAngularSpeed: 0.92 },
      { name: 'South Giant', position: polar(5.342, -37.9), radius: 0.94, gravity: 11.3, falloff: 6.8, core: 0xff86a8, glow: 0xffbdd0, landable: false, orbitAngularSpeed: -0.18, orbitEccentricity: 0.08, spinAngularSpeed: 0.24 },
      { name: 'Outer Runway', position: polar(6.542, 19.8), radius: 0.88, gravity: 9.8, falloff: 6.2, core: 0x8d7eff, glow: 0xcabfff, landable: true, landingRadius: 1.42, orbitAngularSpeed: 0.34, orbitEccentricity: 0.02, spinAngularSpeed: -0.1 },
      { name: 'Goal Sentinel', position: polar(7.882, -4.6), radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff9a79, glow: 0xffd2b5, landable: false, orbitAngularSpeed: 0.03, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'false-periapsis',
    name: 'False Periapsis',
    preferRelay: true,
    summary: 'The tempting close pass is only step one; the real puzzle is turning that touch into a rim transfer.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 313, power: 0.93 },
      { angleDeg: 0, power: 2.75 },
    ],
    startAnchor: polar(2.29, -143.9),
    goalCenter: polar(9.712, 16.8),
    goalOpenSeconds: 9,
    planets: [
      { name: 'Launch Four', position: polar(1.93, -143.4), radius: 0.64, gravity: 7.3, falloff: 4.9, core: 0x69b6ff, glow: 0x83d7ff, landable: true, orbitAngularSpeed: 0.1, spinAngularSpeed: 0.08 },
      { name: 'Periapsis Core', position: polar(3.982, -8.4), radius: 0.82, gravity: 10.2, falloff: 5.9, core: 0xf7a96b, glow: 0xffd18f, landable: true, landingRadius: 1.34, orbitAngularSpeed: 1.18, orbitEccentricity: 0.16, spinAngularSpeed: -0.62 },
      { name: 'Wide Relay', position: polar(5.613, 25.9), radius: 0.9, gravity: 9.8, falloff: 6.3, core: 0x8e7eff, glow: 0xc1b9ff, landable: true, landingRadius: 1.44, orbitAngularSpeed: -0.14, orbitEccentricity: 0.12, spinAngularSpeed: 0.72 },
      { name: 'Goal Rim', position: polar(7.411, 7.4), radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff81a6, glow: 0xffc0cf, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'long-transfer',
    name: 'Long Transfer',
    preferRelay: true,
    summary: 'The target sits far out on the rim, so one short hop is not enough unless you use the outer station.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 15.7, power: 1.66 },
      { angleDeg: 344.3, power: 2.02 },
    ],
    startAnchor: polar(2.264, 120.5),
    goalCenter: polar(10.041, -18),
    goalOpenSeconds: 10,
    goalPullRadius: 5.2,
    goalPullStrength: 6.9,
    planets: [
      { name: 'Launch Moon', position: polar(1.947, 119.2), radius: 0.64, gravity: 7.2, falloff: 4.8, core: 0x70bbff, glow: 0x86d8ff, landable: true, orbitAngularSpeed: -0.24, spinAngularSpeed: 0.18 },
      { name: 'Mid Moon', position: polar(3.296, 9.6), radius: 0.74, gravity: 8.8, falloff: 5.5, core: 0xf4a467, glow: 0xffd38d, landable: true, landingRadius: 1.22, orbitAngularSpeed: 0.82, orbitEccentricity: 0.08, spinAngularSpeed: -0.56 },
      { name: 'Outer Station', position: polar(5.744, -24.8), radius: 0.92, gravity: 10.1, falloff: 6.4, core: 0x8e81ff, glow: 0xc7c0ff, landable: true, landingRadius: 1.48, orbitAngularSpeed: 0.04, orbitEccentricity: 0.1, spinAngularSpeed: 0.68 },
      { name: 'North Giant', position: polar(6.684, 31.4), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff87aa, glow: 0xffc4d2, landable: false, orbitAngularSpeed: 0.37, orbitEccentricity: 0.06, spinAngularSpeed: -0.18 },
      { name: 'Rim Giant', position: polar(8.128, 4.2), radius: 1.02, gravity: 12.2, falloff: 7.2, core: 0xff9a79, glow: 0xffd2b2, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'halo-run',
    name: 'Halo Run',
    preferRelay: true,
    summary: 'A wide final system mixes short inner assists with a much longer outer relay on the rim.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 93.9, power: 2.75 },
      { angleDeg: 0, power: 2.39 },
    ],
    startAnchor: polar(2.864, -135.7),
    goalCenter: polar(10.151, 18.1),
    goalOpenSeconds: 10,
    goalPullRadius: 5.5,
    goalPullStrength: 7.1,
    planets: [
      { name: 'Launch Halo', position: polar(2.375, -130.7), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x6fbfff, glow: 0x8ddfff, landable: true, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.06 },
      { name: 'West Brake', position: polar(3.482, 159), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0x8e81ff, glow: 0xc8c1ff, landable: true, landingRadius: 1.24, orbitAngularSpeed: -0.52, orbitEccentricity: 0.05, spinAngularSpeed: 1.04 },
      { name: 'South Giant', position: polar(4.248, -47.9), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff84aa, glow: 0xffc2d3, landable: false, orbitAngularSpeed: 0.05, spinAngularSpeed: -0.08 },
      { name: 'North Relay', position: polar(6.318, 66.8), radius: 0.84, gravity: 9.1, falloff: 5.9, core: 0xf6a76a, glow: 0xffd38d, landable: true, landingRadius: 1.36, orbitAngularSpeed: 1.34, orbitEccentricity: 0.03, spinAngularSpeed: -0.42 },
      { name: 'Outer Halo', position: polar(7.724, 26.4), radius: 0.92, gravity: 10.2, falloff: 6.4, core: 0x9f8dff, glow: 0xd3cbff, landable: true, landingRadius: 1.46, orbitAngularSpeed: 0.18, orbitEccentricity: 0.04, spinAngularSpeed: 0.44 },
      { name: 'Goal Keeper', position: polar(8.62, 5.9), radius: 1.04, gravity: 12.5, falloff: 7.3, core: 0xff9a74, glow: 0xffd2a8, landable: false, orbitAngularSpeed: -0.02, spinAngularSpeed: 0.03 },
    ],
  },
  {
    id: 'periapsis-moon',
    name: 'Periapsis Moon',
    preferRelay: true,
    summary: 'The outer relay now carries a moon, so the transfer window shifts while the rim shot stays familiar.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 337, power: 2.36 },
      { angleDeg: 0, power: 2.75 },
    ],
    startAnchor: polar(2.29, -143.9),
    goalCenter: polar(9.712, 16.8),
    goalOpenSeconds: 9,
    planets: [
      { name: 'Launch Four', position: polar(1.93, -143.4), radius: 0.64, gravity: 7.3, falloff: 4.9, core: 0x69b6ff, glow: 0x83d7ff, landable: true, orbitAngularSpeed: 0.09, spinAngularSpeed: 0.07 },
      { name: 'Periapsis Core', position: polar(3.914, -8.1), radius: 0.82, gravity: 10.2, falloff: 5.9, core: 0xf7a96b, glow: 0xffd18f, landable: true, landingRadius: 1.34, orbitAngularSpeed: 1.02, orbitEccentricity: 0.14, spinAngularSpeed: -0.58 },
      { name: 'Wide Relay', position: polar(5.764, 24.6), radius: 0.9, gravity: 9.8, falloff: 6.3, core: 0x8e7eff, glow: 0xc1b9ff, landable: true, landingRadius: 1.44, orbitAngularSpeed: -0.18, orbitEccentricity: 0.1, spinAngularSpeed: 0.84 },
      { name: 'Relay Moon', position: polar(6.984, 20.9), radius: 0.52, gravity: 6.5, falloff: 4.4, core: 0xb9c2cf, glow: 0xf0f4ff, landable: true, landingRadius: 0.98, orbitAround: 2, orbitAngularSpeed: 3.4, orbitEccentricity: 0.03, spinAngularSpeed: -1.1 },
      { name: 'Goal Rim', position: polar(8.042, 5.6), radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff81a6, glow: 0xffc0cf, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'eclipse-bend',
    name: 'Eclipse Bend',
    summary: 'The inside lane is blocked by a heavy giant, so the shot is a late sweep around its shoulder.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 21, power: 2.18 },
    ],
    startAnchor: polar(4.012, -104.4),
    goalCenter: polar(9.126, 18.4),
    goalOpenSeconds: 10,
    goalPullRadius: 5.0,
    goalPullStrength: 6.6,
    planets: [
      { name: 'Launch World', position: polar(3.284, -104.9), radius: 0.68, gravity: 7.8, falloff: 5.0, core: 0x72b8ff, glow: 0x93deff, landable: true, orbitAngularSpeed: 0.16, spinAngularSpeed: 0.08 },
      { name: 'Eclipse Giant', position: polar(4.962, 18.6), radius: 1.02, gravity: 11.8, falloff: 7.0, core: 0xff86aa, glow: 0xffc2d1, landable: false, orbitAngularSpeed: -0.08, orbitEccentricity: 0.06, spinAngularSpeed: -0.06 },
    ],
  },
  {
    id: 'late-sweep',
    name: 'Late Sweep',
    summary: 'The launch world is quick enough that the simple lane only opens for a narrow late sweep.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: -34, power: 2.12 },
    ],
    startAnchor: polar(4.902, 172.2),
    goalCenter: polar(7.284, -41.6),
    goalOpenSeconds: 8,
    goalPullRadius: 5.3,
    goalPullStrength: 7.0,
    planets: [
      { name: 'Sweep World', position: polar(4.122, 171.8), radius: 0.72, gravity: 8.9, falloff: 5.6, core: 0x7ac0ff, glow: 0x9ce3ff, landable: true, orbitAngularSpeed: 1.14, spinAngularSpeed: 0.18 },
    ],
  },
  {
    id: 'guarded-relay',
    name: 'Guarded Relay',
    preferRelay: true,
    summary: 'The outer burn is guarded, so the clean route is an outward relay before the final escape.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 187.8, power: 2.75 },
      { angleDeg: 328.7, power: 2.75 },
    ],
    startAnchor: polar(1.19, 103.2),
    goalCenter: polar(9.101, 10.4),
    goalOpenSeconds: 15,
    goalPullRadius: 4.6,
    goalPullStrength: 5.8,
    adminSolutions: [
      {
        label: 'Guarded Outer Relay',
        shots: [
          { waitSeconds: 0, angleDeg: 187.8, power: 2.75 },
          { waitSeconds: 2.5, angleDeg: 328.7, power: 2.75 },
        ],
      },
    ],
    planets: [
      { name: 'Inner Dock', position: polar(1.498, 64.3), radius: 0.92, gravity: 10.2, falloff: 6.4, core: 0xf1a064, glow: 0xffcf86, landable: true, landingRadius: 1.62, orbitAngularSpeed: 0.18, spinAngularSpeed: 0.1 },
      { name: 'Relay Ring', position: polar(4.657, 176.9), radius: 0.56, gravity: 5.9, falloff: 4.0, core: 0x76bcff, glow: 0x98ddff, landable: true, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.05 },
      { name: 'Outer Guard', position: polar(10.624, 48.4), radius: 0.84, gravity: 7.4, falloff: 5.6, core: 0xff7f9f, glow: 0xffb8c8, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'double-slalom',
    name: 'Double Slalom',
    preferRelay: true,
    summary: 'The first pass is a setup touch. Once the launch world throws you back out, thread the seam between the two giants.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 127.1, power: 2.39 },
      { angleDeg: 338.8, power: 2.75 },
    ],
    startAnchor: polar(3.816, -154.2),
    adminSolutions: [
      {
        label: 'Setup Slalom',
        shots: [
          { waitSeconds: 5, angleDeg: 127.1, power: 2.39 },
          { waitSeconds: 0, angleDeg: 338.8, power: 2.75 },
        ],
      },
    ],
    goalCenter: polar(8.624, 6.8),
    goalOpenSeconds: 14,
    goalPullRadius: 5.8,
    goalPullStrength: 7.6,
    planets: [
      { name: 'Launch Spur', position: polar(3.096, -153.9), radius: 0.68, gravity: 7.6, falloff: 5.0, core: 0x72baff, glow: 0x95ddff, landable: true, orbitAngularSpeed: 0.14, spinAngularSpeed: 0.08 },
      { name: 'South Giant', position: polar(4.382, -8.4), radius: 0.84, gravity: 9.9, falloff: 6.1, core: 0xff86a6, glow: 0xffc1cf, landable: false, orbitAngularSpeed: -0.03, orbitEccentricity: 0.02, spinAngularSpeed: -0.04 },
      { name: 'North Giant', position: polar(7.762, 18.4), radius: 0.88, gravity: 10.2, falloff: 6.3, core: 0xff9976, glow: 0xffd1b0, landable: false, orbitAngularSpeed: 0.01, orbitEccentricity: 0.02, spinAngularSpeed: 0.03 },
    ],
  },
  {
    id: 'mirror-harbor',
    name: 'Mirror Harbor',
    summary: 'Both harbors are reachable, but the mirrored upper route opens the cleaner rim transfer.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 94, power: 2.02 },
      { angleDeg: 12, power: 2.39 },
    ],
    startAnchor: polar(2.148, -137.2),
    goalCenter: polar(9.364, 6.8),
    goalOpenSeconds: 9,
    planets: [
      { name: 'Launch Mirror', position: polar(1.784, -139.8), radius: 0.64, gravity: 7.1, falloff: 4.8, core: 0x6fb8ff, glow: 0x84daff, landable: true, orbitAngularSpeed: 0.16, spinAngularSpeed: -0.14 },
      { name: 'South Harbor', position: polar(3.046, 48.6), radius: 0.78, gravity: 8.9, falloff: 5.8, core: 0x8a84ff, glow: 0xc6beff, landable: true, landingRadius: 1.26, orbitAngularSpeed: -0.08, orbitEccentricity: 0.04, spinAngularSpeed: 0.74 },
      { name: 'North Harbor', position: polar(4.322, -72.4), radius: 0.84, gravity: 9.2, falloff: 5.9, core: 0xf2a467, glow: 0xffd38a, landable: true, landingRadius: 1.34, orbitAngularSpeed: 0.92, orbitEccentricity: 0.06, spinAngularSpeed: -0.58 },
      { name: 'Outer Gate', position: polar(6.142, 11.8), radius: 0.92, gravity: 10.6, falloff: 6.5, core: 0xff82a4, glow: 0xffbccb, landable: true, landingRadius: 1.4, orbitAngularSpeed: 0.34, orbitEccentricity: 0.04, spinAngularSpeed: 0.06 },
      { name: 'Rim Ward', position: polar(7.642, -6.2), radius: 1.0, gravity: 12.1, falloff: 7.1, core: 0xff9772, glow: 0xffd1ad, landable: false, orbitAngularSpeed: -0.03, spinAngularSpeed: -0.02 },
    ],
  },
  {
    id: 'moon-catch',
    name: 'Moon Catch',
    preferRelay: true,
    summary: 'The moving moon is the real launchpad. Catch it cleanly, then use its orbit to finish the line.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 336, power: 2.39 },
      { angleDeg: 18, power: 2.58 },
    ],
    startAnchor: polar(2.314, 128.6),
    goalCenter: polar(9.986, 17.4),
    goalOpenSeconds: 10,
    goalPullRadius: 5.0,
    goalPullStrength: 6.5,
    planets: [
      { name: 'Launch Crest', position: polar(1.974, 126.8), radius: 0.64, gravity: 7.2, falloff: 4.8, core: 0x73bcff, glow: 0x89daff, landable: true, orbitAngularSpeed: -0.18, spinAngularSpeed: 0.16 },
      { name: 'Mid Brake', position: polar(3.764, -23.2), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0xf1a366, glow: 0xffd286, landable: true, landingRadius: 1.28, orbitAngularSpeed: 0.12, orbitEccentricity: 0.05, spinAngularSpeed: -0.52 },
      { name: 'Wide Relay', position: polar(5.662, 21.4), radius: 0.9, gravity: 9.8, falloff: 6.2, core: 0x8e80ff, glow: 0xc5beff, landable: true, landingRadius: 1.42, orbitAngularSpeed: -0.1, orbitEccentricity: 0.05, spinAngularSpeed: 0.78 },
      { name: 'Relay Moon', position: polar(6.702, 18.6), radius: 0.52, gravity: 6.4, falloff: 4.4, core: 0xbac4d2, glow: 0xf2f6ff, landable: true, landingRadius: 0.98, orbitAround: 2, orbitAngularSpeed: 3.1, orbitEccentricity: 0.02, spinAngularSpeed: -1.02 },
      { name: 'Goal Rim', position: polar(8.284, 6.8), radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff84a8, glow: 0xffc0d0, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'tidal-gate',
    name: 'Tidal Gate',
    preferRelay: true,
    summary: 'The launch world is sunlocked, but the outward lane is guarded until you rotate into the right face.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 44, power: 1.29 },
      { angleDeg: 6, power: 2.18 },
    ],
    startAnchor: polar(2.986, 12.8),
    goalCenter: polar(10.292, 7.1),
    goalOpenSeconds: 12,
    goalPullRadius: 4.8,
    goalPullStrength: 6.3,
    planets: [
      { name: 'Tidal World', position: polar(4.108, 10.6), radius: 0.88, gravity: 11.0, falloff: 6.3, core: 0xf3a36a, glow: 0xffd38d, landable: true, landingRadius: 1.58, orbitAngularSpeed: 0.66, spinAngularSpeed: 0.66 },
      { name: 'Gate Giant', position: polar(6.382, -14.8), radius: 0.98, gravity: 11.8, falloff: 7.0, core: 0xff87a8, glow: 0xffbfd1, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'rim-switch',
    name: 'Rim Switch',
    preferRelay: true,
    summary: 'The first assist is easy, but the outer station only works when the switch world turns the corridor open.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 22, power: 1.66 },
      { angleDeg: 338, power: 2.39 },
    ],
    startAnchor: polar(2.238, -130.6),
    goalCenter: polar(10.064, 10.6),
    goalOpenSeconds: 10,
    goalPullRadius: 5.1,
    goalPullStrength: 6.8,
    planets: [
      { name: 'Launch Switch', position: polar(1.918, -131.9), radius: 0.64, gravity: 7.2, falloff: 4.8, core: 0x70bbff, glow: 0x88d8ff, landable: true, orbitAngularSpeed: 0.12, spinAngularSpeed: 0.08 },
      { name: 'Brake World', position: polar(3.308, 34.6), radius: 0.76, gravity: 8.8, falloff: 5.6, core: 0xf4a367, glow: 0xffd388, landable: true, landingRadius: 1.22, orbitAngularSpeed: -0.1, orbitEccentricity: 0.04, spinAngularSpeed: 0.82 },
      { name: 'Outer Switch', position: polar(5.762, -20.8), radius: 0.9, gravity: 10.0, falloff: 6.3, core: 0x8f81ff, glow: 0xc7c0ff, landable: true, landingRadius: 1.44, orbitAngularSpeed: 0.22, orbitEccentricity: 0.06, spinAngularSpeed: -0.42 },
      { name: 'North Ward', position: polar(6.604, 29.6), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff86aa, glow: 0xffc1d2, landable: false, orbitAngularSpeed: 0.05, orbitEccentricity: 0.04, spinAngularSpeed: -0.18 },
      { name: 'Goal Keeper', position: polar(8.162, 7.2), radius: 1.02, gravity: 12.2, falloff: 7.2, core: 0xff9a75, glow: 0xffd2ad, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'outer-echo',
    name: 'Outer Echo',
    preferRelay: true,
    summary: 'A false close pass echoes you back inward unless you touch the wide relay and leave from there.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 320, power: 2.58 },
      { angleDeg: 24, power: 2.18 },
    ],
    startAnchor: polar(2.336, 118.8),
    goalCenter: polar(9.824, 14.8),
    goalOpenSeconds: 9,
    planets: [
      { name: 'Launch Echo', position: polar(1.992, 118.2), radius: 0.64, gravity: 7.3, falloff: 4.9, core: 0x6fb7ff, glow: 0x84d7ff, landable: true, orbitAngularSpeed: -0.12, spinAngularSpeed: 0.12 },
      { name: 'Inner Brake', position: polar(3.042, -60.6), radius: 0.78, gravity: 8.9, falloff: 5.7, core: 0xf1a167, glow: 0xffd184, landable: true, landingRadius: 1.24, orbitAngularSpeed: 0.08, orbitEccentricity: 0.04, spinAngularSpeed: -0.78 },
      { name: 'Periapsis Core', position: polar(4.364, -10.8), radius: 0.84, gravity: 10.3, falloff: 6.0, core: 0xff88ad, glow: 0xffc2d3, landable: false, orbitAngularSpeed: 0.88, orbitEccentricity: 0.05, spinAngularSpeed: -0.58 },
      { name: 'Echo Relay', position: polar(6.102, 28.8), radius: 0.92, gravity: 10.0, falloff: 6.3, core: 0x8e7fff, glow: 0xc8c0ff, landable: true, landingRadius: 1.46, orbitAngularSpeed: -0.12, orbitEccentricity: 0.06, spinAngularSpeed: 0.72 },
      { name: 'Goal Rim', position: polar(8.324, 9.2), radius: 1.0, gravity: 12.1, falloff: 7.1, core: 0xff9a78, glow: 0xffd1b3, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'crown-window',
    name: 'Crown Window',
    preferRelay: true,
    summary: 'The outer crown is wide but busy. Use the north relay, then leave before the crown closes again.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 96, power: 2.39 },
      { angleDeg: 8, power: 2.58 },
    ],
    startAnchor: polar(2.904, -136.1),
    goalCenter: polar(10.382, 16.4),
    goalOpenSeconds: 9,
    goalPullRadius: 5.4,
    goalPullStrength: 7.0,
    planets: [
      { name: 'Launch Crown', position: polar(2.396, -131.8), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x6fc0ff, glow: 0x8fe0ff, landable: true, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.06 },
      { name: 'West Brake', position: polar(3.742, 154.2), radius: 0.8, gravity: 9.0, falloff: 5.8, core: 0x8f82ff, glow: 0xc9c2ff, landable: true, landingRadius: 1.24, orbitAngularSpeed: -0.46, orbitEccentricity: 0.04, spinAngularSpeed: 0.98 },
      { name: 'South Giant', position: polar(4.584, -50.8), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff86aa, glow: 0xffc3d3, landable: false, orbitAngularSpeed: 0.04, spinAngularSpeed: -0.08 },
      { name: 'North Relay', position: polar(6.612, 70.8), radius: 0.84, gravity: 9.2, falloff: 5.9, core: 0xf6a56c, glow: 0xffd58f, landable: true, landingRadius: 1.38, orbitAngularSpeed: 1.12, orbitEccentricity: 0.04, spinAngularSpeed: -0.38 },
      { name: 'Crown Relay', position: polar(7.942, 28.2), radius: 0.94, gravity: 10.3, falloff: 6.4, core: 0x9f8cff, glow: 0xd4cbff, landable: true, landingRadius: 1.5, orbitAngularSpeed: 0.16, orbitEccentricity: 0.04, spinAngularSpeed: 0.38 },
      { name: 'Goal Crown', position: polar(9.042, 7.8), radius: 1.04, gravity: 12.5, falloff: 7.3, core: 0xff9a74, glow: 0xffd2ab, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'mirror-sweep',
    name: 'Mirror Sweep',
    summary: 'The same late window appears on the opposite side of the sun. Launch too early and the lane is gone.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 156, power: 2.12 },
    ],
    startAnchor: polar(4.912, -8.4),
    goalCenter: polar(7.284, 139.4),
    goalOpenSeconds: 8,
    goalPullRadius: 5.3,
    goalPullStrength: 7.0,
    planets: [
      { name: 'Mirror World', position: polar(4.126, -8.1), radius: 0.72, gravity: 8.9, falloff: 5.6, core: 0x7bc1ff, glow: 0x9de3ff, landable: true, orbitAngularSpeed: -1.06, spinAngularSpeed: -0.18 },
    ],
  },
  {
    id: 'shielded-arc',
    name: 'Shielded Arc',
    summary: 'The shield giant blocks the easy outside curve, so the winning arc stays tighter to the sun than it first appears.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: -28, power: 2.18 },
    ],
    startAnchor: polar(4.068, 103.2),
    goalCenter: polar(8.984, -18.4),
    goalOpenSeconds: 10,
    goalPullRadius: 5.0,
    goalPullStrength: 6.7,
    planets: [
      { name: 'Arc World', position: polar(3.342, 103.8), radius: 0.68, gravity: 7.8, falloff: 5.0, core: 0x71b8ff, glow: 0x94deff, landable: true, orbitAngularSpeed: -0.14, spinAngularSpeed: -0.08 },
      { name: 'Shield Giant', position: polar(5.088, -25.4), radius: 1.0, gravity: 11.6, falloff: 7.0, core: 0xff88aa, glow: 0xffc1d0, landable: false, orbitAngularSpeed: 0.06, orbitEccentricity: 0.04, spinAngularSpeed: 0.04 },
    ],
  },
  {
    id: 'moon-switch',
    name: 'Moon Switch',
    preferRelay: true,
    summary: 'The moon is the clean switch. Ignore it and the outer keeper shuts the finish down.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 339, power: 2.39 },
      { angleDeg: 18, power: 2.58 },
    ],
    startAnchor: polar(2.302, -122.4),
    goalCenter: polar(10.026, 15.4),
    goalOpenSeconds: 10,
    goalPullRadius: 5.0,
    goalPullStrength: 6.6,
    planets: [
      { name: 'Launch Switch', position: polar(1.972, -123.1), radius: 0.64, gravity: 7.3, falloff: 4.8, core: 0x73bcff, glow: 0x8bdbff, landable: true, orbitAngularSpeed: 0.16, spinAngularSpeed: -0.14 },
      { name: 'Brake Spur', position: polar(3.564, 19.2), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0xf2a366, glow: 0xffd286, landable: true, landingRadius: 1.26, orbitAngularSpeed: -0.08, orbitEccentricity: 0.04, spinAngularSpeed: 0.78 },
      { name: 'Switch Relay', position: polar(5.944, -18.8), radius: 0.9, gravity: 9.9, falloff: 6.3, core: 0x8e81ff, glow: 0xc8c0ff, landable: true, landingRadius: 1.44, orbitAngularSpeed: 0.18, orbitEccentricity: 0.04, spinAngularSpeed: -0.46 },
      { name: 'Switch Moon', position: polar(6.864, -16.1), radius: 0.52, gravity: 6.4, falloff: 4.4, core: 0xbcc6d4, glow: 0xf3f7ff, landable: true, landingRadius: 0.98, orbitAround: 2, orbitAngularSpeed: -3.0, orbitEccentricity: 0.02, spinAngularSpeed: 1.0 },
      { name: 'Outer Keeper', position: polar(8.324, 7.4), radius: 1.0, gravity: 12.1, falloff: 7.1, core: 0xff9a76, glow: 0xffd1ad, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'outer-crown',
    name: 'Outer Crown',
    preferRelay: true,
    summary: 'The crown worlds are wide and slow, but the transfer only works when you leave the inner relay at the right moment.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 338, power: 2.39 },
      { angleDeg: 42, power: 2.02 },
    ],
    startAnchor: polar(2.876, 136.2),
    goalCenter: polar(10.418, -15.6),
    goalOpenSeconds: 10,
    goalPullRadius: 5.5,
    goalPullStrength: 7.0,
    planets: [
      { name: 'Launch Crown', position: polar(2.382, 132.4), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x6fc0ff, glow: 0x8fe0ff, landable: true, orbitAngularSpeed: -0.08, spinAngularSpeed: -0.06 },
      { name: 'East Brake', position: polar(3.782, -157.4), radius: 0.8, gravity: 9.0, falloff: 5.8, core: 0x9082ff, glow: 0xc9c2ff, landable: true, landingRadius: 1.24, orbitAngularSpeed: 0.44, orbitEccentricity: 0.04, spinAngularSpeed: -0.98 },
      { name: 'North Giant', position: polar(4.612, 49.6), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff87ab, glow: 0xffc4d4, landable: false, orbitAngularSpeed: -0.04, spinAngularSpeed: 0.08 },
      { name: 'South Relay', position: polar(6.584, -72.2), radius: 0.84, gravity: 9.2, falloff: 5.9, core: 0xf6a56c, glow: 0xffd58f, landable: true, landingRadius: 1.38, orbitAngularSpeed: -1.04, orbitEccentricity: 0.04, spinAngularSpeed: 0.38 },
      { name: 'Crown Relay', position: polar(7.904, -30.4), radius: 0.94, gravity: 10.3, falloff: 6.4, core: 0xa08cff, glow: 0xd5cbff, landable: true, landingRadius: 1.5, orbitAngularSpeed: -0.14, orbitEccentricity: 0.04, spinAngularSpeed: -0.38 },
      { name: 'Goal Crown', position: polar(9.064, -8.4), radius: 1.04, gravity: 12.5, falloff: 7.3, core: 0xff9a74, glow: 0xffd2ab, landable: false, orbitAngularSpeed: 0.01, spinAngularSpeed: -0.02 },
    ],
  },
  {
    id: 'split-sentinel',
    name: 'Split Sentinel',
    summary: 'The two mid-system routes look similar, but only one sentinel line leaves a clear finish.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 272, power: 1.66 },
      { angleDeg: 336, power: 2.39 },
    ],
    startAnchor: polar(2.112, 144.6),
    goalCenter: polar(9.452, -10.4),
    goalOpenSeconds: 9,
    planets: [
      { name: 'Launch Sentinel', position: polar(1.764, 142.8), radius: 0.64, gravity: 7.1, falloff: 4.8, core: 0x6fb8ff, glow: 0x83daff, landable: true, orbitAngularSpeed: -0.16, spinAngularSpeed: 0.12 },
      { name: 'Low Harbor', position: polar(3.084, -44.2), radius: 0.78, gravity: 8.9, falloff: 5.8, core: 0x8b84ff, glow: 0xc6beff, landable: true, landingRadius: 1.26, orbitAngularSpeed: 0.06, orbitEccentricity: 0.04, spinAngularSpeed: -0.72 },
      { name: 'High Harbor', position: polar(4.246, 64.2), radius: 0.82, gravity: 9.1, falloff: 5.9, core: 0xf2a368, glow: 0xffd28a, landable: true, landingRadius: 1.32, orbitAngularSpeed: -0.92, orbitEccentricity: 0.04, spinAngularSpeed: 0.58 },
      { name: 'Split Sentinel', position: polar(6.022, 8.4), radius: 0.96, gravity: 11.0, falloff: 6.7, core: 0xff82a4, glow: 0xffbccb, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.04 },
      { name: 'Rim Keeper', position: polar(7.964, -6.4), radius: 1.0, gravity: 12.1, falloff: 7.1, core: 0xff9a76, glow: 0xffd1ad, landable: false, orbitAngularSpeed: -0.02, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'wide-lock',
    name: 'Wide Lock',
    preferRelay: true,
    summary: 'The launch world is locked to the sun, but the wide exit only appears after one patient setup touch.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 36, power: 1.16 },
      { angleDeg: -6, power: 2.18 },
    ],
    startAnchor: polar(2.962, -10.8),
    goalCenter: polar(10.348, -5.2),
    goalOpenSeconds: 13,
    goalPullRadius: 4.8,
    goalPullStrength: 6.3,
    planets: [
      { name: 'Lock World', position: polar(4.162, -8.9), radius: 0.88, gravity: 11.0, falloff: 6.3, core: 0xf3a36a, glow: 0xffd38d, landable: true, landingRadius: 1.58, orbitAngularSpeed: -0.62, spinAngularSpeed: -0.62 },
      { name: 'Wide Keeper', position: polar(6.724, 16.6), radius: 0.98, gravity: 11.8, falloff: 7.0, core: 0xff87a8, glow: 0xffbfd1, landable: false, orbitAngularSpeed: -0.02, spinAngularSpeed: 0.03 },
    ],
  },
  {
    id: 'twin-shepherds',
    name: 'Twin Shepherds',
    preferRelay: true,
    summary: 'The relay fan now splits into two small shepherd docks. Catch the nearer one, then leave from the outer point.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 336, power: 2.39 },
      { angleDeg: 20, power: 2.58 },
    ],
    startAnchor: polar(2.314, 128.6),
    goalCenter: polar(10.186, 17.6),
    goalOpenSeconds: 11,
    goalPullRadius: 5.1,
    goalPullStrength: 6.6,
    planets: [
      { name: 'Launch Crest', position: polar(1.974, 126.8), radius: 0.64, gravity: 7.2, falloff: 4.8, core: 0x73bcff, glow: 0x89daff, landable: true, orbitAngularSpeed: -0.18, spinAngularSpeed: 0.16 },
      { name: 'Mid Brake', position: polar(3.764, -23.2), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0xf1a366, glow: 0xffd286, landable: true, landingRadius: 1.28, orbitAngularSpeed: 0.12, orbitEccentricity: 0.05, spinAngularSpeed: -0.52 },
      { name: 'Relay Giant', position: polar(5.642, 21.6), radius: 0.92, gravity: 9.9, falloff: 6.2, core: 0x8e80ff, glow: 0xc5beff, landable: true, landingRadius: 1.44, orbitAngularSpeed: -0.08, orbitEccentricity: 0.04, spinAngularSpeed: 0.76 },
      { name: 'Near Shepherd', position: polar(7.528, 24.8), radius: 0.46, gravity: 6.2, falloff: 4.2, core: 0xbac4d2, glow: 0xf2f6ff, landable: true, landingRadius: 0.88, orbitAngularSpeed: 0.12, orbitEccentricity: 0.03, spinAngularSpeed: -0.94 },
      { name: 'Far Shepherd', position: polar(8.924, 24.2), radius: 0.38, gravity: 5.5, falloff: 3.8, core: 0xd6dbe6, glow: 0xffffff, landable: true, landingRadius: 0.78, orbitAngularSpeed: -0.06, orbitEccentricity: 0.02, spinAngularSpeed: 0.72 },
      { name: 'Goal Rim', position: polar(9.624, 6.2), radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff84a8, glow: 0xffc0d0, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'periapsis-brood',
    name: 'Periapsis Fan',
    preferRelay: true,
    summary: 'The close periapsis touch still starts the route, but the finish now opens through an off-axis fan instead of a moon ladder.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 337, power: 2.36 },
      { angleDeg: 12, power: 2.58 },
    ],
    startAnchor: polar(2.29, -143.9),
    goalCenter: polar(10.084, 17.2),
    goalOpenSeconds: 10,
    goalPullRadius: 5.0,
    goalPullStrength: 6.6,
    planets: [
      { name: 'Launch Four', position: polar(1.93, -143.4), radius: 0.64, gravity: 7.3, falloff: 4.9, core: 0x69b6ff, glow: 0x83d7ff, landable: true, orbitAngularSpeed: 0.09, spinAngularSpeed: 0.07 },
      { name: 'Periapsis Core', position: polar(3.914, -8.1), radius: 0.82, gravity: 10.2, falloff: 5.9, core: 0xf7a96b, glow: 0xffd18f, landable: true, landingRadius: 1.34, orbitAngularSpeed: 0.98, orbitEccentricity: 0.12, spinAngularSpeed: -0.56 },
      { name: 'North Fan', position: polar(5.782, 24.9), radius: 0.9, gravity: 9.8, falloff: 6.3, core: 0x8e7eff, glow: 0xc1b9ff, landable: true, landingRadius: 1.44, orbitAngularSpeed: -0.16, orbitEccentricity: 0.08, spinAngularSpeed: 0.82 },
      { name: 'South Dock', position: polar(6.936, -33.8), radius: 0.72, gravity: 7.4, falloff: 5.0, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 1.12, orbitAngularSpeed: 0.24, orbitEccentricity: 0.04, spinAngularSpeed: -0.74 },
      { name: 'Goal Rim', position: polar(9.04, 7.2), radius: 1.0, gravity: 12.2, falloff: 7.1, core: 0xff82a6, glow: 0xffbfce, landable: false, orbitAngularSpeed: 0.01, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'far-side-switch',
    name: 'Switchback Reach',
    preferRelay: true,
    summary: 'The first relay is easy. The real route only appears after a second switch on the far side of the system.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 339, power: 2.39 },
      { angleDeg: 18, power: 2.58 },
    ],
    startAnchor: polar(2.302, -122.4),
    goalCenter: polar(10.304, 16),
    goalOpenSeconds: 11,
    goalPullRadius: 5.1,
    goalPullStrength: 6.7,
    planets: [
      { name: 'Launch Switch', position: polar(1.972, -123.1), radius: 0.64, gravity: 7.3, falloff: 4.8, core: 0x73bcff, glow: 0x8bdbff, landable: true, orbitAngularSpeed: 0.16, spinAngularSpeed: -0.14 },
      { name: 'Brake Spur', position: polar(3.564, 19.2), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0xf2a366, glow: 0xffd286, landable: true, landingRadius: 1.26, orbitAngularSpeed: -0.08, orbitEccentricity: 0.04, spinAngularSpeed: 0.78 },
      { name: 'Switch Relay', position: polar(5.984, -19.4), radius: 0.9, gravity: 9.9, falloff: 6.3, core: 0x8e81ff, glow: 0xc8c0ff, landable: true, landingRadius: 1.44, orbitAngularSpeed: 0.16, orbitEccentricity: 0.04, spinAngularSpeed: -0.46 },
      { name: 'Far Dock', position: polar(7.942, 46.8), radius: 0.72, gravity: 8.1, falloff: 5.2, core: 0xbfc6d6, glow: 0xf4f8ff, landable: true, landingRadius: 1.14, orbitAngularSpeed: -0.18, orbitEccentricity: 0.03, spinAngularSpeed: 0.62 },
      { name: 'Outer Keeper', position: polar(9.062, 8.8), radius: 1.02, gravity: 12.2, falloff: 7.2, core: 0xff9a76, glow: 0xffd1ad, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'halo-shepherds',
    name: 'Halo Weave',
    preferRelay: true,
    summary: 'The halo route is now a weave of relays and drifting traffic, with the giant still doing most of the talking.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 93.9, power: 2.75 },
      { angleDeg: 8, power: 2.39 },
    ],
    startAnchor: polar(2.864, -135.7),
    goalCenter: polar(11.52, 18.2),
    goalOpenSeconds: 11,
    goalPullRadius: 5.7,
    goalPullStrength: 7.2,
    planets: [
      { name: 'Launch Halo', position: polar(2.375, -130.7), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x6fbfff, glow: 0x8ddfff, landable: true, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.06 },
      { name: 'West Brake', position: polar(3.482, 159), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0x8e81ff, glow: 0xc8c1ff, landable: true, landingRadius: 1.24, orbitAngularSpeed: -0.52, orbitEccentricity: 0.05, spinAngularSpeed: 1.04 },
      { name: 'South Giant', position: polar(4.248, -47.9), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff84aa, glow: 0xffc2d3, landable: false, orbitAngularSpeed: 0.05, spinAngularSpeed: -0.08 },
      { name: 'North Relay', position: polar(6.318, 66.8), radius: 0.84, gravity: 9.1, falloff: 5.9, core: 0xf6a76a, glow: 0xffd38d, landable: true, landingRadius: 1.36, orbitAngularSpeed: 1.24, orbitEccentricity: 0.03, spinAngularSpeed: -0.4 },
      { name: 'Outer Halo', position: polar(7.724, 26.4), radius: 0.92, gravity: 10.2, falloff: 6.4, core: 0x9f8dff, glow: 0xd3cbff, landable: true, landingRadius: 1.46, orbitAngularSpeed: 0.14, orbitEccentricity: 0.03, spinAngularSpeed: 0.42 },
      { name: 'East Halo Dock', position: polar(9.146, -14.2), radius: 0.74, gravity: 7.8, falloff: 5.2, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 1.16, orbitAngularSpeed: -0.24, orbitEccentricity: 0.05, spinAngularSpeed: 0.58 },
      { name: 'Goal Keeper', position: polar(10.884, 6), radius: 1.04, gravity: 12.5, falloff: 7.3, core: 0xff9a74, glow: 0xffd2a8, landable: false, orbitAngularSpeed: -0.02, spinAngularSpeed: 0.03 },
    ],
  },
  {
    id: 'long-brood',
    name: 'Long Reach',
    preferRelay: true,
    summary: 'The outer station still matters, but a distant dock now bends the long transfer and punishes lazy exits.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 15.7, power: 1.66 },
      { angleDeg: 344.3, power: 2.02 },
    ],
    startAnchor: polar(2.264, 120.5),
    goalCenter: polar(10.482, -17.4),
    goalOpenSeconds: 11,
    goalPullRadius: 5.4,
    goalPullStrength: 7.0,
    planets: [
      { name: 'Launch Moon', position: polar(1.947, 119.2), radius: 0.64, gravity: 7.2, falloff: 4.8, core: 0x70bbff, glow: 0x86d8ff, landable: true, orbitAngularSpeed: -0.24, spinAngularSpeed: 0.18 },
      { name: 'Mid Moon', position: polar(3.296, 9.6), radius: 0.74, gravity: 8.8, falloff: 5.5, core: 0xf4a467, glow: 0xffd38d, landable: true, landingRadius: 1.22, orbitAngularSpeed: 0.82, orbitEccentricity: 0.08, spinAngularSpeed: -0.56 },
      { name: 'Outer Station', position: polar(5.744, -24.8), radius: 0.92, gravity: 10.1, falloff: 6.4, core: 0x8e81ff, glow: 0xc7c0ff, landable: true, landingRadius: 1.48, orbitAngularSpeed: 0.04, orbitEccentricity: 0.08, spinAngularSpeed: 0.68 },
      { name: 'North Giant', position: polar(6.684, 31.4), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff87aa, glow: 0xffc4d2, landable: false, orbitAngularSpeed: 0.37, orbitEccentricity: 0.06, spinAngularSpeed: -0.18 },
      { name: 'Transfer Dock', position: polar(7.964, -49.4), radius: 0.72, gravity: 7.7, falloff: 5.0, core: 0xbfc6d6, glow: 0xf4f8ff, landable: true, landingRadius: 1.14, orbitAngularSpeed: 0.22, orbitEccentricity: 0.08, spinAngularSpeed: -0.62 },
      { name: 'Rim Giant', position: polar(8.86, 5.2), radius: 1.02, gravity: 12.2, falloff: 7.2, core: 0xff9a79, glow: 0xffd2b2, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'guarded-brood',
    name: 'Guarded Ladder',
    preferRelay: true,
    summary: 'The guarded relay now asks for a clean climb through a separate outer dock, with no moon chain to hide behind.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 187.8, power: 2.75 },
      { angleDeg: 328.7, power: 2.75 },
    ],
    startAnchor: polar(1.19, 103.2),
    goalCenter: polar(9.684, 12.2),
    goalOpenSeconds: 16,
    goalPullRadius: 4.8,
    goalPullStrength: 5.9,
    planets: [
      { name: 'Inner Dock', position: polar(1.498, 64.3), radius: 0.92, gravity: 10.2, falloff: 6.4, core: 0xf1a064, glow: 0xffcf86, landable: true, landingRadius: 1.62, orbitAngularSpeed: 0.18, spinAngularSpeed: 0.1 },
      { name: 'Relay Ring', position: polar(4.657, 176.9), radius: 0.56, gravity: 5.9, falloff: 4.0, core: 0x76bcff, glow: 0x98ddff, landable: true, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.05 },
      { name: 'Outer Dock', position: polar(6.948, 150.6), radius: 0.74, gravity: 7.8, falloff: 5.1, core: 0xc0c7d7, glow: 0xf4f8ff, landable: true, landingRadius: 1.14, orbitAngularSpeed: -0.18, orbitEccentricity: 0.04, spinAngularSpeed: 0.64 },
      { name: 'Outer Guard', position: polar(10.624, 48.4), radius: 0.84, gravity: 7.4, falloff: 5.6, core: 0xff7f9f, glow: 0xffb8c8, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'countermoon-gate',
    name: 'Countergate Run',
    preferRelay: true,
    summary: 'The counterspin lane survives, but the runway now cashes out through a drifting side dock rather than a moon ladder.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 266.1, power: 1.29 },
      { angleDeg: 313, power: 2.39 },
    ],
    startAnchor: polar(2.122, 133.1),
    goalCenter: polar(10.782, -16.2),
    goalOpenSeconds: 12,
    goalPullRadius: 5.3,
    goalPullStrength: 6.9,
    planets: [
      { name: 'Launch Three', position: polar(1.851, 128.4), radius: 0.64, gravity: 7.4, falloff: 4.9, core: 0x78beff, glow: 0x8dd9ff, landable: true, orbitAngularSpeed: 0.52, spinAngularSpeed: -0.48 },
      { name: 'Brake Moon', position: polar(3.168, -51.6), radius: 0.78, gravity: 9.0, falloff: 5.8, core: 0xf1a067, glow: 0xffd286, landable: true, landingRadius: 1.28, orbitAngularSpeed: -0.06, orbitEccentricity: 0.12, spinAngularSpeed: 0.92 },
      { name: 'South Giant', position: polar(5.342, -37.9), radius: 0.94, gravity: 11.3, falloff: 6.8, core: 0xff86a8, glow: 0xffbdd0, landable: false, orbitAngularSpeed: -0.18, orbitEccentricity: 0.08, spinAngularSpeed: 0.24 },
      { name: 'Outer Runway', position: polar(6.542, 19.8), radius: 0.88, gravity: 9.8, falloff: 6.2, core: 0x8d7eff, glow: 0xcabfff, landable: true, landingRadius: 1.42, orbitAngularSpeed: 0.28, orbitEccentricity: 0.02, spinAngularSpeed: -0.12 },
      { name: 'Side Dock', position: polar(8.136, 42.6), radius: 0.72, gravity: 7.6, falloff: 5.0, core: 0xc1c8d7, glow: 0xf4f8ff, landable: true, landingRadius: 1.16, orbitAngularSpeed: -0.24, orbitEccentricity: 0.04, spinAngularSpeed: 0.58 },
      { name: 'Goal Sentinel', position: polar(9.562, -4), radius: 0.98, gravity: 12.0, falloff: 7.0, core: 0xff9a79, glow: 0xffd2b5, landable: false, orbitAngularSpeed: 0.02, spinAngularSpeed: -0.03 },
    ],
  },
  {
    id: 'crown-lattice',
    name: 'Crown Lattice',
    preferRelay: true,
    summary: 'The outer crown is now a lattice of separate rim worlds instead of one obvious lane, so the safe exit keeps shifting.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 96, power: 2.39 },
      { angleDeg: 8, power: 2.58 },
    ],
    startAnchor: polar(2.904, -136.1),
    goalCenter: polar(11.82, 16.8),
    goalOpenSeconds: 10,
    goalPullRadius: 5.6,
    goalPullStrength: 7.1,
    planets: [
      { name: 'Launch Crown', position: polar(2.396, -131.8), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x6fc0ff, glow: 0x8fe0ff, landable: true, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.06 },
      { name: 'West Brake', position: polar(3.742, 154.2), radius: 0.8, gravity: 9.0, falloff: 5.8, core: 0x8f82ff, glow: 0xc9c2ff, landable: true, landingRadius: 1.24, orbitAngularSpeed: -0.46, orbitEccentricity: 0.04, spinAngularSpeed: 0.98 },
      { name: 'South Giant', position: polar(4.584, -50.8), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff86aa, glow: 0xffc3d3, landable: false, orbitAngularSpeed: 0.04, spinAngularSpeed: -0.08 },
      { name: 'North Relay', position: polar(6.612, 70.8), radius: 0.84, gravity: 9.2, falloff: 5.9, core: 0xf6a56c, glow: 0xffd58f, landable: true, landingRadius: 1.38, orbitAngularSpeed: 1.02, orbitEccentricity: 0.04, spinAngularSpeed: -0.36 },
      { name: 'Crown Relay', position: polar(7.942, 28.2), radius: 0.94, gravity: 10.3, falloff: 6.4, core: 0x9f8cff, glow: 0xd4cbff, landable: true, landingRadius: 1.5, orbitAngularSpeed: 0.12, orbitEccentricity: 0.03, spinAngularSpeed: 0.36 },
      { name: 'East Crown Dock', position: polar(9.314, -6.8), radius: 0.74, gravity: 7.6, falloff: 5.1, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 1.16, orbitAngularSpeed: -0.3, orbitEccentricity: 0.04, spinAngularSpeed: 0.56 },
      { name: 'Goal Crown', position: polar(11.012, 8.2), radius: 1.04, gravity: 12.5, falloff: 7.3, core: 0xff9a74, glow: 0xffd2ab, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'shepherd-crown',
    name: 'Mirror Crown',
    preferRelay: true,
    summary: 'The mirrored crown keeps the broad sweep, but the off-axis dock bends the safe exit away from the obvious line.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 338, power: 2.39 },
      { angleDeg: 42, power: 2.02 },
    ],
    startAnchor: polar(2.876, 136.2),
    goalCenter: polar(11.9, -16.2),
    goalOpenSeconds: 10,
    goalPullRadius: 5.6,
    goalPullStrength: 7.1,
    planets: [
      { name: 'Launch Crown', position: polar(2.382, 132.4), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x6fc0ff, glow: 0x8fe0ff, landable: true, orbitAngularSpeed: -0.08, spinAngularSpeed: -0.06 },
      { name: 'East Brake', position: polar(3.782, -157.4), radius: 0.8, gravity: 9.0, falloff: 5.8, core: 0x9082ff, glow: 0xc9c2ff, landable: true, landingRadius: 1.24, orbitAngularSpeed: 0.44, orbitEccentricity: 0.04, spinAngularSpeed: -0.98 },
      { name: 'North Giant', position: polar(4.612, 49.6), radius: 0.96, gravity: 11.4, falloff: 6.9, core: 0xff87ab, glow: 0xffc4d4, landable: false, orbitAngularSpeed: -0.04, spinAngularSpeed: 0.08 },
      { name: 'South Relay', position: polar(6.584, -72.2), radius: 0.84, gravity: 9.2, falloff: 5.9, core: 0xf6a56c, glow: 0xffd58f, landable: true, landingRadius: 1.38, orbitAngularSpeed: -0.96, orbitEccentricity: 0.04, spinAngularSpeed: 0.36 },
      { name: 'Crown Relay', position: polar(7.904, -30.4), radius: 0.94, gravity: 10.3, falloff: 6.4, core: 0xa08cff, glow: 0xd5cbff, landable: true, landingRadius: 1.5, orbitAngularSpeed: -0.12, orbitEccentricity: 0.03, spinAngularSpeed: -0.36 },
      { name: 'West Crown Dock', position: polar(9.286, -55.4), radius: 0.74, gravity: 7.6, falloff: 5.1, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 1.16, orbitAngularSpeed: 0.28, orbitEccentricity: 0.04, spinAngularSpeed: -0.56 },
      { name: 'Goal Crown', position: polar(11.038, -10.2), radius: 1.04, gravity: 12.5, falloff: 7.3, core: 0xff9a74, glow: 0xffd2ab, landable: false, orbitAngularSpeed: 0.01, spinAngularSpeed: -0.02 },
    ],
  },
  {
    id: 'final-moon-circuit',
    name: 'Final Weave',
    preferRelay: true,
    summary: 'The last system is a composed weave of relays and guards. The line is clean only if every handoff stays controlled.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 338, power: 2.39 },
      { angleDeg: 18, power: 2.58 },
    ],
    startAnchor: polar(2.342, -128.8),
    goalCenter: polar(10.842, 17),
    goalOpenSeconds: 11,
    goalPullRadius: 5.5,
    goalPullStrength: 7.2,
    planets: [
      { name: 'Launch Circuit', position: polar(2.012, -129.8), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x70bcff, glow: 0x8ad9ff, landable: true, orbitAngularSpeed: 0.1, spinAngularSpeed: 0.08 },
      { name: 'Brake Arc', position: polar(3.386, 39.2), radius: 0.78, gravity: 8.9, falloff: 5.7, core: 0xf2a367, glow: 0xffd287, landable: true, landingRadius: 1.26, orbitAngularSpeed: -0.1, orbitEccentricity: 0.04, spinAngularSpeed: 0.76 },
      { name: 'Outer Circuit', position: polar(6.024, -24.2), radius: 0.92, gravity: 10.0, falloff: 6.3, core: 0x8f81ff, glow: 0xc8c0ff, landable: true, landingRadius: 1.46, orbitAngularSpeed: 0.14, orbitEccentricity: 0.04, spinAngularSpeed: -0.42 },
      { name: 'North Sentinel', position: polar(6.982, 31.4), radius: 0.98, gravity: 11.5, falloff: 7.0, core: 0xff86aa, glow: 0xffc2d3, landable: false, orbitAngularSpeed: 0.04, orbitEccentricity: 0.04, spinAngularSpeed: -0.16 },
      { name: 'South Dock', position: polar(8.344, -59.2), radius: 0.68, gravity: 7.4, falloff: 4.9, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 1.08, orbitAngularSpeed: 0.16, orbitEccentricity: 0.03, spinAngularSpeed: -0.58 },
      { name: 'Goal Crown', position: polar(9.62, 8.8), radius: 1.04, gravity: 12.4, falloff: 7.3, core: 0xff9a75, glow: 0xffd2ac, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
  {
    id: 'final-circuit',
    name: 'Final Circuit',
    preferRelay: true,
    summary: 'The final wide system asks for one clean relay, one clean burn, and no wasted motion.',
    sun: [0, 0],
    startPlanetIndex: 0,
    launchPresets: [
      { angleDeg: 338, power: 2.39 },
      { angleDeg: 18, power: 2.58 },
    ],
    startAnchor: polar(2.342, -128.8),
    goalCenter: polar(10.442, 16.8),
    goalOpenSeconds: 10,
    goalPullRadius: 5.4,
    goalPullStrength: 7.1,
    planets: [
      { name: 'Launch Circuit', position: polar(2.012, -129.8), radius: 0.64, gravity: 7.4, falloff: 4.8, core: 0x70bcff, glow: 0x8ad9ff, landable: true, orbitAngularSpeed: 0.1, spinAngularSpeed: 0.08 },
      { name: 'Brake Arc', position: polar(3.386, 39.2), radius: 0.78, gravity: 8.9, falloff: 5.7, core: 0xf2a367, glow: 0xffd287, landable: true, landingRadius: 1.26, orbitAngularSpeed: -0.1, orbitEccentricity: 0.04, spinAngularSpeed: 0.76 },
      { name: 'Outer Circuit', position: polar(6.024, -24.2), radius: 0.92, gravity: 10.0, falloff: 6.3, core: 0x8f81ff, glow: 0xc8c0ff, landable: true, landingRadius: 1.46, orbitAngularSpeed: 0.16, orbitEccentricity: 0.05, spinAngularSpeed: -0.44 },
      { name: 'North Sentinel', position: polar(6.982, 31.4), radius: 0.98, gravity: 11.5, falloff: 7.0, core: 0xff86aa, glow: 0xffc2d3, landable: false, orbitAngularSpeed: 0.04, orbitEccentricity: 0.04, spinAngularSpeed: -0.16 },
      { name: 'Goal Crown', position: polar(8.482, 8.8), radius: 1.04, gravity: 12.4, falloff: 7.3, core: 0xff9a75, glow: 0xffd2ac, landable: false, orbitAngularSpeed: -0.01, spinAngularSpeed: 0.02 },
    ],
  },
];

const coreLevelById = new Map(
  CORE_LEVEL_DEFINITIONS.map((level) => [level.id, level]),
);

const WORLD_THEMES = {
  frostline: {
    landable: [
      { core: 0x9ed8ff, glow: 0xe8f8ff },
      { core: 0x89f0ff, glow: 0xd9ffff },
      { core: 0xc8cbff, glow: 0xf5f6ff },
    ],
    hazards: [
      { core: 0x83a9dc, glow: 0xcce4ff },
      { core: 0x9bb8ff, glow: 0xdeebff },
      { core: 0x7fd6f2, glow: 0xcaf8ff },
    ],
    moons: [
      { core: 0xecf4ff, glow: 0xffffff },
    ],
  },
  ember: {
    landable: [
      { core: 0xffaf6a, glow: 0xffe1a4 },
      { core: 0xff8e65, glow: 0xffc2a1 },
      { core: 0xffc26f, glow: 0xffefb6 },
    ],
    hazards: [
      { core: 0xff6f5f, glow: 0xffb093 },
      { core: 0xff8762, glow: 0xffc89c },
      { core: 0xff6f8d, glow: 0xffb1c0 },
    ],
    moons: [
      { core: 0xffd9b0, glow: 0xfff1d7 },
    ],
  },
  prism: {
    landable: [
      { core: 0x8ec6ff, glow: 0xcff0ff },
      { core: 0xbc93ff, glow: 0xe8dbff },
      { core: 0xffa0c5, glow: 0xffd7e6 },
    ],
    hazards: [
      { core: 0xff88ab, glow: 0xffc3d4 },
      { core: 0xff9b7a, glow: 0xffd5b7 },
      { core: 0xaa8fff, glow: 0xdccfff },
    ],
    moons: [
      { core: 0xf5eeff, glow: 0xffffff },
    ],
  },
  singularity: {
    landable: [
      { core: 0x7db9ff, glow: 0xbfe2ff },
      { core: 0x75e8d4, glow: 0xbffff2 },
      { core: 0xb6a0ff, glow: 0xe4dbff },
    ],
    hazards: [
      { core: 0xff7e93, glow: 0xffbcc8 },
      { core: 0xff986e, glow: 0xffd0ab },
      { core: 0xd37aff, glow: 0xf0c6ff },
    ],
    moons: [
      { core: 0xe8eeff, glow: 0xffffff },
    ],
  },
  ancient: {
    landable: [
      { core: 0xd1bb84, glow: 0xffe5a8 },
      { core: 0xa3b77b, glow: 0xdaf0a8 },
      { core: 0x8bb0d8, glow: 0xcde8ff },
    ],
    hazards: [
      { core: 0xcf8b6c, glow: 0xffcfb5 },
      { core: 0xb28cff, glow: 0xe0d0ff },
      { core: 0xff8fa7, glow: 0xffc8d5 },
    ],
    moons: [
      { core: 0xf1ead6, glow: 0xffffff },
    ],
  },
};

function cloneLaunchPresets(launchPresets) {
  return launchPresets.map((preset) => ({
    angleDeg: preset.angleDeg,
    power: preset.power,
  }));
}

function cloneAdminSolutions(adminSolutions) {
  return adminSolutions.map((solution) => ({
    ...solution,
    shots: solution.shots.map((shot) => ({ ...shot })),
  }));
}

function clonePlanets(planets) {
  return planets.map((planet) => ({ ...planet }));
}

function cloneLevel(baseId, overrides = {}) {
  const base = coreLevelById.get(baseId);
  if (!base) {
    throw new Error(`Unknown base level "${baseId}".`);
  }

  const level = {
    ...base,
    ...overrides,
    launchPresets: cloneLaunchPresets(overrides.launchPresets ?? base.launchPresets),
    planets: clonePlanets(overrides.planets ?? base.planets),
  };

  if ('tutorial' in overrides) {
    level.tutorial = overrides.tutorial;
  } else if (base.tutorial) {
    level.tutorial = { ...base.tutorial };
  }

  if ('adminSolutions' in overrides) {
    if (overrides.adminSolutions === null || overrides.adminSolutions === undefined) {
      delete level.adminSolutions;
    } else {
      level.adminSolutions = cloneAdminSolutions(overrides.adminSolutions);
    }
  } else if (base.adminSolutions) {
    level.adminSolutions = cloneAdminSolutions(base.adminSolutions);
  }

  return level;
}

function shiftPolarPoint(point, radiusDelta = 0, angleDelta = 0) {
  return polar(point.radius + radiusDelta, point.angleDeg + angleDelta);
}

function tuneLaunchPresets(launchPresets, angleDelta = 0, powerScale = 1) {
  return launchPresets.map((preset) => ({
    angleDeg: Number((preset.angleDeg + angleDelta).toFixed(1)),
    power: Number(Math.max(0.85, preset.power * powerScale).toFixed(2)),
  }));
}

function applyPlanetTweaks(planets, tweaks = {}) {
  return planets.map((planet, planetIndex) => ({
    ...planet,
    ...(tweaks[planetIndex] ?? {}),
  }));
}

function rethemePlanets(planets, themeKey) {
  const theme = WORLD_THEMES[themeKey];
  if (!theme) {
    return clonePlanets(planets);
  }

  let landableIndex = 0;
  let hazardIndex = 0;
  let moonIndex = 0;

  return planets.map((planet) => {
    const palette = planet.orbitAround !== undefined
      ? theme.moons[moonIndex++ % theme.moons.length]
      : (
        planet.landable
          ? theme.landable[landableIndex++ % theme.landable.length]
          : theme.hazards[hazardIndex++ % theme.hazards.length]
      );
    return {
      ...planet,
      core: palette.core,
      glow: palette.glow,
    };
  });
}

function variantLevel(themeKey, spec) {
  const base = coreLevelById.get(spec.baseId);
  const startAnchorShift = spec.startAnchorShift ?? {};
  const goalShift = spec.goalShift ?? {};
  const goalOpenSeconds = spec.goalOpenSeconds
    ?? Math.max(6, (base.goalOpenSeconds ?? DEFAULT_GOAL_OPEN_SECONDS) + (spec.goalOpenSecondsDelta ?? 0));
  const planets = rethemePlanets(
    applyPlanetTweaks(base.planets, spec.planetTweaks),
    themeKey,
  );
  const nextLevel = cloneLevel(spec.baseId, {
    id: spec.id,
    name: spec.name,
    summary: spec.summary ?? base.summary,
    tutorial: null,
    adminSolutions: null,
    goalOpenSeconds,
    startAnchor: shiftPolarPoint(
      base.startAnchor,
      startAnchorShift.radius ?? 0,
      startAnchorShift.angle ?? 0,
    ),
    goalCenter: shiftPolarPoint(
      base.goalCenter,
      goalShift.radius ?? 0,
      goalShift.angle ?? 0,
    ),
    launchPresets: tuneLaunchPresets(
      base.launchPresets,
      spec.launchAngleDelta ?? 0,
      spec.powerScale ?? 1,
    ),
    goalPullRadius: spec.goalPullRadius ?? base.goalPullRadius,
    goalPullStrength: spec.goalPullStrength ?? base.goalPullStrength,
    planets,
  });

  if (spec.startTimeSeconds !== undefined) {
    nextLevel.startTimeSeconds = spec.startTimeSeconds;
  }

  return nextLevel;
}

function makeIcyVariant(spec) {
  const level = variantLevel('frostline', spec);
  level.planets = level.planets.map((planet, index) => (
    planet.landable
      ? {
        ...planet,
        surfaceType: 'ice',
        slideAngularSpeed: spec.slideAngularSpeeds?.[index]
          ?? (((index % 2 === 0 ? 1 : -1) * (spec.defaultSlideAngularSpeed ?? 0.2))),
        slideSettleSeconds: spec.slideSettleSeconds ?? 4,
      }
      : planet
  ));
  return level;
}

function makePortalVariant(spec) {
  const level = variantLevel('prism', spec);
  const pairSeed = spec.id;
  level.portals = [
    {
      id: `${pairSeed}-white`,
      pairId: `${pairSeed}-black`,
      variant: 'white',
      position: spec.portalWhite.position,
      radius: spec.portalWhite.radius ?? 0.64,
      orbitAngularSpeed: spec.portalWhite.orbitAngularSpeed ?? 0.34,
      orbitEccentricity: spec.portalWhite.orbitEccentricity ?? 0.04,
      orbitRotationDeg: spec.portalWhite.orbitRotationDeg,
      core: 0xe8f6ff,
      glow: 0x9fe9ff,
    },
    {
      id: `${pairSeed}-black`,
      pairId: `${pairSeed}-white`,
      variant: 'black',
      position: spec.portalBlack.position,
      radius: spec.portalBlack.radius ?? 0.72,
      orbitAngularSpeed: spec.portalBlack.orbitAngularSpeed ?? -0.18,
      orbitEccentricity: spec.portalBlack.orbitEccentricity ?? 0.05,
      orbitRotationDeg: spec.portalBlack.orbitRotationDeg,
      core: 0x0b0616,
      glow: 0x7e67ff,
    },
  ];
  return level;
}

function makeBinaryVariant(spec) {
  const level = variantLevel('singularity', spec);
  const secondaryOrbitRadius = clamp((spec.extraSun.position.radius ?? 5) * 0.32, 1.35, 2.2);
  const primaryOrbitRadius = clamp(secondaryOrbitRadius * 0.62, 0.78, 1.4);
  const orbitAngleDeg = spec.extraSun.position.angleDeg ?? 0;
  const orbitAngularSpeed = spec.extraSun.orbitAngularSpeed ?? 0.22;
  level.binarySystem = {
    primarySun: {
      name: spec.primarySun?.name ?? 'Primary Sun',
      position: polar(primaryOrbitRadius, orbitAngleDeg + 180),
      radius: spec.primarySun?.radius ?? BINARY_PRIMARY_RADIUS,
      gravityStrength: spec.primarySun?.gravityStrength ?? BINARY_PRIMARY_GRAVITY_STRENGTH,
      collisionRadius: spec.primarySun?.collisionRadius ?? BINARY_PRIMARY_RADIUS,
      orbitAngularSpeed,
      orbitEccentricity: spec.primarySun?.orbitEccentricity ?? (spec.extraSun.orbitEccentricity ?? 0.04),
      orbitRotationDeg: spec.primarySun?.orbitRotationDeg ?? spec.extraSun.orbitRotationDeg,
      core: spec.primarySun?.core ?? 0xffdf96,
      glow: spec.primarySun?.glow ?? 0xffa95a,
    },
    secondarySun: {
      name: spec.extraSun.name ?? 'Second Sun',
      position: polar(secondaryOrbitRadius, orbitAngleDeg),
      radius: spec.extraSun.radius ?? BINARY_SECONDARY_RADIUS,
      gravityStrength: spec.extraSun.gravityStrength ?? BINARY_SECONDARY_GRAVITY_STRENGTH,
      collisionRadius: spec.extraSun.collisionRadius ?? BINARY_SECONDARY_RADIUS,
      orbitAngularSpeed,
      orbitEccentricity: spec.extraSun.orbitEccentricity ?? 0.04,
      orbitRotationDeg: spec.extraSun.orbitRotationDeg,
      core: spec.extraSun.core ?? 0x9ed7ff,
      glow: spec.extraSun.glow ?? 0x65b7ff,
    },
  };
  level.extraSuns = [];
  level.planets = level.planets.map((planet, index) => {
    if (planet.orbitAround !== undefined) {
      return planet;
    }
    if (spec.secondaryOrbitIndices?.includes(index)) {
      return { ...planet, orbitAnchor: 'secondary-sun' };
    }
    if (spec.primaryOrbitIndices?.includes(index)) {
      return { ...planet, orbitAnchor: 'primary-sun' };
    }
    return { ...planet, orbitAnchor: 'system-center' };
  });

  const primarySunPoint = pointFromPolar(level.binarySystem.primarySun.position);
  const secondarySunPoint = pointFromPolar(level.binarySystem.secondarySun.position);
  const outerSunReach = Math.max(
    level.binarySystem.primarySun.position.radius + (level.binarySystem.primarySun.collisionRadius ?? BINARY_PRIMARY_RADIUS),
    level.binarySystem.secondarySun.position.radius + (level.binarySystem.secondarySun.collisionRadius ?? BINARY_SECONDARY_RADIUS),
  );
  const clearancePadding = 0.48;
  let previousRadius = 0;

  level.planets = level.planets.map((planet) => {
    const nextPlanet = { ...planet };
    let point = pointFromPolar(nextPlanet.position);
    const radiusPadding = nextPlanet.radius + clearancePadding;

    if (nextPlanet.orbitAnchor === 'system-center') {
      const minRadius = outerSunReach + radiusPadding;
      const pointRadius = length(point);
      if (pointRadius < minRadius) {
        const direction = pointRadius > 0.000001 ? normalize(point) : vec(1, 0);
        point = vec(direction.x * minRadius, direction.y * minRadius);
      }
    } else {
      const anchorPoint = nextPlanet.orbitAnchor === 'primary-sun' ? primarySunPoint : secondarySunPoint;
      const anchorRadius = nextPlanet.orbitAnchor === 'primary-sun'
        ? (level.binarySystem.primarySun.collisionRadius ?? BINARY_PRIMARY_RADIUS)
        : (level.binarySystem.secondarySun.collisionRadius ?? BINARY_SECONDARY_RADIUS);
      let relative = vec(point.x - anchorPoint.x, point.y - anchorPoint.y);
      const relativeLength = length(relative);
      const minRelativeLength = anchorRadius + radiusPadding;
      if (relativeLength < minRelativeLength) {
        const direction = relativeLength > 0.000001 ? normalize(relative) : normalize(vec(point.x, point.y));
        relative = vec(direction.x * minRelativeLength, direction.y * minRelativeLength);
        point = vec(anchorPoint.x + relative.x, anchorPoint.y + relative.y);
      }
    }

    const pointRadius = length(point);
    if (pointRadius < previousRadius + 0.02) {
      const direction = pointRadius > 0.000001 ? normalize(point) : vec(1, 0);
      const pushedRadius = previousRadius + 0.02;
      point = vec(direction.x * pushedRadius, direction.y * pushedRadius);
    }

    previousRadius = length(point);
    nextPlanet.position = polarFromPoint(point);
    return nextPlanet;
  });

  return level;
}

function makeAncientVariant(spec) {
  const level = variantLevel('ancient', spec);
  level.goalUnlockRequired = true;
  level.goalOpenSeconds = spec.goalOpenSeconds ?? level.goalOpenSeconds;
  level.tutorial = spec.tutorial ?? null;
  level.planets = level.planets.map((planet, index) => ({
    ...planet,
    goalUnlock: index === spec.unlockPlanetIndex,
  }));
  return level;
}

function makeSplitVariant(spec) {
  const level = variantLevel('prism', spec);
  const splitPlanets = spec.splitPlanets ?? {};
  level.planets = level.planets.map((planet, index) => {
    const split = splitPlanets[index];
    if (!split) {
      return planet;
    }

    return {
      ...planet,
      landable: true,
      splitSurface: {
        landableAngleDeg: split.landableAngleDeg ?? 0,
        threshold: split.threshold ?? 0,
      },
      landingRadius: split.landingRadius ?? planet.landingRadius ?? planet.radius + 0.72,
    };
  });
  return level;
}

const ICY_WORLD_SPECS = [
  { baseId: 'first-relay', id: 'polar-relay', name: 'Polar Relay', summary: 'Land on a frozen relay, then let the ball drift around the ice before you launch again.', defaultSlideAngularSpeed: 0.8, slideAngularSpeeds: { 0: 0.72, 1: -0.82 } },
  { baseId: 'mirror-harbor', id: 'frost-gate', name: 'Frost Gate', summary: 'The two-gate relay only works if you let the icy harbor drift into the correct launch face.', defaultSlideAngularSpeed: 0.82 },
  { baseId: 'guarded-relay', id: 'whiteout-lock', name: 'Whiteout Lock', summary: 'The outward relay is frozen solid, so the safe exit appears only after the ball skids around it.', defaultSlideAngularSpeed: -0.78 },
  { baseId: 'forked-harbor', id: 'aurora-harbor', name: 'Aurora Harbor', summary: 'Both harbors are slick. Pick the right landing because the drift changes the outgoing angle.', defaultSlideAngularSpeed: 0.76 },
  { baseId: 'inner-step', id: 'drift-step', name: 'Drift Step', summary: 'The first handoff is easy. The frozen outer relay is the real puzzle once the ball starts sliding.', defaultSlideAngularSpeed: -0.84 },
  { baseId: 'moon-switch', id: 'ice-switch', name: 'Ice Switch', summary: 'Wake the outer lane from an icy switch world whose launch point keeps drifting after touchdown.', defaultSlideAngularSpeed: 0.8 },
  { baseId: 'long-transfer', id: 'glacier-transfer', name: 'Glacier Transfer', summary: 'The outer station works, but the long frozen setup only lines up after a slow quarter-turn drift.', defaultSlideAngularSpeed: -0.8 },
  { baseId: 'halo-run', id: 'frost-halo', name: 'Frost Halo', summary: 'A long halo route becomes an ice route: land, drift, and leave at the correct new face.', defaultSlideAngularSpeed: 0.78 },
  { baseId: 'split-sentinel', id: 'rime-sentinel', name: 'Rime Sentinel', summary: 'The mirrored options both land safely, but only one icy stop drifts into a playable finish.', defaultSlideAngularSpeed: -0.82 },
  { baseId: 'moon-catch', id: 'moon-glide', name: 'Moon Glide', summary: 'Catch the moving moon, then ride the icy relay until the launch face settles into place.', defaultSlideAngularSpeed: 0.84 },
];

const PORTAL_WORLD_SPECS = [
  { baseId: 'moon-switch', id: 'aperture-switch', name: 'Aperture Switch', summary: 'Use the orbiting portal pair to redirect the shot onto the switch lane.', portalWhite: { position: polar(4.2, 138), orbitAngularSpeed: 0.46 }, portalBlack: { position: polar(7.2, -18), orbitAngularSpeed: -0.16 } },
  { baseId: 'long-transfer', id: 'gate-transfer', name: 'Gate Transfer', summary: 'The outer station is too far without a white-hole transfer that preserves your speed.', portalWhite: { position: polar(3.8, 8), orbitAngularSpeed: 0.22 }, portalBlack: { position: polar(6.9, -52), orbitAngularSpeed: -0.12 } },
  { baseId: 'halo-run', id: 'halo-gates', name: 'Halo Gates', summary: 'A portal on the inner lane feeds the long outer relay if you hit it with the right momentum.', portalWhite: { position: polar(4.6, 118), orbitAngularSpeed: 0.32 }, portalBlack: { position: polar(7.4, 6), orbitAngularSpeed: -0.1 } },
  { baseId: 'split-sentinel', id: 'split-port', name: 'Split Port', summary: 'The mirrored routes converge at a portal pair, but only one exit preserves a playable line.', portalWhite: { position: polar(4.9, -18), orbitAngularSpeed: 0.28 }, portalBlack: { position: polar(7.8, 32), orbitAngularSpeed: -0.08 } },
  { baseId: 'mirror-sweep', id: 'echo-port', name: 'Echo Port', summary: 'The late sweep now folds through a portal, turning one clean arc into a two-part transfer.', portalWhite: { position: polar(3.8, 24), orbitAngularSpeed: 0.4 }, portalBlack: { position: polar(6.8, 158), orbitAngularSpeed: -0.12 } },
  { baseId: 'moon-catch', id: 'moon-gate', name: 'Moon Gate', summary: 'Catch the moon, then leave through a black gate to punch through the far side.', portalWhite: { position: polar(4.4, -34), orbitAngularSpeed: 0.2 }, portalBlack: { position: polar(7.6, 18), orbitAngularSpeed: -0.24 } },
  { baseId: 'false-periapsis', id: 'aperture-bend', name: 'Aperture Bend', summary: 'The periapsis touch only works if the exit portal is arriving on the rim at the same moment.', portalWhite: { position: polar(4.3, -84), orbitAngularSpeed: 0.36 }, portalBlack: { position: polar(7.4, 18), orbitAngularSpeed: -0.14 } },
  { baseId: 'crown-window', id: 'crown-gate', name: 'Crown Gate', summary: 'The crown still opens on a timer, but the route now jumps through an orbiting aperture first.', portalWhite: { position: polar(5.4, 96), orbitAngularSpeed: 0.3 }, portalBlack: { position: polar(8.2, 12), orbitAngularSpeed: -0.1 } },
  { baseId: 'final-circuit', id: 'portal-circuit', name: 'Portal Circuit', summary: 'The clean circuit becomes a gate circuit: one portal handoff, one relay, one final burn.', portalWhite: { position: polar(4.2, 42), orbitAngularSpeed: 0.22 }, portalBlack: { position: polar(7.7, -18), orbitAngularSpeed: -0.18 } },
  { baseId: 'outer-echo', id: 'echo-aperture', name: 'Echo Aperture', summary: 'The false inner line now feeds a portal pair that can either save or ruin the outer finish.', portalWhite: { position: polar(4.8, 162), orbitAngularSpeed: 0.34 }, portalBlack: { position: polar(7.9, 24), orbitAngularSpeed: -0.12 } },
];

const BINARY_WORLD_SPECS = [
  { baseId: 'periapsis-moon', id: 'binary-moon', name: 'Binary Moon', summary: 'A second sun adds a sideways pull that changes the relay moon’s whole timing.', secondaryOrbitIndices: [3], extraSun: { position: polar(4.8, 158), core: 0xb7deff, glow: 0x67aaff } },
  { baseId: 'outer-crown', id: 'double-crown', name: 'Double Crown', summary: 'The crown transfer is now bent by two suns, turning the midline into a figure-eight lane.', secondaryOrbitIndices: [4], extraSun: { position: polar(5.6, -132), core: 0x9ee0ff, glow: 0x59a2ff } },
  { baseId: 'hot-giant', id: 'binary-giant', name: 'Binary Giant', summary: 'The giant is dangerous enough alone, but a cool companion sun drags the whole bend off-center.', extraSun: { position: polar(5.1, 148), core: 0xb6e2ff, glow: 0x62adff } },
  { baseId: 'shielded-arc', id: 'dual-arc', name: 'Dual Arc', summary: 'The shielded arc only works while the two suns tug against each other across the lane.', extraSun: { position: polar(4.8, -158), core: 0xa8dcff, glow: 0x589dff } },
  { baseId: 'sunlocked-relay', id: 'binary-sunlock', name: 'Binary Sunlock', summary: 'The launch world still faces the main sun, but the second star keeps shearing the outward burn.', extraSun: { position: polar(5.8, 168), core: 0xc2e7ff, glow: 0x6caeff } },
  { baseId: 'mirror-harbor', id: 'twin-harbor', name: 'Twin Harbor', summary: 'Both harbors are playable, but the cooler sun makes one side of the system far heavier.', secondaryOrbitIndices: [2], extraSun: { position: polar(5.2, -26), core: 0xa8ddff, glow: 0x5ba8ff } },
  { baseId: 'rim-switch', id: 'cross-suns', name: 'Cross Suns', summary: 'The switch route crosses the gravity seam between two suns on the way to the rim.', secondaryOrbitIndices: [2], extraSun: { position: polar(4.6, 24), core: 0xbde7ff, glow: 0x6bb1ff } },
  { baseId: 'counterspin-gate', id: 'counterdouble', name: 'Counterdouble', summary: 'The off-angle launch now stabilizes under two competing suns before you ever reach the gate.', secondaryOrbitIndices: [3], extraSun: { position: polar(4.9, -148), core: 0xb0e0ff, glow: 0x5fa5ff } },
  { baseId: 'guarded-relay', id: 'binary-guard', name: 'Binary Guard', summary: 'The relay route still survives, but the second sun squeezes the last outward seam.', secondaryOrbitIndices: [1], extraSun: { position: polar(5.8, 146), core: 0xbfe8ff, glow: 0x71b4ff } },
  { baseId: 'double-slalom', id: 'binary-slalom', name: 'Binary Slalom', summary: 'The slalom already threads giants; now the twin suns twist the approach into a deeper S-curve.', extraSun: { position: polar(5.3, 142), core: 0xb2ddff, glow: 0x63a7ff } },
];

const ANCIENT_WORLD_SPECS = [
  {
    baseId: 'first-relay',
    id: 'monolith-wardens',
    name: 'First Monolith',
    summary: 'Land on the golden monolith world first. That awakens the black hole for your second shot.',
    unlockPlanetIndex: 1,
    goalOpenSeconds: 9,
    tutorial: {
      type: 'monolith',
      copy: 'Touch the golden planet to open the black hole.',
    },
  },
  { baseId: 'periapsis-brood', id: 'altar-brood', name: 'Altar Brood', summary: 'The brood guards the altar world; land there to open the finish before the timer begins.', unlockPlanetIndex: 1, goalOpenSeconds: 8 },
  { baseId: 'far-side-switch', id: 'far-altar-switch', name: 'Far Altar Switch', summary: 'The far-side opening only matters after the monolith world has lit the goal.', unlockPlanetIndex: 2, goalOpenSeconds: 8 },
  { baseId: 'halo-shepherds', id: 'halo-monolith', name: 'Halo Monolith', summary: 'The halo route starts locked. Reach the monolith planet, then sprint the outer seam.', unlockPlanetIndex: 1, goalOpenSeconds: 8 },
  { baseId: 'long-brood', id: 'vault-monolith', name: 'Vault Monolith', summary: 'The long route is impossible until the ancient vault planet opens the black hole.', unlockPlanetIndex: 2, goalOpenSeconds: 8 },
  { baseId: 'guarded-brood', id: 'guarded-monolith', name: 'Guarded Monolith', summary: 'A guarded relay and a monolith planet must both be respected before the finish is available.', unlockPlanetIndex: 1, goalOpenSeconds: 7.5 },
  { baseId: 'countermoon-gate', id: 'moon-obelisk', name: 'Moon Obelisk', summary: 'The countermoon shapes the route, but the real objective is waking the obelisk first.', unlockPlanetIndex: 2, goalOpenSeconds: 8 },
  { baseId: 'crown-lattice', id: 'sealed-lattice', name: 'Sealed Lattice', summary: 'The crown lattice ends in a sealed hole until the lattice monolith has been touched.', unlockPlanetIndex: 1, goalOpenSeconds: 7.5 },
  { baseId: 'shepherd-crown', id: 'shepherd-shrine', name: 'Shepherd Shrine', summary: 'The shrine world opens the final crown, but only for a short ancient window.', unlockPlanetIndex: 1, goalOpenSeconds: 7.5 },
  { baseId: 'final-moon-circuit', id: 'unlock-circuit', name: 'Unlock Circuit', summary: 'The last circuit of the campaign first asks for a monolith landing, then a clean relay escape.', unlockPlanetIndex: 2, goalOpenSeconds: 7 },
];

const SPLIT_WORLD_SPECS = [
  { baseId: 'inner-step', id: 'split-step', name: 'Split Step', summary: 'The launch world is split, but the route still starts with a clean handoff to the outer relay.', splitPlanets: { 0: { landableAngleDeg: -170 } } },
  { baseId: 'forked-harbor', id: 'split-harbor', name: 'Split Harbor', summary: 'Both harbor routes are readable because every split world shows exactly which side can catch you.', splitPlanets: { 0: { landableAngleDeg: 143 }, 1: { landableAngleDeg: 300 }, 2: { landableAngleDeg: 15 } } },
  { baseId: 'counterspin-gate', id: 'split-counterspin', name: 'Split Counterspin', summary: 'The split launch face throws you off-angle, so stabilize on a relay before the outward burn.', splitPlanets: { 0: { landableAngleDeg: 128 } } },
  { baseId: 'false-periapsis', id: 'split-periapsis', name: 'Split Periapsis', summary: 'The tempting close pass still starts the route, but a split relay face punishes sloppy contact.', splitPlanets: { 0: { landableAngleDeg: -144 }, 1: { landableAngleDeg: 225 } } },
  { baseId: 'long-transfer', id: 'split-transfer', name: 'Split Transfer', summary: 'A long transfer is safer when you read the relay face before committing to the burn.', splitPlanets: { 0: { landableAngleDeg: 120 }, 2: { landableAngleDeg: 150 } } },
  { baseId: 'tidal-gate', id: 'split-tide', name: 'Split Tide', summary: 'The rotating safe hemisphere turns the setup touch into a timing problem.', splitPlanets: { 0: { landableAngleDeg: 12 }, 1: { landableAngleDeg: 170 } } },
  { baseId: 'moon-switch', id: 'split-switch', name: 'Split Switch', summary: 'The moon lane stays useful, but the split switch world decides whether the next touch is safe.', splitPlanets: { 0: { landableAngleDeg: -123 }, 2: { landableAngleDeg: 145 } } },
  { baseId: 'moon-catch', id: 'split-moon', name: 'Split Moon', summary: 'Catch the moving moon, then leave through a split relay face instead of clipping the red side.', splitPlanets: { 0: { landableAngleDeg: 127 }, 2: { landableAngleDeg: 215 } } },
  { baseId: 'halo-run', id: 'split-halo', name: 'Split Halo', summary: 'The halo lane wraps around split bodies whose teal sides are the only solid ground.', splitPlanets: { 0: { landableAngleDeg: -131 }, 3: { landableAngleDeg: 250 }, 4: { landableAngleDeg: 190 } } },
  { baseId: 'final-circuit', id: 'split-circuit', name: 'Split Circuit', summary: 'The final split circuit asks for clean relay handoffs without clipping the red halves.', splitPlanets: { 0: { landableAngleDeg: -130 }, 1: { landableAngleDeg: 335 }, 2: { landableAngleDeg: 160 } } },
];

const EXPANSION_LEVEL_DEFINITIONS = [
  ...ICY_WORLD_SPECS.map((spec) => makeIcyVariant(spec)),
  ...PORTAL_WORLD_SPECS.map((spec) => makePortalVariant(spec)),
  ...BINARY_WORLD_SPECS.map((spec) => makeBinaryVariant(spec)),
  ...ANCIENT_WORLD_SPECS.map((spec) => makeAncientVariant(spec)),
  ...SPLIT_WORLD_SPECS.map((spec) => makeSplitVariant(spec)),
];

const LEVEL_DEFINITIONS = [...CORE_LEVEL_DEFINITIONS, ...EXPANSION_LEVEL_DEFINITIONS];

const CAMPAIGN_LEVEL_ORDER = [
  'open-lane',
  'first-arc',
  'fast-window',
  'late-sweep',
  'eclipse-bend',
  'first-relay',
  'tidal-gate',
  'wide-lock',
  'forked-harbor',
  'inner-step',
  'moon-switch',
  'long-transfer',
  'halo-run',
  'split-sentinel',
  'mirror-sweep',
  'moon-catch',
  'false-periapsis',
  'crown-window',
  'final-circuit',
  'outer-echo',
  'periapsis-moon',
  'outer-crown',
  'hot-giant',
  'shielded-arc',
  'sunlocked-relay',
  'mirror-harbor',
  'rim-switch',
  'counterspin-gate',
  'guarded-relay',
  'double-slalom',
  'twin-shepherds',
  'periapsis-brood',
  'far-side-switch',
  'halo-shepherds',
  'long-brood',
  'guarded-brood',
  'countermoon-gate',
  'crown-lattice',
  'shepherd-crown',
  'final-moon-circuit',
  'polar-relay',
  'frost-gate',
  'whiteout-lock',
  'aurora-harbor',
  'drift-step',
  'ice-switch',
  'glacier-transfer',
  'frost-halo',
  'rime-sentinel',
  'moon-glide',
  'aperture-switch',
  'gate-transfer',
  'halo-gates',
  'split-port',
  'echo-port',
  'moon-gate',
  'aperture-bend',
  'crown-gate',
  'portal-circuit',
  'echo-aperture',
  'binary-moon',
  'double-crown',
  'binary-giant',
  'dual-arc',
  'binary-sunlock',
  'twin-harbor',
  'cross-suns',
  'counterdouble',
  'binary-guard',
  'binary-slalom',
  'monolith-wardens',
  'altar-brood',
  'far-altar-switch',
  'halo-monolith',
  'vault-monolith',
  'guarded-monolith',
  'moon-obelisk',
  'sealed-lattice',
  'shepherd-shrine',
  'unlock-circuit',
  'split-step',
  'split-harbor',
  'split-counterspin',
  'split-periapsis',
  'split-transfer',
  'split-tide',
  'split-switch',
  'split-moon',
  'split-halo',
  'split-circuit',
];

const campaignOrderIndex = new Map(
  CAMPAIGN_LEVEL_ORDER.map((levelId, index) => [levelId, index]),
);

export const LEVELS = [...LEVEL_DEFINITIONS].sort((left, right) => (
  (campaignOrderIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER)
  - (campaignOrderIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER)
));

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

export function directionFromAngleDeg(angleDeg) {
  const angleRad = angleDeg * Math.PI / 180;
  return vec(Math.cos(angleRad), Math.sin(angleRad));
}

export function getPlanetSplitAxis(planet, time = 0) {
  const baseAngle = (planet?.splitSurface?.landableAngleDeg ?? 0) * Math.PI / 180;
  return directionFromAngleDeg((baseAngle + (planet?.spinSpeed ?? 0) * time) * 180 / Math.PI);
}

export function isPlanetLandingSide(planet, landingDirection, time = 0) {
  if (!planet?.splitSurface) {
    return Boolean(planet?.landable);
  }

  const axis = getPlanetSplitAxis(planet, time);
  const normal = normalize(landingDirection ?? vec(1, 0));
  return axis.x * normal.x + axis.y * normal.y >= (planet.splitSurface.threshold ?? 0);
}

function scalePointFromSun(point, sun, scale = SYSTEM_LAYOUT_SCALE) {
  return vec(
    sun.x + (point.x - sun.x) * scale,
    sun.y + (point.y - sun.y) * scale,
  );
}

function pointFromPolar(position) {
  const direction = directionFromAngleDeg(position.angleDeg ?? 0);
  return vec(direction.x * position.radius, direction.y * position.radius);
}

function polarFromPoint(point) {
  return {
    radius: length(point),
    angleDeg: Math.atan2(point.y, point.x) * 180 / Math.PI,
  };
}

function angleDegBetween(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
}

function wrapAngleRad(angle) {
  const turn = Math.PI * 2;
  return ((angle % turn) + turn) % turn;
}

function rotateVector(vector, angle) {
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  return vec(
    vector.x * cosAngle - vector.y * sinAngle,
    vector.x * sinAngle + vector.y * cosAngle,
  );
}

function solveKeplerEquation(meanAnomaly, eccentricity) {
  if (eccentricity < 0.000001) {
    return meanAnomaly;
  }

  let eccentricAnomaly = meanAnomaly;
  for (let iteration = 0; iteration < 8; iteration += 1) {
    const delta =
      (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly)
      / Math.max(0.000001, 1 - eccentricity * Math.cos(eccentricAnomaly));
    eccentricAnomaly -= delta;
    if (Math.abs(delta) < 0.000001) {
      break;
    }
  }

  return eccentricAnomaly;
}

function validateLevelDefinition(level) {
  if (!Array.isArray(level.launchPresets) || level.launchPresets.length === 0) {
    throw new Error(`Level "${level.id}" must define at least one launch preset.`);
  }

  if ('start' in level || 'goal' in level) {
    throw new Error(`Level "${level.id}" uses legacy start/goal fields.`);
  }

  if (
    !level.startAnchor
    || !Number.isFinite(level.startAnchor.radius)
    || !Number.isFinite(level.startAnchor.angleDeg)
  ) {
    throw new Error(`Level "${level.id}" must define a polar startAnchor.`);
  }

  if (
    !level.goalCenter
    || !Number.isFinite(level.goalCenter.radius)
    || !Number.isFinite(level.goalCenter.angleDeg)
  ) {
    throw new Error(`Level "${level.id}" must define a polar goalCenter.`);
  }

  if (level.adminSolutions !== undefined) {
    if (!Array.isArray(level.adminSolutions)) {
      throw new Error(`Level "${level.id}" adminSolutions must be an array.`);
    }

    level.adminSolutions.forEach((solution, solutionIndex) => {
      if (!Array.isArray(solution.shots) || solution.shots.length === 0) {
        throw new Error(`Level "${level.id}" admin solution ${solutionIndex + 1} must define shots.`);
      }

      solution.shots.forEach((shot, shotIndex) => {
        if (
          !Number.isFinite(shot.waitSeconds)
          || !Number.isFinite(shot.angleDeg)
          || !Number.isFinite(shot.power)
        ) {
          throw new Error(`Level "${level.id}" admin solution ${solutionIndex + 1} shot ${shotIndex + 1} is invalid.`);
        }
      });
    });
  }

  let previousRadius = Number.NEGATIVE_INFINITY;
  level.planets.forEach((planet, index) => {
    if (
      !planet.position
      || !Number.isFinite(planet.position.radius)
      || !Number.isFinite(planet.position.angleDeg)
    ) {
      throw new Error(`Level "${level.id}" planet "${planet.name}" must use polar position data.`);
    }

    if (planet.position.radius < previousRadius - 0.000001) {
      throw new Error(`Level "${level.id}" planets must be ordered by distance from the sun.`);
    }
    previousRadius = planet.position.radius;

    if ('orbitSpeed' in planet || 'spinSpeed' in planet) {
      throw new Error(`Level "${level.id}" planet "${planet.name}" uses a legacy speed field.`);
    }

    if (
      planet.orbitAnchor !== undefined
      && !['system-center', 'primary-sun', 'secondary-sun'].includes(planet.orbitAnchor)
    ) {
      throw new Error(`Level "${level.id}" planet "${planet.name}" uses an invalid orbitAnchor.`);
    }

    if (
      planet.orbitAround !== undefined
      && (
        !Number.isInteger(planet.orbitAround)
        || planet.orbitAround < 0
        || planet.orbitAround >= index
      )
    ) {
      throw new Error(`Level "${level.id}" planet "${planet.name}" must orbit an earlier planet index.`);
    }
  });
}

function createOrbitDefaults(source, basePosition, orbitCenterPosition, index) {
  const radialVector = vec(
    basePosition.x - orbitCenterPosition.x,
    basePosition.y - orbitCenterPosition.y,
  );
  const radialDistance = Math.max(0.001, length(radialVector));
  const orbitEccentricity = clamp(source.orbitEccentricity ?? 0, 0, 0.72);
  const orbitRotation = source.orbitRotationDeg !== undefined
    ? source.orbitRotationDeg * Math.PI / 180
    : (
      source.orbitMeanAnomaly !== undefined
        ? Math.atan2(radialVector.y, radialVector.x) - source.orbitMeanAnomaly
        : Math.atan2(radialVector.y, radialVector.x) - (orbitEccentricity > 0 ? Math.PI : 0)
    );
  const orbitSemiMajor = source.orbitSemiMajor
    ?? (orbitEccentricity > 0 ? radialDistance / (1 + orbitEccentricity) : radialDistance);
  const orbitSemiMinor = orbitSemiMajor * Math.sqrt(Math.max(0.000001, 1 - orbitEccentricity ** 2));
  const orbitDirection = source.orbitDirection
    ?? (source.orbitAngularSpeed !== undefined && source.orbitAngularSpeed < 0 ? -1 : 1);
  const authoredOrbitRate = source.orbitRate
    ?? (source.orbitAngularSpeed !== undefined
      ? (
        source.orbitAround !== undefined
          ? 0.5 + Math.abs(source.orbitAngularSpeed) * 0.25
          : 0.55 + Math.abs(source.orbitAngularSpeed) * 0.55
      )
      : 1);
  const orbitalParameter = source.orbitMu
    ?? (source.orbitAround !== undefined ? MOON_ORBITAL_GRAVITY_PARAMETER : ORBITAL_GRAVITY_PARAMETER);
  const baseOrbitSpeed = source.orbitAngularSpeed
    ?? (Math.sqrt(orbitalParameter / Math.max(orbitSemiMajor ** 3, 0.001)) * authoredOrbitRate * orbitDirection);
  const orbitMeanAnomaly = source.orbitMeanAnomaly
    ?? (orbitEccentricity > 0 ? Math.PI : 0);
  return {
    orbitRadius: orbitSemiMajor,
    orbitSemiMajor,
    orbitSemiMinor,
    orbitEccentricity,
    orbitRotation,
    orbitSpeed: baseOrbitSpeed,
    orbitPhase: orbitMeanAnomaly,
  };
}

function createSpinDefaults(source, scaledRadius, index) {
  const spinDirection = source.spinDirection
    ?? (source.spinAngularSpeed !== undefined
      ? Math.sign(source.spinAngularSpeed) || 1
      : (index % 2 === 0 ? 1 : -1));
  const authoredSpinRate = source.spinRate
    ?? (source.spinAngularSpeed !== undefined ? 0.45 + Math.abs(source.spinAngularSpeed) * 0.7 : 1);
  const baseSpinSpeed = source.spinAngularSpeed
    ?? ((0.02 + 0.12 / Math.max(scaledRadius, 0.22)) * authoredSpinRate * spinDirection);
  return {
    spinSpeed: baseSpinSpeed,
  };
}

function resolveOrbitCenterIndex(source, planetsLength, planetIndex) {
  if (
    !Number.isInteger(source.orbitAround) ||
    source.orbitAround < 0 ||
    source.orbitAround >= planetsLength ||
    source.orbitAround === planetIndex
  ) {
    return null;
  }

  return source.orbitAround;
}

function createOrbitalBodyRuntime(source, sun, index, radiusScale = 1) {
  const basePosition = scalePointFromSun(pointFromPolar(source.position), sun);
  const scaledRadius = (source.radius ?? 0.5) * radiusScale;
  return {
    ...source,
    index,
    radius: scaledRadius,
    basePosition,
    position: cloneVec(basePosition),
    orbitCenter: cloneVec(sun),
    ...createOrbitDefaults(source, basePosition, sun, index),
  };
}

function getOrbitalBodyState(body, time, orbitCenter) {
  if (!body) {
    return {
      position: cloneVec(orbitCenter),
      velocity: vec(0, 0),
      orbitCenter: cloneVec(orbitCenter),
    };
  }

  if (!body.orbitRadius || !body.orbitSpeed) {
    return {
      position: cloneVec(body.basePosition),
      velocity: vec(0, 0),
      orbitCenter: cloneVec(orbitCenter),
    };
  }

  const anomaly = wrapAngleRad(body.orbitPhase + time * body.orbitSpeed);
  const offset = getOrbitOffset(body, anomaly);
  const nextOffset = getOrbitOffset(body, anomaly + 0.0005);
  const velocityOffset = vec(
    (nextOffset.x - offset.x) / 0.0005,
    (nextOffset.y - offset.y) / 0.0005,
  );
  return {
    position: vec(
      orbitCenter.x + offset.x,
      orbitCenter.y + offset.y,
    ),
    velocity: vec(
      velocityOffset.x * body.orbitSpeed,
      velocityOffset.y * body.orbitSpeed,
    ),
    orbitCenter: cloneVec(orbitCenter),
  };
}

function setOrbitalBodyTime(body, time, orbitCenter) {
  if (!body) {
    return;
  }

  const state = getOrbitalBodyState(body, time, orbitCenter);
  body.orbitCenter.x = state.orbitCenter.x;
  body.orbitCenter.y = state.orbitCenter.y;
  body.position.x = state.position.x;
  body.position.y = state.position.y;
  body.velocity = state.velocity;
}

function getSystemCenter(level) {
  return level.systemCenter ?? level.sun;
}

function getSecondarySunBody(level) {
  return level.secondarySunBody
    ?? (level.extraSuns ?? []).find((solarBody) => solarBody.binaryRole === 'secondary-sun')
    ?? null;
}

function getDynamicOrbitAnchorState(level, planet, time) {
  const systemCenter = getSystemCenter(level);
  if (planet.orbitAnchor === 'primary-sun' && level.primarySunBody) {
    return {
      position: cloneVec(level.primarySunBody.position),
      velocity: cloneVec(level.primarySunBody.velocity ?? vec(0, 0)),
    };
  }
  if (planet.orbitAnchor === 'secondary-sun') {
    const secondarySun = getSecondarySunBody(level);
    if (secondarySun) {
      return {
        position: cloneVec(secondarySun.position),
        velocity: cloneVec(secondarySun.velocity ?? vec(0, 0)),
      };
    }
  }
  return {
    position: cloneVec(systemCenter),
    velocity: vec(0, 0),
  };
}

function getOrbitOffset(planet, anomaly) {
  if (!planet.orbitSemiMajor || !planet.orbitSpeed) {
    return vec(0, 0);
  }

  if (planet.orbitEccentricity < 0.000001) {
    return rotateVector(
      vec(
        Math.cos(anomaly) * planet.orbitSemiMajor,
        Math.sin(anomaly) * planet.orbitSemiMajor,
      ),
      planet.orbitRotation ?? 0,
    );
  }

  const eccentricAnomaly = solveKeplerEquation(anomaly, planet.orbitEccentricity);
  return rotateVector(
    vec(
      planet.orbitSemiMajor * (Math.cos(eccentricAnomaly) - planet.orbitEccentricity),
      planet.orbitSemiMinor * Math.sin(eccentricAnomaly),
    ),
    planet.orbitRotation ?? 0,
  );
}

// Moons inherit their parent's motion and add a local orbit on top.
function getOrbitState(level, planetIndex, time, cache = new Map()) {
  if (cache.has(planetIndex)) {
    return cache.get(planetIndex);
  }

  const planet = level.planets[planetIndex];
  let orbitCenter = cloneVec(getSystemCenter(level));
  let centerVelocity = vec(0, 0);

  if (planet.orbitCenterIndex !== null && planet.orbitCenterIndex !== undefined) {
    const parentState = getOrbitState(level, planet.orbitCenterIndex, time, cache);
    orbitCenter = cloneVec(parentState.position);
    centerVelocity = cloneVec(parentState.velocity);
  } else {
    const dynamicAnchorState = getDynamicOrbitAnchorState(level, planet, time);
    orbitCenter = dynamicAnchorState.position;
    centerVelocity = dynamicAnchorState.velocity;
  }

  if (!planet.orbitRadius || !planet.orbitSpeed) {
    const state = {
      position: planet.orbitCenterIndex !== null && planet.orbitCenterIndex !== undefined
        ? cloneVec(orbitCenter)
        : cloneVec(planet.basePosition),
      velocity: centerVelocity,
      orbitCenter,
    };
    cache.set(planetIndex, state);
    return state;
  }

  const meanAnomaly = wrapAngleRad(planet.orbitPhase + time * planet.orbitSpeed);
  const offset = getOrbitOffset(planet, meanAnomaly);
  const nextOffset = getOrbitOffset(planet, meanAnomaly + 0.0005);
  const velocityOffset = vec(
    (nextOffset.x - offset.x) / 0.0005,
    (nextOffset.y - offset.y) / 0.0005,
  );
  const state = {
    position: vec(
      orbitCenter.x + offset.x,
      orbitCenter.y + offset.y,
    ),
    velocity: vec(
      centerVelocity.x + velocityOffset.x * planet.orbitSpeed,
      centerVelocity.y + velocityOffset.y * planet.orbitSpeed,
    ),
    orbitCenter,
  };
  cache.set(planetIndex, state);
  return state;
}

export function setLevelTime(level, time) {
  level.time = time;
  const systemCenter = getSystemCenter(level);
  if (level.primarySunBody) {
    setOrbitalBodyTime(level.primarySunBody, time, systemCenter);
    level.sun.x = level.primarySunBody.position.x;
    level.sun.y = level.primarySunBody.position.y;
  }
  level.extraSuns?.forEach((solarBody) => {
    setOrbitalBodyTime(solarBody, time, systemCenter);
  });
  const orbitStateCache = new Map();
  level.planets.forEach((planet) => {
    const orbitState = getOrbitState(level, planet.index, time, orbitStateCache);
    planet.position.x = orbitState.position.x;
    planet.position.y = orbitState.position.y;
    planet.orbitCenter.x = orbitState.orbitCenter.x;
    planet.orbitCenter.y = orbitState.orbitCenter.y;
  });
  level.portals?.forEach((portal) => {
    setOrbitalBodyTime(portal, time, systemCenter);
  });
  return level;
}

export function getGoalCloseTime(level) {
  if (level.goalUnlockRequired) {
    if (!level.goalUnlocked || !Number.isFinite(level.goalUnlockTime)) {
      return Number.POSITIVE_INFINITY;
    }
    if (GOAL_ALWAYS_OPEN) {
      return Number.POSITIVE_INFINITY;
    }
    return level.goalUnlockTime + (level.goalOpenSeconds ?? DEFAULT_GOAL_OPEN_SECONDS);
  }
  if (GOAL_ALWAYS_OPEN) {
    return Number.POSITIVE_INFINITY;
  }
  return (level.startTimeSeconds ?? 0) + (level.goalOpenSeconds ?? DEFAULT_GOAL_OPEN_SECONDS);
}

export function getGoalRemainingTime(level, time = level.time ?? 0) {
  if (level.goalUnlockRequired && !level.goalUnlocked) {
    return level.goalOpenSeconds ?? DEFAULT_GOAL_OPEN_SECONDS;
  }
  if (GOAL_ALWAYS_OPEN) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, getGoalCloseTime(level) - time);
}

export function getGoalRemainingFraction(level, time = level.time ?? 0) {
  if (level.goalUnlockRequired && !level.goalUnlocked) {
    return 0;
  }
  if (GOAL_ALWAYS_OPEN) {
    return Number.POSITIVE_INFINITY;
  }
  const duration = Math.max(0.001, level.goalOpenSeconds ?? DEFAULT_GOAL_OPEN_SECONDS);
  return clamp(getGoalRemainingTime(level, time) / duration, 0, 1);
}

export function isGoalOpen(level, time = level.time ?? 0) {
  if (level.goalUnlockRequired && !level.goalUnlocked) {
    return false;
  }
  if (GOAL_ALWAYS_OPEN) {
    return true;
  }
  return getGoalRemainingTime(level, time) > 0.000001;
}

export function isGoalLocked(level) {
  return Boolean(level.goalUnlockRequired && !level.goalUnlocked);
}

export function getBallSurfaceRadius(planet) {
  return planet.radius + COURSE.ballRadius + PLANET_LANDING_PADDING
    + (planet?.surfaceType === 'ice' ? ICE_PLANET_LANDING_PADDING : 0);
}

export function getPlanetVelocity(level, planetIndex, time = level.time ?? 0) {
  const planet = level.planets[planetIndex];
  if (!planet) {
    return vec(0, 0);
  }

  return cloneVec(getOrbitState(level, planetIndex, time).velocity);
}

export function advanceBallAnchor(level, ball, delta) {
  if (ball.anchorPlanetIndex === null || ball.anchorPlanetIndex === undefined) {
    return;
  }

  const planet = level.planets[ball.anchorPlanetIndex];
  if (!planet) {
    ball.anchorPlanetIndex = null;
    return;
  }

  if (planet.spinSpeed) {
    ball.anchorNormal = normalize(rotateVector(ball.anchorNormal ?? vec(1, 0), planet.spinSpeed * delta));
  }
  const slideAngularSpeed = getPlanetSlideAngularSpeed(planet, ball);
  if (slideAngularSpeed) {
    ball.anchorNormal = normalize(rotateVector(ball.anchorNormal ?? vec(1, 0), slideAngularSpeed * delta));
  }

  syncBallToAnchor(level, ball);
}

export function getPlanetSlideAngularSpeed(planet, ball) {
  if (!planet || !planet.slideAngularSpeed || planet.surfaceType !== 'ice') {
    return 0;
  }

  if ((ball?.landingCount ?? 0) <= 0 && !planet.slideFromStart) {
    return 0;
  }

  const settleSeconds = Math.max(0.25, planet.slideSettleSeconds ?? 4);
  const anchorSinceTime = ball?.anchorSinceTime ?? ball?.time ?? 0;
  const currentTime = ball?.time ?? anchorSinceTime;
  const elapsed = Math.max(0, currentTime - anchorSinceTime);
  const t = Math.min(1, elapsed / settleSeconds);
  const baseSpeed = planet.slideAngularSpeed * Math.pow(1 - t, 1.35);
  const skidSeconds = Math.min(settleSeconds * 0.34, planet.slideSkidSeconds ?? 0.9);
  if (elapsed >= skidSeconds) {
    return baseSpeed;
  }
  const skidT = Math.min(1, elapsed / skidSeconds);
  const skidBoost = planet.slideAngularSpeed * (planet.slideSkidBoost ?? 0.95) * (1 - skidT);
  return baseSpeed + skidBoost;
}

export function getPlanetSurfaceVelocity(level, planetIndex, anchorNormal, ball = null) {
  const planet = level.planets[planetIndex];
  if (!planet || (!planet.spinSpeed && !planet.slideAngularSpeed)) {
    return vec(0, 0);
  }

  const normal = normalize(anchorNormal ?? vec(1, 0));
  const tangent = vec(-normal.y, normal.x);
  const speed = getBallSurfaceRadius(planet) * ((planet.spinSpeed ?? 0) + getPlanetSlideAngularSpeed(planet, ball));
  return vec(tangent.x * speed, tangent.y * speed);
}

function cloneBallRuntimeState(ball) {
  return {
    position: cloneVec(ball.position),
    velocity: cloneVec(ball.velocity),
    time: ball.time ?? 0,
    landingCount: ball.landingCount ?? 0,
    launchGracePlanetIndex: ball.launchGracePlanetIndex ?? null,
    anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
    anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
    anchorSinceTime: ball.anchorSinceTime ?? 0,
    portalCooldown: ball.portalCooldown ?? 0,
  };
}

function inferStartPlanetIndex(source, planets) {
  if (Number.isInteger(source.startPlanetIndex) && source.startPlanetIndex >= 0 && source.startPlanetIndex < planets.length) {
    return source.startPlanetIndex;
  }

  if (!source.startAnchor || planets.length === 0) {
    return 0;
  }

  const startPoint = pointFromPolar(source.startAnchor);
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  planets.forEach((planet, index) => {
    const distance = distanceBetween(startPoint, planet.basePosition);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function createLevelRuntime(index) {
  const source = LEVELS[index];
  validateLevelDefinition(source);
  const worldIndex = Math.floor(index / WORLD_SIZE);
  const worldDefinition = WORLD_DEFINITIONS[worldIndex]
    ?? { id: `world-${worldIndex + 1}`, name: `World ${worldIndex + 1}` };
  const launchPresets = source.launchPresets.map((preset) => ({
    angleDeg: preset.angleDeg,
    power: preset.power,
  }));
  const systemCenter = vec(source.sun?.[0] ?? 0, source.sun?.[1] ?? 0);
  const scaledStartAnchor = scalePointFromSun(pointFromPolar(source.startAnchor), systemCenter);
  const scaledGoalCenter = scalePointFromSun(pointFromPolar(source.goalCenter), systemCenter);
  const basePositions = source.planets.map((planet) => (
    scalePointFromSun(pointFromPolar(planet.position), systemCenter)
  ));
  const primarySunBody = source.binarySystem?.primarySun
    ? {
      ...createOrbitalBodyRuntime(source.binarySystem.primarySun, systemCenter, 0, 1),
      gravityStrength: source.binarySystem.primarySun.gravityStrength ?? BINARY_PRIMARY_GRAVITY_STRENGTH,
      collisionRadius: source.binarySystem.primarySun.collisionRadius ?? BINARY_PRIMARY_RADIUS,
    }
    : null;
  const secondarySunBody = source.binarySystem?.secondarySun
    ? {
      ...createOrbitalBodyRuntime(source.binarySystem.secondarySun, systemCenter, 0, 1),
      binaryRole: 'secondary-sun',
      gravityStrength: source.binarySystem.secondarySun.gravityStrength ?? DEFAULT_EXTRA_SUN_GRAVITY_STRENGTH,
      collisionRadius: source.binarySystem.secondarySun.collisionRadius ?? DEFAULT_EXTRA_SUN_COLLISION_RADIUS,
    }
    : null;
  const planets = source.planets.map((planet, planetIndex) => {
    const orbitCenterIndex = resolveOrbitCenterIndex(planet, source.planets.length, planetIndex);
    const basePosition = basePositions[planetIndex];
    let orbitCenterPosition = orbitCenterIndex !== null ? basePositions[orbitCenterIndex] : systemCenter;
    if (orbitCenterIndex === null && planet.orbitAnchor === 'primary-sun' && primarySunBody) {
      orbitCenterPosition = primarySunBody.basePosition;
    } else if (orbitCenterIndex === null && planet.orbitAnchor === 'secondary-sun' && secondarySunBody) {
      orbitCenterPosition = secondarySunBody.basePosition;
    }
    const scaledRadius = planet.radius * PLANET_RADIUS_SCALE;
    return {
      ...planet,
      index: planetIndex,
      radius: scaledRadius,
      landingRadius: planet.landingRadius ? planet.landingRadius * PLANET_RADIUS_SCALE : planet.landingRadius,
      ...createOrbitDefaults(planet, basePosition, orbitCenterPosition, planetIndex),
      ...createSpinDefaults(planet, scaledRadius, planetIndex),
      orbitCenterIndex,
      basePosition,
      orbitCenter: cloneVec(orbitCenterPosition),
      position: cloneVec(basePosition),
    };
  });
  const authoredExtraSuns = Array.isArray(source.extraSuns)
    ? source.extraSuns.map((solarBody, solarIndex) => ({
      ...createOrbitalBodyRuntime(solarBody, systemCenter, solarIndex),
      gravityStrength: solarBody.gravityStrength ?? DEFAULT_EXTRA_SUN_GRAVITY_STRENGTH,
      collisionRadius: solarBody.collisionRadius ?? DEFAULT_EXTRA_SUN_COLLISION_RADIUS,
    }))
    : [];
  const extraSuns = secondarySunBody ? [secondarySunBody, ...authoredExtraSuns] : authoredExtraSuns;
  const portals = Array.isArray(source.portals)
    ? source.portals.map((portal, portalIndex) => ({
      ...createOrbitalBodyRuntime(portal, systemCenter, portalIndex),
      pairId: portal.pairId ?? null,
      variant: portal.variant ?? 'white',
      cooldownSeconds: portal.cooldownSeconds ?? PORTAL_COOLDOWN_SECONDS,
    }))
    : [];
  const startPlanetIndex = inferStartPlanetIndex(source, planets);
  const startPlanet = planets[startPlanetIndex];
  const startAngleDeg = source.startAngleDeg
    ?? (source.startAnchor
      ? angleDegBetween(startPlanet.basePosition, pointFromPolar(source.startAnchor))
      : DEFAULT_START_ANGLE_DEG);

  const level = {
    ...source,
    worldIndex,
    worldNumber: worldIndex + 1,
    worldId: source.worldId ?? worldDefinition.id,
    worldName: source.worldName ?? worldDefinition.name,
    worldLevelNumber: (index % WORLD_SIZE) + 1,
    worldSize: WORLD_SIZE,
    worldCount: WORLD_DEFINITIONS.length,
    startAnchor: scaledStartAnchor,
    goalCenter: scaledGoalCenter,
    launchPreset: { ...launchPresets[0] },
    launchPresets,
    sun: cloneVec(primarySunBody?.basePosition ?? systemCenter),
    systemCenter,
    primarySunBody,
    secondarySunBody,
    startPlanetIndex,
    startAngleDeg,
    startTimeSeconds: source.startTimeSeconds ?? 0,
    time: source.startTimeSeconds ?? 0,
    goalOpenSeconds: source.goalOpenSeconds ?? DEFAULT_GOAL_OPEN_SECONDS,
    goalRadius: source.goalRadius ?? COURSE.goalRadius,
    goalPullRadius: source.goalPullRadius ?? COURSE.goalPullRadius,
    goalPullStrength: source.goalPullStrength ?? COURSE.goalPullStrength,
    goalUnlockRequired: Boolean(source.goalUnlockRequired),
    goalUnlocked: !source.goalUnlockRequired,
    goalUnlockTime: source.goalUnlockRequired ? null : (source.startTimeSeconds ?? 0),
    planets,
    extraSuns,
    portals,
  };

  if (!level.planets[level.startPlanetIndex].landable) {
    level.planets[level.startPlanetIndex].landable = true;
  }

  setLevelTime(level, level.time);
  return level;
}

export function createBallState(level) {
  const startPlanet = level.planets[level.startPlanetIndex];
  const anchorNormal = directionFromAngleDeg(level.startAngleDeg ?? DEFAULT_START_ANGLE_DEG);
  const surfaceRadius = getBallSurfaceRadius(startPlanet);
  return {
    position: vec(
      startPlanet.position.x + anchorNormal.x * surfaceRadius,
      startPlanet.position.y + anchorNormal.y * surfaceRadius,
    ),
    velocity: vec(0, 0),
    time: level.time ?? 0,
    landingCount: 0,
    launchGracePlanetIndex: level.startPlanetIndex,
    anchorPlanetIndex: level.startPlanetIndex,
    anchorNormal,
    anchorSinceTime: level.time ?? 0,
    portalCooldown: 0,
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

export function syncBallToAnchor(level, ball) {
  if (ball.anchorPlanetIndex === null || ball.anchorPlanetIndex === undefined) {
    return;
  }

  const planet = level.planets[ball.anchorPlanetIndex];
  if (!planet) {
    ball.anchorPlanetIndex = null;
    return;
  }

  const anchorNormal = normalize(ball.anchorNormal ?? vec(1, 0));
  const surfaceRadius = getBallSurfaceRadius(planet);
  ball.position.x = planet.position.x + anchorNormal.x * surfaceRadius;
  ball.position.y = planet.position.y + anchorNormal.y * surfaceRadius;
}

function landBallOnPlanet(ball, planet, planetIndex) {
  const landingDirection = getLandingDirection(ball, planet);
  const surfaceRadius = getBallSurfaceRadius(planet);
  ball.position.x = planet.position.x + landingDirection.x * surfaceRadius;
  ball.position.y = planet.position.y + landingDirection.y * surfaceRadius;
  ball.velocity.x = 0;
  ball.velocity.y = 0;
  ball.landingCount = (ball.landingCount ?? 0) + 1;
  ball.launchGracePlanetIndex = null;
  ball.anchorPlanetIndex = planetIndex;
  ball.anchorNormal = landingDirection;
  ball.anchorSinceTime = ball.time ?? 0;
  ball.portalCooldown = 0;
}

function findContainingLandingPlanetIndex(level, position) {
  for (let index = 0; index < level.planets.length; index += 1) {
    const planet = level.planets[index];
    if (!planet.landable) {
      continue;
    }

    const landingRadius = planet.landingRadius ?? getBallSurfaceRadius(planet);
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
    const landingRadius = planet.landingRadius ?? getBallSurfaceRadius(planet);

    if (
      ball.launchGracePlanetIndex === index &&
      distance > landingRadius + PLANET_LANDING_PADDING
    ) {
      ball.launchGracePlanetIndex = null;
    }

    if (planet.landable && distance <= touchRadius) {
      const landingDirection = getLandingDirection(ball, planet);
      const landsOnSafeSide = isPlanetLandingSide(planet, landingDirection, ball.time ?? level.time ?? 0);
      if (!landsOnSafeSide) {
        const eventState = cloneBallRuntimeState(ball);
        ball.velocity.x = 0;
        ball.velocity.y = 0;
        return {
          type: 'crash',
          reason: 'split-side',
          planetIndex: index,
          planetName: planet.name ?? 'split planet',
          eventState,
          displayEventState: cloneBallRuntimeState(eventState),
        };
      }
      const surfaceRadius = getBallSurfaceRadius(planet);
      const eventState = cloneBallRuntimeState(ball);
      const displayEventState = cloneBallRuntimeState({
        ...ball,
        position: vec(
          planet.position.x + landingDirection.x * surfaceRadius,
          planet.position.y + landingDirection.y * surfaceRadius,
        ),
      });
      landBallOnPlanet(ball, planet, index);
      const goalUnlocked = Boolean(planet.goalUnlock && level.goalUnlockRequired && !level.goalUnlocked);
      if (goalUnlocked) {
        level.goalUnlocked = true;
        level.goalUnlockTime = ball.time ?? level.time ?? 0;
      }
      return {
        type: 'landed',
        planetIndex: index,
        planetName: planet.name ?? 'relay world',
        goalUnlocked,
        eventState,
        displayEventState,
      };
    }

    if (distance <= touchRadius) {
      const eventState = cloneBallRuntimeState(ball);
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      return {
        type: 'crash',
        reason: 'planet',
        planetIndex: index,
        planetName: planet.name ?? 'gas giant',
        eventState,
        displayEventState: cloneBallRuntimeState(eventState),
      };
    }
  }

  return null;
}

function resolveSunContact(level, ball) {
  const touchRadius = (level.primarySunBody?.collisionRadius ?? SUN_COLLISION_RADIUS) + COURSE.ballRadius * PLANET_COLLISION_PADDING;
  if (distanceBetween(ball.position, level.sun) <= touchRadius) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return {
      type: 'crash',
      reason: 'sun',
      eventState,
      displayEventState: cloneBallRuntimeState(eventState),
      crashTargetPosition: cloneVec(level.sun),
    };
  }

  for (const solarBody of level.extraSuns ?? []) {
    const collisionRadius = (solarBody.collisionRadius ?? DEFAULT_EXTRA_SUN_COLLISION_RADIUS) + COURSE.ballRadius * PLANET_COLLISION_PADDING;
    if (distanceBetween(ball.position, solarBody.position) <= collisionRadius) {
      const eventState = cloneBallRuntimeState(ball);
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      return {
        type: 'crash',
        reason: 'sun',
        eventState,
        displayEventState: cloneBallRuntimeState(eventState),
        crashTargetPosition: cloneVec(solarBody.position),
      };
    }
  }

  return null;
}

function resolvePortalContact(level, ball) {
  if ((ball.portalCooldown ?? 0) > 0) {
    return null;
  }

  for (const portal of level.portals ?? []) {
    if (distanceBetween(ball.position, portal.position) > portal.radius + COURSE.ballRadius * 0.78) {
      continue;
    }

    const exitPortal = (level.portals ?? []).find((candidate) => candidate.id === portal.pairId);
    if (!exitPortal) {
      continue;
    }

    const eventState = cloneBallRuntimeState(ball);
    const offset = vec(
      ball.position.x - portal.position.x,
      ball.position.y - portal.position.y,
    );
    const exitOffset = lengthSq(offset) > 0.000001
      ? offset
      : (() => {
        const direction = lengthSq(ball.velocity) > 0.000001 ? normalize(ball.velocity) : vec(1, 0);
        return vec(direction.x * (exitPortal.radius + COURSE.ballRadius * 0.8), direction.y * (exitPortal.radius + COURSE.ballRadius * 0.8));
      })();
    ball.position.x = exitPortal.position.x + exitOffset.x;
    ball.position.y = exitPortal.position.y + exitOffset.y;
    ball.portalCooldown = Math.max(portal.cooldownSeconds ?? PORTAL_COOLDOWN_SECONDS, exitPortal.cooldownSeconds ?? PORTAL_COOLDOWN_SECONDS);
    return {
      time: ball.time ?? level.time ?? 0,
      fromPortalId: portal.id,
      toPortalId: exitPortal.id,
      preState: eventState,
      postState: cloneBallRuntimeState(ball),
    };
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

  const solarBodies = [
    { position: level.sun, gravityStrength: level.primarySunBody?.gravityStrength ?? FIXED_SOLAR_GRAVITY_STRENGTH },
    ...(level.extraSuns ?? []).map((solarBody) => ({
      position: solarBody.position,
      gravityStrength: solarBody.gravityStrength ?? DEFAULT_EXTRA_SUN_GRAVITY_STRENGTH,
    })),
  ];

  for (const solarBody of solarBodies) {
    if (!(solarBody.gravityStrength > 0)) {
      continue;
    }
    const toSun = vec(
      solarBody.position.x - point.x,
      solarBody.position.y - point.y,
    );
    const distance = Math.max(length(toSun), 0.001);
    const pull = solarBody.gravityStrength * SOLAR_GRAVITY_MULTIPLIER / (distance * distance + SOLAR_GRAVITY_SOFTENING);
    const direction = normalize(toSun);
    netGravity.x += direction.x * pull;
    netGravity.y += direction.y * pull;
  }

  return netGravity;
}

function sampleBallAcceleration(level, point) {
  const acceleration = samplePlanetGravity(level, point);
  const toGoal = vec(level.goalCenter.x - point.x, level.goalCenter.y - point.y);
  const goalDistance = Math.max(length(toGoal), 0.001);
  if (isGoalOpen(level, level.time ?? 0) && goalDistance < level.goalPullRadius) {
    const pull = level.goalPullStrength / (goalDistance * goalDistance + 0.38);
    const direction = normalize(toGoal);
    acceleration.x += direction.x * pull;
    acceleration.y += direction.y * pull;
  }
  return acceleration;
}

function getBallFriction(delta) {
  return Math.pow(BALL_FRICTION_BASE, delta * 60);
}

export function stepBall(level, ball, delta) {
  if (lengthSq(ball.velocity) < 0.000001) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'settled' };
  }

  const nextTime = (ball.time ?? level.time ?? 0) + delta;
  setLevelTime(level, nextTime);
  ball.time = nextTime;
  ball.portalCooldown = Math.max(0, (ball.portalCooldown ?? 0) - delta);

  if ((!level.goalUnlockRequired || level.goalUnlocked) && !isGoalOpen(level, ball.time)) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'crash', reason: 'goal-closed', eventState, displayEventState: cloneBallRuntimeState(eventState) };
  }

  const acceleration = sampleBallAcceleration(level, ball.position);
  ball.velocity.x += acceleration.x * delta;
  ball.velocity.y += acceleration.y * delta;

  const toGoal = vec(level.goalCenter.x - ball.position.x, level.goalCenter.y - ball.position.y);
  const goalDistance = Math.max(length(toGoal), 0.001);

  if (isGoalOpen(level, ball.time) && goalDistance < level.goalRadius * GOAL_CAPTURE_RATIO) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'goal', eventState, displayEventState: cloneBallRuntimeState(eventState) };
  }

  addScaledVec(ball.position, ball.velocity, delta);

  const portalEvent = resolvePortalContact(level, ball);

  const postPortalGoalDistance = Math.max(distanceBetween(ball.position, level.goalCenter), 0.001);
  if (isGoalOpen(level, ball.time) && postPortalGoalDistance < level.goalRadius * GOAL_CAPTURE_RATIO) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'goal', eventState, displayEventState: cloneBallRuntimeState(eventState), portalEvent };
  }

  const sunContactResult = resolveSunContact(level, ball);
  if (sunContactResult) {
    sunContactResult.portalEvent = portalEvent;
    return sunContactResult;
  }

  const contactResult = resolvePlanetContact(level, ball);
  if (contactResult) {
    contactResult.portalEvent = portalEvent;
    return contactResult;
  }

  const friction = getBallFriction(delta);
  ball.velocity.x *= friction;
  ball.velocity.y *= friction;

  if (
    Math.abs(ball.position.x) > COURSE.outBoundsX ||
    Math.abs(ball.position.y) > COURSE.outBoundsY
  ) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'crash', reason: 'bounds', eventState, displayEventState: cloneBallRuntimeState(eventState), portalEvent };
  }

  if (length(ball.velocity) < BALL_STOP_SPEED) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'settled', eventState, displayEventState: cloneBallRuntimeState(eventState), portalEvent };
  }

  return { type: 'flying', portalEvent };
}

export function reverseStepBall(level, ball, delta, options = {}) {
  const currentTime = ball.time ?? level.time ?? 0;
  const friction = getBallFriction(delta);
  const velocityBeforeFriction = vec(
    ball.velocity.x / friction,
    ball.velocity.y / friction,
  );
  const previousPosition = vec(
    ball.position.x - velocityBeforeFriction.x * delta,
    ball.position.y - velocityBeforeFriction.y * delta,
  );
  const acceleration = sampleBallAcceleration(level, previousPosition);
  const previousVelocity = vec(
    velocityBeforeFriction.x - acceleration.x * delta,
    velocityBeforeFriction.y - acceleration.y * delta,
  );
  const previousTime = currentTime - delta;

  setLevelTime(level, previousTime);
  ball.time = previousTime;
  ball.position.x = previousPosition.x;
  ball.position.y = previousPosition.y;
  ball.velocity.x = previousVelocity.x;
  ball.velocity.y = previousVelocity.y;
  ball.anchorPlanetIndex = null;
  ball.anchorNormal = ball.anchorNormal ? cloneVec(ball.anchorNormal) : null;

  const launchPlanetIndex = options.launchPlanetIndex ?? null;
  if (launchPlanetIndex !== null) {
    const launchPlanet = level.planets[launchPlanetIndex];
    if (launchPlanet) {
      const clearanceRadius =
        (launchPlanet.landingRadius ?? getBallSurfaceRadius(launchPlanet))
        + PLANET_LANDING_PADDING;
      ball.launchGracePlanetIndex = distanceBetween(ball.position, launchPlanet.position) <= clearanceRadius
        ? launchPlanetIndex
        : null;
    }
  }

  return { type: 'flying' };
}

export function simulateShot(level, shot, options = {}) {
  const delta = options.delta ?? 1 / 60;
  const maxTime = options.maxTime ?? 20;
  const startTime = options.startTime ?? 0;
  const waitTime = shot.waitTime ?? options.waitTime ?? 0;
  const captureFrames = options.captureFrames === true;
  const anchorPlanetIndex = options.anchorPlanetIndex ?? level.startPlanetIndex ?? null;
  const anchorNormal = options.anchorNormal ?? directionFromAngleDeg(level.startAngleDeg ?? DEFAULT_START_ANGLE_DEG);
  const startPosition = options.startPosition ?? level.startAnchor;

  setLevelTime(level, startTime);
  const ball = {
    position: cloneVec(startPosition),
    velocity: vec(0, 0),
    time: startTime,
    landingCount: options.landingCount ?? 0,
    launchGracePlanetIndex: anchorPlanetIndex ?? findContainingLandingPlanetIndex(level, startPosition),
    anchorPlanetIndex,
    anchorNormal: cloneVec(anchorNormal),
  };
  const frames = captureFrames ? [] : null;
  let launchState = null;

  function pushFrame() {
    if (!frames) {
      return;
    }

    frames.push({
      position: cloneVec(ball.position),
      velocity: cloneVec(ball.velocity),
      time: ball.time ?? level.time ?? 0,
      anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
      landingCount: ball.landingCount ?? 0,
    });
  }

  if (ball.anchorPlanetIndex !== null) {
    syncBallToAnchor(level, ball);
  }
  pushFrame();

  if (waitTime > 0) {
    if (captureFrames) {
      let remainingWait = waitTime;
      while (remainingWait > 0.000001) {
        const step = Math.min(delta, remainingWait);
        const launchTime = (ball.time ?? startTime) + step;
        setLevelTime(level, launchTime);
        ball.time = launchTime;
        if (ball.anchorPlanetIndex !== null) {
          advanceBallAnchor(level, ball, step);
        }
        pushFrame();
        remainingWait -= step;
      }
    } else {
      const launchTime = startTime + waitTime;
      setLevelTime(level, launchTime);
      ball.time = launchTime;
      if (ball.anchorPlanetIndex !== null) {
        advanceBallAnchor(level, ball, waitTime);
      }
    }
  }

  if (!isGoalOpen(level, ball.time ?? startTime + waitTime)) {
    return {
      outcome: 'crash',
      reason: 'goal-closed',
      planetIndex: null,
      planetName: '',
      waitTime,
      landingCount: ball.landingCount ?? 0,
      time: 0,
      steps: 0,
      finalTime: ball.time ?? startTime + waitTime,
      anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
      anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
      minGoalDistance: distanceBetween(ball.position, level.goalCenter),
      minPlanetClearance: Number.POSITIVE_INFINITY,
      finalPosition: cloneVec(ball.position),
      launchState,
      eventState: null,
      displayEventState: null,
      frames,
    };
  }

  const relativeLaunchVelocity = launchVelocity(
    vec(Math.cos(shot.angle), Math.sin(shot.angle)),
    shot.dragPower,
  );
  const launchBodyVelocity = anchorPlanetIndex !== null
    ? getPlanetVelocity(level, anchorPlanetIndex, ball.time ?? startTime + waitTime)
    : vec(0, 0);
  const launchSurfaceVelocity = anchorPlanetIndex !== null
    ? getPlanetSurfaceVelocity(level, anchorPlanetIndex, ball.anchorNormal)
    : vec(0, 0);
  ball.velocity = vec(
    relativeLaunchVelocity.x + launchBodyVelocity.x + launchSurfaceVelocity.x,
    relativeLaunchVelocity.y + launchBodyVelocity.y + launchSurfaceVelocity.y,
  );
  ball.launchGracePlanetIndex = ball.anchorPlanetIndex;
  ball.anchorPlanetIndex = null;
  ball.anchorNormal = null;
  launchState = cloneBallRuntimeState(ball);
  pushFrame();

  let time = 0;
  let steps = 0;
  let minGoalDistance = distanceBetween(ball.position, level.goalCenter);
  let minPlanetClearance = Number.POSITIVE_INFINITY;

  while (time < maxTime) {
    minGoalDistance = Math.min(minGoalDistance, distanceBetween(ball.position, level.goalCenter));

    for (const planet of level.planets) {
      const clearance =
        distanceBetween(ball.position, planet.position) -
        (planet.radius + COURSE.ballRadius * PLANET_COLLISION_PADDING);
      minPlanetClearance = Math.min(minPlanetClearance, clearance);
    }

    const result = stepBall(level, ball, delta);
    time += delta;
    steps += 1;
    pushFrame();

    if (result.type !== 'flying') {
      return {
        outcome: result.type,
        reason: result.reason ?? '',
        planetIndex: result.planetIndex ?? null,
        planetName: result.planetName ?? '',
        waitTime,
        landingCount: ball.landingCount ?? 0,
        time,
        steps,
        finalTime: ball.time ?? startTime + time,
        anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
        anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
        minGoalDistance,
        minPlanetClearance,
        finalPosition: cloneVec(ball.position),
        launchState,
        eventState: result.eventState ? cloneBallRuntimeState(result.eventState) : null,
        displayEventState: result.displayEventState ? cloneBallRuntimeState(result.displayEventState) : null,
        frames,
      };
    }
  }

  return {
    outcome: 'timeout',
    reason: '',
    planetIndex: null,
    planetName: '',
    waitTime,
    landingCount: ball.landingCount ?? 0,
    time,
    steps,
    finalTime: ball.time ?? startTime + time,
    anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
    anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
    minGoalDistance,
    minPlanetClearance,
    finalPosition: cloneVec(ball.position),
    launchState,
    eventState: null,
    displayEventState: null,
    frames,
  };
}
