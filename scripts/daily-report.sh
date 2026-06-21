#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

./scripts/sync-review.sh >/tmp/uselessapps-sync-review.log
node tools/dashboard/daily-report.js
