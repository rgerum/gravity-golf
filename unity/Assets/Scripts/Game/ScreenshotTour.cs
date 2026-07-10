using System;
using System.Collections;
using System.Collections.Generic;
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
        // Quick mode: stills only, shorter settle/write — for fast visual iteration.
        private const float QuickSettleSeconds = 0.35f;
        private const float QuickWriteSeconds = 0.3f;

        private GameController _controller;
        private string _outDir;
        private bool _quick;
        private int[] _levels;

        private void Start()
        {
            _controller = GetComponent<GameController>();
            _outDir = ReadArg("-gg-tour-out") ?? Path.Combine(Application.dataPath, "..", "Screenshots");
            // -gg-quick: only settled level stills (no flight/rewind), trimmed waits.
            _quick = Array.IndexOf(Environment.GetCommandLineArgs(), "-gg-quick") >= 0;
            // -gg-levels 0,4,8: capture just these level indices (default: all).
            _levels = ParseLevels(ReadArg("-gg-levels"));
            Directory.CreateDirectory(_outDir);
            StartCoroutine(RunTour());
        }

        private static int[] ParseLevels(string raw)
        {
            if (string.IsNullOrEmpty(raw))
            {
                return null;
            }

            var parts = raw.Split(',');
            var result = new List<int>();
            foreach (var part in parts)
            {
                if (int.TryParse(part.Trim(), out var value))
                {
                    result.Add(value);
                }
            }

            return result.Count > 0 ? result.ToArray() : null;
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

            // Let the first frames present before capturing (an immediate capture under
            // Xvfb grabs an uninitialized buffer), then shoot the boot title and move on.
            yield return new WaitForSeconds(0.5f);
            yield return Capture("title.png");
            _controller.DismissTitle();

            _controller.SetSettingsVisible(true);
            yield return Capture("settings.png");
            _controller.SetSettingsVisible(false);

            var levelCount = _controller.World.Levels.Count;
            var settle = _quick ? QuickSettleSeconds : SettleSeconds;
            for (var i = 0; i < levelCount; i++)
            {
                if (_levels != null && Array.IndexOf(_levels, i) < 0)
                {
                    continue;
                }

                _controller.LoadLevel(i);
                yield return new WaitForSeconds(settle);
                yield return Capture($"level-{i:00}.png");

                // Quick mode stops at the settled still — no flight/rewind captures.
                if (_quick)
                {
                    continue;
                }

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
                    else if (_controller.CanRewind)
                    {
                        // Exercise Undo on non-scoring levels: trigger the animated rewind,
                        // grab a mid-flight-backward frame, then the settled-back frame so
                        // both the reverse motion and the restored anchor are verifiable.
                        _controller.RequestRewind();
                        yield return null;
                        yield return Capture($"rewind-{i:00}.png");

                        var rewindWait = 0f;
                        while (_controller.State == GameState.Rewinding && rewindWait < 4f)
                        {
                            rewindWait += Time.deltaTime;
                            yield return null;
                        }

                        yield return Capture($"undone-{i:00}.png");
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
            yield return new WaitForSeconds(_quick ? QuickWriteSeconds : WriteSeconds);
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
