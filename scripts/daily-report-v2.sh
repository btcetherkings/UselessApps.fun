#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

./scripts/sync-review.sh >/tmp/uselessapps-sync-review.log

if [ -x ./scripts/learning-v2.sh ]; then
  ./scripts/learning-v2.sh >/tmp/uselessapps-learning-v2.log || true
fi

node tools/dashboard/report-v2.js
