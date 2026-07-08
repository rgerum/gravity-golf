# Gravity Golf — Unity Port: Interaction / Camera / HUD / Game-Flow Spec

Scope: the **Unity presentation + input + game-flow layer** for a first playable
covering campaign levels 0–9 (`createLevelRuntime(0..9)`), core mechanics only.
The pure-C# simulation core (physics, orbits, landing, goal capture, collision)
is specified separately in `spec-physics.md`; the level data contract is in
`spec-level-data.md`. This document is the contract for those two seams:

- **Input → core**: how a drag becomes a launch (direction, power, launch
  velocity assembly) and how the aim preview is simulated.
- **Core → views**: how MonoBehaviours read core state each frame to render.
- **Game flow**: the state machine (aiming / flying / landed / goal / crashed /
  settled), what advances level time, and how retry/reset/next-level work.
- **Camera + HUD**: framing and the minimum on-screen UI.

Everything is 2D gameplay math on the XY plane. The web build renders on a 3D
`XZ` plane with a top-down orthographic camera (world `y` → three.js `z`); in
Unity keep gameplay in `Vector2 (x, y)` and map to whatever render plane you
choose. All coordinates below are **core/world units** (the same units the JS
engine and exported JSON use). Source citations are `main.js:LINE` unless noted
as `game-core.js:LINE` / `progression.js:LINE`.

---

## 0. Constants (exact values)

From `game-core.js` (physics-owned, but the input layer references them):

| Name | Value | Source |
|---|---|---|
| `MAX_DRAG_DISTANCE` | `2.75` | game-core.js:12 |
| `LAUNCH_BASE_SPEED` | `1.9` | game-core.js:35 |
| `LAUNCH_DRAG_SPEED` | `3.4` | game-core.js:36 |
| `LAUNCH_MAX_SPEED` | `11.8` | game-core.js:37 |
| `COURSE.ballRadius` | `0.28` | game-core.js:1 (COURSE) |
| `COURSE.goalRadius` | `0.56` | game-core.js:1 |
| `COURSE.width / height` | `24 / 14` | game-core.js:1 |
| `COURSE.outBoundsX / outBoundsY` | `13.8 / 10` | game-core.js:1 |
| `SUN_COLLISION_RADIUS` | `0.42` | game-core.js:28 |

From `main.js` (presentation/input-owned):

| Name | Value | Source |
|---|---|---|
| `PHYSICS_STEP` | `1/120` s | main.js:462 |
| `MAX_PHYSICS_STEPS_PER_FRAME` | `4` | main.js:469 |
| `CAMERA_VIEW_SIZE` | `19.4` (world units, view height) | main.js:407 |
| `LANDSCAPE_CAMERA_ZOOM_MIN` | `0.74` | main.js:451 |
| `LANDSCAPE_CAMERA_ZOOM_START_ASPECT` | `1.45` | main.js:452 |
| `LANDSCAPE_CAMERA_ZOOM_END_ASPECT` | `2.35` | main.js:453 |
| `CONTROL_MIN_POWER` | `0.2` | main.js:482 |
| `CONTROL_MIN_ANGLE / MAX_ANGLE` | `-180 / 180` | main.js:480-481 |
| `DEFAULT_CONTROL_SHOT` | `{ angleDeg: 0, power: 1.8 }` | main.js:491 |
| `AIM_PREVIEW_MAX_POINTS` | `110` | main.js:1005 |
| launch min-drag threshold | `dragPower > 0.12` | main.js:7617 |
| aim-preview activation threshold | `dragPower > 0.14` | main.js:6983 |
| `TIME_SPEED_VALUES` | `[-1, 0, 1, 2]`, default index `2` → value `1` | main.js:492,1086,4846 |

> The scrub slider (rewind/pause/2x) is **out of scope** for the milestone: run a
> fixed `timeSpeed = 1`. See §9.

---

## 1. Drag-to-aim (the core interaction)

### 1.1 Where the drag starts — anywhere, relative pull

The drag does **not** have to start on the ball. `onPointerDown` records the
world point under the pointer as `dragStartWorld` (main.js:7571-7573). All
subsequent aim math is the **vector from that starting world point to the
current pointer world point** — a relative drag, not an absolute "point at this
world position". So the gesture works no matter where on the play area the player
first presses.

```
onPointerDown(e):
  if any modal/blocking state open OR ballIsMoving(): return   // main.js:7558
  point = screenToWorld(e)
  dragActive = true
  dragStartWorld = point
  dragPointerWorld = point
  updateDragState(point)
```

Gating for `onPointerDown` (main.js:7558-7568) — ignore the press if any of:
world map open, settings open, daily modal, game-over modal, goal-close
animation, `ballIsMoving()`, admin replay, or undo active. For the milestone the
only live ones are **game-over modal open** and **`ballIsMoving()`**.

`ballIsMoving()` (main.js:7368): true if `|velocity|² > 0.002` OR the ball is
`goaling` OR `crashed` (plus rewind/undo/portal states that are out of scope). So
you can start a new aim only when the ball is essentially at rest (anchored on a
planet) and not mid-outcome.

