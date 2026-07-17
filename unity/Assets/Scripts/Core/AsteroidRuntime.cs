using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GravityGolf.Core
{

    public sealed class AsteroidRuntime
    {
        [JsonExtensionData]
        public IDictionary<string, JToken>? ExtensionData { get; set; }

        [JsonProperty("index")]
        public int Index { get; set; }

        [JsonProperty("position")]
        public Vec2 Position { get; set; }

        [JsonProperty("orbitRadius")]
        public double OrbitRadius { get; set; }

        [JsonProperty("baseAngleDeg")]
        public double BaseAngleDeg { get; set; }

        [JsonProperty("orbitAngularSpeed")]
        public double OrbitAngularSpeed { get; set; }

        [JsonProperty("radius")]
        public double Radius { get; set; }

        [JsonProperty("spinSpeed")]
        public double SpinSpeed { get; set; }

        [JsonProperty("color")]
        public int? Color { get; set; }

        public AsteroidRuntime Clone() => new()
        {
            ExtensionData = ExtensionData?.ToDictionary(pair => pair.Key, pair => pair.Value.DeepClone()),
            Index = Index,
            Position = Position,
            OrbitRadius = OrbitRadius,
            BaseAngleDeg = BaseAngleDeg,
            OrbitAngularSpeed = OrbitAngularSpeed,
            Radius = Radius,
            SpinSpeed = SpinSpeed,
            Color = Color,
        };
    }
}
