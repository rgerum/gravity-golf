# Spec: Asteroid Mechanics (Unity port, World 2 / campaign levels 10–19)

Status: porting contract for adding **asteroid belts** to the Gravity Golf Unity
port. Scope: campaign indices **10–19** (`createLevelRuntime(10..19)`), world
`asteroid-worlds-v1` ("Asteroid Belts", worldNumber 2). This is an **addendum** to
`spec-leveldata.md` (export format + loader) and `spec-physics.md` (simulation
core); read both first. Everything already specified there for planets/sun/goal/
launch/orbits still applies unchanged — this document only adds the asteroid layer
and the two-world plumbing.

All source citations are `game-core.js:LINE` against
`/home/richard/WebstormProjects/gravity-golf/src/game-core.js`.

> **Verified scope (levels 10–19).** Each level uses **only** basic planets +
> asteroid belts. Confirmed by running `createLevelRuntime(10..19)`:
> - 2–4 planets per level, all `orbitCenterIndex === null` (no moons), eccentricity
>   `0..0.04` (Kepler already in scope from world 1).
> - **20–44 asteroids** per level (belt sizes: L10 24, L11–15/17 20, L14 22,
>   L18 28, L19 44).
> - `sunGravityStrength === 0` for **all** asteroid levels (`makeAsteroidBeltLevel`,
>   game-core.js:2035 → `spec.sunGravityStrength ?? 0`). The sun sits at `(0,0)` and
>   is **still a collision hazard** (radius `0.42`) but exerts **no gravity**. Only
>   planet gravity + goal pull act on the ball.
> - **No** moons, turrets, portals, dust, binary/extra suns, meteors, pulsars,
>   ice/lava/split/flicker surfaces, goal-unlock. Those stay rejected (§D).

---

## Part 1 — INVESTIGATION FINDINGS

### 1. Asteroid data (source authoring → resolved runtime)

**Source authoring** (`makeAsteroidBelt`, game-core.js:1970; `makeAsteroidBeltLevel`,
game-core.js:2003). A level spec carries `belts: [ {beltSpec}, ... ]`; each belt is
expanded to individual asteroids by `makeAsteroidBelt` and all belts are flattened:

```
asteroids: spec.belts.flatMap((belt, i) => makeAsteroidBelt({ ...belt, seed: i + spec.seed }))   // :2038
```

`makeAsteroidBelt({orbitRadius=5, count=36, radius=0.2, gapAngles=[0], gapWidthDeg=34,
angularSpeed=0.08, radialJitter=0.18, seed=0})` places `count` asteroids evenly around
`angleDeg = (index/count)*360`, **skipping** any that fall within `gapWidthDeg/2` of a
`gapAngles` entry (the rotating "lanes"). Per asteroid it authors small deterministic
`wobble` (size) and `orbitWobble` (radius) jitter, and a per-asteroid `spinSpeed` and
`color`. **The gaps and jitter are baked into the resolved data — C# never re-derives
them.** The exporter emits the resolved asteroids directly.

**Resolved runtime** (`createLevelRuntime`, asteroid block game-core.js:4390–4402).
Each runtime asteroid has exactly these fields (verified by
`createLevelRuntime(10).asteroids`):

| Runtime field | Type | Unit | Source | Notes |
|---|---|---|---|---|
| `position` | `{x,y}` | world | `scalePointFromSun(pointFromPolar(asteroid.position), systemCenter)` (:4398) | resolved cartesian at `t=0`; **recomputed every step** by `setLevelTime` (§4) |
| `orbitRadius` | number | world | `asteroid.orbitRadius ?? position?.radius ?? 0` (:4395) | circular-orbit radius (already includes per-asteroid `orbitWobble`) |
| `baseAngleDeg` | number | **degrees** | `asteroid.baseAngleDeg ?? position?.angleDeg ?? 0` (:4396) | orbit phase angle at `t=0` |
| `orbitAngularSpeed` | number | **rad/s** | `asteroid.orbitAngularSpeed ?? 0` (:4397) | signed angular rate; per **belt** (all asteroids in a belt share it). See the units note in §2. |
| `radius` | number | world | `asteroid.radius ?? 0.22` (:4394) | collision radius; **varies per asteroid** (size wobble, e.g. 0.136…0.16 on L10) |
| `spinSpeed` | number | rad/s | `asteroid.spinSpeed ?? 0.24` (:4399) | **visual only** — the sim never reads it. Optional in C#. |
| `color` | int | 0xRRGGBB | `asteroid.color ?? 0x8d929a` (:4400) | visual only. Optional in C#. |
| `index` | int | — | array index (:4393) | 0-based; used as `asteroidIndex` in the crash result (:4681) |

