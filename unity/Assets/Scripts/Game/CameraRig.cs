using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Content-fitting orthographic camera. The web game uses a fixed landscape view
    /// (spec §11), but on portrait phones a fixed frame either clips off-center content
    /// or wastes huge vertical bands when the layout is asymmetric. So this rig computes
    /// an axis-aligned bounds box over each level's content (goal, orbits, planets, start
    /// anchor), centers on it, and fits that box into both screen axes.
    /// </summary>
    public sealed class CameraRig : MonoBehaviour
    {
        private const float BaseViewHeight = 19.4f;
        private const float ContentMargin = 1.08f;
        private const float MinOrthoSize = 9.7f;

        private Camera _camera;
        private Vector2 _boundsCenter = Vector2.zero;
        private float _halfWidth = BaseViewHeight / 2f;
        private float _halfHeight = BaseViewHeight / 2f;

        /// <summary>World-space center of the currently fitted view.</summary>
        public Vector2 ViewCenter => _boundsCenter;

        /// <summary>Half-size (world units) of the currently visible area, mirroring
        /// <see cref="Apply"/>'s fit math, so background layers can be sized to cover it.</summary>
        public Vector2 ViewHalfSize
        {
            get
            {
                var aspect = (float)Screen.width / Mathf.Max(1, Screen.height);
                var size = Mathf.Max(MinOrthoSize, Mathf.Max(_halfHeight, _halfWidth / aspect) * ContentMargin);
                return new Vector2(size * aspect, size);
            }
        }

        public void Setup()
        {
            _camera = GetComponent<Camera>();
            _camera.orthographic = true;
            _camera.clearFlags = CameraClearFlags.SolidColor;
            _camera.backgroundColor = ColorUtil.FromInt(0x040812);
            _camera.nearClipPlane = 0.1f;
            _camera.farClipPlane = 100f;
            _camera.transform.position = new Vector3(0f, 0f, -10f);
            _camera.transform.rotation = Quaternion.identity;
            Apply();
        }

        private void LateUpdate() => Apply();

        /// <summary>Fit the view to a level's content bounds box. Call on level load.</summary>
        public void SetLevel(LevelRuntime level)
        {
            var minX = double.PositiveInfinity;
            var maxX = double.NegativeInfinity;
            var minY = double.PositiveInfinity;
            var maxY = double.NegativeInfinity;

            void Include(Vec2 center, double reach)
            {
                if (center.X - reach < minX) minX = center.X - reach;
                if (center.X + reach > maxX) maxX = center.X + reach;
                if (center.Y - reach < minY) minY = center.Y - reach;
                if (center.Y + reach > maxY) maxY = center.Y + reach;
            }

            Include(level.GoalCenter, level.GoalRadius + 0.6);
            Include(level.StartAnchor, 1.0);
            foreach (var planet in level.Planets)
            {
                Include(planet.BasePosition, planet.Radius * 2.2); // include the landing ring
                if (planet.OrbitSpeed != 0 && planet.OrbitSemiMajor > 0)
                {
                    var orbitReach = planet.OrbitSemiMajor * (1.0 + planet.OrbitEccentricity);
                    Include(planet.OrbitCenter, orbitReach);
                }
            }

            if (double.IsInfinity(minX))
            {
                // No content (shouldn't happen): fall back to the default framing.
                minX = -BaseViewHeight / 2.0;
                maxX = BaseViewHeight / 2.0;
                minY = -BaseViewHeight / 2.0;
                maxY = BaseViewHeight / 2.0;
            }

            _boundsCenter = new Vector2((float)((minX + maxX) * 0.5), (float)((minY + maxY) * 0.5));
            _halfWidth = (float)((maxX - minX) * 0.5);
            _halfHeight = (float)((maxY - minY) * 0.5);
            Apply();
        }

        private void Apply()
        {
            if (_camera == null)
            {
                return;
            }

            var aspect = (float)Screen.width / Mathf.Max(1, Screen.height);
            // Fit the bounds box against both axes, then re-center the camera on it.
            var size = Mathf.Max(_halfHeight, _halfWidth / aspect) * ContentMargin;
            _camera.orthographicSize = Mathf.Max(size, MinOrthoSize);
            var z = _camera.transform.position.z;
            _camera.transform.position = new Vector3(_boundsCenter.x, _boundsCenter.y, z);
        }

        /// <summary>Screen pixel → 2D world point on the gameplay plane (spec §1.2).</summary>
        public Vec2 ScreenToWorld(Vector2 screenPoint)
        {
            var distance = -_camera.transform.position.z;
            var world = _camera.ScreenToWorldPoint(new Vector3(screenPoint.x, screenPoint.y, distance));
            return new Vec2(world.x, world.y);
        }
    }
}
