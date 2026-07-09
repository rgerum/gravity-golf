using System.Collections.Generic;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Short fading motion trail drawn behind the ball while flying. A ring buffer of
    /// recent world positions (capped by count and age) feeds a LineRenderer whose width
    /// tapers to 0 and whose vertex-color alpha fades to 0 at the tail (warm white ->
    /// transparent). The controller samples it each frame during GameState.Flying and
    /// clears it on every other state so no stale streak persists. It sits just behind the
    /// ball (Depth.BallTrail) so the crisp ball always reads on top.
    /// </summary>
    public sealed class TrailView : MonoBehaviour
    {
        private const int MaxPoints = 34;
        private const float MaxAgeSeconds = 0.55f;

        private static readonly Color HeadColor = ColorUtil.FromInt(0xFAF7EF, 0.85f);

        private readonly List<Vector3> _points = new List<Vector3>();
        private readonly List<float> _times = new List<float>();

        private LineRenderer _line;
        private float _headWidth;

        public void Init(float ballRadius)
        {
            _headWidth = ballRadius * 1.5f;

            _line = gameObject.AddComponent<LineRenderer>();
            _line.useWorldSpace = true;
            _line.material = MeshFactory.NewMaterial(Color.white);
            // Index 0 is the oldest sample (tail), the last index is newest (head at the
            // ball): taper width and fade alpha from tail -> head.
            _line.startColor = new Color(HeadColor.r, HeadColor.g, HeadColor.b, 0f);
            _line.endColor = HeadColor;
            _line.startWidth = 0f;
            _line.endWidth = _headWidth;
            _line.numCapVertices = 4;
            _line.numCornerVertices = 2;
            _line.alignment = LineAlignment.View;
            _line.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            _line.receiveShadows = false;
            _line.positionCount = 0;
        }

        /// <summary>Appends a world-space sample (z already set to the trail depth), trims
        /// stale/overflow points, and rebuilds the line. Call once per frame while flying.</summary>
        public void Sample(Vector3 worldPos)
        {
            if (_line == null)
            {
                return;
            }

            var now = Time.time;
            if (_points.Count > 0 && (worldPos - _points[_points.Count - 1]).sqrMagnitude < 1e-8f)
            {
                return;
            }

            _points.Add(worldPos);
            _times.Add(now);

            while (_times.Count > 0 && now - _times[0] > MaxAgeSeconds)
            {
                _points.RemoveAt(0);
                _times.RemoveAt(0);
            }

            while (_points.Count > MaxPoints)
            {
                _points.RemoveAt(0);
                _times.RemoveAt(0);
            }

            if (_points.Count < 2)
            {
                if (_line.positionCount != 0)
                {
                    _line.positionCount = 0;
                }

                return;
            }

            _line.positionCount = _points.Count;
            _line.SetPositions(_points.ToArray());
        }

        public void Clear()
        {
            if (_points.Count == 0 && (_line == null || _line.positionCount == 0))
            {
                return;
            }

            _points.Clear();
            _times.Clear();
            if (_line != null)
            {
                _line.positionCount = 0;
            }
        }
    }
}
