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

        // Drives the death burn: t in [0,1] flies the ball from its crash point into the
        // body center (eased so it accelerates in), shrinks it toward 0, and — when
        // flourish is on (reduced motion off) — heats it toward hot orange while fading out.
        public void SetBurn(float t, float fromX, float fromY, float toX, float toY, bool flourish)
        {
            _burning = true;
            var clamped = Mathf.Clamp01(t);
            var eased = clamped * clamped;
            var px = Mathf.Lerp(fromX, toX, eased);
            var py = Mathf.Lerp(fromY, toY, eased);
            _burnPos = new Vector3(px, py, 0f);
            _burnScale = _radius * Mathf.Clamp01(1f - clamped);

            var hot = ColorUtil.FromInt(0xFF5A2A);
            var heat = flourish ? Mathf.Clamp01(clamped * 1.5f) : 0f;
            var disc = Color.Lerp(BaseDiscColor, hot, heat);
            disc.a = Mathf.Clamp01(1f - clamped * clamped);
            _burnDiscColor = disc;

            var glow = disc;
            glow.a = 0.14f * Mathf.Clamp01(1f - clamped);
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
