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

            // Landing ring shows where the ball may anchor.
            if (planet.Landable)
            {
                var inner = _radius + 0.2f;
                var outer = planet.LandingRadius.HasValue ? (float)planet.LandingRadius.Value : _radius + 0.48f;
                if (outer <= inner)
                {
                    outer = inner + 0.12f;
                }

                var ring = MeshFactory.Spawn(
                    "LandingRing",
                    MeshFactory.Ring(inner, outer, 64),
                    ColorUtil.FromInt(0x75F3D9, 0.22f),
                    transform,
                    Depth.LandingRing);
                ring.transform.localScale = Vector3.one;
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

            // Spin marker so rotation is visible.
            var marker = MeshFactory.Spawn("SpinMarker", MeshFactory.UnitDisc, glowColor, _body, Depth.PlanetAccent - 0.05f);
            marker.transform.localPosition = new Vector3(_radius * 0.55f, 0f, Depth.PlanetAccent - 0.05f);
            marker.transform.localScale = new Vector3(_radius * 0.22f, _radius * 0.22f, 1f);
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
