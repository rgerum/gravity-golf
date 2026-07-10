using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GravityGolf.Core
{

    public sealed class LevelRuntime
    {
        [JsonExtensionData]
        public IDictionary<string, JToken>? ExtensionData { get; set; }

        [JsonProperty("index")]
        public int Index { get; set; }

        [JsonProperty("id")]
        public string Id { get; set; } = "";

        [JsonProperty("name")]
        public string Name { get; set; } = "";

        [JsonProperty("worldLevelNumber")]
        public int WorldLevelNumber { get; set; }

        [JsonProperty("sun")]
        public Vec2 Sun { get; set; }

        public Vec2 SystemCenter { get; set; }

        [JsonProperty("sunGravityStrength")]
        public double SunGravityStrength { get; set; } = Constants.FixedSolarGravityStrength;

        [JsonProperty("sunCollisionRadius")]
        public double SunCollisionRadius { get; set; } = Constants.SunCollisionRadius;

        [JsonProperty("startPlanetIndex")]
        public int StartPlanetIndex { get; set; }

        [JsonProperty("startAngleDeg")]
        public double StartAngleDeg { get; set; } = Constants.DefaultStartAngleDeg;

        [JsonProperty("startAnchor")]
        public Vec2 StartAnchor { get; set; }

        [JsonProperty("startTimeSeconds")]
        public double StartTimeSeconds { get; set; }

        public double Time { get; set; }

        [JsonProperty("goalCenter")]
        public Vec2 GoalCenter { get; set; }

        [JsonProperty("goalRadius")]
        public double GoalRadius { get; set; } = Constants.GoalRadius;

        [JsonProperty("goalPullRadius")]
        public double GoalPullRadius { get; set; } = Constants.GoalPullRadius;

        [JsonProperty("goalPullStrength")]
        public double GoalPullStrength { get; set; } = Constants.GoalPullStrength;

        [JsonProperty("goalOpenSeconds")]
        public double GoalOpenSeconds { get; set; } = Constants.DefaultGoalOpenSeconds;

        [JsonProperty("goalUnlockRequired")]
        public bool GoalUnlockRequired { get; set; }

        public bool GoalUnlocked { get; set; } = true;

        // The out-of-bounds rectangle rotates with the exported layout (a portrait
        // export swaps the landscape 13.8x10 rectangle); defaults keep old data working.
        [JsonProperty("outBoundsX")]
        public double OutBoundsX { get; set; } = Constants.OutBoundsX;

        [JsonProperty("outBoundsY")]
        public double OutBoundsY { get; set; } = Constants.OutBoundsY;

        [JsonProperty("planets")]
        public List<PlanetRuntime> Planets { get; set; } = new List<PlanetRuntime>();

        [JsonProperty("launchPresets")]
        public List<LaunchPreset> LaunchPresets { get; set; } = new List<LaunchPreset>();

        public LevelRuntime Clone()
        {
            var clone = new LevelRuntime
            {
                Index = Index,
                Id = Id,
                Name = Name,
                WorldLevelNumber = WorldLevelNumber,
                Sun = Sun,
                SystemCenter = SystemCenter,
                SunGravityStrength = SunGravityStrength,
                SunCollisionRadius = SunCollisionRadius,
                StartPlanetIndex = StartPlanetIndex,
                StartAngleDeg = StartAngleDeg,
                StartAnchor = StartAnchor,
                StartTimeSeconds = StartTimeSeconds,
                Time = Time,
                GoalCenter = GoalCenter,
                GoalRadius = GoalRadius,
                GoalPullRadius = GoalPullRadius,
                GoalPullStrength = GoalPullStrength,
                GoalOpenSeconds = GoalOpenSeconds,
                GoalUnlockRequired = GoalUnlockRequired,
                GoalUnlocked = GoalUnlocked,
                OutBoundsX = OutBoundsX,
                OutBoundsY = OutBoundsY,
                LaunchPresets = LaunchPresets.Select(p => new LaunchPreset { AngleDeg = p.AngleDeg, Power = p.Power }).ToList(),
                Planets = Planets.Select(p => p.Clone()).ToList(),
            };
            return clone;
        }
    }
}