### 1.2 Screen → world mapping

`getWorldPointFromEvent` (main.js:7359-7366): convert the pointer to normalized
device coords against the canvas rect, raycast through the orthographic camera
onto the gameplay plane, return `(worldX, worldY)`.

In Unity with an orthographic camera looking down the gameplay plane, use
`Camera.ScreenToWorldPoint` (or a ray-plane intersect) and project onto the
gameplay plane, returning the 2D world coordinate. The mapping must be exact
enough that the pull vector in world units matches what the web build computes,
because power is a world-space distance.

### 1.3 Drag vector → aim direction + power (**point-at-target, NOT pull-back**)

`updateDragState(worldPoint)` (main.js:7379-7401):

```
pullVector = worldPoint - dragStartWorld
stretch    = min(|pullVector|, MAX_DRAG_DISTANCE)          // clamp to 2.75

if stretch < 0.0001:
   dragAnchor = ball.position; dragPower = 0
   setControlShot(stage, currentAngle, 0.2)                // idle
   return

direction  = constrainLaunchDirection(pullVector, stretch) // see §1.5
aimDirection = direction
dragAnchor = ball.position + direction * stretch
dragPower  = stretch
setControlShot(stage, angleDegFromDirection(direction), stretch)
```

Key semantics:

- **The launch fires in the same direction the player drags.** `aimDirection` is
  the normalized `pullVector` direction; the ball launches *toward* the drag, not
  away from it. This is "point at the target", the opposite of pull-back golf.
- **Power = clamped drag length in world units** (`0 … 2.75`). It is *not* a
  ratio; it is a distance that feeds `launchSpeedForDrag` directly.
- `dragAnchor` is a purely visual point (`ball.position + dir*stretch`) used to
  draw the aim band/handle. It is NOT the launch origin — the ball always
  launches from `ball.position`.

Angle helpers (main.js:3533-3543):
- `directionFromAngleDeg(a) = (cos(a·π/180), sin(a·π/180))`
- `angleDegFromDirection(d) = wrapSignedAngleDeg(atan2(d.y, d.x)·180/π)`
- `wrapSignedAngleDeg`: normalize to `[0,360)` then map `>180` to `−360` →
  result in `(−180, 180]`.

### 1.4 Launch velocity assembly

On release the launch velocity is the **sum of three vectors** (main.js:7516-7527):

```
launchDirection = constrainLaunchDirection(aimDirection, dragPower)   // §1.5
relativeVelocity = launchVelocity(launchDirection, dragPower)         // core
bodyVelocity     = anchored ? getPlanetVelocity(level, planetIdx, ballTime) : 0
surfaceVelocity  = anchored ? getPlanetSurfaceVelocity(level, planetIdx,
                                     ball.anchorNormal, ball) : 0
ball.velocity = relativeVelocity + bodyVelocity + surfaceVelocity
```

- `launchSpeedForDrag(dragPower) = min(11.8, 1.9 + dragPower*3.4)`
  (game-core.js:4799). At `dragPower = 0` speed is still `1.9`; at the clamp
  `2.75` speed is `1.9 + 9.35 = 11.25`.
- `launchVelocity(direction, dragPower) = normalize(direction) * launchSpeedForDrag`
  (game-core.js:4803).
