'use strict';

const readline = require('readline');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { auditLog } = require('../audit/audit-log');

const ROOT_DIR = path.join(__dirname, '..', '..');
const REVIEW_DB = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');
const PROCESSED_DB = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');

const videoId = process.argv[2];

if (!videoId) {
  console.error('Usage: node tools/publish/delete-youtube.js VIDEO_ID');
  process.exit(1);
}

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

async function deleteVideo() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing YouTube OAuth env vars.');
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  const youtube = google.youtube({ version: 'v3', auth });
  await youtube.videos.delete({ id: videoId });
}

function markDeleted() {
  const now = new Date().toISOString();

  const review = readJson(REVIEW_DB, { version: 1, updatedAt: null, items: [], videos: {} });

  if (Array.isArray(review.items)) {
    for (const item of review.items) {
      if (item.videoId === videoId || item.id === videoId || item.youtube?.videoId === videoId) {
        item.status = 'deleted_youtube';
        item.deletedAt = now;
      }
    }
  }

  if (review.videos && review.videos[videoId]) {
    review.videos[videoId].status = 'deleted_youtube';
    review.videos[videoId].deletedAt = now;
  }

  review.updatedAt = now;
  writeJson(REVIEW_DB, review);

  const processed = readJson(PROCESSED_DB, {});
  for (const [key, item] of Object.entries(processed)) {
    if (item.videoId === videoId || item.youtube?.videoId === videoId || key === videoId) {
      item.status = 'deleted_youtube';
      item.deletedAt = now;
    }
  }
  writeJson(PROCESSED_DB, processed);
}

const expected = `DELETE ${videoId} FROM YOUTUBE`;

console.log('');
console.log('YouTube Delete Confirmation');
console.log('===========================');
console.log('');
console.log(`Video ID: ${videoId}`);
console.log('');
console.log('This permanently deletes the YouTube video.');
console.log('Type this exact phrase to continue:');
console.log('');
console.log(expected);
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Confirm: ', async answer => {
  rl.close();

  if (answer.trim() !== expected) {
    console.error('Confirmation mismatch. Delete cancelled.');
    process.exit(1);
  }

  try {
    await deleteVideo();
    markDeleted();

    auditLog({
      eventType: 'youtube_video_deleted',
      source: 'delete-youtube',
      entityType: 'video',
      entityId: videoId,
      message: `Deleted YouTube video ${videoId}`,
      payload: { videoId }
    });

    console.log(`Deleted YouTube video: ${videoId}`);
  } catch (err) {
    auditLog({
      eventType: 'youtube_video_delete_failed',
      source: 'delete-youtube',
      entityType: 'video',
      entityId: videoId,
      message: err.message,
      payload: { videoId }
    });

    console.error(`Delete failed: ${err.message}`);
    process.exit(1);
  }
});
