#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

AUTO_DRY_RUN=false \
AUTO_VIDEO_PRIVACY=private \
AUTO_MAX_PER_RUN=1 \
node tools/autopilot/useless-autopilot.js
