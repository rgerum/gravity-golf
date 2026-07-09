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
        SetAndroidTool("sdkRootPath", "SDK", sdk);
        if (!string.IsNullOrEmpty(ndk))
        {
            SetAndroidTool("ndkRootPath", "NDK", ndk);
        }

        if (!string.IsNullOrEmpty(jdk))
        {
            SetAndroidTool("jdkRootPath", "JDK", jdk);
        }

        PlayerSettings.productName = "Gravity Golf";
        PlayerSettings.companyName = "rgerum";
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "com.rgerum.gravitygolf");
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel26;
        PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;
        // Development build is auto-signed with Unity's debug keystore — no keystore setup.
        PlayerSettings.Android.useCustomKeystore = false;

        var outPath = Path.Combine(Directory.GetCurrentDirectory(), "Build/GravityGolf.apk");
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

    // iOS builds MUST run on macOS (Unity with iOS Build Support). This emits an Xcode
    // project to unity/Build/iOS; open it in Xcode, set the signing team, and Run.
    //   Unity -batchmode -quit -buildTarget iOS -executeMethod BuildScript.BuildIOS
    public static void BuildIOS()
    {
        PlayerSettings.productName = "Gravity Golf";
        PlayerSettings.companyName = "rgerum";
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS, "com.rgerum.gravitygolf");
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.iOS, ScriptingImplementation.IL2CPP);
        PlayerSettings.iOS.appleDeveloperTeamID = "WLCA6C349S";
        PlayerSettings.iOS.appleEnableAutomaticSigning = true;

        var outPath = Path.Combine(Directory.GetCurrentDirectory(), "Build/iOS");
        Directory.CreateDirectory(outPath);

        var options = new BuildPlayerOptions
        {
            scenes = new[] { "Assets/Scenes/Main.unity" },
            locationPathName = outPath,
            target = BuildTarget.iOS,
            targetGroup = BuildTargetGroup.iOS,
            options = BuildOptions.None,
        };

        var report = BuildPipeline.BuildPlayer(options);
        var summary = report.summary;
        if (summary.result != BuildResult.Succeeded)
        {
            Debug.LogError($"[Build] iOS FAILED result={summary.result} errors={summary.totalErrors}");
            EditorApplication.Exit(1);
            return;
        }

        Debug.Log($"[Build] iOS Xcode project -> {summary.outputPath}");
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

    private static void SetAndroidTool(string propertyName, string label, string path)
    {
        var type = Type.GetType("UnityEditor.Android.AndroidExternalToolsSettings, UnityEditor.Android.Extensions");
        var property = type?.GetProperty(propertyName);
        if (property == null)
        {
            Debug.LogWarning($"[Build] Android {label} path not set; Android editor support is not installed.");
            return;
        }

        SetTool(() => property.SetValue(null, path), label, path);
    }
}
