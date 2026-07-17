using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Converts the core's 0xRRGGBB decimal ints into Unity Colors.</summary>
    public static class ColorUtil
    {
        public static Color FromInt(long value, float alpha = 1f)
        {
            var r = ((value >> 16) & 0xFF) / 255f;
            var g = ((value >> 8) & 0xFF) / 255f;
            var b = (value & 0xFF) / 255f;
            return new Color(r, g, b, alpha);
        }
    }

    /// <summary>
    /// Fixed render-plane depths. The camera sits at z = -10 looking down +Z, so a
    /// SMALLER z is closer to the camera and therefore drawn on top. Gameplay math is
    /// 2D (x, y); z is purely a layering channel.
    /// </summary>
    public static class Depth
    {
        public const float Starfield = 9f;
        public const float OrbitPath = 6f;
        public const float Corona = 5f;
        public const float GoalGlow = 4.6f;
        public const float Goal = 4.4f;
        public const float GoalBurst = 4.2f;
        public const float Sun = 4f;
        public const float LandingRing = 3.6f;
        public const float Planet = 3f;
        public const float PlanetAccent = 2.9f;
        public const float Asteroid = 2.7f;
        public const float AsteroidRim = 2.72f;
        public const float Ball = 1f;
        public const float BallTrail = 1.05f;
        public const float AimBand = 0.6f;
        public const float Handle = 0.55f;
        public const float Preview = 0.5f;

        public static Vector3 ToWorld(Vec2 v, float z) => new Vector3((float)v.X, (float)v.Y, z);
    }
}
