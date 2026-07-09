using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Static goal: a violet "black hole" target — a faint pull-radius halo,
    /// a near-black event-horizon interior tinted by a subtle translucent fill, and a
    /// bright luminous ring that gently pulses to draw the eye. The cool violet palette
    /// keeps it instantly distinct from the warm sun and the teal landing rings. No
    /// countdown arc — the goal is always open in scope (spec §5.3, §10.4).</summary>
    public sealed class GoalView : MonoBehaviour
    {
        // Bright luminous ring vs. a deeper violet for the soft fill/halo, over a
        // near-black interior with just a hint of deep violet.
        private const long Ring = 0xA78BFA;
        private const long Glow = 0x8B5CF6;
        private const long Interior = 0x0B0716;

        private Transform _ring;

        public void Init(LevelRuntime level)
        {
            var radius = (float)level.GoalRadius;
            var pullRadius = (float)level.GoalPullRadius;
            transform.position = Depth.ToWorld(level.GoalCenter, 0f);

            // Faint halo hinting the goal's pull radius (soft gravitational well).
            if (pullRadius > radius)
            {
                var pull = MeshFactory.Spawn(
                    "PullRadius",
                    MeshFactory.GradientDisc(72, 0.06f, 0f),
                    ColorUtil.FromInt(Glow),
                    transform,
                    Depth.GoalGlow + 0.2f);
                pull.transform.localScale = new Vector3(pullRadius, pullRadius, 1f);
            }

            // Near-black event-horizon interior with a hint of deep violet.
            var disc = MeshFactory.Spawn("Disc", MeshFactory.UnitDisc, ColorUtil.FromInt(Interior), transform, Depth.Goal);
            disc.transform.localScale = new Vector3(radius, radius, 1f);

            // Subtle violet translucent fill inside the ring.
            var fill = MeshFactory.Spawn(
                "Fill",
                MeshFactory.GradientDisc(64, 0.22f, 0.05f),
                ColorUtil.FromInt(Glow),
                transform,
                Depth.Goal - 0.05f);
            fill.transform.localScale = new Vector3(radius * 0.96f, radius * 0.96f, 1f);

            // Bright luminous target ring (front-most, pulses).
            var ringGo = MeshFactory.Spawn(
                "Ring",
                MeshFactory.Ring(radius + 0.06f, radius + 0.30f, 72),
                ColorUtil.FromInt(Ring, 0.92f),
                transform,
                Depth.Goal - 0.1f);
            _ring = ringGo.transform;
        }

        private void Update()
        {
            if (_ring == null)
            {
                return;
            }

            // Scale 1.0 -> 1.04 on a ~2s sine so the crisp ring subtly breathes.
            var pulse = 1f + 0.04f * (0.5f + 0.5f * Mathf.Sin(UnityEngine.Time.time * Mathf.PI));
            _ring.localScale = new Vector3(pulse, pulse, 1f);
        }
    }
}
