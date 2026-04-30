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
const TWIN_PLANET_GAP_BALL_DIAMETERS = 1.2;
const LAVA_DEFAULT_SAFE_SECONDS = 2.6;
const BALL_HEAT_MAX = 1;
const BALL_HEAT_COOL_RATE_FLIGHT = 0.72;
const BALL_HEAT_COOL_RATE_ANCHORED = 0.38;
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
const DEFAULT_RED_GIANT_START_RADIUS = SUN_COLLISION_RADIUS;
const DEFAULT_RED_GIANT_END_RADIUS = 2.35;
const DEFAULT_RED_GIANT_GROW_SECONDS = 12;
const PORTAL_COOLDOWN_SECONDS = 0.22;
const BINARY_PRIMARY_RADIUS = 0.44;
const BINARY_PRIMARY_GRAVITY_STRENGTH = FIXED_SOLAR_GRAVITY_STRENGTH;
const BINARY_SECONDARY_RADIUS = 0.36;
const BINARY_SECONDARY_GRAVITY_STRENGTH = 16;
const DEFAULT_PULSAR_JET_PERIOD = 3.2;
const DEFAULT_PULSAR_JET_ACTIVE_SECONDS = 0.72;
const DEFAULT_PULSAR_JET_LENGTH = 12.2;
const DEFAULT_PULSAR_JET_WIDTH = 0.34;
const DEFAULT_PULSAR_JET_INNER_RADIUS = 0.5;
const PULSAR_SEGMENT_COLLISION_SAMPLES = 8;
const DEFAULT_TURRET_RANGE = 5.6;
const DEFAULT_TURRET_LINE_WIDTH = 0.13;
const DEFAULT_DUST_CLOUD_RADIUS = 1.15;
const DEFAULT_DUST_CLOUD_DRAG = 0.9;
const DUST_CLOUD_DRAG_MULTIPLIER = 3.2;
const DEFAULT_METEOR_RADIUS = 0.18;
const DEFAULT_METEOR_WARNING_SECONDS = 4.2;
const DEFAULT_METEOR_IMPACT_RADIUS = 0.58;

function polar(radius, angleDeg) {
  return { radius, angleDeg };
}

export const WORLD_SIZE = 10;

