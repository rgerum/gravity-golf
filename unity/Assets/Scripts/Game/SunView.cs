using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Static glowing sun at level.Sun: a bright core disc plus a soft corona.</summary>
    public sealed class SunView : MonoBehaviour
    {
        public void Init(LevelRuntime level)
        {
            var radius = (float)level.SunCollisionRadius;
            transform.position = Depth.ToWorld(level.Sun, 0f);

            var corona = MeshFactory.Spawn("Corona", MeshFactory.UnitDisc, ColorUtil.FromInt(0xFFB347, 0.18f), transform, Depth.Corona);
            corona.transform.localScale = new Vector3(radius * 3.2f, radius * 3.2f, 1f);

            var haze = MeshFactory.Spawn("Haze", MeshFactory.UnitDisc, ColorUtil.FromInt(0xFFC864, 0.30f), transform, Depth.Corona - 0.1f);
            haze.transform.localScale = new Vector3(radius * 1.9f, radius * 1.9f, 1f);

            var core = MeshFactory.Spawn("Core", MeshFactory.UnitDisc, ColorUtil.FromInt(0xFFDD8F), transform, Depth.Sun);
            core.transform.localScale = new Vector3(radius, radius, 1f);
        }
    }
}
