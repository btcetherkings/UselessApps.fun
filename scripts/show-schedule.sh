#!/usr/bin/env bash
set -euo pipefail

echo "Current cron entries for useless-apps-fun:"
crontab -l 2>/dev/null | grep "useless-apps-fun" || echo "No useless-apps-fun cron entries found."
