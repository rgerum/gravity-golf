# Spec: Level Export Format + Loader (Unity port, World 1 / levels 0–9)

Status: contract for the Node export script (`scripts/export-unity-levels.js`) and
the C# level loader. Scope: the first 10 campaign levels
(`createLevelRuntime(0..9)` in `src/game-core.js`), core mechanics only. Everything
else is listed under **Out of scope (stub behavior)** with fail-loud rules so
unsupported levels cannot load silently.

All source citations are `game-core.js:LINE`.

---

## 1. Pipeline overview

```
src/game-core.js  LEVELS[i]
   → rotateLevelSourceGoalRight(source)     // variant + goal-right normalization  (game-core.js:3186)
   → validateLevelDefinition(source)                                              (game-core.js:3310)
   → createLevelRuntime(i)                  // polar→cartesian, radius scaling,    (game-core.js:4305)
                                            // orbit/spin resolution, time=0
   → rotateRuntimeAboutSun(runtime, +90°)    // Unity portrait export: goal-up
   → export script snapshots the RUNTIME object at time 0 into JSON
   → unity/Assets/StreamingAssets/levels/world-1.json
```

The export script MUST call `createLevelRuntime(i)` and read the returned runtime
object (NOT the raw `LEVELS[i]` source). All coordinates in the export are
**resolved cartesian world coordinates at time 0** — C# never does polar→cartesian
conversion, variant generation, or `scalePointFromSun` scaling. C# DOES advance
time-dependent state (orbit position/velocity, planet spin) from the exported
orbit/spin parameters — see §6.

Because `SYSTEM_LAYOUT_SCALE === 1` (game-core.js:41) and `sun === (0,0)` for all
10 levels, `scalePointFromSun` is an identity here, but the export still emits the
already-scaled runtime values so C# needs no scaling logic.

Unity exports are portrait-oriented by default. After `createLevelRuntime(i)` has
resolved the web's goal-right landscape runtime, `scripts/unity-export-shared.js`
rotates the whole runtime by `UNITY_EXPORT_ROTATION_DEGREES` degrees about the
origin/sun; the default is `90`, which moves the goal to +Y ("up"). The same
rotated runtime is used for `world-1.json` and for forward/reverse fixture
generation, and exporter-generated absolute shot angles are offset by the same
amount. Set `UNITY_EXPORT_ROTATION_DEGREES=0` when running the export scripts to
reproduce the old landscape goal-right data.

---

## 2. Coordinate system, units, constants

- 2D plane. `x` right, `y` up. World-space units (the game's internal units; the
  playfield is ~24×14, out-of-bounds at |x|>13.8, |y|>10 — COURSE, game-core.js:1–10).
- **All positions/vectors are doubles.** The JS engine is IEEE-754 double
  (`Number`); the C# core MUST use `double`, never `float`, everywhere.
- **Angles**: the export uses **degrees** for authored/launch angles
  (`startAngleDeg`, `launchPresets[].angleDeg`) and **radians** for resolved
  orbital angles (`orbitRotation`, `orbitPhase`) and resolved angular rates
  (`orbitSpeed`, `spinSpeed` are radians/second). Each field below states its unit
  explicitly. Do not guess.
- `Math.hypot` is used for distances (game-core.js:2967). .NET `Math.Sqrt(dx*dx+dy*dy)`
  differs from V8 `Math.hypot` in the last ULP — see parity note §7.6.

Constants the loader/sim must hold (values fixed; not exported per-level unless noted):

| Constant | Value | Source | Use |
|---|---|---|---|
| `ballRadius` | `0.28` | COURSE, :4 | collision/landing/surface radius |
| `PLANET_RADIUS_SCALE` | `0.5` | :28 | already applied to exported `radius`/`landingRadius`; do NOT re-apply |
| `SUN_COLLISION_RADIUS` | `0.42` | :29 | sun collision (no binary/redGiant in world 1) |
| `PLANET_COLLISION_PADDING` | `0.92` | :20 | collision touch radius |
| `PLANET_LANDING_PADDING` | `0.03` | :21 | surface radius offset |
| `GOAL_CAPTURE_RATIO` | `0.95` | :19 | capture when dist < goalRadius*0.95 |
| `PLANET_GRAVITY_MULTIPLIER` | `2.35` | :15 | planet gravity |
| `SOLAR_GRAVITY_MULTIPLIER` | `5` | :30 | sun gravity |
| `SOLAR_GRAVITY_SOFTENING` | `3.4` | :31 | sun gravity softening |
| `LAUNCH_BASE_SPEED` | `1.9` | :35 | launch speed |
| `LAUNCH_DRAG_SPEED` | `3.4` | :36 | launch speed |
| `LAUNCH_MAX_SPEED` | `11.8` | :37 | launch speed clamp |
| `GOAL_ALWAYS_OPEN` | `true` | :40 | **goal is always open in world 1** (see §4/§6.3) |