- `getPlanetVelocity` / `getPlanetSurfaceVelocity` are core functions (orbit
  linear velocity of the anchored planet + spin/slide surface velocity at the
  ball's anchor normal). These are **owned by the physics core**; the input layer
  just calls them. They matter because the ball inherits the moving planet's
  motion at launch.

The three-vector sum is essential for parity — a launch off a moving planet is
noticeably off if you drop the inherited terms.

### 1.5 `constrainLaunchDirection` — anti-into-planet clamp (INPUT-layer logic)

`constrainLaunchDirection(direction, power)` (main.js:4552-4592) lives in the
interaction layer and must be reimplemented in Unity (it is *not* in the shared
core, though it calls core helpers). It prevents the player from aiming into the
planet they're launching from:

```
n = normalize(direction)
if not anchored: return n

anchorNormal = normalize(ball.anchorNormal)            // outward surface normal
tangent      = (-anchorNormal.y, anchorNormal.x)
relSpeed     = max(1e-4, |launchVelocity(n, power)|)
inherited    = getPlanetVelocity(...) + getPlanetSurfaceVelocity(...)   // at anchor

maxInwardDeg = 15
minSafeNormalVel = -relSpeed * sin(15°)
requiredNormalComponent = (minSafeNormalVel - dot(inherited, anchorNormal)) / relSpeed

if requiredNormalComponent <= -1: return n             // no constraint needed
if requiredNormalComponent >=  1: return anchorNormal  // must fire straight out

requestedRelAngle = atan2(dot(n, tangent), dot(n, anchorNormal))
maxRelAngle       = acos(clamp(requiredNormalComponent, -1, 1))
clamped           = clamp(requestedRelAngle, -maxRelAngle, maxRelAngle)
return normalize(anchorNormal*cos(clamped) + tangent*sin(clamped))
```

Net effect: the *resulting total* launch velocity is kept from pointing more than
~15° into the surface, accounting for inherited planet motion. Apply the same
clamp both for the actual launch (§1.4) and the aim preview (§1.6) so the preview
matches the shot.

### 1.6 Aim preview (trajectory dots)

`updateAimPreview` (main.js:6979-7053). The preview is a **dotted forward
simulation of the real core**, not an analytic curve.

Activation (main.js:6980-6986): preview setting `!= 'off'`, `dragActive`,
`dragPower > 0.14`, not `ballIsMoving()`, not admin replay. (Milestone: a single
on/off is fine; the web build has `off` / `hint` / `full`.)

Procedure:
1. Use a **separate cloned level runtime** (`aimPreviewLevel`) so stepping doesn't
   mutate the live level's time/hazard state (main.js:6869, 6867-6868 comment).
   Create it once per level load as an independent copy of the runtime. In C# this
   is the `LevelRuntime.Clone()` seam (`spec-physics.md` §17): `stepBall`/
   `setLevelTime` mutate the level in place, so the preview must run on a deep copy.
2. `setLevelTime(aimPreviewLevel, ballTime)` — sync the clone to the current
   time (main.js:6993).
3. Build a preview ball exactly like the real launch (§1.4): velocity =
   `relativeVelocity + bodyVelocity + surfaceVelocity` using
   `constrainLaunchDirection(aimDirection, dragPower)`; copy `position`, `time`,
   `landingCount`, set `launchGracePlanetIndex = anchoredPlanetIndex`,
   `anchorPlanetIndex = null`, `anchorNormal = null`, `heat = ball.heat`
   (main.js:6994-7017).
4. Horizon: `full` = `3.0` s, `hint` = `1.05` s. Step size `1/60`.
   `totalSteps = floor(horizon / (1/60))` (main.js:7019-7021).
5. Loop stepping the clone with `stepBall(aimPreviewLevel, previewBall, 1/60)`;
   **record every other step** (`stepIndex % 2 == 0`) as a dot, up to
   `AIM_PREVIEW_MAX_POINTS = 110` (main.js:7023-7031).
6. **Stop early** if a step returns `goal | landed | crash | settled`
   (main.js:7032-7034). So the dotted line ends where the shot would end.
7. Dot color/fade: base color `(0.5, 0.82, 1.0)` (cyan) with additive fade along
   the path (main.js:7044-7046); render only if `pointCount > 1`.

> Note the preview uses `1/60` steps while the live sim uses `1/120`
> (`PHYSICS_STEP`). Keep this difference — the preview is intentionally coarser.

### 1.7 Cancel gesture / min-drag threshold

On `onPointerUp` (main.js:7610-7642):

- If `dragPower > 0.12`: **launch** with `(aimDirection, dragPower, dragAnchor)`
  (main.js:7617,7630). (The ice-lock branch at 7618 is out of scope.)
- Else: **cancel** — `dragActive = false; dragPower = 0`, reset drag vectors to
  ball position, show "Launch cancelled." (main.js:7634-7641). A tap or tiny drag
  is a no-op.

`pointercancel` is wired to the same handler as `pointerup` (main.js:7647). In
Unity, treat a lost touch / focus loss as a cancel (release with the last power).

### 1.8 Launch presets & "control shots" (per-stage default aim)

`state.controlShots` = one `{angleDeg, power}` per launch stage, seeded from
`level.launchPresets` (main.js:3510-3512). `getActiveStageIndex() =
min(ball.landingCount, controlShots.length-1)` (main.js:3515-3516). Each drag
overwrites the current stage's control shot (main.js:7400).

For the milestone this matters in two small ways:
- **Par = number of launch presets** (min 1) — see §7.
- The **HUD power bar** shows the current stage's stored power when *not*
  dragging: `shownPower = dragActive ? dragPower : getControlShot().power`
  (main.js:6891). So before the first drag the bar reflects the preset power.

You do **not** need to auto-aim from presets; presets are only the remembered
default aim + the par source. `adminSolutions` (auto-play) is out of scope.

---

## 2. Launch flow (release → flight)

`launchShot(direction, power, anchor)` (main.js:7505-7555), stripped to milestone
essentials:

1. (Save undo checkpoint — out of scope; skip.)
2. `launchPlanetIndex = ball.anchorPlanetIndex`.
3. Compute `ball.velocity` per §1.4.
4. Detach from planet: `ball.launchGracePlanetIndex = launchPlanetIndex`,
   `ball.anchorPlanetIndex = null`, `ball.anchorNormal = null`,
   `ball.anchorSinceTime = ballTime`, `ball.portalCooldown = 0`,
   `landedPlanetIndex/Name` cleared (main.js:7530-7536).
5. `state.shots += 1` (main.js:7538) — this is the launch counter for par.
6. `dragActive = false; dragPower = 0`; reset drag vectors to ball position
   (main.js:7546-7550).
7. `roundSettled = false` (main.js:7551) → the flight is now "in progress".
8. Transition game-flow state `aiming → flying`.

The `launchGracePlanetIndex` lets the ball leave its home planet without
immediately re-colliding; the core consumes it. Just pass it through.

---

## 3. Game-flow state machine

The web build keeps flags on `state.ball` rather than an enum; model it as an
explicit enum in Unity. States and transitions for the milestone:

| State | Meaning | Enter when | Ticking behavior |
|---|---|---|---|
| **Aiming** | Ball at rest on a planet, awaiting input | after reset, landing, or cancelled drag | advance level time + ride anchored planet (§4.2); accept drag input |
| **Flying** | Ball in free flight | on launch (§2) | fixed-step `stepBall` (§4.1) |
| **Landed** | Ball anchored on a *relay* planet mid-run | `stepBall` → `landed` | same as Aiming, but chain continues; new drag allowed |
| **Goal** | Ball captured by the goal | `stepBall` → `goal` | play capture anim, then advance level (§5) |
| **Crashed** | Ball destroyed | `stepBall` → `crash` | play crash anim, then game-over → reset (§6) |
| **Settled** | Ball stopped in open space (not anchored, not goal) | `stepBall` → `settled` | game-over → reset (§6) |

Aiming and Landed are the same runtime behavior (rest + time advance + input);
the distinction is only cosmetic (Landed shows a "relay locked" message and a
relay pulse). You can collapse them into one "AtRest" state with a `landingCount`.

### 3.1 Per-frame update order (from `animate`, main.js:8849-8933)

```
delta = min(realDeltaTime, 0.033)                 // clamp big frames (main.js:8850)
physicsAccumulator = min(physicsAccumulator + delta,
                         PHYSICS_STEP * 4)          // main.js:8868
while physicsAccumulator >= PHYSICS_STEP:          // main.js:8873
    updatePhysics(PHYSICS_STEP)                     // 1/120 fixed step
    physicsAccumulator -= PHYSICS_STEP
updateAimPreview()                                  // main.js:8887
... update view interpolation (ball transform, cue, decor) ...
render()
```

Fixed 1/120 stepping with a max of 4 substeps/frame and a 0.033 s delta clamp.
Reproduce this exactly: parity fixtures from the JS engine assume this cadence.

---

## 4. Advancing simulation & time

`updatePhysics(delta)` (main.js:8088+) branches on state. Milestone-relevant
branches:

### 4.1 Flying (ball has velocity, not anchored)

main.js:8333-8412:

```
result = stepBall(state.level, state.ball, delta)     // delta = PHYSICS_STEP
switch result.type:
  'goal'   -> beginGoal(result)          // §5
  'landed' -> beginLanding(result)       // §3 Landed; message + rest
  'crash'  -> beginCrash(result, ...)    // §6
  'settled'-> if !roundSettled: game-over 'settled'   // §6
  'flying' -> continue
```

`stepBall` advances `level.time`, all orbits/spin, the ball, and returns the
outcome. It is **the core** — do not reimplement here. (The web build also
records ghost/trail samples and portal audio; all out of scope.)

### 4.2 At rest (anchored, velocity ≈ 0) — level keeps living

main.js:8251-8331. When `|velocity|² < 1e-6` and anchored:

```
currentTime = ball.time
nextTime    = max(startTimeSeconds, currentTime + delta * timeSpeed)  // timeSpeed=1
appliedDelta = nextTime - currentTime
if appliedDelta > 1e-6:
    setLevelTime(level, nextTime)          // orbits/spin/goal timing advance
    ball.time = nextTime
    (maybeCrashAnchoredBallOnConsumedPlanet — out of scope for L0-9)
    anchorResult = advanceBallAnchor(level, ball, appliedDelta)  // ride the planet
    if anchorResult.type == 'crash': beginCrash(...)   // planet consumed/vanished — rare in L0-9
if dragActive: updateDragState(dragPointerWorld)       // re-solve aim as planet moves
// (web build also runs an at-rest goal-close check here — inert in scope, goal always open; omit. §5.3)
```

**Critical**: even while the player is just aiming, the level is alive — planets
orbit, planets spin, the goal timer counts down, and the **anchored ball rides
its planet** via `advanceBallAnchor` (game-core.js:3981): it rotates
`ball.anchorNormal` by the planet's spin (and slide), then `syncBallToAnchor`
repositions `ball.position = planet.position + anchorNormal * surfaceRadius`.
`setLevelTime` moves the planet; `advanceBallAnchor` keeps the ball glued to the
surface. Both are core functions — call them; don't reinvent.

Because `updateDragState` is re-run every frame while dragging (main.js:8309),
the aim band and preview keep tracking a moving/spinning launch planet.

`timeSpeed` = `getEffectiveTimeSpeedValue()` → **1** for the milestone (§9).

---

## 5. Goal capture & level completion

### 5.1 `stepBall` → `goal`

`beginGoal(result)` (main.js:7171-7220). Milestone essentials:

- `ball.goaling = true`, `ball.velocity = 0`, start a shrink/sink capture
  transition (`ball.transition` grows at `delta*3.6`, main.js:8141).
- Compute the result:
  - `par = getLevelPar(level)` (§7).
  - `launches = max(1, state.shots - levelStartStats.shots)`.
  - `flightTime = max(0, ball.time - level.startTimeSeconds)`.
  - `golfResult = recordLevelResult(level.id, {par, launches, retries, flightTime})`
    → `{ medal, golfName, diff, firstClear, improved, best }` (progression.js:127).
- Show the **result banner** (§8.3), spawn a burst + small screen shake, play
  goal/medal SFX.

### 5.2 Capture animation → advance to next level

In `updatePhysics` goaling branch (main.js:8140-8168): the ball shrinks/sinks;
when `transition >= 1`, hide the ball and advance:

```
nextIndex = (levelIndex + 1) % LEVELS.length
resetBall(nextLevel.name, nextLevel.summary, {scored:true, advanceLevel:true})
```

(The web build may show a world-map interstitial after each world of 10; for the
first 10 levels — a single world "Starter Belt" — you can go straight to the next
level, or stop after level 10. The world-map screen is out of scope.)

### 5.3 Goal is always open (no open/close window in scope)

**For the milestone the goal is unconditionally open — do not build a goal-window
timer or a "goal-closed" path.** `GOAL_ALWAYS_OPEN = true` is hard-coded
(game-core.js:40) and `goalUnlockRequired` is `false` for all of L0-9, so
`isGoalOpen(level, time)` returns `true` for every time (game-core.js:3891-3899).
Consistent with `spec-physics.md` §7.4 and `spec-leveldata.md` §6.3.

- `goalOpenSeconds` **is exported but never gated on** (its per-level value is
  irrelevant; the sim ignores it). Implement the core as `isGoalOpen(...) => true`;
  the "goal-closed" crash branch and the at-rest goal-close check
  (main.js:8322-8324) are **unreachable in scope** — you may omit them entirely.
- The goal **pull** (`goalPullRadius`, `goalPullStrength`) is a live physics-core
  force and IS in scope — the input layer does nothing with it beyond rendering the
  ring (§10.4). (Do not confuse the pull with an open/close window; they are
  unrelated.)

`goalUnlockRequired` is **false** for all of L0-9 (goal starts unlocked); the
monolith-unlock mechanic is out of scope.

---

## 6. Crash / settle → game over → reset

### 6.1 Crash outcomes present in L0-9

`stepBall` crash `result.reason` values and their meaning. For levels 0-9 the
reachable ones are **`sun`**, **`planet`**, and **`bounds`**. The full mapping
(main.js:8357-8405) for message + crash-kind:

| reason | message | crashKind (anim) | In L0-9? |
|---|---|---|---|
| `sun` | "Burned in the sun." | `sun` | yes (fall into sun) |
| `planet` | "Planet impact." | `planet` | yes (hit a planet too hard / wrong angle) |
| `bounds` | "Lost in open space." | `bounds` | yes (leave the field) |
| `goal-closed` | "Event horizon collapsed." | (goal-close anim) | **no — unreachable** (`GOAL_ALWAYS_OPEN`, §5.3); do not build |
| `split-side` | "Wrong side." | `planet` | no |
| `lava`,`ice`,`turret`,`pulsar`,`asteroid`,`meteor`,`planet-consumed`,`planet-vanished` | various | various | **no** — see out-of-scope |

The crash animation kind only changes visuals (sun/planet/bounds have different
shrink+tint animations, main.js:8171-8248). For the milestone you may use a
single generic crash effect keyed off `reason`.

### 6.2 Out-of-bounds ("bounds")

The core decides bounds crashes; the field limits are `COURSE.outBoundsX = 13.8`,
`COURSE.outBoundsY = 10` (game-core.js:1). A ball whose position exceeds these
returns `crash reason:'bounds'` (game-core.js:5017). The input layer just handles
the result; no bounds logic lives here.

### 6.3 Settled

`stepBall` → `settled` (game-core.js:5024): the ball stopped moving in open space
(not on a landable planet, not in the goal). Treated as a failure → game over
`'settled'` (main.js:8409-8412), `countReset: true`.

### 6.4 Game-over → reset

`showGameOverModal(reason, hint, {countReset})` (main.js:4788) opens a modal with
a **Retry** button (and Undo, which is out of scope). Retry:

`restartLevel()` (main.js:7649-7663) → `resetBall(...)` with the same level.

`resetBall(message, hint, options)` (main.js:7091-7169) — the canonical
level-reset. Milestone essentials:

1. Hide game-over/goal-close UI.
2. If `advanceLevel`: `applyLevel((levelIndex+1) % LEVELS.length)` else
   `applyLevel(levelIndex)` — **rebuild the level runtime from data**
   (`createLevelRuntime`), rebuild all views, and re-clone `aimPreviewLevel`
   (main.js:6815-6875).
3. `setLevelTime(level, level.startTimeSeconds ?? 0)` — reset orbit/spin/goal
   clock to the level's start time.
4. `freshBall = createBallState(level)` (core) — places the ball anchored on
   `startPlanetIndex` at the start angle. Copy its position/velocity/time/anchor
   fields onto the live ball (main.js:7119-7140).
5. Clear drag state, set `roundSettled = true`, state → **Aiming**.
6. `syncHud()`.

**Reset is a full rebuild** — do not try to "rewind"; re-run
`createLevelRuntime(index)` and `createBallState` from the exported data.

`countReset`/`resets` feeds retry counting; not needed for the milestone beyond
optionally displaying a retry count.

`canRetryLevel()` (main.js:4594): retry is allowed unless the ball is `goaling`
or a goal-close animation is running (and admin/undo/rewind, all out of scope).

---

## 7. Par & medals (progression.js)

- **Par** = `max(1, level.launchPresets.length)` (progression.js:28-31). For
  L0-9: levels 0-4 → par **1**, levels 5-9 → par **2**.
- **Medal** = `computeMedalTier(par, launches)` (progression.js:69-84):
  - `launches < par` OR (`launches == 1 && par > 1`) → **ace** (`🌟`)
  - `launches <= par` → **gold** (`🥇`)
  - `launches <= par + 1` → **silver** (`🥈`)
  - else → **bronze** (`🥉`)
- **Result name** = `getGolfResultName(par, launches)` (progression.js:33-59):
  Ace / Eagle / Birdie / Par / Hole in One / Bogey / Double Bogey / `+N Over`.
- **Best** persists per `level.id` in local storage; keeps the best (fewest
  launches, then fastest flight time), and never downgrades a stored medal
  (progression.js:127-160). For the milestone, persisting best is optional;
  medals/result banner are the visible part.
- Par streak (progression.js:203) is optional polish; skip or show a simple
  streak count.

---

## 8. HUD (uGUI)

Minimum HUD for the milestone. Field names are the web DOM ids; recreate as uGUI
elements bound by a `HudController`.

### 8.1 Persistent HUD

| Element | Content | Source |
|---|---|---|
| Level kicker | `World {worldNumber} · {worldName}` (e.g. "World 1 · Starter Belt") | main.js:6853 |
| Level label | `Level {index+1} / {LEVELS.length}` | main.js:6854 |
| Level name | `level.name` (e.g. "Open Lane") | main.js:6856 |
| Par pill | `Par {par}` or `Par {par} · Best {n} {medalEmoji}` | main.js:6893-6898 |
| Power bar | `scaleX(max(0.04, shownPower / 2.75))`; `shownPower = dragActive ? dragPower : currentPreset.power` | main.js:6891-6892 |
| Status line + hint | `state.message` / `state.hint` (transient guidance text) | main.js:6877-6879 |
| Retry button | calls `restartLevel()` | main.js:7665 |

Optional pills the web build shows (skip or stub): run-status, heat, streak. **Do
NOT build a goal-window countdown** — the goal is always open in scope
(`GOAL_ALWAYS_OPEN`, §5.3), so there is no window to count down; it would render a
meaningless value.

### 8.2 Status messages (nice-to-have, drive from state)

Examples the web build sets: on drag start "Stretch and release." / "Point the
pull where you want the launch to begin." (main.js:7584-7585); while dragging
"Release to launch." + `Burn loaded: {power}/{2.75}` (main.js:7604-7605); on
launch "Flight underway. {level.name}." (main.js:7552); on landing "Relay locked
on {planet}." (main.js:7342); on cancel "Launch cancelled." (main.js:7639).

### 8.3 Result banner (on goal capture)

`showResultBanner(result)` (main.js:6916-6942):

- Class `result-banner is-{medal}` (color-code by medal).
- Kicker: `{worldName} · Hole {worldLevelNumber}`.
- Title: `result.golfName` (e.g. "Birdie", "Par", "Ace").
- Detail line (joined by ` · `): `{medalEmoji} {medalLabel}`, `Par {par}`,
  `{launches} launch(es)`, plus `First clear` / `New best` when applicable
  (main.js:6923-6939).
- Auto-hides after `3400 ms` (main.js:6941).

Then the level auto-advances (§5.2). A **Next** button is not required (advance is
automatic); a retry is available via the persistent HUD before capture completes.

### 8.4 Game-over modal (on crash/settle)

Shows the failure reason/hint (§6.1) and a **Retry** button
(`gameOverRetryButton → restartLevel`, main.js:7667). Undo button → out of scope
(hide it). While the modal is open, input is gated (§1.1).

---

## 9. Time speed (milestone simplification)

The web build has a scrub slider `TIME_SPEED_VALUES = [-1, 0, 1, 2]`
(rewind/pause/normal/fast) with default index 2 (value **1**). Rewind (`-1`) and
the undo/rewind-playback system are **out of scope**.

Milestone: **fix `timeSpeed = 1`.** Level time only advances forward, at real
time, via the fixed 1/120 stepping in §3.1 and the at-rest advance in §4.2. Do
not implement the slider, pause, or 2x for the first playable (add later).

---

## 10. Visual minimums (so it reads as the same game)

All shapes are simple; colors are hex. `planet.core` / `planet.glow` in the
exported data are **decimal ints** — convert to RGB (`core = 15901286` =
`0xF2AFA6`). Background `scene.background = 0x040812` (near-black navy,
main.js:405).

### 10.1 Ball

Sphere/disc radius `COURSE.ballRadius = 0.28`, color `palette.ball = 0xFAF7EF`
(off-white) (main.js:874-877). Optional: velocity-stretch squash and a heat tint
(both cosmetic, main.js:7428-7460) — skip for the first pass.

### 10.2 Planets

Per planet (main.js:6265-6630):

- Body: sphere/disc radius `planet.radius`, surface color `planet.core`, accent
  color `planet.glow`.
- **Landing ring** if `planet.landable`: a ring from `planet.radius + 0.2` to
  `planet.landingRadius ?? planet.radius + 0.48`, color `0x75F3D9` (teal), low
  opacity (main.js:6614-6629). This tells the player where they can land.
- **Spin**: rotate the planet's visual by `planet.spinSpeed` over time (cosmetic;
  the gameplay-relevant spin is already applied to `anchorNormal` by the core).
  For L5-9, `spinAngularSpeed ≈ 0.05–0.1`.
