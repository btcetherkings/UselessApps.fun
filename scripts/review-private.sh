#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

node tools/publish/sync-review.js >/tmp/uselessapps-sync-review.log
node tools/publish/list-private.js
