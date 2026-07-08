using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Static glowing sun at level.Sun: a bright warm core disc wrapped in two
    /// radial-gradient glows that fade to transparent, so the falloff reads smooth rather
    /// than banded. A slow subtle pulse keeps it feeling alive.</summary>
    public sealed class SunView : MonoBehaviour
    {
        private Transform _glow;
        private Transform _wideGlow;
        private float _glowScale;
        private float _wideScale;

        public void Init(LevelRuntime level)
        {
            var radius = (float)level.SunCollisionRadius;
            transform.position = Depth.ToWorld(level.Sun, 0f);

            // Wide faint halo (farthest back).
            var wide = MeshFactory.Spawn(
                "WideGlow",
                MeshFactory.GradientDisc(72, 0.18f, 0f),
                ColorUtil.FromInt(0xFFB347),
                transform,
                Depth.Corona);
            _wideScale = radius * 3.5f;
            wide.transform.localScale = new Vector3(_wideScale, _wideScale, 1f);
            _wideGlow = wide.transform;

            // Tighter warm glow.
            var glow = MeshFactory.Spawn(
                "Glow",
                MeshFactory.GradientDisc(72, 0.55f, 0f),
                ColorUtil.FromInt(0xFFC864),
                transform,
                Depth.Corona - 0.1f);
            _glowScale = radius * 2.2f;
            glow.transform.localScale = new Vector3(_glowScale, _glowScale, 1f);
            _glow = glow.transform;

            // Bright core (front-most).
            var core = MeshFactory.Spawn("Core", MeshFactory.UnitDisc, ColorUtil.FromInt(0xFFDD8F), transform, Depth.Sun);
            core.transform.localScale = new Vector3(radius, radius, 1f);
        }

        private void Update()
        {
            if (_glow == null)
            {
                return;
            }

            // Gentle ~3.4s breathing on the glow layers only; the core stays fixed.
            var pulse = 1f + 0.03f * Mathf.Sin(UnityEngine.Time.time * (Mathf.PI * 2f / 3.4f));
            var g = _glowScale * pulse;
            _glow.localScale = new Vector3(g, g, 1f);
            var w = _wideScale * pulse;
            _wideGlow.localScale = new Vector3(w, w, 1f);
        }
    }
}
