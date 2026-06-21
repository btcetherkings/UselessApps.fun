#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${DASHBOARD_PORT:-8787}"
URL="http://127.0.0.1:${PORT}"

./scripts/daily-report-v2.sh >/tmp/uselessapps-dashboard-refresh.log

if ss -ltn 2>/dev/null | grep -q ":${PORT} "; then
  echo ""
  echo "Dashboard already running:"
  echo "$URL"
  echo ""
  echo "Open it with:"
  echo "./scripts/open-dashboard.sh"
  echo ""
  exit 0
fi

echo ""
echo "Starting browser dashboard..."
echo "Open: $URL"
echo ""

DASHBOARD_PORT="$PORT" node tools/dashboard/web-dashboard.js
