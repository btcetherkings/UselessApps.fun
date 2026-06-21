#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

STAMP="$(date +%Y-%m-%d-%H%M%S)"
OUT="backups/state-backup-${STAMP}.tar.gz"

mkdir -p backups

tar -czf "$OUT" \
  data \
  apps.json \
  tools/video-generator/processed-v3.json \
  tools/publish/review-db.json \
  tools/actions/action-queue.json \
  tools/jobs/job-status.json \
  tools/business/business-metrics.json \
  reports \
  logs 2>/dev/null || true

echo "Backup created: $OUT"
