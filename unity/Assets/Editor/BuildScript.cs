using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

// Lives in Assets/Editor with no asmdef, so it compiles into the predefined
// Assembly-CSharp-Editor and can reach UnityEditor.Android without asmdef wiring.
// Invoked headlessly by scripts/build-android.sh:
//   Unity -batchmode -quit -buildTarget Android -executeMethod BuildScript.BuildAndroid
public static class BuildScript
{
    public static void BuildAndroid()
    {
        var home = Environment.GetEnvironmentVariable("HOME");
        var sdk = Environment.GetEnvironmentVariable("ANDROID_SDK_ROOT")
                  ?? Environment.GetEnvironmentVariable("ANDROID_HOME")
                  ?? Path.Combine(home, "Android/Sdk");
        var ndk = Environment.GetEnvironmentVariable("ANDROID_NDK_ROOT");
        var jdk = Environment.GetEnvironmentVariable("JAVA_HOME");

        // Point Unity at the externally-managed SDK/NDK/JDK (this editor was installed
        // from the raw tarball). Set each independently so one bad path doesn't skip
        // the others.
        SetTool(() => UnityEditor.Android.AndroidExternalToolsSettings.sdkRootPath = sdk, "SDK", sdk);
        if (!string.IsNullOrEmpty(ndk))
        {
            SetTool(() => UnityEditor.Android.AndroidExternalToolsSettings.ndkRootPath = ndk, "NDK", ndk);
        }

        if (!string.IsNullOrEmpty(jdk))
        {
            SetTool(() => UnityEditor.Android.AndroidExternalToolsSettings.jdkRootPath = jdk, "JDK", jdk);
        }

        PlayerSettings.productName = "Gravity Golf";
        PlayerSettings.companyName = "rgerum";
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "com.rgerum.gravitygolf");
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel23;
        PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;
        // Development build is auto-signed with Unity's debug keystore — no keystore setup.
        PlayerSettings.Android.useCustomKeystore = false;

        var outPath = Path.Combine(home, "WebstormProjects/gravity-golf/unity/Build/GravityGolf.apk");
        Directory.CreateDirectory(Path.GetDirectoryName(outPath));

        var options = new BuildPlayerOptions
        {
            scenes = new[] { "Assets/Scenes/Main.unity" },
            locationPathName = outPath,
            target = BuildTarget.Android,
            targetGroup = BuildTargetGroup.Android,
            options = BuildOptions.Development | BuildOptions.AllowDebugging,
        };

        var report = BuildPipeline.BuildPlayer(options);
        var summary = report.summary;
        if (summary.result != BuildResult.Succeeded)
        {
            Debug.LogError($"[Build] FAILED result={summary.result} errors={summary.totalErrors}");
            EditorApplication.Exit(1);
            return;
        }

        Debug.Log($"[Build] OK -> {summary.outputPath} ({summary.totalSize / (1024 * 1024)} MB)");
        EditorApplication.Exit(0);
    }

    private static void SetTool(Action set, string label, string path)
    {
        try
        {
            set();
            Debug.Log($"[Build] Android {label} = {path}");
        }
        catch (Exception e)
        {
            Debug.LogWarning($"[Build] Could not set Android {label} ({path}): {e.Message}");
        }
    }
}
