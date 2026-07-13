using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Clean white ball. Reads Ball.position each LateUpdate; the controller
    /// drives CaptureScale (goal shrink) and Hidden (post-capture) as cosmetics. During a
    /// burn/drown death the controller takes over via SetBurn, driving an explicit
    /// position/scale/tint each frame until ClearBurn (or a fresh level) resets it.</summary>
    public sealed class BallView : MonoBehaviour
    {
        private static readonly Color BaseDiscColor = ColorUtil.FromInt(0xFAF7EF);
        private static readonly Color BaseGlowColor = new Color(1f, 1f, 1f, 0.14f);

        private GameController _controller;
        private Transform _disc;
        private Material _discMat;
        private Material _glowMat;
        private float _radius;

        // Burn/death override: while _burning, LateUpdate ignores the live ball and applies
        // the explicit transform/tint the controller last pushed via SetBurn.
        private bool _burning;
        private Vector3 _burnPos;
        private float _burnScale;
        private Color _burnDiscColor;
        private Color _burnGlowColor;

        public float CaptureScale { get; set; } = 1f;
        public bool Hidden { get; set; }

        public void Init(GameController controller)
        {
            _controller = controller;
            _radius = (float)GravityGolf.Core.Constants.BallRadius;

            var glow = MeshFactory.Spawn("Glow", MeshFactory.UnitDisc, BaseGlowColor, transform, Depth.Ball + 0.05f);
            glow.transform.localScale = new Vector3(_radius * 1.8f, _radius * 1.8f, 1f);
            _glowMat = glow.GetComponent<MeshRenderer>().sharedMaterial;

            var disc = MeshFactory.Spawn("Disc", MeshFactory.UnitDisc, BaseDiscColor, transform, Depth.Ball);
            _disc = disc.transform;
            _disc.localScale = new Vector3(_radius, _radius, 1f);
            _discMat = disc.GetComponent<MeshRenderer>().sharedMaterial;
        }

        // Drives the death sink: the controller integrates the ball into the body center and
        // pushes the explicit world position here each frame. t in [0,1] is the anim progress
        // used only for the tint/alpha — the ball stays FULL size (no shrink). When flourish
        // is on (reduced motion off) it heats toward hot orange; either way it fades out only
        // in the last ~30% so it vanishes as it settles at the center.
        public void SetBurn(float t, float posX, float posY, bool flourish)
        {
            _burning = true;
            var clamped = Mathf.Clamp01(t);
            _burnPos = new Vector3(posX, posY, 0f);
            _burnScale = _radius; // full size — the shrink is gone; the ball sinks into the body

            var hot = ColorUtil.FromInt(0xFF5A2A);
            var heat = flourish ? Mathf.Clamp01(clamped * 1.4f) : 0f;
            var disc = Color.Lerp(BaseDiscColor, hot, heat);
            var fade = clamped <= 0.7f ? 1f : Mathf.Clamp01(1f - (clamped - 0.7f) / 0.3f);
            disc.a = fade;
            _burnDiscColor = disc;

            var glow = disc;
            glow.a = 0.14f * fade;
            _burnGlowColor = glow;
        }

        // Ends the burn override and restores the base look (used by Undo, which reuses the
        // same BallView instead of rebuilding the level).
        public void ClearBurn()
        {
            _burning = false;
            if (_discMat != null)
            {
                _discMat.color = BaseDiscColor;
            }

            if (_glowMat != null)
            {
                _glowMat.color = BaseGlowColor;
            }
        }

        private void LateUpdate()
        {
            if (_controller == null || _controller.Ball == null)
            {
                return;
            }

            if (_burning)
            {
                if (!gameObject.activeSelf)
                {
                    gameObject.SetActive(true);
                }

                transform.position = _burnPos;
                if (_disc != null)
                {
                    _disc.localScale = new Vector3(_burnScale, _burnScale, 1f);
                }

                if (_discMat != null)
                {
                    _discMat.color = _burnDiscColor;
                }

                if (_glowMat != null)
                {
                    _glowMat.color = _burnGlowColor;
                }

                return;
            }

            transform.position = Depth.ToWorld(_controller.Ball.Position, 0f);
            var visible = !Hidden;
            if (gameObject.activeSelf != visible)
            {
                gameObject.SetActive(visible);
            }

            if (_disc != null)
            {
                var scale = _radius * Mathf.Clamp01(CaptureScale);
                _disc.localScale = new Vector3(scale, scale, 1f);
            }
        }
    }
}
