using UnityEditor;
using UnityEngine;

namespace GravityGolf.EditorTools
{
    /// <summary>
    /// Entry point for the headless screenshot tour:
    ///   Unity -projectPath unity -executeMethod GravityGolf.EditorTools.TourLauncher.Run -gg-tour
    /// (no -batchmode — rendering is required; run under Xvfb, see scripts/screenshot-tour.sh).
    /// The -gg-tour flag makes GameBootstrap attach the runtime ScreenshotTour, which
    /// exits the editor when finished.
    /// </summary>
    public static class TourLauncher
    {
        public static void Run()
        {
            // Portrait is the shipping orientation, so it's the tour default.
            // Pass -gg-landscape to render the old landscape framing for comparison.
            var landscape = System.Array.IndexOf(System.Environment.GetCommandLineArgs(), "-gg-landscape") >= 0;
            try
            {
                if (landscape)
                {
                    PlayModeWindow.SetCustomRenderingResolution(1920, 1080, "TourLandscape");
                }
                else
                {
                    PlayModeWindow.SetCustomRenderingResolution(1080, 1920, "TourPortrait");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[TourLauncher] Could not set rendering resolution: {e.Message}");
            }

            EditorApplication.EnterPlaymode();
        }
    }
}
