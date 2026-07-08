namespace GravityGolf.Core
{

    public sealed class SimulateShotOptions
    {
        public double Delta { get; set; } = 1.0 / 60.0;
        public double MaxTime { get; set; } = 20;
        public double StartTime { get; set; }
        public bool CaptureFrames { get; set; }
        public int? AnchorPlanetIndex { get; set; }
        public Vec2? AnchorNormal { get; set; }
        public Vec2? StartPosition { get; set; }
        public int LandingCount { get; set; }
        public double Heat { get; set; }
    }
}