(Gravity/collision/launch formulas themselves belong to the physics spec; they are
listed here only so the loader knows which exported fields feed them.)

---

## 3. Top-level world file schema

Path: `unity/Assets/StreamingAssets/levels/world-1.json`

One file per world. World 1 (`worldId: "starter-belt-v1"`) contains campaign
indices 0–9 (game-core.js:4460–4464, `WORLD_SIZE === 10` :72).

```jsonc
{
  "schemaVersion": 1,
  "generatedFrom": "game-core.js",              // provenance string
  "worldId": "starter-belt-v1",
  "worldName": "Starter Belt",
  "worldNumber": 1,                             // 1-based
  "worldSize": 10,
  "levels": [ <Level>, ... ]                    // exactly 10, in campaign order
}
```

`schemaVersion` MUST be `1`. The loader rejects any other value.

---

## 4. Level object schema

Field-by-field. **JSON name** is what the export emits and C# reads; **Runtime
source** is the field on the `createLevelRuntime(i)` object. "type" is the C# type.
Nullable = may be absent/null. Values below verified against levels 0–9.

| JSON name | Runtime source | C# type | Unit | Null? | Notes / source |
|---|---|---|---|---|---|
| `index` | (loop index i) | `int` | — | no | 0-based campaign index |
| `id` | `id` | `string` | — | no | e.g. `"open-lane"` (:4305 source) |
| `name` | `name` | `string` | — | no | display name |
| `worldLevelNumber` | `worldLevelNumber` | `int` | — | no | 1-based within world (:4462) |
| `sun` | `sun` | `Vec2` | world | no | always `{x:0,y:0}` for world 1 (:4469) |
| `sunGravityStrength` | `sunGravityStrength` | `double` | — | no | `20` for all 10 (:4477) |
| `sunCollisionRadius` | (constant) | `double` | world | no | emit `0.42`; = `SUN_COLLISION_RADIUS` (:29,:3662,:4725) |
| `startPlanetIndex` | `startPlanetIndex` | `int` | — | no | index into `planets` (:4473) |
| `startAngleDeg` | `startAngleDeg` | `double` | **degrees** | no | anchor normal direction on start planet (:4474,:5081) |
| `startAnchor` | `startAnchor` | `Vec2` | world | no | resolved anchor point at t0 (:4465). Note: sim re-syncs ball to planet surface (§5), so this is informational. |
| `startTimeSeconds` | `startTimeSeconds` | `double` | s | no | `0` for all 10 (:4475) |
| `goalCenter` | `goalCenter` | `Vec2` | world | no | goal center, cartesian (:4466) |
| `goalRadius` | `goalRadius` | `double` | world | no | `0.56` all 10 (:4479) |
| `goalPullRadius` | `goalPullRadius` | `double` | world | no | (:4480) |
| `goalPullStrength` | `goalPullStrength` | `double` | — | no | (:4481) |
| `goalOpenSeconds` | `goalOpenSeconds` | `double` | s | no | exported for forward-compat; **ignored by sim** because `GOAL_ALWAYS_OPEN` (§6.3) |
| `goalUnlockRequired` | `goalUnlockRequired` | `bool` | — | no | MUST be `false` for world 1; loader rejects `true` (out of scope) |
| `planets` | `planets` | `Planet[]` | — | no | see §5, ordered by distance from sun |
| `launchPresets` | `launchPresets` | `LaunchPreset[]` | — | no | see §5.2 |

`Vec2` = `{ "x": <double>, "y": <double> }`.

**Do NOT export** these level-level runtime fields (metadata, empty, or out of
scope — see §7.3 and §8): `summary`, `tutorial`, `preferRelay`, `adminSolutions`,
`binarySystem`, `extraSuns`, `portals`, `dustClouds`, `asteroids`, `meteorImpacts`,
`pulsarJets`, `worldIndex`, `worldNumber` (kept at world level), `worldName`,
`worldSize`, `worldCount`, `launchPreset` (singular convenience copy of
`launchPresets[0]`, :4467), `systemCenter`, `primarySunBody`, `secondarySunBody`,
`goalUnlocked`, `goalUnlockTime`, `time`. There is **no `par` field** on the runtime
object (verified); do not emit one.

