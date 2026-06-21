#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/business/manage-business.js set "$@"
