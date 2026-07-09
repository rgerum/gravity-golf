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
        private const long Flash = 0xDDD6FE;

        private Transform _ring;

        private float _goalRadius;
        private Transform _burstRing;
        private MeshRenderer _burstRingRenderer;
        private Transform _burstFlash;
        private MeshRenderer _burstFlashRenderer;
        private Color _burstRingColor;
        private Color _burstFlashColor;

        public void Init(LevelRuntime level)
        {
            var radius = (float)level.GoalRadius;
            var pullRadius = (float)level.GoalPullRadius;
            _goalRadius = radius;
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

            // Capture payoff, hidden until SetCaptureProgress runs: an expanding thin
            // shockwave ring plus a brief central flash, both in the goal's violet palette.
            _burstRingColor = ColorUtil.FromInt(Ring);
            var burstRing = MeshFactory.Spawn(
                "CaptureBurst",
                MeshFactory.Ring(0.9f, 1f, 48),
                _burstRingColor,
                transform,
                Depth.GoalBurst);
            _burstRing = burstRing.transform;
            _burstRingRenderer = burstRing.GetComponent<MeshRenderer>();
            burstRing.SetActive(false);

            _burstFlashColor = ColorUtil.FromInt(Flash);
            var burstFlash = MeshFactory.Spawn(
                "CaptureFlash",
                MeshFactory.UnitDisc,
                _burstFlashColor,
                transform,
                Depth.GoalBurst - 0.05f);
            _burstFlash = burstFlash.transform;
            _burstFlashRenderer = burstFlash.GetComponent<MeshRenderer>();
            burstFlash.SetActive(false);
        }

        /// <summary>Drives the capture payoff from the controller's goal transition (0->1).
        /// At t &lt;= 0 (or when not capturing) the burst is fully hidden.</summary>
        public void SetCaptureProgress(float t01)
        {
            if (_burstRing == null || _burstFlash == null)
            {
                return;
            }

            if (t01 <= 0f)
            {
                if (_burstRing.gameObject.activeSelf)
                {
                    _burstRing.gameObject.SetActive(false);
                }

                if (_burstFlash.gameObject.activeSelf)
                {
                    _burstFlash.gameObject.SetActive(false);
                }

                return;
            }

            if (!_burstRing.gameObject.activeSelf)
            {
                _burstRing.gameObject.SetActive(true);
            }

            if (!_burstFlash.gameObject.activeSelf)
            {
                _burstFlash.gameObject.SetActive(true);
            }

            var t = Mathf.Clamp01(t01);

            // Expanding ring: ease-out from goal radius to 2.5x while alpha fades 0.9 -> 0.
            var eased = 1f - (1f - t) * (1f - t);
            var ringScale = Mathf.Lerp(_goalRadius, _goalRadius * 2.5f, eased);
            _burstRing.localScale = new Vector3(ringScale, ringScale, 1f);
            SetAlpha(_burstRingRenderer, _burstRingColor, Mathf.Lerp(0.9f, 0f, t));

            // Central flash: alpha rises fast to an early peak (~t=0.25) then fades out.
            var flash = t < 0.25f ? t / 0.25f : Mathf.Max(0f, 1f - (t - 0.25f) / 0.75f);
            var flashScale = _goalRadius * Mathf.Lerp(0.2f, 0.7f, t);
            _burstFlash.localScale = new Vector3(flashScale, flashScale, 1f);
            SetAlpha(_burstFlashRenderer, _burstFlashColor, flash * 0.85f);
        }

        private static void SetAlpha(MeshRenderer renderer, Color baseColor, float alpha)
        {
            if (renderer == null)
            {
                return;
            }

            renderer.sharedMaterial.color = new Color(baseColor.r, baseColor.g, baseColor.b, alpha);
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
