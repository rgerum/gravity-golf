using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using GravityGolf.Core;
using UnityEngine;
using UnityEngine.Networking;

namespace GravityGolf.Game
{
    /// <summary>
    /// A loaded campaign: the ordered list of worlds plus a flat global-index view over
    /// every level across them (world 1 → indices 0-9, world 2 → 10-19, and so on). The
    /// game layer addresses levels by GLOBAL index; this maps that index to the owning
    /// world and the level within it. Each world carries exactly 10 levels, but the lookups
    /// accumulate counts so a missing optional world simply shortens the campaign.
    /// </summary>
    public sealed class Campaign
    {
        private readonly List<WorldDefinition> _worlds;

        public Campaign(List<WorldDefinition> worlds)
        {
            _worlds = worlds;
        }

        public IReadOnlyList<WorldDefinition> Worlds => _worlds;

        public int WorldCount => _worlds.Count;

        public int LevelCount
        {
            get
            {
                var total = 0;
                for (var i = 0; i < _worlds.Count; i += 1)
                {
                    total += _worlds[i].Levels.Count;
                }

                return total;
            }
        }

        /// <summary>The world that owns a given global level index (null if out of range).</summary>
        public WorldDefinition WorldOf(int globalIndex)
        {
            var offset = 0;
            for (var i = 0; i < _worlds.Count; i += 1)
            {
                var count = _worlds[i].Levels.Count;
                if (globalIndex < offset + count)
                {
                    return _worlds[i];
                }

                offset += count;
            }

            return null;
        }

        /// <summary>The level at a given global index (null if out of range).</summary>
        public LevelRuntime LevelAt(int globalIndex)
        {
            var offset = 0;
            for (var i = 0; i < _worlds.Count; i += 1)
            {
                var count = _worlds[i].Levels.Count;
                if (globalIndex < offset + count)
                {
                    return _worlds[i].Levels[globalIndex - offset];
                }

                offset += count;
            }

            return null;
        }

        /// <summary>The global index of the first level of the world at list position w.</summary>
        public int WorldStartIndex(int worldListPosition)
        {
            var offset = 0;
            for (var i = 0; i < worldListPosition && i < _worlds.Count; i += 1)
            {
                offset += _worlds[i].Levels.Count;
            }

            return offset;
        }
    }

    /// <summary>
    /// Loads the exported world JSON from StreamingAssets with the standard dual path:
    /// a direct File read on desktop/editor, and a UnityWebRequest (then a temp-file
    /// hand-off to LevelLoader) on Android where StreamingAssets lives inside the APK.
    /// World 1 is required; later worlds are optional and degrade gracefully (a missing
    /// or unreadable file just drops that world from the campaign with a warning).
    /// </summary>
    public static class LevelData
    {
        public const string RelativePath = "levels/world-1.json";

        // Ordered campaign world files, each addressed relative to StreamingAssets. The
        // first is required; the rest are optional (missing files log a warning and are
        // skipped so play still boots).
        private static readonly string[] WorldFiles = { "levels/world-1.json", "levels/world-2.json" };

        public static IEnumerator Load(Action<Campaign> onLoaded, Action<string> onError)
        {
            var worlds = new List<WorldDefinition>();

            for (var i = 0; i < WorldFiles.Length; i += 1)
            {
                var relativePath = WorldFiles[i];
                WorldDefinition world = null;
                string error = null;
                yield return LoadWorldFile(relativePath, w => world = w, e => error = e);

                if (world != null)
                {
                    worlds.Add(world);
                }
                else if (i == 0)
                {
                    // World 1 is the required floor; without it there is nothing to play.
                    onError?.Invoke(error ?? "Could not load world 1.");
                    yield break;
                }
                else
                {
                    Debug.LogWarning($"[GravityGolf] Skipping {relativePath}: {error}");
                }
            }

            onLoaded?.Invoke(new Campaign(worlds));
        }

        // Loads a single world file, using the URL-form download path on Android and a
        // direct File read elsewhere. Reports the parsed world via onLoaded, or a message
        // via onError (including a plain "not found" for absent optional worlds).
        private static IEnumerator LoadWorldFile(string relativePath, Action<WorldDefinition> onLoaded, Action<string> onError)
        {
            var fullPath = Path.Combine(Application.streamingAssetsPath, relativePath);
            var tempName = Path.GetFileName(relativePath);

            // On Android (and any URL-form streaming path) we cannot File.Read directly.
            if (fullPath.Contains("://"))
            {
                using var request = UnityWebRequest.Get(fullPath);
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError?.Invoke($"Failed to download {relativePath}: {request.error}");
                    yield break;
                }

                try
                {
                    var tempPath = Path.Combine(Application.temporaryCachePath, tempName);
                    File.WriteAllText(tempPath, request.downloadHandler.text);
                    onLoaded?.Invoke(LevelLoader.LoadWorld(tempPath));
                }
                catch (Exception exception)
                {
                    onError?.Invoke(exception.Message);
                }

                yield break;
            }

            // Desktop/editor: a missing optional world is a normal "skip", not an error throw.
            if (!File.Exists(fullPath))
            {
                onError?.Invoke($"{relativePath} not found");
                yield break;
            }

            try
            {
                onLoaded?.Invoke(LevelLoader.LoadWorld(fullPath));
            }
            catch (Exception exception)
            {
                onError?.Invoke(exception.Message);
            }
        }
    }
}
