using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Builds flat disc/ring primitive meshes and materials in code so the game needs
    /// no imported assets. Everything uses the always-present "Sprites/Default" shader
    /// (BiRP/URP-safe, alpha-blended, cull off) tinted with a 1x1 white texture, so a
    /// single code path covers both opaque bodies and translucent rings.
    /// </summary>
    public static class MeshFactory
    {
        private static Texture2D _white;
        private static Mesh _unitDisc;

        public static Texture2D White
        {
            get
            {
                if (_white == null)
                {
                    _white = new Texture2D(1, 1, TextureFormat.RGBA32, false);
                    _white.SetPixel(0, 0, Color.white);
                    _white.Apply();
                    _white.hideFlags = HideFlags.HideAndDontSave;
                }

                return _white;
            }
        }

        /// <summary>Unit-radius disc, reused by every solid body (scale the transform).</summary>
        public static Mesh UnitDisc
        {
            get
            {
                if (_unitDisc == null)
                {
                    _unitDisc = Disc(64);
                    _unitDisc.hideFlags = HideFlags.HideAndDontSave;
                }

                return _unitDisc;
            }
        }

        public static Material NewMaterial(Color color)
        {
            var shader = Shader.Find("Sprites/Default");
            var material = new Material(shader) { hideFlags = HideFlags.HideAndDontSave };
            material.SetTexture("_MainTex", White);
            material.color = color;
            return material;
        }

        public static Mesh Disc(int segments)
        {
            segments = Mathf.Max(3, segments);
            var vertices = new Vector3[segments + 1];
            var uvs = new Vector2[segments + 1];
            vertices[0] = Vector3.zero;
            uvs[0] = new Vector2(0.5f, 0.5f);
            for (var i = 0; i < segments; i += 1)
            {
                var angle = (float)i / segments * Mathf.PI * 2f;
                vertices[i + 1] = new Vector3(Mathf.Cos(angle), Mathf.Sin(angle), 0f);
                uvs[i + 1] = new Vector2(0.5f, 0.5f);
            }

            var triangles = new int[segments * 3];
            for (var i = 0; i < segments; i += 1)
            {
                triangles[i * 3] = 0;
                triangles[i * 3 + 1] = i + 1;
                triangles[i * 3 + 2] = (i + 1) % segments + 1;
            }

            var mesh = new Mesh { name = "Disc" };
            mesh.vertices = vertices;
            mesh.uv = uvs;
            mesh.triangles = triangles;
            mesh.RecalculateBounds();
            return mesh;
        }

        /// <summary>
        /// Disc whose center vertex carries <paramref name="innerAlpha"/> and every rim
        /// vertex <paramref name="outerAlpha"/>, giving a smooth radial alpha falloff.
        /// Sprites/Default multiplies vertex color * material color * texture, so pair
        /// this with a solid-alpha material color to get a tinted radial glow.
        /// </summary>
        public static Mesh GradientDisc(int segments, float innerAlpha, float outerAlpha)
        {
            segments = Mathf.Max(3, segments);
            var vertices = new Vector3[segments + 1];
            var uvs = new Vector2[segments + 1];
            var colors = new Color[segments + 1];
            vertices[0] = Vector3.zero;
            uvs[0] = new Vector2(0.5f, 0.5f);
            colors[0] = new Color(1f, 1f, 1f, innerAlpha);
            for (var i = 0; i < segments; i += 1)
            {
                var angle = (float)i / segments * Mathf.PI * 2f;
                vertices[i + 1] = new Vector3(Mathf.Cos(angle), Mathf.Sin(angle), 0f);
                uvs[i + 1] = new Vector2(0.5f, 0.5f);
                colors[i + 1] = new Color(1f, 1f, 1f, outerAlpha);
            }

            var triangles = new int[segments * 3];
            for (var i = 0; i < segments; i += 1)
            {
                triangles[i * 3] = 0;
                triangles[i * 3 + 1] = i + 1;
                triangles[i * 3 + 2] = (i + 1) % segments + 1;
            }

            var mesh = new Mesh { name = "GradientDisc" };
            mesh.vertices = vertices;
            mesh.uv = uvs;
            mesh.colors = colors;
            mesh.triangles = triangles;
            mesh.RecalculateBounds();
            return mesh;
        }

        public static Mesh Ring(float inner, float outer, int segments)
        {
            segments = Mathf.Max(3, segments);
            var vertices = new Vector3[segments * 2];
            var uvs = new Vector2[segments * 2];
            for (var i = 0; i < segments; i += 1)
            {
                var angle = (float)i / segments * Mathf.PI * 2f;
                var cos = Mathf.Cos(angle);
                var sin = Mathf.Sin(angle);
                vertices[i * 2] = new Vector3(cos * inner, sin * inner, 0f);
                vertices[i * 2 + 1] = new Vector3(cos * outer, sin * outer, 0f);
                uvs[i * 2] = new Vector2(0.5f, 0.5f);
                uvs[i * 2 + 1] = new Vector2(0.5f, 0.5f);
            }

            var triangles = new int[segments * 6];
            for (var i = 0; i < segments; i += 1)
            {
                var next = (i + 1) % segments;
                var a = i * 2;
                var b = i * 2 + 1;
                var c = next * 2;
                var d = next * 2 + 1;
                triangles[i * 6] = a;
                triangles[i * 6 + 1] = b;
                triangles[i * 6 + 2] = d;
                triangles[i * 6 + 3] = a;
                triangles[i * 6 + 4] = d;
                triangles[i * 6 + 5] = c;
            }

            var mesh = new Mesh { name = "Ring" };
            mesh.vertices = vertices;
            mesh.uv = uvs;
            mesh.triangles = triangles;
            mesh.RecalculateBounds();
            return mesh;
        }

        /// <summary>Creates a child mesh renderer at a fixed z depth, returning the GameObject.</summary>
        public static GameObject Spawn(string name, Mesh mesh, Color color, Transform parent, float z)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = new Vector3(0f, 0f, z);
            var filter = go.AddComponent<MeshFilter>();
            filter.sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>();
            renderer.sharedMaterial = NewMaterial(color);
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            renderer.receiveShadows = false;
            renderer.lightProbeUsage = UnityEngine.Rendering.LightProbeUsage.Off;
            renderer.reflectionProbeUsage = UnityEngine.Rendering.ReflectionProbeUsage.Off;
            return go;
        }
    }
}
