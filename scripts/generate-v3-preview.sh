#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Generating V3 local preview..."

DRY_RUN=true \
FORCE=true \
MAX_PER_RUN="${MAX_PER_RUN:-1}" \
VIDEO_PRIVACY=private \
CHAOS_MODE=true \
KEEP_TMP=false \
VERBOSE=false \
node tools/video-generator/generate-v3.js

echo "Preview generated in generated-videos/"
ls -lh generated-videos/*-v3.mp4 || true
