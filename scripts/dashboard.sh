#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

./scripts/daily-report-v2.sh

echo ""
echo "Browser dashboard:"
echo "  ./scripts/dashboard-web.sh"
echo "Then open:"
echo "  ./scripts/open-dashboard.sh"
echo "or:"
echo "  http://127.0.0.1:8787"
