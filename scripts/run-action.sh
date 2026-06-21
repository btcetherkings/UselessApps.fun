#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ID="${1:-}"

if [ -z "$ID" ]; then
  echo "Usage: ./scripts/run-action.sh ACTION_ID"
  exit 1
fi

node tools/actions/run-action.js "$ID"
