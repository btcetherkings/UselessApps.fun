#!/usr/bin/env bash
set -euo pipefail

PORT="${DASHBOARD_PORT:-8787}"
URL="http://127.0.0.1:${PORT}/api/review-cards"

echo "Testing: $URL"
curl -s "$URL" | node -e "
let data='';
process.stdin.on('data', d => data += d);
process.stdin.on('end', () => {
  const j = JSON.parse(data);
  console.log('total:', j.total);
  console.log('uploaded:', j.uploaded);
  console.log('localOnly:', j.localOnly);
  console.log('needsReview:', j.needsReview);
  console.log('first:', j.cards && j.cards[0] ? j.cards[0].title : 'none');
});
"
