using System;
using System.Collections.Generic;
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
        Rewinding,
        Dying,
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

        // Rewind plays the recorded flight backward at ~6x realtime (a forward second is
        // 120 physics steps, so 6x => 720 reverse steps/sec). The per-frame cap keeps a
        // long flight from freezing one frame; leftover budget drains on later frames.
        private const double RewindTimeScale = 6.0;
        private const int MaxRewindStepsPerFrame = 40;

        // Hold-to-fast-forward multiplier (spec: advance orbits/flight ~3x). Only the delta
        // fed to the accumulator is scaled; the physics step stays 1/120 and the per-frame
        // step clamp still guards against a spiral of death.
        private const double FastForwardScale = 3.0;

        // Burn/drown death: on a lethal sun/planet crash the ball flies into the body center
        // while shrinking and heating before the recovery drawer appears.
        private const double DeathDuration = 0.4;

        private WorldDefinition _world;
        private int _levelIndex;
        private LevelRuntime _level;
        private BallState _ball;
        private LevelRuntime _previewLevel;

        private GameState _state = GameState.Loading;
        private bool _paused;
        private bool _fastForward;
        private double _accumulator;
        private int _strokes;
        private double _goalTransition;

        // Death-burn transition state (set by BeginCrash, consumed by UpdateDeath).
        private double _deathElapsed;
        private Vec2 _deathFrom;
        private Vec2 _deathCenter;
        private bool _deathFlourish;
        private string _deathMessage = "";
        private string _deathHint = "";

        // Pre-launch checkpoints (one per shot, pushed before the ball is mutated). Undo
        // pops the top and reverses the live ball back to it.
        private readonly Stack<Checkpoint> _checkpoints = new Stack<Checkpoint>();
        private Checkpoint _rewindTarget;
        private double _rewindAccumulator;

        private CameraRig _cameraRig;
        private HudController _hud;
        private AimController _aim;
        private Transform _levelRoot;
        private BallView _ballView;
        private GoalView _goalView;
        private TrailView _ballTrail;
        private AudioManager _audio;

        public bool Ready { get; private set; }

        internal WorldDefinition World => _world;

        internal LevelRuntime CurrentLevel => _level;

        internal GameState State => _state;
        public LevelRuntime Level => _level;
        public BallState Ball => _ball;
        public bool CanAim => Ready && !_paused && (_state == GameState.Aiming || _state == GameState.Landed);

        // A rewind is possible whenever at least one shot has been taken and we are not
        // mid-load or already rewinding. Callable from Aiming, Landed, Flying, Crashed,
        // Settled — the target is always a past anchored launch point. Goal is excluded:
        // the result is already recorded, and rewinding out of a capture would let the
        // same hole re-score repeatedly (par-streak farming).
        internal bool CanRewind => Ready
            && _checkpoints.Count > 0
            && _state != GameState.Rewinding
            && _state != GameState.Loading
            && _state != GameState.Goal
            && _state != GameState.Dying;

        private void Awake()
        {
            var cameraGo = new GameObject("Main Camera");
            cameraGo.transform.SetParent(transform, false);
            cameraGo.tag = "MainCamera";
            cameraGo.AddComponent<Camera>();
            _cameraRig = cameraGo.AddComponent<CameraRig>();
            _cameraRig.Setup();

            _audio = gameObject.AddComponent<AudioManager>();
            _audio.Initialize();
            _audio.Enabled = SaveStore.Instance.Settings.Sound;

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
            // Boot into the title screen; PLAY dismisses it and jumps to the first
            // uncompleted hole (the level keeps running behind the backdrop).
            _hud.ShowTitle(world);
        }

        /// <summary>Tour hook: dismiss the boot title so captures show gameplay.</summary>
        internal void DismissTitle() => _hud.HideTitle();

        /// <summary>Tour hook: open/close the settings panel for a capture.</summary>
        internal void SetSettingsVisible(bool open) => _hud.SetSettingsVisible(open);

        /// <summary>Settings toggle hook: routes the saved sound setting to the mixer.</summary>
        public void OnSoundSettingChanged(bool on)
        {
            if (_audio != null)
            {
                _audio.Enabled = on;
            }
        }

        private void OnWorldError(string message)
        {
            Debug.LogError($"[GravityGolf] {message}");
            _hud.SetStatus("Could not load levels.", message);
        }

        /// <summary>Freezes the simulation (and input) while the settings menu is open.</summary>
        internal void SetPaused(bool paused)
        {
            _paused = paused;
            // Drop any partially-accumulated step so resuming doesn't jump.
            _accumulator = 0;
        }

        /// <summary>HUD hold-button hook: while held, the sim runs fast-forward (see
        /// FastForwardActive for when it actually applies).</summary>
        public void SetFastForward(bool on)
        {
            _fastForward = on;
        }

        // Fast-forward only takes effect while the sim is actually running the ball or its
        // orbits (aiming, riding a relay, or in flight) and never while paused. Death, goal,
        // rewind, and load ignore it so those transitions play at their intended pace.
        private bool FastForwardActive => _fastForward
            && !_paused
            && (_state == GameState.Aiming || _state == GameState.Landed || _state == GameState.Flying);

        private void Update()
        {
            if (!Ready)
            {
                return;
            }

            if (_paused)
            {
                return;
            }

            HandleHotkeys();

            if (_state == GameState.Rewinding)
            {
                UpdateRewind();
            }
            else if (_state == GameState.Dying)
            {
                UpdateDeath();
            }
            else
            {
                // Fast-forward feeds MORE accumulated time (scaled real delta) but never a
                // bigger physics step; the accumulator clamp still bounds steps per frame.
                var timeScale = FastForwardActive ? FastForwardScale : 1.0;
                _accumulator += Math.Min(Time.deltaTime, MaxFrameDelta) * timeScale;
                _accumulator = Math.Min(_accumulator, PhysicsStep * MaxStepsPerFrame);
                while (_accumulator >= PhysicsStep)
                {
                    Tick(PhysicsStep);
                    _accumulator -= PhysicsStep;
                }
            }

            if (_ballView != null)
            {
                _ballView.CaptureScale = _state == GameState.Goal ? (float)Math.Max(0.0, 1.0 - _goalTransition) : 1f;
            }

            _cameraRig.TrackBall(_ball.Position, _state == GameState.Flying || _state == GameState.Rewinding);

            if (_ballTrail != null)
            {
                var trailOn = (_state == GameState.Flying || _state == GameState.Rewinding)
                    && !SaveStore.Instance.Settings.ReducedMotion;
                if (trailOn)
                {
                    _ballTrail.Sample(Depth.ToWorld(_ball.Position, Depth.BallTrail));
                }
                else
                {
                    _ballTrail.Clear();
                }
            }

            if (_goalView != null)
            {
                _goalView.SetCaptureProgress(_state == GameState.Goal ? (float)_goalTransition : 0f);
            }

            _hud.SetPower((float)(ShownPower / Constants.MaxDragDistance));
            _hud.SetUndoEnabled(CanRewind);
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
            else if (Input.GetKeyDown(KeyCode.Z))
            {
                // Undo/rewind hotkey — also the hook a headless tour uses to trigger and
                // screenshot a mid-rewind frame.
                RequestRewind();
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
                    _audio?.PlayLand();
                    _state = GameState.Landed;
                    _hud.SetStatus($"Relay locked on {result.PlanetName}.", "Line up the next launch.");
                    break;
                case "goal":
                    BeginGoal();
                    break;
                case "crash":
                    BeginCrash(result);
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

            // Snapshot the anchored pre-launch state so Undo can reverse back to it. Push
            // BEFORE any mutation and before _strokes is incremented.
            _checkpoints.Push(new Checkpoint
            {
                Ball = _ball.Clone(),
                LevelTime = _ball.Time,
                Strokes = _strokes,
            });

            var launchPlanetIndex = _ball.AnchorPlanetIndex;
            _ball.Velocity = LaunchMath.AssembleLaunchVelocity(_level, _ball, aimDirection, dragPower);
            _ball.LaunchGracePlanetIndex = launchPlanetIndex;
            _ball.AnchorPlanetIndex = null;
            _ball.AnchorNormal = null;
            _ball.AnchorSinceTime = _ball.Time;
            _ball.PortalCooldown = 0;
            _strokes += 1;
            _state = GameState.Flying;
            _audio?.PlayLaunch();
            _hud.SetStatus($"Flight underway. {_level.Name}.", string.Empty);
        }

        private void BeginGoal()
        {
            _state = GameState.Goal;
            _goalTransition = 0;
            var par = Math.Max(1, _level.LaunchPresets.Count);
            var launches = Math.Max(1, _strokes);
            var medal = MedalLabel(par, launches);
            var newBest = SaveStore.Instance.RecordResult(_level.Id, launches, medal, launches <= par);
            var best = SaveStore.Instance.GetLevel(_level.Id).BestStrokes;
            _hud.ShowResult(_world, _level, medal, ResultName(par, launches), par, launches, newBest, best);
            Haptics.Strong();
            _audio?.PlayGoal();
            _audio?.PlayMedal(medal);
            _hud.SetStatus("Captured!", string.Empty);
        }

        private void BeginCrash(StepResult result)
        {
            var reason = result.Reason;
            Haptics.Strong();
            _audio?.PlayCrash(reason);
            var message = reason switch
            {
                "sun" => "Burned in the sun.",
                "planet" => "Planet impact.",
                "planet-consumed" => "The planet gave way.",
                "bounds" => "Lost in open space.",
                _ => "Crashed.",
            };
            const string hint = "Undo the shot, or retry the hole.";

            // Lethal-body crashes (the sun and non-landable planets) play a short burn/drown
            // animation into the body center FIRST, then show the drawer. Bounds and other
            // outcomes have no body to fall into, so they show the drawer immediately.
            var burns = reason == "sun" || reason == "planet" || reason == "planet-consumed";
            if (!burns)
            {
                _state = GameState.Crashed;
                _hud.ShowGameOver(message, hint, CanRewind);
                return;
            }

            _deathMessage = message;
            _deathHint = hint;
            _deathFrom = _ball.Position;
            _deathCenter = reason == "sun"
                ? _level.Sun
                : (result.PlanetIndex.HasValue
                    && result.PlanetIndex.Value >= 0
                    && result.PlanetIndex.Value < _level.Planets.Count
                        ? _level.Planets[result.PlanetIndex.Value].Position
                        : _ball.Position);
            _deathFlourish = !SaveStore.Instance.Settings.ReducedMotion;
            _deathElapsed = 0;
            _state = GameState.Dying;
        }

        // Advances the burn: drive BallView from the crash point into the body center while
        // it shrinks and heats, then hand off to the recovery drawer exactly as before.
        private void UpdateDeath()
        {
            _deathElapsed += Time.deltaTime;
            var t = DeathDuration > 0 ? (float)(_deathElapsed / DeathDuration) : 1f;
            if (_ballView != null)
            {
                _ballView.SetBurn(
                    t,
                    (float)_deathFrom.X, (float)_deathFrom.Y,
                    (float)_deathCenter.X, (float)_deathCenter.Y,
                    _deathFlourish);
            }

            if (_deathElapsed >= DeathDuration)
            {
                _state = GameState.Crashed;
                // ShowGameOver puts the message in the drawer and promotes the bottom Undo
                // button; no separate SetStatus (it would clear the danger styling).
                _hud.ShowGameOver(_deathMessage, _deathHint, CanRewind);
            }
        }

        private void BeginSettled()
        {
            _state = GameState.Settled;
            _hud.ShowGameOver("Drifted to a stop.", "Undo the shot, or retry the hole.", CanRewind);
        }

        // Undo one shot: reverse the live ball back to the previous anchored launch point.
        // Safe to call from any state where CanRewind is true (Aiming/Landed/Flying/
        // Crashed/Settled); no-ops otherwise.
        internal void RequestRewind()
        {
            if (!CanRewind)
            {
                return;
            }

            _rewindTarget = _checkpoints.Pop();
            _rewindAccumulator = 0;
            _state = GameState.Rewinding;
            _audio?.PlayRewind();

            // A burnt ball reuses this BallView (only Retry rebuilds the level), so drop the
            // death override before the reverse integration takes the ball back over.
            _ballView?.ClearBurn();

            _hud.HideGameOver();
            if (_ballTrail != null)
            {
                _ballTrail.Clear();
            }

            // Stop treating the crash/landing spot as anchored so the reverse integration
            // moves the ball freely; the exact anchored state is restored on completion.
            _ball.AnchorPlanetIndex = null;
            _ball.AnchorNormal = null;

            _hud.SetStatus("Rewinding…", string.Empty);
            _hud.SetUndoEnabled(CanRewind);
        }

        // Backward-integrate the ball toward the checkpoint's level time, capped per frame
        // so a long flight stays watchable and never freezes a single frame.
        private void UpdateRewind()
        {
            _rewindAccumulator += Time.deltaTime * RewindTimeScale;
            var maxThisFrame = MaxRewindStepsPerFrame * PhysicsStep;
            if (_rewindAccumulator > maxThisFrame)
            {
                _rewindAccumulator = maxThisFrame;
            }

            var steps = 0;
            while (_state == GameState.Rewinding && steps < MaxRewindStepsPerFrame)
            {
                if (_ball.Time <= _rewindTarget.LevelTime + 1e-9)
                {
                    CompleteRewind();
                    break;
                }

                if (_rewindAccumulator < PhysicsStep)
                {
                    break;
                }

                _rewindAccumulator -= PhysicsStep;
                steps += 1;
                Sim.ReverseStepBall(_level, _ball, PhysicsStep, _rewindTarget.Ball.AnchorPlanetIndex);
            }
        }

        // Snap the ball exactly to the checkpoint's anchored state and resume aiming.
        private void CompleteRewind()
        {
            var checkpoint = _rewindTarget;
            var anchored = checkpoint.Ball;

            _ball.Position = anchored.Position;
            _ball.Velocity = new Vec2(0, 0);
            _ball.Time = anchored.Time;
            _ball.LandingCount = anchored.LandingCount;
            _ball.LaunchGracePlanetIndex = anchored.LaunchGracePlanetIndex;
            _ball.AnchorPlanetIndex = anchored.AnchorPlanetIndex;
            _ball.AnchorNormal = anchored.AnchorNormal;
            _ball.AnchorSinceTime = anchored.AnchorSinceTime;
            _ball.PortalCooldown = anchored.PortalCooldown;
            _ball.Heat = anchored.Heat;

            Orbits.SetLevelTime(_level, checkpoint.LevelTime);
            Sim.SyncBallToAnchor(_level, _ball);
            _strokes = checkpoint.Strokes;
            _rewindAccumulator = 0;

            // Mirror the normal aim/landing choice: the launch planet chooses Aiming (start)
            // vs Landed (a relay you touched down on).
            var anchorIndex = _ball.AnchorPlanetIndex;
            var isStart = !anchorIndex.HasValue || anchorIndex.Value == _level.StartPlanetIndex;
            if (isStart)
            {
                _state = GameState.Aiming;
                _hud.SetStatus("Rewound to launch.", "Stretch and release.");
            }
            else
            {
                _state = GameState.Landed;
                var planetName = _level.Planets[anchorIndex.Value].Name;
                _hud.SetStatus($"Rewound to {planetName}.", "Line up the next launch.");
            }

            _hud.SetUndoEnabled(CanRewind);
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
            if (Ready)
            {
                _audio?.PlayUi();
            }
            _checkpoints.Clear();
            _rewindAccumulator = 0;
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

            // Subtle static starfield behind everything, overspread well past the fitted
            // view so the dynamic zoom-out (camera follows far slingshot flights up to
            // the ±20 escape backstop) never reaches bare corners.
            var starfield = new GameObject("Starfield").AddComponent<StarfieldView>();
            starfield.transform.SetParent(_levelRoot, false);
            var viewHalf = _cameraRig.ViewHalfSize;
            const float coverage = 1.8f;
            var span = Mathf.Max(viewHalf.x * 2f * coverage, viewHalf.y * 2f * coverage, 52f);
            starfield.Init(_cameraRig.ViewCenter, span, span);

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
            _goalView = goal;

            var trailGo = new GameObject("BallTrail");
            trailGo.transform.SetParent(_levelRoot, false);
            _ballTrail = trailGo.AddComponent<TrailView>();
            _ballTrail.Init((float)Constants.BallRadius);

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

        // One pre-launch snapshot: the anchored ball, the level time it was launched at,
        // and the stroke count before the launch that follows it.
        private struct Checkpoint
        {
            public BallState Ball;
            public double LevelTime;
            public int Strokes;
        }
    }
}
