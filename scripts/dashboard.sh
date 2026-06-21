#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
./scripts/daily-report-v2.sh
