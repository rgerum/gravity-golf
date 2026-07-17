using System;
using System.Collections.Generic;

namespace GravityGolf.Core
{

    public static class Sim
    {
        public static bool IsGoalOpen(LevelRuntime level, double time) => !level.GoalUnlockRequired || level.GoalUnlocked;

        public static double GetBallSurfaceRadius(PlanetRuntime planet) =>
            planet.Radius + Constants.BallRadius + Constants.PlanetLandingPadding;

        public static double LaunchSpeedForDrag(double dragPower) =>
            Math.Min(Constants.LaunchMaxSpeed, Constants.LaunchBaseSpeed + dragPower * Constants.LaunchDragSpeed);

        public static Vec2 LaunchVelocity(Vec2 direction, double dragPower)
        {
            var normalizedDirection = VecMath.Normalize(direction);
            var speed = LaunchSpeedForDrag(dragPower);
            return new Vec2(normalizedDirection.X * speed, normalizedDirection.Y * speed);
        }

        public static void SyncBallToAnchor(LevelRuntime level, BallState ball)
        {
            if (ball.AnchorPlanetIndex is null)
            {
                return;
            }

            var planet = level.Planets[ball.AnchorPlanetIndex.Value];
            if (!planet.Active)
            {
                ball.AnchorPlanetIndex = null;
                return;
            }

            var anchorNormal = VecMath.Normalize(ball.AnchorNormal ?? new Vec2(1, 0));
            var surfaceRadius = GetBallSurfaceRadius(planet);
            ball.Position = new Vec2(
                planet.Position.X + anchorNormal.X * surfaceRadius,
                planet.Position.Y + anchorNormal.Y * surfaceRadius);
        }

        public static StepResult? AdvanceBallAnchor(LevelRuntime level, BallState ball, double delta)
        {
            if (ball.AnchorPlanetIndex is null)
            {
                return null;
            }

            var planet = level.Planets[ball.AnchorPlanetIndex.Value];
            if (!planet.Active)
            {
                var planetIndex = ball.AnchorPlanetIndex;
                ball.AnchorPlanetIndex = null;
                ball.AnchorNormal = null;
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "crash", Reason = "planet-consumed", PlanetIndex = planetIndex };
            }

            if (planet.SpinSpeed != 0)
            {
                ball.AnchorNormal = VecMath.Normalize(VecMath.Rotate(ball.AnchorNormal ?? new Vec2(1, 0), planet.SpinSpeed * delta));
            }

            SyncBallToAnchor(level, ball);
            UpdateBallHeat(level, ball, delta);
            return null;
        }

        /// <summary>
        /// Mutates <paramref name="level"/> and <paramref name="ball"/> in place for one physics step.
        /// Clone the level before calling when the live runtime must not advance.
        /// </summary>
        public static StepResult StepBall(LevelRuntime level, BallState ball, double delta)
        {
            if (ball.AnchorPlanetIndex is not null && !level.Planets[ball.AnchorPlanetIndex.Value].Active)
            {
                var planet = level.Planets[ball.AnchorPlanetIndex.Value];
                ball.AnchorPlanetIndex = null;
                ball.AnchorNormal = null;
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "crash", Reason = "planet-consumed", PlanetIndex = planet.Index, PlanetName = planet.Name };
            }

