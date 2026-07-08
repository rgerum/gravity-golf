using Newtonsoft.Json;

namespace GravityGolf.Core
{

    public struct Vec2
    {
        [JsonProperty("x")]
        public double X { get; set; }

        [JsonProperty("y")]
        public double Y { get; set; }

        public Vec2(double x, double y)
        {
            X = x;
            Y = y;
        }
    }
}
