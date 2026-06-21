#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

LATEST="$(ls -t generated-videos/*-v3.mp4 2>/dev/null | head -n 1 || true)"

if [ -z "$LATEST" ]; then
  echo "No generated video found."
  exit 1
fi

echo "Latest video: $LATEST"

if command -v vlc >/dev/null 2>&1; then
  vlc "$LATEST"
elif command -v ffplay >/dev/null 2>&1; then
  ffplay -autoexit -vf "scale=360:-1" "$LATEST"
else
  echo "No VLC or ffplay found. Open manually:"
  echo "$LATEST"
fi
