#!/usr/bin/env bash
# One-command verification of the Unity port. Safe to run while the Unity
# editor is open (never touches the editor's project lock).
set -euo pipefail
cd "$(dirname "$0")/.."

export DOTNET_ROOT="${DOTNET_ROOT:-$HOME/.dotnet}"
export PATH="$DOTNET_ROOT:$PATH"

echo "==> 1/4 export levels (deterministic)"
node scripts/export-unity-levels.js

echo "==> 2/4 export parity fixtures"
node scripts/export-unity-fixtures.js

echo "==> 3/4 Unity C#9 compile gate (Core)"
dotnet build unity/tests/UnityCompatCheck -c Release -v q

echo "==> 4/4 physics parity vs JS engine"
dotnet run --project unity/tests/ParityRunner -c Release

echo "ALL GATES GREEN"
