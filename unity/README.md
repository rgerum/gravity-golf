# Gravity Golf — Unity Presentation Layer

A first-playable Unity front end for the Gravity Golf port. It renders and drives
the pure-C# simulation core (`Assets/Scripts/Core`, namespace `GravityGolf.Core`,
double precision) for the 10 "Starter Belt" campaign levels. The core is
authoritative; the Unity layer only reads its state to render and writes a single
input back — the launch.

## Requirements

- Unity **6000.0.50f1** (Unity 6 LTS). Any 6000.0.x should open it.
- Package `com.unity.nuget.newtonsoft-json` (declared in `Packages/manifest.json`,
  auto-restored on open). No URP, no Input System, no other extra packages.

## Open & play

1. Open **Unity Hub → Add → Add project from disk**, and select the `unity/`
   folder (this directory).
2. Open the project (Unity resolves packages on first import — allow a minute).
3. Open the scene **`Assets/Scenes/Main.unity`** (it is intentionally empty).
4. Press **Play**.

There is no scene wiring to do. A `[RuntimeInitializeOnLoadMethod]` bootstrap builds
the camera, canvas/HUD, EventSystem, and all gameplay objects at runtime, so any
empty scene works.

## Controls

- **Aim:** press and drag anywhere on the play field. The launch fires **toward**
  the drag ("point at the target"), not away from it. Drag length = power, clamped
  to `MAX_DRAG_DISTANCE` (2.75 world units).
- **Release** past a small threshold to launch; a tiny drag/tap cancels.
- **Preview:** while dragging, a cyan trajectory line shows the forward-simulated
  shot (stepped on a cloned level so it never disturbs live state).
- **Retry** (bottom-left button, or the game-over modal) restarts the level.
- **Level select:** the numbered strip (bottom-right) jumps to any of the 10 levels.
- Works with mouse or single-touch.

## What it shows

- Dark space background, glowing sun, tinted/​spinning planets (colors from the
  level data's `core`/`glow` ints), teal landing rings, a purple-ringed "black hole"
  goal, and a clean white ball.
- Fixed origin-centered orthographic camera with the wide-screen zoom-out from the
  spec (no ball-follow, no per-level fit).
- HUD: world/level kicker, level name, par pill, power bar, status line, result
  banner (with medal/par/launches), and a game-over modal.

## In scope

Campaign levels 0–9, core mechanics: point-at-target aiming, three-vector launch
(relative + planet orbital + planet surface velocity), anti-into-planet clamp,
gravity flight, landing/relay chaining, goal capture, crash/settle → retry, level
advance, par/medal result.

## Out of scope (per spec)

Time-speed slider / rewind / undo, world-map interstitial, audio/haptics, portals,
hazards (lava/ice/turrets/pulsars/asteroids), monolith goal-unlock, portrait
playfield rotation, ghost replay, and persistent best-score storage. These are
either inert for L0-9 or deferred to later milestones.

## Architecture (thin views over the core)

- `GameBootstrap` — runtime entry point, builds everything.
- `GameController` — owns `LevelRuntime` + `BallState`, the fixed 1/120 step
  accumulator, the game-flow state machine, stroke counting, reset/advance.
- `AimController` — pointer/touch drag → aim direction + power, the
  `constrainLaunchDirection` clamp, and the cloned-level trajectory preview.
- `LaunchMath` — input-layer launch math (clamp + three-vector velocity assembly).
- `CameraRig` — fixed orthographic framing + screen→world mapping.
- `SunView` / `PlanetView` / `GoalView` / `BallView` / `TrajectoryPreview` —
  primitive-mesh renderers that read core state each frame.
- `HudController` — uGUI built in code.
- `LevelData` — loads `StreamingAssets/levels/world-1.json` (direct file read on
  desktop/editor, `UnityWebRequest` on Android).
- `MeshFactory` / `ColorUtil` / `Depth` — code-built discs/rings/materials, color
  conversion, and render-plane depth constants.

## Iteration workflow (fast feedback loops)

Different layers, different loops — from fastest to slowest:

| You changed | Loop | Command / action |
|---|---|---|
| Level data / balance | seconds, no editor restart | `npm run export:unity:levels`, then just press Play again (JSON is loaded at runtime) |
| Physics core (`Assets/Scripts/Core/`) | seconds, no Unity needed | `npm run verify:unity` (exports + C#9 compile gate + JS parity) |
| Game/view code (`Assets/Scripts/Game/`) | ~5s | save file → focus the Unity editor window (auto-refresh recompiles) → Play |
| Web game physics (`src/game-core.js`) | seconds | `npm run verify:unity` — parity failures pinpoint exactly where C# and JS diverge |

In-game hotkeys: **R** retry · **N** next level · **P** previous level.

One-time editor settings for instant Play (recommended):
1. **Edit → Project Settings → Editor → Enter Play Mode Settings**: check
   "Enter Play Mode Options", leave both reload boxes unchecked. Play starts in
   well under a second. (The code is domain-reload-safe: statics reset via
   `SubsystemRegistration`.)
2. **Edit → Preferences → Asset Pipeline → Auto Refresh: Enabled** (default) so
   external edits compile on window focus.

Keep `npm run verify:unity` green before committing; it is safe to run while
the editor is open.

### Headless screenshot tour

`bash scripts/screenshot-tour.sh` (Unity editor must be closed, xvfb required)
runs the real game under a virtual display and captures a settled still plus a
mid-flight preset shot for every level to `unity/Screenshots/` (portrait
1080x1920). Use it to review visual tweaks without opening the editor.
