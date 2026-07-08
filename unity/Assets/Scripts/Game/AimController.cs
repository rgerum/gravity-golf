using System;
using System.Collections.Generic;
using GravityGolf.Core;
using UnityEngine;
using UnityEngine.EventSystems;

namespace GravityGolf.Game
{
    /// <summary>
    /// Point-at-target drag input (spec §1). The drag can start anywhere; the pull is
    /// the vector from the press point to the current pointer, clamped to
    /// MAX_DRAG_DISTANCE. Renders the coral aim band, amber handle, and cyan preview by
    /// stepping a cloned LevelRuntime. The only writer into the core is GameController
    /// via Launch(); this component just computes the gesture.
    /// </summary>
    public sealed class AimController : MonoBehaviour
    {
        private const double LaunchThreshold = 0.12;   // main.js:7617
        private const double PreviewThreshold = 0.14;  // main.js:6983
        private const double PreviewStep = 1.0 / 60.0;
        private const double PreviewHorizon = 3.0;
        private const int MaxPreviewPoints = 110;

        private GameController _controller;
        private CameraRig _camera;

        private LevelRuntime _level;
        private BallState _ball;
        private LevelRuntime _previewLevel;

        private bool _dragActive;
        private Vec2 _dragStartWorld;
        private Vec2 _aimDirection = new Vec2(1, 0);
        private double _dragPower;
        private Vec2 _dragAnchorWorld;
        private int _activeFingerId = -1;

        private LineRenderer _band;
        private Transform _handle;
        private TrajectoryPreview _preview;
        private readonly List<Vec2> _previewPoints = new List<Vec2>();

        public bool DragActive => _dragActive;
        public double DragPower => _dragPower;

        public void Setup(GameController controller, CameraRig camera)
        {
            _controller = controller;
            _camera = camera;

            var root = new GameObject("AimView");
            root.transform.SetParent(transform, false);

            var bandGo = new GameObject("AimBand");
            bandGo.transform.SetParent(root.transform, false);
            _band = bandGo.AddComponent<LineRenderer>();
            var bandColor = ColorUtil.FromInt(0xFF7D58);
            _band.useWorldSpace = true;
            _band.material = MeshFactory.NewMaterial(bandColor);
            _band.startColor = bandColor;
            _band.endColor = bandColor;
            _band.startWidth = 0.14f;
            _band.endWidth = 0.14f;
            _band.numCapVertices = 4;
            _band.alignment = LineAlignment.View;
            _band.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            _band.positionCount = 0;

            var handleGo = MeshFactory.Spawn("AimHandle", MeshFactory.UnitDisc, ColorUtil.FromInt(0xFFC85C), root.transform, Depth.Handle);
            handleGo.transform.localScale = new Vector3(0.16f, 0.16f, 1f);
            _handle = handleGo.transform;

            var previewGo = new GameObject("AimPreview");
            previewGo.transform.SetParent(root.transform, false);
            _preview = previewGo.AddComponent<TrajectoryPreview>();
            _preview.Init(new Color(0.5f, 0.82f, 1f, 0.9f), 0.09f, Depth.Preview);

            SetViewVisible(false);
        }

        public void SetContext(LevelRuntime level, BallState ball, LevelRuntime previewLevel)
        {
            _level = level;
            _ball = ball;
            _previewLevel = previewLevel;
            CancelDrag();
        }

        private void Update()
        {
            if (_controller == null || !_controller.Ready || _level == null)
            {
                return;
            }

            ReadPointer(out var down, out var held, out var up, out var canceled, out var screenPos, out var fingerId);

            var canAim = _controller.CanAim;

            if (canceled)
            {
                CancelDrag();
                RefreshView();
                return;
            }

            if (down)
            {
                if (!canAim || IsPointerOverUi(fingerId))
                {
                    RefreshView();
                    return;
                }

                _dragActive = true;
                _activeFingerId = fingerId;
                _dragStartWorld = _camera.ScreenToWorld(screenPos);
                UpdateDrag(_dragStartWorld);
            }
            else if (_dragActive && up)
            {
                UpdateDrag(_camera.ScreenToWorld(screenPos));
                Release();
            }
            else if (_dragActive && held)
            {
                // Re-solve every frame so the aim tracks a moving/spinning launch planet (spec §4.2).
                UpdateDrag(_camera.ScreenToWorld(screenPos));
            }

            if (_dragActive && !canAim)
            {
                CancelDrag();
            }

            RefreshView();
        }

        private void UpdateDrag(Vec2 worldPoint)
        {
            var pull = new Vec2(worldPoint.X - _dragStartWorld.X, worldPoint.Y - _dragStartWorld.Y);
            var stretch = Math.Min(VecMath.Length(pull), Constants.MaxDragDistance);
            if (stretch < 0.0001)
            {
                _dragPower = 0;
                _dragAnchorWorld = _ball.Position;
                return;
            }

            var direction = LaunchMath.ConstrainLaunchDirection(_level, _ball, pull, stretch);
            _aimDirection = direction;
            _dragPower = stretch;
            _dragAnchorWorld = new Vec2(
                _ball.Position.X + direction.X * stretch,
                _ball.Position.Y + direction.Y * stretch);
        }

