using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Renders a whole level's asteroid belt (spec §asteroids). Each asteroid is a small
    /// hazard-styled rock — a body disc tinted from its color hint (warm grey fallback) with
    /// a subtle red-orange warning rim that mirrors PlanetView's hazard language but smaller
    /// and softer, since a dense belt can hold up to ~44 of them. One GameObject per asteroid
    /// (shared unit-disc / unit-ring meshes, per-rock material for the tint), all driven from
    /// a single LateUpdate loop that syncs each root to its live orbiting position and spins
    /// the body from its SpinSpeed. The view never mutates simulation state.
    /// </summary>
    public sealed class AsteroidFieldView : MonoBehaviour
    {
        // Warm grey used when an asteroid carries no color hint — the spec's canonical rock
        // tone (game-core.js asteroid.color fallback), never teal.
        private const int FallbackTint = 0x8D929A;

        // Hazard rim proportions relative to the rock radius: a thin red-orange ring hugging
        // the surface (subtler than PlanetView's rim so a full belt doesn't scream).
        private const float RimInner = 0.82f;
        private const float RimOuter = 1.12f;

        private LevelRuntime _level;
        private Transform[] _roots;
        private Transform[] _bodies;
        private double[] _spinSpeeds;

        public void Init(LevelRuntime level)
        {
            _level = level;
            var count = level.Asteroids.Count;
            _roots = new Transform[count];
            _bodies = new Transform[count];
            _spinSpeeds = new double[count];

            // One shared rim mesh (unit radius) scaled per rock, matching the shared UnitDisc.
            var rimMesh = MeshFactory.Ring(RimInner, RimOuter, 20);

            for (var i = 0; i < count; i += 1)
            {
                var asteroid = level.Asteroids[i];
                var radius = (float)asteroid.Radius;
                _spinSpeeds[i] = asteroid.SpinSpeed;

                var root = new GameObject($"Asteroid{i}").transform;
                root.SetParent(transform, false);
                _roots[i] = root;

                var tint = asteroid.Color.HasValue
                    ? ColorUtil.FromInt(asteroid.Color.Value)
                    : ColorUtil.FromInt(FallbackTint);

                var body = new GameObject("Body").transform;
                body.SetParent(root, false);
                _bodies[i] = body;

                var disc = MeshFactory.Spawn("Disc", MeshFactory.UnitDisc, tint, body, Depth.Asteroid);
                disc.transform.localScale = new Vector3(radius, radius, 1f);

                // Subtle darker limb inside the disc so spin is a touch more readable.
                var limb = MeshFactory.Spawn(
                    "Limb",
                    MeshFactory.UnitDisc,
                    Shade(tint, 0.55f, 0.5f),
                    body,
                    Depth.Asteroid - 0.02f);
                limb.transform.localScale = new Vector3(radius * 0.5f, radius * 0.32f, 1f);
                limb.transform.localPosition = new Vector3(radius * 0.22f, radius * 0.18f, Depth.Asteroid - 0.02f);

                var rim = MeshFactory.Spawn(
                    "HazardRim",
                    rimMesh,
                    ColorUtil.FromInt(0xFF6D3A, 0.5f),
                    root,
                    Depth.AsteroidRim);
                rim.transform.localScale = new Vector3(radius, radius, 1f);
            }
        }

        private static Color Shade(Color c, float factor, float alpha) =>
            new Color(c.r * factor, c.g * factor, c.b * factor, alpha);

        private void LateUpdate()
        {
            if (_level == null || _roots == null)
            {
                return;
            }

            for (var i = 0; i < _roots.Length; i += 1)
            {
                var asteroid = _level.Asteroids[i];
                _roots[i].position = Depth.ToWorld(asteroid.Position, 0f);
                if (_bodies[i] != null && _spinSpeeds[i] != 0)
                {
                    var degrees = (float)(_spinSpeeds[i] * _level.Time * Mathf.Rad2Deg);
                    _bodies[i].localRotation = Quaternion.Euler(0f, 0f, degrees);
                }
            }
        }
    }
}
