using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Clean white ball. Reads Ball.position each LateUpdate; the controller
    /// drives CaptureScale (goal shrink) and Hidden (post-capture) as cosmetics.</summary>
    public sealed class BallView : MonoBehaviour
    {
        private GameController _controller;
        private Transform _disc;
        private float _radius;

        public float CaptureScale { get; set; } = 1f;
        public bool Hidden { get; set; }

        public void Init(GameController controller)
        {
            _controller = controller;
            _radius = (float)GravityGolf.Core.Constants.BallRadius;

            var glow = MeshFactory.Spawn("Glow", MeshFactory.UnitDisc, new Color(1f, 1f, 1f, 0.14f), transform, Depth.Ball + 0.05f);
            glow.transform.localScale = new Vector3(_radius * 1.8f, _radius * 1.8f, 1f);

            var disc = MeshFactory.Spawn("Disc", MeshFactory.UnitDisc, ColorUtil.FromInt(0xFAF7EF), transform, Depth.Ball);
            _disc = disc.transform;
            _disc.localScale = new Vector3(_radius, _radius, 1f);
        }

        private void LateUpdate()
        {
            if (_controller == null || _controller.Ball == null)
            {
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
