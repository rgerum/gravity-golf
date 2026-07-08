using System;
using GravityGolf.Core;

namespace GravityGolf.Game
{
    /// <summary>
    /// Input-layer launch math that lives OUTSIDE the shared physics core (see
    /// spec-interaction §1.4-1.5). constrainLaunchDirection prevents aiming into the
    /// launch planet, and AssembleLaunchVelocity builds the three-vector launch
    /// velocity (relative + planet body + planet surface) used by both the live launch
    /// and the aim preview so the preview matches the real shot.
    /// </summary>
    public static class LaunchMath
    {
        private const double MaxInwardDeg = 15.0;

        private static double Dot(Vec2 a, Vec2 b) => a.X * b.X + a.Y * b.Y;

        public static Vec2 ConstrainLaunchDirection(LevelRuntime level, BallState ball, Vec2 direction, double power)
        {
            var n = VecMath.Normalize(direction);
            if (ball.AnchorPlanetIndex is null)
            {
                return n;
            }

            var anchorNormal = VecMath.Normalize(ball.AnchorNormal ?? new Vec2(1, 0));
            var tangent = new Vec2(-anchorNormal.Y, anchorNormal.X);
            var relSpeed = Math.Max(1e-4, VecMath.Length(Sim.LaunchVelocity(n, power)));

            var index = ball.AnchorPlanetIndex.Value;
            var body = Orbits.GetPlanetVelocity(level, index, ball.Time);
            var surface = Orbits.GetPlanetSurfaceVelocity(level, index, ball.AnchorNormal);
            var inherited = new Vec2(body.X + surface.X, body.Y + surface.Y);

            var minSafeNormalVel = -relSpeed * Math.Sin(MaxInwardDeg * Math.PI / 180.0);
            var requiredNormalComponent = (minSafeNormalVel - Dot(inherited, anchorNormal)) / relSpeed;
            if (requiredNormalComponent <= -1)
            {
                return n;
            }

            if (requiredNormalComponent >= 1)
            {
                return anchorNormal;
            }

            var requestedRelAngle = Math.Atan2(Dot(n, tangent), Dot(n, anchorNormal));
            var maxRelAngle = Math.Acos(VecMath.Clamp(requiredNormalComponent, -1, 1));
            var clamped = VecMath.Clamp(requestedRelAngle, -maxRelAngle, maxRelAngle);
            var cos = Math.Cos(clamped);
            var sin = Math.Sin(clamped);
            return VecMath.Normalize(new Vec2(
                anchorNormal.X * cos + tangent.X * sin,
                anchorNormal.Y * cos + tangent.Y * sin));
        }

        /// <summary>
        /// Full launch velocity = relativeVelocity + bodyVelocity + surfaceVelocity
        /// (spec §1.4). Must be called while the ball is still anchored.
        /// </summary>
        public static Vec2 AssembleLaunchVelocity(LevelRuntime level, BallState ball, Vec2 aimDirection, double dragPower)
        {
            var direction = ConstrainLaunchDirection(level, ball, aimDirection, dragPower);
            var relative = Sim.LaunchVelocity(direction, dragPower);
            var index = ball.AnchorPlanetIndex;
            var body = index.HasValue ? Orbits.GetPlanetVelocity(level, index.Value, ball.Time) : new Vec2(0, 0);
            var surface = index.HasValue ? Orbits.GetPlanetSurfaceVelocity(level, index.Value, ball.AnchorNormal) : new Vec2(0, 0);
            return new Vec2(relative.X + body.X + surface.X, relative.Y + body.Y + surface.Y);
        }
    }
}