- **Orbit path**: optional thin ring at the orbit radius (main.js:6286+). Planets
  in L0-4 are static (`orbitSpeed` may be 0 or small); L5-9 have orbiting
  planets. The planet's live position comes from `setLevelTime` each frame — just
  read `planet.position` and place the view there.

### 10.3 Sun

Sphere radius `0.42`, color `0xFFDD8F`, emissive `0xFFB347`, bright/glowy
(main.js:564-575). Fixed at `level.sun` (origin `(0,0)` for L0-9). A soft corona
ring is optional. The sun's *collision* radius is `SUN_COLLISION_RADIUS = 0.42`.

### 10.4 Goal ("black hole")

At `level.goalCenter` (main.js:706-755):

- Dark disc, radius `COURSE.goalRadius = 0.56`, color `palette.blackHole =
  0x060109`.
- Glow ring from `goalRadius + 0.14` to `goalRadius + 0.35`, color
  `palette.blackHoleGlow = 0x8A62FF` (purple), ~0.54 opacity.
- (The web build has an optional countdown arc ring showing the goal-open
  fraction, but the goal is always open in scope — §5.3 — so there is no fraction
  to show. **Do not build it.**)

### 10.5 Aim cue

While `dragActive` and the ball is at rest (main.js:7475-7503):

