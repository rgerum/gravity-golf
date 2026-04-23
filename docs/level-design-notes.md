# Level Design Notes

These are working notes from building and validating levels in `gravity-billiard`.

## Where I Struggle

- It is easy to make a layout that looks interesting but has no robust sampled solution.
- Orbiting planets create hidden geometry problems over time; a level can look clean at `t=0` and still become invalid later.
- The solver often finds an unintended easier route when the authored intent is only slightly weaker than a decoy.
- Tight systems collapse quickly once two bodies both have medium eccentricity and medium-to-high orbit speed.
- Goal windows are hard to tune by intuition alone. A level can flip from readable pressure to solver-dead with a very small timing change.
- Self-relay on the starting planet appears often when a supposed direct level has too much local curvature around the launch world.

## Patterns That Fail Often

- Inner planets too close to each other: even when they do not collide, they create noisy gravity and accidental relays.
- Outer hazards placed directly on the goal line: they tend to delete all routes instead of creating an interesting decision.
- Fork levels with symmetric choices: if both branches are almost equivalent, the level loses identity.
- Moon levels with too-small parent/moon separation: they read well on paper, but produce collision and clarity problems.
- High-eccentricity orbit plus fast angular speed: this is the easiest way to make future overlaps by accident.

## What Seems To Work

- Start from a known good family and change one variable at a time.
- Use low eccentricity by default. Only add more when the level clearly needs it.
- Give the intended relay planet generous separation from nearby hazards first, then tighten later if needed.
- Treat layout collision checks as a hard authoring gate and solver intent scores as a soft gate.
- Put the puzzle question in the summary before tuning the numbers. It helps reject geometry that solves the wrong problem.
- Favor one strong idea per level. Layers are fine, but there should still be one sentence explaining the trick.

## Practical Heuristics

- One-shot levels need more empty space than they seem to need.
- Relay levels get better once the relay is obviously different in role from the launch planet.
- If a level is supposed to teach a relay, the intended relay route should not only be valid, it should be among the most robust routes.
- If the minimum planet gap score is low but still non-colliding, the level usually feels visually noisy even when technically valid.
- When a level is dead, moving the goal or an outer hazard is often better than increasing launch power or goal pull.
- When a level is fragile, widening geometry is usually better than adding more time.

## What To Learn From Later

- Which low-layout-score levels still feel good in play, and which only barely pass technical validation.
- Whether players understand moon levels without extra visual teaching.
- Whether self-relay should be embraced as a mechanic family or suppressed outside explicit self-relay levels.
- How much intent scoring should rely on `adminSolutions` versus broader tags like `preferRelay`.

## After Expanding To Thirty Levels

- Past about twenty levels, the main difficulty is no longer inventing themes. It is keeping the authored summary, the intended route, and the solver-visible best route aligned.
- Decorative extra planets are dangerous. Even a planet added "just to make the scene richer" can silently delete a route or create a better unintended one.
- Dense levels need one body to do the talking. If every outer body has similar gravity and similar spacing, the puzzle becomes mushy instead of richer.
- Coarse solver validation matters more than dense solver validation for campaign authoring. A level that only comes alive under high sample density is usually not a good progression level yet.
- Some levels are better saved by changing their identity than by forcing the original idea. When the solver repeatedly finds a clean self-relay, it is often better to author that honestly than to keep fighting it.
