#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/db-init.sh >/dev/null
node tools/db/sync-json-to-db.js
