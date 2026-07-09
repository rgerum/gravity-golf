using System.Collections.Generic;
using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Pooled disc dots for the aim preview (spec §1.6). The controller owns the
    /// cloned-core simulation; this view only renders the sampled points with a fade.
    /// </summary>
    public sealed class TrajectoryPreview : MonoBehaviour
    {
        private const int PointStride = 3;

        private readonly List<Transform> _dots = new List<Transform>();
        private readonly List<MeshRenderer> _renderers = new List<MeshRenderer>();

        // MaterialPropertyBlock cannot be constructed in a field initializer (it runs in
        // the MonoBehaviour ctor, which Unity forbids); create it lazily in Init instead.
        private MaterialPropertyBlock _propertyBlock;

        private Material _material;
        private Color _color;
        private float _radius;
        private float _z;

        public void Init(Color color, float width, float z)
        {
            _color = color;
            _radius = width;
            _z = z;
            _material = MeshFactory.NewMaterial(Color.white);
            _propertyBlock = new MaterialPropertyBlock();
        }

        public void SetPoints(List<Vec2> points)
        {
            if (points == null || points.Count < 2)
            {
                Clear();
                return;
            }

            var visibleCount = ((points.Count - 1) / PointStride) + 1;
            EnsurePool(visibleCount);

            var dotIndex = 0;
            for (var pointIndex = 0; pointIndex < points.Count; pointIndex += PointStride)
            {
                var point = points[pointIndex];
                var dot = _dots[dotIndex];
                var renderer = _renderers[dotIndex];
                var t = visibleCount <= 1 ? 0f : (float)dotIndex / (visibleCount - 1);
                var alpha = Mathf.Lerp(_color.a, _color.a * 0.18f, t);
                var scale = _radius * Mathf.Lerp(1f, 0.72f, t);

                dot.position = new Vector3((float)point.X, (float)point.Y, _z);
                dot.localScale = new Vector3(scale, scale, 1f);
                if (!dot.gameObject.activeSelf)
                {
                    dot.gameObject.SetActive(true);
                }

                _propertyBlock.SetColor("_Color", new Color(_color.r, _color.g, _color.b, alpha));
                renderer.SetPropertyBlock(_propertyBlock);
                dotIndex += 1;
            }

            for (var i = dotIndex; i < _dots.Count; i += 1)
            {
                if (_dots[i].gameObject.activeSelf)
                {
                    _dots[i].gameObject.SetActive(false);
                }
            }
        }

        public void Clear()
        {
            for (var i = 0; i < _dots.Count; i += 1)
            {
                if (_dots[i].gameObject.activeSelf)
                {
                    _dots[i].gameObject.SetActive(false);
                }
            }
        }

        private void EnsurePool(int count)
        {
            while (_dots.Count < count)
            {
                var go = new GameObject($"PreviewDot{_dots.Count}");
                go.transform.SetParent(transform, false);
                go.SetActive(false);

                var filter = go.AddComponent<MeshFilter>();
                filter.sharedMesh = MeshFactory.UnitDisc;

                var renderer = go.AddComponent<MeshRenderer>();
                renderer.sharedMaterial = _material;
                renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
                renderer.receiveShadows = false;
                renderer.lightProbeUsage = UnityEngine.Rendering.LightProbeUsage.Off;
                renderer.reflectionProbeUsage = UnityEngine.Rendering.ReflectionProbeUsage.Off;

                _dots.Add(go.transform);
                _renderers.Add(renderer);
            }
        }
    }
}
