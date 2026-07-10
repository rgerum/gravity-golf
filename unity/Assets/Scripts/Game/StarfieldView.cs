using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// A single static, vertex-colored mesh forming a subtle deterministic starfield far
    /// behind the play field (one draw call, no animation). Each star is a small disc fan
    /// whose rim alpha fades to zero, so stars read as soft round points rather than hard
    /// squares. Placement uses a fixed-seed <see cref="System.Random"/> so the field is
    /// stable, and it is sized to comfortably overspread the fitted camera view. Purely
    /// atmospheric — the play field must stay the clear figure against the dark ground
    /// (spec §11).
    /// </summary>
    public sealed class StarfieldView : MonoBehaviour
    {
        private const int StarCount = 300;
        private const int Seed = 20260708;
        private const int RimSegments = 8;

        /// <summary>Builds the field centered on <paramref name="center"/>, spanning the
        /// given world-space rect (already padded larger than the visible view).</summary>
        public void Init(Vector2 center, float width, float height)
        {
            transform.position = new Vector3(center.x, center.y, 0f);
            var mesh = BuildMesh(width, height);
            MeshFactory.Spawn("Stars", mesh, Color.white, transform, Depth.Starfield);
        }

        private static Mesh BuildMesh(float width, float height)
        {
            var rng = new System.Random(Seed);
            var halfW = width * 0.5f;
            var halfH = height * 0.5f;

            var vertsPerStar = RimSegments + 1;
            var vertices = new Vector3[StarCount * vertsPerStar];
            var colors = new Color[StarCount * vertsPerStar];
            var uvs = new Vector2[StarCount * vertsPerStar];
            var triangles = new int[StarCount * RimSegments * 3];

            for (var i = 0; i < StarCount; i += 1)
            {
                var x = (float)(rng.NextDouble() * 2.0 - 1.0) * halfW;
                var y = (float)(rng.NextDouble() * 2.0 - 1.0) * halfH;

                // Three tiny size tiers (world units); most stars are the smallest.
                var sizeRoll = rng.NextDouble();
                var radius = sizeRoll < 0.6 ? 0.07f : sizeRoll < 0.9 ? 0.105f : 0.14f;

                // Mostly dim, with a few brighter accents. The radial fade halves the
                // perceived brightness, so center alpha runs hotter than the old quads.
                var brightRoll = rng.NextDouble();
                var alpha = brightRoll < 0.85
                    ? 0.24f + (float)rng.NextDouble() * 0.30f
                    : 0.62f + (float)rng.NextDouble() * 0.25f;

                // Blue-white dominant, some plain white, the occasional faint warm star.
                var tintRoll = rng.NextDouble();
                var tint = tintRoll < 0.7
                    ? new Color(0.80f, 0.86f, 1.00f, alpha)
                    : tintRoll < 0.92
                        ? new Color(1.00f, 1.00f, 1.00f, alpha)
                        : new Color(1.00f, 0.92f, 0.82f, alpha);
                var rimTint = new Color(tint.r, tint.g, tint.b, 0f);

                // Disc fan: opaque center vertex, transparent rim ring -> soft round dot.
                var v = i * vertsPerStar;
                vertices[v] = new Vector3(x, y, 0f);
                colors[v] = tint;
                uvs[v] = new Vector2(0.5f, 0.5f);
                for (var s = 0; s < RimSegments; s += 1)
                {
                    var angle = s * (Mathf.PI * 2f / RimSegments);
                    vertices[v + 1 + s] = new Vector3(x + Mathf.Cos(angle) * radius, y + Mathf.Sin(angle) * radius, 0f);
                    colors[v + 1 + s] = rimTint;
                    uvs[v + 1 + s] = new Vector2(0.5f, 0.5f);
                }

                var t = i * RimSegments * 3;
                for (var s = 0; s < RimSegments; s += 1)
                {
                    triangles[t + s * 3 + 0] = v;
                    triangles[t + s * 3 + 1] = v + 1 + s;
                    triangles[t + s * 3 + 2] = v + 1 + (s + 1) % RimSegments;
                }
            }

            var mesh = new Mesh { name = "Starfield" };
            mesh.vertices = vertices;
            mesh.uv = uvs;
            mesh.colors = colors;
            mesh.triangles = triangles;
            mesh.RecalculateBounds();
            return mesh;
        }
    }
}