- **Aim band**: a stretched line/quad from `ball.position` toward `dragAnchor`,
  color `palette.band = 0xFF7D58` (coral), length = `|dragAnchor - ball.position|`.
- **Drag handle**: a small marker at `dragAnchor`, color `palette.handle =
  0xFFC85C` (amber).
- Plus the cyan aim-preview dots from §1.6.

### 10.6 Camera framing (§11) — no per-level bounds fitting

---

## 11. Camera

The web camera is a **fixed, world-origin-centered orthographic camera** — it
does **not** follow the ball and does **not** fit per-level bounds. Levels are
authored around the sun at the origin, and the camera frames a fixed world
region.

`getViewportMetrics()` (main.js:1273-1304) + `updateCameraProjection()`
(main.js:8761-8772):

```
aspect        = screenWidth / screenHeight
// (portrait-rotate branch: out of scope — assume landscape/normal orientation)
referenceAspect = aspect
landscapeT    = clamp((referenceAspect - 1.45) / (2.35 - 1.45), 0, 1)   // 0..1
cameraScale   = lerp(1, 0.74, landscapeT)                               // zoom out on wide screens
worldViewHeight = 19.4 * cameraScale
worldViewWidth  = worldViewHeight * referenceAspect

orthoHalfHeight = worldViewHeight / 2
orthoHalfWidth  = worldViewWidth  / 2
// camera centered at world origin (0,0), looking straight down the gameplay plane
```

