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

function boolValue(value) {
  if (value === true || value === 'true' || value === 1) return true;
  return false;
}

function normaliseStatus(record) {
  return get(record, [
    'reviewStatus',
    'status',
    'youtube.privacyStatus',
    'youtube.status',
    'publishStatus'
  ], record.youtube?.videoId ? 'private_uploaded' : 'local_preview');
}

function buildCard(record, source = 'unknown') {
  const videoId = get(record, [
    'videoId',
    'youtube.videoId',
    'id'
  ], '');

  const localKey = get(record, [
    'key',
    'file',
    'videoPath',
    'outputPath',
    'name'
  ], '');

  const id = videoId || localKey;

  if (!id) return null;

  const title = get(record, ['name', 'title'], 'Unknown');
  const url = get(record, ['url', 'youtube.url', 'displayUrl'], videoId ? `https://youtu.be/${videoId}` : '');
  const status = normaliseStatus(record);

  const publicSafe = boolValue(get(record, [
    'audioValidation.publicSafe',
    'publicSafe'
  ], false));

  const audioReadiness = get(record, [
    'audioValidation.readiness',
    'audioReadiness',
    'audioMix.mode',
    'audioMode'
  ], 'unknown');

  const safetyStatus = get(record, [
    'safetyCheck.status',
    'safetyStatus'
  ], 'unknown');

  const learningScore = Number(get(record, ['learningScore'], 0));

  const hasUpload = Boolean(videoId);

  let recommendedAction = 'review';

  if (record.error || status === 'failed') recommendedAction = 'needs_rerender';
  else if (safetyStatus === 'block') recommendedAction = 'needs_rerender';
  else if (hasUpload && !publicSafe) recommendedAction = 'needs_rerender';
  else if (!hasUpload) recommendedAction = 'upload private first';
  else if (status === 'approved') recommendedAction = 'publish preflight';
  else if (status === 'published_unlisted' || status === 'published_public') recommendedAction = 'monitor';
  else if (status === 'rejected') recommendedAction = 'leave rejected';
  else recommendedAction = 'approve or reject';

  const safeTitle = String(title).replace(/"/g, '\\"');

  return {
    id,
    videoId,
    localKey,
    hasUpload,
    title,
    url,
    status,
    publicSafe,
    audioReadiness,
    safetyStatus,
    learningScore,
    recommendedAction,
    source,
    commands: {
      approve: videoId ? `./scripts/approve-video.sh ${videoId} "Approved from review card"` : '',
      reject: videoId ? `./scripts/reject-video.sh ${videoId} "Rejected from review card"` : '',
      rerender: videoId ? `./scripts/needs-rerender.sh ${videoId} "Needs rerender from review card"` : '',
      exportPack: videoId ? `./scripts/export-pack.sh ${videoId}` : '',
      calendar: `./scripts/add-calendar-item.sh "${safeTitle}" youtube "" "Ready for review/export"`,
      publishUnlisted: videoId ? `ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh ${videoId} unlisted` : '',
      publishPublic: videoId ? `ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh ${videoId} public` : '',
      uploadPrivate: !videoId ? './scripts/autopilot-upload-once-private.sh' : ''
    }
  };
}

function getReviewCards() {
  const review = readJson(REVIEW_DB, { items: [], videos: {} });
  const processed = readJson(PROCESSED_DB, {});

  const cards = [];
  const seen = new Set();

  const reviewItems = Array.isArray(review.items)
    ? review.items
    : Object.values(review.videos || review || {});

  for (const item of reviewItems) {
    const card = buildCard(item, 'review-db');
    if (!card) continue;
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    cards.push(card);
  }

  for (const [key, item] of Object.entries(processed || {})) {
    const card = buildCard({ ...item, key }, 'processed-v3');
    if (!card) continue;
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    cards.push(card);
  }

  cards.sort((a, b) => {
    const aPriority = a.recommendedAction === 'approve or reject' ? 0 : 1;
    const bPriority = b.recommendedAction === 'approve or reject' ? 0 : 1;
    return aPriority - bPriority;
  });

  return {
    total: cards.length,
    needsReview: cards.filter(c => c.recommendedAction === 'approve or reject').length,
    approved: cards.filter(c => c.status === 'approved').length,
    rejected: cards.filter(c => c.status === 'rejected').length,
    unsafe: cards.filter(c => !c.publicSafe || c.safetyStatus === 'block').length,
    uploaded: cards.filter(c => c.hasUpload).length,
    localOnly: cards.filter(c => !c.hasUpload).length,
    cards
  };
}

module.exports = {
  getReviewCards
};
