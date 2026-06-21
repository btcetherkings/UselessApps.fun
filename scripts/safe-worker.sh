#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p logs/worker

node tools/worker/safe-worker.js

./scripts/dashboard.sh >/tmp/uselessapps-worker-dashboard-refresh.log || true
