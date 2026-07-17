using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GravityGolf.Core
{

    public static class LevelLoader
    {
        private static readonly HashSet<string> LevelMechanicKeys = new HashSet<string>
        {
            "binarySystem", "extraSuns", "portals", "dustClouds",
            "meteorImpacts", "pulsarJets", "redGiant"
        };

        private static readonly HashSet<string> PlanetMechanicKeys = new HashSet<string>
        {
            "splitSurface", "surfaceType", "flicker", "hidden", "goalUnlock",
            "orbitAnchor", "slideAngularSpeed", "orbitDecayRate", "orbitAround",
            "destroyedByMeteor", "fallIntoSunRadius"
        };

        public static WorldDefinition LoadWorld(string path)
        {
            var text = File.ReadAllText(path);
            return LoadWorldFromJson(text, path);
        }

        public static WorldDefinition LoadWorldFromJson(string text, string sourceName = "world json")
        {
            var root = JObject.Parse(text);
            if ((int?)root["schemaVersion"] != 1)
            {
                throw new InvalidDataException($"world schemaVersion must be 1 in {sourceName}");
            }

            var levelsToken = root["levels"] as JArray
                ?? throw new InvalidDataException($"levels: missing or not an array in {sourceName}");
            if (levelsToken.Count != 10)
            {
                throw new InvalidDataException($"world levels length must be 10, got {levelsToken.Count}");
            }

            for (var i = 0; i < levelsToken.Count; i += 1)
            {
                var expectedGlobalIndex = ExpectedGlobalLevelIndex(root, i);
                ValidateLevelTokens((JObject)levelsToken[i]!, expectedGlobalIndex);
            }

            var world = root.ToObject<WorldDefinition>() ?? throw new InvalidDataException($"Could not parse world file {sourceName}");
            if (world.Levels.Count != 10)
            {
                throw new InvalidDataException($"world levels length must be 10, got {world.Levels.Count}");
            }

            for (var i = 0; i < world.Levels.Count; i += 1)
            {
                var expectedGlobalIndex = (world.WorldNumber - 1) * world.WorldSize + i;
                ValidateLevel(world.Levels[i], (JObject)root["levels"]![i]!, expectedGlobalIndex);
            }

            return world;
        }

        private static void ValidateLevelTokens(JObject source, int expectedIndex)
        {
            var levelId = RequiredString(source, "id", $"level index {expectedIndex}");
            var label = $"level {levelId}";

            RequiredInteger(source, "index", label);
            RequiredString(source, "name", label);
            RequiredInteger(source, "worldLevelNumber", label);
            RequiredVec(source, "sun", label);
            RequiredNumber(source, "sunGravityStrength", label);
            RequiredNumber(source, "sunCollisionRadius", label);
            RequiredInteger(source, "startPlanetIndex", label);
            RequiredNumber(source, "startAngleDeg", label);
            RequiredVec(source, "startAnchor", label);
            RequiredNumber(source, "startTimeSeconds", label);
            RequiredVec(source, "goalCenter", label);
            RequiredNumber(source, "goalRadius", label);
            RequiredNumber(source, "goalPullRadius", label);
            RequiredNumber(source, "goalPullStrength", label);
            RequiredNumber(source, "goalOpenSeconds", label);
            RequiredBoolean(source, "goalUnlockRequired", label);

            var planets = RequiredArray(source, "planets", label, allowEmpty: false);
            for (var i = 0; i < planets.Count; i += 1)
            {
                var planet = planets[i] as JObject
                    ?? throw new InvalidDataException($"planets[{i}]: missing object on level {levelId}");
                ValidatePlanetTokens(planet, levelId, i);
            }

            var presets = RequiredArray(source, "launchPresets", label, allowEmpty: false);
            for (var i = 0; i < presets.Count; i += 1)
            {
                var presetLabel = $"level {levelId} launchPresets[{i}]";
                var preset = presets[i] as JObject
                    ?? throw new InvalidDataException($"launchPresets[{i}]: missing object on level {levelId}");
                RequiredNumber(preset, "angleDeg", presetLabel);
                RequiredNumber(preset, "power", presetLabel);
            }

            if (source.TryGetValue("asteroids", out var asteroidsToken))
            {
                if (asteroidsToken is not JArray asteroids)
                {
                    throw new InvalidDataException($"asteroids: not an array on {label}");
                }

                for (var i = 0; i < asteroids.Count; i += 1)
                {
                    var asteroid = asteroids[i] as JObject
                        ?? throw new InvalidDataException($"asteroids[{i}]: missing object on level {levelId}");
                    ValidateAsteroidTokens(asteroid, levelId, i);
                }
            }
        }

        private static int ExpectedGlobalLevelIndex(JObject root, int worldLevelIndex)
        {
            var worldNumber = (int?)root["worldNumber"] ?? 1;
            var worldSize = (int?)root["worldSize"] ?? 10;
            return (worldNumber - 1) * worldSize + worldLevelIndex;
        }

        private static void ValidatePlanetTokens(JObject source, string levelId, int expectedIndex)
        {
            var label = $"level {levelId} planets[{expectedIndex}]";
            RequiredInteger(source, "index", label);
            RequiredString(source, "name", label);
            RequiredVec(source, "basePosition", label);
            RequiredNumber(source, "radius", label);
            OptionalNumberOrNull(source, "landingRadius", label);
            RequiredNumber(source, "gravity", label);
            RequiredNumber(source, "falloff", label);
            RequiredBoolean(source, "landable", label);
            RequiredNullOrInteger(source, "orbitCenterIndex", label);
            RequiredNumber(source, "orbitSemiMajor", label);
            RequiredNumber(source, "orbitSemiMinor", label);
            RequiredNumber(source, "orbitEccentricity", label);
            RequiredNumber(source, "orbitRotation", label);
            RequiredNumber(source, "orbitPhase", label);
            RequiredNumber(source, "orbitSpeed", label);
            RequiredNumber(source, "spinSpeed", label);
        }

        private static void ValidateAsteroidTokens(JObject source, string levelId, int expectedIndex)
        {
            var label = $"level {levelId} asteroids[{expectedIndex}]";
            RequiredInteger(source, "index", label);
            RequiredVec(source, "position", label);
            RequiredNumber(source, "orbitRadius", label);
            RequiredNumber(source, "baseAngleDeg", label);
            RequiredNumber(source, "orbitAngularSpeed", label);
            RequiredNumber(source, "radius", label);
            OptionalNumberOrNull(source, "spinSpeed", label);
            if (source.TryGetValue("color", out var color) && color.Type != JTokenType.Null && color.Type != JTokenType.Integer)
            {
                throw new InvalidDataException($"color: not an integer on {label}");
            }
        }

        private static void ValidateLevel(LevelRuntime level, JObject source, int expectedIndex)
        {
            var label = $"level {level.Id} ({expectedIndex})";
            if (level.Index != expectedIndex)
            {
                throw new InvalidDataException($"index: {label} expected {expectedIndex}, got {level.Index}");
            }

            foreach (var key in LevelMechanicKeys)
            {
                if (source.TryGetValue(key, out var token) && IsPresentMechanic(token))
                {
                    throw new InvalidDataException($"{key}: unsupported level mechanic on {label}");
                }
            }

            if (level.GoalUnlockRequired)
            {
                throw new InvalidDataException($"goalUnlockRequired: unsupported on {label}");
            }

            RequireFinite(level.Sun.X, "sun.x", label);
            RequireFinite(level.Sun.Y, "sun.y", label);
            RequireFinite(level.SunGravityStrength, "sunGravityStrength", label);
            RequireFinite(level.StartAngleDeg, "startAngleDeg", label);
            RequireFinite(level.StartAnchor.X, "startAnchor.x", label);
            RequireFinite(level.StartAnchor.Y, "startAnchor.y", label);
            RequireFinite(level.StartTimeSeconds, "startTimeSeconds", label);
            RequireFinite(level.GoalCenter.X, "goalCenter.x", label);
            RequireFinite(level.GoalCenter.Y, "goalCenter.y", label);
            RequireFinite(level.GoalRadius, "goalRadius", label);
            RequireFinite(level.GoalPullRadius, "goalPullRadius", label);
            RequireFinite(level.GoalPullStrength, "goalPullStrength", label);

            if (level.StartPlanetIndex < 0 || level.StartPlanetIndex >= level.Planets.Count)
            {
                throw new InvalidDataException($"startPlanetIndex: out of range on {label}");
            }

            level.SystemCenter = level.Sun;
            level.Time = level.StartTimeSeconds;
            level.GoalUnlocked = true;
            level.Asteroids ??= new List<AsteroidRuntime>();

            var planetSources = (JArray?)source["planets"] ?? throw new InvalidDataException($"planets: missing on {label}");
            for (var i = 0; i < level.Planets.Count; i += 1)
            {
                ValidatePlanet(level.Planets[i], (JObject)planetSources[i]!, label, i);
            }

            for (var i = 0; i < level.LaunchPresets.Count; i += 1)
            {
                RequireFinite(level.LaunchPresets[i].AngleDeg, $"launchPresets[{i}].angleDeg", label);
                RequireFinite(level.LaunchPresets[i].Power, $"launchPresets[{i}].power", label);
            }

            for (var i = 0; i < level.Asteroids.Count; i += 1)
            {
                ValidateAsteroid(level.Asteroids[i], label, i);
            }

            Orbits.SetLevelTime(level, level.Time);
        }

        private static void ValidatePlanet(PlanetRuntime planet, JObject source, string levelLabel, int expectedIndex)
        {
            var label = $"{levelLabel} planet {expectedIndex}";
            if (planet.Index != expectedIndex)
            {
                throw new InvalidDataException($"planet.index: {label} expected {expectedIndex}, got {planet.Index}");
            }

            if (planet.OrbitCenterIndex is not null)
            {
                throw new InvalidDataException($"orbitCenterIndex: moons unsupported on {label}");
            }

            if (source.TryGetValue("turrets", out var turrets) && IsPresentMechanic(turrets))
            {
                throw new InvalidDataException($"turrets: unsupported non-empty field on {label}");
            }

            foreach (var key in PlanetMechanicKeys)
            {
                if (source.TryGetValue(key, out var token) && IsPresentMechanic(token))
                {
                    throw new InvalidDataException($"{key}: unsupported planet mechanic on {label}");
                }
            }

            RequireFinite(planet.BasePosition.X, "basePosition.x", label);
            RequireFinite(planet.BasePosition.Y, "basePosition.y", label);
            RequireFinite(planet.Radius, "radius", label);
            RequireFinite(planet.Gravity, "gravity", label);
            RequireFinite(planet.Falloff, "falloff", label);
            RequireFinite(planet.OrbitSemiMajor, "orbitSemiMajor", label);
            RequireFinite(planet.OrbitSemiMinor, "orbitSemiMinor", label);
            RequireFinite(planet.OrbitEccentricity, "orbitEccentricity", label);
            RequireFinite(planet.OrbitRotation, "orbitRotation", label);
            RequireFinite(planet.OrbitPhase, "orbitPhase", label);
            RequireFinite(planet.OrbitSpeed, "orbitSpeed", label);
            RequireFinite(planet.SpinSpeed, "spinSpeed", label);
            if (planet.LandingRadius is not null)
            {
                RequireFinite(planet.LandingRadius.Value, "landingRadius", label);
            }

            planet.Active = true;
            planet.OrbitCenter = new Vec2(0, 0);
            planet.Position = planet.BasePosition;
        }

        private static void ValidateAsteroid(AsteroidRuntime asteroid, string levelLabel, int expectedIndex)
        {
            var label = $"{levelLabel} asteroid {expectedIndex}";
            if (asteroid.Index != expectedIndex)
            {
                throw new InvalidDataException($"asteroid.index: {label} expected {expectedIndex}, got {asteroid.Index}");
            }

            RequireFinite(asteroid.Position.X, "asteroid.position.x", label);
            RequireFinite(asteroid.Position.Y, "asteroid.position.y", label);
            RequireFinite(asteroid.OrbitRadius, "asteroid.orbitRadius", label);
            RequireFinite(asteroid.BaseAngleDeg, "asteroid.baseAngleDeg", label);
            RequireFinite(asteroid.OrbitAngularSpeed, "asteroid.orbitAngularSpeed", label);
            RequireFinite(asteroid.Radius, "asteroid.radius", label);
            RequireFinite(asteroid.SpinSpeed, "asteroid.spinSpeed", label);
        }

        private static bool IsPresentMechanic(JToken token) => token.Type switch
        {
            JTokenType.Null or JTokenType.Undefined => false,
            JTokenType.Array => token.HasValues,
            JTokenType.Object => token.HasValues,
            JTokenType.Boolean => token.Value<bool>(),
            _ => true,
        };

        private static void RequireFinite(double value, string field, string label)
        {
            if (!double.IsFinite(value))
            {
                throw new InvalidDataException($"{field}: non-finite or missing on {label}");
            }
        }

        private static JArray RequiredArray(JObject source, string field, string label, bool allowEmpty)
        {
            if (!source.TryGetValue(field, out var token) || token is not JArray array)
            {
                throw new InvalidDataException($"{field}: missing or not an array on {label}");
            }

            if (!allowEmpty && array.Count == 0)
            {
                throw new InvalidDataException($"{field}: missing or empty on {label}");
            }

            return array;
        }

        private static string RequiredString(JObject source, string field, string label)
        {
            if (!source.TryGetValue(field, out var token) || token.Type != JTokenType.String)
            {
                throw new InvalidDataException($"{field}: missing or not a string on {label}");
            }

            var value = token.Value<string>() ?? "";
            if (value.Length == 0)
            {
                throw new InvalidDataException($"{field}: missing or empty on {label}");
            }

            return value;
        }

        private static void RequiredNumber(JObject source, string field, string label)
        {
            if (!source.TryGetValue(field, out var token) || !IsNumber(token) || !double.IsFinite(token.Value<double>()))
            {
                throw new InvalidDataException($"{field}: missing or not a finite number on {label}");
            }
        }

        private static void OptionalNumberOrNull(JObject source, string field, string label)
        {
            if (!source.TryGetValue(field, out var token) || token.Type == JTokenType.Null)
            {
                return;
            }

            if (!IsNumber(token) || !double.IsFinite(token.Value<double>()))
            {
                throw new InvalidDataException($"{field}: not a finite number on {label}");
            }
        }

        private static void RequiredInteger(JObject source, string field, string label)
        {
            if (!source.TryGetValue(field, out var token) || token.Type != JTokenType.Integer)
            {
                throw new InvalidDataException($"{field}: missing or not an integer on {label}");
            }
        }

        private static void RequiredNullOrInteger(JObject source, string field, string label)
        {
            if (!source.TryGetValue(field, out var token) || (token.Type != JTokenType.Null && token.Type != JTokenType.Integer))
            {
                throw new InvalidDataException($"{field}: missing or not null/integer on {label}");
            }
        }

        private static void RequiredBoolean(JObject source, string field, string label)
        {
            if (!source.TryGetValue(field, out var token) || token.Type != JTokenType.Boolean)
            {
                throw new InvalidDataException($"{field}: missing or not a boolean on {label}");
            }
        }

        private static void RequiredVec(JObject source, string field, string label)
        {
            if (!source.TryGetValue(field, out var token) || token is not JObject vec)
            {
                throw new InvalidDataException($"{field}: missing or not a Vec2 on {label}");
            }

            RequiredNumber(vec, "x", $"{label} {field}");
            RequiredNumber(vec, "y", $"{label} {field}");
        }

        private static bool IsNumber(JToken token) => token.Type is JTokenType.Integer or JTokenType.Float;
    }
}
