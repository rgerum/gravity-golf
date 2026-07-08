using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Static goal: a warm amber "black hole" target — a faint pull-radius halo,
    /// a dark event-horizon interior warmed by a subtle translucent fill, and a bright
    /// luminous ring that gently pulses to draw the eye. No countdown arc — the goal is
    /// always open in scope (spec §5.3, §10.4).</summary>
    public sealed class GoalView : MonoBehaviour
    {
        private const long Gold = 0xFFC24B;

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
                    ColorUtil.FromInt(Gold),
                    transform,
                    Depth.GoalGlow + 0.2f);
                pull.transform.localScale = new Vector3(pullRadius, pullRadius, 1f);
            }

            // Dark event-horizon interior.
            var disc = MeshFactory.Spawn("Disc", MeshFactory.UnitDisc, ColorUtil.FromInt(0x090512), transform, Depth.Goal);
            disc.transform.localScale = new Vector3(radius, radius, 1f);

            // Subtle warm translucent fill inside the ring.
            var fill = MeshFactory.Spawn(
                "Fill",
                MeshFactory.GradientDisc(64, 0.22f, 0.05f),
                ColorUtil.FromInt(Gold),
                transform,
                Depth.Goal - 0.05f);
            fill.transform.localScale = new Vector3(radius * 0.96f, radius * 0.96f, 1f);

            // Bright luminous target ring (front-most, pulses).
            var ringGo = MeshFactory.Spawn(
                "Ring",
                MeshFactory.Ring(radius + 0.06f, radius + 0.30f, 72),
                ColorUtil.FromInt(Gold, 0.92f),
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
