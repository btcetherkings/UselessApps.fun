#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

VIDEO_ID="${1:-}"
TARGET="${2:-unlisted}"

if [ -z "$VIDEO_ID" ]; then
  echo "Usage: ./scripts/publish-preflight.sh VIDEO_ID unlisted|public"
  exit 1
fi

./scripts/sync-review.sh >/tmp/uselessapps-sync-review.log
node tools/publish/preflight.js "$VIDEO_ID" "$TARGET"
