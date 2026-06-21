#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Starting private V3 batch upload..."
echo "All uploads will be PRIVATE."

DRY_RUN=false \
FORCE=true \
MAX_PER_RUN="${MAX_PER_RUN:-5}" \
VIDEO_PRIVACY=private \
CHAOS_MODE=true \
KEEP_TMP=false \
VERBOSE=false \
node tools/video-generator/generate-v3.js

echo "Done. Check YouTube Studio."