Implementation notes for Unity:
- Orthographic camera centered on world `(0,0)`. `Camera.orthographicSize` =
  `worldViewHeight / 2` (Unity's orthographic size is half the vertical view
  height). Unity fits height to the viewport automatically and derives width from
  aspect, which matches the formula above (`worldViewWidth = height * aspect`).
- Apply the wide-screen zoom-out: `orthographicSize = (19.4 * cameraScale) / 2`
  with `cameraScale = lerp(1, 0.74, landscapeT)`. On a "normal" aspect (≤ 1.45)
  `cameraScale = 1`, so `orthographicSize = 9.7`.
- **Do not** implement the portrait `playfieldRotated` branch
  (main.js:1277,8763) for the milestone — target landscape / typical aspect. It
  rotates the whole playfield 90° for tall phone screens; add later.
- Near/far are cosmetic for an ortho camera (web uses `0.1 / 60`). Set a depth
  range that contains your gameplay plane.

Since the view height is fixed at `19.4` world units (before zoom) centered on
the origin, and `outBoundsY = 10` (±10 in y), the whole playable field is visible
without any per-level camera fitting. Just recreate the fixed frame.

---

## 12. Unity mapping (thin views over the pure-C# core)

Keep the C# **simulation core** authoritative (owns `Level`, `Ball`, `stepBall`,
`setLevelTime`, `advanceBallAnchor`, goal/collision). MonoBehaviours are **thin
views + input adapters** that read core state each frame and write only input
(the launch) back into the core.