> Optional debug aid: the export MAY emit `adminSolutions` verbatim (present only on
> level 5, game-core.js output) under a `_debugAdminSolutions` key that the C# loader
> ignores. Not required.

**Loader-synthesized defaults (not exported).** Several runtime fields the physics
core reads are deliberately NOT in the export (they are constant for world 1). The
C# loader MUST synthesize them when building the runtime:
- level `systemCenter` → `sun` position `(0,0)`
- level `time` → `0` (= `startTimeSeconds`; mutable clock advanced by the sim)
- level `goalUnlocked` → `true`
- planet `active` → `true`

See `spec-physics.md` §5.1/§5.2, which mark the same fields as loader-synthesized.

---

## 5. Planet object schema

The runtime planet is built at game-core.js:4336–4365. Radius and landingRadius are
scaled by `PLANET_RADIUS_SCALE = 0.5` in the runtime (:4345,:4350) — the export
emits the **already-scaled** values; C# must not scale again.

| JSON name | Runtime source | C# type | Unit | Null? | Notes / source |
|---|---|---|---|---|---|
| `index` | `index` | `int` | — | no | 0-based (:4348) |
| `name` | `name` | `string` | — | no | |
| `basePosition` | `basePosition` | `Vec2` | world | no | orbit reference point; also position at t0 (:4361). See §6.1. |
| `radius` | `radius` | `double` | world | no | already ×0.5 (:4349) |
| `landingRadius` | `landingRadius` | `double?` | world | yes | already ×0.5 if present; else `null` → fall back to surface radius (:4350,:4574,:4603) |
| `gravity` | `gravity` | `double` | — | no | planet gravity strength (:4827) |
| `falloff` | `falloff` | `double` | world | no | gravity cutoff distance (:4823) |
| `landable` | `landable` | `bool` | — | no | (:4612). Start planet is forced landable (:4493). |
| `orbitCenterIndex` | `orbitCenterIndex` | `int?` | — | yes | **MUST be `null` for world 1** (no moons); loader rejects non-null (§8) |
| `orbitSemiMajor` | `orbitSemiMajor` | `double` | world | no | ellipse a (:3431). Also the static-orbit guard value (§6.1). |
| `orbitSemiMinor` | `orbitSemiMinor` | `double` | world | no | ellipse b = a·√(1−e²) (:3412,:3432) |
| `orbitEccentricity` | `orbitEccentricity` | `double` | — | no | clamped 0..0.72 (:3402); world 1 max ≈0.18 |
| `orbitRotation` | `orbitRotation` | `double` | **radians** | no | ellipse orientation (:3403,:3434) |
| `orbitPhase` | `orbitPhase` | `double` | **radians** | no | mean anomaly at t0 (:3436,:3628) |
| `orbitSpeed` | `orbitSpeed` | `double` | **rad/s** | no | mean-anomaly angular rate, signed (:3435,:3628) |
| `spinSpeed` | `spinSpeed` | `double` | **rad/s** | no | surface spin, signed (:3450,:4011,:4064) |
| `core` | `core` | `int?` | 0xRRGGBB | yes | visual tint only; C# may ignore (:4347 spread). Emit as integer. |
| `glow` | `glow` | `int?` | 0xRRGGBB | yes | visual tint only; C# may ignore |

**Do NOT export** these planet runtime fields:
- `orbitAngularSpeed`, `spinAngularSpeed` — **source authoring inputs** superseded
  by the resolved `orbitSpeed`/`spinSpeed`; using them would be a bug (:4347 spread
  keeps them but `createOrbitDefaults`/`createSpinDefaults` override with the
  resolved fields).
- `orbitRadius` — duplicate of `orbitSemiMajor` (:3430). Use `orbitSemiMajor`.
- `position` — recomputed every frame from orbit params; equals `basePosition` at t0.
- `orbitCenter` — for world 1 always equals `sun` (`orbitCenterIndex===null` →
  system center → sun, :3609–3613,:3602). C# uses `sun` as the orbit anchor.
- `turrets` — empty `[]` for all 10; loader rejects non-empty (§8).
- Dynamic/visual caches: `collisionPulse`, `active`, `infallFade`, `collapseState`,
  `flickerProgress`, `flickerMode`, `flickerTimeRemaining` (:4346 region + setLevelTime
  side effects). C# recomputes `active`/collapse itself (always active in world 1).

