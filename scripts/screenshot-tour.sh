#!/usr/bin/env bash
# Runs the game headlessly under Xvfb and captures per-level + mid-flight
# screenshots to unity/Screenshots/. Requires: xvfb (sudo apt install xvfb),
# and the Unity editor CLOSED (the project can only be open in one editor).
set -euo pipefail
cd "$(dirname "$0")/.."

UNITY="${UNITY_EDITOR:-$HOME/Unity/Editor/6000.0.79f1/Editor/Unity}"
OUT_DIR="$(pwd)/unity/Screenshots"
LOG="${TOUR_LOG:-/tmp/unity-tour.log}"

if [ -f unity/Temp/UnityLockfile ] && pgrep -x Unity >/dev/null 2>&1; then
    echo "ERROR: the project is open in another Unity editor. Close it first." >&2
    exit 1
fi

command -v xvfb-run >/dev/null || { echo "ERROR: xvfb-run not found (sudo apt install xvfb)" >&2; exit 1; }

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "==> running screenshot tour (log: $LOG)"
LIBGL_ALWAYS_SOFTWARE="${LIBGL_ALWAYS_SOFTWARE:-1}" timeout "${TOUR_TIMEOUT:-540}" xvfb-run -a -s "-screen 0 2000x1200x24" \
    "$UNITY" -projectPath "$(pwd)/unity" \
    -executeMethod GravityGolf.EditorTools.TourLauncher.Run \
    -gg-tour -gg-tour-out "$OUT_DIR" \
    -logFile "$LOG"

COUNT=$(ls "$OUT_DIR"/*.png 2>/dev/null | wc -l)
echo "==> captured $COUNT screenshots in $OUT_DIR"
[ "$COUNT" -gt 0 ] || { echo "ERROR: no screenshots produced — check $LOG" >&2; exit 1; }
