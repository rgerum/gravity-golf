using System;
using GravityGolf.Core;
using UnityEngine;
using UnityEngine.EventSystems;

namespace GravityGolf.Game
{
    public enum GameState
    {
        Loading,
        Aiming,
        Flying,
        Landed,
        Goal,
        Crashed,
        Settled,
    }

    /// <summary>
    /// Owns the LevelRuntime + BallState, the fixed 1/120 simulation accumulator, the
    /// game-flow state machine, stroke counting, and reset/advance (spec §3-§6, §12).
    /// The simulation core is authoritative; this class only steps it and dispatches
    /// outcomes. It also constructs the camera, HUD, aim controller, and views in code
    /// so any empty scene works with no scene wiring.
    /// </summary>
    public sealed class GameController : MonoBehaviour
    {
        private const double PhysicsStep = 1.0 / 120.0;   // main.js:462
        private const double MaxFrameDelta = 0.033;       // main.js:8850
        private const int MaxStepsPerFrame = 4;           // main.js:469
        private const double GoalCaptureRate = 3.6;       // main.js:8141

        private WorldDefinition _world;
        private int _levelIndex;
        private LevelRuntime _level;
        private BallState _ball;
        private LevelRuntime _previewLevel;

        private GameState _state = GameState.Loading;
        private double _accumulator;
        private int _strokes;
        private double _goalTransition;

        private CameraRig _cameraRig;
        private HudController _hud;
        private AimController _aim;
        private Transform _levelRoot;
        private BallView _ballView;

        public bool Ready { get; private set; }

        internal WorldDefinition World => _world;

        internal LevelRuntime CurrentLevel => _level;
        public LevelRuntime Level => _level;
        public BallState Ball => _ball;
        public bool CanAim => Ready && (_state == GameState.Aiming || _state == GameState.Landed);

        private void Awake()
        {
            var cameraGo = new GameObject("Main Camera");
            cameraGo.transform.SetParent(transform, false);
            cameraGo.tag = "MainCamera";
            cameraGo.AddComponent<Camera>();
            _cameraRig = cameraGo.AddComponent<CameraRig>();
            _cameraRig.Setup();

            if (EventSystem.current == null)
            {
                var eventGo = new GameObject("EventSystem");
                eventGo.transform.SetParent(transform, false);
                eventGo.AddComponent<EventSystem>();
                eventGo.AddComponent<StandaloneInputModule>();
            }

            var hudGo = new GameObject("Hud");
            hudGo.transform.SetParent(transform, false);
            _hud = hudGo.AddComponent<HudController>();
            _hud.Build(this);

            _aim = gameObject.AddComponent<AimController>();
            _aim.Setup(this, _cameraRig);
        }

        private void Start()
        {
            _hud.SetStatus("Loading levels…", string.Empty);
            StartCoroutine(LevelData.Load(OnWorldLoaded, OnWorldError));
        }

        private void OnWorldLoaded(WorldDefinition world)
        {
            _world = world;
            LoadLevel(0);
            Ready = true;
        }

        private void OnWorldError(string message)
        {
            Debug.LogError($"[GravityGolf] {message}");
            _hud.SetStatus("Could not load levels.", message);
        }

        private void Update()
        {
            if (!Ready)
            {
                return;
            }

            HandleHotkeys();

            _accumulator += Math.Min(Time.deltaTime, MaxFrameDelta);
            _accumulator = Math.Min(_accumulator, PhysicsStep * MaxStepsPerFrame);
            while (_accumulator >= PhysicsStep)
            {
                Tick(PhysicsStep);
                _accumulator -= PhysicsStep;
            }

            if (_ballView != null)
            {
                _ballView.CaptureScale = _state == GameState.Goal ? (float)Math.Max(0.0, 1.0 - _goalTransition) : 1f;
            }

            _hud.SetPower((float)(ShownPower / Constants.MaxDragDistance));
        }