### 5.1 Surface radius (needed by loader-adjacent collision/landing)

`getBallSurfaceRadius(planet) = planet.radius + 0.28 + 0.03` (game-core.js:3905;
`ballRadius=0.28`, `PLANET_LANDING_PADDING=0.03`; no `surfaceType` in world 1 so no
ice adjustment). Landing detection uses `landingRadius ?? surfaceRadius`
(:4574,:4603); collision touch radius uses `planet.radius + 0.28*0.92`
(:4602). These live in the physics spec; listed here to confirm which exported
fields they consume.

### 5.2 LaunchPreset schema

Runtime `launchPresets[]` (:4311–4314):

| JSON name | Runtime | C# type | Unit | Notes |
|---|---|---|---|---|
| `angleDeg` | `angleDeg` | `double` | **degrees, absolute world angle** | NOT relative to anchor normal. Converted to a shot as `angle = angleDeg·π/180` (see §7.2, test-levels.js:511). |
| `power` | `power` | `double` | drag power | Fed as `dragPower` into `launchVelocity` (:4803). |

Each level has 1–2 presets (verified). Order preserved.

---

## 6. Advancing time-dependent state (C# must replicate exactly)

At the start of each physics step the JS engine calls `setLevelTime(level, t)`
(game-core.js:3810) which repositions the sun (static here), every planet, and
other bodies. For world 1 only **planet orbit position/velocity** and **planet
spin** are time-dependent. Replicate the following exactly (bit-for-bit modulo
transcendental ULP, §7.6).

### 6.1 Planet orbit position & velocity — `getOrbitState` (game-core.js:3596–3649)

For a planet P with exported fields `a=orbitSemiMajor`, `b=orbitSemiMinor`,
`e=orbitEccentricity`, `θ=orbitRotation`, `φ=orbitPhase`, `ω=orbitSpeed`,
`base=basePosition`, and orbit center `C = sun` (world 1):

```
// static guard (:3615). For world 1 all planets have a>0 and ω!=0 → dynamic.
if (a == 0 || ω == 0):
    position = base
    velocity = (0, 0)
else:
    dt = 0.0005                                   // fixed finite-difference step (:3627)
    M      = wrap(φ + t*ω)                          // (:3628)
    Mnext  = wrap(φ + (t+dt)*ω)                     // (:3629)
    off     = orbitOffset(M)
    offNext = orbitOffset(Mnext)
    position = ( C.x + off.x , C.y + off.y )        // (:3636-3640)
    velocity = ( (offNext.x-off.x)/dt , (offNext.y-off.y)/dt )   // (:3632-3644)
```

