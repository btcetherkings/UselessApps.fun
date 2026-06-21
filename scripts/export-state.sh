#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

STAMP="$(date +%Y-%m-%d-%H%M%S)"
OUT="exports/state-export-${STAMP}"

mkdir -p "$OUT"

cp -R data "$OUT/" 2>/dev/null || true
cp -R reports "$OUT/" 2>/dev/null || true
cp apps.json "$OUT/" 2>/dev/null || true
cp ROADMAP.md "$OUT/" 2>/dev/null || true
cp tools/video-generator/processed-v3.json "$OUT/" 2>/dev/null || true
cp tools/publish/review-db.json "$OUT/" 2>/dev/null || true
cp tools/actions/action-queue.json "$OUT/" 2>/dev/null || true
cp tools/jobs/job-status.json "$OUT/" 2>/dev/null || true

echo "Export created: $OUT"
