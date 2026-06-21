#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CRON_LINE="30 2 * * * cd \"$ROOT\" && ./scripts/nightly-run.sh >> logs/nightly/cron.log 2>&1"

TMP="$(mktemp)"

crontab -l 2>/dev/null | grep -v "useless-apps-fun.*nightly-run.sh" > "$TMP" || true
echo "$CRON_LINE" >> "$TMP"

crontab "$TMP"
rm -f "$TMP"

echo "Installed nightly cron:"
echo "$CRON_LINE"