        private void HandleHotkeys()
        {
            if (Input.GetKeyDown(KeyCode.R))
            {
                RestartLevel();
            }
            else if (Input.GetKeyDown(KeyCode.N))
            {
                LoadLevel(Math.Min(_levelIndex + 1, _world.Levels.Count - 1));
            }
            else if (Input.GetKeyDown(KeyCode.P))
            {
                LoadLevel(Math.Max(_levelIndex - 1, 0));
            }
        }

        private void Tick(double delta)
        {
            switch (_state)
            {
                case GameState.Flying:
                    HandleStepResult(Sim.StepBall(_level, _ball, delta));
                    break;
                case GameState.Aiming:
                case GameState.Landed:
                    AtRestTick(delta);
                    break;
                case GameState.Goal:
                    _goalTransition += delta * GoalCaptureRate;
                    if (_goalTransition >= 1.0)
                    {
                        if (_ballView != null)
                        {
                            _ballView.Hidden = true;
                        }

                        AdvanceLevel();
                    }

                    break;
            }
        }

        // At rest the level is still alive: orbits/spin advance and the ball rides its
        // anchored planet (spec §4.2). timeSpeed is fixed at 1 for the milestone (§9).
        private void AtRestTick(double delta)
        {
            var currentTime = _ball.Time;
            var nextTime = Math.Max(_level.StartTimeSeconds, currentTime + delta);
            var appliedDelta = nextTime - currentTime;
            if (appliedDelta > 1e-6)
            {
                Orbits.SetLevelTime(_level, nextTime);
                _ball.Time = nextTime;
                var anchorResult = Sim.AdvanceBallAnchor(_level, _ball, appliedDelta);
                if (anchorResult != null && anchorResult.Type == "crash")
                {
                    HandleStepResult(anchorResult);
                }
            }
        }

        private void HandleStepResult(StepResult result)
        {
            switch (result.Type)
            {
                case "flying":
                    break;
                case "landed":
                    _state = GameState.Landed;
                    _hud.SetStatus($"Relay locked on {result.PlanetName}.", "Line up the next launch.");
                    break;
                case "goal":
                    BeginGoal();
                    break;
                case "crash":
                    BeginCrash(result.Reason);
                    break;
                case "settled":
                    BeginSettled();
                    break;
            }
        }

        public void Launch(Vec2 aimDirection, double dragPower)
        {
            if (!CanAim)
            {
                return;
            }

            var launchPlanetIndex = _ball.AnchorPlanetIndex;
            _ball.Velocity = LaunchMath.AssembleLaunchVelocity(_level, _ball, aimDirection, dragPower);
            _ball.LaunchGracePlanetIndex = launchPlanetIndex;
            _ball.AnchorPlanetIndex = null;
            _ball.AnchorNormal = null;
            _ball.AnchorSinceTime = _ball.Time;
            _ball.PortalCooldown = 0;
            _strokes += 1;
            _state = GameState.Flying;
            _hud.SetStatus($"Flight underway. {_level.Name}.", string.Empty);
        }

        private void BeginGoal()
        {
            _state = GameState.Goal;
            _goalTransition = 0;
            var par = Math.Max(1, _level.LaunchPresets.Count);
            var launches = Math.Max(1, _strokes);
            _hud.ShowResult(_world, _level, MedalLabel(par, launches), ResultName(par, launches), par, launches);
            _hud.SetStatus("Captured!", string.Empty);
        }

        private void BeginCrash(string reason)
        {
            _state = GameState.Crashed;
            var message = reason switch
            {
                "sun" => "Burned in the sun.",
                "planet" => "Planet impact.",
                "planet-consumed" => "The planet gave way.",
                "bounds" => "Lost in open space.",
                _ => "Crashed.",
            };
            _hud.ShowGameOver(message, "Tap Retry to try again.");
            _hud.SetStatus(message, string.Empty);
        }

        private void BeginSettled()
        {
            _state = GameState.Settled;
            _hud.ShowGameOver("Drifted to a stop.", "Lost momentum in open space. Tap Retry.");
            _hud.SetStatus("Drifted to a stop.", string.Empty);
        }

        public void RestartLevel() => LoadLevel(_levelIndex);