`wrap(x)` (game-core.js:3147): `((x mod 2π) + 2π) mod 2π` (use `Math.IEEERemainder`
is WRONG; use `x % (2π)` with C# `%` then add-and-mod as written).

`orbitOffset(M)` (game-core.js:3566–3593), decayScale = 1 (no `orbitDecayRate` in
world 1, :3291–3294):

```
if (e < 1e-6):                                      // circular (:3574)
    v = ( cos(M)*a , sin(M)*a )
else:                                               // elliptical (:3585)
    E = solveKepler(M, e)
    v = ( a*(cos(E) - e) , b*sin(E) )
return rotate(v, θ)                                 // (:3576,:3586)
```

`rotate(v, θ)` (game-core.js:3263): `(v.x·cosθ − v.y·sinθ, v.x·sinθ + v.y·cosθ)`.

`solveKepler(M, e)` (game-core.js:3272): if `e < 1e-6` return `M`; else `E = M`,
iterate up to **8** times: `delta = (E − e·sin E − M) / max(1e-6, 1 − e·cos E)`;
`E -= delta`; break when `|delta| < 1e-6`. Iteration count, order, and the `1e-6`
guards must match exactly.

Note the velocity is a **forward finite difference with dt = 0.0005**, not an
analytic derivative. It must be reproduced exactly — it feeds the launch body
velocity (§7.2). At t0 (M=φ), `position === basePosition` for both circular and
elliptical cases (verified algebraically and numerically); C# may assert this as a
load-time sanity check.

### 6.2 Planet spin

Spin has no effect on the planet's *position*; it affects:
- the anchored ball riding the planet: `anchorNormal` rotates by `spinSpeed·delta`
  each step (game-core.js:4011).
- launch surface velocity: `tangent · (surfaceRadius · spinSpeed)` where
  `tangent = (−normal.y, normal.x)`, `normal = anchorNormal`,
  `surfaceRadius = getBallSurfaceRadius(planet)` (game-core.js:4056–4066).

`spinSpeed` is radians/second, signed. (Split-surface landing side, :2991, is out of
scope: no `splitSurface` in world 1.)

### 6.3 Goal timing

`GOAL_ALWAYS_OPEN === true` (:40) and every world-1 level has
`goalUnlockRequired === false` → `isGoalOpen` returns `true` for all t
(game-core.js:3891–3899). **World-1 goal is always open.** `goalOpenSeconds` is
exported but the sim ignores it. C# MUST implement `isGoalOpen(level, t) => true`
for world 1. (If a future export sets `goalUnlockRequired:true`, the loader rejects
it — §8.)

Goal capture (physics spec): captured when `distance(ball, goalCenter) <
goalRadius · 0.95` while open (:4956,:4969). Goal pull acceleration when
`goalDistance < goalPullRadius`: `goalPullStrength / (d² + 0.38)` toward goal
(:4863–4867).

---

## 7. Fixtures (parity tests)

### 7.1 File layout

One JSON file per level: `unity/tests/fixtures/level-<NN>-<id>.json`, `NN` zero-padded
2-digit index (e.g. `unity/tests/fixtures/level-00-open-lane.json` …
`level-09-inner-step.json`). The export script generates these alongside the world
file. Search passes call `simulateShot` without `captureFrames` for speed; only
kept fixture shots and sequence shots are re-simulated with `captureFrames: true`.

```jsonc
{
  "schemaVersion": 1,
  "levelIndex": 0,
  "levelId": "open-lane",
  "sampleEveryNFrames": 15,
  "delta": 0.016666666666666666,     // 1/60, the fixed sim step (:5075)
  "maxTime": 20,                     // (:5076)
  "shots": [ <ShotFixture>, ... ],
  "sequences": [ <SequenceFixture>, ... ]
}
```

### 7.2 Shot set per level (deterministic)

For each level build this exact shot list. Every single-shot fixture stores a
`source` so the C# side can tell whether it came from UI aim hints, deterministic
nearby variations, or coverage search.

1. **Preset shots** (`source: "preset"`): one shot per launch preset (in order).
   For preset `{angleDeg, power}`:
   `shot = { angle: angleDeg·π/180, dragPower: power, waitTime: 0 }`
   (matches test-levels.js:510–513; `simulateShot` reads `shot.angle` in radians and
   `shot.dragPower`, :5212–5215).
2. **Variation shots** (`source: "variation"`): 4 deterministic extra shots derived
   from **`launchPresets[0]`** (base `angleDeg0`, `power0`), in this fixed order:

   | # | angleDeg | power |
   |---|---|---|
   | e1 | `angleDeg0 + 7`  | `power0 × 1.15` |
   | e2 | `angleDeg0 − 7`  | `power0 × 0.85` |
   | e3 | `angleDeg0 + 19` | `power0 × 0.85` |
   | e4 | `angleDeg0 − 19` | `power0 × 1.15` |

   Each converted to a shot the same way (`angle = angleDeg·π/180`, `waitTime = 0`).
3. **Coverage shots** (`source: "coverage"`): up to 10 shots selected by deterministic
   grid search. Iterate candidates in fixed nested loop order `angle → power → wait`:
   - `angle`: 48 evenly spaced values in `[0, 2π)`, i.e. `k·2π/48` for `k=0..47`.
   - `power`: `[1.4, 2.4, 3.2]`.
   - `waitTime`: `[0, 1.7, 4.6]`.

   For each candidate, run a fresh `createLevelRuntime(levelIndex)` and
   `simulateShot(level, shot)` with default `maxTime` and `captureFrames:false`.
   Select kept shots in this priority order, deduping by identical
   `(angleDeg, power, waitTime)`:
   1. the first candidate whose outcome is `"goal"`, if any;
   2. for each distinct `(outcome, reason)` pair not yet represented, the candidate
      with the longest `result.time` for that pair;
   3. fill remaining slots with the longest-`result.time` candidates not yet kept.

   Ties keep the earliest candidate in grid iteration order. If the final fixture
   for a level has fewer than 3 single-shot fixtures with more than 100 raw captured
   frames, rerun the coverage selection for that level only with the wider power
   grid `[1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4, 3.6]`; all other loop ordering and
   selection rules stay unchanged.

All preset/variation shots use `waitTime = 0`; coverage shots use their selected
grid wait. All single-shot fixtures are launched from the level's start anchor with
default start options: `simulateShot(level, shot, { captureFrames:true, maxTime:20 })`
(anchorPlanetIndex defaults to `startPlanetIndex`, anchorNormal to
`directionFromAngleDeg(startAngleDeg)`, startPosition to `startAnchor`, startTime 0
— :5080–5083).

Store the resolved shot inputs in each fixture for reproducibility.

### 7.3 Sequence fixtures

If a runtime level has `adminSolutions`, export them under top-level `sequences`.
World 1 currently has two on level 5. These are multi-shot fixtures, not part of
the single-shot `shots` coverage count.

Each sequence chains `simulateShot` exactly like `simulateSequence` in
`scripts/test-levels.js`: carry `startPosition`, `startTime`,
`anchorPlanetIndex`, `anchorNormal`, `heat`, and `landingCount` from a landed shot
into the next shot. Convert each authored admin shot
`{waitSeconds, angleDeg, power}` to
`{angle: angleDeg·π/180, dragPower: power, waitTime: waitSeconds}`. Stop the
sequence when a shot reaches the goal or returns any non-`landed` outcome.

```jsonc
{
  "label": "Outer Relay",
  "shots": [
    {
      "input": { "angleDeg": <double>, "power": <double>, "waitTime": <double> },
      "outcome": "goal" | "landed" | "crash" | "settled" | "timeout",
      "reason": "",
      "steps": <int>,
      "finalTime": <double>,
      "landingCount": <int>,
      "frames": [ <FrameSample>, ... ]    // same sampling rule as ShotFixture
    }
  ]
}
```

### 7.4 ShotFixture schema

`simulateShot` returns `outcome`, `reason`, `finalTime`, `landingCount`, and a
`frames[]` array of `{ position, velocity, time, anchorPlanetIndex, landingCount }`
(game-core.js:5103–5109, 5256–5300). Record:

```jsonc
{
  "source": "preset" | "variation" | "coverage",
  "shotKind": "preset0" | "preset1" | "e1" | "e2" | "e3" | "e4" | "coverage0" | ...,
  "input": { "angleDeg": <double>, "power": <double>, "waitTime": <double> },
  "outcome": "goal" | "landed" | "crash" | "settled" | "timeout",   // (:5258,:5282)
  "reason": "",                    // e.g. "planet","sun","bounds","goal-closed" (:5259)
  "steps": <int>,                   // (:5265)
  "finalTime": <double>,           // (:5266)
  "landingCount": <int>,           // (:5263)
  "sampledFrames": [               // every 15th frame (indices 0,15,30,…) PLUS the final frame
    { "index": <int>, "time": <double>,
      "position": {"x":<double>,"y":<double>},
      "velocity": {"x":<double>,"y":<double>} }
  ]
}
```

Frame sampling rule: from `result.frames`, take indices `0, 15, 30, …`, and always
append the **last** frame (`frames.length-1`) if not already included. Record
`index` so C# can align. (`frames[0]` is the anchored ball; `frames[1]` is the
launch frame at t=0 with velocity set and `anchorPlanetIndex=null`; both at time 0
— verified. Do not dedupe them.)

