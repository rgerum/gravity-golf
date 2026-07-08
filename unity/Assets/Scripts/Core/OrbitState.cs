namespace GravityGolf.Core
{

    public readonly struct OrbitState
    {
        public OrbitState(Vec2 position, Vec2 velocity, Vec2 orbitCenter)
        {
            Position = position;
            Velocity = velocity;
            OrbitCenter = orbitCenter;
        }

        public Vec2 Position { get; }
        public Vec2 Velocity { get; }
        public Vec2 OrbitCenter { get; }
    }
}
