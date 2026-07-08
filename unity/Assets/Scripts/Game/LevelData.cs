using System;
using System.Collections;
using System.IO;
using GravityGolf.Core;
using UnityEngine;
using UnityEngine.Networking;

namespace GravityGolf.Game
{
    /// <summary>
    /// Loads the exported world JSON from StreamingAssets with the standard dual path:
    /// a direct File read on desktop/editor, and a UnityWebRequest (then a temp-file
    /// hand-off to LevelLoader) on Android where StreamingAssets lives inside the APK.
    /// </summary>
    public static class LevelData
    {
        public const string RelativePath = "levels/world-1.json";

        public static IEnumerator Load(Action<WorldDefinition> onLoaded, Action<string> onError)
        {
            var fullPath = Path.Combine(Application.streamingAssetsPath, RelativePath);

            // On Android (and any URL-form streaming path) we cannot File.Read directly.
            if (fullPath.Contains("://"))
            {
                using var request = UnityWebRequest.Get(fullPath);
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError?.Invoke($"Failed to download level data: {request.error}");
                    yield break;
                }

                WorldDefinition world = null;
                string error = null;
                try
                {
                    var tempPath = Path.Combine(Application.temporaryCachePath, "world-1.json");
                    File.WriteAllText(tempPath, request.downloadHandler.text);
                    world = LevelLoader.LoadWorld(tempPath);
                }
                catch (Exception exception)
                {
                    error = exception.Message;
                }

                if (error != null)
                {
                    onError?.Invoke(error);
                }
                else
                {
                    onLoaded?.Invoke(world);
                }

                yield break;
            }

            {
                WorldDefinition world = null;
                string error = null;
                try
                {
                    world = LevelLoader.LoadWorld(fullPath);
                }
                catch (Exception exception)
                {
                    error = exception.Message;
                }

                if (error != null)
                {
                    onError?.Invoke(error);
                }
                else
                {
                    onLoaded?.Invoke(world);
                }
            }
        }
    }
}
