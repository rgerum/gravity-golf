# Unity Mobile Rewrite Plan

This plan treats the Unity version as a staged port of the existing Gravity Golf
web game, not a big-bang rewrite. The goal is to prove the core game feel in
Unity quickly, then rebuild the app, content, and commercialization systems
around that playable base.

## Recommended Direction

- Use Unity for the mobile game rewrite.
- Use a 3D scene with an orthographic camera, while keeping gameplay math 2D.
- Port the custom orbital physics from `src/game-core.js` instead of relying on
  Unity physics for the core simulation.
- Start with the current level data as the source for migration.
- Use JSON as the initial interchange format, then import into Unity
  `ScriptableObject` assets for long-term level authoring.
- Keep Convex initially for existing leaderboard/stat features unless there is a
  clear reason to move those services later.
- Add Unity IAP and related commercialization features after the core game is
  stable on device.

## Phase 1: Technical Spike

Build the smallest playable version of the game in Unity.

1. Create a minimal Unity project.
2. Rebuild one simple level with a ball, sun, one planet, and goal.
3. Port the core orbital gravity math from `src/game-core.js` into C#.
4. Implement drag-to-aim and release-to-launch for desktop and touch.
5. Verify the game feel: gravity strength, launch power, collision, landing, and
   goal capture.
6. Confirm the rendering approach: 3D scene objects with an orthographic camera,
   using 2D gameplay coordinates.

Success criteria:

- One level is playable on desktop.
- One level is playable on a real Android device.
- Launch, flight, landing, and goal capture feel close enough to the current
  game to justify continuing the port.

## Phase 2: Core Game Port

Port the reusable game systems before rebuilding all UI and content.

1. Create Unity/C# equivalents for:
   - course constants
   - vector math
   - ball state
   - planet definitions
   - level runtime state
   - gravity stepping
   - collision and landing
   - goal capture
   - time scaling and rewind, if preserved
2. Create a level loader that instantiates planets, sun, goal, ball, portals,
   hazards, and other authored objects.
3. Add visual debug tools for:
   - gravity radius
   - launch vectors
   - trajectory preview
   - level bounds
   - collision surfaces
4. Port enough level mechanics to support the first several worlds.

Success criteria:

- Several representative levels can be loaded from data.
- The Unity simulation can run known launch presets and produce comparable
  outcomes to the web version.

## Phase 3: Mobile Game Feel

Make the game feel native on phones before scaling up content.

1. Implement touch-first aiming.
2. Add camera scaling for different aspect ratios and screen sizes.
3. Add safe-area-aware HUD layout.
4. Add haptics for launch, landing, crash, goal capture, and medals.
5. Add mobile pause/resume behavior.
6. Add performance presets for low, mid, and high-end devices.
7. Test on real Android and iOS hardware early.

Success criteria:

- The game is comfortable to play one-handed or two-handed on a phone.
- UI does not conflict with notches, rounded corners, or gesture areas.
- Frame rate is stable on target test devices.

## Phase 4: UI And Progression

Rebuild the surrounding app/game UI in Unity.

1. Rebuild:
   - HUD
   - settings
   - retry and undo controls
   - result banner
   - world map
   - daily challenge screen
   - leaderboard and results screens
2. Port local progression:
   - level bests
   - medals
   - par streak
   - settings
   - ghost replay metadata
3. Use uGUI initially for practical mobile HUD and menu work.

Success criteria:

- A player can launch the app, pick a level, play, finish, save progress, and
  return to the world map.

## Phase 5: Online Services

Preserve existing online features first, then decide whether to migrate.

1. Decide whether Convex remains the long-term backend.
2. If keeping Convex, call it from Unity through HTTP APIs or small cloud
   endpoints.
3. Rebuild:
   - daily leaderboard submission
   - world percentile stats
   - anonymous player identity
4. Add basic anti-cheat validation if leaderboards matter.
5. Add privacy and consent flows if analytics or ads are used.

Success criteria:

- Daily results and world stats work from a mobile build.
- Offline play remains possible when network features are unavailable.

## Phase 6: Commercialization

Add monetization only after the core loop is good on device.

1. Pick a monetization model:
   - paid app
   - free with ads
   - free with remove-ads IAP
   - level packs
   - cosmetic trails or themes
   - premium daily/challenge modes
2. Add Unity IAP.
3. Add ads only if they fit the game design cleanly.
4. Add analytics events:
   - level start
   - level complete
   - retry
   - quit level
   - fail reason
   - ad watched
   - purchase started
   - purchase completed
5. Add remote config for tuning difficulty and monetization without resubmitting
   builds.

Success criteria:

- Purchases work in sandbox environments.
- Analytics answer basic retention, difficulty, and monetization questions.
- Monetization does not interrupt the core puzzle flow.

## Phase 7: Content Pipeline

Use Unity to make future level creation easier than the current JS-data workflow.

1. Build a level authoring workflow inside Unity.
2. Create custom editor tools for:
   - planet placement
   - gravity tuning
   - launch preset testing
   - par calculation/checking
   - trajectory preview
   - level validation
