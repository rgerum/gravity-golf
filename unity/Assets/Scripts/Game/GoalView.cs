using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>Static "black hole" goal: a dark disc with a purple glow ring. No
    /// countdown arc — the goal is always open in scope (spec §5.3, §10.4).</summary>
    public sealed class GoalView : MonoBehaviour
    {
        public void Init(LevelRuntime level)
        {
            var radius = (float)level.GoalRadius;
            transform.position = Depth.ToWorld(level.GoalCenter, 0f);

            var glow = MeshFactory.Spawn(
                "Glow",
                MeshFactory.Ring(radius + 0.14f, radius + 0.35f, 64),
                ColorUtil.FromInt(0x8A62FF, 0.54f),
                transform,
                Depth.GoalGlow);
            glow.transform.localScale = Vector3.one;

            var disc = MeshFactory.Spawn("Disc", MeshFactory.UnitDisc, ColorUtil.FromInt(0x060109), transform, Depth.Goal);
            disc.transform.localScale = new Vector3(radius, radius, 1f);
        }
    }
}
