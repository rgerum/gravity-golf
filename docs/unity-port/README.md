# Unity Port — First Milestone

Implements the first milestone of [../unity-rewrite-plan.md](../unity-rewrite-plan.md):
a playable Unity version of the first 10 campaign levels (Starter Belt) with
physics numerically identical to the web game.

## What exists

| Piece | Location | Verified by |
|---|---|---|
| Porting specs | `spec-physics.md`, `spec-leveldata.md`, `spec-interaction.md` | adversarial critique pass (7 defects found/fixed) |
| Level export | `scripts/export-unity-levels.js` → `unity/Assets/StreamingAssets/levels/world-1.json` | `npm run export:unity:levels`, deterministic (byte-identical re-runs) |
| Parity fixtures | `scripts/export-unity-fixtures.js` → `unity/tests/fixtures/` | `npm run export:unity:fixtures` — 152 shots + 2 admin-solution sequences from the real JS engine (`simulateShot`) |
| C# physics core | `unity/Assets/Scripts/Core/` (pure C#, double precision, no UnityEngine) | parity runner |
| Parity runner | `unity/tests/ParityRunner/` | all fixtures pass at ≤2e-13 (contract: 1e-6), plus negative loader tests |
| Unity compile gate | `unity/tests/UnityCompatCheck/` | mirrors Unity 6 compiler constraints (netstandard2.1, C# 9) for the Core assembly |
| Unity game layer | `unity/Assets/Scripts/Game/` | static review only — needs an editor smoke test (see `unity/README.md`) |

## Verification commands

```bash
export DOTNET_ROOT=$HOME/.dotnet PATH=$HOME/.dotnet:$PATH   # user-local SDK
npm run export:unity:levels && npm run export:unity:fixtures # regenerate data
dotnet build unity/tests/UnityCompatCheck -c Release         # Unity C#9 compile gate
dotnet run --project unity/tests/ParityRunner -c Release     # physics parity
```

Run all four after any change to `unity/Assets/Scripts/Core/`, the exporters,
or `src/game-core.js` behavior that levels 0–9 exercise.

## Scope

In scope: sun + planet gravity (with falloff/softening), circular and eccentric
(Kepler) orbits, spin, drag launch (point-at-target), flight, landing/anchoring
to moving planets, goal pull + capture, out-of-bounds, retry, strokes, HUD.

Out of scope (loader throws on these fields — see spec-leveldata §6): moons,
portals, ice/lava/split/flicker planets, turrets, dust, asteroids, meteors,
pulsars, binary/extra suns, red giants, goal-unlock relays, rewind.

## Opening in Unity

See `unity/README.md`. Any empty scene works — the game bootstraps itself via
`RuntimeInitializeOnLoadMethod`; no scene wiring or GUIDs.
