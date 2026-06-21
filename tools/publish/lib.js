'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const PERFORMANCE_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'performance-db.json');
const REVIEW_FILE = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');

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

function loadReviewDb() {
  const db = readJson(REVIEW_FILE, {
    version: 1,
    items: {},
    audit: []
  });

  db.version = db.version || 1;
  db.items = db.items || {};
  db.audit = db.audit || [];

  return db;
}

function saveReviewDb(db) {
  writeJson(REVIEW_FILE, db);
}

function audit(db, action, videoId, note = '') {
  db.audit.push({
    at: new Date().toISOString(),
    action,
    videoId,
    note
  });
}

function importPrivateUploads() {
  const processed = readJson(PROCESSED_FILE, {});
  const perf = readJson(PERFORMANCE_FILE, { videos: {} });
  const db = loadReviewDb();

  let imported = 0;
  let updated = 0;

  for (const [key, item] of Object.entries(processed)) {
    if (!item?.uploaded || !item?.youtube?.videoId) continue;

    const videoId = item.youtube.videoId;
    const existing = db.items[videoId];
    const stats = perf.videos?.[videoId];

    const record = {
      ...(existing || {}),
      videoId,
      appKey: key,
      appName: item.name,
      file: item.file,
      status: existing?.status || 'private_uploaded',
      decision: existing?.decision || null,
      youtubeUrl: item.youtube.url,
      youtubeTitle: item.youtube.title,
      privacyStatus: item.youtube.privacyStatus || 'private',
      localVideo: item.localVideo || null,
      appUrl: item.appUrl || null,
      score: stats?.score || 0,
      views: stats?.stats?.viewCount || 0,
      likes: stats?.stats?.likeCount || 0,
      comments: stats?.stats?.commentCount || 0,
      appType: stats?.appType || item.storyPackage?.appType || null,
      storyMode: stats?.storyMode || item.storyPackage?.storyMode || null,
      hook: stats?.hook || item.storyPackage?.hook || null,
      reviewNotes: existing?.reviewNotes || [],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.items[videoId] = record;

    if (existing) updated += 1;
    else imported += 1;
  }

  if (imported || updated) {
    audit(db, 'import_private_uploads', 'all', `imported=${imported}, updated=${updated}`);
  }

  saveReviewDb(db);

  return { db, imported, updated };
}

function setDecision(videoId, status, decision, note = '') {
  const { db } = importPrivateUploads();

  const item = db.items[videoId];

  if (!item) {
    throw new Error(`Video ID not found in review DB: ${videoId}`);
  }

  item.status = status;
  item.decision = decision;
  item.updatedAt = new Date().toISOString();

  if (note) {
    item.reviewNotes = item.reviewNotes || [];
    item.reviewNotes.push({
      at: new Date().toISOString(),
      note
    });
  }

  audit(db, decision, videoId, note);
  saveReviewDb(db);

  return item;
}

module.exports = {
  ROOT_DIR,
  PROCESSED_FILE,
  PERFORMANCE_FILE,
  REVIEW_FILE,
  readJson,
  writeJson,
  loadReviewDb,
  saveReviewDb,
  audit,
  importPrivateUploads,
  setDecision
};
