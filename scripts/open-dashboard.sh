#!/usr/bin/env bash
set -euo pipefail

URL="${DASHBOARD_URL:-http://127.0.0.1:8787}"

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v sensible-browser >/dev/null 2>&1; then
  sensible-browser "$URL"
elif command -v python3 >/dev/null 2>&1; then
  python3 -m webbrowser "$URL"
else
  echo "Open manually: $URL"
fi
