#!/usr/bin/env bash
set -euo pipefail

pkill -f "tools/dashboard/web-dashboard.js" || true
echo "Dashboard stopped if it was running."
