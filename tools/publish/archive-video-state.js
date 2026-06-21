'use strict';

const fs = require('fs');
const path = require('path');
const { auditLog } = require('../audit/audit-log');

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

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

const videoId = process.argv[2];

if (!videoId) {
  console.error('Usage: node tools/publish/archive-video-state.js VIDEO_ID');
  process.exit(1);
}

const now = new Date().toISOString();

const review = readJson(REVIEW_DB, { version: 1, updatedAt: null, items: [], videos: {} });
let changed = false;

if (Array.isArray(review.items)) {
  for (const item of review.items) {
    if (item.videoId === videoId || item.id === videoId || item.youtube?.videoId === videoId) {
      item.status = 'archived_local';
      item.archivedAt = now;
      changed = true;
    }
  }
}

if (review.videos && review.videos[videoId]) {
  review.videos[videoId].status = 'archived_local';
  review.videos[videoId].archivedAt = now;
  changed = true;
}

review.updatedAt = now;
writeJson(REVIEW_DB, review);

const processed = readJson(PROCESSED_DB, {});
for (const [key, item] of Object.entries(processed)) {
  if (item.videoId === videoId || item.youtube?.videoId === videoId || key === videoId) {
    item.status = 'archived_local';
    item.archivedAt = now;
    changed = true;
  }
}
writeJson(PROCESSED_DB, processed);

auditLog({
  eventType: 'video_state_archived',
  source: 'archive-video-state',
  entityType: 'video',
  entityId: videoId,
  message: `Archived local state for ${videoId}`,
  payload: { changed }
});

console.log(`Archived local video state: ${videoId}`);
