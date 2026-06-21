#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

LATEST="$(ls -t generated-videos/*-v3.mp4 2>/dev/null | head -n 1 || true)"

if [ -z "$LATEST" ]; then
  echo "No generated video found."
  exit 1
fi

echo "Latest video: $LATEST"

if command -v ffplay >/dev/null 2>&1; then
  ffplay -autoexit -loglevel warning -vf "scale=360:-1" "$LATEST"
elif command -v cvlc >/dev/null 2>&1; then
  cvlc --no-video-title-show --avcodec-hw=none "$LATEST"
elif command -v vlc >/dev/null 2>&1; then
  vlc --avcodec-hw=none --no-video-title-show "$LATEST"
else
  echo "No ffplay/VLC found. Open manually:"
  echo "$LATEST"
fi