```
GameBootstrap (MonoBehaviour)
  - Loads exported level JSON (resolved runtime for level N at time 0).
  - Rehydrates a C# Level runtime; sets level time to startTimeSeconds.
  - Instantiates a SunView, one PlanetView per planet, a GoalView, a BallView.
  - Owns the GameFlow state machine (§3) and the fixed-step loop (§3.1).
  - On reset/next: rebuild the Level from data (createLevelRuntime equivalent)
    and re-instantiate views.

GameLoop (in GameBootstrap or its own component)
  - Accumulator fixed-step at 1/120 (§3.1); calls core stepBall / setLevelTime /
    advanceBallAnchor per §4; dispatches goal/landed/crash/settled to GameFlow.

CameraRig (MonoBehaviour on the orthographic Camera)
  - Fixed at world origin; sets orthographicSize per §11 each frame/resize.

AimController (MonoBehaviour)
  - Handles pointer/touch down/move/up (§1). Screen→world via the CameraRig.
  - Computes aimDirection + dragPower + constrainLaunchDirection (§1.3-1.5).
  - Owns a *cloned* preview Level and produces the aim-preview dots (§1.6)
    by stepping the clone; renders them via an AimView.
  - On release above threshold, calls GameFlow.Launch(direction, power).
  - Gated by GameFlow state (only when AtRest and no modal open).

AimView       - renders the aim band, handle, and preview dots (§10.5, §1.6).
BallView      - reads Ball.position each frame, places the ball mesh; optional
                squash/heat cosmetics; plays capture/crash animations.
PlanetView    - reads Planet.position each frame (moved by setLevelTime); applies
                cosmetic spin; draws landing ring + orbit path (§10.2).
GoalView      - static at goalCenter; disc + glow ring (no countdown arc — goal
                always open, §5.3).
SunView       - static at level.sun; glowing sphere (§10.3).
HudController (uGUI)
  - Binds level name/kicker/par/power-bar/status/result-banner/game-over modal
    (§8). Reads GameFlow + progression results; Retry → GameFlow.RestartLevel().
```