            if (VecMath.LengthSq(ball.Velocity) < 0.000001 && Gravity.CanBallSettle(level, ball))
            {
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "settled" };
            }

            var nextTime = ball.Time + delta;
            Orbits.SetLevelTime(level, nextTime);
            ball.Time = nextTime;
            ball.PortalCooldown = Math.Max(0, ball.PortalCooldown - delta);
            UpdateBallHeat(level, ball, delta);

            if ((!level.GoalUnlockRequired || level.GoalUnlocked) && !IsGoalOpen(level, ball.Time))
            {
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "crash", Reason = "goal-closed" };
            }

            var acceleration = Gravity.SampleBallAcceleration(level, ball.Position);
            ball.Velocity = new Vec2(
                ball.Velocity.X + acceleration.X * delta,
                ball.Velocity.Y + acceleration.Y * delta);

            var toGoal = new Vec2(level.GoalCenter.X - ball.Position.X, level.GoalCenter.Y - ball.Position.Y);
            var goalDistance = Math.Max(VecMath.Length(toGoal), 0.001);
            if (IsGoalOpen(level, ball.Time) && goalDistance < level.GoalRadius * Constants.GoalCaptureRatio)
            {
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "goal" };
            }

            var previousPosition = ball.Position;
            var position = ball.Position;
            VecMath.AddScaled(ref position, ball.Velocity, delta);
            ball.Position = position;

            var postPortalGoalDistance = Math.Max(VecMath.Distance(ball.Position, level.GoalCenter), 0.001);
            if (IsGoalOpen(level, ball.Time) && postPortalGoalDistance < level.GoalRadius * Constants.GoalCaptureRatio)
            {
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "goal" };
            }

            var sunContact = ResolveSunContact(level, ball, previousPosition);
            if (sunContact is not null)
            {
                return sunContact;
            }

            var planetContact = ResolvePlanetContact(level, ball);
            if (planetContact is not null)
            {
                return planetContact;
            }

            var asteroidContact = ResolveAsteroidContact(level, ball);
            if (asteroidContact is not null)
            {
                return asteroidContact;
            }

            var friction = Math.Pow(Constants.BallFrictionBase, delta * 60);
            ball.Velocity = new Vec2(ball.Velocity.X * friction, ball.Velocity.Y * friction);

            if (Math.Abs(ball.Position.X) > level.OutBoundsX || Math.Abs(ball.Position.Y) > level.OutBoundsY)
            {
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "crash", Reason = "bounds" };
            }

            if (VecMath.Length(ball.Velocity) < Constants.BallStopSpeed && Gravity.CanBallSettle(level, ball))
            {
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "settled" };
            }

            return new StepResult { Type = "flying" };
        }

        public static StepResult ReverseStepBall(LevelRuntime level, BallState ball, double delta, int? launchPlanetIndex = null)
        {
            var currentTime = ball.Time;
            var friction = Math.Pow(Constants.BallFrictionBase, delta * 60);
            var velocityBeforeFriction = new Vec2(
                ball.Velocity.X / friction,
                ball.Velocity.Y / friction);
            var previousPosition = new Vec2(
                ball.Position.X - velocityBeforeFriction.X * delta,
                ball.Position.Y - velocityBeforeFriction.Y * delta);
            var acceleration = Gravity.SampleBallAcceleration(level, previousPosition);
            var previousVelocity = new Vec2(
                velocityBeforeFriction.X - acceleration.X * delta,
                velocityBeforeFriction.Y - acceleration.Y * delta);
            var previousTime = currentTime - delta;

            Orbits.SetLevelTime(level, previousTime);
            ball.Time = previousTime;
            ball.Position = previousPosition;
            ball.Velocity = previousVelocity;
            ball.AnchorPlanetIndex = null;
            ball.AnchorNormal = ball.AnchorNormal is not null ? VecMath.Clone(ball.AnchorNormal.Value) : null;
            UpdateBallHeat(level, ball, -delta);

            if (launchPlanetIndex is not null)
            {
                var launchPlanetIndexValue = launchPlanetIndex.Value;
                if (launchPlanetIndexValue >= 0 && launchPlanetIndexValue < level.Planets.Count)
                {
                    var launchPlanet = level.Planets[launchPlanetIndexValue];
                    var clearanceRadius = (launchPlanet.LandingRadius ?? GetBallSurfaceRadius(launchPlanet))
                        + Constants.PlanetLandingPadding;
                    ball.LaunchGracePlanetIndex = VecMath.Distance(ball.Position, launchPlanet.Position) <= clearanceRadius
                        ? launchPlanetIndex
                        : null;
                }
            }

            return new StepResult { Type = "flying" };
        }

        /// <summary>
        /// Mutates <paramref name="level"/> in place while replaying the shot, matching game-core.js:5074.
        /// Use <see cref="SimulateShotPreview"/> when the input level must remain unchanged.
        /// </summary>
        public static SimulateShotResult SimulateShot(LevelRuntime level, ShotInput shot, SimulateShotOptions? options = null)
        {
            options ??= new SimulateShotOptions();
            var delta = options.Delta;
            var maxTime = options.MaxTime;
            var startTime = options.StartTime;
            var waitTime = shot.WaitTime;
            int? anchorPlanetIndex = options.AnchorPlanetIndex ?? level.StartPlanetIndex;
            var anchorNormal = options.AnchorNormal ?? VecMath.DirectionFromAngleDeg(level.StartAngleDeg);
            var startPosition = options.StartPosition ?? level.StartAnchor;

            Orbits.SetLevelTime(level, startTime);
            var ball = new BallState
            {
                Position = startPosition,
                Velocity = new Vec2(0, 0),
                Time = startTime,
                LandingCount = options.LandingCount,
                LaunchGracePlanetIndex = anchorPlanetIndex ?? FindContainingLandingPlanetIndex(level, startPosition),
                AnchorPlanetIndex = anchorPlanetIndex,
                AnchorNormal = anchorNormal,
                AnchorSinceTime = startTime,
                PortalCooldown = 0,
                Heat = options.Heat,
            };

            List<FrameSample>? frames = options.CaptureFrames ? new List<FrameSample>() : null;
            BallState? launchState = null;
            var frameIndex = 0;
            void PushFrame()
            {
                if (frames is null)
                {
                    return;
                }

                frames.Add(new FrameSample
                {
                    Index = frameIndex++,
                    Position = ball.Position,
                    Velocity = ball.Velocity,
                    Time = ball.Time,
                    AnchorPlanetIndex = ball.AnchorPlanetIndex,
                    LandingCount = ball.LandingCount,
                });
            }

            if (ball.AnchorPlanetIndex is not null)
            {
                SyncBallToAnchor(level, ball);
            }
            PushFrame();

            if (waitTime > 0)
            {
                if (options.CaptureFrames)
                {
                    var remainingWait = waitTime;
                    while (remainingWait > 0.000001)
                    {
                        var step = Math.Min(delta, remainingWait);
                        var launchTime = ball.Time + step;
                        Orbits.SetLevelTime(level, launchTime);
                        ball.Time = launchTime;
                        if (ball.AnchorPlanetIndex is not null)
                        {
                            var anchorResult = AdvanceBallAnchor(level, ball, step);
                            if (anchorResult?.Type == "crash")
                            {
                                PushFrame();
                                return BuildResult(anchorResult, level, ball, waitTime, 0, 0, launchTime, launchState, frames);
                            }
                        }
                        PushFrame();
                        remainingWait -= step;
                    }
                }
                else
                {
                    var launchTime = startTime + waitTime;
                    Orbits.SetLevelTime(level, launchTime);
                    ball.Time = launchTime;
                    if (ball.AnchorPlanetIndex is not null)
                    {
                        var anchorResult = AdvanceBallAnchor(level, ball, waitTime);
                        if (anchorResult?.Type == "crash")
                        {
                            return BuildResult(anchorResult, level, ball, waitTime, 0, 0, launchTime, launchState, frames);
                        }
                    }
                }
            }

            if (!IsGoalOpen(level, ball.Time))
            {
                return BuildResult(new StepResult { Type = "crash", Reason = "goal-closed" }, level, ball, waitTime, 0, 0, ball.Time, launchState, frames);
            }

            var relativeLaunchVelocity = LaunchVelocity(new Vec2(Math.Cos(shot.Angle), Math.Sin(shot.Angle)), shot.DragPower);
            var launchBodyVelocity = anchorPlanetIndex is not null
                ? Orbits.GetPlanetVelocity(level, anchorPlanetIndex.Value, ball.Time)
                : new Vec2(0, 0);
            var launchSurfaceVelocity = anchorPlanetIndex is not null
                ? Orbits.GetPlanetSurfaceVelocity(level, anchorPlanetIndex.Value, ball.AnchorNormal)
                : new Vec2(0, 0);
            ball.Velocity = new Vec2(
                relativeLaunchVelocity.X + launchBodyVelocity.X + launchSurfaceVelocity.X,
                relativeLaunchVelocity.Y + launchBodyVelocity.Y + launchSurfaceVelocity.Y);
            ball.LaunchGracePlanetIndex = ball.AnchorPlanetIndex;
            ball.AnchorPlanetIndex = null;
            ball.AnchorNormal = null;
            launchState = ball.Clone();
            PushFrame();

            var time = 0.0;
            var steps = 0;
            var minGoalDistance = VecMath.Distance(ball.Position, level.GoalCenter);
            var minPlanetClearance = double.PositiveInfinity;

            while (time < maxTime)
            {
                minGoalDistance = Math.Min(minGoalDistance, VecMath.Distance(ball.Position, level.GoalCenter));
                foreach (var planet in level.Planets)
                {
                    if (!planet.Active)
                    {
                        continue;
                    }

                    var clearance = VecMath.Distance(ball.Position, planet.Position)
                        - (planet.Radius + Constants.BallRadius * Constants.PlanetCollisionPadding);
                    minPlanetClearance = Math.Min(minPlanetClearance, clearance);
                }

                var result = StepBall(level, ball, delta);
                time += delta;
                steps += 1;
                PushFrame();
                if (result.Type != "flying")
                {
                    return BuildResult(result, level, ball, waitTime, time, steps, ball.Time, launchState, frames, minGoalDistance, minPlanetClearance);
                }
            }

            return new SimulateShotResult
            {
                Outcome = "timeout",
                Reason = "",
                WaitTime = waitTime,
                LandingCount = ball.LandingCount,
                Time = time,
                Steps = steps,
                FinalTime = ball.Time,
                AnchorPlanetIndex = ball.AnchorPlanetIndex,
                AnchorNormal = ball.AnchorNormal,
                Heat = ball.Heat,
                MinGoalDistance = minGoalDistance,
                MinPlanetClearance = minPlanetClearance,
                FinalPosition = ball.Position,
                LaunchState = launchState,
                Frames = frames,
            };
        }

        public static SimulateShotResult SimulateShotPreview(LevelRuntime level, ShotInput shot, SimulateShotOptions? options = null) =>
            SimulateShot(level.Clone(), shot, options);

        private static StepResult? ResolveSunContact(LevelRuntime level, BallState ball, Vec2 previousPosition)
        {
            var touchRadius = level.SunCollisionRadius + Constants.BallRadius * Constants.PlanetCollisionPadding;
            if (VecMath.Distance(ball.Position, level.Sun) <= touchRadius)
            {
                ball.Velocity = new Vec2(0, 0);
                return new StepResult { Type = "crash", Reason = "sun" };
            }

            return null;
        }

        private static StepResult? ResolvePlanetContact(LevelRuntime level, BallState ball)
        {
            for (var index = 0; index < level.Planets.Count; index += 1)
            {
                var planet = level.Planets[index];
                if (!planet.Active)
                {
                    if (ball.LaunchGracePlanetIndex == index)
                    {
                        ball.LaunchGracePlanetIndex = null;
                    }
                    continue;
                }

                var toPlanet = new Vec2(planet.Position.X - ball.Position.X, planet.Position.Y - ball.Position.Y);
                var distance = Math.Max(VecMath.Length(toPlanet), 0.001);
                var touchRadius = planet.Radius + Constants.BallRadius * Constants.PlanetCollisionPadding;
                var landingRadius = planet.LandingRadius ?? GetBallSurfaceRadius(planet);

                if (ball.LaunchGracePlanetIndex == index && distance > landingRadius + Constants.PlanetLandingPadding)
                {
                    ball.LaunchGracePlanetIndex = null;
                }

                if (planet.Landable && distance <= touchRadius)
                {
                    LandBallOnPlanet(ball, planet, index);
                    return new StepResult { Type = "landed", PlanetIndex = index, PlanetName = planet.Name };
                }

                if (distance <= touchRadius)
                {
                    ball.Velocity = new Vec2(0, 0);
                    return new StepResult { Type = "crash", Reason = "planet", PlanetIndex = index, PlanetName = planet.Name };
                }
            }

            return null;
        }

        private static StepResult? ResolveAsteroidContact(LevelRuntime level, BallState ball)
        {
            foreach (var asteroid in level.Asteroids)
            {
                var touchRadius = asteroid.Radius + Constants.BallRadius * Constants.PlanetCollisionPadding;
                if (VecMath.Distance(ball.Position, asteroid.Position) <= touchRadius)
                {
                    ball.Velocity = new Vec2(0, 0);
                    return new StepResult { Type = "crash", Reason = "asteroid", AsteroidIndex = asteroid.Index };
                }
            }

            return null;
        }

        private static void LandBallOnPlanet(BallState ball, PlanetRuntime planet, int planetIndex)
        {
            var landingDirection = GetLandingDirection(ball, planet);
            var surfaceRadius = GetBallSurfaceRadius(planet);
            ball.Position = new Vec2(
                planet.Position.X + landingDirection.X * surfaceRadius,
                planet.Position.Y + landingDirection.Y * surfaceRadius);
            ball.Velocity = new Vec2(0, 0);
            ball.LandingCount += 1;
            ball.LaunchGracePlanetIndex = null;
            ball.AnchorPlanetIndex = planetIndex;
            ball.AnchorNormal = landingDirection;
            ball.AnchorSinceTime = ball.Time;
            ball.PortalCooldown = 0;
        }

        private static Vec2 GetLandingDirection(BallState ball, PlanetRuntime planet)
        {
            var fromPlanet = new Vec2(ball.Position.X - planet.Position.X, ball.Position.Y - planet.Position.Y);
            if (VecMath.LengthSq(fromPlanet) > 0.000001)
            {
                return VecMath.Normalize(fromPlanet);
            }

            if (VecMath.LengthSq(ball.Velocity) > 0.000001)
            {
                return VecMath.Normalize(new Vec2(-ball.Velocity.X, -ball.Velocity.Y));
            }

            return new Vec2(1, 0);
        }

        private static int? FindContainingLandingPlanetIndex(LevelRuntime level, Vec2 position)
        {
            for (var index = 0; index < level.Planets.Count; index += 1)
            {
                var planet = level.Planets[index];
                if (!planet.Landable || !planet.Active)
                {
                    continue;
                }

                var landingRadius = planet.LandingRadius ?? GetBallSurfaceRadius(planet);
                if (VecMath.Distance(position, planet.Position) <= landingRadius)
                {
                    return index;
                }
            }

            return null;
        }

        private static void UpdateBallHeat(LevelRuntime level, BallState ball, double delta)
        {
            var anchorPlanet = ball.AnchorPlanetIndex is not null ? level.Planets[ball.AnchorPlanetIndex.Value] : null;
            var coolRate = anchorPlanet is not null ? Constants.BallHeatCoolRateAnchored : Constants.BallHeatCoolRateFlight;
            ball.Heat = VecMath.Clamp(ball.Heat - coolRate * delta, 0, Constants.BallHeatMax);
        }

        private static SimulateShotResult BuildResult(
            StepResult result,
            LevelRuntime level,
            BallState ball,
            double waitTime,
            double time,
            int steps,
            double finalTime,
            BallState? launchState,
            List<FrameSample>? frames,
            double minGoalDistance = 0,
            double minPlanetClearance = double.PositiveInfinity) => new()
            {
                Outcome = result.Type,
                Reason = result.Reason,
                PlanetIndex = result.PlanetIndex,
                PlanetName = result.PlanetName,
                WaitTime = waitTime,
                LandingCount = ball.LandingCount,
                Time = time,
                Steps = steps,
                FinalTime = finalTime,
                AnchorPlanetIndex = ball.AnchorPlanetIndex,
                AnchorNormal = ball.AnchorNormal,
                Heat = ball.Heat,
                MinGoalDistance = minGoalDistance == 0 ? VecMath.Distance(ball.Position, level.GoalCenter) : minGoalDistance,
                MinPlanetClearance = minPlanetClearance,
                FinalPosition = ball.Position,
                LaunchState = launchState,
                Frames = frames,
            };
    }
}
