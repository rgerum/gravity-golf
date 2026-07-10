# Overnight report — 2026-07-10

Goal: prototype → sticky app. Everything below is committed on `unity-port`
(one commit per feature), verified headlessly, and pushed. Marked ❗ where
human eyes/ears/device are needed.

## What shipped

### 1. Procedural audio (`9727937`)
`AudioManager` synthesizes every SFX at runtime (no asset files), porting the
web's synth palette: launch whoosh, landing tick, crash impacts (sun variant),
goal bell arpeggio, medal flourishes, rewind sweep, UI ticks. Gated by the
sound setting. ❗ **Mix/character needs your ears on device** — I verified it
compiles and plays without errors, not how it sounds.

### 2. Progression persistence (`c5b9d22`)
`SaveStore` → `persistentDataPath/save.json`: per-level completed / best
strokes / best medal (keyed by stable level id), par-streak (current + best),
settings. Result banner shows `NEW BEST` / `BEST n`. Verified end-to-end
headlessly: scored tour run wrote `{"open-lane": {completed, bestStrokes 1,
bestMedal Gold}}` and the reload surfaced it.

### 3. Title screen, settings, progress surfacing (`da06abe`)
- **Title screen** at boot: name, saved-progress stats line, PLAY (resumes at
  the first uncompleted hole), SETTINGS. Backdrop blocks aim input.
- **Settings drawer**: sound / haptics / reduced-motion toggles (persisted),
  par-streak stats. Sound gates AudioManager live; reduced motion disables the
  flight trail.
- **Progress in the HUD**: `BEST n` chip next to PAR; completed level tiles
  tint teal in the strip.
- **Haptics scaffold**: Android vibrates on crash/goal via the Java Vibrator
  service (Unity 6 removed `Handheld.Vibrate`). ❗ **Feel needs a device**;
  iOS is a stub until a native haptics plugin.

## Verification state
- Physics parity: ALL fixtures pass (forward + reverse), untouched core.
- Unity C#9 compat gate: 0 errors.
- Full portrait tour: title, settings, all levels, flights, rewinds, capture —
  0 errors (screenshots in `unity/Screenshots/`, shared links in chat).
- codex adversarial review of the night's diff: findings triaged (see chat).

### 4. Review fixes (`ca3331c`)
codex adversarial review found 2 major + 2 minor, all fixed: a par-streak
farming exploit (rewinding out of a goal capture re-scored the hole —
`CanRewind` now excludes Goal), missing Android VIBRATE permission (custom
minimal `AndroidManifest.xml`), stale `SaveStore` cache under disabled domain
reload, and mute not stopping in-flight audio clips.

## Gotchas found & fixed overnight
- Unity 6 has no `com.unity.modules.vibration` / `Handheld.Vibrate` — an
  invalid manifest entry hangs the editor at package resolution. Haptics now
  use `AndroidJavaObject` directly.
- The audio module (`com.unity.modules.audio`) wasn't in our minimal manifest.
- Tour captures on the first frames after boot grab an uninitialized buffer
  under Xvfb (solid cyan) — captures now wait for first present.
- `#if UNITY_ANDROID` code is invisible to the editor tour's compile — the
  AndroidJNI module gap only surfaced at APK build time. Device-guarded code
  is only compile-checked by an actual Android build.

## ❗ Needs you
1. **Play the APK**: audio mix, haptic feel, title/settings flow, whether the
   always-visible bottom buttons crowd aiming.
2. Taste pass on the title screen (deliberately minimal).
3. Decide: should Undo affect the par streak? (Currently: streak counts
   completions at-or-under par; undo just reduces strokes, which indirectly
   helps the streak.)
