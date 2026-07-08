using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// World-origin-centered orthographic camera. The web game uses a fixed landscape
    /// view (spec §11), but on portrait phones the fixed height clips content that sits
    /// at radius > height/2 * aspect, so this rig instead fits each level's content
    /// circle (goal, orbit apoapses, start anchor) into both screen axes.
    /// </summary>
    public sealed class CameraRig : MonoBehaviour
    {
        private const float BaseViewHeight = 19.4f;
        private const float ContentMargin = 1.08f;

        private Camera _camera;
        private float _contentRadius = BaseViewHeight / 2f;

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

        /// <summary>Fit the view to a level's content circle. Call on level load.</summary>
        public void SetLevel(LevelRuntime level)
        {
            var radius = (double)BaseViewHeight / 2.0 / ContentMargin;
            radius = System.Math.Max(radius, VecMath.Length(level.GoalCenter) + level.GoalRadius);
            radius = System.Math.Max(radius, VecMath.Length(level.StartAnchor) + 1.0);
            foreach (var planet in level.Planets)
            {
                var orbitReach = VecMath.Length(planet.OrbitCenter)
                    + planet.OrbitSemiMajor * (1.0 + planet.OrbitEccentricity);
                var reach = System.Math.Max(VecMath.Length(planet.BasePosition), orbitReach)
                    + planet.Radius * 2.2; // include the landing ring
                radius = System.Math.Max(radius, reach);
            }

            _contentRadius = (float)radius * ContentMargin;
            Apply();
        }

        private void Apply()
        {
            if (_camera == null)
            {
                return;
            }

            var aspect = (float)Screen.width / Mathf.Max(1, Screen.height);
            // Content is a circle around the origin: fit it against both axes.
            _camera.orthographicSize = Mathf.Max(_contentRadius, _contentRadius / aspect);
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
