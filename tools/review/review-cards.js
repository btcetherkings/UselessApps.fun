'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const REVIEW_DB = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');
const PROCESSED_DB = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function value(obj, keys, fallback = '') {
  for (const k of keys) {
    const parts = k.split('.');
    let cur = obj;
    for (const p of parts) cur = cur?.[p];
    if (cur !== undefined && cur !== null && cur !== '') return cur;
  }
  return fallback;
}

const review = readJson(REVIEW_DB, { videos: {}, items: [] });
const processed = readJson(PROCESSED_DB, {});

const reviewItems = Array.isArray(review.items)
  ? review.items
  : Object.values(review.videos || review || {});

const processedItems = Object.values(processed || {});

const byVideoId = new Map();

for (const item of processedItems) {
  const videoId = value(item, ['youtube.videoId', 'videoId']);
  if (videoId) byVideoId.set(videoId, item);
}

const cards = reviewItems.map(item => {
  const videoId = value(item, ['videoId', 'youtube.videoId', 'id']);
  const processedMatch = byVideoId.get(videoId) || {};

  const merged = {
    ...processedMatch,
    ...item
  };

  const name = value(merged, ['name', 'title'], 'Unknown');
  const url = value(merged, ['url', 'youtube.url', 'displayUrl'], '');
  const status = value(merged, ['status', 'reviewStatus', 'youtube.privacyStatus'], 'unknown');
  const publicSafe = Boolean(value(merged, ['audioValidation.publicSafe', 'publicSafe'], false));
  const audioReadiness = value(merged, ['audioValidation.readiness', 'audioReadiness'], 'unknown');
  const safetyStatus = value(merged, ['safetyCheck.status', 'safetyStatus'], 'unknown');
  const score = Number(value(merged, ['learningScore'], 0));

  let recommendedAction = 'review';
  if (status === 'rejected') recommendedAction = 'leave rejected';
  else if (!publicSafe || safetyStatus === 'block') recommendedAction = 'needs_rerender';
  else if (status === 'approved') recommendedAction = 'publish preflight';
  else recommendedAction = 'approve or reject';

  return {
    videoId,
    name,
    url,
    status,
    publicSafe,
    audioReadiness,
    safetyStatus,
    learningScore: score,
    recommendedAction,
    commands: {
      approve: `./scripts/approve-video.sh ${videoId} "Approved from review card"`,
      reject: `./scripts/reject-video.sh ${videoId} "Rejected from review card"`,
      rerender: `./scripts/needs-rerender.sh ${videoId} "Needs rerender from review card"`,
      exportPack: `./scripts/export-pack.sh ${videoId}`,
      publishUnlisted: `ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh ${videoId} unlisted`,
      publishPublic: `ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh ${videoId} public`
    }
  };
}).filter(card => card.videoId);

console.log('');
console.log('Review Cards');
console.log('============');
console.log('');

if (!cards.length) {
  console.log('No review cards found.');
  process.exit(0);
}

for (const card of cards) {
  console.log(`## ${card.name}`);
  console.log(`Video ID: ${card.videoId}`);
  console.log(`URL: ${card.url || 'none'}`);
  console.log(`Status: ${card.status}`);
  console.log(`Public safe: ${card.publicSafe}`);
  console.log(`Audio: ${card.audioReadiness}`);
  console.log(`Safety: ${card.safetyStatus}`);
  console.log(`Learning score: ${card.learningScore}`);
  console.log(`Recommended: ${card.recommendedAction}`);
  console.log('');
  console.log('Commands:');
  console.log(`  ${card.commands.approve}`);
  console.log(`  ${card.commands.reject}`);
  console.log(`  ${card.commands.rerender}`);
  console.log(`  ${card.commands.exportPack}`);
  console.log(`  ${card.commands.publishUnlisted}`);
  console.log('');
}
