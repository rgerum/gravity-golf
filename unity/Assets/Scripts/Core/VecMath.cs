using System;

namespace GravityGolf.Core
{

    public static class VecMath
    {
        public static Vec2 Vec(double x = 0, double y = 0) => new(x, y);

        public static Vec2 Clone(Vec2 point) => new(point.X, point.Y);

        public static void Set(ref Vec2 target, Vec2 source)
        {
            target.X = source.X;
            target.Y = source.Y;
        }

        public static double Clamp(double value, double min, double max) => Math.Max(min, Math.Min(max, value));

        public static void AddScaled(ref Vec2 target, Vec2 direction, double scale)
        {
            target.X += direction.X * scale;
            target.Y += direction.Y * scale;
        }

        public static double Distance(Vec2 a, Vec2 b) => Hypot(a.X - b.X, a.Y - b.Y);

        public static double LengthSq(Vec2 vector) => vector.X * vector.X + vector.Y * vector.Y;

        public static double Length(Vec2 vector) => Hypot(vector.X, vector.Y);

        public static Vec2 Normalize(Vec2 vector)
        {
            var magnitude = Length(vector);
            return magnitude < 0.000001 ? new Vec2(0, 0) : new Vec2(vector.X / magnitude, vector.Y / magnitude);
        }

        public static Vec2 DirectionFromAngleDeg(double angleDeg)
        {
            var angleRad = angleDeg * Math.PI / 180;
            return new Vec2(Math.Cos(angleRad), Math.Sin(angleRad));
        }

        public static Vec2 Rotate(Vec2 vector, double angle)
        {
            var cosAngle = Math.Cos(angle);
            var sinAngle = Math.Sin(angle);
            return new Vec2(
                vector.X * cosAngle - vector.Y * sinAngle,
                vector.X * sinAngle + vector.Y * cosAngle);
        }

        public static double Hypot(double x, double y)
        {
            x = Math.Abs(x);
            y = Math.Abs(y);
            if (double.IsInfinity(x) || double.IsInfinity(y))
            {
                return double.PositiveInfinity;
            }

            if (x < y)
            {
                (x, y) = (y, x);
            }

            if (x == 0)
            {
                return 0;
            }

            var ratio = y / x;
            return x * Math.Sqrt(1 + ratio * ratio);
        }
    }
}
