#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

USE_STORY_ENGINE=true \
USE_METADATA_ENGINE=true \
USE_QUALITY_ENGINE=true \
SAFE_MODE=true \
TEXT_DENSITY=low \
TICKER_ENABLED=false \
FOOTER_ENABLED=false \
AUTO_DRY_RUN=false \
AUTO_VIDEO_PRIVACY=private \
AUTO_MAX_PER_RUN=1 \
node tools/autopilot/useless-autopilot.js