        private void AdvanceLevel() => LoadLevel((_levelIndex + 1) % _world.Levels.Count);

        public void LoadLevel(int index)
        {
            if (_world == null || index < 0 || index >= _world.Levels.Count)
            {
                return;
            }

            _levelIndex = index;
            _level = _world.Levels[index].Clone();
            _cameraRig.SetLevel(_level);
            Orbits.SetLevelTime(_level, _level.StartTimeSeconds);
            _ball = CreateBall(_level);
            _previewLevel = _level.Clone();

            _strokes = 0;
            _goalTransition = 0;
            _accumulator = 0;
            _state = GameState.Aiming;

            BuildLevelViews();
            _aim.SetContext(_level, _ball, _previewLevel);
            _hud.HideGameOver();
            _hud.OnLevelLoaded(_world, _level, _levelIndex, Math.Max(1, _level.LaunchPresets.Count));
            _hud.SetStatus("Stretch and release.", "Point the pull where you want the launch to go.");
        }

        private static BallState CreateBall(LevelRuntime level)
        {
            var ball = new BallState
            {
                Position = level.StartAnchor,
                Velocity = new Vec2(0, 0),
                Time = level.StartTimeSeconds,
                LandingCount = 0,
                LaunchGracePlanetIndex = level.StartPlanetIndex,
                AnchorPlanetIndex = level.StartPlanetIndex,
                AnchorNormal = VecMath.DirectionFromAngleDeg(level.StartAngleDeg),
                AnchorSinceTime = level.StartTimeSeconds,
                PortalCooldown = 0,
                Heat = 0,
            };
            Sim.SyncBallToAnchor(level, ball);
            return ball;
        }

        private void BuildLevelViews()
        {
            if (_levelRoot != null)
            {
                Destroy(_levelRoot.gameObject);
            }

            _levelRoot = new GameObject("Level").transform;

            var sun = new GameObject("Sun").AddComponent<SunView>();
            sun.transform.SetParent(_levelRoot, false);
            sun.Init(_level);

            for (var i = 0; i < _level.Planets.Count; i += 1)
            {
                var planet = new GameObject($"Planet{i}").AddComponent<PlanetView>();
                planet.transform.SetParent(_levelRoot, false);
                planet.Init(_level, i);
            }

            var goal = new GameObject("Goal").AddComponent<GoalView>();
            goal.transform.SetParent(_levelRoot, false);
            goal.Init(_level);

            var ballGo = new GameObject("Ball");
            ballGo.transform.SetParent(_levelRoot, false);
            _ballView = ballGo.AddComponent<BallView>();
            _ballView.Init(this);
        }

        public void SetStatus(string message, string hint) => _hud.SetStatus(message, hint);

        private double ShownPower => _aim.DragActive ? _aim.DragPower : CurrentPresetPower;

        private double CurrentPresetPower
        {
            get
            {
                if (_level == null || _level.LaunchPresets.Count == 0)
                {
                    return 1.8;
                }

                var stage = Math.Min(_ball.LandingCount, _level.LaunchPresets.Count - 1);
                return _level.LaunchPresets[stage].Power;
            }
        }

        // Par & medal tiers (spec §7). Result names are cosmetic and approximate the
        // web build's getGolfResultName wording.
        private static string MedalLabel(int par, int launches)
        {
            if (launches < par || (launches == 1 && par > 1))
            {
                return "Ace";
            }

            if (launches <= par)
            {
                return "Gold";
            }

            return launches <= par + 1 ? "Silver" : "Bronze";
        }

        private static string ResultName(int par, int launches)
        {
            var diff = launches - par;
            if (launches == 1 && par == 1)
            {
                return "Hole in One";
            }

            if (launches == 1 && par > 1)
            {
                return "Ace";
            }

            return diff switch
            {
                <= -2 => "Eagle",
                -1 => "Birdie",
                0 => "Par",
                1 => "Bogey",
                2 => "Double Bogey",
                _ => $"+{diff} Over",
            };
        }
    }
}
