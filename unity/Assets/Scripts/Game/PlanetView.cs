using GravityGolf.Core;
using Newtonsoft.Json.Linq;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Renders one planet: body disc (core tint), a rim accent (glow tint), a spin
    /// marker, an optional teal landing ring, and an optional orbit-path ring. Reads
    /// the live planet.Position each LateUpdate (moved by the core's setLevelTime); the
    /// view never mutates simulation state (spec §10.2, §12).
    /// </summary>
    public sealed class PlanetView : MonoBehaviour
    {
        private LevelRuntime _level;
        private int _index;
        private Transform _body;
        private float _radius;

        public void Init(LevelRuntime level, int index)
        {
            _level = level;
            _index = index;
            var planet = level.Planets[index];
            _radius = (float)planet.Radius;

            var coreColor = ColorUtil.FromInt(ReadColor(planet, "core", 0x8899AA));
            var glowColor = ColorUtil.FromInt(ReadColor(planet, "glow", 0xBBCCDD));

            // Deterministic per-planet character (stable across reloads): keyed on the
            // planet's identity so decoration is fixed, never random per frame.
            var rng = new System.Random(StableHash(planet.Index, planet.Name));

            // Orbit path (cosmetic, static ring around the origin) for moving planets.
            if (planet.OrbitSpeed != 0 && planet.OrbitSemiMajor > 0)
            {
                var orbit = (float)planet.OrbitSemiMajor;
                var path = MeshFactory.Spawn(
                    "OrbitPath",
                    MeshFactory.Ring(orbit - 0.02f, orbit + 0.02f, 96),
                    new Color(0.6f, 0.7f, 0.9f, 0.10f),
                    transform.parent,
                    Depth.OrbitPath);
                path.transform.position = Depth.ToWorld(_level.SystemCenter, Depth.OrbitPath);
            }

            // SAFE vs HAZARD affordance (layered under the body disc so only the parts
            // outside the silhouette show as a rim/halo). LANDABLE planets get a bright,
            // consistent teal landing halo plus a crisp mint edge hugging the surface —
            // "you can stand here". NON-LANDABLE planets get a warm red-orange warning rim
            // and a soft heat haze, and never a teal ring — "do not touch".
            if (planet.Landable)
            {
                var inner = _radius + 0.12f;
                var outer = planet.LandingRadius.HasValue ? (float)planet.LandingRadius.Value : _radius + 0.5f;
                if (outer <= inner + 0.14f)
                {
                    outer = inner + 0.14f;
                }

                var halo = MeshFactory.Spawn(
                    "LandingRing",
                    MeshFactory.Ring(inner, outer, 64),
                    ColorUtil.FromInt(0x75F3D9, 0.34f),
                    transform,
                    Depth.LandingRing);
                halo.transform.localScale = Vector3.one;

                var edge = MeshFactory.Spawn(
                    "LandingEdge",
                    MeshFactory.Ring(_radius + 0.02f, _radius + 0.14f, 64),
                    ColorUtil.FromInt(0x75F3D9, 0.85f),
                    transform,
                    Depth.LandingRing - 0.02f);
                edge.transform.localScale = Vector3.one;
            }
            else
            {
                var hazardRim = MeshFactory.Spawn(
                    "HazardRim",
                    MeshFactory.Ring(_radius + 0.01f, _radius + 0.16f, 64),
                    ColorUtil.FromInt(0xFF6D3A, 0.8f),
                    transform,
                    Depth.LandingRing - 0.02f);
                hazardRim.transform.localScale = Vector3.one;

                var haze = MeshFactory.Spawn(
                    "HazardHaze",
                    MeshFactory.Ring(_radius + 0.14f, _radius + 0.44f, 64),
                    ColorUtil.FromInt(0xFF6D3A, 0.22f),
                    transform,
                    Depth.LandingRing);
                haze.transform.localScale = Vector3.one;
            }

            _body = new GameObject("Body").transform;
            _body.SetParent(transform, false);

            var disc = MeshFactory.Spawn("Disc", MeshFactory.UnitDisc, coreColor, _body, Depth.Planet);
            disc.transform.localScale = new Vector3(_radius, _radius, 1f);

            var rim = MeshFactory.Spawn(
                "Rim",
                MeshFactory.Ring(_radius * 0.82f, _radius, 48),
                glowColor,
                _body,
                Depth.PlanetAccent);
            rim.transform.localScale = Vector3.one;

            // Optional interior decoration (inside the disc only — the physics silhouette
            // stays accurate). Some planets get a shaded limb, some a banded equator, some
            // stay plain, chosen deterministically.
            switch (rng.Next(3))
            {
                case 0:
                {
                    // Slightly darker rim over the outer edge, reading as a shaded limb.
                    var limb = MeshFactory.Spawn(
                        "Limb",
                        MeshFactory.Ring(_radius * 0.88f, _radius, 48),
                        Shade(coreColor, 0.45f, 0.45f),
                        _body,
                        Depth.PlanetAccent - 0.02f);
                    limb.transform.localScale = Vector3.one;
                    break;
                }

                case 1:
                {
                    // Thin darker equatorial band across the disc (rotates with spin).
                    var band = MeshFactory.Spawn(
                        "Band",
                        MeshFactory.UnitDisc,
                        Shade(coreColor, 0.60f, 0.5f),
                        _body,
                        Depth.Planet - 0.02f);
                    band.transform.localScale = new Vector3(_radius * 0.92f, _radius * 0.14f, 1f);
                    break;
                }
            }

            // Spin marker so rotation is visible — position, offset and size vary per planet.
            var markerAngle = (float)(rng.NextDouble() * Mathf.PI * 2f);
            var markerDist = _radius * (0.45f + (float)rng.NextDouble() * 0.15f);
            var markerSize = _radius * (0.18f + (float)rng.NextDouble() * 0.08f);
            var markerZ = Depth.PlanetAccent - 0.05f;
            var marker = MeshFactory.Spawn("SpinMarker", MeshFactory.UnitDisc, glowColor, _body, markerZ);
            marker.transform.localPosition = new Vector3(Mathf.Cos(markerAngle) * markerDist, Mathf.Sin(markerAngle) * markerDist, markerZ);
            marker.transform.localScale = new Vector3(markerSize, markerSize, 1f);
        }

        /// <summary>Multiplies RGB toward black by <paramref name="factor"/> and sets an
        /// explicit <paramref name="alpha"/>, for darkened decoration tints.</summary>
        private static Color Shade(Color c, float factor, float alpha) =>
            new Color(c.r * factor, c.g * factor, c.b * factor, alpha);

        /// <summary>Stable FNV-1a hash of a planet's identity, so per-planet decoration is
        /// deterministic across reloads and independent of frame timing.</summary>
        private static int StableHash(int index, string name)
        {
            unchecked
            {
                var h = 2166136261u;
                h = (h ^ (uint)index) * 16777619u;
                if (name != null)
                {
                    for (var i = 0; i < name.Length; i += 1)
                    {
                        h = (h ^ name[i]) * 16777619u;
                    }
                }

                return (int)(h & 0x7FFFFFFF);
            }
        }

        private void LateUpdate()
        {
            if (_level == null)
            {
                return;
            }

            var planet = _level.Planets[_index];
            transform.position = Depth.ToWorld(planet.Position, 0f);
            if (_body != null && planet.SpinSpeed != 0)
            {
                var degrees = (float)(planet.SpinSpeed * _level.Time * Mathf.Rad2Deg);
                _body.localRotation = Quaternion.Euler(0f, 0f, degrees);
            }
        }

        private static long ReadColor(PlanetRuntime planet, string key, long fallback)
        {
            if (planet.ExtensionData != null && planet.ExtensionData.TryGetValue(key, out var token) && token.Type == JTokenType.Integer)
            {
                return token.Value<long>();
            }

            return fallback;
        }
    }
}
