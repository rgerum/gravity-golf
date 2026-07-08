using System;
using System.Collections.Generic;

namespace GravityGolf.Core
{

    public static class Orbits
    {
        public static double WrapAngleRad(double angle)
        {
            var turn = Math.PI * 2;
            return ((angle % turn) + turn) % turn;
        }

        public static double SolveKepler(double meanAnomaly, double eccentricity)
        {
            if (eccentricity < 0.000001)
            {
                return meanAnomaly;
            }

            var eccentricAnomaly = meanAnomaly;
            for (var iteration = 0; iteration < 8; iteration += 1)
            {
                var delta = (eccentricAnomaly - eccentricity * Math.Sin(eccentricAnomaly) - meanAnomaly)
                    / Math.Max(0.000001, 1 - eccentricity * Math.Cos(eccentricAnomaly));
                eccentricAnomaly -= delta;
                if (Math.Abs(delta) < 0.000001)
                {
                    break;
                }
            }

            return eccentricAnomaly;
        }

        public static Vec2 GetOrbitOffset(PlanetRuntime planet, double anomaly, double time = 0)
        {
            if (planet.OrbitSemiMajor == 0 || planet.OrbitSpeed == 0)
            {
                return new Vec2(0, 0);
            }

            var orbitSemiMajor = planet.OrbitSemiMajor;
            var orbitSemiMinor = planet.OrbitSemiMinor;
            if (planet.OrbitEccentricity < 0.000001)
            {
                return VecMath.Rotate(
                    new Vec2(Math.Cos(anomaly) * orbitSemiMajor, Math.Sin(anomaly) * orbitSemiMajor),
                    planet.OrbitRotation);
            }

            var eccentricAnomaly = SolveKepler(anomaly, planet.OrbitEccentricity);
            return VecMath.Rotate(
                new Vec2(
                    orbitSemiMajor * (Math.Cos(eccentricAnomaly) - planet.OrbitEccentricity),
                    orbitSemiMinor * Math.Sin(eccentricAnomaly)),
                planet.OrbitRotation);
        }

        public static OrbitState GetOrbitState(LevelRuntime level, int planetIndex, double time, Dictionary<int, OrbitState>? cache = null)
        {
            cache ??= new Dictionary<int, OrbitState>();
            if (cache.TryGetValue(planetIndex, out var cached))
            {
                return cached;
            }

            var planet = level.Planets[planetIndex];
            var orbitCenter = level.SystemCenter;
            var centerVelocity = new Vec2(0, 0);

            if (planet.OrbitCenterIndex is not null)
            {
                var parentState = GetOrbitState(level, planet.OrbitCenterIndex.Value, time, cache);
                orbitCenter = parentState.Position;
                centerVelocity = parentState.Velocity;
            }

            if (planet.OrbitSemiMajor == 0 || planet.OrbitSpeed == 0)
            {
                var state = new OrbitState(
                    planet.OrbitCenterIndex is not null ? orbitCenter : planet.BasePosition,
                    centerVelocity,
                    orbitCenter);
                cache[planetIndex] = state;
                return state;
            }

            var deltaTime = 0.0005;
            var meanAnomaly = WrapAngleRad(planet.OrbitPhase + time * planet.OrbitSpeed);
            var nextMeanAnomaly = WrapAngleRad(planet.OrbitPhase + (time + deltaTime) * planet.OrbitSpeed);
            var offset = GetOrbitOffset(planet, meanAnomaly, time);
            var nextOffset = GetOrbitOffset(planet, nextMeanAnomaly, time + deltaTime);
            var velocityOffset = new Vec2(
                (nextOffset.X - offset.X) / deltaTime,
                (nextOffset.Y - offset.Y) / deltaTime);
            var result = new OrbitState(
                new Vec2(orbitCenter.X + offset.X, orbitCenter.Y + offset.Y),
                new Vec2(centerVelocity.X + velocityOffset.X, centerVelocity.Y + velocityOffset.Y),
                orbitCenter);
            cache[planetIndex] = result;
            return result;
        }

        /// <summary>
        /// Mutates <paramref name="level"/> in place by setting its clock and recomputing dynamic planet positions.
        /// Clone the level before calling when stepping a preview trajectory.
        /// </summary>
        public static LevelRuntime SetLevelTime(LevelRuntime level, double time)
        {
            level.Time = time;
            var cache = new Dictionary<int, OrbitState>();
            foreach (var planet in level.Planets)
            {
                var orbitState = GetOrbitState(level, planet.Index, time, cache);
                planet.Position = orbitState.Position;
                planet.OrbitCenter = orbitState.OrbitCenter;
                planet.Active = true;
            }

            return level;
        }

        public static Vec2 GetPlanetVelocity(LevelRuntime level, int planetIndex, double time)
        {
            if (planetIndex < 0 || planetIndex >= level.Planets.Count)
            {
                return new Vec2(0, 0);
            }

            var planet = level.Planets[planetIndex];
            return !planet.Active ? new Vec2(0, 0) : GetOrbitState(level, planetIndex, time).Velocity;
        }

        public static Vec2 GetPlanetSurfaceVelocity(LevelRuntime level, int planetIndex, Vec2? anchorNormal, BallState? ball = null)
        {
            if (planetIndex < 0 || planetIndex >= level.Planets.Count)
            {
                return new Vec2(0, 0);
            }

            var planet = level.Planets[planetIndex];
            if (!planet.Active || (planet.SpinSpeed == 0))
            {
                return new Vec2(0, 0);
            }

            var normal = VecMath.Normalize(anchorNormal ?? new Vec2(1, 0));
            var tangent = new Vec2(-normal.Y, normal.X);
            var speed = Sim.GetBallSurfaceRadius(planet) * planet.SpinSpeed;
            return new Vec2(tangent.X * speed, tangent.Y * speed);
        }
    }
}