3. Import all current levels.
4. Create automated tests/simulations for known launch presets.

Success criteria:

- Existing content is available in Unity.
- New levels can be authored and tested visually.
- Known-good launch presets can be validated automatically.

## Phase 8: Polish And Release

Prepare the app for store submission.

1. Add final audio mix.
2. Add particles, transitions, shader polish, and screen effects.
3. Add onboarding.
4. Add app icons, splash screen, store screenshots, and trailer captures.
5. Configure Android App Bundle and iOS builds.
6. Run device QA.
7. Soft launch on Android first.
8. Tune retention and difficulty.
9. Submit iOS after Android learnings are incorporated.

Success criteria:

- The game is shippable on Android and iOS.
- Store assets are complete.
- Critical device, lifecycle, purchase, and leaderboard flows have been tested.

## Level Data Decision

The key data decision is where level data should live in the Unity version.

The current game stores levels as JavaScript objects in `src/game-core.js`.
Unity has two natural options:

- `ScriptableObject` level assets
- JSON level files

### Option A: ScriptableObject Levels

A `ScriptableObject` is a Unity asset that stores structured data. Example
assets might look like:

```text
Assets/Game/Levels/open-lane.asset
Assets/Game/Levels/first-arc.asset
Assets/Game/Worlds/starter-belt.asset
```

A level asset could contain:

```csharp
public string id;
public string displayName;
public Vector2 sunPosition;
public BallStart start;
public GoalDefinition goal;
public PlanetDefinition[] planets;
public PortalDefinition[] portals;
public HazardDefinition[] hazards;
public LaunchPreset[] launchPresets;
public int par;
```

Advantages:

- Best fit for Unity editor workflows.
- Designers can edit levels visually and inspectably.
- Easy to reference prefabs, materials, audio, VFX, and world themes.
- Works well with custom editor tools.
- Strong validation inside Unity.
- Good long-term fit if many new levels will be authored in Unity.

Disadvantages:

- Porting existing JS levels is more work.
- Harder to diff and review than plain text.
- Needs custom tooling for bulk edits.
- Unity assets can become awkward if the schema changes often.

Best fit:

- Unity becomes the long-term source of truth for level design.

### Option B: JSON Level Files

With JSON, levels would live as text files:

```text
Assets/StreamingAssets/levels/starter-belt.json
Assets/StreamingAssets/levels/asteroid-worlds.json
```

Example shape:

```json
{
  "id": "open-lane",
  "name": "Open Lane",
  "sun": [0, 0],
  "startAnchor": { "radius": 6.105, "angleDeg": 2.3 },
  "goalCenter": { "radius": 10.353, "angleDeg": 1.4 },
  "launchPresets": [
    { "angleDeg": 0, "power": 1.38 }
  ],
  "planets": [
    {
      "name": "Start World",
      "position": { "radius": 5.356, "angleDeg": 2.7 },
      "radius": 0.62,
      "gravity": 5.2,
      "falloff": 3.8,
      "landable": true
    }
  ]
}
```

Advantages:

- Much easier to migrate from the current JS data.
- Plain text diffs are cleaner.
- Conversion scripts can generate it.
- It can temporarily share level data between web and Unity.
- Easier to generate, validate, patch, or download remotely.
- Useful if daily or challenge content may be delivered from a backend later.

Disadvantages:

- Less native-feeling in Unity.
- Referencing Unity assets is clumsier.
- Visual editing requires custom importer/editor tooling.
- More runtime validation is needed.
- The schema needs discipline to avoid becoming an unstructured data blob.

Best fit:

- Fast migration and preservation of current level data matter most.

### Chosen Approach: JSON Import To ScriptableObject Assets

Use JSON as the migration and interchange format, then import it into
`ScriptableObject` assets for Unity authoring.

```text
current JS level data
        ↓
exported/generated JSON
        ↓
Unity importer
        ↓
ScriptableObject level assets
        ↓
Unity editor tools + runtime loader
```

This gives the project:

- fast migration from the current game
- readable intermediate data
- Unity-native editing afterward
- custom validation
- future ability to export or import levels again

First implementation steps:

1. Define a Unity `LevelDefinition` C# model.
2. Export 3-5 current JS levels to JSON.
3. Load those levels in Unity.
4. Once stable, create an importer that generates `LevelDefinitionAsset`
   `ScriptableObject` assets.
5. Build visual editor tools on top of those assets.

## First Milestone

The first concrete milestone should be:

> A Unity prototype with 3 playable levels, touch aiming, landing, goal capture,
> retry, a basic HUD, and an Android device build.

This proves the rewrite is viable before porting every system.

## Early Decisions To Confirm

1. Keep Convex or move online features to Unity services, PlayFab, or Firebase?
2. Preserve the exact current physics feel, or allow the Unity version to
   rebalance?
3. Which monetization model should the game target first: paid, ads, IAP, or a
   hybrid?
4. Which devices define the minimum performance target?
5. Which current game systems are required for the first mobile release, and
   which can wait?