Emit doubles with full precision (round-trippable, e.g. JS
`Number.prototype.toString()` / `JSON.stringify` default, which is shortest
round-trip; C# parse with `double.Parse(..., InvariantCulture)`).

### 7.5 Reverse-step fixtures

Reverse physics parity fixtures live in
`unity/tests/fixtures/reverse/level-<NN>-<id>.reverse.json`. They are generated by
the same `npm run export:unity:fixtures` pipeline, after the forward fixture for
each level. They test the JS `reverseStepBall` primitive directly; the contract is
**C# `Sim.ReverseStepBall` reproduces JS `reverseStepBall`**, not that either
primitive exactly inverts `stepBall`.

For each level, the exporter does a deterministic coverage search using the same
48 angle grid and wait grid as §7.2, with the wide power grid
`[1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4, 3.6]`. It keeps the 3 candidates with the
longest anchor-free forward flight, tie-breaking by grid iteration order, and
requires at least 40 anchor-free forward steps at `delta = 1/120`. For each kept
shot, it captures a mid-flight anchor-free frame, seeds JS `reverseStepBall` from
that state, and records 30 reverse steps using `launchPlanetIndex =
level.startPlanetIndex`.

```jsonc
{
  "schemaVersion": 1,
  "levelIndex": 0,
  "levelId": "open-lane",
  "delta": 0.008333333333333333,       // 1/120
  "steps": 30,
  "minForwardFlyingSteps": 40,
  "sequences": [
    {
      "source": "reverse-coverage",
      "shotKind": "reverse0",
      "input": { "angleDeg": <double>, "power": <double>, "waitTime": <double> },
      "launchPlanetIndex": <int|null>,
      "forwardCaptureFrameIndex": <int>,
      "forwardFlyingSteps": <int>,
      "startFrame": {
        "step": 0,
        "time": <double>,
        "position": {"x":<double>,"y":<double>},
        "velocity": {"x":<double>,"y":<double>}
      },
      "frames": [
        { "step": 1, "time": <double>,
          "position": {"x":<double>,"y":<double>},
          "velocity": {"x":<double>,"y":<double>} }
      ]
    }
  ]
}
```

C# parity tests load each `startFrame`, call
`Sim.ReverseStepBall(level, ball, delta, launchPlanetIndex)` once per recorded
frame, and compare `time`, `position`, and `velocity` using the tolerance contract
below.

### 7.6 Parity tolerance contract (single source of truth)

This is the **one** parity contract; `spec-physics.md` §15 item 2 cross-references
it rather than restating numbers. It governs both the outcome-summary comparison
and the frame-by-frame (`captureFrames`) comparison.

**Exact match (never relaxed):**
- `outcome`, `reason`, `landingCount` — exact string/int equality.
- `steps` — the number of flight-loop iterations must match exactly (equivalently
  `finalTime`, which is `startTime + steps·delta`, must match to within float
  round-off). **Escape hatch:** if a fixture fails *only* on `steps`, off by ±1,
  and the discrepancy is traced to float drift at a step boundary (a collision or
  goal-capture threshold test landing on the opposite side one frame early/late),
  it MAY be waived by adding that fixture to a per-fixture `steps` allowlist with a
  one-line justification. Any `steps` delta >1, or any `steps` delta on a fixture
  not in the allowlist, is a real ordering/branch bug — do not relax it.

**Numeric tolerance (per-component, absolute):**
- `position` and `velocity` on **every sampled frame**: `|Δ| ≤ 1e-6`
  (`ABS_TOL = 1e-6`). The arithmetic is deterministic double math, so early frames
  should agree to ~1e-12; drift comes from transcendental ULP differences between
  V8 and .NET in `sin/cos/atan2` and especially **`Math.hypot`** (`distanceBetween`,
  :2967) — .NET `Math.Sqrt(dx*dx+dy*dy)` is not bit-identical to V8 `Math.hypot` —
  which gravity slingshots can amplify.
- **Per-level relaxation to `1e-4`** is permitted ONLY if the max observed
  component error for that level is traced to `Math.hypot` ULP differences; log
  the max observed error and the level. Never relax the exact-match keys above to
  buy numeric slack.

**Before relaxing anything:** implement a V8-equivalent `Hypot(dx,dy)` in C# (scale
by the max component, then `Sqrt`) rather than naive `Sqrt(dx*dx+dy*dy)`. In
practice this keeps drift below `1e-6` for most frames and removes the need for
per-level relaxation on all but the longest slingshot trajectories.

