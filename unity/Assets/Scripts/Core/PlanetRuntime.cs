using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GravityGolf.Core
{

    public sealed class PlanetRuntime
    {
        [JsonExtensionData]
        public IDictionary<string, JToken>? ExtensionData { get; set; }

        [JsonProperty("index")]
        public int Index { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = "";

        [JsonProperty("position")]
        public Vec2 Position { get; set; }

        [JsonProperty("basePosition")]
        public Vec2 BasePosition { get; set; }

        [JsonProperty("radius")]
        public double Radius { get; set; }

        [JsonProperty("gravity")]
        public double Gravity { get; set; }

        [JsonProperty("falloff")]
        public double Falloff { get; set; }

        [JsonProperty("landable")]
        public bool Landable { get; set; }

        [JsonProperty("landingRadius")]
        public double? LandingRadius { get; set; }

        [JsonProperty("orbitCenter")]
        public Vec2 OrbitCenter { get; set; }

        [JsonProperty("orbitCenterIndex")]
        public int? OrbitCenterIndex { get; set; }

        [JsonProperty("orbitSemiMajor")]
        public double OrbitSemiMajor { get; set; }

        [JsonProperty("orbitSemiMinor")]
        public double OrbitSemiMinor { get; set; }

        [JsonProperty("orbitEccentricity")]
        public double OrbitEccentricity { get; set; }

        [JsonProperty("orbitRotation")]
        public double OrbitRotation { get; set; }

        [JsonProperty("orbitSpeed")]
        public double OrbitSpeed { get; set; }

        [JsonProperty("orbitPhase")]
        public double OrbitPhase { get; set; }

        [JsonProperty("spinSpeed")]
        public double SpinSpeed { get; set; }

        [JsonProperty("active")]
        public bool Active { get; set; } = true;

        public PlanetRuntime Clone() => new()
        {
            ExtensionData = ExtensionData?.ToDictionary(pair => pair.Key, pair => pair.Value.DeepClone()),
            Index = Index,
            Name = Name,
            Position = Position,
            BasePosition = BasePosition,
            Radius = Radius,
            Gravity = Gravity,
            Falloff = Falloff,
            Landable = Landable,
            LandingRadius = LandingRadius,
            OrbitCenter = OrbitCenter,
            OrbitCenterIndex = OrbitCenterIndex,
            OrbitSemiMajor = OrbitSemiMajor,
            OrbitSemiMinor = OrbitSemiMinor,
            OrbitEccentricity = OrbitEccentricity,
            OrbitRotation = OrbitRotation,
            OrbitSpeed = OrbitSpeed,
            OrbitPhase = OrbitPhase,
            SpinSpeed = SpinSpeed,
            Active = Active,
        };
    }
}
