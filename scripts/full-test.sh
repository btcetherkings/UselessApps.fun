#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
node tools/testing/full-system-test.js
