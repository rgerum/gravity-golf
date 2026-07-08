using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Zero-scene-wiring entry point. Runs before any scene loads and constructs the
    /// entire game object graph programmatically, so ANY empty scene (including the
    /// provided Main.unity) plays with no GUID-bearing scene references.
    /// </summary>
    public static class GameBootstrap
    {
        private static bool _booted;

        // Statics survive play-mode restarts when Enter Play Mode Options disable
        // domain reload; without this reset the second Play would boot nothing.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void ResetStatics()
        {
            _booted = false;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void Boot()
        {
            if (_booted)
            {
                return;
            }

            _booted = true;

            var root = new GameObject("GravityGolf");
            Object.DontDestroyOnLoad(root);
            root.AddComponent<GameController>();

            if (System.Array.IndexOf(System.Environment.GetCommandLineArgs(), "-gg-tour") >= 0)
            {
                root.AddComponent<ScreenshotTour>();
            }
        }
    }
}
