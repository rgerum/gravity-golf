using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Minimal haptics scaffold, gated by the saved setting. Unity 6 removed
    /// Handheld.Vibrate, so Android talks to the Java Vibrator service directly
    /// (AndroidJavaObject lives in the core module — no extra package). iOS is a stub
    /// until a native haptics plugin is added. Only strong beats (crash, goal) buzz.
    /// Feel must be tuned on a real device.
    /// </summary>
    public static class Haptics
    {
        private const long StrongMilliseconds = 40;

#if UNITY_ANDROID && !UNITY_EDITOR
        private static AndroidJavaObject _vibrator;
        private static bool _resolved;

        private static AndroidJavaObject Vibrator
        {
            get
            {
                if (!_resolved)
                {
                    _resolved = true;
                    try
                    {
                        using var player = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
                        using var activity = player.GetStatic<AndroidJavaObject>("currentActivity");
                        _vibrator = activity.Call<AndroidJavaObject>("getSystemService", "vibrator");
                    }
                    catch (System.Exception e)
                    {
                        Debug.LogWarning($"[Haptics] Vibrator unavailable: {e.Message}");
                    }
                }

                return _vibrator;
            }
        }
#endif

        public static void Strong()
        {
            if (!SaveStore.Instance.Settings.Haptics)
            {
                return;
            }

#if UNITY_ANDROID && !UNITY_EDITOR
            try
            {
                Vibrator?.Call("vibrate", StrongMilliseconds);
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[Haptics] vibrate failed: {e.Message}");
            }
#endif
        }
    }
}