Real dump, `createLevelRuntime(10)` (`belt-gap`, pre-rotation, first 3 of 24):

```
{ position:{x:4.6354748625093665,y:-2.4647257046259266}, orbitRadius:5.25,  baseAngleDeg:-28, orbitAngularSpeed:0.14, radius:0.152, spinSpeed:-0.32, color:8226191,  index:0 }
{ position:{x:4.561744564468594, y:1.8430644396062872 }, orbitRadius:4.92,  baseAngleDeg:22,  orbitAngularSpeed:0.14, radius:0.136, spinSpeed:0.32,  color:10133674, index:1 }
{ position:{x:4.248720961743694, y:2.6548955138083565 }, orbitRadius:5.01,  baseAngleDeg:32,  orbitAngularSpeed:0.14, radius:0.16,  spinSpeed:-0.36, color:8226191,  index:2 }
```

> **Gotchas:** (a) `radius` **varies per asteroid** — never assume a single belt
> radius. (b) `orbitAngularSpeed` is **per belt**, so multi-belt levels (16, 18, 19)
> have asteroids with different speeds in one `asteroids` array (e.g. L19 has `0.18`
> and `-0.15`). (c) asteroids have **no `basePosition`, no eccentricity, no
> `orbitCenter` field** — the orbit is a plain circle about the level sun/systemCenter.

### 2. Position over time — `asteroidPositionAtTime` (game-core.js:3063)

```
function asteroidPositionAtTime(asteroid, sun, time) {
  const angleDeg = (asteroid.baseAngleDeg ?? 0)
    + (asteroid.orbitAngularSpeed ?? 0) * time * 180 / Math.PI;     // :3064-3065
  const direction = directionFromAngleDeg(angleDeg);                // (cos(angleDeg*π/180), sin(...))
  const orbitRadius = asteroid.orbitRadius ?? 0;                    // :3067
  return vec(sun.x + direction.x * orbitRadius, sun.y + direction.y * orbitRadius);
}
```

- `sun` argument = `systemCenter` (the level sun position, `(0,0)` for all asteroid
  levels). Passed from `setLevelTime` as `systemCenter` (game-core.js:3844).
- **Units.** `baseAngleDeg` is in **degrees**. `orbitAngularSpeed` is in **rad/s**;
  the `* 180 / Math.PI` converts the accumulated radians (`orbitAngularSpeed*time`)
  into degrees before adding to `baseAngleDeg`. Net effect: the asteroid rides a
  circle of radius `orbitRadius`, and its angle in radians is
  `baseAngleDeg*π/180 + orbitAngularSpeed*time`. **Do not double-convert.** Port the
  formula verbatim in degrees (keep the `*180/π` then feed
  `directionFromAngleDeg`) to stay bit-parity with JS transcendental ordering.
- `directionFromAngleDeg(deg)` = `(cos(deg*π/180), sin(deg*π/180))` (matches
  `spec-physics.md` §4). No Kepler, no ellipse — asteroids are always circular.

### 3. Collision — `resolveAsteroidContact` (game-core.js:4671)

```
function resolveAsteroidContact(level, ball) {
  for (const asteroid of level.asteroids ?? []) {
    const touchRadius = (asteroid.radius ?? 0.22) + COURSE.ballRadius * PLANET_COLLISION_PADDING;  // radius + 0.28*0.92 = radius + 0.2576
    if (distanceBetween(ball.position, asteroid.position) <= touchRadius) {
      ball.velocity = (0,0);
      return { type:'crash', reason:'asteroid', asteroidIndex: asteroid.index, ... };
    }
  }
  return null;
}
```

- **Touch radius** = `asteroid.radius + BallRadius * PlanetCollisionPadding`
  = `asteroid.radius + 0.28 * 0.92` = `asteroid.radius + 0.2576`. (No separate
  asteroid padding constant; reuses `ballRadius`/`PLANET_COLLISION_PADDING` from
  `spec-leveldata.md` §2 / `spec-physics.md` §3.)
- **Test:** `distanceBetween(ball.position, asteroid.position) <= touchRadius`
  (uses `Math.hypot` — apply the same `Hypot` parity rule, `spec-leveldata.md` §7.6).
- Iterate asteroids in **array/index order**; first hit wins; velocity zeroed.
- **Returns a StepResult** with `type: "crash"`, `reason: "asteroid"` (verified
  literal string, :4680), plus `asteroidIndex` (informational). For fixture parity the
  comparison keys are `outcome == "crash"` and `reason == "asteroid"`.
