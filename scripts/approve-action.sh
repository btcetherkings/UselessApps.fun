#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ID="${1:-}"
shift || true

if [ -z "$ID" ]; then
  echo "Usage: ./scripts/approve-action.sh ACTION_ID NOTE"
  exit 1
fi

node tools/actions/approve-action.js "$ID" "$@"
