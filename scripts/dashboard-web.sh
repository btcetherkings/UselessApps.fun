#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

./scripts/daily-report-v2.sh >/tmp/uselessapps-dashboard-refresh.log

echo ""
echo "Starting browser dashboard..."
echo "Open: http://127.0.0.1:8787"
echo ""

node tools/dashboard/web-dashboard.js