- **Contact-order slot (critical).** In `stepBall` the contact resolvers run in this
  exact order (game-core.js:4976→5006), first non-null wins:
  `sun (4976) → turret (4982) → planet (4988) → asteroid (4994) → meteor (5000) → friction (5006)`.
  Asteroid sits **immediately after planet contact and immediately before meteor
  contact/friction**. In the current C# `Sim.StepBall` (which has no turret/asteroid/
  meteor), insert the asteroid resolver **between `ResolvePlanetContact` (Sim.cs:136–140)
  and the friction line (Sim.cs:142)**. Turret and meteor stay unimplemented (null),
  so planet → asteroid → friction is the correct in-scope collapse of the JS order.

### 4. `setLevelTime` interaction (game-core.js:3843–3847)

```
level.asteroids?.forEach((asteroid) => {
  const position = asteroidPositionAtTime(asteroid, systemCenter, time);
  asteroid.position.x = position.x;
  asteroid.position.y = position.y;
});
```

- Asteroid positions are **recomputed in place every `setLevelTime` call** from
  `time` — there is **no cache and no other per-asteroid time-state** (unlike
  planets, which use the `orbitStateCache`). Positions are always consistent with
  `level.time`; `resolveAsteroidContact` just reads the already-updated
  `asteroid.position`.
- Ordering inside `setLevelTime`: the asteroid loop runs after the planet loop
  (game-core.js:3820ish) and before the meteor loop (3848). For scope it's an
  independent pass — no dependency on planet positions. C# `Orbits.SetLevelTime`
  (Orbits.cs:110) must add an asteroid loop after the planet loop.

### 5. Rewind — `reverseStepBall` (game-core.js:5030)

`reverseStepBall` calls `setLevelTime(level, previousTime)` (:5048) — which **moves
the asteroids backward in time** (harmless, positions recomputed) — and
`sampleBallAcceleration` (:5041), but **never calls `resolveAsteroidContact`**
(verified: the function body has no contact resolution at all). So **rewind does not
interact with asteroids** beyond repositioning them via `SetLevelTime`. The existing
C# `Sim.ReverseStepBall` needs **no asteroid-specific change** — it already calls
`Orbits.SetLevelTime`, which will now also move asteroids. This is correct and matches
JS.

### 6. `simulateShot` (game-core.js:5074)

- **No asteroid-specific handling.** `minPlanetClearance` (game-core.js flight loop)
  is computed over **planets only** — asteroids are not counted. `minGoalDistance`
  unaffected. Outcome counting is generic (`outcome`/`reason` from the StepResult).
- Because asteroid crashes surface as `outcome:"crash", reason:"asteroid"`, coverage
  search naturally produces them. **Verified on L10** (48-angle × 3-power × 3-wait
  grid, +90° rotated): 191 crashes of which **170 `reason:"asteroid"`** (plus 21
  bounds), alongside 199 landed / 13 goal / 29 settled. Every asteroid level will
  produce ample asteroid crashes in coverage.

---

## Part 2 — SPECIFICATION

### A. Exported JSON schema addendum

#### A.1 World file

Path: `unity/Assets/StreamingAssets/levels/world-2.json`. **Same top-level shape as
`world-1.json`** (`spec-leveldata.md` §3):

```jsonc
{
  "schemaVersion": 1,
  "generatedFrom": "game-core.js",
  "worldId": "asteroid-worlds-v1",     // from WORLD_DEFINITIONS[1], game-core.js:76
  "worldName": "Asteroid Belts",
  "worldNumber": 2,                    // 1-based (worldIndex 1 + 1)
  "worldSize": 10,
  "levels": [ <Level>, ... ]           // exactly 10, campaign indices 10..19 in order
}
```

**Level `index` stays GLOBAL (10–19)** — matching world 1, where the exported
`index` equals the campaign index passed to `createLevelRuntime`. Decision rationale:
(1) `createLevelRuntime` is called with the global index; (2) fixtures for both worlds
share `unity/tests/fixtures/`, so global indices keep filenames unique
(`level-10-belt-gap.json` … `level-19-belt-gauntlet.json`) with no collision against
world 1's `level-00`…`level-09`. `worldLevelNumber` remains 1-based within the world
(1–10; runtime field `worldLevelNumber`, game-core.js:4462). The loader's
per-level `ValidateLevel` index check must expect the **global** index (see §B.4).

Reference (post export): L10 `worldLevelNumber: 1`, `sunGravityStrength: 0`,
`goalRadius: 0.56`, 2 planets, 24 asteroids.

