namespace GravityGolf.Core
{

    public static class Constants
    {
        public const double CourseWidth = 24;
        public const double CourseHeight = 14;
        public const double BallRadius = 0.28;
        public const double GoalRadius = 0.56;
        public const double GoalPullRadius = 4.6;
        public const double GoalPullStrength = 6.2;
        public const double OutBoundsX = 13.8;
        public const double OutBoundsY = 10;

        public const double MaxDragDistance = 2.75;
        public const double PlanetGravityMultiplier = 2.35;
        public const double BallStopSpeed = 0.055;
        public const double BallSettleAcceleration = 0.04;
        public const double BallFrictionBase = 0.992;
        public const double GoalCaptureRatio = 0.95;
        public const double PlanetCollisionPadding = 0.92;
        public const double PlanetLandingPadding = 0.03;
        public const double SunCollisionRadius = 0.42;
        public const double SolarGravityMultiplier = 5;
        public const double SolarGravitySoftening = 3.4;
        public const double DefaultStartAngleDeg = 180;
        public const double DefaultGoalOpenSeconds = 12;
        public const bool GoalAlwaysOpen = true;
        public const double FixedSolarGravityStrength = 20;
        public const double LaunchBaseSpeed = 1.9;
        public const double LaunchDragSpeed = 3.4;
        public const double LaunchMaxSpeed = 11.8;

        public const double BallHeatMax = 1;
        public const double BallHeatCoolRateFlight = 0.72;
        public const double BallHeatCoolRateAnchored = 0.38;
    }
}
