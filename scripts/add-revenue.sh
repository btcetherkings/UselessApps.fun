#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/db-init.sh >/dev/null
node tools/business/add-finance-entry.js revenue "$@"