The export script SHOULD also print, per fixture, the number of raw frames so
reviewers can sanity-check sampling (e.g. level 0 preset0 → 130 frames, outcome
`goal`, finalTime ≈ 2.1333).

---

## 8. Loader validation (fail loud)

The C# loader MUST throw at load time (not silently ignore) when:

1. `schemaVersion != 1` (world file or fixture file).
2. `levels.length != 10` in the world file.
3. Any required field (§4/§5 with Null?=no) is missing or not finite
   (`double.IsFinite`). Reject `NaN`/`Infinity`.
4. `goalUnlockRequired == true` on any level (goal-unlock mechanic is out of scope).
5. Any planet has `orbitCenterIndex != null` (moons out of scope).
6. Any planet carries a non-empty `turrets`, or any of these **unknown-mechanic
   keys** appear on a planet: `splitSurface`, `surfaceType`, `flicker`, `hidden`,
   `goalUnlock`, `orbitAnchor`, `slideAngularSpeed`, `orbitDecayRate`,
   `orbitAround`, `destroyedByMeteor`, `fallIntoSunRadius`.
7. Any of these **unknown-mechanic keys** appear at level level (non-empty):
   `binarySystem`, `extraSuns`, `portals`, `dustClouds`, `asteroids`,
   `meteorImpacts`, `pulsarJets`, `redGiant`.