Data flow each frame:
1. `GameLoop` steps the core (physics or at-rest time advance).
2. Views read core state (`ball.position`, `planet.position`, level time, goal
   timing) and update transforms/visuals. Views never mutate simulation state.
3. `AimController` is the only writer into the core, and only via
   `GameFlow.Launch(...)`.

Parity: `AimController.constrainLaunchDirection` and the launch-velocity assembly
(§1.4-1.5) must match `main.js` exactly, since they determine the initial
velocity the parity-tested core then integrates. Generate at least one fixture
per level that captures `(dragStartWorld, dragPointerWorld, ballTime, anchor
state) → ball.velocity at launch` to lock the input math against the JS build.

---

## 13. Out of scope (stub behavior)

These fields/mechanics are present in the exported runtime for L0-9 but are
**empty/inert** for these levels, or belong to later milestones. The C# input/
view layer should **ignore** them (render nothing / no behavior); the core should
**ignore or throw at load** per `spec-physics.md`.

- **Empty arrays for L0-9** (present but length 0 / null): `portals`,
  `dustClouds`, `asteroids`, `meteorImpacts`, `pulsarJets`, `extraSuns`,
  `binarySystem`, `turrets` (per planet). Ignore.
- **`adminSolutions`** — designer auto-play/replay. Ignore (no auto-play UI).
- **Undo / rewind** (`undoButton`, `startUndo`, `rewindPlayback`, negative time
  speed, in-flight checkpoints). Ignore; hide the Undo button.
- **Time-speed slider** (pause / 2x / rewind). Fix `timeSpeed = 1` (§9).
- **World-map interstitial**, daily orbit, leaderboards/community stats,
  ghost replay, audio/music/haptics, flair/juice/screen-shake, near-miss,
  slow-mo, star-field density tuning, settings panel. Ignore for the milestone
  (audio/haptics can be added in a later phase).
- **Portrait `playfieldRotated`** camera rotation (§11). Ignore; target landscape.
- **Surface types** `ice` / `lava` and their launch locks / heat overheating
  (`getIceLaunchLockRemaining`, lava overheat). None of L0-9 use them. Ignore.
- **Monolith goal-unlock** (`goalUnlockRequired`, `goalUnlock`, `goalUnlockTime`)
  — `goalUnlockRequired` is `false` for all of L0-9; treat goal as always
  unlocked. Ignore the unlock reveal.
- **Vibe-jam portals**, flicker/collapse planet states, orbit decay, red-giant
  suns. Not used by L0-9. Ignore.
- **`heat`** ball field — cosmetic for L0-9 (no lava). Keep the field for core
  parity but render nothing.

If the core encounters any of the above with a *non-empty/active* value while
loading an L0-9 level, it may throw at load time to surface an export mistake;
otherwise ignore.
