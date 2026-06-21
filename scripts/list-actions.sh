#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
node tools/actions/list-actions.js "${1:-}"
