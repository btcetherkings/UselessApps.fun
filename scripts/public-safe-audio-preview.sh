#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

AUDIO_REQUIRE_PUBLIC_SAFE=true \
USE_AUDIO_ENGINE=true \
USE_BACKGROUND_MUSIC=true \
USE_SFX=true \
SAFE_MODE=true \
TEXT_DENSITY=low \
TICKER_ENABLED=false \
FOOTER_ENABLED=false \
AUTO_DRY_RUN=true \
AUTO_MAX_PER_RUN=1 \
node tools/autopilot/useless-autopilot.js
