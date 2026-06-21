#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

TYPE="${1:-}"

if [ -z "$TYPE" ]; then
  echo "Usage:"
  echo "  ./scripts/queue-action.sh ACTION_TYPE"
  echo "  ./scripts/queue-action.sh ACTION_TYPE '{\"key\":\"value\"}'"
  exit 1
fi

shift || true

if [ "$#" -eq 0 ]; then
  node tools/actions/queue-action.js "$TYPE" '{}'
else
  node tools/actions/queue-action.js "$TYPE" "$@"
fi
