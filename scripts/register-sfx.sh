#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

FILE="${1:-}"
TAG="${2:-default}"
LICENSE="${3:-}"
SOURCE="${4:-}"
SAFE="${5:-false}"
NOTE="${6:-}"

if [ -z "$FILE" ]; then
  echo "Usage: ./scripts/register-sfx.sh assets/sfx/file.wav tag license source true|false \"notes\""
  exit 1
fi

node tools/media/audio-assets.js register "$FILE" sfx "$TAG" "$LICENSE" "$SOURCE" "$SAFE" "$NOTE"
