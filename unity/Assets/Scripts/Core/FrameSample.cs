namespace GravityGolf.Core
{

    public sealed class FrameSample
    {
        public int Index { get; set; }
        public Vec2 Position { get; set; }
        public Vec2 Velocity { get; set; }
        public double Time { get; set; }
        public int? AnchorPlanetIndex { get; set; }
        public int LandingCount { get; set; }
    }
}
