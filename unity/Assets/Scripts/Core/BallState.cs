namespace GravityGolf.Core
{

    public sealed class BallState
    {
        public Vec2 Position { get; set; }
        public Vec2 Velocity { get; set; }
        public double Time { get; set; }
        public int LandingCount { get; set; }
        public int? LaunchGracePlanetIndex { get; set; }
        public int? AnchorPlanetIndex { get; set; }
        public Vec2? AnchorNormal { get; set; }
        public double AnchorSinceTime { get; set; }
        public double PortalCooldown { get; set; }
        public double Heat { get; set; }

        public BallState Clone() => new()
        {
            Position = Position,
            Velocity = Velocity,
            Time = Time,
            LandingCount = LandingCount,
            LaunchGracePlanetIndex = LaunchGracePlanetIndex,
            AnchorPlanetIndex = AnchorPlanetIndex,
            AnchorNormal = AnchorNormal,
            AnchorSinceTime = AnchorSinceTime,
            PortalCooldown = PortalCooldown,
            Heat = Heat,
        };
    }
}
