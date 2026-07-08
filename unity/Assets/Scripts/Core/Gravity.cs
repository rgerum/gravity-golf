using System;

namespace GravityGolf.Core
{

    public static class Gravity
    {
        public static Vec2 SamplePlanetGravity(LevelRuntime level, Vec2 point)
        {
            var netGravity = new Vec2(0, 0);
            foreach (var planet in level.Planets)
            {
                if (!planet.Active)
                {
                    continue;
                }

                var toPlanet = new Vec2(planet.Position.X - point.X, planet.Position.Y - point.Y);
                var distance = Math.Max(VecMath.Length(toPlanet), 0.001);
                if (distance >= planet.Falloff)
                {
                    continue;
                }

                var pull = planet.Gravity * Constants.PlanetGravityMultiplier / (distance * distance + 0.22);
                var direction = VecMath.Normalize(toPlanet);
                netGravity.X += direction.X * pull;
                netGravity.Y += direction.Y * pull;
            }

            if (level.SunGravityStrength > 0)
            {
                var toSun = new Vec2(level.Sun.X - point.X, level.Sun.Y - point.Y);
                var distance = Math.Max(VecMath.Length(toSun), 0.001);
                var pull = level.SunGravityStrength * Constants.SolarGravityMultiplier / (distance * distance + Constants.SolarGravitySoftening);
                var direction = VecMath.Normalize(toSun);
                netGravity.X += direction.X * pull;
                netGravity.Y += direction.Y * pull;
            }

            return netGravity;
        }

        public static Vec2 SampleBallAcceleration(LevelRuntime level, Vec2 point)
        {
            var acceleration = SamplePlanetGravity(level, point);
            var toGoal = new Vec2(level.GoalCenter.X - point.X, level.GoalCenter.Y - point.Y);
            var goalDistance = Math.Max(VecMath.Length(toGoal), 0.001);
            if (Sim.IsGoalOpen(level, level.Time) && goalDistance < level.GoalPullRadius)
            {
                var pull = level.GoalPullStrength / (goalDistance * goalDistance + 0.38);
                var direction = VecMath.Normalize(toGoal);
                acceleration.X += direction.X * pull;
                acceleration.Y += direction.Y * pull;
            }

            return acceleration;
        }

        public static bool CanBallSettle(LevelRuntime level, BallState ball, Vec2? acceleration = null)
        {
            var localAcceleration = acceleration ?? SampleBallAcceleration(level, ball.Position);
            return VecMath.Length(localAcceleration) < Constants.BallSettleAcceleration;
        }
    }
}