8. `startPlanetIndex` out of range, or a `LaunchPreset` with non-finite
   `angleDeg`/`power`.

Because the export deliberately omits out-of-scope fields (§4/§5), rule 6/7 mainly
guards against a future export that starts emitting them; keep the checks so
unsupported content cannot load as if supported. Recommended: the export script
asserts the same invariants before writing, so a bad level fails during export too.

---

## 9. Out of scope (stub behavior)

None of these are exercised by levels 0–9 (verified). If a field is encountered:

| Field / mechanic | Where | Loader behavior |
|---|---|---|
| Moons (`orbitCenterIndex`/`orbitAround` non-null) | planet | **throw** (rule 5). Would need parent-relative orbit anchor (:3605). |
| `splitSurface` (landable-side hemisphere) | planet | **throw** (rule 6). :2991,:4614 |
| `surfaceType: "ice"/"lava"` (slide, heat/overheat) | planet | **throw** (rule 6). :3918,:4032 |
| `flicker` (vanishing planets) | planet | **throw** (rule 6). :3006 |
| `turrets` | planet | non-empty → **throw** (rule 6). :4142 |
| `goalUnlock` / `goalUnlockRequired` (relay-to-unlock) | planet/level | **throw** (rule 4/6). :4638 |
| `orbitAnchor` (`primary-sun`/`secondary-sun`) | planet | **throw** (rule 6). :3543 |
| `orbitDecayRate` (inspiraling orbits) | planet | **throw** (rule 6). :3291 |
| `binarySystem` / `extraSuns` / multi-sun gravity | level | **throw** (rule 7). :4321,:4366,:4834 |
| `portals` | level | **throw** (rule 7). :4758 |
| `dustClouds` (drag) | level | **throw** (rule 7). :4872 |
| `asteroids` | level | **throw** (rule 7). :4671 |
| `meteorImpacts` | level | **throw** (rule 7). :4691 |
| `pulsarJets` | level | **throw** (rule 7). :4068 |
| `redGiant` (growing sun) | level | **throw** (rule 7). :3651 |
| Goal open/close timing | level | **ignore** `goalOpenSeconds`; goal always open (GOAL_ALWAYS_OPEN, §6.3) |
| `adminSolutions` | level | **ignore** (authoring/solver metadata; not exported except optional `_debugAdminSolutions`) |
| `tutorial`, `summary`, `preferRelay` | level | **ignore** (UI copy / hints; not exported) |
| `core` / `glow` | planet | **ignore** for physics (visual tint; exported as optional hints) |
| `par` | — | not present on runtime; do not emit or read |

---

## 10. Worked reference values (for implementer self-check)

From `createLevelRuntime(0)` (`open-lane`), exported level fields:
- `sun {0,0}`, `sunGravityStrength 20`, `startPlanetIndex 0`,
  `startAngleDeg −1.9574541435317188` (deg), `goalCenter {10.353, 0}`,
  `goalRadius 0.56`, `goalPullRadius 4.9`, `goalPullStrength 6.2`,
  `goalOpenSeconds 9999` (ignored), `goalUnlockRequired false`.
- planet 0 `Start World`: `basePosition {5.354621…, 0.121513…}`, `radius 0.31`
  (=0.62×0.5), `landingRadius null`, `gravity 5.2`, `falloff 3.8`, `landable true`,
  `orbitCenterIndex null`, `orbitSemiMajor 5.356`, `orbitSemiMinor 5.356`,
  `orbitEccentricity 0`, `orbitRotation 0.022689280275926288` (rad),
  `orbitPhase 0` (rad), `orbitSpeed 0.01` (rad/s), `spinSpeed 0.01` (rad/s).
- launchPresets: `[{ angleDeg: −1.4, power: 1.38 }]`.

Fixture check, level 0 preset0 (`angle = −1.4·π/180`, `dragPower 1.38`):
`outcome "goal"`, `reason ""`, `finalTime ≈ 2.1333333`, `landingCount 0`,
raw `frames.length 130`. `frames[1]` (launch) position `{5.974259624847663,
0.10033578659873076}`, velocity `{6.589028728906613, −0.10131432517391258}`.

`createLevelRuntime(8)` (`forked-harbor`) is the complex reference: 5 planets,
several with `landingRadius` set and small eccentricities (0, 0.04), all
`orbitCenterIndex null`, planet 4 `Rim Giant` `landable false`.
