using Newtonsoft.Json;

namespace GravityGolf.Core
{

    public sealed class LaunchPreset
    {
        [JsonProperty("angleDeg")]
        public double AngleDeg { get; set; }

        [JsonProperty("power")]
        public double Power { get; set; }
    }
}
