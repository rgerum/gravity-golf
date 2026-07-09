#!/usr/bin/env bash
# Headless Android APK build. Requires: Unity editor with AndroidPlayer module,
# an Android SDK, an NDK, and a JDK. The Unity editor must be CLOSED.
set -euo pipefail
cd "$(dirname "$0")/.."

UNITY="${UNITY_EDITOR:-$HOME/Unity/Editor/6000.0.79f1/Editor/Unity}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
export ANDROID_NDK_ROOT="${ANDROID_NDK_ROOT:-$(ls -d "$ANDROID_SDK_ROOT"/ndk/* 2>/dev/null | sort -V | tail -1)}"
_bundled_jdk="$(dirname "$UNITY")/Data/PlaybackEngines/AndroidPlayer/OpenJDK"
export JAVA_HOME="${JAVA_HOME:-$([ -x "$_bundled_jdk/bin/java" ] && echo "$_bundled_jdk" || echo "$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")")}"
LOG="${BUILD_LOG:-/tmp/unity-android-build.log}"

if pgrep -x Unity >/dev/null 2>&1; then
    echo "ERROR: a Unity editor is running. Close it first." >&2
    exit 1
fi

echo "SDK=$ANDROID_SDK_ROOT"
echo "NDK=$ANDROID_NDK_ROOT"
echo "JDK=$JAVA_HOME"
echo "==> building Android APK (log: $LOG)"

"$UNITY" -batchmode -quit -nographics \
    -projectPath "$(pwd)/unity" \
    -buildTarget Android \
    -executeMethod BuildScript.BuildAndroid \
    -logFile "$LOG"

APK="$(pwd)/unity/Build/GravityGolf.apk"
[ -f "$APK" ] || { echo "ERROR: APK not produced — check $LOG" >&2; exit 1; }
ls -la "$APK"
echo "==> APK ready: $APK"
echo "    install with: adb install -r \"$APK\""
