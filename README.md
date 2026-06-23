# gravity-golf

## Community Stats

The world-complete screen can submit anonymous world results to Convex and show a
"Better than X% of players" percentile. Set `VITE_CONVEX_URL` for the frontend
and deploy the Convex backend before shipping this feature:

```sh
pnpm convex:dev
pnpm convex:deploy
```

Without `VITE_CONVEX_URL`, the game skips online stats and the local world stats
continue to render immediately.

## Game Systems (June 2026 expansion)

- **Golf scoring** — every hole has a par (derived from its authored launch presets).
  Results are named golf-style (Ace/Eagle/Birdie/Par/Bogey) and award medals
  (🌟 ace star / 🥇 gold = par / 🥈 silver = +1 / 🥉 bronze). Per-level bests persist
  locally (`src/progression.js`) and show as medal rings on the world map.
- **Procedural audio** (`src/audio.js`) — zero-asset WebAudio engine: launch/landing/crash
  SFX, drag-tension loop, flight whoosh tied to speed and gravity proximity, and
  generative per-world music with two moods (Drift/Pulse). Goal/medal stingers tune
  themselves to the current music key.
- **Settings** (`src/settings.js` + in-game gear button) — volumes, music mood,
  screen shake (off/subtle/full), trail style (Comet/Plasma), near-miss slow motion,
  ghost replay, reduced motion.
- **Game feel** — near-miss slow-mo on close planet flybys, crash screen shake,
  goal-capture ring burst, speed-tinted plasma trail variant.
- **Ghost replay** (`src/ghost.js`) — your best clean run per level (fewest launches,
  then fastest) replays as a translucent ghost. Stored compactly in localStorage.
- **Daily Orbit** (`src/daily.js`) — a 3-hole daily round picked deterministically
  from the campaign (easy/mid/late worlds), with a Convex leaderboard
  (`convex/dailyStats.ts`, run `pnpm convex:dev` once to provision the `dailyScores`
  aggregate) and a copyable emoji share card. Reachable from the world map.

### Round 2 (same day)
- **Bullet time** — near-miss slow-mo now eases in/out with a vignette + slight zoom
  punch so it reads as a reward, not lag (still respects the slow-mo/reduced-motion settings).
- **Flair points** (toggleable) — Gravity Kiss (+15 close pass), Portal Hop (+25),
  Hot Finish (+30 fast goal entry) pop up in-world and total on the hole banner.
- **Aim preview** (Off/Hint/Full in settings, default Hint) — while aiming, a faded
  dotted arc simulates the gravity-bent trajectory on an isolated level clone.
- **Par streak** — consecutive at-or-under-par holes build a 🔥 streak pill; best is persisted.
- SFX bus trimmed ~3.5 dB for subtlety.
