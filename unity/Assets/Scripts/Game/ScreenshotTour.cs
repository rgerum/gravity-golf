using System;
using System.Collections;
using System.IO;
using GravityGolf.Core;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Headless screenshot tour: when the player/editor is launched with -gg-tour,
    /// GameBootstrap attaches this component. It steps through every level, lets the
    /// simulation run so orbits/spin are visible, captures a still per level plus a
    /// mid-flight shot of each level's first launch preset, then exits. Output dir
    /// comes from "-gg-tour-out <path>" (default: Screenshots/ under the project).
    /// Driven by scripts/screenshot-tour.sh.
    /// </summary>
    public sealed class ScreenshotTour : MonoBehaviour
    {
        private const float SettleSeconds = 1.0f;
        private const float FlightSeconds = 0.8f;
        private const float WriteSeconds = 0.6f;

        private GameController _controller;
        private string _outDir;

        private void Start()
        {
            _controller = GetComponent<GameController>();
            _outDir = ReadArg("-gg-tour-out") ?? Path.Combine(Application.dataPath, "..", "Screenshots");
            Directory.CreateDirectory(_outDir);
            StartCoroutine(RunTour());
        }

        private static string ReadArg(string name)
        {
            var args = Environment.GetCommandLineArgs();
            for (var i = 0; i < args.Length - 1; i++)
            {
                if (args[i] == name)
                {
                    return args[i + 1];
                }
            }

            return null;
        }

        private IEnumerator RunTour()
        {
            while (_controller == null || !_controller.Ready)
            {
                yield return null;
            }

            var levelCount = _controller.World.Levels.Count;
            for (var i = 0; i < levelCount; i++)
            {
                _controller.LoadLevel(i);
                yield return new WaitForSeconds(SettleSeconds);
                yield return Capture($"level-{i:00}.png");

                var level = _controller.CurrentLevel;
                if (_controller.CanAim && level.LaunchPresets.Count > 0)
                {
                    var preset = level.LaunchPresets[0];
                    var direction = VecMath.DirectionFromAngleDeg(preset.AngleDeg);
                    _controller.Launch(direction, preset.Power);
                    yield return new WaitForSeconds(FlightSeconds);
                    yield return Capture($"flight-{i:00}.png");

                    // If this preset scores, hold for the goal-capture burst and grab a
                    // frame mid-transition so capture VFX are verifiable headlessly.
                    var waited = 0f;
                    while (_controller.State == GameState.Flying && waited < 4f)
                    {
                        waited += Time.deltaTime;
                        yield return null;
                    }

                    if (_controller.State == GameState.Goal)
                    {
                        yield return null;
                        yield return Capture($"capture-{i:00}.png");
                    }
                }
            }

            Debug.Log($"[ScreenshotTour] Done. {levelCount} levels captured to {_outDir}");
            Quit();
        }

        private IEnumerator Capture(string fileName)
        {
            var path = Path.Combine(_outDir, fileName);
            ScreenCapture.CaptureScreenshot(path);
            // CaptureScreenshot writes asynchronously at end of frame.
            yield return new WaitForSeconds(WriteSeconds);
        }

        private static void Quit()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.Exit(0);
#else
            Application.Quit();
#endif
        }
    }
}