#### A.2 Per-level `asteroids` array (NEW)

Add one field to the Level object (`spec-leveldata.md` §4), emitted by
`serializeLevel`:

```jsonc
"asteroids": [ <Asteroid>, ... ]     // ordered by array index; may be large (20..44)
```

`<Asteroid>` — field-by-field (JS runtime name → JSON name → C# type/unit):

| JSON name | Runtime source | C# type | Unit | Null? | Notes |
|---|---|---|---|---|---|
| `index` | `index` | `int` | — | no | 0-based == array index |
| `position` | `position` | `Vec2` | world | no | resolved cartesian at `t=0` (rotated, §A.3). Informational; sim recomputes each step from `orbitRadius`/`baseAngleDeg`. |
| `orbitRadius` | `orbitRadius` | `double` | world | no | circular orbit radius |
| `baseAngleDeg` | `baseAngleDeg` | `double` | **degrees** | no | phase at `t=0` (rotated, §A.3) |
| `orbitAngularSpeed` | `orbitAngularSpeed` | `double` | **rad/s** | no | signed angular rate (invariant under rotation) |
| `radius` | `radius` | `double` | world | no | collision radius; varies per asteroid |
| `spinSpeed` | `spinSpeed` | `double` | rad/s | yes | visual only; C# may ignore. Emit as hint. |
| `color` | `color` | `int` (0xRRGGBB) | — | yes | visual only; C# may ignore. |

Follow `spec-leveldata.md` conventions: emit doubles at full round-trip precision;
`Vec2 = {x,y}`.

**Exporter change (`serializeLevel`, unity-export-shared.js:128).** Add
`asteroids: level.asteroids.map(serializeAsteroid)` where:

```js
function serializeAsteroid(a) {
  const s = {
    index: a.index,
    position: serializeVec2(a.position),
    orbitRadius: a.orbitRadius,
    baseAngleDeg: a.baseAngleDeg,
    orbitAngularSpeed: a.orbitAngularSpeed,
    radius: a.radius,
  };
  if (a.spinSpeed !== undefined) s.spinSpeed = a.spinSpeed;
  if (a.color !== undefined) s.color = a.color;
  return s;
}
```

World-1 levels have no asteroids → `level.asteroids` is `[]` there, so `world-1.json`
gains an empty `"asteroids": []` (harmless; loader accepts empty). If you prefer to
keep `world-1.json` byte-identical, guard emission behind `level.asteroids.length > 0`
— but emitting `[]` unconditionally is simpler and the C# loader treats a missing
array and `[]` identically.

#### A.3 What the +90° rotation transforms

`rotateRuntimeAboutSun` already handles asteroids via `rotateAsteroids`
(unity-export-shared.js:110, 752):

```js
function rotateAsteroids(asteroids, radians, degrees) {
  for (const asteroid of asteroids ?? []) {
    rotateVec2InPlace(asteroid.position, radians);           // rotate cartesian position about sun
    asteroid.baseAngleDeg = rotateAngleDeg(asteroid.baseAngleDeg, degrees);  // += 90
  }
}
```

- **Rotated (+90°):** `position` (vector rotate about origin) and `baseAngleDeg`
  (`+= degrees`, i.e. +90). These are the phase/placement quantities.
- **Invariant:** `orbitRadius`, `orbitAngularSpeed`, `radius`, `spinSpeed`, `color`,
  `index` — sizes and rates are rotation-independent. This is already implemented;
  **no exporter rotation change is needed for asteroids.** (Verified: L10 asteroid 0
  post-+90° → `baseAngleDeg: 62` (=−28+90), `position:{2.4647…,4.6355…}`,
  `orbitRadius/orbitAngularSpeed/radius` unchanged.)

### B. C# core changes

#### B.1 `AsteroidRuntime` POCO (new file `Core/AsteroidRuntime.cs`)

Mirror `PlanetRuntime.cs` conventions (Newtonsoft attributes, `[JsonExtensionData]`,
`Clone()`):

```csharp
public sealed class AsteroidRuntime
{
    [JsonExtensionData] public IDictionary<string, JToken>? ExtensionData { get; set; }
    [JsonProperty("index")]             public int Index { get; set; }
    [JsonProperty("position")]          public Vec2 Position { get; set; }        // mutated each SetLevelTime
    [JsonProperty("orbitRadius")]       public double OrbitRadius { get; set; }
    [JsonProperty("baseAngleDeg")]      public double BaseAngleDeg { get; set; }  // degrees
    [JsonProperty("orbitAngularSpeed")] public double OrbitAngularSpeed { get; set; } // rad/s
    [JsonProperty("radius")]            public double Radius { get; set; }
    [JsonProperty("spinSpeed")]         public double SpinSpeed { get; set; }     // visual only
    [JsonProperty("color")]             public int? Color { get; set; }           // visual only

    public AsteroidRuntime Clone() => new()
    {
        ExtensionData = ExtensionData?.ToDictionary(p => p.Key, p => p.Value.DeepClone()),
        Index = Index, Position = Position, OrbitRadius = OrbitRadius,
        BaseAngleDeg = BaseAngleDeg, OrbitAngularSpeed = OrbitAngularSpeed,
        Radius = Radius, SpinSpeed = SpinSpeed, Color = Color,
    };
}
```

#### B.2 `LevelRuntime.Asteroids` + deep-copy Clone

In `LevelRuntime.cs`:

```csharp
[JsonProperty("asteroids")]
public List<AsteroidRuntime> Asteroids { get; set; } = new List<AsteroidRuntime>();
```

**Add to `LevelRuntime.Clone()` (LevelRuntime.cs:87)** — this is required; the clone
seam feeds the aim-trajectory preview which mutates `Position` via `SetLevelTime`:

```csharp
Asteroids = Asteroids.Select(a => a.Clone()).ToList(),
```

(`Vec2` is a value type, so cloning the list of `AsteroidRuntime` with copied
`Position` is a sufficient deep copy.)

#### B.3 Position function — `Orbits.AsteroidPositionAtTime` + `SetLevelTime` loop

Add to `Orbits.cs` (parity with game-core.js:3063):

```csharp
public static Vec2 AsteroidPositionAtTime(AsteroidRuntime a, Vec2 sun, double time)
{
    var angleDeg = a.BaseAngleDeg + a.OrbitAngularSpeed * time * 180.0 / Math.PI;
    var dir = VecMath.DirectionFromAngleDeg(angleDeg);   // (cos(deg*π/180), sin(deg*π/180))
    return new Vec2(sun.X + dir.X * a.OrbitRadius, sun.Y + dir.Y * a.OrbitRadius);
}
```

Extend `Orbits.SetLevelTime` (Orbits.cs:110) — after the planet loop, before return:

```csharp
foreach (var a in level.Asteroids)
    a.Position = AsteroidPositionAtTime(a, level.SystemCenter, time);
```

`level.SystemCenter` is loader-synthesized to `level.Sun` (`(0,0)`), matching the JS
`systemCenter` argument. Keep the `*180/π` then `DirectionFromAngleDeg` ordering
verbatim for transcendental parity (`spec-leveldata.md` §7.6).

#### B.4 Loader — accept + validate asteroids (remove from reject list)

In `LevelLoader.cs`:

1. **Remove `"asteroids"`** from `LevelMechanicKeys` (LevelLoader.cs:14). Asteroids
   are now supported, so they must not trip the "unsupported level mechanic" throw at
   ValidateLevel:135–140.
2. **Token validation** — in `ValidateLevelTokens` (after `launchPresets`, matching
   the existing style), validate the asteroids array if present. It is optional
   (world-1 levels may emit `[]` or omit it); when present, each entry requires the
   non-null fields:

   ```csharp
   if (source.TryGetValue("asteroids", out var astTok) && astTok is JArray asteroids)
   {
       for (var i = 0; i < asteroids.Count; i += 1)
       {
           var ast = asteroids[i] as JObject
               ?? throw new InvalidDataException($"asteroids[{i}]: missing object on level {levelId}");
           var al = $"level {levelId} asteroids[{i}]";
           RequiredInteger(ast, "index", al);
           RequiredVec(ast, "position", al);
           RequiredNumber(ast, "orbitRadius", al);
           RequiredNumber(ast, "baseAngleDeg", al);
           RequiredNumber(ast, "orbitAngularSpeed", al);
           RequiredNumber(ast, "radius", al);
           // spinSpeed / color optional — no check (or OptionalNumberOrNull)
       }
   }
   ```

3. **Runtime validation** — in `ValidateLevel` (LevelLoader.cs:127), after the planet
   loop, finite-check each asteroid and assert `index == arrayIndex`, then prime its
   position:

   ```csharp
   for (var i = 0; i < level.Asteroids.Count; i += 1)
   {
       var a = level.Asteroids[i];
       if (a.Index != i) throw new InvalidDataException($"asteroid.index: {label} expected {i}, got {a.Index}");
       RequireFinite(a.Position.X, "asteroid.position.x", label);
       RequireFinite(a.Position.Y, "asteroid.position.y", label);
       RequireFinite(a.OrbitRadius, "asteroid.orbitRadius", label);
       RequireFinite(a.BaseAngleDeg, "asteroid.baseAngleDeg", label);
       RequireFinite(a.OrbitAngularSpeed, "asteroid.orbitAngularSpeed", label);
       RequireFinite(a.Radius, "asteroid.radius", label);
   }
   ```

   The trailing `Orbits.SetLevelTime(level, level.Time)` (LevelLoader.cs:182) already
   runs and will now populate asteroid positions from `t=0`.
4. **World length / worldNumber.** `LoadWorldFromJson` hard-codes `levels.length == 10`
   (LevelLoader.cs:41, 52) — world 2 also has 10, so no change. The per-level index
   check `ValidateLevel` compares `level.Index != expectedIndex` where `expectedIndex`
   is the **loop position 0..9** (LevelLoader.cs:59, 130). Since exported `index` is
   **global (10–19)** for world 2, this check will fail as written. **Fix:** derive
   the expected global index from the world, e.g. pass
   `expectedIndex = world.WorldNumber >= 1 ? (world.WorldNumber - 1) * world.WorldSize + i : i`
   (or simply compare against `world.Levels[i].WorldLevelNumber` for the 1-based
   within-world check and relax the global-index equality to "finite integer, unique,
   ascending"). Keep world 1 passing: world 1 global indices are 0–9 == loop position,
   so the `(WorldNumber-1)*WorldSize + i` formula yields the same values. Document the
   chosen formula in code.

#### B.5 `Sim.StepBall` — insert `ResolveAsteroidContact` at the JS slot

Add the resolver (mirror `ResolvePlanetContact`, note JS spelling in the task is
"ReolveAsteroidContact" — use the correct `ResolveAsteroidContact`):

```csharp
private static StepResult? ResolveAsteroidContact(LevelRuntime level, BallState ball)
{
    foreach (var a in level.Asteroids)
    {
        var touchRadius = a.Radius + Constants.BallRadius * Constants.PlanetCollisionPadding;
        if (VecMath.Distance(ball.Position, a.Position) <= touchRadius)
        {
            ball.Velocity = new Vec2(0, 0);
            return new StepResult { Type = "crash", Reason = "asteroid" };
        }
    }
    return null;
}
```

**Call site:** in `Sim.StepBall`, **between** the planet-contact block
(Sim.cs:136–140) and the friction line (Sim.cs:142):

```csharp
var planetContact = ResolvePlanetContact(level, ball);
if (planetContact is not null) return planetContact;

var asteroidContact = ResolveAsteroidContact(level, ball);   // NEW — JS slot :4994
if (asteroidContact is not null) return asteroidContact;

var friction = Math.Pow(Constants.BallFrictionBase, delta * 60);   // :142
```

`asteroidIndex` from JS is informational only; `StepResult` need not carry it (it has
no `AsteroidIndex` field and fixtures compare only `outcome`/`reason`). If desired for
diagnostics, add an optional `int? AsteroidIndex` to `StepResult`, but it is not
required for parity.

No change to `Sim.ReverseStepBall` (§Part 1.5).

#### B.6 Camera — `CameraRig.SetLevel` must include belt reach

`CameraRig.SetLevel` (CameraRig.cs:55) computes bounds from goal, start, and planet
orbits, but **not asteroids**. Belts reach `orbitRadius + radius` up to ~6.6 world
units (L18/L19), beyond some planet orbits, so add:

```csharp
foreach (var a in level.Asteroids)
    Include(level.SystemCenter, a.OrbitRadius + a.Radius);
```

(Belts are centered on the sun/systemCenter; including the max reach as a symmetric
`Include(center, reach)` frames the whole ring. `level.SystemCenter` is `(0,0)`.)
Max belt reach per level: L10 5.51, L16 6.35, L18 6.61, L19 6.53.

### C. Fixtures

Follow `spec-leveldata.md` §7 unchanged — **same shot set** (presets + 4 variations +
coverage grid), **same reverse coverage**, **same tolerances** (§7.6). No new fixture
schema fields: asteroid crashes surface as ordinary `outcome:"crash",
reason:"asteroid"` shot fixtures. The coverage selection (dedupe by
`(outcome,reason)`) will naturally keep asteroid-crash shots since `(crash,asteroid)`
is a distinct pair.

**Verification requirement:** for each level 10–19, confirm the generated forward
fixture contains **at least one** shot with `outcome == "crash"` and
`reason == "asteroid"`. (Empirically abundant — L10 coverage grid produced 170
asteroid crashes; the kept-shot selection will include one.) Add this as an assertion
in the fixture-export summary/verify step so a regression that stops the ball reaching
the belt fails loudly.

**Fixture-generation parameterization (currently hardcoded to one world).** The
shared module hardcodes world 1 (unity-export-shared.js:15–19):

```js
export const UNITY_LEVEL_COUNT = 10;
export const WORLD_INDEX = 0;
export const WORLD_NUMBER = WORLD_INDEX + 1;
export const WORLD_DEFINITION = WORLD_DEFINITIONS[WORLD_INDEX];
export const WORLD_FILE_PATH = 'unity/Assets/StreamingAssets/levels/world-1.json';
```

`createUnityLevels` / `createUnityLevel(index)` map the loop index **directly** to the
campaign index (works for world 1 because 0–9 == campaign 0–9). Parameterize cleanly
for two worlds:

1. Replace the module-level `WORLD_INDEX` singletons with a **`worldIndex` parameter**
   threaded through the public entry points. Introduce a helper:

   ```js
   export const WORLD_SIZE_LEVELS = WORLD_SIZE;   // 10
   export function worldFilePath(worldIndex) {
     return `unity/Assets/StreamingAssets/levels/world-${worldIndex + 1}.json`;
   }
   export function globalLevelIndex(worldIndex, levelInWorld) {
     return worldIndex * WORLD_SIZE + levelInWorld;   // world 0 → 0..9, world 1 → 10..19
   }
   ```

2. `createUnityLevels(worldIndex)` builds
   `Array.from({length: WORLD_SIZE}, (_, i) => createUnityLevel(globalLevelIndex(worldIndex, i)))`.
   `createUnityLevel(globalIndex)` stays as-is (calls `createLevelRuntime(globalIndex)`
   → rotate → validate).

3. `buildWorldExport(levels, worldIndex)` reads
   `WORLD_DEFINITIONS[worldIndex]` for `worldId`/`worldName`, sets
   `worldNumber: worldIndex + 1`, and `serializeLevel(level, globalLevelIndex(worldIndex, i))`
   so the emitted `index` is global (10–19 for world 2).

4. The coverage / reverse builders (`buildCoverageShots`, `buildReverseSequences`,
   `serializeShotFixture`) already take `levelIndex` and call
   `createUnityLevel(levelIndex)` / `simulateShot(...)` — pass the **global** index.
   Fixture paths (`getFixturePath`/`getReverseFixturePath`) already zero-pad
   `levelIndex` → `level-10-…` for world 2. No change beyond feeding global indices.

5. The two driver scripts `scripts/export-unity-levels.js` and
   `scripts/export-unity-fixtures.js` should **loop over `worldIndex ∈ {0, 1}`** (or
   accept a `--world`/env arg), writing `world-1.json`/`world-2.json` and the
   respective fixtures. Keep world 1 output byte-identical by ensuring the world-0 path
   produces the same global indices (0–9) and the same file path.

6. **`validateRuntimeLevel` (unity-export-shared.js:769):** remove `'asteroids'` from
   `LEVEL_OUT_OF_SCOPE_KEYS` (line 45) and add asteroid field assertions (index ==
   arrayIndex; finite `position`/`orbitRadius`/`baseAngleDeg`/`orbitAngularSpeed`/
   `radius`) so a bad asteroid fails at export too, mirroring §B.4. The exporter should
   assert the same invariants it expects the C# loader to enforce.

`REVERSE_FIXTURE_MIN_FLYING_STEPS = 40` still applies. With `sunGravityStrength = 0`
flights are near-ballistic; anchor-free segments that clear the belt (or crash bounds)
readily exceed 40 steps, so reverse coverage will find ≥1 sequence per level. If a
level unexpectedly yields none (all coverage flights crash on asteroids < 40 steps),
`buildReverseFixtureExport` already throws (unity-export-shared.js:217) — that is the
correct fail-loud; widen the power grid or accept per-level if it occurs (it did not
on L10).

### D. Out-of-scope reaffirmation

Everything `spec-leveldata.md` §8/§9 and `spec-physics.md` §16 list as out of scope
**stays rejected** for world 2 as well. In particular the loader/exporter reject lists
keep: `binarySystem`, `extraSuns`, `portals`, `dustClouds`, `meteorImpacts`,
`pulsarJets`, `redGiant` (level), and all planet mechanic keys (`splitSurface`,
`surfaceType`, `flicker`, `hidden`, `goalUnlock`, `orbitAnchor`, `slideAngularSpeed`,
`orbitDecayRate`, `orbitAround`, `destroyedByMeteor`, `fallIntoSunRadius`), plus
non-empty `turrets`, `orbitCenterIndex != null` (moons), and `goalUnlockRequired`.
**Only `asteroids` is promoted from rejected to supported.** `resolveMeteorContact`,
`resolveTurretSightContact`, `resolvePortalContact`, pulsar checks remain
null/no-op stubs. Levels 10–19 were verified to contain none of these.

---

## Appendix — worked reference (implementer self-check)

- **World file:** `worldId "asteroid-worlds-v1"`, `worldName "Asteroid Belts"`,
  `worldNumber 2`, `worldSize 10`, `levels[0].index == 10` … `levels[9].index == 19`.
- **L10 (`belt-gap`)** post-+90° export: `worldLevelNumber 1`, `sunGravityStrength 0`,
  `goalRadius 0.56`, 2 planets, **24 asteroids**. Asteroid 0:
  `index 0`, `position {2.4647257…, 4.6354748…}`, `orbitRadius 5.25`,
  `baseAngleDeg 62`, `orbitAngularSpeed 0.14`, `radius 0.152`. Touch radius for
  asteroid 0 = `0.152 + 0.2576 = 0.4096`.
- **Asteroid position at t:** angle_rad(t) = `62·π/180 + 0.14·t`; pos =
  `(5.25·cos, 5.25·sin)` about `(0,0)`.
- **Coverage sanity (L10, rotated):** 48×3×3 grid → outcomes goal 13 / landed 199 /
  crash 191 (asteroid 170, bounds 21) / settled 29. Fixtures WILL contain
  `crash/asteroid` shots.
- **Belt reach (camera):** max `orbitRadius + radius` per level — L10 5.51, L16 6.35,
  L18 6.61, L19 6.53.

---

## STRUCTURED SUMMARY (for the caller)

**Key asteroid runtime fields:** `position{x,y}` (recomputed each step),
`orbitRadius` (world), `baseAngleDeg` (**degrees**, orbit phase), `orbitAngularSpeed`
(**rad/s**, per-belt, signed), `radius` (world, **varies per asteroid**),
`spinSpeed`+`color` (visual only, sim ignores), `index`. Orbit is a plain **circle**
about the sun — no eccentricity, no `basePosition`, no cache.

**Contact-order slot:** JS `stepBall` runs sun → turret → planet → **asteroid** →
meteor → friction (game-core.js:4976–5006). Asteroid = immediately after planet,
before friction. In C# `Sim.StepBall`, insert `ResolveAsteroidContact` between
`ResolvePlanetContact` (Sim.cs:140) and the friction line (Sim.cs:142). Crash result:
`type:"crash", reason:"asteroid"` (verified literal). Touch radius =
`asteroid.radius + 0.28*0.92` (= radius + 0.2576).

**Surprises / gotchas:**
1. `sunGravityStrength == 0` for **all** asteroid levels — the sun still collides
   (0.42) but has **no gravity**; only planet gravity + goal pull act.
2. `orbitAngularSpeed` is **rad/s** but the position formula multiplies by `180/π` to
   add degrees to `baseAngleDeg` — do not double-convert; port verbatim.
3. `radius` **varies per asteroid**; `orbitAngularSpeed` varies **per belt** within
   one level (L16/18/19 are multi-belt).
4. Asteroids have **no time cache** — `setLevelTime` recomputes `position` in place
   every step (unlike planets' `orbitStateCache`).
5. `reverseStepBall` never resolves asteroid contact; the only asteroid interaction on
   rewind is `SetLevelTime` repositioning them (harmless).
6. Exported level `index` is **global (10–19)**; the loader's per-level index-equality
   check (currently `== loopIndex`) must be updated to expect the global index (or the
   world offset `(worldNumber-1)*worldSize + i`), or world 2 fails to load.
7. `+90°` rotation for asteroids is **already implemented** in
   `rotateAsteroids` (rotates `position` + `baseAngleDeg`; sizes/speeds invariant) —
   no exporter rotation change needed.

**Open questions:**
- Naming of the two-world driver: whether to loop `worldIndex ∈ {0,1}` inside the
  existing `scripts/export-unity-levels.js`/`export-unity-fixtures.js` or add a
  `--world` CLI arg. Either is fine; the spec assumes a `worldIndex`-parameterized
  shared module (§C). Confirm the world-1 output must stay byte-identical.
- Whether `world-1.json` should gain an empty `"asteroids": []` (simplest) or keep it
  omitted (guard emission). Loader treats both identically; pick per review taste.
- Whether `StepResult`/fixtures should record `asteroidIndex` (JS emits it,
  informational). Not needed for parity; add only if diagnostics want it.