export const WORLD_DEFINITIONS = [
  { id: 'starter-belt', name: 'Starter Belt' },
  { id: 'relay-reach', name: 'Relay Reach' },
  { id: 'hazard-verge', name: 'Hazard Verge' },
  { id: 'moon-lattice', name: 'Moon Lattice' },
  { id: 'twin-planets', name: 'Twin Planets' },
  { id: 'frostline-verge', name: 'Frostline Verge' },
  { id: 'split-worlds', name: 'Split Worlds' },
  { id: 'lava-reach', name: 'Lava Reach' },
  { id: 'asteroid-belts', name: 'Asteroid Belts' },
  { id: 'dust-clouds', name: 'Dust Clouds' },
  { id: 'aperture-reach', name: 'Aperture Reach' },
  { id: 'ancient-worlds', name: 'Ancient Worlds' },
  { id: 'flicker-planets', name: 'Flicker Planets' },
  { id: 'binary-crown', name: 'Binary Crown' },
  { id: 'pulsars', name: 'Pulsars' },
  { id: 'hostile-planets', name: 'Hostile Planets' },
  { id: 'dying-systems', name: 'Dying Systems' },
  { id: 'supernova', name: 'Supernova' },
  { id: 'meteor-shower', name: 'Meteor Shower' },
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
  pulsar: {
    landable: [
      { core: 0x6fdcff, glow: 0xbef4ff },
      { core: 0xffc45f, glow: 0xffeda8 },
      { core: 0xa591ff, glow: 0xdcd2ff },
    ],
    hazards: [
      { core: 0xff6b93, glow: 0xffbfd0 },
      { core: 0xff8d64, glow: 0xffd0a8 },
      { core: 0x62b8ff, glow: 0xb7e4ff },
    ],
    moons: [
      { core: 0xeaf8ff, glow: 0xffffff },
    ],
  },
  hostile: {
    landable: [
      { core: 0x6fc4ff, glow: 0xb4ebff },
      { core: 0x8be28f, glow: 0xd2ffc8 },
      { core: 0xffcf68, glow: 0xffefad },
    ],
    hazards: [
      { core: 0xff5f67, glow: 0xffb0a0 },
      { core: 0xff8e5d, glow: 0xffd0a2 },
      { core: 0xad83ff, glow: 0xe1cfff },
    ],
    moons: [
      { core: 0xe9eef7, glow: 0xffffff },
    ],
  },
  collapse: {
    landable: [
      { core: 0xffb15f, glow: 0xffdf9b },
      { core: 0x7bd0ff, glow: 0xbdeaff },
      { core: 0xb799ff, glow: 0xe1d5ff },
    ],
    hazards: [
      { core: 0xff665f, glow: 0xffa37e },
      { core: 0xff86a6, glow: 0xffbccb },
      { core: 0xff9b68, glow: 0xffd0a4 },
    ],
    moons: [
      { core: 0xf4efe6, glow: 0xffffff },
    ],
  },
  flicker: {
    landable: [
      { core: 0x64e6ff, glow: 0xb5f5ff },
      { core: 0xffcf63, glow: 0xffef9f },
      { core: 0xa58dff, glow: 0xdfd4ff },
    ],
    hazards: [
      { core: 0xff6f90, glow: 0xffc0ce },
      { core: 0xff9566, glow: 0xffceb0 },
      { core: 0x7dc7ff, glow: 0xc4e7ff },
    ],
    moons: [
      { core: 0xeef7ff, glow: 0xffffff },
    ],
  },
  meteor: {
    landable: [
      { core: 0x7fc8ff, glow: 0xc4ecff },
      { core: 0xffbf72, glow: 0xffe1a6 },
      { core: 0x99dfb3, glow: 0xd8ffd9 },
    ],
    hazards: [
      { core: 0xff6f65, glow: 0xffb392 },
      { core: 0xff8a9e, glow: 0xffc6ce },
      { core: 0x9e86ff, glow: 0xd8ccff },
    ],
    moons: [
      { core: 0xe7edf5, glow: 0xffffff },
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
  return planets.map((planet) => ({
    ...planet,
    turrets: Array.isArray(planet.turrets)
      ? planet.turrets.map((turret) => ({ ...turret }))
      : planet.turrets,
  }));
}

function cloneDustClouds(dustClouds) {
  return (dustClouds ?? []).map((cloud) => ({ ...cloud }));
}

function cloneMeteorImpacts(meteorImpacts) {
  return (meteorImpacts ?? []).map((meteor) => ({
    ...meteor,
    start: meteor.start ? { ...meteor.start } : meteor.start,
    target: meteor.target ? { ...meteor.target } : meteor.target,
  }));
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
    dustClouds: cloneDustClouds(overrides.dustClouds ?? base.dustClouds),
    meteorImpacts: cloneMeteorImpacts(overrides.meteorImpacts ?? base.meteorImpacts),
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

function makeLavaVariant(spec) {
  const level = variantLevel('ember', spec);
  level.planets = level.planets.map((planet, index) => {
    if (!planet.landable) {
      return planet;
    }

    const lavaSafeSeconds = typeof spec.lavaSafeSeconds === 'number'
      ? spec.lavaSafeSeconds
      : spec.lavaSafeSeconds?.[index];

    return {
      ...planet,
      surfaceType: 'lava',
      lavaSafeSeconds: lavaSafeSeconds ?? LAVA_DEFAULT_SAFE_SECONDS,
    };
  });
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

function normalizePulsarJets(spec) {
  return {
    periodSeconds: spec.periodSeconds ?? DEFAULT_PULSAR_JET_PERIOD,
    activeSeconds: spec.activeSeconds ?? DEFAULT_PULSAR_JET_ACTIVE_SECONDS,
    phaseSeconds: spec.phaseSeconds ?? 0,
    angleDeg: spec.angleDeg ?? 0,
    angularSpeedDeg: spec.angularSpeedDeg ?? 0,
    length: spec.length ?? DEFAULT_PULSAR_JET_LENGTH,
    width: spec.width ?? DEFAULT_PULSAR_JET_WIDTH,
    innerRadius: spec.innerRadius ?? DEFAULT_PULSAR_JET_INNER_RADIUS,
  };
}

function makePulsarVariant(spec) {
  const level = variantLevel('pulsar', spec);
  level.summary = spec.summary;
  level.pulsarJets = normalizePulsarJets(spec.pulsarJets ?? spec);
  return level;
}

function normalizeTurret(turret = {}, turretIndex = 0) {
  return {
    id: turret.id ?? `turret-${turretIndex + 1}`,
    type: turret.type ?? (turretIndex % 2 === 0 ? 'tank' : 'missile'),
    angleDeg: turret.angleDeg ?? 0,
    range: turret.range ?? DEFAULT_TURRET_RANGE,
    width: turret.width ?? DEFAULT_TURRET_LINE_WIDTH,
    phaseSeconds: turret.phaseSeconds ?? 0,
  };
}

function makeHostileVariant(spec) {
  const level = variantLevel('hostile', spec);
  level.summary = spec.summary;
  level.tutorial = spec.tutorial ?? null;
  level.planets = level.planets.map((planet, index) => {
    const turrets = spec.turrets?.[index];
    if (!turrets) {
      return planet;
    }
    const turretList = Array.isArray(turrets) ? turrets : [turrets];
    return {
      ...planet,
      turrets: turretList.map((turret, turretIndex) => normalizeTurret(turret, turretIndex)),
    };
  });
  return level;
}

function normalizeDustCloud(cloud = {}, cloudIndex = 0) {
  return {
    id: cloud.id ?? `dust-cloud-${cloudIndex + 1}`,
    position: cloud.position,
    radius: cloud.radius ?? DEFAULT_DUST_CLOUD_RADIUS,
    drag: cloud.drag ?? DEFAULT_DUST_CLOUD_DRAG,
    orbitAngularSpeed: cloud.orbitAngularSpeed ?? 0,
    orbitEccentricity: cloud.orbitEccentricity ?? 0.03,
    orbitRotationDeg: cloud.orbitRotationDeg,
    opacity: cloud.opacity ?? 1,
  };
}

function makeDustVariant(spec) {
  const level = variantLevel('ancient', {
    ...spec,
    summary: spec.summary ?? 'Interstellar dust drifts through the system. Crossing it bleeds speed from every shot.',
  });
  level.tutorial = spec.tutorial ?? null;
  level.dustClouds = (spec.dustClouds ?? []).map((cloud, cloudIndex) => normalizeDustCloud(cloud, cloudIndex));
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

function makeTwinPlanetVariant(spec) {
  const level = variantLevel('prism', {
    ...spec,
    summary: spec.summary ?? 'Every world in this system is a close twin pair. Use the two-body rhythm instead of aiming at a single planet.',
  });
  const twinDefaults = spec.twinDefaults ?? {};
  const twinEntries = [];

  level.planets.forEach((planet, index) => {
    const pair = spec.twinPairs?.[index] ?? {};
    const baseRadius = planet.radius ?? 0.64;
    const twinRadius = Number((baseRadius * (pair.radiusScale ?? twinDefaults.radiusScale ?? 0.46)).toFixed(3));
    const minimumOrbitRadius = twinRadius * PLANET_RADIUS_SCALE
      + COURSE.ballRadius * TWIN_PLANET_GAP_BALL_DIAMETERS;
    const authoredOrbitRadius = pair.orbitRadius ?? twinDefaults.orbitRadius ?? clamp(baseRadius * 0.44, 0.38, 0.56);
    const orbitRadius = Number(Math.max(authoredOrbitRadius, minimumOrbitRadius).toFixed(3));
    const orbitSpeed = pair.orbitAngularSpeed
      ?? twinDefaults.orbitAngularSpeed
      ?? ((index % 2 === 0 ? 1 : -1) * (2.35 + index * 0.18));
    const centerPoint = pointFromPolar(planet.position);
    const radialDirection = lengthSq(centerPoint) > 0.000001 ? normalize(centerPoint) : directionFromAngleDeg(pair.angleDeg ?? 0);
    const tangent = vec(-radialDirection.y, radialDirection.x);
    const phaseDirection = pair.phaseDeg === 90 ? radialDirection : tangent;
    const firstPoint = vec(
      centerPoint.x + phaseDirection.x * orbitRadius,
      centerPoint.y + phaseDirection.y * orbitRadius,
    );
    const secondPoint = vec(
      centerPoint.x - phaseDirection.x * orbitRadius,
      centerPoint.y - phaseDirection.y * orbitRadius,
    );
    const twinGravity = Number(((planet.gravity ?? 7) * (pair.gravityScale ?? twinDefaults.gravityScale ?? 0.52)).toFixed(3));
    const landingRadius = planet.landingRadius !== undefined
      ? Number((planet.landingRadius * 0.68).toFixed(3))
      : undefined;
    const centerKey = `${index}:center`;
    const firstKey = `${index}:a`;
    const secondKey = `${index}:b`;

    twinEntries.push({
      key: centerKey,
      orbitAroundKey: planet.orbitAround !== undefined ? `${planet.orbitAround}:center` : undefined,
      planet: {
        ...planet,
        name: `${planet.name} Center`,
        hidden: true,
        landable: false,
        gravity: 0,
        falloff: 0,
        radius: 0.001,
        landingRadius: undefined,
        orbitAround: undefined,
        orbitAngularSpeed: planet.orbitAngularSpeed ?? 0,
        spinAngularSpeed: 0,
      },
    });

    twinEntries.push({
      key: firstKey,
      orbitAroundKey: centerKey,
      planet: {
        ...planet,
        name: `${planet.name} A`,
        position: polarFromPoint(firstPoint),
        radius: twinRadius,
        gravity: twinGravity,
        falloff: Number(((planet.falloff ?? 4.8) * 0.72).toFixed(3)),
        landingRadius,
        orbitAround: undefined,
        orbitAngularSpeed: orbitSpeed,
        orbitEccentricity: pair.orbitEccentricity ?? 0,
        spinAngularSpeed: planet.spinAngularSpeed ?? 0.12,
      },
    });

    twinEntries.push({
      key: secondKey,
      orbitAroundKey: centerKey,
      planet: {
        ...planet,
        name: `${planet.name} B`,
        position: polarFromPoint(secondPoint),
        radius: twinRadius,
        gravity: twinGravity,
        falloff: Number(((planet.falloff ?? 4.8) * 0.72).toFixed(3)),
        landingRadius,
        orbitAround: undefined,
        orbitAngularSpeed: orbitSpeed,
        orbitEccentricity: pair.orbitEccentricity ?? 0,
        spinAngularSpeed: pair.spinAngularSpeed ?? -orbitSpeed * 0.28,
        core: pair.companionCore ?? 0xe9efff,
        glow: pair.companionGlow ?? 0xffffff,
      },
    });
  });

  twinEntries.sort((left, right) => left.planet.position.radius - right.planet.position.radius);
  const keyToIndex = new Map(twinEntries.map((entry, index) => [entry.key, index]));

  level.planets = twinEntries.map((entry) => {
    const planet = { ...entry.planet };
    if (entry.orbitAroundKey !== undefined) {
      planet.orbitAround = keyToIndex.get(entry.orbitAroundKey);
    }
    return planet;
  });
  level.startPlanetIndex = keyToIndex.get(`${level.startPlanetIndex ?? 0}:a`) ?? 0;
  return level;
}

function makeDyingVariant(spec, specIndex) {
  const level = variantLevel('collapse', {
    ...spec,
    summary: spec.summary ?? 'The system is losing altitude. Every planet drifts inward while the shot window collapses.',
  });
  const decayScale = spec.decayScale ?? (1 + specIndex * 0.055);
  level.systemState = 'dying';
  level.planets = level.planets.map((planet, index) => {
    const isMoon = planet.orbitAround !== undefined;
    const authoredOrbitRadius = planet.position?.radius ?? 4;
    const fallIntoSunRadius = isMoon
      ? Math.max(0.34, Math.min(authoredOrbitRadius * 0.72, (planet.radius ?? 0.5) * 1.1))
      : Math.max(0.9, Math.min(authoredOrbitRadius * 0.78, (planet.radius ?? 0.5) + 0.85));
    const speedMultiplier = isMoon ? 1.75 : 2.35;
    const minimumOrbitSpeed = isMoon ? 1.45 : 0.72;
    const authoredOrbitSpeed = planet.orbitAngularSpeed !== undefined
      ? planet.orbitAngularSpeed * speedMultiplier
      : minimumOrbitSpeed * (index % 2 === 0 ? 1 : -1);
    const orbitAngularSpeed = Math.abs(authoredOrbitSpeed) < minimumOrbitSpeed
      ? Number((minimumOrbitSpeed * (authoredOrbitSpeed < 0 ? -1 : 1)).toFixed(4))
      : Number(authoredOrbitSpeed.toFixed(4));
    const orbitMinRadius = isMoon
      ? Math.max(0.18, fallIntoSunRadius * 0.55)
      : Math.max(0.32, fallIntoSunRadius * 0.62);
    const visibleOrbitSpeed = Math.abs(orbitAngularSpeed);
    const targetCollapseOrbits = spec.collapseOrbits
      ?? clamp(1.55 + specIndex * 0.12 + index * 0.08, 1.55, 2.95);
    const targetCollapseSeconds = (Math.PI * 2 / visibleOrbitSpeed) * targetCollapseOrbits;
    const decayDistance = Math.max(0.001, authoredOrbitRadius - orbitMinRadius);
    return {
      ...planet,
      orbitAngularSpeed,
      orbitDecayRate: Number((decayDistance / targetCollapseSeconds * decayScale).toFixed(4)),
      orbitMinRadius,
      fallIntoSunRadius,
    };
  });
  return level;
}

function makeFlickerVariant(spec) {
  const level = variantLevel('flicker', {
    ...spec,
    summary: spec.summary ?? 'Planets phase out on their countdown rings. Wait for the relay to exist before you commit.',
  });
  const defaults = spec.flickerDefaults ?? {};
  level.systemState = 'flicker';
  level.tutorial = spec.tutorial ?? null;
  level.planets = level.planets.map((planet, index) => {
    const flicker = spec.flicker?.[index];
    if (!flicker) {
      return planet;
    }

    return {
      ...planet,
      flicker: {
        periodSeconds: flicker.periodSeconds ?? defaults.periodSeconds ?? 5.6,
        visibleSeconds: flicker.visibleSeconds ?? defaults.visibleSeconds ?? 3.1,
        phaseSeconds: flicker.phaseSeconds ?? defaults.phaseSeconds ?? 0,
        transitionSeconds: flicker.transitionSeconds ?? defaults.transitionSeconds ?? 0.32,
      },
    };
  });
  return level;
}

function makeSupernovaVariant(spec, specIndex) {
  const level = variantLevel('collapse', {
    ...spec,
    summary: spec.summary ?? 'The sun is swelling into a red giant. Launch before the inner worlds are swallowed.',
  });
  const growSeconds = spec.growSeconds ?? Math.max(8.5, DEFAULT_RED_GIANT_GROW_SECONDS - specIndex * 0.28);
  const endRadius = spec.endRadius ?? (1.64 + specIndex * 0.12);
  level.redGiant = {
    startRadius: spec.startRadius ?? DEFAULT_RED_GIANT_START_RADIUS,
    endRadius,
    growSeconds,
    startTimeSeconds: spec.redGiantStartTimeSeconds ?? level.startTimeSeconds ?? 0,
  };
  level.goalOpenSeconds = spec.goalOpenSeconds
    ?? Math.max(6, Math.min(level.goalOpenSeconds ?? DEFAULT_GOAL_OPEN_SECONDS, growSeconds + 1.6));
  level.planets = level.planets.map((planet, index) => ({
    ...planet,
    redGiantVulnerable: spec.safePlanetIndices?.includes(index) ? false : true,
    sunFadeStartRadius: endRadius + (planet.radius ?? 0.5) * 2.25 + 0.35,
    sunPlungeDuration: spec.sunPlungeDuration ?? 0.72,
  }));
  return level;
}

function makeMeteorVariant(spec) {
  const level = variantLevel('meteor', spec);
  const authoredImpacts = (spec.meteorImpacts ?? []).map((meteor) => ({
    ...meteor,
    start: meteor.start,
    color: meteor.color ?? 0xff865f,
    trailColor: meteor.trailColor ?? 0xffd48a,
  }));
  const destroyedPlanetIndexes = new Set(
    authoredImpacts
      .filter((meteor) => meteor.destroysPlanet !== false && meteor.targetPlanetIndex !== null && meteor.targetPlanetIndex !== undefined)
      .map((meteor) => meteor.targetPlanetIndex),
  );
  const lastAuthoredImpactTime = authoredImpacts.reduce(
    (latest, meteor) => Math.max(latest, meteor.impactTimeSeconds ?? 0),
    0,
  );
  const cleanupStartSeconds = spec.cleanupStartSeconds ?? Math.max(16, lastAuthoredImpactTime + 4);
  const cleanupImpacts = level.planets
    .map((_, planetIndex) => planetIndex)
    .filter((planetIndex) => !destroyedPlanetIndexes.has(planetIndex))
    .map((planetIndex, cleanupIndex) => ({
      targetPlanetIndex: planetIndex,
      impactTimeSeconds: Number((cleanupStartSeconds + cleanupIndex * 1.45).toFixed(2)),
      warningSeconds: 5.0,
      approachAngleDeg: ((planetIndex * 83 + cleanupIndex * 47 + 31) % 360) - 180,
      startDistance: 10.5,
      radius: 0.17,
      color: 0xff865f,
      trailColor: 0xffd48a,
      cleanup: true,
    }));

  const ambientFlybys = (spec.ambientFlybys ?? [
    { start: polar(12.4, -64), target: polar(11.2, 18), periodSeconds: 7.2, phaseSeconds: 0, radius: 0.13 },
    { start: polar(12.1, 76), target: polar(10.9, -18), periodSeconds: 7.8, phaseSeconds: 1.1, radius: 0.14 },
    { start: polar(11.8, -22), target: polar(12.0, 58), periodSeconds: 6.8, phaseSeconds: 2.0, radius: 0.12 },
    { start: polar(12.3, 138), target: polar(10.8, 92), periodSeconds: 8.1, phaseSeconds: 3.0, radius: 0.13 },
    { start: polar(11.9, -142), target: polar(11.0, -86), periodSeconds: 7.4, phaseSeconds: 4.1, radius: 0.12 },
  ]).map((meteor) => ({
    ...meteor,
    warningSeconds: meteor.warningSeconds ?? meteor.periodSeconds ?? meteor.impactTimeSeconds ?? 8,
    impactTimeSeconds: meteor.impactTimeSeconds ?? meteor.periodSeconds ?? 8,
    destroysPlanet: false,
    ambient: true,
    color: meteor.color ?? 0xff9a66,
    trailColor: meteor.trailColor ?? 0xffd8a0,
  }));

  level.meteorImpacts = [...ambientFlybys, ...authoredImpacts, ...cleanupImpacts];
  return level;
}

function angularDistanceDeg(left, right) {
  return Math.abs((((left - right + 180) % 360) + 360) % 360 - 180);
}

function makeAsteroidBelt({
  orbitRadius = 5,
  count = 36,
  radius = 0.2,
  gapAngles = [0],
  gapWidthDeg = 34,
  angularSpeed = 0.08,
  radialJitter = 0.18,
  seed = 0,
}) {
  const asteroids = [];
  for (let index = 0; index < count; index += 1) {
    const angleDeg = (index / count) * 360;
    const inGap = gapAngles.some((gapAngleDeg) => angularDistanceDeg(angleDeg, gapAngleDeg) <= gapWidthDeg / 2);
    if (inGap) {
      continue;
    }

    const wobble = ((index * 37 + seed * 19) % 17 - 8) * 0.008;
    const orbitWobble = ((index * 29 + seed * 11) % 13 - 6) * (radialJitter / 6);
    asteroids.push({
      position: polar(orbitRadius + orbitWobble, angleDeg),
      orbitRadius: orbitRadius + orbitWobble,
      baseAngleDeg: angleDeg,
      orbitAngularSpeed: angularSpeed,
      radius: Number((radius + wobble).toFixed(3)),
      spinSpeed: (((index + seed) % 2 === 0 ? 1 : -1) * (0.28 + ((index + seed) % 5) * 0.04)),
      color: [0x9aa0aa, 0x7d858f, 0xb2aa9a][(index + seed) % 3],
    });
  }
  return asteroids;
}

function makeAsteroidBeltLevel(spec) {
  const defaultOuterPlanet = spec.disableDefaultOuterPlanet
    ? []
    : [{
      name: spec.outerPlanetName ?? 'Outer Relay',
      position: polar(
        Math.max(5.8, Math.min(6.9, spec.goalCenter.radius - 1.35)),
        (spec.goalCenter.angleDeg ?? 0) + (spec.outerPlanetAngleOffset ?? 18),
      ),
      radius: 0.58,
      gravity: 5.2,
      falloff: 3.4,
      core: 0xf2a366,
      glow: 0xffd18a,
      landable: true,
      landingRadius: 0.92,
      orbitAngularSpeed: spec.outerPlanetOrbitSpeed ?? 0.04,
      spinAngularSpeed: 0.08,
    }];
  return {
    id: spec.id,
    name: spec.name,
    summary: spec.summary,
    preferRelay: spec.preferRelay,
    adminSolutions: spec.adminSolutions,
    sun: [0, 0],
    startPlanetIndex: spec.startPlanetIndex ?? 0,
    startAnchor: spec.startAnchor,
    goalCenter: spec.goalCenter,
    goalOpenSeconds: spec.goalOpenSeconds ?? 12,
    goalPullRadius: spec.goalPullRadius ?? 2.4,
    goalPullStrength: spec.goalPullStrength ?? 5.8,
    sunGravityStrength: spec.sunGravityStrength ?? 0,
    launchPresets: spec.launchPresets,
    asteroids: spec.belts.flatMap((belt, index) => makeAsteroidBelt({ ...belt, seed: index + spec.seed })),
    planets: [...spec.planets, ...(spec.outerPlanets ?? defaultOuterPlanet)],
  };
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

const TWIN_PLANET_WORLD_SPECS = [
  { baseId: 'open-lane', id: 'twin-lane', name: 'Twin Lane', summary: 'A simple opening lane, but the launch world is now two small planets circling each other.', twinDefaults: { orbitAngularSpeed: 2.0 } },
  { baseId: 'first-relay', id: 'twin-arc', name: 'Inner Twin Relay', summary: 'The first real twin puzzle starts from a shifted face and asks for a wider angled relay.', startAnchorShift: { angle: -18 }, goalShift: { radius: 0.35, angle: -10 }, launchAngleDelta: -18, powerScale: 0.94, twinDefaults: { orbitAngularSpeed: 2.2 } },
  { baseId: 'guarded-relay', id: 'twin-relay', name: 'Guarded Twin Relay', summary: 'A familiar relay route gains a non-landable outer twin pair that blocks lazy exits.', goalShift: { radius: 0.25, angle: 5 }, launchAngleDelta: 4, twinDefaults: { orbitAngularSpeed: 2.45, radiusScale: 0.34, gravityScale: 0.46 } },
  { baseId: 'forked-harbor', id: 'eclipse-twins', name: 'Forked Twins', summary: 'Two harbor routes split around a non-landable rim pair, so choosing the right twin relay matters.', twinDefaults: { orbitAngularSpeed: -2.2, radiusScale: 0.28, gravityScale: 0.44 } },
  { baseId: 'false-periapsis', id: 'swift-twins', name: 'Periapsis Twins', summary: 'A close relay pair and a rim hazard pair create several possible twin-planet exits.', twinDefaults: { orbitAngularSpeed: 2.55, radiusScale: 0.32, gravityScale: 0.46 } },
  { baseId: 'periapsis-brood', id: 'sweep-twins', name: 'Brood Twins', summary: 'A close periapsis relay opens into several off-axis twin exits instead of a single moon ladder.', twinDefaults: { orbitAngularSpeed: -2.5, radiusScale: 0.2, gravityScale: 0.38 } },
  { baseId: 'far-side-switch', id: 'hot-twins', name: 'Far-Side Twins', summary: 'A far-side relay pair now sits across the sun, making the route read differently from the brood fan before it.', planetTweaks: { 3: { position: polar(7.8, -132), orbitAngularSpeed: 0.14, spinAngularSpeed: -0.62 } }, twinDefaults: { orbitAngularSpeed: 2.35, radiusScale: 0.28, gravityScale: 0.44 } },
  { baseId: 'guarded-brood', id: 'locked-twins', name: 'Guarded Ladder Twins', summary: 'A ladder of landable twin pairs climbs past an unsafe outer guard.', twinDefaults: { orbitAngularSpeed: -2.35, radiusScale: 0.3, gravityScale: 0.44 } },
  { baseId: 'countermoon-gate', id: 'shield-twins', name: 'Countergate Twins', summary: 'Counterspin relays, a side dock, and two non-landable sentinel pairs create a gated route.', twinDefaults: { orbitAngularSpeed: 2.25, radiusScale: 0.26, gravityScale: 0.42 } },
  { baseId: 'halo-shepherds', id: 'guarded-twins', name: 'Halo Twins', summary: 'The final twin sector route spreads relays around a wide halo with multiple unsafe sentinels.', twinDefaults: { orbitAngularSpeed: -2.45, radiusScale: 0.16, gravityScale: 0.36 } },
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

const LAVA_WORLD_SPECS = [
  { baseId: 'fast-window', id: 'ember-window', name: 'Ember Window', summary: 'The lane still opens and closes on timing, but now the launch world itself is heating the ball while you wait.', lavaSafeSeconds: { 0: 2.8 } },
  { baseId: 'forked-harbor', id: 'melt-harbor', name: 'Melt Harbor', summary: 'Both harbors burn. The choice is not just where to land, but where you can leave before the heat runs out.', lavaSafeSeconds: { 0: 3.3, 1: 2.2, 2: 2.5, 3: 2.2 } },
  { baseId: 'inner-step', id: 'cinder-step', name: 'Cinder Step', summary: 'The outer relay is now a cinder world, so the clean handoff becomes a race against the heat.', lavaSafeSeconds: { 0: 3.2, 1: 2.4, 2: 2.15 } },
  { baseId: 'moon-switch', id: 'basalt-switch', name: 'Basalt Switch', summary: 'The switch route still opens the finish, but the molten worlds force a much faster second shot.', lavaSafeSeconds: { 0: 3.1, 1: 2.35, 2: 2.45 } },
  { baseId: 'false-periapsis', id: 'scorch-periapsis', name: 'Scorch Periapsis', summary: 'The close touch is safe only briefly. Ride the hot world too long and the ball burns before the rim transfer.', lavaSafeSeconds: { 0: 3.2, 1: 2.25, 2: 2.4 } },
  { baseId: 'halo-run', id: 'magma-halo', name: 'Magma Halo', summary: 'The halo route remains long, but every relay in it is now hot enough to punish hesitation.', lavaSafeSeconds: { 0: 3.2, 1: 2.3, 3: 2.35, 4: 2.25 } },
  { baseId: 'split-sentinel', id: 'firebreak', name: 'Firebreak', summary: 'The mirrored stops both work on paper. In practice only one lava landing gives you time to escape.', lavaSafeSeconds: { 0: 3.15, 1: 2.3, 2: 2.3, 3: 2.1 } },
  { baseId: 'moon-catch', id: 'pyre-moon', name: 'Pyre Moon', summary: 'Catch the moon, then leave the molten relay before the ball crosses from glowing to gone.', lavaSafeSeconds: { 0: 3.2, 1: 2.25, 2: 2.25, 3: 2.05 } },
  { baseId: 'crown-window', id: 'lava-window', name: 'Lava Window', summary: 'The crown still opens on a timer, but every lava stop turns the whole route into a precise sprint.', lavaSafeSeconds: { 0: 3.15, 1: 2.3, 2: 2.2, 3: 2.2 } },
  { baseId: 'final-circuit', id: 'eruption-circuit', name: 'Eruption Circuit', summary: 'The final relay circuit survives in molten form: one clean route, no idle seconds anywhere.', lavaSafeSeconds: { 0: 3.2, 1: 2.35, 2: 2.2, 3: 2.15 } },
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

const PULSAR_WORLD_SPECS = [
  { baseId: 'false-periapsis', id: 'pulse-arc', name: 'Pulse Relay', summary: 'The first safe answer is a relay. Use the periapsis world to wait out the paired jet before the finish.', angleDeg: -50, phaseSeconds: 0.35, periodSeconds: 3.4, activeSeconds: 0.56, width: 0.22 },
  { baseId: 'inner-step', id: 'strobe-window', name: 'Strobe Step', summary: 'The inside launch is safe, but the finish is easier after stepping out to a relay between pulses.', angleDeg: -40, angularSpeedDeg: 2, phaseSeconds: 0.55, periodSeconds: 3.4, activeSeconds: 0.62, width: 0.28 },
  { baseId: 'mirror-harbor', id: 'beacon-relay', name: 'Beacon Relay', summary: 'The harbor route gives you a place to wait while the beacon cuts through the direct center lane.', angleDeg: -30, phaseSeconds: 0.55, periodSeconds: 3.6, activeSeconds: 0.56, width: 0.22 },
  { baseId: 'forked-harbor', id: 'eclipse-pulse', name: 'Forked Pulse', summary: 'Both harbors offer timing options, but the wrong exit crosses the pulsar cone as it fires.', angleDeg: 32, angularSpeedDeg: -2, phaseSeconds: 0.45, periodSeconds: 3.5, activeSeconds: 0.62, width: 0.28 },
  { baseId: 'long-transfer', id: 'lighthouse-transfer', name: 'Lighthouse Transfer', summary: 'Use the outer station as shelter, then time the long transfer around the lighthouse beam from the sun.', angleDeg: 20, phaseSeconds: 0.85, periodSeconds: 3.8, activeSeconds: 0.6, width: 0.24 },
  { baseId: 'moon-switch', id: 'pulse-switch', name: 'Pulse Switch', summary: 'The moon remains the switch, while the paired jets punish a lazy straight exit toward the goal.', angleDeg: 44, angularSpeedDeg: 3, phaseSeconds: 0.45, periodSeconds: 3.5, activeSeconds: 0.64, width: 0.28 },
  { baseId: 'halo-run', id: 'crown-beacon', name: 'Beacon Halo', summary: 'The wide relay chain gives several waits; leave the halo only after the beacon burst passes.', angleDeg: -54, phaseSeconds: 0.75, periodSeconds: 3.7, activeSeconds: 0.66, width: 0.3 },
  { baseId: 'rim-switch', id: 'guarded-pulsar', name: 'Guarded Pulsar', summary: 'The switch world is the safe staging point while the pulsar punishes the straight shortcut.', angleDeg: 30, angularSpeedDeg: -2, phaseSeconds: 0.45, periodSeconds: 3.5, activeSeconds: 0.64, width: 0.28 },
  { baseId: 'counterspin-gate', id: 'counterpulse-gate', name: 'Counterpulse Gate', summary: 'Stabilize on the relay, then cross the counterspinning gate after the pulsar beat passes.', angleDeg: 42, phaseSeconds: 0.65, periodSeconds: 3.6, activeSeconds: 0.64, width: 0.28 },
  { baseId: 'final-circuit', id: 'pulsar-circuit', name: 'Pulsar Circuit', summary: 'The final circuit becomes a timing run through repeated twin jets before the clean relay escape.', angleDeg: -40, angularSpeedDeg: 2, phaseSeconds: 0.65, periodSeconds: 3.5, activeSeconds: 0.58, width: 0.24 },
];

const HOSTILE_WORLD_SPECS = [
  {
    baseId: 'first-arc',
    id: 'sentry-arc',
    name: 'Sentry Arc',
    summary: 'A gun line marks the forbidden shortcut. Bend around the sun without crossing the sentry sight.',
    tutorial: { type: 'turret', copy: 'Cross a turret sight line and the shot is destroyed.' },
    turrets: { 0: { type: 'tank', angleDeg: 112, range: 4.2 } },
  },
  { baseId: 'fast-window', id: 'watch-relay', name: 'Watch Window', summary: 'The launch window still opens and closes while the sentry line watches the direct lane.', turrets: { 0: { type: 'missile', angleDeg: 96, range: 4.4 } } },
  { baseId: 'forked-harbor', id: 'gun-harbor', name: 'Gun Harbor', summary: 'Both harbors are visible, but the armed worlds make one corridor too costly to cross.', turrets: { 1: { type: 'tank', angleDeg: 12, range: 4.5 }, 3: { type: 'missile', angleDeg: 214, range: 5.0 } } },
  { baseId: 'inner-step', id: 'crossfire-step', name: 'Crossfire Step', summary: 'Step outward through the relay while two sight lines divide the middle of the system.', turrets: { 1: { type: 'tank', angleDeg: 236, range: 4.5 }, 2: { type: 'missile', angleDeg: 122, range: 5.2 } } },
  { baseId: 'moon-switch', id: 'launcher-switch', name: 'Launcher Switch', summary: 'The switch route survives, but missile sight lines punish the lazy middle exit.', turrets: { 2: { type: 'missile', angleDeg: 250, range: 5.0 }, 4: { type: 'tank', angleDeg: 180, range: 3.8 } } },
  { baseId: 'long-transfer', id: 'battery-transfer', name: 'Battery Transfer', summary: 'The outer station is still the answer; armed giants cut off the impatient transfer.', turrets: { 2: { type: 'tank', angleDeg: 92, range: 5.2 }, 4: { type: 'missile', angleDeg: 202, range: 4.8 } } },
  { baseId: 'halo-run', id: 'siege-halo', name: 'Siege Halo', summary: 'A wide halo route threads past planetary batteries watching the inner shortcut.', turrets: { 1: { type: 'tank', angleDeg: 318, range: 4.5 }, 4: { type: 'missile', angleDeg: 214, range: 5.4 } } },
  { baseId: 'rim-switch', id: 'sentry-switch', name: 'Sentry Switch', summary: 'Stabilize on the switch worlds and avoid the sight line guarding the rim burn.', turrets: { 2: { type: 'tank', angleDeg: 78, range: 4.9 }, 4: { type: 'missile', angleDeg: 190, range: 4.8 } } },
  { baseId: 'counterspin-gate', id: 'flak-gate', name: 'Flak Gate', summary: 'The counterspin route now has flak lines covering the obvious recovery paths.', turrets: { 1: { type: 'tank', angleDeg: 24, range: 4.6 }, 3: { type: 'missile', angleDeg: 238, range: 5.3 } } },
  { baseId: 'final-circuit', id: 'hostile-circuit', name: 'Hostile Circuit', summary: 'The final relay circuit becomes a hostile run through overlapping planet sight lines.', turrets: { 1: { type: 'tank', angleDeg: 312, range: 4.8 }, 2: { type: 'missile', angleDeg: 88, range: 5.2 }, 3: { type: 'tank', angleDeg: 210, range: 4.6 } } },
];

const DUST_WORLD_SPECS = [
  {
    baseId: 'first-arc',
    id: 'dust-drift',
    name: 'Dust Drift',
    summary: 'The first cloud is soft enough to use as a brake, but crossing its center kills the clean arc.',
    tutorial: { type: 'dust', copy: 'Dust clouds slow the ball while it flies through them.' },
    launchAngleDelta: 1.5,
    powerScale: 1.03,
    dustClouds: [
      { position: polar(4.3, -44), radius: 1.08, drag: 0.56, orbitAngularSpeed: 0.05 },
    ],
  },
  {
    baseId: 'fast-window',
    id: 'silt-window',
    name: 'Silt Window',
    summary: 'A braking cloud slides across the fast lane, turning the timing window into a speed window too.',
    launchAngleDelta: -2,
    powerScale: 1.05,
    dustClouds: [
      { position: polar(4.9, -18), radius: 1.0, drag: 0.66, orbitAngularSpeed: -0.08 },
    ],
  },
  {
    baseId: 'first-arc',
    id: 'veil-relay',
    name: 'Veil Arc',
    summary: 'A thin veil crosses the simple solar bend, trimming speed if the shot cuts too deep.',
    launchAngleDelta: 2,
    powerScale: 1.05,
    dustClouds: [
      { position: polar(3.9, -44), radius: 0.94, drag: 0.48, orbitAngularSpeed: 0.05 },
      { position: polar(6.2, 8), radius: 0.82, drag: 0.34, orbitAngularSpeed: -0.04 },
    ],
  },
  {
    baseId: 'forked-harbor',
    id: 'powder-harbor',
    name: 'Powder Harbor',
    summary: 'The fork is still readable, but one harbor lane spends too long inside the powder band.',
    launchAngleDelta: 1,
    dustClouds: [
      { position: polar(4.4, 24), radius: 1.05, drag: 0.72, orbitAngularSpeed: -0.05 },
      { position: polar(7.2, -16), radius: 1.2, drag: 0.5, orbitAngularSpeed: 0.04 },
    ],
  },
  {
    baseId: 'inner-step',
    id: 'brownout-step',
    name: 'Brownout Step',
    summary: 'The inner launch has to step outward before the broad cloud strips away too much momentum.',
    powerScale: 1.06,
    dustClouds: [
      { position: polar(3.7, -66), radius: 1.35, drag: 0.6, orbitAngularSpeed: 0.04 },
      { position: polar(6.6, 30), radius: 0.95, drag: 0.5, orbitAngularSpeed: -0.06 },
    ],
  },
  {
    baseId: 'moon-switch',
    id: 'dust-switch',
    name: 'Dust Switch',
    summary: 'The moon route survives, but the cloud before the switch changes how much speed reaches the rim.',
    launchAngleDelta: -1.5,
    dustClouds: [
      { position: polar(4.6, 112), radius: 1.12, drag: 0.68, orbitAngularSpeed: 0.08 },
      { position: polar(7.4, -10), radius: 1.0, drag: 0.48, orbitAngularSpeed: -0.03 },
    ],
  },
  {
    baseId: 'long-transfer',
    id: 'nebula-transfer',
    name: 'Nebula Transfer',
    summary: 'A long transfer now needs a stronger launch because the nebula sands speed off the outbound leg.',
    powerScale: 1.08,
    dustClouds: [
      { position: polar(5.4, -38), radius: 1.42, drag: 0.58, orbitAngularSpeed: 0.03 },
      { position: polar(8.1, 20), radius: 1.05, drag: 0.44, orbitAngularSpeed: -0.05 },
    ],
  },
  {
    baseId: 'halo-run',
    id: 'cloud-halo',
    name: 'Cloud Halo',
    summary: 'The outer halo has enough room, but the dust pockets decide which relays keep usable speed.',
    powerScale: 1.07,
    dustClouds: [
      { position: polar(4.2, 138), radius: 1.0, drag: 0.62, orbitAngularSpeed: -0.04 },
      { position: polar(6.7, -24), radius: 1.25, drag: 0.55, orbitAngularSpeed: 0.03 },
      { position: polar(8.7, 44), radius: 0.95, drag: 0.42, orbitAngularSpeed: -0.06 },
    ],
  },
  {
    baseId: 'crown-window',
    id: 'crown-haze',
    name: 'Crown Haze',
    summary: 'The crown route opens cleanly only if the haze trims speed without trapping the shot.',
    launchAngleDelta: 1.5,
    powerScale: 1.05,
    dustClouds: [
      { position: polar(5.2, 62), radius: 1.18, drag: 0.64, orbitAngularSpeed: 0.05 },
      { position: polar(7.8, 2), radius: 1.12, drag: 0.52, orbitAngularSpeed: -0.04 },
    ],
  },
  {
    baseId: 'final-circuit',
    id: 'dust-circuit',
    name: 'Dust Circuit',
    summary: 'The final circuit crosses several dusty pockets; conserve just enough speed for the last burn.',
    powerScale: 1.08,
    dustClouds: [
      { position: polar(3.8, -122), radius: 1.0, drag: 0.66, orbitAngularSpeed: 0.05 },
      { position: polar(6.2, 36), radius: 1.22, drag: 0.56, orbitAngularSpeed: -0.05 },
      { position: polar(8.6, 10), radius: 1.05, drag: 0.46, orbitAngularSpeed: 0.04 },
    ],
  },
];

const DYING_WORLD_SPECS = [
  { baseId: 'first-arc', id: 'decay-arc', name: 'Decay Arc', summary: 'The launch world is already falling inward, so the clean bend changes every second.', goalOpenSecondsDelta: -1 },
  { baseId: 'fast-window', id: 'sinking-window', name: 'Sinking Window', summary: 'The fast lane is no longer stable; wait too long and the planet has dropped into a tighter spiral.', decayScale: 1.08, goalOpenSecondsDelta: -1 },
  { baseId: 'first-relay', id: 'collapsing-relay', name: 'Collapsing Relay', summary: 'Both relay worlds drift toward the sun, shortening the handoff while you aim.', decayScale: 1.05, goalOpenSecondsDelta: -1 },
  { baseId: 'hot-giant', id: 'falling-giant', name: 'Falling Giant', summary: 'The unsafe giant is spiraling inward, dragging the bend with it instead of holding a stable guard lane.', decayScale: 1.1 },
  { baseId: 'inner-step', id: 'infall-step', name: 'Infall Step', summary: 'The inner start keeps sinking, so the outer relay must be reached before the system tightens.', decayScale: 1.12, goalOpenSecondsDelta: -1 },
  { baseId: 'forked-harbor', id: 'failing-harbor', name: 'Failing Harbor', summary: 'The two harbors are falling at different rates, turning a forked route into a moving collapse.', decayScale: 1.18, goalOpenSecondsDelta: -1 },
  { baseId: 'moon-catch', id: 'decaying-moon', name: 'Decaying Moon', summary: 'The moon still catches cleanly, but its parent orbit is sinking toward the sun throughout the route.', decayScale: 1.14, goalOpenSecondsDelta: -1 },
  { baseId: 'crown-window', id: 'crown-collapse', name: 'Crown Collapse', summary: 'The crown worlds spiral inward while the north relay window narrows into the sun.', decayScale: 1.22, goalOpenSecondsDelta: -1 },
  { baseId: 'counterspin-gate', id: 'counterfall-gate', name: 'Counterfall Gate', summary: 'Counterspin still helps, but every guard and runway is on a slow inward fall.', decayScale: 1.26 },
  { baseId: 'final-circuit', id: 'terminal-circuit', name: 'Terminal Circuit', summary: 'The final dying system is all pressure: the circuit falls inward from the first touch to the last burn.', decayScale: 1.3, goalOpenSecondsDelta: -1 },
];

const FLICKER_WORLD_SPECS = [
  {
    baseId: 'first-relay',
    id: 'blink-relay',
    name: 'Blink Relay',
    summary: 'The outer relay blinks away on its ring. Launch while it is solid, or wait for the return beat.',
    tutorial: { type: 'flicker', copy: 'Flicker rings count down to a planet vanishing or returning.' },
    flicker: { 1: { periodSeconds: 6.4, visibleSeconds: 4.5, phaseSeconds: 0.25 } },
  },
  {
    baseId: 'inner-step',
    id: 'phase-step',
    name: 'Phase Step',
    summary: 'The middle and outer relays alternate. Use the first while it exists, then leave as the next one returns.',
    flicker: {
      1: { periodSeconds: 5.8, visibleSeconds: 3.0, phaseSeconds: 0.15 },
      2: { periodSeconds: 5.8, visibleSeconds: 3.0, phaseSeconds: 3.05 },
    },
  },
  {
    baseId: 'forked-harbor',
    id: 'stagger-harbor',
    name: 'Stagger Harbor',
    summary: 'Both harbors work, but their clocks are offset. Pick the side whose return lines up with the exit.',
    flicker: {
      1: { periodSeconds: 6.2, visibleSeconds: 3.2, phaseSeconds: 0.4 },
      2: { periodSeconds: 6.2, visibleSeconds: 3.2, phaseSeconds: 3.45 },
      3: { periodSeconds: 7.0, visibleSeconds: 4.2, phaseSeconds: 1.1 },
    },
  },
  {
    baseId: 'moon-switch',
    id: 'blink-switch',
    name: 'Blink Switch',
    summary: 'The switch world is only solid on alternating beats with its moon. Time the catch before waking the rim.',
    flicker: {
      1: { periodSeconds: 5.6, visibleSeconds: 2.8, phaseSeconds: 2.8 },
      2: { periodSeconds: 5.6, visibleSeconds: 3.0, phaseSeconds: 0.3 },
      4: { periodSeconds: 6.4, visibleSeconds: 3.5, phaseSeconds: 1.7 },
    },
  },
  {
    baseId: 'long-transfer',
    id: 'relay-lanterns',
    name: 'Relay Lanterns',
    summary: 'The long transfer becomes a lantern chain: the first relay fades as the far station lights back up.',
    flicker: {
      1: { periodSeconds: 6.0, visibleSeconds: 3.0, phaseSeconds: 0.2 },
      2: { periodSeconds: 6.0, visibleSeconds: 3.1, phaseSeconds: 3.05 },
      4: { periodSeconds: 7.2, visibleSeconds: 4.0, phaseSeconds: 1.0 },
    },
  },
  {
    baseId: 'halo-run',
    id: 'halo-beacons',
    name: 'Halo Beacons',
    summary: 'A wide halo route pulses in pairs. Relay through the lit side instead of chasing a vanished dock.',
    flicker: {
      1: { periodSeconds: 6.4, visibleSeconds: 3.2, phaseSeconds: 0.5 },
      3: { periodSeconds: 6.4, visibleSeconds: 3.2, phaseSeconds: 3.7 },
      4: { periodSeconds: 7.4, visibleSeconds: 3.8, phaseSeconds: 1.2 },
    },
  },
  {
    baseId: 'moon-catch',
    id: 'phase-moon',
    name: 'Phase Moon',
    summary: 'The moon and relay blink on opposite halves of the clock, turning the catch into a relay handoff.',
    flicker: {
      1: { periodSeconds: 5.8, visibleSeconds: 3.0, phaseSeconds: 2.9 },
      2: { periodSeconds: 5.8, visibleSeconds: 3.0, phaseSeconds: 0.05 },
      3: { periodSeconds: 6.8, visibleSeconds: 3.6, phaseSeconds: 1.4 },
    },
  },
  {
    baseId: 'crown-window',
    id: 'crown-flash',
    name: 'Crown Flash',
    summary: 'The crown no longer stays built. Read the countdowns and send the ball through the active rim.',
    flicker: {
      1: { periodSeconds: 6.2, visibleSeconds: 3.0, phaseSeconds: 0.1 },
      2: { periodSeconds: 6.2, visibleSeconds: 3.1, phaseSeconds: 3.25 },
      3: { periodSeconds: 7.0, visibleSeconds: 3.4, phaseSeconds: 1.7 },
    },
  },
  {
    baseId: 'counterspin-gate',
    id: 'counterblink-gate',
    name: 'Counterblink Gate',
    summary: 'Counterspin still sets the angle, but the recovery gate phases out if you leave too late.',
    flicker: {
      1: { periodSeconds: 5.7, visibleSeconds: 3.0, phaseSeconds: 0.35 },
      3: { periodSeconds: 6.5, visibleSeconds: 3.3, phaseSeconds: 3.1 },
      4: { periodSeconds: 7.0, visibleSeconds: 3.8, phaseSeconds: 1.25 },
    },
  },
  {
    baseId: 'final-circuit',
    id: 'flicker-circuit',
    name: 'Flicker Circuit',
    summary: 'The full circuit alternates in relays. Move through the active planets and leave before each countdown expires.',
    flicker: {
      1: { periodSeconds: 5.8, visibleSeconds: 3.0, phaseSeconds: 0.25 },
      2: { periodSeconds: 5.8, visibleSeconds: 3.0, phaseSeconds: 3.15 },
      3: { periodSeconds: 6.8, visibleSeconds: 3.5, phaseSeconds: 1.1 },
    },
  },
];

const ASTEROID_WORLD_SPECS = [
  {
    id: 'belt-gap',
    name: 'Belt Gap',
    summary: 'A circular asteroid belt surrounds the sun. Shoot outward through one of the rotating gaps.',
    seed: 1,
    startAnchor: polar(3.06, 28),
    goalCenter: polar(9.2, 28),
    goalPullRadius: 3.2,
    goalPullStrength: 6.4,
    launchPresets: [{ angleDeg: 28, power: 2.05 }],
    belts: [{ orbitRadius: 5.1, gapAngles: [28, 148, -92], gapWidthDeg: 42, angularSpeed: 0.14 }],
    planets: [
      { name: 'Inner Tee', position: polar(2.4, 28), radius: 0.7, gravity: 4.8, falloff: 3.2, core: 0x75bfff, glow: 0x9fe1ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: 0.05 },
    ],
    outerPlanets: [
      { name: 'Right Catch', position: polar(6.55, 44), radius: 0.56, gravity: 5.0, falloff: 3.3, core: 0xf2a366, glow: 0xffd18a, landable: true, landingRadius: 0.9, orbitAngularSpeed: 0.08, orbitEccentricity: 0.04, spinAngularSpeed: 0.08 },
    ],
  },
  {
    id: 'drifting-gap',
    name: 'Drifting Gap',
    preferRelay: true,
    summary: 'The belt rotates quickly, so the first clean launch aims ahead of the visible opening.',
    seed: 2,
    startAnchor: polar(3.02, -34),
    goalCenter: polar(9.15, -30),
    launchPresets: [{ angleDeg: -12, power: 2.0 }, { angleDeg: 28, power: 1.75 }],
    belts: [{ orbitRadius: 5.15, gapAngles: [-8, 52, 132, -128], gapWidthDeg: 40, angularSpeed: 0.16 }],
    planets: [
      { name: 'Low Tee', position: polar(2.36, -34), radius: 0.7, gravity: 4.9, falloff: 3.2, core: 0x76c4ff, glow: 0xa2e4ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: 0.05 },
    ],
    outerPlanets: [
      { name: 'Low Catch', position: polar(6.45, -12), radius: 0.5, gravity: 4.6, falloff: 3.0, core: 0xf6a76a, glow: 0xffd38d, landable: true, landingRadius: 0.84, orbitAngularSpeed: 0.08, spinAngularSpeed: -0.08 },
      { name: 'High Catch', position: polar(6.9, 34), radius: 0.48, gravity: 4.4, falloff: 2.9, core: 0x9f8cff, glow: 0xd4cbff, landable: true, landingRadius: 0.82, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.08 },
    ],
  },
  {
    id: 'inner-slot',
    name: 'Inner Slot',
    preferRelay: true,
    summary: 'Stay inside the ring until the low slot lines up, then fire through the belt.',
    seed: 3,
    startAnchor: polar(3.0, 48),
    goalCenter: polar(7.55, 48),
    launchPresets: [{ angleDeg: 70, power: 2.0 }, { angleDeg: 36, power: 1.8 }],
    belts: [{ orbitRadius: 5.0, gapAngles: [72, 142, -38, -128], gapWidthDeg: 38, angularSpeed: -0.15 }],
    planets: [
      { name: 'North Tee', position: polar(2.34, 48), radius: 0.7, gravity: 4.9, falloff: 3.2, core: 0x76c4ff, glow: 0xa2e4ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: -0.05 },
    ],
    outerPlanets: [
      { name: 'Near Ledge', position: polar(6.35, 70), radius: 0.52, gravity: 4.8, falloff: 3.1, core: 0xf1a366, glow: 0xffd28a, landable: true, landingRadius: 0.86, orbitAngularSpeed: -0.07, spinAngularSpeed: 0.08 },
      { name: 'Far Ledge', position: polar(7.0, 36), radius: 0.44, gravity: 4.0, falloff: 2.8, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 0.76, orbitAngularSpeed: -0.07, spinAngularSpeed: -0.08 },
    ],
  },
  {
    id: 'twin-gaps',
    name: 'Twin Gaps',
    preferRelay: true,
    summary: 'Two openings rotate around the ring, but the shallower gap gives the cleaner finish.',
    seed: 4,
    startAnchor: polar(3.02, 32),
    goalCenter: polar(9.05, 28),
    launchPresets: [{ angleDeg: 54, power: 2.0 }, { angleDeg: -28, power: 1.9 }],
    belts: [{ orbitRadius: 5.18, gapAngles: [54, -28, 118, -152], gapWidthDeg: 38, angularSpeed: 0.17 }],
    planets: [
      { name: 'Split Tee', position: polar(2.36, 32), radius: 0.7, gravity: 4.8, falloff: 3.1, core: 0x75bfff, glow: 0x9fe1ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: 0.05 },
    ],
    outerPlanets: [
      { name: 'Upper Harbor', position: polar(6.45, 54), radius: 0.54, gravity: 4.8, falloff: 3.2, core: 0xf2a366, glow: 0xffd18a, landable: true, landingRadius: 0.88, orbitAngularSpeed: 0.07, spinAngularSpeed: -0.08 },
      { name: 'Lower Harbor', position: polar(6.95, -28), radius: 0.54, gravity: 4.8, falloff: 3.2, core: 0x8f82ff, glow: 0xc9c2ff, landable: true, landingRadius: 0.88, orbitAngularSpeed: 0.07, spinAngularSpeed: 0.08 },
    ],
  },
  {
    id: 'narrow-orbit',
    name: 'Narrow Orbit',
    preferRelay: true,
    summary: 'The belt is tighter and faster; the route is a compact shot through a narrow rotating aperture.',
    seed: 5,
    startAnchor: polar(2.92, -38),
    goalCenter: polar(8.9, -32),
    launchPresets: [{ angleDeg: -8, power: 1.95 }, { angleDeg: -50, power: 2.0 }],
    belts: [{ orbitRadius: 4.75, count: 42, radius: 0.21, gapAngles: [-8, 54, 124, -50, -128], gapWidthDeg: 34, angularSpeed: 0.2 }],
    planets: [
      { name: 'Tight Tee', position: polar(2.26, -38), radius: 0.7, gravity: 4.9, falloff: 3.2, core: 0x79c6ff, glow: 0xa7e6ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: 0.05 },
    ],
    outerPlanets: [
      { name: 'Needle Catch', position: polar(6.1, -8), radius: 0.42, gravity: 3.8, falloff: 2.7, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 0.74, orbitAngularSpeed: 0.07, spinAngularSpeed: 0.08 },
      { name: 'Wide Catch', position: polar(6.9, -50), radius: 0.56, gravity: 5.0, falloff: 3.3, core: 0xf6a76a, glow: 0xffd58f, landable: true, landingRadius: 0.9, orbitAngularSpeed: 0.07, spinAngularSpeed: -0.08 },
    ],
  },
  {
    id: 'relay-through',
    name: 'Relay Through',
    preferRelay: true,
    summary: 'Land on the inner relay, then wait for the orbiting belt gap to sweep into the exit line.',
    seed: 6,
    startAnchor: polar(2.92, -58),
    goalCenter: polar(9.2, 8),
    startPlanetIndex: 0,
    launchPresets: [{ angleDeg: -36, power: 2.0 }, { angleDeg: 8, power: 1.9 }],
    belts: [{ orbitRadius: 5.05, gapAngles: [-36, 42, 118, -122], gapWidthDeg: 40, angularSpeed: 0.18 }],
    planets: [
      { name: 'Belt Relay', position: polar(2.26, -58), radius: 0.7, gravity: 5.2, falloff: 3.5, core: 0xf2a366, glow: 0xffd18a, landable: true, landingRadius: 1.12, orbitAngularSpeed: 0, spinAngularSpeed: -0.08 },
    ],
    outerPlanets: [
      { name: 'Exit Relay', position: polar(6.45, -36), radius: 0.58, gravity: 5.2, falloff: 3.4, core: 0x8f81ff, glow: 0xc8c0ff, landable: true, landingRadius: 0.92, orbitAngularSpeed: 0.08, spinAngularSpeed: 0.08 },
      { name: 'Far Dock', position: polar(7.05, 8), radius: 0.46, gravity: 4.2, falloff: 2.8, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 0.78, orbitAngularSpeed: 0.08, spinAngularSpeed: -0.08 },
    ],
  },
  {
    id: 'double-ring',
    name: 'Double Ring',
    preferRelay: true,
    summary: 'Two circular belts rotate at different speeds, leaving a shared corridor only when both gaps agree.',
    seed: 7,
    startAnchor: polar(3.0, 12),
    goalCenter: polar(9.45, 18),
    launchPresets: [{ angleDeg: 36, power: 2.0 }, { angleDeg: 4, power: 1.9 }],
    belts: [
      { orbitRadius: 4.7, count: 38, radius: 0.18, gapAngles: [36, 96, 156, -144, -84, -24], gapWidthDeg: 46, angularSpeed: 0.16 },
      { orbitRadius: 6.0, count: 46, radius: 0.18, gapAngles: [40, 100, 160, -140, -80, -20], gapWidthDeg: 46, angularSpeed: -0.13 },
    ],
    planets: [
      { name: 'Cross Tee', position: polar(2.34, 12), radius: 0.7, gravity: 4.8, falloff: 3.1, core: 0x77c1ff, glow: 0xa4e4ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: 0.05 },
    ],
    outerPlanets: [
      { name: 'Inner-Ring Catch', position: polar(7.3, 36), radius: 0.48, gravity: 4.5, falloff: 3.0, core: 0xf6a76a, glow: 0xffd58f, landable: true, landingRadius: 0.82, orbitAngularSpeed: 0.07, spinAngularSpeed: -0.08 },
      { name: 'Outer-Ring Catch', position: polar(7.85, 4), radius: 0.5, gravity: 4.6, falloff: 3.0, core: 0x9f8cff, glow: 0xd4cbff, landable: true, landingRadius: 0.84, orbitAngularSpeed: 0.07, spinAngularSpeed: 0.08 },
      { name: 'Side Shepherd', position: polar(8.35, -38), radius: 0.38, gravity: 3.6, falloff: 2.6, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 0.7, orbitAngularSpeed: 0.07, spinAngularSpeed: 0.08 },
    ],
  },
  {
    id: 'sunward-slot',
    name: 'Sunward Slot',
    preferRelay: true,
    summary: 'The rotating ring tempts an outside shot, but the clean slot is closer to the sunward side.',
    seed: 8,
    startAnchor: polar(3.02, 62),
    goalCenter: polar(9.05, 12),
    launchPresets: [{ angleDeg: 32, power: 2.0 }, { angleDeg: 72, power: 1.9 }],
    belts: [{ orbitRadius: 5.12, gapAngles: [32, 112, -168, -88], gapWidthDeg: 40, angularSpeed: -0.18 }],
    planets: [
      { name: 'High Tee', position: polar(2.36, 62), radius: 0.7, gravity: 4.8, falloff: 3.1, core: 0x79c4ff, glow: 0xa5e5ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: -0.05 },
    ],
    outerPlanets: [
      { name: 'Sunward Catch', position: polar(6.45, 32), radius: 0.5, gravity: 4.7, falloff: 3.0, core: 0xf1a366, glow: 0xffd28a, landable: true, landingRadius: 0.84, orbitAngularSpeed: -0.11, orbitEccentricity: 0.04, spinAngularSpeed: 0.08 },
      { name: 'Rim Catch', position: polar(6.85, 72), radius: 0.54, gravity: 4.8, falloff: 3.2, core: 0x8f82ff, glow: 0xc9c2ff, landable: true, landingRadius: 0.88, orbitAngularSpeed: 0.07, orbitEccentricity: 0.03, spinAngularSpeed: -0.08 },
    ],
  },
  {
    id: 'offset-maze',
    name: 'Offset Maze',
    preferRelay: true,
    summary: 'Three nested belts make a circular maze; the route works only through the staggered moving gaps.',
    seed: 9,
    startAnchor: polar(2.95, -72),
    goalCenter: polar(9.55, -62),
    launchPresets: [{ angleDeg: -42, power: 1.95 }, { angleDeg: -8, power: 1.85 }],
    belts: [
      { orbitRadius: 4.2, count: 34, radius: 0.17, gapAngles: [-42, 18, 78, 138, -162, -102], gapWidthDeg: 48, angularSpeed: 0.17 },
      { orbitRadius: 5.25, count: 40, radius: 0.18, gapAngles: [-38, 22, 82, 142, -158, -98], gapWidthDeg: 48, angularSpeed: -0.15 },
      { orbitRadius: 6.25, count: 48, radius: 0.17, gapAngles: [-34, 26, 86, 146, -154, -94], gapWidthDeg: 48, angularSpeed: 0.12 },
    ],
    planets: [
      { name: 'Maze Tee', position: polar(2.29, -72), radius: 0.7, gravity: 4.8, falloff: 3.1, core: 0x78c2ff, glow: 0xa5e3ff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: 0.05 },
    ],
    outerPlanets: [
      { name: 'First Exit', position: polar(7.5, -42), radius: 0.48, gravity: 4.5, falloff: 3.0, core: 0xf6a76a, glow: 0xffd58f, landable: true, landingRadius: 0.82, orbitAngularSpeed: 0.07, spinAngularSpeed: -0.08 },
      { name: 'Second Exit', position: polar(8.05, -8), radius: 0.5, gravity: 4.6, falloff: 3.0, core: 0x9f8cff, glow: 0xd4cbff, landable: true, landingRadius: 0.84, orbitAngularSpeed: 0.07, spinAngularSpeed: 0.08 },
      { name: 'Outer Exit', position: polar(8.55, 34), radius: 0.44, gravity: 4.0, falloff: 2.8, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 0.76, orbitAngularSpeed: 0.07, spinAngularSpeed: -0.08 },
    ],
  },
  {
    id: 'belt-gauntlet',
    name: 'Belt Gauntlet',
    preferRelay: true,
    summary: 'The final field stacks two rotating belts and a relay setup before the last clean gate.',
    seed: 10,
    startAnchor: polar(3.0, 42),
    goalCenter: polar(9.6, 28),
    launchPresets: [{ angleDeg: 18, power: 2.0 }, { angleDeg: 48, power: 1.85 }],
    belts: [
      { orbitRadius: 4.9, count: 40, radius: 0.18, gapAngles: [18, 108, -162, -72], gapWidthDeg: 42, angularSpeed: 0.18 },
      { orbitRadius: 6.15, count: 48, radius: 0.18, gapAngles: [48, 138, -132, -42], gapWidthDeg: 42, angularSpeed: -0.15 },
    ],
    planets: [
      { name: 'Gauntlet Tee', position: polar(2.34, 42), radius: 0.7, gravity: 4.9, falloff: 3.2, core: 0x73bcff, glow: 0x94ddff, landable: true, orbitAngularSpeed: 0, spinAngularSpeed: -0.05 },
    ],
    outerPlanets: [
      { name: 'Gate Relay', position: polar(7.45, 18), radius: 0.52, gravity: 4.8, falloff: 3.1, core: 0xf2a366, glow: 0xffd18a, landable: true, landingRadius: 0.86, orbitAngularSpeed: 0.07, spinAngularSpeed: 0.08 },
      { name: 'Crown Relay', position: polar(7.95, 48), radius: 0.5, gravity: 4.6, falloff: 3.0, core: 0x8f81ff, glow: 0xc8c0ff, landable: true, landingRadius: 0.84, orbitAngularSpeed: 0.07, spinAngularSpeed: -0.08 },
      { name: 'Far Shepherd', position: polar(8.45, -18), radius: 0.4, gravity: 3.7, falloff: 2.6, core: 0xc0c7d6, glow: 0xf4f8ff, landable: true, landingRadius: 0.72, orbitAngularSpeed: 0.07, spinAngularSpeed: 0.08 },
    ],
  },
];

const SUPERNOVA_WORLD_SPECS = [
  {
    baseId: 'first-relay',
    id: 'red-giant-arc',
    name: 'Red Giant Relay',
    summary: 'The inner launch world is quickly swallowed, but the outer relay stays safe long enough for a clean escape.',
    growSeconds: 10.8,
    endRadius: 1.56,
    tutorial: {
      type: 'red-giant',
      copy: 'The sun grows over time. Close planets are consumed.',
    },
  },
  { baseId: 'shielded-arc', id: 'swelling-window', name: 'Swelling Shield', summary: 'The shield planet blocks the easy lane while the red giant steadily erases the inside shortcut.', growSeconds: 10.0, endRadius: 1.72 },
  { baseId: 'forked-harbor', id: 'engulfed-relay', name: 'Engulfed Harbor', summary: 'Several harbor worlds survive at different ranges, but the nearest one disappears if the route stalls.', growSeconds: 9.8, endRadius: 1.86 },
  { baseId: 'periapsis-moon', id: 'giant-swell', name: 'Moon Swell', summary: 'A moon relay keeps orbiting while the swollen star turns the periapsis touch into a short-lived option.', growSeconds: 9.4, endRadius: 1.9 },
  { baseId: 'inner-step', id: 'burnout-step', name: 'Burnout Step', summary: 'Step outward before the red giant reaches the start planet, then leave the relay cleanly.', growSeconds: 9.2, endRadius: 1.94 },
  { baseId: 'moon-switch', id: 'red-switch', name: 'Red Switch', summary: 'The switch route is playable only if the first touch happens before the inner system is engulfed.', growSeconds: 9.0, endRadius: 2.02 },
  { baseId: 'false-periapsis', id: 'perihelion-flare', name: 'Perihelion Flare', summary: 'The tempting close relay is disappearing under the swelling star, so timing matters from launch.', growSeconds: 8.8, endRadius: 2.08 },
  { baseId: 'crown-window', id: 'crown-inferno', name: 'Crown Inferno', summary: 'The crown worlds keep their rhythm while the red giant eats the inner recovery path.', growSeconds: 8.6, endRadius: 2.16 },
  { baseId: 'counterspin-gate', id: 'counterflare-gate', name: 'Counterflare Gate', summary: 'Counterspin can still save the exit, but the star expands into the middle of the gate.', growSeconds: 8.4, endRadius: 2.22 },
  { baseId: 'final-circuit', id: 'supernova-circuit', name: 'Supernova Circuit', summary: 'The last route is a full relay circuit raced against a red giant swallowing the close worlds.', growSeconds: 8.2, endRadius: 2.32 },
];

const METEOR_WORLD_SPECS = [
  {
    baseId: 'open-lane',
    id: 'first-impact',
    name: 'First Impact',
    summary: 'A meteor breaks the far marker world. Watch the strike, then take the open lane.',
    meteorImpacts: [
      { targetPlanetIndex: 0, impactTimeSeconds: 6.2, warningSeconds: 5.2, approachAngleDeg: -84, startDistance: 10, radius: 0.2 },
      { impactTimeSeconds: 8.6, warningSeconds: 4.4, start: polar(11.8, -36), target: polar(11.6, 42), destroysPlanet: false, radius: 0.16 },
    ],
  },
  {
    baseId: 'hot-giant',
    id: 'cleared-giant',
    name: 'Cleared Giant',
    summary: 'The hostile giant blocks the bend until the meteor erases its gravity well.',
    meteorImpacts: [
      { targetPlanetIndex: 0, impactTimeSeconds: 3.8, warningSeconds: 3.8, approachAngleDeg: 86, startDistance: 10, radius: 0.22 },
      { impactTimeSeconds: 7.4, warningSeconds: 4.2, start: polar(12.0, -54), target: polar(11.5, -6), destroysPlanet: false, radius: 0.15 },
    ],
    launchPresets: [{ angleDeg: 18, power: 2.18 }],
  },
  {
    baseId: 'fast-window',
    id: 'meteor-gate',
    name: 'Meteor Gate',
    summary: 'No planet is hit yet. Read the passing shower and launch through the moving gap.',
    meteorImpacts: [
      { impactTimeSeconds: 4.2, warningSeconds: 4.2, start: polar(12.0, -36), target: polar(10.8, 28), destroysPlanet: false, radius: 0.17 },
      { impactTimeSeconds: 6.8, warningSeconds: 4.6, start: polar(11.7, 54), target: polar(10.9, -12), destroysPlanet: false, radius: 0.16 },
    ],
    cleanupStartSeconds: 13.4,
  },
  {
    baseId: 'first-relay',
    id: 'last-platform',
    name: 'Last Platform',
    preferRelay: true,
    summary: 'The launch world will not survive. Leave it, catch the relay, and finish before the cleanup wave.',
    meteorImpacts: [
      { targetPlanetIndex: 0, impactTimeSeconds: 5.2, warningSeconds: 4.8, approachAngleDeg: -18, startDistance: 9.6, radius: 0.2 },
      { impactTimeSeconds: 8.2, warningSeconds: 4.4, start: polar(11.8, 72), target: polar(10.8, 14), destroysPlanet: false, radius: 0.16 },
    ],
    cleanupStartSeconds: 14.2,
  },
  {
    baseId: 'inner-step',
    id: 'relay-impact',
    name: 'Relay Impact',
    summary: 'Use the outer relay, but do not wait there after the incoming meteor commits.',
    meteorImpacts: [
      { targetPlanetIndex: 1, impactTimeSeconds: 9.4, warningSeconds: 4.2, approachAngleDeg: 76, startDistance: 10, radius: 0.22 },
      { impactTimeSeconds: 5.8, warningSeconds: 3.8, start: polar(11.7, -58), target: polar(10.8, 8), destroysPlanet: false, radius: 0.15 },
    ],
  },
  {
    baseId: 'forked-harbor',
    id: 'broken-harbor',
    name: 'Broken Harbor',
    summary: 'One harbor is bait because the shower removes it mid-route; the other stays playable.',
    meteorImpacts: [
      { targetPlanetIndex: 1, impactTimeSeconds: 5.8, warningSeconds: 4.4, approachAngleDeg: -108, startDistance: 10, radius: 0.2 },
      { impactTimeSeconds: 9.8, warningSeconds: 4.8, start: polar(12.0, 66), target: polar(11.2, 18), destroysPlanet: false, radius: 0.16 },
    ],
  },
  {
    baseId: 'shielded-arc',
    id: 'shieldfall',
    name: 'Shieldfall',
    summary: 'Wait for the shield world to shatter, then slip through the lane it was warping.',
    meteorImpacts: [
      { targetPlanetIndex: 0, impactTimeSeconds: 4.6, warningSeconds: 4.6, approachAngleDeg: 158, startDistance: 10, radius: 0.24 },
      { impactTimeSeconds: 8.8, warningSeconds: 4.4, start: polar(11.8, -48), target: polar(11.0, 20), destroysPlanet: false, radius: 0.15 },
    ],
  },
  {
    baseId: 'moon-switch',
    id: 'falling-moon',
    name: 'Falling Moon',
    summary: 'The small moon relay disappears on schedule, so the switch route must happen early.',
    meteorImpacts: [
      { targetPlanetIndex: 3, impactTimeSeconds: 7.0, warningSeconds: 5.0, approachAngleDeg: -60, startDistance: 10, radius: 0.18 },
      { impactTimeSeconds: 10.2, warningSeconds: 4.6, start: polar(11.9, 58), target: polar(10.9, 8), destroysPlanet: false, radius: 0.16 },
    ],
  },
  {
    baseId: 'counterspin-gate',
    id: 'impact-gate',
    name: 'Impact Gate',
    summary: 'A meteor opens the middle of the counterspin gate, but the exit relay will not wait forever.',
    meteorImpacts: [
      { targetPlanetIndex: 4, impactTimeSeconds: 4.8, warningSeconds: 4.8, approachAngleDeg: -86, startDistance: 10, radius: 0.22 },
      { targetPlanetIndex: 2, impactTimeSeconds: 10.0, warningSeconds: 5.6, approachAngleDeg: -44, startDistance: 10, radius: 0.18 },
      { impactTimeSeconds: 7.6, warningSeconds: 4.0, start: polar(12.0, 62), target: polar(11.0, 22), destroysPlanet: false, radius: 0.15 },
    ],
  },
  {
    baseId: 'final-circuit',
    id: 'meteor-circuit',
    name: 'Meteor Circuit',
    summary: 'The full circuit becomes a survival route: leave doomed relays and use the lane after impact.',
    meteorImpacts: [
      { targetPlanetIndex: 3, impactTimeSeconds: 4.4, warningSeconds: 4.4, approachAngleDeg: -50, startDistance: 10, radius: 0.22 },
      { targetPlanetIndex: 1, impactTimeSeconds: 8.8, warningSeconds: 5.2, approachAngleDeg: 82, startDistance: 10, radius: 0.2 },
      { targetPlanetIndex: 2, impactTimeSeconds: 12.2, warningSeconds: 5.8, approachAngleDeg: -8, startDistance: 10, radius: 0.2 },
      { impactTimeSeconds: 6.8, warningSeconds: 4.0, start: polar(12.1, -60), target: polar(11.2, -8), destroysPlanet: false, radius: 0.15 },
    ],
  },
];

const EXPANSION_LEVEL_DEFINITIONS = [
  ...ICY_WORLD_SPECS.map((spec) => makeIcyVariant(spec)),
  ...PORTAL_WORLD_SPECS.map((spec) => makePortalVariant(spec)),
  ...BINARY_WORLD_SPECS.map((spec) => makeBinaryVariant(spec)),
  ...TWIN_PLANET_WORLD_SPECS.map((spec) => makeTwinPlanetVariant(spec)),
  ...ANCIENT_WORLD_SPECS.map((spec) => makeAncientVariant(spec)),
  ...SPLIT_WORLD_SPECS.map((spec) => makeSplitVariant(spec)),
  ...LAVA_WORLD_SPECS.map((spec) => makeLavaVariant(spec)),
  ...PULSAR_WORLD_SPECS.map((spec) => makePulsarVariant(spec)),
  ...DYING_WORLD_SPECS.map((spec, index) => makeDyingVariant(spec, index)),
  ...FLICKER_WORLD_SPECS.map((spec) => makeFlickerVariant(spec)),
  ...HOSTILE_WORLD_SPECS.map((spec) => makeHostileVariant(spec)),
  ...ASTEROID_WORLD_SPECS.map((spec) => makeAsteroidBeltLevel(spec)),
  ...SUPERNOVA_WORLD_SPECS.map((spec, index) => makeSupernovaVariant(spec, index)),
  ...DUST_WORLD_SPECS.map((spec) => makeDustVariant(spec)),
  ...METEOR_WORLD_SPECS.map((spec) => makeMeteorVariant(spec)),
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
  'twin-lane',
  'twin-arc',
  'twin-relay',
  'eclipse-twins',
  'swift-twins',
  'sweep-twins',
  'hot-twins',
  'locked-twins',
  'shield-twins',
  'guarded-twins',
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
  'ember-window',
  'melt-harbor',
  'cinder-step',
  'basalt-switch',
  'scorch-periapsis',
  'magma-halo',
  'firebreak',
  'pyre-moon',
  'lava-window',
  'eruption-circuit',
  'belt-gap',
  'drifting-gap',
  'inner-slot',
  'twin-gaps',
  'narrow-orbit',
  'relay-through',
  'double-ring',
  'sunward-slot',
  'offset-maze',
  'belt-gauntlet',
  'dust-drift',
  'silt-window',
  'veil-relay',
  'powder-harbor',
  'brownout-step',
  'dust-switch',
  'nebula-transfer',
  'cloud-halo',
  'crown-haze',
  'dust-circuit',
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
  'blink-relay',
  'phase-step',
  'stagger-harbor',
  'blink-switch',
  'relay-lanterns',
  'halo-beacons',
  'phase-moon',
  'crown-flash',
  'counterblink-gate',
  'flicker-circuit',
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
  'pulse-arc',
  'strobe-window',
  'beacon-relay',
  'eclipse-pulse',
  'lighthouse-transfer',
  'pulse-switch',
  'crown-beacon',
  'guarded-pulsar',
  'counterpulse-gate',
  'pulsar-circuit',
  'sentry-arc',
  'watch-relay',
  'gun-harbor',
  'crossfire-step',
  'launcher-switch',
  'battery-transfer',
  'siege-halo',
  'sentry-switch',
  'flak-gate',
  'hostile-circuit',
  'decay-arc',
  'sinking-window',
  'collapsing-relay',
  'falling-giant',
  'infall-step',
  'failing-harbor',
  'decaying-moon',
  'crown-collapse',
  'counterfall-gate',
  'terminal-circuit',
  'red-giant-arc',
  'swelling-window',
  'engulfed-relay',
  'giant-swell',
  'burnout-step',
  'red-switch',
  'perihelion-flare',
  'crown-inferno',
  'counterflare-gate',
  'supernova-circuit',
  'first-impact',
  'cleared-giant',
  'meteor-gate',
  'last-platform',
  'relay-impact',
  'shieldfall',
  'broken-harbor',
  'falling-moon',
  'impact-gate',
  'meteor-circuit',
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

export function getPlanetFlickerState(planet, time = 0) {
  const flicker = planet?.flicker;
  if (!flicker) {
    return {
      active: true,
      visible: 1,
      progress: 1,
      mode: 'steady',
      timeRemaining: Number.POSITIVE_INFINITY,
    };
  }

  const periodSeconds = Math.max(0.4, flicker.periodSeconds ?? 5.6);
  const visibleSeconds = clamp(flicker.visibleSeconds ?? periodSeconds * 0.55, 0.08, periodSeconds - 0.08);
  const hiddenSeconds = Math.max(0.08, periodSeconds - visibleSeconds);
  const transitionSeconds = Math.max(0.001, Math.min(flicker.transitionSeconds ?? 0.32, Math.min(visibleSeconds, hiddenSeconds) * 0.5));
  const phaseTime = ((time - (flicker.phaseSeconds ?? 0)) % periodSeconds + periodSeconds) % periodSeconds;
  const active = phaseTime < visibleSeconds;
  const segmentTime = active ? phaseTime : phaseTime - visibleSeconds;
  const segmentDuration = active ? visibleSeconds : hiddenSeconds;
  const timeRemaining = Math.max(0, segmentDuration - segmentTime);
  let visible = active ? 1 : 0;

  if (active && timeRemaining < transitionSeconds) {
    visible = clamp(timeRemaining / transitionSeconds, 0, 1);
  } else if (!active && timeRemaining < transitionSeconds) {
    visible = clamp(1 - timeRemaining / transitionSeconds, 0, 1);
  }

  return {
    active,
    visible,
    progress: clamp(segmentTime / segmentDuration, 0, 1),
    mode: active ? 'visible' : 'hidden',
    timeRemaining,
  };
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

function asteroidPositionAtTime(asteroid, sun, time) {
  const angleDeg = (asteroid.baseAngleDeg ?? asteroid.position?.angleDeg ?? 0)
    + (asteroid.orbitAngularSpeed ?? 0) * time * 180 / Math.PI;
  const direction = directionFromAngleDeg(angleDeg);
  const orbitRadius = asteroid.orbitRadius ?? asteroid.position?.radius ?? 0;
  return vec(sun.x + direction.x * orbitRadius, sun.y + direction.y * orbitRadius);
}

function getMeteorTargetPosition(level, meteor, time, orbitStateCache = new Map()) {
  if (meteor.target) {
    return cloneVec(meteor.target);
  }

  if (meteor.targetPlanetIndex !== null && meteor.targetPlanetIndex !== undefined) {
    const targetPlanet = level.planets[meteor.targetPlanetIndex];
    if (targetPlanet) {
      return cloneVec(getOrbitState(level, meteor.targetPlanetIndex, time, orbitStateCache).position);
    }
  }

  return cloneVec(meteor.target ?? level.sun ?? vec(0, 0));
}

function updateMeteorImpactState(level, meteor, time, orbitStateCache = new Map()) {
  const warningSeconds = Math.max(0.001, meteor.warningSeconds ?? DEFAULT_METEOR_WARNING_SECONDS);
  const impactTime = meteor.impactTimeSeconds ?? warningSeconds;
  const startTime = impactTime - warningSeconds;
  const progress = clamp((time - startTime) / warningSeconds, 0, 1);
  const targetPosition = getMeteorTargetPosition(level, meteor, impactTime, orbitStateCache);

  meteor.targetPosition = targetPosition;

  if (meteor.destroysPlanet === false && meteor.periodSeconds) {
    const periodSeconds = Math.max(0.001, meteor.periodSeconds);
    const phaseSeconds = meteor.phaseSeconds ?? 0;
    const cycleTime = ((time - phaseSeconds) % periodSeconds + periodSeconds) % periodSeconds;
    const cycleProgress = clamp(cycleTime / periodSeconds, 0, 1);
    meteor.position.x = meteor.start.x + (targetPosition.x - meteor.start.x) * cycleProgress;
    meteor.position.y = meteor.start.y + (targetPosition.y - meteor.start.y) * cycleProgress;
    meteor.progress = cycleProgress;
    meteor.active = true;
    meteor.impacted = false;
    return;
  }

  meteor.position.x = meteor.start.x + (targetPosition.x - meteor.start.x) * progress;
  meteor.position.y = meteor.start.y + (targetPosition.y - meteor.start.y) * progress;
  meteor.progress = progress;
  meteor.active = time >= startTime && time < impactTime;
  meteor.impacted = time >= impactTime;

  if (meteor.targetPlanetIndex === null || meteor.targetPlanetIndex === undefined) {
    return;
  }

  const targetPlanet = level.planets[meteor.targetPlanetIndex];
  if (!targetPlanet || meteor.destroysPlanet === false) {
    return;
  }

  const impactPlanetPosition = getOrbitState(level, meteor.targetPlanetIndex, impactTime, new Map()).position;
  const hitRadius = (meteor.impactRadius ?? DEFAULT_METEOR_IMPACT_RADIUS) + (targetPlanet.radius ?? 0);
  const hitTargetPlanet = distanceBetween(targetPosition, impactPlanetPosition) <= hitRadius;

  if (meteor.impacted) {
    if (hitTargetPlanet) {
      targetPlanet.position.x = impactPlanetPosition.x;
      targetPlanet.position.y = impactPlanetPosition.y;
      targetPlanet.active = false;
      targetPlanet.destroyedByMeteor = true;
      targetPlanet.meteorDestroyedAt = impactTime;
      targetPlanet.infallFade = 0;
      targetPlanet.collapseState = 'meteor-destroyed';
    }
  } else if (targetPlanet.destroyedByMeteor) {
    delete targetPlanet.destroyedByMeteor;
    delete targetPlanet.meteorDestroyedAt;
  }
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

function getOrbitDecayScale(body, time = 0) {
  if (!body?.orbitDecayRate || !body.orbitSemiMajor) {
    return 1;
  }

  const elapsed = Math.max(0, time);
  const minimumRadius = clamp(
    body.orbitMinRadius ?? body.orbitSemiMajor * 0.35,
    0.001,
    body.orbitSemiMajor,
  );
  const decayDistance = body.orbitSemiMajor - minimumRadius;
  const timeToMinimum = decayDistance / Math.max(0.000001, body.orbitDecayRate);
  const fallProgress = clamp(elapsed / Math.max(0.001, timeToMinimum), 0, 1);
  const acceleratedProgress = fallProgress ** 1.55;
  const decayedRadius = body.orbitSemiMajor - decayDistance * acceleratedProgress;
  return decayedRadius / body.orbitSemiMajor;
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

  const deltaTime = 0.0005;
  const anomaly = wrapAngleRad(body.orbitPhase + time * body.orbitSpeed);
  const nextAnomaly = wrapAngleRad(body.orbitPhase + (time + deltaTime) * body.orbitSpeed);
  const offset = getOrbitOffset(body, anomaly, time);
  const nextOffset = getOrbitOffset(body, nextAnomaly, time + deltaTime);
  const velocityOffset = vec(
    (nextOffset.x - offset.x) / deltaTime,
    (nextOffset.y - offset.y) / deltaTime,
  );
  return {
    position: vec(
      orbitCenter.x + offset.x,
      orbitCenter.y + offset.y,
    ),
    velocity: vec(
      velocityOffset.x,
      velocityOffset.y,
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

function getOrbitOffset(planet, anomaly, time = 0) {
  if (!planet.orbitSemiMajor || !planet.orbitSpeed) {
    return vec(0, 0);
  }

  const decayScale = getOrbitDecayScale(planet, time);
  const orbitSemiMajor = planet.orbitSemiMajor * decayScale;
  const orbitSemiMinor = planet.orbitSemiMinor * decayScale;

  if (planet.orbitEccentricity < 0.000001) {
    return rotateVector(
      vec(
        Math.cos(anomaly) * orbitSemiMajor,
        Math.sin(anomaly) * orbitSemiMajor,
      ),
      planet.orbitRotation ?? 0,
    );
  }

  const eccentricAnomaly = solveKeplerEquation(anomaly, planet.orbitEccentricity);
  return rotateVector(
    vec(
      orbitSemiMajor * (Math.cos(eccentricAnomaly) - planet.orbitEccentricity),
      orbitSemiMinor * Math.sin(eccentricAnomaly),
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

  const deltaTime = 0.0005;
  const meanAnomaly = wrapAngleRad(planet.orbitPhase + time * planet.orbitSpeed);
  const nextMeanAnomaly = wrapAngleRad(planet.orbitPhase + (time + deltaTime) * planet.orbitSpeed);
  const offset = getOrbitOffset(planet, meanAnomaly, time);
  const nextOffset = getOrbitOffset(planet, nextMeanAnomaly, time + deltaTime);
  const velocityOffset = vec(
    (nextOffset.x - offset.x) / deltaTime,
    (nextOffset.y - offset.y) / deltaTime,
  );
  const state = {
    position: vec(
      orbitCenter.x + offset.x,
      orbitCenter.y + offset.y,
    ),
    velocity: vec(
      centerVelocity.x + velocityOffset.x,
      centerVelocity.y + velocityOffset.y,
    ),
    orbitCenter,
  };
  cache.set(planetIndex, state);
  return state;
}

export function getRedGiantProgress(level, time = level?.time ?? 0) {
  if (!level?.redGiant) {
    return 0;
  }

  const startTime = level.redGiant.startTimeSeconds ?? level.startTimeSeconds ?? 0;
  const growSeconds = Math.max(0.001, level.redGiant.growSeconds ?? DEFAULT_RED_GIANT_GROW_SECONDS);
  return clamp((time - startTime) / growSeconds, 0, 1);
}

export function getPrimarySunCollisionRadius(level, time = level?.time ?? 0) {
  const baseRadius = level?.primarySunBody?.collisionRadius ?? SUN_COLLISION_RADIUS;
  if (!level?.redGiant) {
    return baseRadius;
  }

  const startRadius = level.redGiant.startRadius ?? baseRadius;
  const endRadius = level.redGiant.endRadius ?? DEFAULT_RED_GIANT_END_RADIUS;
  const progress = getRedGiantProgress(level, time);
  const ease = progress * progress * (3 - 2 * progress);
  return startRadius + (endRadius - startRadius) * ease;
}

export function getPrimarySunVisualRadius(level, time = level?.time ?? 0) {
  const collisionRadius = getPrimarySunCollisionRadius(level, time);
  return Math.max(collisionRadius, level?.primarySunBody?.radius ?? SUN_COLLISION_RADIUS);
}

function getPlanetSunEngulfRadius(level, planet) {
  if (!level?.redGiant || planet?.redGiantVulnerable === false) {
    return planet?.fallIntoSunRadius;
  }

  return getPrimarySunCollisionRadius(level) + (planet.radius ?? 0.4) * 0.72;
}

function updatePlanetCollapseState(level, planet) {
  if (planet?.hidden) {
    planet.active = true;
    planet.infallFade = 0;
    planet.collapseState = 'hidden';
    return;
  }

  const dynamicEngulfRadius = getPlanetSunEngulfRadius(level, planet);
  if (!dynamicEngulfRadius) {
    planet.active = true;
    planet.infallFade = 1;
    planet.collapseState = 'stable';
    return;
  }

  const currentTime = level.time ?? 0;
  const sunDistance = distanceBetween(planet.position, level.sun);
  const fallRadius = Math.max(0.001, dynamicEngulfRadius);
  const fadeStartRadius = Math.max(fallRadius + 0.001, planet.sunFadeStartRadius ?? fallRadius + planet.radius * 2.2 + 0.45);
  const plungeDuration = planet.sunPlungeDuration ?? 0.82;

  if (planet.plungeStartTime !== undefined && currentTime < planet.plungeStartTime - 0.0001) {
    delete planet.plungeStartTime;
    delete planet.plungeStartPosition;
    planet.collapseState = 'orbiting';
  }

  if (planet.plungeStartTime === undefined && sunDistance <= fallRadius) {
    planet.plungeStartTime = currentTime;
    planet.plungeStartPosition = cloneVec(planet.position);
    planet.plungeStartRadius = sunDistance;
    planet.plungeStartAngle = Math.atan2(planet.position.y - level.sun.y, planet.position.x - level.sun.x);
    planet.plungeDirection = (planet.orbitSpeed ?? 0) < 0 ? -1 : 1;
  }

  if (planet.plungeStartTime !== undefined) {
    const rawProgress = clamp((currentTime - planet.plungeStartTime) / plungeDuration, 0, 1);
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const startRadius = Math.max(0.001, planet.plungeStartRadius ?? sunDistance);
    const radius = startRadius * (1 - progress);
    const angle = (planet.plungeStartAngle ?? 0) + (planet.plungeDirection ?? 1) * rawProgress * Math.PI * 1.45;
    planet.position.x = level.sun.x + Math.cos(angle) * radius;
    planet.position.y = level.sun.y + Math.sin(angle) * radius;
    planet.infallFade = rawProgress >= 1 ? 0 : 1;
    planet.active = false;
    planet.collapseState = rawProgress >= 1 ? 'consumed' : 'plunging';
    return;
  }

  const accelerationCue = clamp((fadeStartRadius - sunDistance) / (fadeStartRadius - fallRadius), 0, 1);
  planet.infallFade = 1;
  planet.infallStress = accelerationCue;
  planet.active = true;
  planet.collapseState = 'orbiting';
}

function updatePlanetFlickerState(level, planet) {
  if (!planet.flicker || planet.collapseState === 'consumed' || planet.collapseState === 'plunging') {
    if (!planet.flicker) {
      planet.flickerProgress = 1;
      planet.flickerMode = 'steady';
      planet.flickerTimeRemaining = Number.POSITIVE_INFINITY;
    }
    return;
  }

  const flickerState = getPlanetFlickerState(planet, level.time ?? 0);
  planet.active = flickerState.active;
  planet.flickerVisibility = flickerState.visible;
  planet.flickerProgress = flickerState.progress;
  planet.flickerMode = flickerState.mode;
  planet.flickerTimeRemaining = flickerState.timeRemaining;
  planet.infallFade = Math.min(planet.infallFade ?? 1, flickerState.visible);
  planet.collapseState = flickerState.active ? 'stable' : 'phased-out';
}

function separateActivePlanetOverlaps(level) {
  if (level.systemState !== 'dying') {
    return;
  }

  for (let pass = 0; pass < 3; pass += 1) {
    for (let leftIndex = 0; leftIndex < level.planets.length; leftIndex += 1) {
      const left = level.planets[leftIndex];
      if (left.active === false || left.hidden) {
        continue;
      }

      for (let rightIndex = leftIndex + 1; rightIndex < level.planets.length; rightIndex += 1) {
        const right = level.planets[rightIndex];
        if (right.active === false || right.hidden) {
          continue;
        }

        const minimumDistance = left.radius + right.radius + 0.08;
        const delta = vec(right.position.x - left.position.x, right.position.y - left.position.y);
        const distance = length(delta);
        if (distance >= minimumDistance) {
          continue;
        }

        const normal = distance > 0.000001
          ? vec(delta.x / distance, delta.y / distance)
          : directionFromAngleDeg((leftIndex * 137.5 + rightIndex * 51.3) % 360);
        const overlap = minimumDistance - Math.max(distance, 0.000001);
        const leftMass = Math.max(0.001, left.radius ** 2);
        const rightMass = Math.max(0.001, right.radius ** 2);
        const totalMass = leftMass + rightMass;
        const leftShare = rightMass / totalMass;
        const rightShare = leftMass / totalMass;

        left.position.x -= normal.x * overlap * leftShare;
        left.position.y -= normal.y * overlap * leftShare;
        right.position.x += normal.x * overlap * rightShare;
        right.position.y += normal.y * overlap * rightShare;
        left.collisionPulse = Math.max(left.collisionPulse ?? 0, clamp(overlap / minimumDistance, 0, 1));
        right.collisionPulse = Math.max(right.collisionPulse ?? 0, clamp(overlap / minimumDistance, 0, 1));
      }
    }
  }
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
    planet.collisionPulse = 0;
    const orbitState = getOrbitState(level, planet.index, time, orbitStateCache);
    planet.position.x = orbitState.position.x;
    planet.position.y = orbitState.position.y;
    planet.orbitCenter.x = orbitState.orbitCenter.x;
    planet.orbitCenter.y = orbitState.orbitCenter.y;
    updatePlanetCollapseState(level, planet);
    updatePlanetFlickerState(level, planet);
  });
  separateActivePlanetOverlaps(level);
  level.planets.forEach((planet) => {
    updatePlanetCollapseState(level, planet);
    updatePlanetFlickerState(level, planet);
  });
  level.portals?.forEach((portal) => {
    setOrbitalBodyTime(portal, time, systemCenter);
  });
  level.dustClouds?.forEach((cloud) => {
    setOrbitalBodyTime(cloud, time, systemCenter);
  });
  level.asteroids?.forEach((asteroid) => {
    const position = asteroidPositionAtTime(asteroid, systemCenter, time);
    asteroid.position.x = position.x;
    asteroid.position.y = position.y;
  });
  level.meteorImpacts?.forEach((meteor) => {
    updateMeteorImpactState(level, meteor, time, orbitStateCache);
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

function getBallHeatValue(ball) {
  return clamp(ball?.heat ?? 0, 0, BALL_HEAT_MAX);
}

export function getBallHeatRatio(ball) {
  return getBallHeatValue(ball) / BALL_HEAT_MAX;
}

function getPlanetLavaHeatRate(planet) {
  if (!planet || planet.surfaceType !== 'lava') {
    return 0;
  }

  const safeSeconds = Math.max(0.5, planet.lavaSafeSeconds ?? LAVA_DEFAULT_SAFE_SECONDS);
  return BALL_HEAT_MAX / safeSeconds;
}

export function getLavaOverheatRemaining(planet, ball) {
  const heatRate = getPlanetLavaHeatRate(planet);
  if (!(heatRate > 0)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, (BALL_HEAT_MAX - getBallHeatValue(ball)) / heatRate);
}

function updateBallHeat(level, ball, delta) {
  const anchorPlanet = (
    ball.anchorPlanetIndex !== null
    && ball.anchorPlanetIndex !== undefined
  ) ? level.planets[ball.anchorPlanetIndex] : null;

  let nextHeat = getBallHeatValue(ball);
  if (anchorPlanet?.surfaceType === 'lava') {
    nextHeat += getPlanetLavaHeatRate(anchorPlanet) * delta;
  } else {
    const coolRate = anchorPlanet ? BALL_HEAT_COOL_RATE_ANCHORED : BALL_HEAT_COOL_RATE_FLIGHT;
    nextHeat -= coolRate * delta;
  }

  ball.heat = clamp(nextHeat, 0, BALL_HEAT_MAX);

  if (
    delta > 0
    && anchorPlanet?.surfaceType === 'lava'
    && ball.heat >= BALL_HEAT_MAX - 0.000001
  ) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return {
      type: 'crash',
      reason: 'lava',
      planetIndex: ball.anchorPlanetIndex,
      planetName: anchorPlanet.name ?? 'lava world',
      eventState,
      displayEventState: cloneBallRuntimeState(eventState),
    };
  }

  return null;
}

export function getPlanetVelocity(level, planetIndex, time = level.time ?? 0) {
  const planet = level.planets[planetIndex];
  if (!planet || planet.collapseState === 'consumed' || planet.active === false) {
    return vec(0, 0);
  }

  return cloneVec(getOrbitState(level, planetIndex, time).velocity);
}

export function advanceBallAnchor(level, ball, delta) {
  if (ball.anchorPlanetIndex === null || ball.anchorPlanetIndex === undefined) {
    return null;
  }

  const planet = level.planets[ball.anchorPlanetIndex];
  if (!planet || planet.collapseState === 'consumed' || planet.active === false) {
    const eventState = cloneBallRuntimeState(ball);
    const reason = planet?.destroyedByMeteor
      ? 'meteor'
      : planet?.active === false && planet?.flicker
        ? 'planet-vanished'
        : 'planet-consumed';
    ball.anchorPlanetIndex = null;
    ball.anchorNormal = null;
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return {
      type: 'crash',
      reason,
      planetIndex: planet?.index ?? null,
      planetName: planet?.name ?? 'vanishing planet',
      eventState,
      displayEventState: cloneBallRuntimeState(eventState),
    };
  }

  const previousPosition = cloneVec(ball.position);

  if (planet.spinSpeed) {
    ball.anchorNormal = normalize(rotateVector(ball.anchorNormal ?? vec(1, 0), planet.spinSpeed * delta));
  }
  const slideAngularSpeed = getPlanetSlideAngularSpeed(planet, ball);
  if (slideAngularSpeed) {
    ball.anchorNormal = normalize(rotateVector(ball.anchorNormal ?? vec(1, 0), slideAngularSpeed * delta));
  }

  syncBallToAnchor(level, ball);
  const meteorContactResult = resolveMeteorContact(level, ball);
  if (meteorContactResult) {
    return meteorContactResult;
  }

  const turretContactResult = resolveTurretSightContact(level, ball, previousPosition);
  if (turretContactResult) {
    return turretContactResult;
  }

  return updateBallHeat(level, ball, delta);
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
  if (!planet || planet.active === false || (!planet.spinSpeed && !planet.slideAngularSpeed)) {
    return vec(0, 0);
  }

  const normal = normalize(anchorNormal ?? vec(1, 0));
  const tangent = vec(-normal.y, normal.x);
  const speed = getBallSurfaceRadius(planet) * ((planet.spinSpeed ?? 0) + getPlanetSlideAngularSpeed(planet, ball));
  return vec(tangent.x * speed, tangent.y * speed);
}

export function getPulsarJetState(level, time = level.time ?? 0) {
  const jets = level?.pulsarJets;
  if (!jets) {
    return null;
  }

  const periodSeconds = Math.max(0.2, jets.periodSeconds ?? DEFAULT_PULSAR_JET_PERIOD);
  const activeSeconds = clamp(jets.activeSeconds ?? DEFAULT_PULSAR_JET_ACTIVE_SECONDS, 0, periodSeconds);
  const phaseTime = ((time - (jets.phaseSeconds ?? 0)) % periodSeconds + periodSeconds) % periodSeconds;
  const active = phaseTime <= activeSeconds;
  const activity = activeSeconds > 0
    ? clamp(1 - Math.abs((phaseTime / activeSeconds) * 2 - 1), 0, 1)
    : 0;
  const angleRad = ((jets.angleDeg ?? 0) + (jets.angularSpeedDeg ?? 0) * time) * Math.PI / 180;
  const direction = vec(Math.cos(angleRad), Math.sin(angleRad));

  return {
    active,
    activity,
    phaseTime,
    periodSeconds,
    activeSeconds,
    direction,
    length: jets.length ?? DEFAULT_PULSAR_JET_LENGTH,
    width: jets.width ?? DEFAULT_PULSAR_JET_WIDTH,
    innerRadius: jets.innerRadius ?? DEFAULT_PULSAR_JET_INNER_RADIUS,
  };
}

export function isPointInPulsarJets(level, point, time = level.time ?? 0) {
  const state = getPulsarJetState(level, time);
  if (!state?.active) {
    return false;
  }

  const fromSun = vec(point.x - level.sun.x, point.y - level.sun.y);
  const alongAxis = fromSun.x * state.direction.x + fromSun.y * state.direction.y;
  const radialDistance = Math.abs(alongAxis);
  if (radialDistance < state.innerRadius || radialDistance > state.length) {
    return false;
  }

  const perpendicularDistance = Math.abs(fromSun.x * -state.direction.y + fromSun.y * state.direction.x);
  const coneProgress = clamp((radialDistance - state.innerRadius) / Math.max(0.001, state.length - state.innerRadius), 0, 1);
  const coneHalfWidth = state.width * (0.45 + coneProgress * 1.2);
  return perpendicularDistance <= coneHalfWidth + COURSE.ballRadius * 0.78;
}

function isSegmentInPulsarJets(level, fromPoint, toPoint, time = level.time ?? 0) {
  if (!fromPoint) {
    return isPointInPulsarJets(level, toPoint, time);
  }

  const distance = distanceBetween(fromPoint, toPoint);
  const samples = Math.max(
    2,
    Math.ceil(distance / Math.max(0.08, COURSE.ballRadius * 0.42)),
    PULSAR_SEGMENT_COLLISION_SAMPLES,
  );

  for (let sampleIndex = 0; sampleIndex <= samples; sampleIndex += 1) {
    const t = sampleIndex / samples;
    const samplePoint = vec(
      fromPoint.x + (toPoint.x - fromPoint.x) * t,
      fromPoint.y + (toPoint.y - fromPoint.y) * t,
    );
    if (isPointInPulsarJets(level, samplePoint, time)) {
      return true;
    }
  }

  return false;
}

export function getTurretLineState(planet, turret, time = 0) {
  const localAngle = (turret?.angleDeg ?? 0) + (planet?.spinSpeed ?? 0) * time * 180 / Math.PI;
  const direction = directionFromAngleDeg(localAngle);
  const muzzleDistance = (planet?.radius ?? 0) + COURSE.ballRadius * 0.32;
  const start = vec(
    planet.position.x + direction.x * muzzleDistance,
    planet.position.y + direction.y * muzzleDistance,
  );
  const end = vec(
    start.x + direction.x * (turret?.range ?? DEFAULT_TURRET_RANGE),
    start.y + direction.y * (turret?.range ?? DEFAULT_TURRET_RANGE),
  );
  return {
    start,
    end,
    direction,
    width: turret?.width ?? DEFAULT_TURRET_LINE_WIDTH,
  };
}

function distanceSqPointToSegment(point, segmentStart, segmentEnd) {
  const segment = vec(segmentEnd.x - segmentStart.x, segmentEnd.y - segmentStart.y);
  const segmentLengthSq = lengthSq(segment);
  if (segmentLengthSq < 0.000001) {
    return lengthSq(vec(point.x - segmentStart.x, point.y - segmentStart.y));
  }
  const t = clamp(
    ((point.x - segmentStart.x) * segment.x + (point.y - segmentStart.y) * segment.y) / segmentLengthSq,
    0,
    1,
  );
  const closest = vec(segmentStart.x + segment.x * t, segmentStart.y + segment.y * t);
  return lengthSq(vec(point.x - closest.x, point.y - closest.y));
}

function orientation(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function isPointOnSegment(point, segmentStart, segmentEnd) {
  const epsilon = 0.000001;
  return (
    point.x >= Math.min(segmentStart.x, segmentEnd.x) - epsilon
    && point.x <= Math.max(segmentStart.x, segmentEnd.x) + epsilon
    && point.y >= Math.min(segmentStart.y, segmentEnd.y) - epsilon
    && point.y <= Math.max(segmentStart.y, segmentEnd.y) + epsilon
    && Math.abs(orientation(segmentStart, segmentEnd, point)) <= epsilon
  );
}

function segmentsIntersect(a, b, c, d) {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  const epsilon = 0.000001;

  if (Math.abs(abC) <= epsilon && isPointOnSegment(c, a, b)) {
    return true;
  }
  if (Math.abs(abD) <= epsilon && isPointOnSegment(d, a, b)) {
    return true;
  }
  if (Math.abs(cdA) <= epsilon && isPointOnSegment(a, c, d)) {
    return true;
  }
  if (Math.abs(cdB) <= epsilon && isPointOnSegment(b, c, d)) {
    return true;
  }

  return (
    ((abC > 0 && abD < 0) || (abC < 0 && abD > 0))
    && ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0))
  );
}

function distanceSqBetweenSegments(a, b, c, d) {
  if (segmentsIntersect(a, b, c, d)) {
    return 0;
  }
  return Math.min(
    distanceSqPointToSegment(a, c, d),
    distanceSqPointToSegment(b, c, d),
    distanceSqPointToSegment(c, a, b),
    distanceSqPointToSegment(d, a, b),
  );
}

function resolveTurretSightContact(level, ball, previousPosition) {
  if (!previousPosition) {
    return null;
  }

  const time = ball.time ?? level.time ?? 0;
  for (let planetIndex = 0; planetIndex < level.planets.length; planetIndex += 1) {
    const planet = level.planets[planetIndex];
    if (planet.active === false || planet.hidden) {
      continue;
    }
    for (const turret of planet.turrets ?? []) {
      const lineState = getTurretLineState(planet, turret, time);
      const hitWidth = lineState.width + COURSE.ballRadius * 0.42;
      if (distanceSqBetweenSegments(previousPosition, ball.position, lineState.start, lineState.end) > hitWidth * hitWidth) {
        continue;
      }

      const eventState = cloneBallRuntimeState(ball);
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      return {
        type: 'crash',
        reason: 'turret',
        planetIndex,
        planetName: planet.name ?? 'hostile planet',
        turret,
        eventState,
        displayEventState: cloneBallRuntimeState(eventState),
      };
    }
  }

  return null;
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
    heat: ball.heat ?? 0,
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
      turrets: Array.isArray(planet.turrets)
        ? planet.turrets.map((turret, turretIndex) => ({
          ...normalizeTurret(turret, turretIndex),
          range: (turret.range ?? DEFAULT_TURRET_RANGE) * PLANET_RADIUS_SCALE,
          width: (turret.width ?? DEFAULT_TURRET_LINE_WIDTH) * PLANET_RADIUS_SCALE,
        }))
        : [],
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
  const dustClouds = Array.isArray(source.dustClouds)
    ? source.dustClouds.map((cloud, cloudIndex) => ({
      ...createOrbitalBodyRuntime(normalizeDustCloud(cloud, cloudIndex), systemCenter, cloudIndex),
      radius: cloud.radius ?? DEFAULT_DUST_CLOUD_RADIUS,
      drag: cloud.drag ?? DEFAULT_DUST_CLOUD_DRAG,
      opacity: cloud.opacity ?? 1,
    }))
    : [];
  const asteroids = Array.isArray(source.asteroids)
    ? source.asteroids.map((asteroid, asteroidIndex) => ({
      ...asteroid,
      index: asteroidIndex,
      radius: asteroid.radius ?? 0.22,
      orbitRadius: asteroid.orbitRadius ?? asteroid.position?.radius ?? 0,
      baseAngleDeg: asteroid.baseAngleDeg ?? asteroid.position?.angleDeg ?? 0,
      orbitAngularSpeed: asteroid.orbitAngularSpeed ?? 0,
      position: scalePointFromSun(pointFromPolar(asteroid.position), systemCenter),
      spinSpeed: asteroid.spinSpeed ?? 0.24,
      color: asteroid.color ?? 0x8d929a,
    }))
    : [];
  const meteorImpacts = Array.isArray(source.meteorImpacts)
    ? source.meteorImpacts.map((meteor, meteorIndex) => {
      const impactTimeSeconds = meteor.impactTimeSeconds ?? DEFAULT_METEOR_WARNING_SECONDS;
      const targetPlanetIndex = meteor.targetPlanetIndex ?? null;
      const meteorLevelContext = {
        planets,
        sun: cloneVec(primarySunBody?.basePosition ?? systemCenter),
        systemCenter,
        primarySunBody,
        secondarySunBody,
        extraSuns,
      };
      const target = meteor.target
        ? scalePointFromSun(pointFromPolar(meteor.target), systemCenter)
        : targetPlanetIndex !== null
          ? cloneVec(getOrbitState(meteorLevelContext, targetPlanetIndex, impactTimeSeconds).position)
          : null;
      const start = meteor.start
        ? scalePointFromSun(pointFromPolar(meteor.start), systemCenter)
        : target
          ? (() => {
            const approach = directionFromAngleDeg(meteor.approachAngleDeg ?? 0);
            const distance = meteor.startDistance ?? 8.5;
            return vec(target.x - approach.x * distance, target.y - approach.y * distance);
          })()
          : scalePointFromSun(pointFromPolar(polar(11.5, meteor.approachAngleDeg ?? 0)), systemCenter);

      return {
        ...meteor,
        index: meteorIndex,
        radius: meteor.radius ?? DEFAULT_METEOR_RADIUS,
        impactRadius: meteor.impactRadius ?? DEFAULT_METEOR_IMPACT_RADIUS,
        warningSeconds: meteor.warningSeconds ?? DEFAULT_METEOR_WARNING_SECONDS,
        impactTimeSeconds,
        destroysPlanet: meteor.destroysPlanet ?? true,
        killsAnchoredBall: meteor.killsAnchoredBall ?? true,
        start,
        target,
        targetPlanetIndex,
        position: vec(0, 0),
        targetPosition: vec(0, 0),
        color: meteor.color ?? 0xffa05f,
        trailColor: meteor.trailColor ?? 0xffd28a,
      };
    })
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
    sunGravityStrength: source.sunGravityStrength ?? FIXED_SOLAR_GRAVITY_STRENGTH,
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
    dustClouds,
    asteroids,
    meteorImpacts,
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
    heat: 0,
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
  if (!planet || planet.collapseState === 'consumed' || planet.active === false) {
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
    if (!planet.landable || planet.active === false || planet.hidden) {
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
    if (planet.hidden) {
      continue;
    }

    if (planet.active === false) {
      if (ball.launchGracePlanetIndex === index) {
        ball.launchGracePlanetIndex = null;
      }
      continue;
    }

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

function resolveAsteroidContact(level, ball) {
  for (const asteroid of level.asteroids ?? []) {
    const touchRadius = (asteroid.radius ?? 0.22) + COURSE.ballRadius * PLANET_COLLISION_PADDING;
    if (distanceBetween(ball.position, asteroid.position) <= touchRadius) {
      const eventState = cloneBallRuntimeState(ball);
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      return {
        type: 'crash',
        reason: 'asteroid',
        asteroidIndex: asteroid.index,
        eventState,
        displayEventState: cloneBallRuntimeState(eventState),
      };
    }
  }

  return null;
}

function resolveMeteorContact(level, ball) {
  for (const meteor of level.meteorImpacts ?? []) {
    if (!meteor.active) {
      continue;
    }

    const touchRadius = (meteor.radius ?? DEFAULT_METEOR_RADIUS) + COURSE.ballRadius * PLANET_COLLISION_PADDING;
    if (distanceBetween(ball.position, meteor.position) <= touchRadius) {
      const eventState = cloneBallRuntimeState(ball);
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      return {
        type: 'crash',
        reason: 'meteor',
        meteorIndex: meteor.index,
        planetIndex: meteor.targetPlanetIndex ?? null,
        eventState,
        displayEventState: cloneBallRuntimeState(eventState),
        crashTargetPosition: cloneVec(meteor.position),
      };
    }
  }

  return null;
}

function resolveSunContact(level, ball, previousPosition = null) {
  if (isSegmentInPulsarJets(level, previousPosition, ball.position, ball.time ?? level.time ?? 0)) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'crash', reason: 'pulsar', eventState, displayEventState: cloneBallRuntimeState(eventState) };
  }

  const touchRadius = getPrimarySunCollisionRadius(level, ball.time ?? level.time ?? 0) + COURSE.ballRadius * PLANET_COLLISION_PADDING;
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
    if (planet.active === false || planet.hidden) {
      continue;
    }

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
    { position: level.sun, gravityStrength: level.primarySunBody?.gravityStrength ?? level.sunGravityStrength ?? FIXED_SOLAR_GRAVITY_STRENGTH },
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

function getDustDragFactorAtPoint(level, point, delta) {
  let dragFactor = 1;

  for (const cloud of level.dustClouds ?? []) {
    const radius = Math.max(0.001, cloud.radius ?? DEFAULT_DUST_CLOUD_RADIUS);
    const distance = distanceBetween(point, cloud.position);
    if (distance >= radius + COURSE.ballRadius) {
      continue;
    }

    const depth = clamp(1 - distance / radius, 0, 1);
    const drag = Math.max(0, cloud.drag ?? DEFAULT_DUST_CLOUD_DRAG) * DUST_CLOUD_DRAG_MULTIPLIER;
    dragFactor *= Math.exp(-drag * (0.34 + depth * 0.66) * delta);
  }

  return dragFactor;
}

function getBallFriction(level, point, delta) {
  return Math.pow(BALL_FRICTION_BASE, delta * 60) * getDustDragFactorAtPoint(level, point, delta);
}

export function stepBall(level, ball, delta) {
  if (
    ball.anchorPlanetIndex !== null
    && ball.anchorPlanetIndex !== undefined
    && (
      level.planets[ball.anchorPlanetIndex]?.collapseState === 'consumed'
      || level.planets[ball.anchorPlanetIndex]?.destroyedByMeteor
      || level.planets[ball.anchorPlanetIndex]?.active === false
    )
  ) {
    const eventState = cloneBallRuntimeState(ball);
    const consumedPlanet = level.planets[ball.anchorPlanetIndex];
    const reason = consumedPlanet?.destroyedByMeteor
      ? 'meteor'
      : consumedPlanet?.active === false && consumedPlanet?.flicker
        ? 'planet-vanished'
        : 'planet-consumed';
    ball.anchorPlanetIndex = null;
    ball.anchorNormal = null;
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return {
      type: 'crash',
      reason,
      planetIndex: consumedPlanet?.index ?? null,
      planetName: consumedPlanet?.name ?? 'vanishing planet',
      eventState,
      displayEventState: cloneBallRuntimeState(eventState),
    };
  }

  if (lengthSq(ball.velocity) < 0.000001) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'settled' };
  }

  const nextTime = (ball.time ?? level.time ?? 0) + delta;
  setLevelTime(level, nextTime);
  ball.time = nextTime;
  ball.portalCooldown = Math.max(0, (ball.portalCooldown ?? 0) - delta);
  updateBallHeat(level, ball, delta);

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

  const previousPosition = cloneVec(ball.position);
  addScaledVec(ball.position, ball.velocity, delta);

  const portalEvent = resolvePortalContact(level, ball);

  const postPortalGoalDistance = Math.max(distanceBetween(ball.position, level.goalCenter), 0.001);
  if (isGoalOpen(level, ball.time) && postPortalGoalDistance < level.goalRadius * GOAL_CAPTURE_RATIO) {
    const eventState = cloneBallRuntimeState(ball);
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return { type: 'goal', eventState, displayEventState: cloneBallRuntimeState(eventState), portalEvent };
  }

  const sunContactResult = resolveSunContact(level, ball, portalEvent ? null : previousPosition);
  if (sunContactResult) {
    sunContactResult.portalEvent = portalEvent;
    return sunContactResult;
  }

  const turretContactResult = resolveTurretSightContact(level, ball, portalEvent ? null : previousPosition);
  if (turretContactResult) {
    turretContactResult.portalEvent = portalEvent;
    return turretContactResult;
  }

  const contactResult = resolvePlanetContact(level, ball);
  if (contactResult) {
    contactResult.portalEvent = portalEvent;
    return contactResult;
  }

  const asteroidContactResult = resolveAsteroidContact(level, ball);
  if (asteroidContactResult) {
    asteroidContactResult.portalEvent = portalEvent;
    return asteroidContactResult;
  }

  const meteorContactResult = resolveMeteorContact(level, ball);
  if (meteorContactResult) {
    meteorContactResult.portalEvent = portalEvent;
    return meteorContactResult;
  }

  const friction = getBallFriction(level, ball.position, delta);
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
  const friction = getBallFriction(level, ball.position, delta);
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
  updateBallHeat(level, ball, -delta);

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
    heat: options.heat ?? 0,
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
          const anchorResult = advanceBallAnchor(level, ball, step);
          if (anchorResult?.type === 'crash') {
            pushFrame();
            return {
              outcome: anchorResult.type,
              reason: anchorResult.reason ?? '',
              planetIndex: anchorResult.planetIndex ?? null,
              planetName: anchorResult.planetName ?? '',
              waitTime,
              landingCount: ball.landingCount ?? 0,
              time: 0,
              steps: 0,
              finalTime: ball.time ?? launchTime,
              anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
              anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
              heat: ball.heat ?? 0,
              minGoalDistance: distanceBetween(ball.position, level.goalCenter),
              minPlanetClearance: Number.POSITIVE_INFINITY,
              finalPosition: cloneVec(ball.position),
              launchState,
              eventState: anchorResult.eventState ? cloneBallRuntimeState(anchorResult.eventState) : null,
              displayEventState: anchorResult.displayEventState ? cloneBallRuntimeState(anchorResult.displayEventState) : null,
              frames,
            };
          }
        }
        pushFrame();
        remainingWait -= step;
      }
    } else {
      const launchTime = startTime + waitTime;
      setLevelTime(level, launchTime);
      ball.time = launchTime;
      if (ball.anchorPlanetIndex !== null) {
        const anchorResult = advanceBallAnchor(level, ball, waitTime);
        if (anchorResult?.type === 'crash') {
          return {
            outcome: anchorResult.type,
            reason: anchorResult.reason ?? '',
            planetIndex: anchorResult.planetIndex ?? null,
            planetName: anchorResult.planetName ?? '',
            waitTime,
            landingCount: ball.landingCount ?? 0,
            time: 0,
            steps: 0,
            finalTime: ball.time ?? launchTime,
            anchorPlanetIndex: ball.anchorPlanetIndex ?? null,
            anchorNormal: ball.anchorNormal ? cloneVec(ball.anchorNormal) : null,
            heat: ball.heat ?? 0,
            minGoalDistance: distanceBetween(ball.position, level.goalCenter),
            minPlanetClearance: Number.POSITIVE_INFINITY,
            finalPosition: cloneVec(ball.position),
            launchState,
            eventState: anchorResult.eventState ? cloneBallRuntimeState(anchorResult.eventState) : null,
            displayEventState: anchorResult.displayEventState ? cloneBallRuntimeState(anchorResult.displayEventState) : null,
            frames,
          };
        }
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
      heat: ball.heat ?? 0,
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
      if (planet.active === false) {
        continue;
      }

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
        heat: ball.heat ?? 0,
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
    heat: ball.heat ?? 0,
    minGoalDistance,
    minPlanetClearance,
    finalPosition: cloneVec(ball.position),
    launchState,
    eventState: null,
    displayEventState: null,
    frames,
  };
}