        private void Release()
        {
            if (_dragPower > LaunchThreshold)
            {
                _controller.Launch(_aimDirection, _dragPower);
            }
            else
            {
                _controller.SetStatus("Launch cancelled.", string.Empty);
            }

            CancelDrag();
        }

        private void CancelDrag()
        {
            _dragActive = false;
            _activeFingerId = -1;
            _dragPower = 0;
            if (_ball != null)
            {
                _dragAnchorWorld = _ball.Position;
            }
        }

        private void RefreshView()
        {
            var showBand = _dragActive && _dragPower > 0.0001 && _controller.CanAim;
            if (!showBand)
            {
                SetViewVisible(false);
                _preview.Clear();
                return;
            }

            SetViewVisible(true);
            var start = Depth.ToWorld(_ball.Position, Depth.AimBand);
            var end = Depth.ToWorld(_dragAnchorWorld, Depth.AimBand);
            _band.positionCount = 2;
            _band.SetPosition(0, start);
            _band.SetPosition(1, end);
            _handle.position = Depth.ToWorld(_dragAnchorWorld, Depth.Handle);

            if (_dragPower > PreviewThreshold)
            {
                BuildPreview();
                _preview.SetPoints(_previewPoints);
            }
            else
            {
                _preview.Clear();
            }
        }

        private void SetViewVisible(bool visible)
        {
            if (_band != null)
            {
                _band.enabled = visible;
                if (!visible)
                {
                    _band.positionCount = 0;
                }
            }

            if (_handle != null && _handle.gameObject.activeSelf != visible)
            {
                _handle.gameObject.SetActive(visible);
            }
        }

        /// <summary>Forward-simulate a cloned level so stepping never touches live state (spec §1.6).</summary>
        private void BuildPreview()
        {
            _previewPoints.Clear();
            if (_previewLevel == null)
            {
                return;
            }

            Orbits.SetLevelTime(_previewLevel, _ball.Time);

            var previewBall = new BallState
            {
                Position = _ball.Position,
                Velocity = LaunchMath.AssembleLaunchVelocity(_level, _ball, _aimDirection, _dragPower),
                Time = _ball.Time,
                LandingCount = _ball.LandingCount,
                LaunchGracePlanetIndex = _ball.AnchorPlanetIndex,
                AnchorPlanetIndex = null,
                AnchorNormal = null,
                AnchorSinceTime = _ball.Time,
                PortalCooldown = _ball.PortalCooldown,
                Heat = _ball.Heat,
            };

            _previewPoints.Add(previewBall.Position);
            var totalSteps = (int)Math.Floor(PreviewHorizon / PreviewStep);
            for (var stepIndex = 0; stepIndex < totalSteps; stepIndex += 1)
            {
                var result = Sim.StepBall(_previewLevel, previewBall, PreviewStep);
                if (stepIndex % 2 == 0 && _previewPoints.Count < MaxPreviewPoints)
                {
                    _previewPoints.Add(previewBall.Position);
                }

                if (result.Type != "flying")
                {
                    break;
                }
            }
        }

        private void ReadPointer(out bool down, out bool held, out bool up, out bool canceled, out Vector2 pos, out int fingerId)
        {
            down = held = up = canceled = false;
            fingerId = -1;
            if (Input.touchCount > 0)
            {
                if (_dragActive && _activeFingerId >= 0)
                {
                    for (var i = 0; i < Input.touchCount; i += 1)
                    {
                        var activeTouch = Input.GetTouch(i);
                        if (activeTouch.fingerId == _activeFingerId)
                        {
                            ReadTouch(activeTouch, out down, out held, out up, out canceled, out pos, out fingerId);
                            return;
                        }
                    }

                    canceled = true;
                    pos = Vector2.zero;
                    fingerId = _activeFingerId;
                    return;
                }

                for (var i = 0; i < Input.touchCount; i += 1)
                {
                    var candidate = Input.GetTouch(i);
                    if (candidate.phase == TouchPhase.Began)
                    {
                        ReadTouch(candidate, out down, out held, out up, out canceled, out pos, out fingerId);
                        return;
                    }
                }

                pos = Input.GetTouch(0).position;
                return;
            }

            pos = Input.mousePosition;
            down = Input.GetMouseButtonDown(0);
            up = Input.GetMouseButtonUp(0);
            held = Input.GetMouseButton(0);
        }

        private static void ReadTouch(Touch touch, out bool down, out bool held, out bool up, out bool canceled, out Vector2 pos, out int fingerId)
        {
            down = held = up = canceled = false;
            fingerId = touch.fingerId;
            pos = touch.position;
            switch (touch.phase)
            {
                case TouchPhase.Began:
                    down = true;
                    break;
                case TouchPhase.Moved:
                case TouchPhase.Stationary:
                    held = true;
                    break;
                case TouchPhase.Ended:
                    up = true;
                    break;
                case TouchPhase.Canceled:
                    canceled = true;
                    break;
            }
        }

        private static bool IsPointerOverUi(int fingerId)
        {
            if (EventSystem.current == null)
            {
                return false;
            }

            return fingerId >= 0
                ? EventSystem.current.IsPointerOverGameObject(fingerId)
                : EventSystem.current.IsPointerOverGameObject();
        }
    }
}
