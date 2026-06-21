#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p logs/nightly

STAMP="$(date +%Y-%m-%d-%H%M%S)"
LOG="logs/nightly/nightly-${STAMP}.log"

run_step() {
  local name="$1"
  shift

  echo ""
  echo "=== ${name} ==="
  echo "Command: $*"

  if "$@"; then
    echo "PASS: ${name}"
  else
    echo "WARN/FAIL: ${name}"
    return 1
  fi
}

{
  echo "UselessApps.fun Nightly Run"
  echo "==========================="
  echo "Started: $(date -Iseconds)"
  echo ""

  run_step "Sync review" ./scripts/sync-review.sh || true
  run_step "Pull basic YouTube stats" ./scripts/youtube-stats-pull.sh || true
  run_step "Pull advanced analytics" ./scripts/youtube-advanced-pull.sh || true
  run_step "Run learning v2" ./scripts/learning-v2.sh || true
  run_step "Run safe worker" ./scripts/safe-worker.sh || true
  run_step "Safety report" ./scripts/safety-report.sh || true
  run_step "Dashboard report" ./scripts/dashboard.sh || true

  echo ""
  echo "=== Full system test ==="
  ./scripts/full-test.sh

  echo ""
  echo "Finished: $(date -Iseconds)"
} 2>&1 | tee "$LOG"
