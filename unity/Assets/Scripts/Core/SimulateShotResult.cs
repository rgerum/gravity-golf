using System.Collections.Generic;

namespace GravityGolf.Core
{

    public sealed class SimulateShotResult
    {
        public string Outcome { get; set; } = "";
        public string Reason { get; set; } = "";
        public int? PlanetIndex { get; set; }
        public string PlanetName { get; set; } = "";
        public double WaitTime { get; set; }
        public int LandingCount { get; set; }
        public double Time { get; set; }
        public int Steps { get; set; }
        public double FinalTime { get; set; }
        public int? AnchorPlanetIndex { get; set; }
        public Vec2? AnchorNormal { get; set; }
        public double Heat { get; set; }
        public double MinGoalDistance { get; set; }
        public double MinPlanetClearance { get; set; }
        public Vec2 FinalPosition { get; set; }
        public BallState? LaunchState { get; set; }
        public List<FrameSample>? Frames { get; set; }
    }
}
