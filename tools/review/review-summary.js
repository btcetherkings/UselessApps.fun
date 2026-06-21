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

function get(obj, keys, fallback = '') {
  for (const key of keys) {
    const parts = key.split('.');
    let cur = obj;
    for (const part of parts) cur = cur?.[part];
    if (cur !== undefined && cur !== null && cur !== '') return cur;
  }
  return fallback;
}

function getReviewCards() {
  const review = readJson(REVIEW_DB, { items: [], videos: {} });
  const processed = readJson(PROCESSED_DB, {});

  const reviewItems = Array.isArray(review.items)
    ? review.items
    : Object.values(review.videos || review || {});

  const processedItems = Object.values(processed || {});
  const byVideoId = new Map();

  for (const item of processedItems) {
    const videoId = get(item, ['youtube.videoId', 'videoId']);
    if (videoId) byVideoId.set(videoId, item);
  }

  const cards = reviewItems.map(item => {
    const videoId = get(item, ['videoId', 'youtube.videoId', 'id']);
    const processedMatch = byVideoId.get(videoId) || {};
    const merged = { ...processedMatch, ...item };

    const title = get(merged, ['name', 'title'], 'Unknown');
    const url = get(merged, ['url', 'youtube.url', 'displayUrl'], videoId ? `https://youtu.be/${videoId}` : '');
    const status = get(merged, ['status', 'reviewStatus', 'youtube.privacyStatus'], 'unknown');
    const publicSafe = Boolean(get(merged, ['audioValidation.publicSafe', 'publicSafe'], false));
    const audioReadiness = get(merged, ['audioValidation.readiness', 'audioReadiness'], 'unknown');
    const safetyStatus = get(merged, ['safetyCheck.status', 'safetyStatus'], 'unknown');
    const learningScore = Number(get(merged, ['learningScore'], 0));

    let recommendedAction = 'review';
    if (status === 'rejected') recommendedAction = 'leave rejected';
    else if (!publicSafe || safetyStatus === 'block') recommendedAction = 'needs_rerender';
    else if (status === 'approved') recommendedAction = 'publish preflight';
    else recommendedAction = 'approve or reject';

    return {
      videoId,
      title,
      url,
      status,
      publicSafe,
      audioReadiness,
      safetyStatus,
      learningScore,
      recommendedAction,
      commands: {
        approve: `./scripts/approve-video.sh ${videoId} "Approved from review card"`,
        reject: `./scripts/reject-video.sh ${videoId} "Rejected from review card"`,
        rerender: `./scripts/needs-rerender.sh ${videoId} "Needs rerender from review card"`,
        exportPack: `./scripts/export-pack.sh ${videoId}`,
        calendar: `./scripts/add-calendar-item.sh "${title.replace(/"/g, '\\"')}" youtube "" "Ready for review/export"`,
        publishUnlisted: `ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh ${videoId} unlisted`,
        publishPublic: `ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh ${videoId} public`
      }
    };
  }).filter(card => card.videoId);

  return {
    total: cards.length,
    needsReview: cards.filter(c => !['approved', 'rejected', 'published_public', 'published_unlisted'].includes(c.status)).length,
    approved: cards.filter(c => c.status === 'approved').length,
    rejected: cards.filter(c => c.status === 'rejected').length,
    unsafe: cards.filter(c => !c.publicSafe || c.safetyStatus === 'block').length,
    cards
  };
}

module.exports = {
  getReviewCards
};
